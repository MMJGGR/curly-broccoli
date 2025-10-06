import os
import uuid

os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from fastapi.testclient import TestClient
from app.main import app, Base, engine


# Initialize fresh in-memory DB for this test module
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)


def _register_and_login():
    email = f"{uuid.uuid4()}@example.com"
    payload = {
        "email": email,
        "password": "strongpassword",
        "dob": "1990-01-01",
        "kra_pin": str(uuid.uuid4()),
        "annual_income": 50000,
        "dependents": 1,
        "goals": {"type": "growth", "targetAmount": 100000, "timeHorizon": 10},
        "questionnaire": [3, 3, 3, 3, 3, 3, 3, 3],
        "role": "user",
    }
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 201
    login = client.post(
        "/auth/login", data={"username": email, "password": payload["password"]}
    )
    assert login.status_code == 200
    token = login.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_metrics_ingest_and_milestones_flow():
    headers = _register_and_login()

    # Metrics ingest should accept and not fail the user flow
    m = client.post(
        "/api/v1/metrics/ingest",
        headers={**headers, "Content-Type": "application/json"},
        json={"name": "view-plan", "duration": 123.45},
    )
    assert m.status_code in (202, 200)
    assert m.json().get("status") == "accepted"

    # Milestones: list should start empty
    res_list = client.get("/api/v1/milestones/", headers=headers)
    assert res_list.status_code == 200
    assert isinstance(res_list.json().get("milestones"), list)

    # Create milestone
    ms = {"title": "Underfunded goal: Emergency Fund", "age": 33}
    res_create = client.post(
        "/api/v1/milestones/",
        headers={**headers, "Content-Type": "application/json"},
        json=ms,
    )
    assert res_create.status_code == 201
    created = res_create.json().get("milestone")
    assert created and created.get("title") == ms["title"]

    # List again should include item
    res_list2 = client.get("/api/v1/milestones/", headers=headers)
    assert res_list2.status_code == 200
    items = res_list2.json().get("milestones")
    assert any(i.get("id") == created.get("id") for i in items)

    # Delete milestone
    res_del = client.delete(f"/api/v1/milestones/{created['id']}", headers=headers)
    assert res_del.status_code in (204, 200)

