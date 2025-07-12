import os
import uuid
from fastapi.testclient import TestClient
from app.main import app, Base, engine

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
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


def register():
    email = f"{uuid.uuid4()}@example.com"
    data = {"email": email, **USER_DATA}
    resp = client.post("/auth/register", json=data)
    token = resp.json()["access_token"]
    return email, token


def test_profile_unauthorized():
    assert client.get("/profile").status_code == 401
    assert client.put("/profile", json={}).status_code == 401
    assert client.get("/dependents").status_code == 401
    assert client.post("/dependents", json={"dependents": 1}).status_code == 401
    assert client.delete("/dependents").status_code == 401


def test_profile_get_and_update():
    email, token = register()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["risk_score"] is not None
    assert 1 <= resp.json()["risk_level"] <= 5

    update = {
        "dob": USER_DATA["dob"],
        "kra_pin": USER_DATA["kra_pin"],
        "annual_income": 20000,
        "dependents": 2,
        "goals": {"type": "growth"},
    }
    resp = client.put("/profile", json=update, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["annual_income"] == 20000


def test_dependents_crud():
    _, token = register()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/dependents", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["dependents"] == USER_DATA["dependents"]

    resp = client.post("/dependents", json={"dependents": 3}, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["dependents"] == 3

    resp = client.get("/dependents", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["dependents"] == 3

    resp = client.delete("/dependents", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["dependents"] == 0


def test_profile_risk_level_field():
    _, token = register()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 200
    assert 1 <= resp.json()["risk_level"] <= 5
