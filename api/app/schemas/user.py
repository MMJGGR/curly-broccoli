from typing import Optional, List, Dict, Any
from datetime import date, datetime

from pydantic import BaseModel, EmailStr, constr

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: int
    hashed_password: str
    is_active: bool = True
    is_superuser: bool = False

    class Config:
        from_attributes = True

class User(UserBase):
    id: int
    is_active: bool = True
    is_superuser: bool = False

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class RegisterResponse(BaseModel):
    access_token: str
    token_type: str
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None

class RegisterRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    dob: date
    kra_pin: str
    annual_income: float
    dependents: int = 0
    goals: Dict[str, Any]
    questionnaire: List[int] # length 8, values 1–5
    role: str = "user" # Added role field

class ProfileOut(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    kra_pin: Optional[str] = None
    annual_income: Optional[float] = None
    dependents: Optional[int] = None
    goals: Optional[Dict[str, Any]] = None
    questionnaire: Optional[List[int]] = None

    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    email: EmailStr
    profile: ProfileOut
    risk_score: Optional[int] = None
    risk_level: Optional[str] = None

class Dependents(BaseModel):
    dependents: int

class ProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    kra_pin: Optional[str] = None

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    pass

class Profile(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True