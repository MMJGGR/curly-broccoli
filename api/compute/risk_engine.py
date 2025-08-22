"""
Risk Engine Module
Provides risk scoring and level computation for user profiles
"""
from typing import Dict, Any


def compute_risk_score(questionnaire_data: Dict[str, Any]) -> float:
    """
    Compute a risk score based on questionnaire responses.
    
    Args:
        questionnaire_data: Dictionary containing user questionnaire responses
        
    Returns:
        float: Risk score between 0.0 and 10.0
    """
    # Simple risk calculation based on common questionnaire patterns
    score = 5.0  # Default moderate risk
    
    # Risk tolerance questions
    if 'risk_tolerance' in questionnaire_data:
        tolerance = questionnaire_data['risk_tolerance']
        if tolerance == 'conservative':
            score = 3.0
        elif tolerance == 'aggressive':
            score = 8.0
        elif tolerance == 'moderate':
            score = 5.0
            
    # Age factor
    if 'age' in questionnaire_data:
        age = int(questionnaire_data.get('age', 35))
        if age < 30:
            score += 1.0
        elif age > 55:
            score -= 1.0
            
    # Investment experience
    if 'investment_experience' in questionnaire_data:
        experience = questionnaire_data['investment_experience']
        if experience in ['beginner', 'none']:
            score -= 1.0
        elif experience in ['expert', 'professional']:
            score += 1.0
            
    # Time horizon
    if 'time_horizon' in questionnaire_data:
        horizon = questionnaire_data['time_horizon']
        if horizon in ['short', '1-3years']:
            score -= 1.0
        elif horizon in ['long', '10+years']:
            score += 1.0
            
    # Ensure score is within bounds
    score = max(1.0, min(10.0, score))
    
    return round(score, 1)


def compute_risk_level(risk_score: float) -> str:
    """
    Convert a numeric risk score to a descriptive risk level.
    
    Args:
        risk_score: Numeric risk score between 0.0 and 10.0
        
    Returns:
        str: Risk level description
    """
    if risk_score <= 2.0:
        return "Very Conservative"
    elif risk_score <= 4.0:
        return "Conservative"
    elif risk_score <= 6.0:
        return "Moderate"
    elif risk_score <= 8.0:
        return "Aggressive"
    else:
        return "Very Aggressive"