from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Milestone, User
from app.schemas import Milestone as MilestoneSchema, MilestoneCreate, MilestoneUpdate
from app.security import get_current_user

router = APIRouter(prefix="/milestones", tags=["milestones"])


@router.post("/", response_model=MilestoneSchema, status_code=status.HTTP_201_CREATED)
def create_milestone(
    data: MilestoneCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestone = Milestone(**data.dict(), user_id=current_user.id)
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone


@router.get("/", response_model=list[MilestoneSchema])
def list_milestones(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Milestone).filter_by(user_id=current_user.id).all()


@router.get("/{milestone_id}", response_model=MilestoneSchema)
def get_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestone = db.query(Milestone).filter_by(id=milestone_id, user_id=current_user.id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    return milestone


@router.put("/{milestone_id}", response_model=MilestoneSchema)
def update_milestone(
    milestone_id: int,
    data: MilestoneUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestone = db.query(Milestone).filter_by(id=milestone_id, user_id=current_user.id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    for key, value in data.dict(exclude_unset=True).items():
        setattr(milestone, key, value)
    db.commit()
    db.refresh(milestone)
    return milestone


@router.delete("/{milestone_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_milestone(
    milestone_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    milestone = db.query(Milestone).filter_by(id=milestone_id, user_id=current_user.id).first()
    if not milestone:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Milestone not found")
    db.delete(milestone)
    db.commit()
    return None
