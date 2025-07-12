import os
import uuid
from datetime import date
from fastapi.testclient import TestClient
from app.main import app, Base, engine
from compute.risk_engine import compute_risk_score

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)

USER_DATA = {
    "password": "pass1234",
    "dob": "1990-01-01",
    "kra_pin": "P123",
    "annual_income": 10000,
    "dependents": 1,
    "goals": {"type": "wealth"},
    "questionnaire": {"0": 4},
}


def register_user():
    email = f"{uuid.uuid4()}@example.com"
    data = {"email": email, **USER_DATA}
    resp = client.post("/auth/register", json=data)
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    return token


def test_profile_requires_authentication():
    assert client.get("/profile").status_code == 401
    assert client.request("PUT", "/profile", json={}).status_code == 401
    assert client.get("/dependents").status_code == 401
    assert client.post("/dependents", json={"dependents": 1}).status_code == 401
    assert client.request("DELETE", "/dependents").status_code == 401


def test_profile_update_recomputes_risk_score():
    token = register_user()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 200
    original = resp.json()["risk_score"]

    update = {
        "dob": USER_DATA["dob"],
        "kra_pin": USER_DATA["kra_pin"],
        "annual_income": 20000,
        "dependents": 2,
        "goals": {"type": "growth"},
    }
    resp = client.request("PUT", "/profile", json=update, headers=headers)
    assert resp.status_code == 200
    updated = resp.json()
    assert updated["annual_income"] == 20000

    age = (date.today() - date.fromisoformat(update["dob"])).days // 365
    expected_score = compute_risk_score(
        age=age,
        income=update["annual_income"],
        dependents=update["dependents"],
        goals=update["goals"],
        questionnaire={},
    )
    assert updated["risk_score"] == expected_score
    assert updated["risk_score"] != original

