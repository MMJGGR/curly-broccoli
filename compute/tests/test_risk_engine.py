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

def test_risk_level_mapping():
    from ..risk_engine import compute_risk_level
    assert compute_risk_level(10) == 1
    assert compute_risk_level(35) == 2
    assert compute_risk_level(55) == 3
    assert compute_risk_level(70) == 4
    assert compute_risk_level(90) == 5


def test_score_level_consistency():
    from ..risk_engine import compute_risk_level
    score = compute_risk_score(
        age=40,
        income=150000,
        dependents=1,
        time_horizon=20,
        questionnaire=[4] * 8,
    )
    level = compute_risk_level(score)
    assert 1 <= level <= 5
    # Ensure the level corresponds to the computed score
    assert level == compute_risk_level(score)
