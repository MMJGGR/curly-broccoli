# File: api/app/auth.py

from datetime import date
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models import User, Profile
from app.schemas import RegisterRequest, Token, RegisterResponse, ProfileUpdate, ProfileResponse
from app.security import hash_password, verify_password, create_access_token, get_current_user
from compute.risk_engine import compute_risk_score, compute_risk_level
from app.utils import normalize_questionnaire
import json

router = APIRouter(prefix="/auth", tags=["auth"])

# simple age calculator
def calculate_age(dob: date) -> int:
    return (date.today() - dob).days // 365


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
            "annual_income": profile.annual_income,
            "dependents": profile.dependents,
            "goals": profile.goals,
            "questionnaire": profile.questionnaire,
        },
        risk_score=profile.risk_score,
        risk_level=profile.risk_level
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
            "annual_income": profile.annual_income,
            "dependents": profile.dependents,
            "goals": profile.goals,
            "questionnaire": profile.questionnaire,
        },
        risk_score=profile.risk_score,
        risk_level=profile.risk_level
    )
