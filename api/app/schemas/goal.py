from typing import Optional
from pydantic import BaseModel

class GoalBase(BaseModel):
    name: str
    target: str
    current: str
    progress: float
    target_date: Optional[str] = None

class GoalCreate(GoalBase):
    pass

class GoalUpdate(BaseModel):
    name: Optional[str] = None
    target: Optional[str] = None
    current: Optional[str] = None
    progress: Optional[float] = None
    target_date: Optional[str] = None

    class Config:
        from_attributes = True

class Goal(GoalBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
        from_attributes = True
