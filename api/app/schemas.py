from datetime import date
from typing import Dict, Any, List
from pydantic import BaseModel, EmailStr, constr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class RegisterRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    dob: date
    kra_pin: str
    annual_income: float
    dependents: int = 0
    goals: Dict[str, Any]
    questionnaire: List[int]

class ProfileOut(BaseModel):
    dob: date
    kra_pin: str
    annual_income: float
    dependents: int
    goals: Dict[str, Any]
    risk_score: int
    risk_level: int
    class Config:
        orm_mode = True


class Dependents(BaseModel):
    dependents: int
