from fastapi.testclient import TestClient
from app.main import app
from app.models import OnboardingState


def auth_headers(user):
    return {"Authorization": f"Bearer {user.token}"}


def test_onboarding_preferences_transfer_to_profile(client: TestClient, test_user, session):
    # Insert onboarding with preferences_data
    onboarding = OnboardingState(
        user_id=test_user.id,
        current_step=5,
        completed_steps=[1,2,3,4,5],
        is_complete=False,
        personal_data={"firstName":"Test","lastName":"User","dateOfBirth":"1990-01-01"},
        financial_data={"monthlyIncome": 100000, "rent": 30000},
        risk_data={"questionnaire":[3,3,3,3,3]},
        goals_data={},
        preferences_data={"notifications": True, "dataSharing": False}
    )
    session.add(onboarding)
    session.commit()

    # Complete onboarding (invokes ProfileDataService.transfer_onboarding_to_profile)
    res = client.post("/api/v1/onboarding-v2-clean/complete", headers=auth_headers(test_user), json={})
    assert res.status_code == 200, res.text

    # Fetch profile
    me = client.get("/auth/me", headers=auth_headers(test_user))
    assert me.status_code == 200
    body = me.json()
    # Preferences surfaced under investment_preferences for P0 reuse
    assert body["profile"].get("investment_preferences") == {"notifications": True, "dataSharing": False}

