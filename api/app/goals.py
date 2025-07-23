from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import Goal as GoalSchema, GoalCreate, GoalUpdate
from app.security import get_current_user
from app.crud import goal as crud_goal

router = APIRouter(prefix="/goals", tags=["goals"])


@router.post("/", response_model=GoalSchema, status_code=status.HTTP_201_CREATED)
def create_goal(
    data: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_goal.create_goal(db=db, data=data, user_id=current_user.id)


@router.get("/", response_model=list[GoalSchema])
def list_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_goal.get_goals(db=db, user_id=current_user.id)


@router.get("/{goal_id}", response_model=GoalSchema)
def get_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = crud_goal.get_goal(db=db, goal_id=goal_id, user_id=current_user.id)
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


@router.put("/{goal_id}", response_model=GoalSchema)
def update_goal(
    goal_id: int,
    data: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = crud_goal.update_goal(db=db, goal_id=goal_id, data=data, user_id=current_user.id)
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return goal


@router.delete("/{goal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    goal = crud_goal.delete_goal(db=db, goal_id=goal_id, user_id=current_user.id)
    if goal is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Goal not found")
    return None
