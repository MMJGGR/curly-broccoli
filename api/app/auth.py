# File: api/app/auth.py

from datetime import date
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models import User, Profile
from app.schemas import RegisterRequest, Token, RegisterResponse, ProfileUpdate, ProfileResponse, DeleteAccountRequest, DeleteAccountResponse, CreateAccountRequest, CreateAccountResponse, CompleteProfileRequest, CompleteProfileResponse
from app.security import hash_password, verify_password, create_access_token, get_current_user
from compute.risk_engine import compute_risk_score, compute_risk_level
from app.utils import normalize_questionnaire
import json

router = APIRouter(prefix="/auth", tags=["auth"])

# simple age calculator
def calculate_age(dob: date) -> int:
    return (date.today() - dob).days // 365


@router.post("/create-account", response_model=CreateAccountResponse, status_code=status.HTTP_201_CREATED)
def create_account(
    data: CreateAccountRequest,
    db: Session = Depends(get_db),
):
    """Create a basic user account - profile data will be collected during onboarding"""
    # Check if email already exists
    existing = db.query(User).filter_by(email=data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user with hashed password
    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        is_active=True
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create JWT token
    access_token = create_access_token(subject=str(user.id))
    
    return CreateAccountResponse(
        access_token=access_token,
        token_type="bearer"
    )


@router.post("/complete-profile", response_model=CompleteProfileResponse, status_code=status.HTTP_201_CREATED)
def complete_profile(
    profile_data: CompleteProfileRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Complete user profile with detailed onboarding data"""
    
    # Check if profile already exists
    existing_profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile already completed"
        )
    
    # Normalize questionnaire
    questionnaire = normalize_questionnaire(profile_data.questionnaire)
    
    # Calculate age for risk computation
    age = calculate_age(profile_data.date_of_birth)
    
    # Create profile
    profile = Profile(
        user_id=current_user.id,
        first_name=profile_data.first_name,
        last_name=profile_data.last_name,
        date_of_birth=profile_data.date_of_birth,
        nationalId=profile_data.nationalId,
        kra_pin=profile_data.kra_pin,
        annual_income=profile_data.annual_income,
        employment_status=profile_data.employment_status,
        dependents=profile_data.dependents,
        goals=profile_data.goals,
        questionnaire=questionnaire
    )
    
    # Calculate risk score and level
    risk_score = compute_risk_score(
        age=age,
        income=profile_data.annual_income,
        dependents=profile_data.dependents,
        time_horizon=profile_data.goals.get("timeHorizon", 1),
        questionnaire=questionnaire
    )
    profile.risk_score = risk_score
    profile.risk_level = compute_risk_level(risk_score)
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    
    return CompleteProfileResponse(
        risk_score=profile.risk_score,
        risk_level=profile.risk_level
    )


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
def register(
    data: RegisterRequest,
    db:   Session = Depends(get_db),
):
    # 1. Check if email already exists
    existing = db.query(User).filter_by(email=data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # 2. Hash the password
    hashed_pw = hash_password(data.password)

    # 3. Create User
    user = User(email=data.email, hashed_password=hashed_pw, role=data.user_type)
    db.add(user)
    db.commit()
    db.refresh(user)

    # 4. Create Profile with simplified data
    questionnaire = normalize_questionnaire(data.questionnaire)
    profile = Profile(
        user_id=user.id,
        first_name=data.first_name,
        last_name=data.last_name,
        date_of_birth=data.dob,
        nationalId=data.nationalId,
        kra_pin=data.kra_pin,
        annual_income=data.annual_income,
        employment_status=data.employment_status,
        dependents=data.dependents,
        goals=data.goals,
        questionnaire=questionnaire,
    )

    # 5. Compute CFA-aligned risk score
    age   = calculate_age(data.dob)
    score = compute_risk_score(
        age=age,
        income=data.annual_income,
        dependents=data.dependents,
        time_horizon=data.goals.get("timeHorizon", 0),
        questionnaire=questionnaire,
    )
    profile.risk_score = score
    profile.risk_level = compute_risk_level(score)

    db.add(profile)
    db.commit()
    db.refresh(profile)

    # 6. Issue JWT
    access_token = create_access_token(user)
    return {
        "access_token": access_token,
        "token_type":   "bearer",
        "risk_score":  profile.risk_score,
        "risk_level":  profile.risk_level,
    }


@router.post("/login", response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db:        Session                = Depends(get_db),
):
    user = db.query(User).filter_by(email=form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = create_access_token(user)
    return {
        "access_token": access_token,
        "token_type":   "bearer",
    }


@router.get("/me", response_model=ProfileResponse)
def get_current_user_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's profile information"""
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    return ProfileResponse(
        email=current_user.email,
        profile={
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "dob": profile.date_of_birth,
            "nationalId": profile.nationalId,
            "kra_pin": profile.kra_pin,
            "phone": profile.phone,
            "annual_income": profile.annual_income,
            "employment_status": profile.employment_status,
            "dependents": profile.dependents,
            "goals": profile.goals,
            "questionnaire": profile.questionnaire,
            # Advisor-specific fields
            "firm_name": profile.firm_name,
            "license_number": profile.license_number,
            "professional_email": profile.professional_email,
            "service_model": profile.service_model,
            "target_client_type": profile.target_client_type,
            "minimum_aum": profile.minimum_aum,
        },
        risk_score=profile.risk_score,
        risk_level=profile.risk_level
    )


@router.delete("/delete-account", response_model=DeleteAccountResponse)
def delete_account(
    request: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete current user's account permanently"""
    
    # Verify password before deletion
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    
    try:
        # Delete user's profile first (due to foreign key constraint)
        profile = db.query(Profile).filter_by(user_id=current_user.id).first()
        if profile:
            db.delete(profile)
        
        # Delete the user
        db.delete(current_user)
        db.commit()
        
        return DeleteAccountResponse(message="Account deleted successfully")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )


@router.put("/profile", response_model=ProfileResponse)
def update_user_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update current user's profile information"""
    profile = db.query(Profile).filter_by(user_id=current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Update only provided fields
    update_data = profile_data.dict(exclude_unset=True)
    
    for field, value in update_data.items():
        if hasattr(profile, field):
            setattr(profile, field, value)
    
    # Recalculate risk score if relevant fields changed
    if any(field in update_data for field in ['annual_income', 'dependents', 'questionnaire', 'date_of_birth']):
        if profile.questionnaire and profile_data.questionnaire:
            questionnaire = normalize_questionnaire(profile_data.questionnaire)
            profile.questionnaire = questionnaire
        
        age = calculate_age(profile.date_of_birth)
        goals = profile.goals or {}
        score = compute_risk_score(
            age=age,
            income=profile.annual_income,
            dependents=profile.dependents,
            time_horizon=goals.get("timeHorizon", 0),
            questionnaire=profile.questionnaire or [3, 3, 3, 3, 3],
        )
        profile.risk_score = score
        profile.risk_level = compute_risk_level(score)
    
    db.commit()
    db.refresh(profile)
    
    return ProfileResponse(
        email=current_user.email,
        profile={
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "dob": profile.date_of_birth,
            "nationalId": profile.nationalId,
            "kra_pin": profile.kra_pin,
            "phone": profile.phone,
            "annual_income": profile.annual_income,
            "employment_status": profile.employment_status,
            "dependents": profile.dependents,
            "goals": profile.goals,
            "questionnaire": profile.questionnaire,
            # Advisor-specific fields
            "firm_name": profile.firm_name,
            "license_number": profile.license_number,
            "professional_email": profile.professional_email,
            "service_model": profile.service_model,
            "target_client_type": profile.target_client_type,
            "minimum_aum": profile.minimum_aum,
        },
        risk_score=profile.risk_score,
        risk_level=profile.risk_level
    )


@router.delete("/delete-account", response_model=DeleteAccountResponse)
def delete_account(
    request: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete current user's account permanently"""
    
    # Verify password before deletion
    if not verify_password(request.password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect password"
        )
    
    try:
        # Delete user's profile first (due to foreign key constraint)
        profile = db.query(Profile).filter_by(user_id=current_user.id).first()
        if profile:
            db.delete(profile)
        
        # Delete the user
        db.delete(current_user)
        db.commit()
        
        return DeleteAccountResponse(message="Account deleted successfully")
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account"
        )
