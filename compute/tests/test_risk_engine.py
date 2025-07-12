from ..risk_engine import compute_risk_score


def test_compute_risk_score():
    score = compute_risk_score(
        age=30,
        income=50000,
        dependents=1,
        goals="growth",
        questionnaire={"q1": 5, "q2": 3},
    )
    assert score == 0.74
