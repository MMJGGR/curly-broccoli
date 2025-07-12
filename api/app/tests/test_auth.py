import os
from fastapi.testclient import TestClient
from app.main import app, Base, engine

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)

USER_DATA = {
    "email": "user@example.com",
    "password": "strongpassword",
    "dob": "1990-01-01",
    "kra_pin": "A123",
    "annual_income": 50000,
    "dependents": 0,
    "goals": {"type": "growth"},
    "questionnaire": {"0": 5},
}


def test_register_success():
    resp = client.post("/auth/register", json=USER_DATA)
    assert resp.status_code == 201
    assert "access_token" in resp.json()


def test_register_duplicate():
    client.post("/auth/register", json=USER_DATA)
    resp = client.post("/auth/register", json=USER_DATA)
    assert resp.status_code == 400


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
        "/auth/login", data={"username": USER_DATA["email"], "password": "bad"}
    )
    assert resp.status_code == 401
