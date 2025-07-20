# File: api/app/auth.py

from datetime import date
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

from app.database import get_db
from app.models import User, Profile
from app.schemas import RegisterRequest, Token, RegisterResponse
from app.security import hash_password, verify_password, create_access_token
from compute.risk_engine import compute_risk_score, compute_risk_level
from app.utils import normalize_questionnaire

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
    user = User(email=data.email, hashed_password=hashed_pw, role=data.role)
    db.add(user)
    db.commit()
    db.refresh(user)

    # 4. Create Profile
    questionnaire = normalize_questionnaire(data.questionnaire)
    profile = Profile(
        user_id=user.id,
        date_of_birth=data.dob,
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
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    access_token = create_access_token(user)
    return {
        "access_token": access_token,
        "token_type":   "bearer",
    }
