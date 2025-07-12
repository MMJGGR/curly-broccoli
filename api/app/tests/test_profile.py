import os
from fastapi.testclient import TestClient
from app.main import app, Base, engine

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)

USER_DATA = {
    "email": "p@example.com",
    "password": "strongpassword",
    "full_name": "User P",
    "date_of_birth": "1990-01-01",
    "id_type": "ID",
    "id_number": "123",
    "kra_pin": "A",
    "marital_status": "Single",
    "employment_status": "Employed",
    "monthly_income_kes": 100.0,
    "net_worth_estimate": 1000.0,
    "risk_tolerance_score": 5,
    "retirement_age_goal": 65,
    "investment_goals": "growth",
}


def login():
    client.post("/auth/register", json=USER_DATA)
    resp = client.post(
        "/auth/login",
        data={"username": USER_DATA["email"], "password": USER_DATA["password"]},
    )
    return resp.json()["access_token"]


def test_profile_unauth():
    resp = client.get("/profile")
    assert resp.status_code == 403 or resp.status_code == 401


def test_profile_crud():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 200
    resp = client.put(
        "/profile", json={**USER_DATA, "monthly_income_kes": 200}, headers=headers
    )
    assert resp.status_code == 200
    assert resp.json()["monthly_income_kes"] == 200
