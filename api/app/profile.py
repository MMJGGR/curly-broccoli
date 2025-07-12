from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.security import OAuth2PasswordBearer
import jwt
from datetime import date

from .database import get_db
from .models import User, UserProfile, Dependent
from .schemas import (
    UserProfileCreate,
    UserProfileOut,
    DependentCreate,
    DependentOut,
    ProfileOut,
)
from .security import SECRET_KEY, ALGORITHM
from compute.risk_engine import compute_risk_score

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")
router = APIRouter()


def _recalculate_risk(user: User, db: Session) -> None:
    """Recompute and persist the user's risk score."""
    profile = user.profile
    if not profile:
        return
    today = date.today()
    age = today.year - int(profile.date_of_birth.split("-")[0]) - (
        (today.month, today.day)
        < tuple(int(x) for x in profile.date_of_birth.split("-")[1:])
    )
    profile.risk_score = compute_risk_score(
        age=age,
        income=float(profile.monthly_income_kes),
        dependents=len(user.dependents),
        goals=profile.investment_goals,
        questionnaire={},
    )
    db.commit()
    db.refresh(profile)


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    user = db.query(User).get(payload["sub"])
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    return user


@router.get("/profile", response_model=ProfileOut)
def read_profile(
    current: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    profile = current.profile
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    deps = [DependentOut.from_orm(d) for d in current.dependents]
    data = ProfileOut.from_orm(profile).dict()
    data["dependents"] = deps
    return data


@router.put("/profile", response_model=ProfileOut)
def update_profile(
    profile_in: UserProfileCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = current.profile
    if not profile:
        profile = UserProfile(user_id=current.id)
        db.add(profile)
    for field, value in profile_in.dict().items():
        setattr(profile, field, value)
    db.commit()
    _recalculate_risk(current, db)
    deps = [DependentOut.from_orm(d) for d in current.dependents]
    data = ProfileOut.from_orm(profile).dict()
    data["dependents"] = deps
    return data


@router.get("/dependents", response_model=List[DependentOut])
def list_dependents(current: User = Depends(get_current_user)):
    return [DependentOut.from_orm(d) for d in current.dependents]


@router.post("/dependents", response_model=DependentOut, status_code=201)
def add_dependent(
    dep_in: DependentCreate,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dep = Dependent(user_id=current.id, **dep_in.dict())
    db.add(dep)
    db.commit()
    db.refresh(dep)
    _recalculate_risk(current, db)
    return DependentOut.from_orm(dep)


@router.delete("/dependents/{dep_id}", status_code=204)
def remove_dependent(
    dep_id: str,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    dep = db.query(Dependent).filter_by(id=dep_id, user_id=current.id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Not found")
    db.delete(dep)
    db.commit()
    _recalculate_risk(current, db)
    return
