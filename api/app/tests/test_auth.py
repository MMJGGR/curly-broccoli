from fastapi.testclient import TestClient

# Fixtures are now in conftest.py

USER_DATA = {
    "email": "test@example.com",
    "password": "password123",
    "dob": "1990-01-15",
    "kra_pin": "A001234567Z",
    "annual_income": 50000,
    "dependents": 2,
    "goals": {"retirement": 1000000, "education": 500000},
    "questionnaire": [1, 2, 3, 4, 5, 1, 2, 3],
    "role": "user"
}


def test_register_success(client: TestClient):
    resp = client.post("/auth/register", json=USER_DATA)
    assert resp.status_code == 201
    assert "access_token" in resp.json()
    assert 0 <= resp.json()["risk_score"] <= 100
    assert isinstance(resp.json()["risk_level"], int)


def test_register_duplicate(client: TestClient):
    client.post("/auth/register", json=USER_DATA)
    resp = client.post("/auth/register", json=USER_DATA)
    assert resp.status_code == 400


def test_login_valid(client: TestClient):
    client.post("/auth/register", json=USER_DATA)
    resp = client.post(
        "/auth/login",
        data={"username": USER_DATA["email"], "password": USER_DATA["password"]},
    )
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_login_invalid(client: TestClient):
    client.post("/auth/register", json=USER_DATA)
    resp = client.post(
        "/auth/login", data={"username": USER_DATA["email"], "password": "bad"}
    )
    assert resp.status_code == 401
