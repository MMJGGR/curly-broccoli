from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import Milestone as MilestoneSchema, MilestoneCreate, MilestoneUpdate
from app.security import get_current_user
from app.crud import milestone as crud_milestone

router = APIRouter(prefix="/milestones", tags=["milestones"])


@router.post("/", response_model=MilestoneSchema, status_code=status.HTTP_201_CREATED)
def create_milestone(
    data: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_milestone.create_milestone(db=db, data=data, user_id=current_user.id)


@router.get("/", response_model=list[MilestoneSchema])
def list_milestones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_milestone.get_milestones(db=db, user_id=current_user.id)


@router.get("/{milestone_id}", response_model=MilestoneSchema)
def get_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestone = crud_milestone.get_milestone(db=db, milestone_id=milestone_id, user_id=current_user.id)
    if milestone is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return milestone


@router.put("/{milestone_id}", response_model=MilestoneSchema)
def update_milestone(
    milestone_id: int,
    data: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestone = crud_milestone.update_milestone(db=db, milestone_id=milestone_id, data=data, user_id=current_user.id)
    if milestone is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return milestone


@router.delete("/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestone = crud_milestone.delete_milestone(db=db, milestone_id=milestone_id, user_id=current_user.id)
    if milestone is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return None
