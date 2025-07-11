from datetime import date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, constr

class UserCreate(BaseModel):
    email: EmailStr
    password: constr(min_length=8)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserProfileBase(BaseModel):
    full_name: str
    date_of_birth: date
    id_type: str
    id_number: str
    kra_pin: str
    marital_status: Optional[str]
    employment_status: str
    monthly_income_kes: float
    net_worth_estimate: Optional[float]
    risk_tolerance_score: int
    retirement_age_goal: Optional[int]
    investment_goals: Optional[str]

class UserProfileCreate(UserProfileBase):
    pass

class UserProfileOut(UserProfileBase):
    class Config:
        orm_mode = True

class DependentBase(BaseModel):
    name: str
    relationship: str
    date_of_birth: date

class DependentCreate(DependentBase):
    pass

class DependentOut(DependentBase):
    id: str
    class Config:
        orm_mode = True

class ProfileOut(UserProfileOut):
    dependents: List[DependentOut] = []
