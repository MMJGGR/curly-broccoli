from datetime import date
from typing import Optional

from fastapi import APIRouter, HTTPException, status, Request, Response
from fastapi.security import OAuth2PasswordBearer
import jwt

from .database import get_db
from .models import User, UserProfile
from .schemas import ProfileOut, Dependents
from .security import SECRET_KEY, ALGORITHM
from compute.risk_engine import compute_risk_score

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def calculate_age(dob: date) -> int:
    return (date.today() - dob).days // 365


def get_current_user(request: Request) -> User:
    token = oauth2_scheme(request)
    db = get_db()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user = db.query(User).get(payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user


@router.get("/profile", response_model=ProfileOut)
def read_profile(request: Request):
    current = get_current_user(request)
    if not current.profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return Response(ProfileOut.from_orm(current.profile).dict(), status_code=200)


@router.put("/profile", response_model=ProfileOut)
def update_profile(profile_in: ProfileOut, request: Request):
    current = get_current_user(request)
    db = get_db()
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
    return Response(ProfileOut.from_orm(profile).dict(), status_code=200)


@router.get("/dependents")
def get_dependents(request: Request):
    current = get_current_user(request)
    if not current.profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return {"dependents": current.profile.dependents}


@router.post("/dependents")
def set_dependents(data: Dependents, request: Request):
    current = get_current_user(request)
    db = get_db()
    profile = current.profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.dependents = data.dependents
    profile.risk_score = compute_risk_score(
        age=calculate_age(profile.dob),
        income=profile.annual_income,
        dependents=profile.dependents,
        goals=profile.goals,
        questionnaire={},
    )
    db.commit()
    db.refresh(profile)
    return {"dependents": profile.dependents}


@router.delete("/dependents")
def clear_dependents(request: Request):
    current = get_current_user(request)
    db = get_db()
    profile = current.profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    profile.dependents = 0
    profile.risk_score = compute_risk_score(
        age=calculate_age(profile.dob),
        income=profile.annual_income,
        dependents=profile.dependents,
        goals=profile.goals,
        questionnaire={},
    )
    db.commit()
    db.refresh(profile)
    return {"dependents": profile.dependents}
