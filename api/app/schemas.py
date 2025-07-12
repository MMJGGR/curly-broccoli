from datetime import date
from typing import Optional, Dict, Any
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
    questionnaire: Optional[Dict[str, int]] = None

class ProfileOut(BaseModel):
    dob: date
    kra_pin: str
    annual_income: float
    dependents: int
    goals: Dict[str, Any]
    risk_score: Optional[float] = None
    class Config:
        orm_mode = True


class Dependents(BaseModel):
    dependents: int
