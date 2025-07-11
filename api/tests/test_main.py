import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

from fastapi.testclient import TestClient
from app.main import app, Base, engine


Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_healthz():
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "engines": {}}
    assert "X-Trace-ID" in response.headers


def test_add_numbers():
    response = client.post("/add", json={"a": 2, "b": 3})
    assert response.status_code == 200
    assert response.json() == {"result": 5}


def test_register_login_flow():
    resp = client.post("/register", json={"email": "user@example.com", "password": "strongpassword"})
    assert resp.status_code == 201
    token = resp.json()["access_token"]

    # Duplicate registration
    resp_dup = client.post("/register", json={"email": "user@example.com", "password": "strongpassword"})
    assert resp_dup.status_code == 409

    # Login
    resp_login = client.post("/login", data={"username": "user@example.com", "password": "strongpassword"})
    assert resp_login.status_code == 200
    token_login = resp_login.json()["access_token"]
    assert token_login

    # Wrong password
    resp_bad = client.post("/login", data={"username": "user@example.com", "password": "wrong"})
    assert resp_bad.status_code == 401

    # Access profile
    headers = {"Authorization": f"Bearer {token_login}"}
    resp_profile = client.get("/profile", headers=headers)
    assert resp_profile.status_code == 404  # no profile yet

    # unauthorized
    resp_unauth = client.get("/profile")
    assert resp_unauth.status_code == 403

