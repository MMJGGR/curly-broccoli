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


def get_milestones(db: Session, user_id: int, skip: int = 0, limit: int = 100, phase: str = None, event: str = None, sort_by: str = None, sort_order: str = "asc") -> List[Milestone]:
    query = db.query(Milestone).filter(Milestone.user_id == user_id)

    if phase:
        query = query.filter(Milestone.phase.ilike(f"%{phase}%"))
    if event:
        query = query.filter(Milestone.event.ilike(f"%{event}%"))

    if sort_by:
        if sort_order == "desc":
            query = query.order_by(getattr(Milestone, sort_by).desc())
        else:
            query = query.order_by(getattr(Milestone, sort_by).asc())

    return query.offset(skip).limit(limit).all()


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
