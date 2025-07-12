from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt

from .database import get_db
from .models import User, UserProfile
from .schemas import ProfileOut
from .security import SECRET_KEY, ALGORITHM
from compute.risk_engine import compute_risk_score

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def calculate_age(dob: date) -> int:
    return (date.today() - dob).days // 365


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user = db.query(User).get(payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user


@router.get("/profile", response_model=ProfileOut)
def read_profile(current: User = Depends(get_current_user)):
    if not current.profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfileOut.from_orm(current.profile)


@router.put("/profile", response_model=ProfileOut)
def update_profile(profile_in: ProfileOut, current: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = current.profile
    if not profile:
        profile = UserProfile(user_id=current.id)
        db.add(profile)
    for field, value in profile_in.dict(exclude_unset=True).items():
        setattr(profile, field, value)
    profile.risk_score = compute_risk_score(
        age=calculate_age(profile.dob),
        income=profile.annual_income,
        dependents=profile.dependents,
        goals=profile.goals,
        questionnaire=profile_in.dict().get("questionnaire", {}),
    )
    db.commit()
    db.refresh(profile)
    return ProfileOut.from_orm(profile)
