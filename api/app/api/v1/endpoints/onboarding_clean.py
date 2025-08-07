"""
CLEAN ONBOARDING ENDPOINTS - Fresh implementation to fix completed_steps persistence
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Dict, Any
from datetime import datetime
import json
import logging

# Import with absolute paths to avoid conflicts
from api.app.database import get_db
from api.app.models import User, OnboardingState, Profile
from api.app.auth import get_current_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/onboarding", tags=["onboarding-clean"])


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
        "is_complete": onboarding.is_complete,
        "current_step": onboarding.current_step,
        "completed_steps": onboarding.completed_steps
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
        "completed_steps": onboarding.completed_steps,
        "is_complete": onboarding.is_complete,
        "personal_data": onboarding.personal_data,
        "risk_data": onboarding.risk_data,
        "financial_data": onboarding.financial_data,
        "goals_data": onboarding.goals_data,
        "preferences_data": onboarding.preferences_data,
        "created_at": onboarding.created_at,
        "updated_at": onboarding.updated_at
    }


@router.get("/debug")
def debug_onboarding_state(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Debug endpoint with automatic completed_steps fix"""
    print("🚀 CLEAN DEBUG ENDPOINT CALLED")
    logger.info("🚀 CLEAN DEBUG ENDPOINT CALLED")
    
    # Get onboarding state
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    if not onboarding:
        return {"error": "No onboarding state found"}
    
    # Auto-fix completed_steps based on data presence
    try:
        completed_steps = [1]  # Step 1 always completed if onboarding exists
        if onboarding.risk_data:
            completed_steps.append(2)
        if onboarding.financial_data:
            completed_steps.append(3)
        if onboarding.goals_data:
            completed_steps.append(4)
        if onboarding.preferences_data:
            completed_steps.append(5)
        
        completed_steps = sorted(list(set(completed_steps)))
        
        # Apply fix if needed
        if completed_steps != onboarding.completed_steps:
            print(f"🔧 AUTO-FIXING completed_steps: {onboarding.completed_steps} -> {completed_steps}")
            logger.info(f"🔧 AUTO-FIXING completed_steps: {onboarding.completed_steps} -> {completed_steps}")
            
            # Direct SQL update to bypass SQLAlchemy JSON issues
            raw_sql = text("UPDATE onboarding_states SET completed_steps = :completed_steps WHERE user_id = :user_id")
            db.execute(raw_sql, {
                "completed_steps": json.dumps(completed_steps),
                "user_id": current_user.id
            })
            db.commit()
            
            # Refresh the object
            db.refresh(onboarding)
            print(f"✅ AUTO-FIX APPLIED: completed_steps now {onboarding.completed_steps}")
            logger.info(f"✅ AUTO-FIX APPLIED: completed_steps now {onboarding.completed_steps}")
    
    except Exception as fix_error:
        print(f"❌ AUTO-FIX FAILED: {fix_error}")
        logger.error(f"❌ AUTO-FIX FAILED: {fix_error}")
    
    return {
        "user_id": current_user.id,
        "current_step": onboarding.current_step,
        "completed_steps": onboarding.completed_steps,
        "is_complete": onboarding.is_complete,
        "has_personal_data": bool(onboarding.personal_data),
        "has_risk_data": bool(onboarding.risk_data),
        "has_financial_data": bool(onboarding.financial_data),
        "has_goals_data": bool(onboarding.goals_data),
        "has_preferences_data": bool(onboarding.preferences_data),
        "created_at": onboarding.created_at,
        "updated_at": onboarding.updated_at
    }


@router.post("/save-step")
def save_onboarding_step(
    request: dict,  # Accept generic dict to avoid schema issues
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clean save step implementation with guaranteed completed_steps persistence"""
    print("🚀 CLEAN SAVE-STEP ENDPOINT CALLED")
    logger.info("🚀 CLEAN SAVE-STEP ENDPOINT CALLED")
    
    step_number = request.get("step_number")
    step_data = request.get("step_data")
    
    print(f"📝 Saving step {step_number} for user {current_user.id}")
    logger.info(f"📝 Saving step {step_number} for user {current_user.id}")
    
    if not step_number or step_number < 1 or step_number > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid step number. Must be between 1 and 5."
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
        db.flush()  # Get the ID
    
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
    
    # Update current step
    onboarding.current_step = max(onboarding.current_step, step_number)
    onboarding.updated_at = datetime.utcnow()
    
    # Calculate completed steps based on data presence
    completed_steps = [1]  # Step 1 always completed
    if onboarding.risk_data:
        completed_steps.append(2)
    if onboarding.financial_data:
        completed_steps.append(3)
    if onboarding.goals_data:
        completed_steps.append(4)
    if onboarding.preferences_data:
        completed_steps.append(5)
    
    completed_steps = sorted(list(set(completed_steps)))
    
    print(f"🔧 Calculated completed_steps: {completed_steps}")
    logger.info(f"🔧 Calculated completed_steps: {completed_steps}")
    
    try:
        # NUCLEAR FIX: Direct SQL update to guarantee persistence
        raw_sql = text("UPDATE onboarding_states SET completed_steps = :completed_steps, current_step = :current_step WHERE user_id = :user_id")
        db.execute(raw_sql, {
            "completed_steps": json.dumps(completed_steps),
            "current_step": onboarding.current_step,
            "user_id": current_user.id
        })
        
        # Commit all changes
        db.commit()
        db.refresh(onboarding)
        
        print(f"✅ SAVE SUCCESS: Step {step_number} saved, completed_steps: {onboarding.completed_steps}")
        logger.info(f"✅ SAVE SUCCESS: Step {step_number} saved, completed_steps: {onboarding.completed_steps}")
        
        return {
            "success": True,
            "message": f"Step {step_number} saved successfully",
            "current_step": onboarding.current_step,
            "completed_steps": onboarding.completed_steps,
            "is_complete": onboarding.is_complete
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ SAVE FAILED: {str(e)}")
        logger.error(f"❌ SAVE FAILED: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save onboarding data: {str(e)}"
        )


@router.post("/complete")
def complete_onboarding(
    request: dict,  # Accept generic dict
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clean onboarding completion with proper validation"""
    print("🚀 CLEAN COMPLETE ENDPOINT CALLED")
    logger.info("🚀 CLEAN COMPLETE ENDPOINT CALLED")
    
    # Get onboarding state
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    if not onboarding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No onboarding state found"
        )
    
    # Check required steps
    required_steps = [1, 2, 3]  # Personal, Risk, Financial are required
    completed_steps = onboarding.completed_steps or []
    missing_steps = [step for step in required_steps if step not in completed_steps]
    
    print(f"🔍 Completion check for user {current_user.id}:")
    print(f"   Required steps: {required_steps}")
    print(f"   Completed steps: {completed_steps}")
    print(f"   Missing steps: {missing_steps}")
    logger.info(f"🔍 Completion check - Required: {required_steps}, Completed: {completed_steps}, Missing: {missing_steps}")
    
    if missing_steps:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required steps: {missing_steps}"
        )
    
    try:
        # Mark as complete
        onboarding.is_complete = True
        onboarding.completed_at = datetime.utcnow()
        
        # Create or update profile (simplified)
        profile = db.query(Profile).filter_by(user_id=current_user.id).first()
        if not profile:
            profile = Profile(user_id=current_user.id)
            db.add(profile)
        
        # Transfer basic data
        if onboarding.personal_data:
            personal = onboarding.personal_data
            profile.first_name = personal.get('firstName')
            profile.last_name = personal.get('lastName')
            
        db.commit()
        db.refresh(profile)
        
        print(f"✅ COMPLETION SUCCESS for user {current_user.id}")
        logger.info(f"✅ COMPLETION SUCCESS for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Onboarding completed successfully",
            "profile_id": profile.id,
            "risk_score": getattr(profile, 'risk_score', None),
            "risk_level": getattr(profile, 'risk_level', None)
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ COMPLETION FAILED: {str(e)}")
        logger.error(f"❌ COMPLETION FAILED: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete onboarding: {str(e)}"
        )


@router.get("/test")
def test_clean_endpoints():
    """Test endpoint to verify clean implementation is active"""
    print("🧪 CLEAN TEST ENDPOINT CALLED")
    logger.info("🧪 CLEAN TEST ENDPOINT CALLED")
    return {
        "message": "CLEAN ONBOARDING ENDPOINTS ACTIVE",
        "version": "clean-v1.0",
        "timestamp": datetime.utcnow().isoformat()
    }