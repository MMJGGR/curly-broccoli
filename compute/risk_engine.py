# compute/risk_engine.py

from typing import List

def compute_risk_score(
    age: int,
    income: float,
    dependents: int,
    time_horizon: int,
    questionnaire: List[int],
) -> int:
    """
    Compute a CFA-aligned % risk score (0–100), then return as an integer.
    Weights:
      • Questionnaire avg (1–5): 50%
      • Age factor: 20%
      • Income factor: 20%
      • Time horizon:  10%
      • Dependents:     –1% per dependent, capped at –10%
    """

    # 1. Questionnaire (normalize 1–5 → 0–1)
    q_avg = sum(questionnaire) / len(questionnaire)          # 1–5
    q_score = (q_avg - 1) / 4                               # 0–1

    # 2. Age factor
    age_score = max(0, min(1, (60 - age) / 60))

    # 3. Income factor
    income_score = max(0, min(1, income / 200_000))

    # 4. Horizon factor
    horizon_score = max(0, min(1, time_horizon / 30))

    # 5. Dependents adjustment
    dep_adjust = max(-0.10, -0.01 * dependents)  # each dependent –1%, cap –10%

    # 6. Weighted sum
    total = (
        q_score       * 0.50 +
        age_score     * 0.20 +
        income_score  * 0.20 +
        horizon_score * 0.10 +
        dep_adjust
    )

    # scale 0–100 and clamp
    pct = min(100, max(0, total * 100))
    return int(round(pct))


def compute_risk_level(percent_score: float) -> str:
    """
    Map a 0–100% risk_score into CFA 1–5 risk levels:
      0–19  → "Very Conservative"
      20–39 → "Conservative"
      40–59 → "Moderate"
      60–79 → "Growth"
      80–100→ "Aggressive"
    """
    if percent_score < 20:
        return "Very Conservative"
    if percent_score < 40:
        return "Conservative"
    if percent_score < 60:
        return "Moderate"
    if percent_score < 80:
        return "Growth"
    return "Aggressive"
