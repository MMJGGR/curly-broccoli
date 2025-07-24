import uuid
from fastapi.testclient import TestClient

# Fixtures are now in conftest.py

USER_DATA = {
    "password": "pass1234",
    "dob": "1990-01-01",
    "kra_pin": "P123",
    "annual_income": 10000,
    "dependents": 1,
    "goals": {"type": "wealth", "targetAmount": 50000, "timeHorizon": 5},
    "questionnaire": [4, 4, 4, 4, 4, 4, 4, 4],
    "role": "user"
}


def register(client: TestClient):
    email = f"{uuid.uuid4()}@example.com"
    kra_pin = str(uuid.uuid4())
    data = USER_DATA.copy()
    data["email"] = email
    data["kra_pin"] = kra_pin
    resp = client.post("/auth/register", json=data)
    resp.raise_for_status() # Raise an exception for bad status codes
    token = resp.json().get("access_token")
    if not token:
        raise ValueError("Access token not found in response")
    return email, token


def test_profile_unauthorized(client: TestClient):
    assert client.get("/profile").status_code == 401
    assert client.put("/profile", json={}).status_code == 401
    assert client.get("/dependents").status_code == 401
    assert client.post("/dependents", json={"dependents": 1}).status_code == 401
    assert client.delete("/dependents").status_code == 401


def test_profile_get_and_update(client: TestClient):
    email, token = register(client)
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


def test_dependents_crud(client: TestClient):
    _, token = register(client)
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


def test_profile_risk_level_field(client: TestClient):
    _, token = register(client)
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/profile", headers=headers)
    assert resp.status_code == 200
    assert 1 <= resp.json()["risk_level"] <= 5
