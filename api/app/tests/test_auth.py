import os
from fastapi.testclient import TestClient
from app.main import app, Base, engine

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)

USER_DATA = {
    "email": "user@example.com",
    "password": "strongpassword",
    "full_name": "User One",
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


def test_register_success():
    resp = client.post("/auth/register", json=USER_DATA)
    assert resp.status_code == 201
    assert "access_token" in resp.json()


def test_register_duplicate():
    client.post("/auth/register", json=USER_DATA)
    resp = client.post("/auth/register", json=USER_DATA)
    assert resp.status_code == 409


def test_login_valid():
    client.post("/auth/register", json=USER_DATA)
    resp = client.post(
        "/auth/login",
        data={"username": USER_DATA["email"], "password": USER_DATA["password"]},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_invalid():
    client.post("/auth/register", json=USER_DATA)
    resp = client.post(
        "/auth/login", data={"username": USER_DATA["email"], "password": "wrong"}
    )
    assert resp.status_code == 401
