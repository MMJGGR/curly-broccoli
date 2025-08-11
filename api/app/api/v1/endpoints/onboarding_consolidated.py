"""
Consolidated Onboarding API - Single Source of Truth
Replaces all fragmented onboarding endpoints with clean, tested logic
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.orm.attributes import flag_modified
from typing import Dict, Any
from datetime import datetime
import logging

from api.app.database import get_db
from api.app.models import User, OnboardingState, Profile
from api.app.auth import get_current_user
from api.app.services.profile_data_service import ProfileDataService, ProfileDataTransferError
from api.app.schemas.onboarding import (
    OnboardingStepRequest,
    OnboardingStateResponse,
    OnboardingCompleteRequest,
    OnboardingCompleteResponse
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/onboarding", tags=["onboarding-consolidated"])


@router.get("/state", response_model=OnboardingStateResponse)
def get_onboarding_state(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's onboarding state and progress"""
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
    
    return OnboardingStateResponse(
        current_step=onboarding.current_step,
        completed_steps=onboarding.completed_steps,
        is_complete=onboarding.is_complete,
        personal_data=onboarding.personal_data,
        risk_data=onboarding.risk_data,
        financial_data=onboarding.financial_data,
        goals_data=onboarding.goals_data,
        preferences_data=onboarding.preferences_data,
        created_at=onboarding.created_at,
        updated_at=onboarding.updated_at
    )

@router.post("/save-step")
def save_onboarding_step(
    request: OnboardingStepRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Save data for a specific onboarding step with proper validation"""
    
    # Validate step number
    if request.step_number < 1 or request.step_number > 5:
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
    
    try:
        # Validate and save step data
        step_data = request.step_data
        
        if request.step_number == 1:  # Personal Information
            _validate_personal_data(step_data)
            onboarding.personal_data = step_data
            
        elif request.step_number == 2:  # Risk Assessment
            _validate_risk_data(step_data)
            onboarding.risk_data = step_data
            
        elif request.step_number == 3:  # Financial Information
            _validate_financial_data(step_data)
            onboarding.financial_data = step_data
            
        elif request.step_number == 4:  # Goals
            _validate_goals_data(step_data)
            onboarding.goals_data = step_data
            
        elif request.step_number == 5:  # Preferences
            onboarding.preferences_data = step_data
        
        # Update progress tracking
        onboarding.current_step = max(onboarding.current_step, request.step_number)
        
        # Add to completed steps if not already there - FORCE UPDATE with direct SQL
        current_completed = onboarding.completed_steps or []
        print(f"🔍 FORCE FIX - Before update: {current_completed}")
        
        if request.step_number not in current_completed:
            current_completed.append(request.step_number)
            new_completed_steps = sorted(current_completed.copy())
            print(f"🔍 FORCE FIX - New list: {new_completed_steps}")
            
            # FORCE UPDATE: Use direct SQL to ensure the update happens
            from sqlalchemy import text
            db.execute(
                text("UPDATE onboarding_states SET completed_steps = :steps WHERE user_id = :user_id"),
                {"steps": str(new_completed_steps).replace("'", '"'), "user_id": current_user.id}
            )
            # Also update the object for consistency
            onboarding.completed_steps = new_completed_steps
            print(f"🔍 FORCE FIX - SQL executed, steps: {new_completed_steps}")
        else:
            print(f"🔍 FORCE FIX - Step {request.step_number} already completed")
        
        # Update timestamp
        onboarding.updated_at = datetime.utcnow()
        
        # Commit changes
        db.commit()
        db.refresh(onboarding)
        
        print(f"🔥🔥🔥 CONSOLIDATED ENDPOINT CALLED - Step {request.step_number} saved for user {current_user.id} 🔥🔥🔥")
        print(f"🔄 Updated completed_steps: {onboarding.completed_steps}")
        logger.info(f"🔥🔥🔥 CONSOLIDATED ENDPOINT CALLED - Successfully saved step {request.step_number} for user {current_user.id}")
        logger.info(f"🔄 Completed steps now: {onboarding.completed_steps}")
        
        return {
            "success": True,
            "message": f"Step {request.step_number} saved successfully",
            "current_step": onboarding.current_step,
            "completed_steps": onboarding.completed_steps,
            "is_complete": onboarding.is_complete
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to save step {request.step_number} for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save onboarding data: {str(e)}"
        )

@router.post("/complete", response_model=OnboardingCompleteResponse)
def complete_onboarding(
    request: OnboardingCompleteRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Complete onboarding using the consolidated ProfileDataService"""
    
    try:
        # Use the ProfileDataService for consolidated data transfer
        profile_service = ProfileDataService(db)
        
        # Transfer onboarding data to profile
        transfer_result = profile_service.transfer_onboarding_to_profile(
            user_id=current_user.id,
            force_overwrite=False
        )
        
        if not transfer_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=transfer_result.get("error", "Profile transfer failed")
            )
        
        profile_data = transfer_result["profile_data"]
        
        print(f"🔥🔥🔥 CONSOLIDATED COMPLETE ENDPOINT CALLED for user {current_user.id} 🔥🔥🔥")
        logger.info(f"🔥🔥🔥 CONSOLIDATED COMPLETE - Successfully completed onboarding for user {current_user.id}")
        
        return OnboardingCompleteResponse(
            success=True,
            message="Onboarding completed successfully"
        )
        
    except ProfileDataTransferError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Onboarding completion failed for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete onboarding: {str(e)}"
        )

@router.get("/validation-report")
def get_user_validation_report(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive validation report for current user's profile data"""
    
    try:
        profile_service = ProfileDataService(db)
        report = profile_service.get_profile_validation_report(current_user.id)
        return report
        
    except Exception as e:
        logger.error(f"Failed to generate validation report for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate validation report: {str(e)}"
        )

@router.post("/fix-profile-data")
def fix_profile_data(
    force_overwrite: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Fix/repair current user's profile data using consolidated service"""
    
    try:
        profile_service = ProfileDataService(db)
        
        # Transfer data with optional force overwrite
        transfer_result = profile_service.transfer_onboarding_to_profile(
            user_id=current_user.id,
            force_overwrite=force_overwrite
        )
        
        return {
            "success": transfer_result["success"],
            "message": transfer_result.get("message", "Profile data fix attempted"),
            "profile_data": transfer_result.get("profile_data"),
            "error": transfer_result.get("error")
        }
        
    except ProfileDataTransferError as e:
        return {
            "success": False,
            "error": str(e)
        }
    except Exception as e:
        logger.error(f"Profile data fix failed for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fix profile data: {str(e)}"
        )

@router.get("/status")
def get_onboarding_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get simple onboarding completion status"""
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    if not onboarding:
        return {"is_complete": False, "current_step": 1, "completed_steps": []}
    
    return {
        "is_complete": onboarding.is_complete,
        "current_step": onboarding.current_step,
        "completed_steps": onboarding.completed_steps
    }

@router.get("/profile-compatibility")
def get_profile_compatibility(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get onboarding data in profile-compatible format for legacy components"""
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    
    if not onboarding:
        return {
            "email": current_user.email,
            "profile": None,
            "risk_score": None,
            "risk_level": None
        }
    
    # Map onboarding data to profile format
    personal = onboarding.personal_data or {}
    financial = onboarding.financial_data or {}
    risk = onboarding.risk_data or {}
    
    # Calculate risk score from questionnaire
    risk_score = None
    risk_level = None
    if risk.get('questionnaire') and len(risk['questionnaire']) == 5:
        total = sum(risk['questionnaire'])
        risk_score = round((total / 20) * 100)
        if risk_score <= 25:
            risk_level = "Conservative"
        elif risk_score <= 50:
            risk_level = "Moderate"
        elif risk_score <= 75:
            risk_level = "Balanced"
        else:
            risk_level = "Aggressive"
    
    # Create profile-compatible structure
    profile_data = {
        "first_name": personal.get("firstName"),
        "last_name": personal.get("lastName"),
        "date_of_birth": personal.get("dateOfBirth"),
        "dob": personal.get("dateOfBirth"),  # Backward compatibility
        "nationalId": personal.get("nationalId"),
        "national_id": personal.get("nationalId"),
        "kra_pin": personal.get("kraPin"),
        "phone": personal.get("phone"),
        "employment_status": personal.get("employmentStatus"),
        "dependents": personal.get("dependents"),
        "monthly_income": float(financial.get("monthlyIncome", 0)) if financial.get("monthlyIncome") else 0,
        "annual_income": float(financial.get("monthlyIncome", 0)) * 12 if financial.get("monthlyIncome") else 0,
        "monthly_expenses": (
            (float(financial.get("rent", 0)) or 0) +
            (float(financial.get("utilities", 0)) or 0) +
            (float(financial.get("groceries", 0)) or 0) +
            (float(financial.get("transport", 0)) or 0) +
            (float(financial.get("loanRepayments", 0)) or 0)
        ),
        "monthly_debt_payments": float(financial.get("loanRepayments", 0)) if financial.get("loanRepayments") else 0,
        "questionnaire": risk.get('questionnaire', []),
    }
    
    return {
        "email": current_user.email,
        "profile": profile_data,
        "risk_score": risk_score,
        "risk_level": risk_level
    }

# Validation functions

def _validate_personal_data(data: Dict[str, Any]):
    """Validate personal information step data"""
    required_fields = ['firstName', 'lastName', 'dateOfBirth', 'phone']
    for field in required_fields:
        if not data.get(field):
            raise ValueError(f"Missing required field: {field}")
    
    # Validate date format
    dob = data.get('dateOfBirth')
    if dob:
        try:
            datetime.strptime(dob, '%Y-%m-%d')
        except ValueError:
            raise ValueError(f"Invalid date format for dateOfBirth: {dob}. Expected YYYY-MM-DD")

def _validate_risk_data(data: Dict[str, Any]):
    """Validate risk assessment step data"""
    questionnaire = data.get('questionnaire')
    if not questionnaire:
        raise ValueError("Missing questionnaire responses")
    
    if not isinstance(questionnaire, list) or len(questionnaire) != 5:
        raise ValueError("Questionnaire must have exactly 5 responses")
    
    for i, response in enumerate(questionnaire):
        if not isinstance(response, (int, float)) or not (1 <= response <= 5):
            raise ValueError(f"Invalid questionnaire response at position {i}: {response}. Must be 1-5")

def _validate_financial_data(data: Dict[str, Any]):
    """Validate financial information step data"""
    monthly_income = data.get('monthlyIncome')
    if not monthly_income:
        raise ValueError("Monthly income is required")
    
    try:
        income_val = float(monthly_income)
        if income_val <= 0:
            raise ValueError("Monthly income must be greater than 0")
    except (ValueError, TypeError):
        raise ValueError(f"Invalid monthly income value: {monthly_income}")

def _validate_goals_data(data: Dict[str, Any]):
    """Validate goals step data"""
    # Goals are mostly optional, but validate format if provided
    retirement_age = data.get('retirementAge')
    if retirement_age:
        try:
            age_val = int(retirement_age)
            if not (18 <= age_val <= 100):
                raise ValueError("Retirement age must be between 18 and 100")
        except (ValueError, TypeError):
            raise ValueError(f"Invalid retirement age: {retirement_age}")
    
    emergency_fund = data.get('emergencyFund')
    if emergency_fund:
        try:
            fund_val = float(emergency_fund)
            if fund_val < 0:
                raise ValueError("Emergency fund target cannot be negative")
        except (ValueError, TypeError):
            raise ValueError(f"Invalid emergency fund value: {emergency_fund}")