import os
import uuid
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
from fastapi.testclient import TestClient
from app.main import app, Base, engine

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)

USER = {
    "email": "user@example.com",
    "password": "strongpassword",
    "dob": "1990-01-01",
    "kra_pin": str(uuid.uuid4()),
    "annual_income": 50000,
    "dependents": 1,
    "goals": {"type": "growth", "targetAmount": 100000, "timeHorizon": 10},
    "questionnaire": [3, 3, 3, 3, 3, 3, 3, 3],
    "role": "user"
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


def generate_unique_user_data():
    user_data = USER.copy()
    user_data["email"] = f"{uuid.uuid4()}@example.com"
    user_data["kra_pin"] = str(uuid.uuid4())
    return user_data

def test_register_login_flow():
    unique_user_1 = generate_unique_user_data()
    resp = client.post("/auth/register", json=unique_user_1)
    assert resp.status_code == 201
    token = resp.json()["access_token"]

    unique_user_2 = generate_unique_user_data()
    resp_dup = client.post("/auth/register", json=unique_user_2)
    assert resp_dup.status_code == 201 # This should now pass as a new user

    resp_login = client.post(
        "/auth/login",
        data={"username": unique_user_1["email"], "password": unique_user_1["password"]},
    )
    assert resp_login.status_code == 200
    token_login = resp_login.json()["access_token"]
    assert token_login

    resp_bad = client.post(
        "/auth/login", data={"username": unique_user_1["email"], "password": "wrong"}
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
