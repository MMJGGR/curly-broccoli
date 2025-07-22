from typing import Optional
from pydantic import BaseModel

class AccountBase(BaseModel):
    name: str
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

class AccountInDBBase(AccountBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class Account(AccountInDBBase):
    pass