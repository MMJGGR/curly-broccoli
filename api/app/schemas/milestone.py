from typing import Optional
from datetime import date
from pydantic import BaseModel

class MilestoneBase(BaseModel):
    age: int
    phase: str
    event: str
    assets: float
    liabilities: float
    net_worth: float
    advice: str

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    age: Optional[int] = None
    phase: Optional[str] = None
    event: Optional[str] = None
    assets: Optional[float] = None
    liabilities: Optional[float] = None
    net_worth: Optional[float] = None
    advice: Optional[str] = None

    class Config:
        from_attributes = True

class Milestone(MilestoneBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
        from_attributes = True
