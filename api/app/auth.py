from datetime import date
from fastapi import APIRouter, HTTPException, status, Response
from fastapi.security import OAuth2PasswordRequestForm

from .database import get_db
from .models import User, UserProfile
from .schemas import RegisterRequest, Token
from .security import hash_password, verify_password, create_access_token
from compute.risk_engine import compute_risk_score

# simple age calculator
calculate_age = lambda dob: (date.today() - dob).days // 365

router = APIRouter(prefix="/auth")


@router.post("/register", response_model=Token, status_code=201)
def register(data: RegisterRequest):
    db = get_db()
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
    user = User(email=data.email, password_hash=hashed_pw)
    db.add(user)
    db.commit()
    db.refresh(user)

    # 4. Create Profile
    profile = UserProfile(
        user_id=user.id,
        dob=data.dob,
        kra_pin=data.kra_pin,
        annual_income=data.annual_income,
        dependents=data.dependents,
        goals=data.goals,
    )

    # Compute CFA-aligned risk score
    age = calculate_age(data.dob)
    income = data.annual_income
    dependents = data.dependents
    horizon = data.goals["timeHorizon"]

    profile.risk_score = compute_risk_score(
        age=age,
        income=income,
        dependents=dependents,
        time_horizon=horizon,
        questionnaire=data.questionnaire,
    )
    db.add(profile)
    db.commit()

    # 6. Return JWT token
    token = create_access_token(str(user.id))
    return Response(Token(access_token=token).dict(), status_code=201)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm):
    db = get_db()
    user = db.query(User).filter_by(email=form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    token = create_access_token(str(user.id))
    return Response(Token(access_token=token).dict(), status_code=200)
