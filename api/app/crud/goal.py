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


def get_goals(db: Session, user_id: int) -> List[Goal]:
    return db.query(Goal).filter(Goal.user_id == user_id).all()


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
