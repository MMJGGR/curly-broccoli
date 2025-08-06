"""
CLEAN PROFILE ENDPOINTS - Timeline-focused profile management
Following the proven clean architecture pattern from onboarding
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
from datetime import datetime, date
import logging

# Import with absolute paths to avoid conflicts
from api.app.database import get_db
from api.app.models import User, Profile, OnboardingState
from api.app.auth import get_current_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["profile-clean"])


def calculate_age(birth_date: date) -> int:
    """Calculate age from date of birth"""
    today = date.today()
    return today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))


def detect_persona(profile: Profile) -> str:
    """Detect user persona based on profile data"""
    if not profile.date_of_birth:
        return "Unknown"
    
    age = calculate_age(profile.date_of_birth)
    dependents = profile.dependents or 0
    
    if age < 30 and dependents == 0:
        return "Jamal"  # Early-Career Accumulator
    elif 30 <= age < 50 and dependents > 0:
        return "Aisha"  # Family & Property Owner
    elif age >= 50:
        return "Samuel"  # Pre-Retirement Consolidation
    else:
        return "General"  # Fallback


@router.get("/timeline-data")
def get_profile_for_timeline(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get profile data formatted for Timeline visualization"""
    print("🚀 CLEAN PROFILE: Timeline data requested")
    logger.info("🚀 CLEAN PROFILE: Timeline data requested")
    
    # Get profile data
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Get onboarding data for additional context
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    # Calculate persona and age
    persona = detect_persona(profile)
    age = calculate_age(profile.date_of_birth) if profile.date_of_birth else None
    
    timeline_data = {
        "user_id": current_user.id,
        "persona": persona,
        "basic_info": {
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "email": current_user.email,
            "age": age,
            "employment_status": profile.employment_status,
            "dependents": profile.dependents
        },
        "financial_snapshot": {
            "annual_income": profile.annual_income,
            "risk_score": profile.risk_score,
            "risk_level": profile.risk_level,
            "has_goals": bool(profile.goals),
            "onboarding_complete": onboarding.is_complete if onboarding else False
        },
        "timeline_milestones": profile.goals if profile.goals else {},
        "persona_insights": get_persona_insights(persona, age),
        "completion_status": {
            "profile_complete": bool(profile.first_name and profile.last_name),
            "financial_complete": bool(profile.annual_income),
            "goals_complete": bool(profile.goals),
            "ready_for_timeline": bool(profile.goals and profile.annual_income)
        }
    }
    
    print(f"✅ CLEAN PROFILE: Timeline data returned for {persona} persona")
    logger.info(f"✅ CLEAN PROFILE: Timeline data returned for {persona} persona")
    
    return timeline_data


@router.get("/persona-insights")
def get_persona_specific_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get persona-specific insights and recommendations"""
    print("🚀 CLEAN PROFILE: Persona insights requested")
    logger.info("🚀 CLEAN PROFILE: Persona insights requested")
    
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    persona = detect_persona(profile)
    age = calculate_age(profile.date_of_birth) if profile.date_of_birth else None
    
    insights = {
        "persona": persona,
        "age": age,
        "insights": get_persona_insights(persona, age),
        "recommended_actions": get_persona_actions(persona, profile),
        "timeline_focus": get_timeline_focus(persona)
    }
    
    print(f"✅ CLEAN PROFILE: Persona insights returned for {persona}")
    logger.info(f"✅ CLEAN PROFILE: Persona insights returned for {persona}")
    
    return insights


@router.put("/timeline-impact")
def update_profile_with_timeline_impact(
    update_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile and calculate Timeline impact"""
    print("🚀 CLEAN PROFILE: Timeline impact update requested")
    logger.info("🚀 CLEAN PROFILE: Timeline impact update requested")
    
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Store original values for impact calculation
    original_income = profile.annual_income
    original_dependents = profile.dependents
    
    try:
        # Update profile fields
        for field, value in update_data.items():
            if hasattr(profile, field) and field != 'id':
                setattr(profile, field, value)
        
        # Calculate impact of changes
        impact_analysis = {
            "changes_made": update_data,
            "timeline_impact": calculate_timeline_impact(
                original_income, profile.annual_income,
                original_dependents, profile.dependents
            ),
            "new_persona": detect_persona(profile),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        db.commit()
        db.refresh(profile)
        
        print(f"✅ CLEAN PROFILE: Profile updated with impact analysis")
        logger.info(f"✅ CLEAN PROFILE: Profile updated with impact analysis")
        
        return {
            "success": True,
            "message": "Profile updated successfully",
            "impact_analysis": impact_analysis,
            "new_timeline_data": {
                "persona": detect_persona(profile),
                "annual_income": profile.annual_income,
                "risk_score": profile.risk_score
            }
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ CLEAN PROFILE: Update failed - {str(e)}")
        logger.error(f"❌ CLEAN PROFILE: Update failed - {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update profile: {str(e)}"
        )


@router.get("/dashboard-summary")
def get_profile_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get profile summary for dashboard display"""
    print("🚀 CLEAN PROFILE: Dashboard summary requested")
    logger.info("🚀 CLEAN PROFILE: Dashboard summary requested")
    
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    if not profile:
        return {
            "profile_exists": False,
            "needs_onboarding": True,
            "message": "Complete onboarding to see your profile"
        }
    
    persona = detect_persona(profile)
    age = calculate_age(profile.date_of_birth) if profile.date_of_birth else None
    
    summary = {
        "profile_exists": True,
        "user_info": {
            "name": f"{profile.first_name} {profile.last_name}",
            "persona": persona,
            "age": age
        },
        "financial_overview": {
            "annual_income": profile.annual_income,
            "risk_level": profile.risk_level,
            "goals_count": len(profile.goals) if profile.goals else 0
        },
        "onboarding_status": {
            "completed": onboarding.is_complete if onboarding else False,
            "completed_steps": onboarding.completed_steps if onboarding else []
        },
        "next_actions": get_next_actions(profile, onboarding),
        "persona_welcome": get_persona_welcome(persona, profile.first_name)
    }
    
    print(f"✅ CLEAN PROFILE: Dashboard summary returned for {persona}")
    logger.info(f"✅ CLEAN PROFILE: Dashboard summary returned for {persona}")
    
    return summary


@router.get("/test")
def test_clean_profile():
    """Test endpoint to verify clean profile implementation"""
    print("🧪 CLEAN PROFILE TEST ENDPOINT CALLED")
    logger.info("🧪 CLEAN PROFILE TEST ENDPOINT CALLED")
    return {
        "message": "CLEAN PROFILE ENDPOINTS ACTIVE",
        "version": "profile-clean-v1.0",
        "timestamp": datetime.utcnow().isoformat()
    }


# Helper functions
def get_persona_insights(persona: str, age: Optional[int]) -> Dict[str, Any]:
    """Get insights based on user persona"""
    insights = {
        "Jamal": {
            "focus": "Building your financial foundation",
            "priorities": ["Emergency fund", "Career growth", "First investments"],
            "timeline_span": "5-year focus",
            "key_advice": "Focus on building habits and emergency fund first"
        },
        "Aisha": {
            "focus": "Balancing family needs and long-term goals",
            "priorities": ["Children's education", "Family insurance", "Home ownership"],
            "timeline_span": "15-year focus",
            "key_advice": "Balance current family needs with future security"
        },
        "Samuel": {
            "focus": "Optimizing for retirement and legacy",
            "priorities": ["Retirement readiness", "Healthcare planning", "Legacy goals"],
            "timeline_span": "20-year focus",
            "key_advice": "Focus on wealth preservation and retirement optimization"
        }
    }
    return insights.get(persona, {
        "focus": "Customized financial planning",
        "priorities": ["Emergency fund", "Goal planning", "Investment growth"],
        "timeline_span": "10-year focus",
        "key_advice": "Build a solid financial foundation"
    })


def get_persona_actions(persona: str, profile: Profile) -> list:
    """Get recommended actions based on persona and profile completeness"""
    base_actions = []
    
    if not profile.annual_income:
        base_actions.append("Add your income information")
    if not profile.goals:
        base_actions.append("Set your first financial goal")
    
    persona_actions = {
        "Jamal": ["Set up emergency fund goal", "Create first investment milestone"],
        "Aisha": ["Plan children's education fund", "Review family insurance needs"],
        "Samuel": ["Check retirement readiness", "Plan healthcare costs"]
    }
    
    return base_actions + persona_actions.get(persona, ["Review financial goals"])


def get_timeline_focus(persona: str) -> Dict[str, str]:
    """Get Timeline focus areas for each persona"""
    return {
        "Jamal": "5-year career and foundation building",
        "Aisha": "15-year family milestone planning", 
        "Samuel": "20-year retirement optimization"
    }.get(persona, "10-year general planning")


def calculate_timeline_impact(old_income: Optional[float], new_income: Optional[float], 
                            old_dependents: Optional[int], new_dependents: Optional[int]) -> Dict[str, Any]:
    """Calculate how profile changes impact Timeline"""
    impact = {"changes": []}
    
    if old_income != new_income and new_income:
        income_change = ((new_income - (old_income or 0)) / (old_income or 1)) * 100
        impact["changes"].append({
            "type": "income_change",
            "impact": f"Income change of {income_change:.1f}% will {'accelerate' if income_change > 0 else 'delay'} goals",
            "timeline_effect": "Goals timeline will be recalculated"
        })
    
    if old_dependents != new_dependents:
        impact["changes"].append({
            "type": "dependents_change", 
            "impact": f"Dependents changed from {old_dependents or 0} to {new_dependents or 0}",
            "timeline_effect": "Family-related goals and insurance needs updated"
        })
    
    return impact


def get_next_actions(profile: Profile, onboarding: Optional[OnboardingState]) -> list:
    """Get personalized next actions for the user"""
    actions = []
    
    if not onboarding or not onboarding.is_complete:
        actions.append("Complete your onboarding to unlock full Timeline")
    elif not profile.goals:
        actions.append("Set your first financial goal")
    elif not profile.annual_income:
        actions.append("Add income information for better Timeline accuracy")
    else:
        persona = detect_persona(profile)
        persona_actions = {
            "Jamal": "Review your emergency fund progress",
            "Aisha": "Check family goal milestones", 
            "Samuel": "Assess retirement readiness"
        }
        actions.append(persona_actions.get(persona, "Review your Timeline"))
    
    return actions


def get_persona_welcome(persona: str, first_name: Optional[str]) -> str:
    """Get personalized welcome message"""
    name = first_name or "there"
    
    welcomes = {
        "Jamal": f"Welcome {name}! Ready to build your financial foundation?",
        "Aisha": f"Hi {name}! Let's balance family needs with your long-term goals.",
        "Samuel": f"Hello {name}! Time to optimize your path to retirement."
    }
    
    return welcomes.get(persona, f"Welcome {name}! Let's plan your financial journey.")