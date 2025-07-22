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

class MilestoneUpdate(MilestoneBase):
    pass

class Milestone(MilestoneBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
