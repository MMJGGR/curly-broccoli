"""
CLEAN TIMELINE ENDPOINTS - Timeline-first dashboard system
Following the proven clean architecture pattern
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime, date
import logging
import json

# Import with absolute paths to avoid conflicts
from api.app.database import get_db
from api.app.models import User, Profile, OnboardingState
from api.app.auth import get_current_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/timeline", tags=["timeline-clean"])


def calculate_age(birth_date: date) -> int:
    """Calculate age from date of birth"""
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


@router.get("/journey")
def get_timeline_journey(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get main Timeline data with milestones - core Timeline visualization"""
    print("🚀 CLEAN TIMELINE: Journey data requested")
    logger.info("🚀 CLEAN TIMELINE: Journey data requested")
    
    # Get profile and onboarding data
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found - complete onboarding first"
        )
    
    # Calculate current age and persona
    current_age = calculate_age(profile.date_of_birth) if profile.date_of_birth else 25
    persona = detect_persona(profile)
    
    # Generate Timeline milestones
    milestones = generate_timeline_milestones(profile, current_age, persona)
    
    # Calculate confidence bands (Monte Carlo simulation placeholder)
    confidence_bands = calculate_confidence_bands(profile, milestones)
    
    # Calculate alignment score
    alignment_score = calculate_alignment_score(profile, onboarding, milestones)
    
    timeline_journey = {
        "user_id": current_user.id,
        "current_age": current_age,
        "current_phase": get_life_phase(current_age, profile.dependents or 0),
        "persona": persona,
        "timeline_span": {
            "start_age": current_age,
            "end_age": min(current_age + 40, 85),  # 40-year planning horizon
            "focus_years": get_persona_focus_years(persona)
        },
        "milestones": milestones,
        "confidence_bands": confidence_bands,
        "alignment_score": alignment_score,
        "next_milestone": get_next_milestone(milestones, current_age),
        "timeline_metadata": {
            "last_updated": datetime.utcnow().isoformat(),
            "data_completeness": calculate_data_completeness(profile, onboarding),
            "persona_insights": get_persona_timeline_insights(persona)
        }
    }
    
    print(f"✅ CLEAN TIMELINE: Journey returned for {persona} persona, age {current_age}")
    logger.info(f"✅ CLEAN TIMELINE: Journey returned for {persona} persona, age {current_age}")
    
    return timeline_journey


@router.get("/alignment")
def get_alignment_score_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed alignment score and insights"""
    print("🚀 CLEAN TIMELINE: Alignment details requested")
    logger.info("🚀 CLEAN TIMELINE: Alignment details requested")
    
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    current_age = calculate_age(profile.date_of_birth) if profile.date_of_birth else 25
    milestones = generate_timeline_milestones(profile, current_age, detect_persona(profile))
    
    alignment_details = {
        "daily_score": calculate_alignment_score(profile, onboarding, milestones),
        "score_trend": "improving",  # TODO: Calculate from historical data
        "status": get_alignment_status(calculate_alignment_score(profile, onboarding, milestones)),
        "contributing_factors": get_alignment_factors(profile, milestones),
        "recommendations": get_alignment_recommendations(profile, milestones),
        "impact_preview": {
            "next_goal_distance": calculate_next_goal_distance(milestones, current_age),
            "confidence_level": confidence_bands.get("realistic", 75) if 'confidence_bands' in locals() else 75
        },
        "persona_specific_insights": get_persona_alignment_insights(detect_persona(profile))
    }
    
    print(f"✅ CLEAN TIMELINE: Alignment details returned - score: {alignment_details['daily_score']}")
    logger.info(f"✅ CLEAN TIMELINE: Alignment details returned - score: {alignment_details['daily_score']}")
    
    return alignment_details


@router.post("/milestone")
def create_timeline_milestone(
    milestone_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new milestone on Timeline"""
    print("🚀 CLEAN TIMELINE: New milestone creation requested")
    logger.info("🚀 CLEAN TIMELINE: New milestone creation requested")
    
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    try:
        # Get current goals or initialize empty dict
        current_goals = profile.goals or {}
        
        # Add new milestone
        milestone_id = f"milestone_{datetime.utcnow().timestamp()}"
        new_milestone = {
            "id": milestone_id,
            "title": milestone_data.get("title"),
            "target_amount": milestone_data.get("target_amount"),
            "target_age": milestone_data.get("target_age"),
            "category": milestone_data.get("category", "general"),
            "created_at": datetime.utcnow().isoformat(),
            "priority": milestone_data.get("priority", "medium")
        }
        
        current_goals[milestone_id] = new_milestone
        profile.goals = current_goals
        
        # Calculate impact on Timeline
        timeline_impact = calculate_milestone_impact(profile, new_milestone)
        
        db.commit()
        db.refresh(profile)
        
        print(f"✅ CLEAN TIMELINE: New milestone created - {new_milestone['title']}")
        logger.info(f"✅ CLEAN TIMELINE: New milestone created - {new_milestone['title']}")
        
        return {
            "success": True,
            "milestone": new_milestone,
            "timeline_impact": timeline_impact,
            "updated_alignment_score": calculate_alignment_score(
                profile, 
                db.query(OnboardingState).filter_by(user_id=current_user.id).first(),
                generate_timeline_milestones(profile, calculate_age(profile.date_of_birth), detect_persona(profile))
            )
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ CLEAN TIMELINE: Milestone creation failed - {str(e)}")
        logger.error(f"❌ CLEAN TIMELINE: Milestone creation failed - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create milestone: {str(e)}"
        )


@router.get("/dashboard-overview")
def get_dashboard_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get Timeline-focused dashboard overview"""
    print("🚀 CLEAN TIMELINE: Dashboard overview requested")
    logger.info("🚀 CLEAN TIMELINE: Dashboard overview requested")
    
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    if not profile:
        return {
            "timeline_ready": False,
            "needs_onboarding": True,
            "message": "Complete onboarding to unlock your Timeline"
        }
    
    current_age = calculate_age(profile.date_of_birth) if profile.date_of_birth else 25
    persona = detect_persona(profile)
    milestones = generate_timeline_milestones(profile, current_age, persona)
    
    dashboard_overview = {
        "timeline_ready": True,
        "user_context": {
            "name": f"{profile.first_name} {profile.last_name}",
            "age": current_age,
            "persona": persona,
            "life_phase": get_life_phase(current_age, profile.dependents or 0)
        },
        "timeline_summary": {
            "total_milestones": len(milestones),
            "next_milestone": get_next_milestone(milestones, current_age),
            "timeline_span_years": get_persona_focus_years(persona),
            "confidence_level": 78  # Placeholder for Monte Carlo
        },
        "alignment_overview": {
            "current_score": calculate_alignment_score(profile, onboarding, milestones),
            "trend": "stable",
            "last_updated": datetime.utcnow().isoformat()
        },
        "quick_actions": get_persona_quick_actions(persona, profile),
        "persona_welcome": get_persona_dashboard_welcome(persona, profile.first_name),
        "timeline_visualization_data": {
            "milestones": milestones[:5],  # First 5 milestones for preview
            "current_position": current_age,
            "focus_range": [current_age, current_age + get_persona_focus_years(persona)]
        }
    }
    
    print(f"✅ CLEAN TIMELINE: Dashboard overview returned for {persona}")
    logger.info(f"✅ CLEAN TIMELINE: Dashboard overview returned for {persona}")
    
    return dashboard_overview


@router.get("/test")
def test_clean_timeline():
    """Test endpoint to verify clean timeline implementation"""
    print("🧪 CLEAN TIMELINE TEST ENDPOINT CALLED")
    logger.info("🧪 CLEAN TIMELINE TEST ENDPOINT CALLED")
    return {
        "message": "CLEAN TIMELINE ENDPOINTS ACTIVE",
        "version": "timeline-clean-v1.0", 
        "timestamp": datetime.utcnow().isoformat()
    }


# Helper functions
def detect_persona(profile: Profile) -> str:
    """Detect user persona based on profile data"""
    if not profile.date_of_birth:
        return "Unknown"
    
    age = calculate_age(profile.date_of_birth)
    dependents = profile.dependents or 0
    
    if age < 30 and dependents == 0:
        return "Jamal"  # Early-Career
    elif 30 <= age < 50 and dependents > 0:
        return "Aisha"  # Family-Focused
    elif age >= 50:
        return "Samuel"  # Pre-Retirement
    else:
        return "General"


def generate_timeline_milestones(profile: Profile, current_age: int, persona: str) -> List[Dict[str, Any]]:
    """Generate Timeline milestones based on profile and persona"""
    milestones = []
    
    # Extract goals from profile
    if profile.goals:
        for goal_id, goal_data in profile.goals.items():
            if isinstance(goal_data, dict):
                milestones.append({
                    "id": goal_id,
                    "age": goal_data.get("target_age", current_age + 5),
                    "title": goal_data.get("title", "Financial Goal"),
                    "target_amount": goal_data.get("target_amount", 10000),
                    "category": goal_data.get("category", "general"),
                    "progress": calculate_goal_progress(goal_data, profile),
                    "timeline_impact": "On track",  # TODO: Calculate actual impact
                    "confidence": 75  # TODO: Calculate from risk and other factors
                })
    
    # Add persona-specific default milestones if none exist
    if not milestones:
        milestones = get_default_milestones(persona, current_age, profile.annual_income or 50000)
    
    # Sort by age
    milestones.sort(key=lambda x: x.get("age", current_age))
    
    return milestones


def get_default_milestones(persona: str, current_age: int, annual_income: float) -> List[Dict[str, Any]]:
    """Get default milestones based on persona"""
    income = annual_income
    
    defaults = {
        "Jamal": [
            {
                "id": "emergency_fund",
                "age": current_age + 1,
                "title": "Emergency Fund (3 months)",
                "target_amount": income * 0.25,  # 3 months expenses
                "category": "emergency",
                "progress": 0,
                "confidence": 85
            },
            {
                "id": "first_investment",
                "age": current_age + 3, 
                "title": "First Investment Portfolio",
                "target_amount": income * 0.5,
                "category": "investment",
                "progress": 0,
                "confidence": 70
            }
        ],
        "Aisha": [
            {
                "id": "education_fund",
                "age": current_age + 2,
                "title": "Children's Education Fund",
                "target_amount": 100000,
                "category": "education",
                "progress": 0,
                "confidence": 80
            },
            {
                "id": "home_upgrade",
                "age": current_age + 5,
                "title": "Home Down Payment",
                "target_amount": 200000,
                "category": "housing",
                "progress": 0,
                "confidence": 75
            }
        ],
        "Samuel": [
            {
                "id": "retirement_fund",
                "age": 65,
                "title": "Retirement Readiness",
                "target_amount": income * 10,  # 10x income rule
                "category": "retirement",
                "progress": 0,
                "confidence": 70
            },
            {
                "id": "healthcare_fund",
                "age": current_age + 5,
                "title": "Healthcare Reserve",
                "target_amount": 50000,
                "category": "healthcare",
                "progress": 0,
                "confidence": 65
            }
        ]
    }
    
    return defaults.get(persona, defaults["Jamal"])


def calculate_confidence_bands(profile: Profile, milestones: List[Dict[str, Any]]) -> Dict[str, float]:
    """Calculate Monte Carlo confidence bands (simplified)"""
    # TODO: Implement actual Monte Carlo simulation
    base_confidence = 75
    
    # Adjust based on risk score
    if profile.risk_score:
        if profile.risk_score > 70:
            base_confidence -= 10  # Higher risk, lower confidence
        elif profile.risk_score < 30:
            base_confidence += 5   # Conservative, higher confidence
    
    return {
        "optimistic": min(base_confidence + 15, 95),
        "realistic": base_confidence,
        "pessimistic": max(base_confidence - 20, 40)
    }


def calculate_alignment_score(profile: Profile, onboarding: Optional[OnboardingState], milestones: List[Dict[str, Any]]) -> float:
    """Calculate daily alignment score"""
    score = 50  # Base score
    
    # Onboarding completion boost
    if onboarding and onboarding.is_complete:
        score += 20
    
    # Profile completeness
    if profile.annual_income:
        score += 10
    if profile.goals:
        score += 15
    if profile.risk_score:
        score += 5
    
    # Milestone quality
    if milestones:
        score += min(len(milestones) * 2, 10)
    
    return min(score, 100)


def get_alignment_status(score: float) -> str:
    """Get alignment status from score"""
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good" 
    elif score >= 40:
        return "Needs Improvement"
    else:
        return "Requires Attention"


def get_life_phase(age: int, dependents: int) -> str:
    """Determine life phase"""
    if age < 30:
        return "Accumulation"
    elif age < 50 and dependents > 0:
        return "Family & Property"
    elif age < 65:
        return "Pre-Retirement"
    else:
        return "Retirement"


def get_persona_focus_years(persona: str) -> int:
    """Get focus years for each persona"""
    return {
        "Jamal": 5,
        "Aisha": 15, 
        "Samuel": 20
    }.get(persona, 10)


def get_next_milestone(milestones: List[Dict[str, Any]], current_age: int) -> Optional[Dict[str, Any]]:
    """Get the next milestone from current age"""
    future_milestones = [m for m in milestones if m.get("age", 0) > current_age]
    return min(future_milestones, key=lambda x: x.get("age", 999)) if future_milestones else None


def calculate_data_completeness(profile: Profile, onboarding: Optional[OnboardingState]) -> float:
    """Calculate how complete the user's data is"""
    completeness = 0
    total_checks = 6
    
    if profile.first_name and profile.last_name:
        completeness += 1
    if profile.annual_income:
        completeness += 1
    if profile.risk_score:
        completeness += 1
    if profile.goals:
        completeness += 1
    if onboarding and onboarding.is_complete:
        completeness += 2  # Onboarding worth double
    
    return (completeness / total_checks) * 100


def get_persona_timeline_insights(persona: str) -> Dict[str, str]:
    """Get timeline insights specific to persona"""
    return {
        "Jamal": "Focus on building your foundation over the next 5 years",
        "Aisha": "Balance family needs with long-term security over 15 years",
        "Samuel": "Optimize your 20-year path to retirement"
    }.get(persona, "Build your financial timeline step by step")


def calculate_goal_progress(goal_data: Dict[str, Any], profile: Profile) -> float:
    """Calculate progress toward a specific goal (placeholder)"""
    # TODO: Implement actual progress calculation based on savings/investments
    return goal_data.get("progress", 0)


def get_alignment_factors(profile: Profile, milestones: List[Dict[str, Any]]) -> List[Dict[str, str]]:
    """Get factors contributing to alignment score"""
    factors = []
    
    if profile.annual_income:
        factors.append({"factor": "Income Information", "status": "Complete", "impact": "+10"})
    if profile.goals:
        factors.append({"factor": "Goal Setting", "status": "Active", "impact": "+15"})
    if milestones:
        factors.append({"factor": "Timeline Milestones", "status": f"{len(milestones)} set", "impact": f"+{min(len(milestones)*2, 10)}"})
    
    return factors


def get_alignment_recommendations(profile: Profile, milestones: List[Dict[str, Any]]) -> List[str]:
    """Get recommendations to improve alignment"""
    recommendations = []
    
    if not milestones:
        recommendations.append("Add your first financial milestone to improve Timeline accuracy")
    elif len(milestones) < 3:
        recommendations.append("Add more milestones for a complete financial picture")
    
    if not profile.annual_income:
        recommendations.append("Update your income information for better Timeline calculations")
    
    return recommendations or ["Your Timeline looks great! Keep monitoring your progress."]


def get_persona_alignment_insights(persona: str) -> List[str]:
    """Get persona-specific alignment insights"""
    return {
        "Jamal": ["Focus on emergency fund first", "Start investing early for compound growth"],
        "Aisha": ["Balance family needs with long-term goals", "Consider education savings plans"],
        "Samuel": ["Review retirement readiness", "Plan for healthcare costs"]
    }.get(persona, ["Review your financial goals regularly"])


def calculate_next_goal_distance(milestones: List[Dict[str, Any]], current_age: int) -> str:
    """Calculate distance to next goal"""
    next_milestone = get_next_milestone(milestones, current_age)
    if next_milestone:
        years_away = next_milestone.get("age", current_age) - current_age
        if years_away <= 1:
            return f"{years_away * 12:.0f} months away"
        else:
            return f"{years_away:.1f} years away"
    return "No upcoming milestones"


def calculate_milestone_impact(profile: Profile, milestone: Dict[str, Any]) -> Dict[str, Any]:
    """Calculate the impact of adding a new milestone"""
    return {
        "timeline_effect": "New milestone added to Timeline",
        "alignment_change": "+5 points",
        "confidence_impact": "Timeline confidence maintained"
    }


def get_persona_quick_actions(persona: str, profile: Profile) -> List[Dict[str, str]]:
    """Get quick actions for dashboard based on persona"""
    actions = {
        "Jamal": [
            {"title": "Set Emergency Fund Goal", "action": "create_milestone", "category": "emergency"},
            {"title": "Plan First Investment", "action": "create_milestone", "category": "investment"}
        ],
        "Aisha": [
            {"title": "Education Fund Planning", "action": "create_milestone", "category": "education"},
            {"title": "Review Family Insurance", "action": "update_profile", "category": "insurance"}
        ],
        "Samuel": [
            {"title": "Retirement Readiness Check", "action": "analyze_timeline", "category": "retirement"},
            {"title": "Healthcare Cost Planning", "action": "create_milestone", "category": "healthcare"}
        ]
    }
    return actions.get(persona, actions["Jamal"])


def get_persona_dashboard_welcome(persona: str, first_name: Optional[str]) -> str:
    """Get personalized dashboard welcome message"""
    name = first_name or "there"
    
    welcomes = {
        "Jamal": f"Ready to accelerate your financial journey, {name}?",
        "Aisha": f"Let's balance your family's needs with your future, {name}!",
        "Samuel": f"Time to fine-tune your retirement plan, {name}!"
    }
    
    return welcomes.get(persona, f"Welcome to your financial Timeline, {name}!")