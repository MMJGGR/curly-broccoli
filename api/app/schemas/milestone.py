from typing import Optional
from datetime import date
from pydantic import BaseModel

class MilestoneBase(BaseModel):
    age: int
    phase: str
    event: str
    assets: str
    liabilities: str
    net_worth: str
    advice: str

class MilestoneCreate(MilestoneBase):
    pass

class MilestoneUpdate(BaseModel):
    age: Optional[int] = None
    phase: Optional[str] = None
    event: Optional[str] = None
    assets: Optional[str] = None
    liabilities: Optional[str] = None
    net_worth: Optional[str] = None
    advice: Optional[str] = None

class Milestone(MilestoneBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
