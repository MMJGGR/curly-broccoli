# File: api/app/profile.py

from datetime import date
from typing import List

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import jwt
from api.app.core.exceptions import UnprocessableEntityException

from app.database     import get_db
from api.app.models.__init__ import User, Profile
from app.schemas import ProfileOut, Dependents
from app.security     import SECRET_KEY, ALGORITHM
from compute.risk_engine import compute_risk_score, compute_risk_level
from app.utils import normalize_questionnaire

router = APIRouter(tags=["profile"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def calculate_age(dob: date) -> int:
    return (date.today() - dob).days // 365


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db),
) -> User:
    """Decode JWT and return the User, or 401."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user = db.query(User).get(payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user


@router.get("/profile")
def read_profile(
    current: User = Depends(get_current_user),
):
    if not current.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    profile = current.profile
    questionnaire = normalize_questionnaire(profile.questionnaire or [3] * 8)
    score = compute_risk_score(
        age=calculate_age(profile.date_of_birth),
        income=profile.annual_income,
        dependents=profile.dependents,
        time_horizon=profile.goals.get("timeHorizon", 0),
        questionnaire=questionnaire,
    )
    level = compute_risk_level(score)
    data = ProfileOut.from_orm(profile).dict()
    data.update({"risk_score": score, "risk_level": level})
    return data


@router.put("/profile")
def update_profile(
    profile_in: ProfileOut,
    db:         Session = Depends(get_db),
    current:    User    = Depends(get_current_user),
):
    profile = current.profile
    if not profile:
        profile = Profile(user_id=current.id)
        db.add(profile)

    for field, value in profile_in.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    if profile_in.dependents is not None and profile_in.dependents < 0:
        raise UnprocessableEntityException("dependents must be non-negative")

    # Compute risk based on updated fields
    questionnaire = profile_in.dict().get("questionnaire")
    if questionnaire is None:
        questionnaire = profile.questionnaire or [3] * 8
    questionnaire = normalize_questionnaire(questionnaire)
    profile.risk_score = compute_risk_score(
        age         = calculate_age(profile.date_of_birth),
        income      = profile.annual_income,
        dependents  = profile.dependents,
        time_horizon= profile.goals.get("timeHorizon", 0),
        questionnaire= questionnaire,
    )
    profile.risk_level = compute_risk_level(profile.risk_score)

    db.commit()
    db.refresh(profile)
    data = ProfileOut.from_orm(profile).dict()
    data.update({
        "risk_score": profile.risk_score,
        "risk_level": profile.risk_level,
    })
    return data


@router.get("/dependents", response_model=Dependents)
def get_dependents(
    current: User = Depends(get_current_user),
):
    if not current.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")
    return {"dependents": current.profile.dependents}


@router.post("/dependents", response_model=Dependents)
def set_dependents(
    data:    Dependents,
    db:      Session = Depends(get_db),
    current: User    = Depends(get_current_user),
):
    if not current.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    profile = current.profile
    profile.dependents = data.dependents
    questionnaire = normalize_questionnaire(profile.questionnaire or [3] * 8)
    profile.risk_score = compute_risk_score(
        age         = calculate_age(profile.date_of_birth),
        income      = profile.annual_income,
        dependents  = profile.dependents,
        time_horizon= profile.goals.get("timeHorizon", 0),
        questionnaire= questionnaire,
    )
    profile.risk_level = compute_risk_level(profile.risk_score)

    db.commit()
    db.refresh(profile)
    return {"dependents": profile.dependents}


@router.delete("/dependents", response_model=Dependents)
def clear_dependents(
    db:      Session = Depends(get_db),
    current: User    = Depends(get_current_user),
):
    if not current.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    profile = current.profile
    profile.dependents = 0
    questionnaire = normalize_questionnaire(profile.questionnaire or [3] * 8)
    profile.risk_score = compute_risk_score(
        age         = calculate_age(profile.date_of_birth),
        income      = profile.annual_income,
        dependents  = profile.dependents,
        time_horizon= profile.goals.get("timeHorizon", 0),
        questionnaire= questionnaire,
    )
    profile.risk_level = compute_risk_level(profile.risk_score)

    db.commit()
    db.refresh(profile)
    return {"dependents": profile.dependents}
