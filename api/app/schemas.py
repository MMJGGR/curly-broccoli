from datetime import date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, constr, Field, ConfigDict

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
    risk_score: Optional[float] = None
    model_config = ConfigDict(from_attributes=True)

class DependentBase(BaseModel):
    name: str
    relation_type: str = Field(..., alias="relationship")
    date_of_birth: date

    model_config = ConfigDict(populate_by_name=True)

class DependentCreate(DependentBase):
    pass

class DependentOut(DependentBase):
    id: str

    model_config = ConfigDict(populate_by_name=True, from_attributes=True)

class ProfileOut(UserProfileOut):
    dependents: List[DependentOut] = []


class RegisterRequest(UserProfileCreate):
    email: EmailStr
    password: constr(min_length=8)
    dependents: Optional[int] = 0
    questionnaire: Optional[dict] = None
