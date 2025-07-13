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
    questionnaire: List[int] # length 8, values 1–5

class ProfileOut(BaseModel):
    email: EmailStr
    dob: date
    kra_pin: str
    annual_income: float
    dependents: int
    goals: Dict[str, Any]
    risk_score: int # 0–100
    risk_level: int # 1–5
    class Config:
        orm_mode = True


class Dependents(BaseModel):
    dependents: int
