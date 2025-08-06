"""
Shared Risk Calculation Utilities
Consolidates risk scoring logic to eliminate duplication across frontend and backend
"""
from typing import List, Dict, Any, Optional

def calculate_risk_score(questionnaire: List[int]) -> Optional[int]:
    """
    Calculate risk score from questionnaire responses
    
    Args:
        questionnaire: List of 5 answers (1-4 scale)
        
    Returns:
        Risk score (0-100) or None if invalid
    """
    if not questionnaire or len(questionnaire) != 5:
        return None
    
    weights = [25, 20, 30, 15, 10]  # Different weights for each question
    total_score = 0
    
    for i, answer in enumerate(questionnaire):
        if not isinstance(answer, int) or answer < 1 or answer > 4:
            return None
        normalized_answer = (answer - 1) / 3  # Convert 1-4 to 0-1
        total_score += normalized_answer * weights[i]
    
    return round(total_score)

def get_risk_level_info(score: int) -> Dict[str, Any]:
    """
    Get comprehensive risk level information from score
    
    Args:
        score: Risk score (0-100)
        
    Returns:
        Dictionary with level info including numeric value, description, recommendations
    """
    if score < 20:
        return {
            "level": "Very Low",
            "numeric": 1,
            "description": "Conservative investor",
            "recommendations": [
                "You prefer stable, predictable returns",
                "Suitable for government bonds and fixed deposits",
                "Lower potential returns but minimal risk of loss"
            ]
        }
    elif score < 40:
        return {
            "level": "Low", 
            "numeric": 2,
            "description": "Cautious investor",
            "recommendations": [
                "You prefer some stability with modest growth",
                "Suitable for conservative mutual funds and bonds",
                "Moderate returns with low risk tolerance"
            ]
        }
    elif score < 60:
        return {
            "level": "Medium",
            "numeric": 3, 
            "description": "Balanced investor",
            "recommendations": [
                "You're comfortable with balanced risk and return",
                "Suitable for diversified portfolios and balanced funds",
                "Good growth potential with manageable risk"
            ]
        }
    elif score < 80:
        return {
            "level": "High",
            "numeric": 4,
            "description": "Aggressive investor", 
            "recommendations": [
                "You're willing to take risks for higher returns",
                "Suitable for growth stocks and equity funds",
                "High growth potential but more volatile"
            ]
        }
    else:
        return {
            "level": "Very High",
            "numeric": 5,
            "description": "Speculative investor",
            "recommendations": [
                "You're comfortable with significant volatility", 
                "Suitable for speculative investments and startups",
                "Highest growth potential but substantial risk"
            ]
        }

def get_risk_level_string(score: int) -> str:
    """Get risk level as string for API compatibility"""
    return get_risk_level_info(score)["level"]

def get_risk_level_numeric(score: int) -> int:
    """Get numeric risk level (1-5) for API compatibility"""
    return get_risk_level_info(score)["numeric"]

def validate_questionnaire(questionnaire: List[int]) -> bool:
    """
    Validate questionnaire responses
    
    Args:
        questionnaire: List of answers to validate
        
    Returns:
        True if valid, False otherwise
    """
    if not isinstance(questionnaire, list) or len(questionnaire) != 5:
        return False
    
    return all(
        isinstance(answer, int) and 1 <= answer <= 4 
        for answer in questionnaire
    )

def calculate_comprehensive_risk_score(
    questionnaire: List[int],
    age: int,
    income: float,
    dependents: int,
    time_horizon: int
) -> Optional[int]:
    """
    Calculate comprehensive risk score using multiple factors
    This uses the more advanced algorithm from compute/risk_engine.py
    
    Args:
        questionnaire: List of 5 answers (1-4 scale)
        age: Age in years
        income: Annual income
        dependents: Number of dependents
        time_horizon: Investment time horizon in years
        
    Returns:
        Comprehensive risk score (0-100) or None if invalid
    """
    if not validate_questionnaire(questionnaire):
        return None
    
    # 1. Questionnaire (normalize 1-4 → 0-1)
    q_avg = sum(questionnaire) / len(questionnaire)  # 1-4
    q_score = (q_avg - 1) / 3  # 0-1

    # 2. Age factor
    age_score = max(0, min(1, (60 - age) / 60))

    # 3. Income factor
    income_score = max(0, min(1, income / 200_000))

    # 4. Horizon factor  
    horizon_score = max(0, min(1, time_horizon / 30))

    # 5. Dependents adjustment
    dep_adjust = max(-0.10, -0.01 * dependents)  # each dependent -1%, cap -10%

    # 6. Weighted sum
    total = (
        q_score * 0.50 +
        age_score * 0.20 +
        income_score * 0.20 +
        horizon_score * 0.10 +
        dep_adjust
    )

    # scale 0-100 and clamp
    pct = min(100, max(0, total * 100))
    return int(round(pct))