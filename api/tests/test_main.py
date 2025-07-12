import os
from fastapi.testclient import TestClient
from app.main import app, Base, engine

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)

USER = {
    "email": "user@example.com",
    "password": "strongpassword",
    "dob": "1990-01-01",
    "kra_pin": "K123",
    "annual_income": 50000,
    "dependents": 1,
    "goals": {"type": "growth"},
    "questionnaire": {"0": 5},
}


def test_read_root():
    res = client.get("/")
    assert res.status_code == 200
    assert res.json() == {"message": "Hello World"}


def test_healthz():
    res = client.get("/healthz")
    assert res.status_code == 200
    assert res.json() == {"status": "ok", "engines": {}}
    assert "X-Trace-ID" in res.headers


def test_add_numbers():
    res = client.post("/add", json={"a": 2, "b": 3})
    assert res.status_code == 200
    assert res.json() == {"result": 5}


def test_register_login_flow():
    resp = client.post("/auth/register", json=USER)
    assert resp.status_code == 201
    token = resp.json()["access_token"]

    resp_dup = client.post("/auth/register", json=USER)
    assert resp_dup.status_code == 400

    resp_login = client.post(
        "/auth/login",
        data={"username": USER["email"], "password": USER["password"]},
    )
    assert resp_login.status_code == 200
    token_login = resp_login.json()["access_token"]
    assert token_login

    resp_bad = client.post(
        "/auth/login", data={"username": USER["email"], "password": "wrong"}
    )
    assert resp_bad.status_code == 401

    headers = {"Authorization": f"Bearer {token_login}"}
    resp_profile = client.get("/profile", headers=headers)
    assert resp_profile.status_code == 200
    assert resp_profile.json().get("risk_score") is not None

    resp_unauth = client.get("/profile")
    assert resp_unauth.status_code in (401, 403)


def test_echo_endpoint():
    response = client.post("/echo", json={"message": "hi"})
    assert response.status_code == 200
    assert response.json() == {"message": "hi"}


def test_profile_invalid_token():
    headers = {"Authorization": "Bearer badtoken"}
    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 401
