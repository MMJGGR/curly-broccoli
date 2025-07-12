"""Risk score computation engine."""

from typing import List


def compute_risk_score(
    age: int,
    income: float,
    dependents: int,
    time_horizon: int,
    questionnaire: List[int],
) -> float:
    """Compute a CFA-aligned risk score scaled 0-100."""

    # Questionnaire average normalized 0-1 and weighted 0.5
    q_avg = sum(questionnaire) / len(questionnaire)
    q_score = (q_avg - 1) / 4

    # Age: younger investors typically tolerate more risk
    age_score = max(0, min(1, (60 - age) / 60))

    # Income: higher income implies greater capacity
    income_score = max(0, min(1, income / 200_000))

    # Horizon: longer horizons support more risk
    horizon_score = max(0, min(1, time_horizon / 30))

    total = (
        q_score * 0.5
        + age_score * 0.2
        + income_score * 0.2
        + horizon_score * 0.1
    )

    return round(total * 100, 0)


def compute_risk_level(percent_score: float) -> int:
    """Map a 0–100% risk score into a 1–5 CFA risk level."""
    if percent_score < 20:
        return 1
    if percent_score < 40:
        return 2
    if percent_score < 60:
        return 3
    if percent_score < 80:
        return 4
    return 5
