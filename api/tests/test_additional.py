import os
import uuid
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
from fastapi.testclient import TestClient
from app.main import app, Base, engine
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)

USER = {
    "password": "pass12345",
    "dob": "1990-01-01",
    "annual_income": 10000,
    "dependents": 1,
    "goals": {"type": "growth", "targetAmount": 50000, "timeHorizon": 5},
    "questionnaire": [3]*8,
    "role": "user"
}

def register_user(email: str = None, kra_pin: str = None):
    data = USER.copy()
    data["email"] = email if email else f"{uuid.uuid4()}@example.com"
    data["kra_pin"] = kra_pin if kra_pin else str(uuid.uuid4())
    return client.post("/auth/register", json=data)

def login(email: str, password=USER["password"]):
    return client.post("/auth/login", data={"username": email, "password": password})


def test_register_duplicate_and_invalid():
    resp = register_user()
    assert resp.status_code == 201
    # Attempt duplicate registration with the same email and kra_pin
    dup = client.post("/auth/register", json=resp.json())
    assert dup.status_code == 400
    bad = client.post("/auth/register", json={"email": "bad"})
    assert bad.status_code == 400


def test_login_bad_credentials():
    register_user(email=f"{uuid.uuid4()}@e.com", kra_pin=str(uuid.uuid4()))
    resp = login(email=f"{uuid.uuid4()}@e.com", password="wrong")
    assert resp.status_code == 401


def test_dependents_routes():
    token = register_user(str(uuid.uuid4())+"@e.com").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    # unauthorized access
    assert client.get("/dependents").status_code == 401
    # set dependents
    r = client.post("/dependents", json={"dependents": 3}, headers=headers)
    assert r.status_code == 200 and r.json()["dependents"] == 3
    r = client.delete("/dependents", headers=headers)
    assert r.status_code == 200 and r.json()["dependents"] == 0


def test_trace_id_header_on_error():
    resp = client.get("/profile")
    assert resp.status_code == 401
    assert "X-Trace-ID" in resp.headers


def test_profile_update_invalid_fields():
    token = register_user(email=f"{uuid.uuid4()}@e.com", kra_pin=str(uuid.uuid4())).json()["access_token"]

