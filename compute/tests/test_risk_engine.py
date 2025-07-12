from ..risk_engine import compute_risk_score


def test_high_score():
    score = compute_risk_score(
        age=18,
        income=100_000,
        dependents=0,
        time_horizon=30,
        questionnaire=[5] * 8,
    )
    assert score == 84


def test_low_income_no_questionnaire():
    score = compute_risk_score(
        age=30,
        income=0,
        dependents=0,
        time_horizon=10,
        questionnaire=[3] * 8,
    )
    assert score == 38
