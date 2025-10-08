import uuid
from fastapi.testclient import TestClient
from app.main import app, Base, engine


# Ensure a clean in-memory DB for this test module
Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)
client = TestClient(app)


def register_user():
    email = f"{uuid.uuid4()}@example.com"
    data = {
        "email": email,
        "password": "pass12345",
        "user_type": "user",
        "first_name": "Jane",
        "last_name": "Doe",
        "dob": "1992-02-02",
        "nationalId": "12345678",
        "kra_pin": "A123456789Z",
        "annual_income": 600000,
        "employment_status": "Employed",
        "dependents": 0,
        "goals": {"type": "growth", "targetAmount": 100000, "timeHorizon": 12},
        "questionnaire": [3,3,3,3,3,3,3,3]
    }
    resp = client.post("/auth/register", json=data)
    assert resp.status_code == 201
    return resp.json()["access_token"], email


def test_profile_v2_get_and_put_flow():
    token, email = register_user()
    headers = {"Authorization": f"Bearer {token}"}

    # GET profile-v2 (clean arch)
    r = client.get("/api/v1/profile-v2/", headers=headers)
    assert r.status_code == 200
    body = r.json()
    assert body.get("user_id") is not None
    assert body.get("email") == email
    assert "financial_planning" in body

    # PUT update via profile-v2
    update = {
        "full_name": "John Test",
        "monthly_income": 50000,
        "phone_number": "+254700000000"
    }
    r2 = client.put("/api/v1/profile-v2/", json=update, headers=headers)
    assert r2.status_code == 200
    b2 = r2.json()
    assert b2.get("message") == "Profile updated successfully"
    assert abs(b2["profile"]["monthly_income"] - 50000) < 0.001

    # Verify legacy /auth/me reflects updated profile monthly_income
    r3 = client.get("/auth/me", headers=headers)
    assert r3.status_code == 200
    me = r3.json()
    assert me["email"] == email
    assert me["profile"]["monthly_income"] == 50000

