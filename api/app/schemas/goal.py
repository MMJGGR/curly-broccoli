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

class GoalUpdate(GoalBase):
    pass

class Goal(GoalBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
