from pydantic import BaseModel
from typing import Optional

class AccountBase(BaseModel):
    name: str
    type: Optional[str] = None
    balance: float = 0.0

class AccountCreate(AccountBase):
    pass

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    balance: Optional[float] = None

class Account(AccountBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True
