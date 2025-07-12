import os
import uuid

import pytest
from fastapi.testclient import TestClient
from app.main import app, Base, engine

os.environ["DATABASE_URL"] = "sqlite:///./test.db"

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)


def register_and_login():
    email = f"{uuid.uuid4()}@example.com"
    client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "strongpassword",
            "full_name": "User Dep",
            "date_of_birth": "1990-01-01",
            "id_type": "ID",
            "id_number": "123",
            "kra_pin": "A",
            "marital_status": "Single",
            "employment_status": "Employed",
            "monthly_income_kes": 10000.0,
            "net_worth_estimate": 1000.0,
            "risk_tolerance_score": 5,
            "retirement_age_goal": 65,
            "investment_goals": "growth",
        },
    )
    resp_login = client.post(
        "/auth/login", data={"username": email, "password": "strongpassword"}
    )
    return resp_login.json()["access_token"]


def test_unauthenticated_endpoints():
    assert client.get("/profile").status_code == 401
    assert client.get("/dependents").status_code == 401
    assert (
        client.post(
            "/dependents",
            json={"name": "Kid", "relationship": "Child", "date_of_birth": "2010-01-01"},
        ).status_code
        == 401
    )
    assert client.delete("/dependents/bad").status_code == 401


def test_profile_and_dependents_flow():
    token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}

    resp = client.post(
        "/dependents",
        json={"name": "Kid", "relationship": "Child", "date_of_birth": "2010-01-01"},
        headers=headers,
    )
    assert resp.status_code == 201
    dep_id = resp.json()["id"]

    resp = client.get("/dependents", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    resp = client.put(
        "/profile",
        json={
            "full_name": "User Dep",
            "date_of_birth": "1990-01-01",
            "id_type": "ID",
            "id_number": "123",
            "kra_pin": "A",
            "marital_status": "Single",
            "employment_status": "Employed",
            "monthly_income_kes": 20000.0,
            "net_worth_estimate": 2000.0,
            "risk_tolerance_score": 4,
            "retirement_age_goal": 65,
            "investment_goals": "growth",
        },
        headers=headers,
    )
    assert resp.status_code == 200
    assert resp.json()["monthly_income_kes"] == 20000.0

    resp = client.delete(f"/dependents/{dep_id}", headers=headers)
    assert resp.status_code == 204
    resp = client.get("/dependents", headers=headers)
    assert resp.status_code == 200
    assert resp.json() == []


def test_delete_nonexistent_dependent():
    token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.delete("/dependents/bad-id", headers=headers)
    assert resp.status_code == 404


def test_risk_score_recalculated_on_update():
    token = register_and_login()
    headers = {"Authorization": f"Bearer {token}"}
    resp = client.get("/profile", headers=headers)
    score1 = resp.json()["risk_score"]
    resp = client.put(
        "/profile",
        json={
            "full_name": "User Dep",
            "date_of_birth": "1990-01-01",
            "id_type": "ID",
            "id_number": "123",
            "kra_pin": "A",
            "marital_status": "Single",
            "employment_status": "Employed",
            "monthly_income_kes": 20000.0,
            "net_worth_estimate": 2000.0,
            "risk_tolerance_score": 4,
            "retirement_age_goal": 65,
            "investment_goals": "growth",
        },
        headers=headers,
    )
    assert resp.status_code == 200
    score2 = resp.json()["risk_score"]
    assert score2 != score1

