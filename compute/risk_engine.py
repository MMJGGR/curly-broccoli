"""Risk score computation engine."""


def compute_risk_score(age, income, dependents, goals, questionnaire: dict) -> float:
    """Compute a simplistic risk score based on profile inputs."""
    age_weight = 1 - ((age - 18) / 82)
    income_weight = min(income / 100_000, 1)
    questionnaire_score = (
        sum(questionnaire.values()) / (len(questionnaire) * 5) if questionnaire else 0
    )
    score = (age_weight + income_weight + questionnaire_score * 2) / 4
    return round(score, 2)
