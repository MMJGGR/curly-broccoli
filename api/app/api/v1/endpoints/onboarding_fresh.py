"""
Fresh Onboarding Endpoints - Clean implementation rebuilt from scratch
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime

from api.app.database import get_db
from api.app.models import User, OnboardingState
from api.app.auth import get_current_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("/status")
def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get simple onboarding completion status"""
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    if not onboarding:
        return {"is_complete": False, "current_step": 1}
    
    return {
        "is_complete": onboarding.is_complete or False,
        "current_step": onboarding.current_step or 1,
        "completed_steps": onboarding.completed_steps or []
    }


@router.get("/state")
def get_onboarding_state(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get detailed onboarding state and progress"""
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    if not onboarding:
        # Create new onboarding state for user
        onboarding = OnboardingState(
            user_id=current_user.id,
            current_step=1,
            completed_steps=[],
            is_complete=False
        )
        db.add(onboarding)
        db.commit()
        db.refresh(onboarding)
    
    return {
        "current_step": onboarding.current_step,
        "completed_steps": onboarding.completed_steps or [],
        "is_complete": onboarding.is_complete or False,
        "personal_data": onboarding.personal_data,
        "risk_data": onboarding.risk_data,
        "financial_data": onboarding.financial_data,
        "goals_data": onboarding.goals_data,
        "preferences_data": onboarding.preferences_data,
        "created_at": onboarding.created_at,
        "updated_at": onboarding.updated_at
    }


@router.post("/save-step")
def save_onboarding_step(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save data for a specific onboarding step"""
    step_number = request.get("step_number")
    step_data = request.get("step_data")
    
    if not step_number or not step_data:
        raise HTTPException(
            status_code=400,
            detail="Both step_number and step_data are required"
        )
    
    # Get or create onboarding state
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    if not onboarding:
        onboarding = OnboardingState(
            user_id=current_user.id,
            current_step=1,
            completed_steps=[],
            is_complete=False
        )
        db.add(onboarding)
    
    # Save step data
    if step_number == 1:
        onboarding.personal_data = step_data
    elif step_number == 2:
        onboarding.risk_data = step_data
    elif step_number == 3:
        onboarding.financial_data = step_data
    elif step_number == 4:
        onboarding.goals_data = step_data
    elif step_number == 5:
        onboarding.preferences_data = step_data
    else:
        raise HTTPException(status_code=400, detail="Invalid step number")
    
    # Update progress
    onboarding.current_step = max(onboarding.current_step or 1, step_number)
    
    # Update completed steps
    completed_steps = onboarding.completed_steps or []
    if step_number not in completed_steps:
        completed_steps.append(step_number)
        onboarding.completed_steps = sorted(completed_steps)
    
    # Update timestamp
    onboarding.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(onboarding)
        
        return {
            "success": True,
            "message": f"Step {step_number} saved successfully",
            "current_step": onboarding.current_step,
            "completed_steps": onboarding.completed_steps,
            "is_complete": onboarding.is_complete
        }
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to save step: {str(e)}")


@router.post("/complete")
def complete_onboarding(
    request: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark onboarding as complete"""
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    if not onboarding:
        raise HTTPException(status_code=404, detail="No onboarding state found")
    
    # Mark as complete
    onboarding.is_complete = True
    onboarding.completed_at = datetime.utcnow()
    onboarding.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        return {
            "success": True,
            "message": "Onboarding completed successfully",
            "profile_id": 1,  # Placeholder
            "risk_score": None,
            "risk_level": None
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Failed to complete onboarding: {str(e)}")