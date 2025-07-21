import os
import uuid
from datetime import date
from fastapi.testclient import TestClient
from app.main import app, Base, engine
from compute.risk_engine import compute_risk_score

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)

USER_DATA = {
    "password": "pass1234",
    "dob": "1990-01-01",
    "annual_income": 10000,
    "dependents": 1,
    "goals": {"type": "wealth", "targetAmount": 50000, "timeHorizon": 5},
    "questionnaire": [3, 3, 3, 3, 3, 3, 3, 3],
    "role": "user"
}

def register_user():
    email = f"{uuid.uuid4()}@example.com"
    kra_pin = str(uuid.uuid4())
    data = USER_DATA.copy()
    data["email"] = email
    data["kra_pin"] = kra_pin
    resp = client.post("/auth/register", json=data)
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    return token, kra_pin


def test_profile_requires_authentication():
    assert client.get("/profile").status_code == 401
    assert client.request("PUT", "/profile", json={}).status_code == 401
    assert client.get("/dependents").status_code == 401
    assert client.post("/dependents", json={"dependents": 1}).status_code == 401
    assert client.request("DELETE", "/dependents").status_code == 401


def test_profile_update_recomputes_risk_score():
    token, kra_pin = register_user()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 200
    original = resp.json()["risk_score"]

    update = {
        "dob": USER_DATA["dob"],
        "kra_pin": kra_pin,
        "annual_income": 20000,
        "dependents": 2,
        "goals": {"type": "growth", "targetAmount": 80000, "timeHorizon": 10},
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
        time_horizon=update["goals"]["timeHorizon"],
        questionnaire=USER_DATA["questionnaire"],
    )
    assert updated["risk_score"] == expected_score
    assert updated["risk_score"] != original

