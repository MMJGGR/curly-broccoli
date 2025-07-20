from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User, Profile, RiskProfile
from app.schemas import ProfileOut, ProfileUpdate, ProfileResponse # Import ProfileResponse
from app.security import get_current_user

router = APIRouter()

@router.get("/profile", response_model=ProfileResponse)
def read_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Retrieve the current user's profile."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    risk_profile = db.query(RiskProfile).filter(RiskProfile.user_id == current_user.id).first()

    return ProfileResponse(
        email=current_user.email,
        profile=ProfileOut.from_orm(profile),
        risk_score=risk_profile.risk_score if risk_profile else None,
        risk_level=risk_profile.risk_level if risk_profile else None,
    )

@router.put("/profile", response_model=ProfileResponse)
def update_profile(
    profile_in: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """Update the current user's profile."""
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    for field, value in profile_in.dict(exclude_unset=True).items():
        setattr(profile, field, value)

    db.add(profile)
    db.commit()
    db.refresh(profile)

    risk_profile = db.query(RiskProfile).filter(RiskProfile.user_id == current_user.id).first()
    if risk_profile:
        # Recompute risk score/level if relevant profile fields changed
        # This is a simplified example, you'd need to check which fields actually changed
        # and re-run the risk computation logic if necessary.
        pass # Placeholder for risk re-computation logic

    return ProfileResponse(
        email=current_user.email,
        profile=ProfileOut.from_orm(profile),
        risk_score=risk_profile.risk_score if risk_profile else None,
        risk_level=risk_profile.risk_level if risk_profile else None,
    )