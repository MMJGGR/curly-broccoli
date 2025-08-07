"""
New Onboarding API Endpoints - Built from scratch for bulletproof data persistence
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

from api.app.database import get_db
from api.app.models import User, OnboardingState, Profile
from api.app.auth import get_current_user
from api.app.utils.risk_calculation import calculate_risk_score, get_risk_level_string, get_risk_level_numeric
from api.app.utils.onboarding_debug import OnboardingDebugger, log_onboarding_save_attempt
from api.app.schemas.onboarding import (
    OnboardingStepRequest,
    OnboardingStateResponse,
    OnboardingCompleteRequest,
    OnboardingCompleteResponse
)

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


@router.get("/debug")
def debug_onboarding_state(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Enhanced debug endpoint with comprehensive onboarding analysis AND EMERGENCY FIX"""
    print("🔍 DEBUG ENDPOINT CALLED - NEW VERSION ACTIVE")
    
    # EMERGENCY FIX: Apply completed_steps fix directly in debug endpoint
    try:
        from sqlalchemy import text
        import json
        
        # Get current onboarding state
        onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
        if onboarding:
            # Determine which steps should be completed based on data presence
            completed_steps = [1]  # Step 1 is always completed
            if onboarding.risk_data:
                completed_steps.append(2)
            if onboarding.financial_data:
                completed_steps.append(3)
            if onboarding.goals_data:
                completed_steps.append(4)
            if onboarding.preferences_data:
                completed_steps.append(5)
            
            completed_steps = sorted(list(set(completed_steps)))
            
            # Apply emergency fix using raw SQL
            if completed_steps != onboarding.completed_steps:
                print(f"🚨 APPLYING EMERGENCY FIX: {onboarding.completed_steps} -> {completed_steps}")
                raw_sql = text("UPDATE onboarding_states SET completed_steps = :completed_steps WHERE user_id = :user_id")
                db.execute(raw_sql, {
                    "completed_steps": json.dumps(completed_steps),
                    "user_id": current_user.id
                })
                db.commit()
                print(f"🛠️ EMERGENCY FIX APPLIED: completed_steps updated to {completed_steps}")
    
    except Exception as fix_error:
        print(f"❌ EMERGENCY FIX FAILED: {fix_error}")
    
    debugger = OnboardingDebugger(db)
    return debugger.get_detailed_state(current_user.id)

@router.get("/test-nuclear")
def test_nuclear_version():
    """Test endpoint to verify nuclear version is active"""
    print("🚨 NUCLEAR VERSION TEST ENDPOINT CALLED 🚨")
    return {"message": "NUCLEAR VERSION ACTIVE", "version": "nuclear-v1.0"}

@router.post("/emergency-fix-completed-steps")
def emergency_fix_completed_steps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Emergency endpoint to fix completed_steps array using direct SQL"""
    print("🚨 EMERGENCY FIX CALLED 🚨")
    
    from sqlalchemy import text
    import json
    
    # Get current onboarding state
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    if not onboarding:
        return {"error": "No onboarding state found"}
    
    # Determine which steps should be completed based on data presence
    completed_steps = [1]  # Step 1 is always completed if onboarding exists
    
    if onboarding.risk_data:
        completed_steps.append(2)
    if onboarding.financial_data:
        completed_steps.append(3)
    if onboarding.goals_data:
        completed_steps.append(4)
    if onboarding.preferences_data:
        completed_steps.append(5)
    
    # Remove duplicates and sort
    completed_steps = sorted(list(set(completed_steps)))
    
    try:
        # Direct SQL update
        raw_sql = text("UPDATE onboarding_states SET completed_steps = :completed_steps WHERE user_id = :user_id")
        db.execute(raw_sql, {
            "completed_steps": json.dumps(completed_steps),
            "user_id": current_user.id
        })
        db.commit()
        
        print(f"🛠️ EMERGENCY FIX: Updated completed_steps to {completed_steps} for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Emergency fix applied",
            "old_completed_steps": onboarding.completed_steps,
            "new_completed_steps": completed_steps,
            "data_check": {
                "personal_data": bool(onboarding.personal_data),
                "risk_data": bool(onboarding.risk_data),
                "financial_data": bool(onboarding.financial_data),
                "goals_data": bool(onboarding.goals_data),
                "preferences_data": bool(onboarding.preferences_data)
            }
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ EMERGENCY FIX FAILED: {str(e)}")
        return {"error": f"Emergency fix failed: {str(e)}"}


@router.post("/debug/fix-completed-steps")
def fix_completed_steps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Emergency endpoint to fix corrupted completed_steps array"""
    debugger = OnboardingDebugger(db)
    return debugger.fix_corrupted_completed_steps(current_user.id)


@router.post("/debug/reset-state")
def reset_onboarding_state(
    keep_data: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Reset onboarding state for debugging purposes"""
    debugger = OnboardingDebugger(db)
    return debugger.reset_onboarding_state(current_user.id, keep_data)


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
    """Save data for a specific onboarding step with auto-save functionality - NUCLEAR VERSION ACTIVE"""
    print("🚨🚨🚨 NUCLEAR VERSION RUNNING - SAVE STEP CALLED 🚨🚨🚨")
    import logging
    logger = logging.getLogger(__name__)
    logger.critical("🚨🚨🚨 NUCLEAR VERSION RUNNING - SAVE STEP CALLED 🚨🚨🚨")
    
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
    
    # Validate step number
    if request.step_number < 1 or request.step_number > 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid step number. Must be between 1 and 5."
        )
    
    # Save step data to appropriate field
    step_data = request.step_data
    
    if request.step_number == 1:  # Personal Information
        # Validate required fields for personal info
        required_fields = ['firstName', 'lastName', 'dateOfBirth', 'phone']
        for field in required_fields:
            if not step_data.get(field):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Missing required field: {field}"
                )
        onboarding.personal_data = step_data
        
    elif request.step_number == 2:  # Risk Assessment
        # Validate questionnaire responses
        if not step_data.get('questionnaire') or len(step_data['questionnaire']) != 5:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Questionnaire must have exactly 5 responses"
            )
        onboarding.risk_data = step_data
        
    elif request.step_number == 3:  # Financial Information
        # Validate financial data
        if not step_data.get('monthlyIncome'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monthly income is required"
            )
        onboarding.financial_data = step_data
        
    elif request.step_number == 4:  # Goals
        onboarding.goals_data = step_data
        
    elif request.step_number == 5:  # Preferences
        onboarding.preferences_data = step_data
    
    # Update progress tracking
    onboarding.current_step = max(onboarding.current_step, request.step_number)
    
    # Add to completed steps if not already there
    # NUCLEAR FIX: Use flag_modified to force SQLAlchemy change detection
    from sqlalchemy.orm.attributes import flag_modified
    
    completed_steps_before = onboarding.completed_steps or []
    if not isinstance(completed_steps_before, list):
        completed_steps_before = []
    
    current_completed = list(completed_steps_before)  # Force new list creation
        
    import logging
    logger = logging.getLogger(__name__)
    
    print(f"🔧 Before update - Step {request.step_number}")
    logger.info(f"🔧 Before update - Step {request.step_number}")
    print(f"   Current completed_steps: {current_completed}")
    logger.info(f"   Current completed_steps: {current_completed}")
    print(f"   Adding step {request.step_number}? {request.step_number not in current_completed}")
    logger.info(f"   Adding step {request.step_number}? {request.step_number not in current_completed}")
    
    if request.step_number not in current_completed:
        current_completed.append(request.step_number)
        print(f"🔧 Added step {request.step_number}, new completed_steps: {current_completed}")
        logger.info(f"🔧 Added step {request.step_number}, new completed_steps: {current_completed}")
    else:
        print(f"🔧 Step {request.step_number} already in completed_steps")
        logger.info(f"🔧 Step {request.step_number} already in completed_steps")
    
    # ULTIMATE FIX: Update database directly with raw SQL to bypass SQLAlchemy issues
    from sqlalchemy import text
    
    # SQLAlchemy approach (might not work due to JSON change detection)
    onboarding.completed_steps = current_completed.copy()
    flag_modified(onboarding, 'completed_steps')
    
    # RAW SQL FALLBACK: Direct database update to guarantee persistence
    try:
        # Update the database directly using raw SQL
        raw_sql = text("UPDATE onboarding_states SET completed_steps = :completed_steps WHERE user_id = :user_id")
        db.execute(raw_sql, {
            "completed_steps": json.dumps(current_completed),
            "user_id": current_user.id
        })
        print(f"🛠️ RAW SQL UPDATE executed for user {current_user.id}, steps: {current_completed}")
        logger.info(f"🛠️ RAW SQL UPDATE executed for user {current_user.id}, steps: {current_completed}")
    except Exception as sql_error:
        print(f"❌ RAW SQL UPDATE failed: {sql_error}")
        logger.error(f"❌ RAW SQL UPDATE failed: {sql_error}")
    
    # Update timestamp
    onboarding.updated_at = datetime.utcnow()
    
    # Mark as complete if all steps are done
    if len(onboarding.completed_steps) >= 4:  # Steps 1-4 are required, 5 is optional
        onboarding.is_complete = True
        onboarding.completed_at = datetime.utcnow()
    
    try:
        # CRITICAL FIX: Force flush to ensure database persistence before commit
        db.flush()
        db.commit()
        db.refresh(onboarding)
        
        # Verify the data was actually saved
        print(f"🔍 After commit verification:")
        logger.info(f"🔍 After commit verification:")
        print(f"   Database completed_steps: {onboarding.completed_steps}")
        logger.info(f"   Database completed_steps: {onboarding.completed_steps}")
        print(f"   Database current_step: {onboarding.current_step}")
        logger.info(f"   Database current_step: {onboarding.current_step}")
        print(f"   Database is_complete: {onboarding.is_complete}")
        logger.info(f"   Database is_complete: {onboarding.is_complete}")
        
        # Log the save attempt for debugging
        log_onboarding_save_attempt(
            user_id=current_user.id,
            step_number=request.step_number,
            step_data=request.step_data,
            completed_steps_before=completed_steps_before,
            completed_steps_after=onboarding.completed_steps,
            success=True
        )
        
        return {
            "success": True,
            "message": f"Step {request.step_number} saved successfully",
            "current_step": onboarding.current_step,
            "completed_steps": onboarding.completed_steps,
            "is_complete": onboarding.is_complete
        }
        
    except Exception as e:
        db.rollback()
        print(f"❌ Database save failed for step {request.step_number}: {str(e)}")
        
        # Log the failed save attempt
        log_onboarding_save_attempt(
            user_id=current_user.id,
            step_number=request.step_number,
            step_data=request.step_data,
            completed_steps_before=completed_steps_before,
            completed_steps_after=[],
            success=False,
            error=str(e)
        )
        
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
    """Complete onboarding and transfer all data to user profile"""
    
    # Get onboarding state
    onboarding = db.query(OnboardingState).filter_by(user_id=current_user.id).first()
    if not onboarding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No onboarding state found"
        )
    
    # Check if minimum required steps are completed
    required_steps = [1, 2, 3]  # Personal, Risk, Financial
    completed_steps = onboarding.completed_steps or []
    missing_steps = [step for step in required_steps if step not in completed_steps]
    
    # Debug logging
    print(f"🔍 Completion check for user {current_user.id}:")
    print(f"   Required steps: {required_steps}")
    print(f"   Completed steps: {completed_steps}")
    print(f"   Missing steps: {missing_steps}")
    print(f"   Onboarding data check:")
    print(f"     - Personal data: {'✅' if onboarding.personal_data else '❌'}")
    print(f"     - Risk data: {'✅' if onboarding.risk_data else '❌'}")
    print(f"     - Financial data: {'✅' if onboarding.financial_data else '❌'}")
    
    if missing_steps:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Missing required steps: {missing_steps}"
        )
    
    try:
        # Get or create user profile
        profile = db.query(Profile).filter_by(user_id=current_user.id).first()
        if not profile:
            profile = Profile(user_id=current_user.id)
            db.add(profile)
        
        # Transfer personal data
        if onboarding.personal_data:
            personal = onboarding.personal_data
            profile.first_name = personal.get('firstName')
            profile.last_name = personal.get('lastName')
            profile.date_of_birth = datetime.strptime(personal.get('dateOfBirth'), '%Y-%m-%d').date()
            profile.phone = personal.get('phone')
            profile.nationalId = personal.get('nationalId')
            profile.kra_pin = personal.get('kraPin')
            profile.employment_status = personal.get('employmentStatus', 'Employed')
            profile.dependents = int(personal.get('dependents', 0))
        
        # Transfer risk data
        if onboarding.risk_data:
            risk = onboarding.risk_data
            profile.questionnaire = risk.get('questionnaire')
            # Calculate risk score from questionnaire
            questionnaire_values = risk.get('questionnaire', [3, 3, 3, 3, 3])
            risk_score = calculate_risk_score(questionnaire_values)
            profile.risk_score = risk_score
            profile.risk_level = get_risk_level_numeric(risk_score)
        
        # Transfer financial data
        if onboarding.financial_data:
            financial = onboarding.financial_data
            monthly_income = float(financial.get('monthlyIncome', 0))
            profile.annual_income = monthly_income * 12
            
            # Create expense categories from financial data
            create_expense_categories_from_data(db, current_user.id, financial)
        
        # Transfer goals data
        if onboarding.goals_data:
            profile.goals = onboarding.goals_data
        
        # Mark onboarding as complete
        onboarding.is_complete = True
        onboarding.completed_at = datetime.utcnow()
        
        # Commit all changes
        db.commit()
        db.refresh(profile)
        
        return OnboardingCompleteResponse(
            success=True,
            message="Onboarding completed successfully",
            profile_id=profile.id,
            risk_score=profile.risk_score,
            risk_level=profile.risk_level
        )
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete onboarding: {str(e)}"
        )


# Risk calculation functions moved to shared utility: ....utils.risk_calculation


def create_expense_categories_from_data(db: Session, user_id: int, financial_data: Dict[str, Any]):
    """Create expense categories from onboarding financial data"""
    from api.app.models import ExpenseCategory
    
    expense_mapping = {
        'rent': 'Rent/Mortgage',
        'utilities': 'Utilities',
        'groceries': 'Groceries',
        'transport': 'Transport',
        'loanRepayments': 'Loan Repayments'
    }
    
    for field_name, category_name in expense_mapping.items():
        amount = financial_data.get(field_name)
        if amount and float(amount) > 0:
            # Check if category already exists
            existing_category = db.query(ExpenseCategory).filter_by(
                user_id=user_id, 
                name=category_name
            ).first()
            
            if not existing_category:
                expense_category = ExpenseCategory(
                    user_id=user_id,
                    name=category_name,
                    budgeted_amount=float(amount)
                )
                db.add(expense_category)