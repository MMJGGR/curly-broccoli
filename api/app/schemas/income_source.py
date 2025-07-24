from typing import Optional
from pydantic import BaseModel

class IncomeSourceBase(BaseModel):
    name: str
    amount: float
    frequency: str

class IncomeSourceCreate(IncomeSourceBase):
    pass

class IncomeSourceUpdate(IncomeSourceBase):
    name: Optional[str] = None
    amount: Optional[float] = None
    frequency: Optional[str] = None

    class Config:
        from_attributes = True

class IncomeSource(IncomeSourceBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
        from_attributes = True