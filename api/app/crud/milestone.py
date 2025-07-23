from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Milestone
from app.schemas.milestone import MilestoneCreate, MilestoneUpdate


def create_milestone(db: Session, data: MilestoneCreate, user_id: int) -> Milestone:
    milestone = Milestone(**data.dict(), user_id=user_id)
    db.add(milestone)
    db.commit()
    db.refresh(milestone)
    return milestone


def get_milestone(db: Session, milestone_id: int, user_id: int) -> Optional[Milestone]:
    return db.query(Milestone).filter(Milestone.id == milestone_id, Milestone.user_id == user_id).first()


def get_milestones(db: Session, user_id: int) -> List[Milestone]:
    return db.query(Milestone).filter(Milestone.user_id == user_id).all()


def update_milestone(db: Session, milestone_id: int, data: MilestoneUpdate, user_id: int) -> Optional[Milestone]:
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id, Milestone.user_id == user_id).first()
    if milestone:
        for field, value in data.dict(exclude_unset=True).items():
            setattr(milestone, field, value)
        db.commit()
        db.refresh(milestone)
    return milestone


def delete_milestone(db: Session, milestone_id: int, user_id: int) -> Optional[Milestone]:
    milestone = db.query(Milestone).filter(Milestone.id == milestone_id, Milestone.user_id == user_id).first()
    if milestone:
        db.delete(milestone)
        db.commit()
    return milestone
