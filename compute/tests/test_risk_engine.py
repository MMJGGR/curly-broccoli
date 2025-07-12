from ..risk_engine import compute_risk_score


def test_high_score():
    score = compute_risk_score(
        age=18, income=100_000, dependents=0, goals="growth", questionnaire={"q1": 5}
    )
    assert score == 1


def test_low_income_no_questionnaire():
    score = compute_risk_score(
        age=30, income=0, dependents=0, goals="", questionnaire=None
    )
    assert score == 0.21
