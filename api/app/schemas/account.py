from typing import Optional
from pydantic import BaseModel, constr

class AccountBase(BaseModel):
    name: constr(min_length=1)
    type: str
    balance: float
    institution_name: str # Added field

class AccountCreate(AccountBase):
    pass

class AccountUpdate(AccountBase):
    name: Optional[str] = None
    type: Optional[str] = None
    balance: Optional[float] = None
    institution_name: Optional[str] = None # Added field

    class Config:
        from_attributes = True

class AccountInDBBase(AccountBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class Account(AccountInDBBase):
    class Config:
        orm_mode = True
        from_attributes = True