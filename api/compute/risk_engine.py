"""
Risk Engine Module (API-local)
Provides risk scoring and level computation for user profiles.

This module is intentionally flexible to avoid import ambiguity with the
top-level `compute.risk_engine` package. It accepts both of these call styles:

- Keyword factors (age, income, dependents, time_horizon, questionnaire) and
  returns a 0–100 integer score (CFA-aligned).
- A single questionnaire_data dict and returns a 0.0–10.0 score (legacy local).
"""
from typing import Dict, Any, List, Optional


def _score_from_factors(
    *,
    age: int,
    income: float,
    dependents: int,
    time_horizon: int,
    questionnaire: List[int],
) -> int:
    """
    Compute a 0–100 integer risk score from explicit factors.
    Mirrors the logic used in the top-level compute module.
    """
    # 1. Questionnaire (normalize 1–5 → 0–1)
    if not questionnaire:
        q_score = 0.5  # neutral
    else:
        q_avg = sum(questionnaire) / len(questionnaire)  # 1–5
        q_score = (q_avg - 1) / 4  # 0–1

    # 2. Age factor
    try:
        age_val = int(age)
    except Exception:
        age_val = 35
    age_score = max(0.0, min(1.0, (60 - age_val) / 60))

    # 3. Income factor (scale vs. 200k baseline)
    try:
        income_val = float(income)
    except Exception:
        income_val = 0.0
    income_score = max(0.0, min(1.0, income_val / 200_000.0))

    # 4. Horizon factor (scale 0–30 years)
    try:
        horizon_val = int(time_horizon)
    except Exception:
        horizon_val = 1
    horizon_score = max(0.0, min(1.0, horizon_val / 30.0))

    # 5. Dependents adjustment (−1% each, cap −10%)
    try:
        deps = int(dependents)
    except Exception:
        deps = 0
    dep_adjust = max(-0.10, -0.01 * deps)

    total = (
        q_score * 0.50
        + age_score * 0.20
        + income_score * 0.20
        + horizon_score * 0.10
        + dep_adjust
    )
    pct = min(100.0, max(0.0, total * 100.0))
    return int(round(pct))


def _score_from_questionnaire_data(questionnaire_data: Dict[str, Any]) -> float:
    """Legacy local scorer returning 0.0–10.0 based on a dict payload."""
    score = 5.0  # Default moderate risk

    # Risk tolerance
    tolerance = questionnaire_data.get("risk_tolerance")
    if tolerance == "conservative":
        score = 3.0
    elif tolerance == "aggressive":
        score = 8.0
    elif tolerance == "moderate":
        score = 5.0

    # Age factor
    try:
        age = int(questionnaire_data.get("age", 35))
    except Exception:
        age = 35
    if age < 30:
        score += 1.0
    elif age > 55:
        score -= 1.0

    # Investment experience
    experience = questionnaire_data.get("investment_experience")
    if experience in ["beginner", "none"]:
        score -= 1.0
    elif experience in ["expert", "professional"]:
        score += 1.0

    # Time horizon
    horizon = questionnaire_data.get("time_horizon")
    if horizon in ["short", "1-3years"]:
        score -= 1.0
    elif horizon in ["long", "10+years"]:
        score += 1.0

    return round(max(1.0, min(10.0, score)), 1)


def compute_risk_score(
    questionnaire_data: Optional[Dict[str, Any]] = None,
    /,
    **kwargs: Any,
):
    """
    Flexible risk scorer that supports two signatures:

    - compute_risk_score(age=..., income=..., dependents=..., time_horizon=..., questionnaire=[...])
      → returns an int 0–100
    - compute_risk_score({ ...questionnaire_data... })
      → returns a float 0.0–10.0 (legacy behavior)
    """
    if kwargs:
        required = {"age", "income", "dependents", "time_horizon", "questionnaire"}
        if not required.issubset(set(kwargs.keys())):
            # If kwargs are present but not the expected set, fall back to dict if provided
            if questionnaire_data is not None:
                return _score_from_questionnaire_data(questionnaire_data)
            raise TypeError(
                "compute_risk_score() missing required keyword arguments: "
                + ", ".join(sorted(required - set(kwargs.keys())))
            )
        return _score_from_factors(
            age=kwargs["age"],
            income=kwargs["income"],
            dependents=kwargs["dependents"],
            time_horizon=kwargs["time_horizon"],
            questionnaire=kwargs["questionnaire"],
        )

    # No kwargs path → dictionary signature
    if questionnaire_data is None:
        raise TypeError("compute_risk_score() expected questionnaire_data dict or keyword factors")
    return _score_from_questionnaire_data(questionnaire_data)


def compute_risk_level(risk_score: float) -> str:
    """
    Convert a numeric risk score to a descriptive level.
    Accepts scores in either 0–10 or 0–100 range.
    """
    # Normalize to 0–10 scale if needed
    score_0_10 = risk_score / 10.0 if risk_score > 10 else risk_score
    if score_0_10 <= 2.0:
        return "Very Conservative"
    elif score_0_10 <= 4.0:
        return "Conservative"
    elif score_0_10 <= 6.0:
        return "Moderate"
    elif score_0_10 <= 8.0:
        return "Aggressive"
    else:
        return "Very Aggressive"
