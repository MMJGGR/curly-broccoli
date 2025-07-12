import os
import uuid
from fastapi.testclient import TestClient
from app.main import app, Base, engine

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


def register():
    email = f"{uuid.uuid4()}@example.com"
    data = {"email": email, **USER_DATA}
    resp = client.post("/auth/register", json=data)
    token = resp.json()["access_token"]
    return email, token


def test_profile_unauthorized():
    assert client.get("/profile").status_code == 401
    assert client.put("/profile", json={}).status_code == 401


def test_profile_get_and_update():
    email, token = register()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["risk_score"] is not None

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
