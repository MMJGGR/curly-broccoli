import json
from fastapi.testclient import TestClient
from app.main import app
from app.models import OnboardingState, Goal as GoalModel


def auth_headers(user):
    return {"Authorization": f"Bearer {user.token}"}


def test_goals_overview_ingests_onboarding_meta(client: TestClient, test_user, session):
    # Create onboarding with enhanced goals data
    gd = {
        "emergencyFund": 180000,
        "homeDownPayment": 500000,
        "timeframes": {
            "emergencyFund": "1-year",
            "homeDownPayment": "5-years"
        },
        "goals_meta": {
            "emergencyFund": {
                "current_amount": 20000,
                "target_date": "2026-01-01",
                "priority": "high",
                "planned_monthly": 15000
            }
        },
        "other_goal": {
            "name": "Vacation",
            "target_amount": 120000,
            "current_amount": 10000,
            "target_date": "2026-06-01",
            "priority": "low",
            "planned_monthly": 5000
        }
    }
    onboarding = OnboardingState(user_id=test_user.id, goals_data=gd)
    session.add(onboarding)
    session.commit()

    # Call overview
    res = client.get("/api/v1/goals-v2/overview", headers=auth_headers(test_user))
    assert res.status_code == 200, res.text
    body = res.json()
    names = [g["name"] for g in body["goals"]]
    assert any("Emergency Fund (from onboarding)" == n for n in names)
    ef = next(g for g in body["goals"] if g["name"].startswith("Emergency Fund"))
    assert ef["target_amount"] == 180000
    assert ef["current_amount"] == 20000
    assert ef["target_date"] == "2026-01-01"
    # Other goal
    vac = next(g for g in body["goals"] if g["name"].startswith("Vacation"))
    assert vac["target_amount"] == 120000
    assert vac["current_amount"] == 10000
    assert vac["target_date"] == "2026-06-01"


def test_goals_update_endpoint_updates_fields_and_progress(client: TestClient, test_user, session):
    # Seed a goal
    g = GoalModel(user_id=test_user.id, name="Emergency", target="100000", current="50000", progress=50.0, target_date="2026-01-01")
    session.add(g)
    session.commit()
    session.refresh(g)

    # Update target and name/date
    res = client.put(
        f"/api/v1/goals-v2/{g.id}",
        headers=auth_headers(test_user),
        json={
            "name": "Emergency Fund",
            "target_amount": 150000,
            "target_date": "2027-01-01",
        },
    )
    assert res.status_code == 200, res.text
    data = res.json()
    assert data["name"] == "Emergency Fund"
    assert data["target_amount"] == 150000
    assert data["target_date"] == "2027-01-01"
    # Progress recalculated: current 50000 / target 150000 = 33.33%
    assert 33.0 <= data["progress_percentage"] <= 34.0
