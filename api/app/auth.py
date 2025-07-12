from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from .database import get_db
from .models import User, UserProfile
from .schemas import RegisterRequest, Token
from .security import hash_password, verify_password, create_access_token
from compute.risk_engine import compute_risk_score

router = APIRouter(prefix="/auth")


@router.post('/register', response_model=Token, status_code=201)
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter_by(email=data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")

    user = User(email=data.email, password_hash=hash_password(data.password))
    db.add(user)
    db.flush()  # obtain user.id before commit

    profile = UserProfile(
        user_id=user.id,
        full_name=data.full_name,
        date_of_birth=str(data.date_of_birth),
        id_type=data.id_type,
        id_number=data.id_number,
        kra_pin=data.kra_pin,
        marital_status=data.marital_status,
        employment_status=data.employment_status,
        monthly_income_kes=str(data.monthly_income_kes),
        net_worth_estimate=str(data.net_worth_estimate) if data.net_worth_estimate is not None else None,
        risk_tolerance_score=data.risk_tolerance_score,
        retirement_age_goal=data.retirement_age_goal,
        investment_goals=data.investment_goals,
    )

    # Compute risk score
    today = date.today()
    age = today.year - data.date_of_birth.year - ((today.month, today.day) < (data.date_of_birth.month, data.date_of_birth.day))
    profile.risk_score = compute_risk_score(
        age=age,
        income=float(data.monthly_income_kes),
        dependents=data.dependents or 0,
        goals=data.investment_goals,
        questionnaire=data.questionnaire or {},
    )

    db.add(profile)
    db.commit()
    db.refresh(user)

    token = create_access_token(str(user.id))
    return Token(access_token=token)


@router.post('/login', response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter_by(email=form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token(str(user.id))
    return Token(access_token=token)
