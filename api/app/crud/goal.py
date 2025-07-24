from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import Goal
from app.schemas.goal import GoalCreate, GoalUpdate


def create_goal(db: Session, data: GoalCreate, user_id: int) -> Goal:
    goal = Goal(**data.dict(), user_id=user_id)
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return goal


def get_goal(db: Session, goal_id: int, user_id: int) -> Optional[Goal]:
    return db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()


def get_goals(db: Session, user_id: int, skip: int = 0, limit: int = 100, name: str = None, sort_by: str = None, sort_order: str = "asc") -> List[Goal]:
    query = db.query(Goal).filter(Goal.user_id == user_id)

    if name:
        query = query.filter(Goal.name.ilike(f"%{name}%"))

    if sort_by:
        if sort_order == "desc":
            query = query.order_by(getattr(Goal, sort_by).desc())
        else:
            query = query.order_by(getattr(Goal, sort_by).asc())

    return query.offset(skip).limit(limit).all()


def update_goal(db: Session, goal_id: int, data: GoalUpdate, user_id: int) -> Optional[Goal]:
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if goal:
        for field, value in data.dict(exclude_unset=True).items():
            setattr(goal, field, value)
        db.commit()
        db.refresh(goal)
    return goal


def delete_goal(db: Session, goal_id: int, user_id: int) -> Optional[Goal]:
    goal = db.query(Goal).filter(Goal.id == goal_id, Goal.user_id == user_id).first()
    if goal:
        db.delete(goal)
        db.commit()
    return goal
