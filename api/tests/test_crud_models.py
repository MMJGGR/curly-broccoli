import os
import uuid
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
from fastapi.testclient import TestClient
from datetime import datetime
from app.main import app, Base, engine

os.environ["DATABASE_URL"] = "sqlite:///:memory:"
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)

USER_DATA = {
    "password": "pass1234",
    "dob": "1990-01-01",
    "kra_pin": str(uuid.uuid4()),
    "annual_income": 10000,
    "dependents": 1,
    "goals": {"type": "growth", "targetAmount": 50000, "timeHorizon": 5},
    "questionnaire": [3] * 8,
    "role": "user",
}

def register_user():
    data = USER_DATA.copy()
    data["email"] = f"{uuid.uuid4()}@example.com"
    data["kra_pin"] = str(uuid.uuid4())
    resp = client.post("/auth/register", json=data)
    assert resp.status_code == 201
    return resp.json()["access_token"]

def auth_headers(token: str):
    return {"Authorization": f"Bearer {token}"}

def test_crud_models():
    token = register_user()
    headers = auth_headers(token)

    # Account CRUD
    acc = {"name": "Checking", "type": "cash", "balance": 100.0}
    resp = client.post("/accounts/", json=acc, headers=headers)
    assert resp.status_code == 201
    account_id = resp.json()["id"]

    resp = client.get("/accounts/", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    update_acc = {"balance": 150.0}
    resp = client.put(f"/accounts/{account_id}", json=update_acc, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["balance"] == 150.0

    # Transaction CRUD
    tx = {
        "date": datetime.utcnow().isoformat(),
        "description": "Deposit",
        "amount": 150.0,
        "category": "income",
        "account": "Checking",
        "account_id": account_id,
    }
    resp = client.post("/transactions/", json=tx, headers=headers)
    assert resp.status_code == 201
    tx_id = resp.json()["id"]

    resp = client.get(f"/transactions/{tx_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["description"] == "Deposit"

    update_tx = {"amount": 200.0}
    resp = client.put(f"/transactions/{tx_id}", json=update_tx, headers=headers)
    assert resp.status_code == 200
    assert resp.json()["amount"] == 200.0

    # Milestone CRUD
    ms = {
        "age": 30,
        "phase": "accumulation",
        "event": "marriage",
        "assets": "10000",
        "liabilities": "0",
        "net_worth": "10000",
        "advice": "save",
    }
    resp = client.post("/milestones/", json=ms, headers=headers)
    assert resp.status_code == 201
    ms_id = resp.json()["id"]

    resp = client.get(f"/milestones/{ms_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["phase"] == "accumulation"

    # Goal CRUD
    goal = {
        "name": "Retirement",
        "target": "1000000",
        "current": "0",
        "progress": 0.0,
        "target_date": "2050-01-01",
    }
    resp = client.post("/goals/", json=goal, headers=headers)
    assert resp.status_code == 201
    goal_id = resp.json()["id"]

    resp = client.get(f"/goals/{goal_id}", headers=headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == "Retirement"

    # Delete resources
    resp = client.delete(f"/goals/{goal_id}", headers=headers)
    assert resp.status_code == 204
    resp = client.delete(f"/milestones/{ms_id}", headers=headers)
    assert resp.status_code == 204
    resp = client.delete(f"/transactions/{tx_id}", headers=headers)
    assert resp.status_code == 204
    resp = client.delete(f"/accounts/{account_id}", headers=headers)
    assert resp.status_code == 204
