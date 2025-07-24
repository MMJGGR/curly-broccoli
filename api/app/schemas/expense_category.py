from typing import Optional
from pydantic import BaseModel

class ExpenseCategoryBase(BaseModel):
    name: str
    budgeted_amount: float

class ExpenseCategoryCreate(ExpenseCategoryBase):
    pass

class ExpenseCategoryUpdate(ExpenseCategoryBase):
    name: Optional[str] = None
    budgeted_amount: Optional[float] = None

    class Config:
        from_attributes = True

class ExpenseCategory(ExpenseCategoryBase):
    id: int
    user_id: int

    class Config:
        orm_mode = True
        from_attributes = True