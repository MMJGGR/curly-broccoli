import os
os.environ['DATABASE_URL'] = 'sqlite:///./test.db'
from fastapi.testclient import TestClient
from app.main import app, Base, engine

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)

client = TestClient(app)


def _register_and_login(email: str):
    resp = client.post(
        "/auth/register",
        json={
            "email": email,
            "password": "strongpassword",
            "full_name": "User Test",
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
        },
    )
    assert resp.status_code == 201
    token = resp.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_echo():
    resp = client.post("/echo", json={"message": "hi"})
    assert resp.status_code == 200
    assert resp.json() == {"message": "hi"}


def test_profile_update_and_dependents():
    headers = _register_and_login("profile@example.com")

    update = {
        "full_name": "Updated User",
        "date_of_birth": "1990-01-01",
        "id_type": "ID",
        "id_number": "321",
        "kra_pin": "B",
        "marital_status": "Married",
        "employment_status": "Self-employed",
        "monthly_income_kes": 200.0,
        "net_worth_estimate": 2000.0,
        "risk_tolerance_score": 6,
        "retirement_age_goal": 60,
        "investment_goals": "income",
    }
    resp_update = client.put("/profile", headers=headers, json=update)
    assert resp_update.status_code == 200
    assert resp_update.json()["monthly_income_kes"] == update["monthly_income_kes"]

    dep = {"name": "Kid", "relationship": "Child", "date_of_birth": "2020-01-01"}
    resp_add = client.post("/dependents", headers=headers, json=dep)
    assert resp_add.status_code == 201
    dep_id = resp_add.json()["id"]

    resp_list = client.get("/dependents", headers=headers)
    assert resp_list.status_code == 200
    assert len(resp_list.json()) == 1

    resp_del = client.delete(f"/dependents/{dep_id}", headers=headers)
    assert resp_del.status_code == 204

    resp_list2 = client.get("/dependents", headers=headers)
    assert resp_list2.status_code == 200
    assert resp_list2.json() == []
