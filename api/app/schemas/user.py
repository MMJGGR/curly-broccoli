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
    risk_level: Optional[int] = None

class RegisterRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    user_type: str = "user"  # 'user' or 'advisor'
    # Optional fields with defaults for simplified registration
    first_name: str = "New"
    last_name: str = "User"
    dob: date = date(1990, 1, 1)
    nationalId: str = "12345678"
    kra_pin: str = "A123456789Z"
    annual_income: float = 50000
    employment_status: str = "Employed"
    dependents: int = 0
    goals: Dict[str, Any] = {"targetAmount": 10000, "timeHorizon": 12}
    questionnaire: List[int] = [1, 2, 3, 4, 5]  # Default neutral values

class ProfileOut(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    dob: Optional[date] = None
    nationalId: Optional[str] = None
    kra_pin: Optional[str] = None
    phone: Optional[str] = None
    annual_income: Optional[float] = None
    employment_status: Optional[str] = None
    dependents: Optional[int] = None
    goals: Optional[Dict[str, Any]] = None
    questionnaire: Optional[List[int]] = None
    # Advisor-specific fields
    firm_name: Optional[str] = None
    license_number: Optional[str] = None
    professional_email: Optional[str] = None
    service_model: Optional[str] = None
    target_client_type: Optional[str] = None
    minimum_aum: Optional[str] = None

    class Config:
        from_attributes = True

class ProfileResponse(BaseModel):
    email: EmailStr
    profile: ProfileOut
    risk_score: Optional[int] = None
    risk_level: Optional[int] = None

    class Config:
        from_attributes = True

class Dependents(BaseModel):
    dependents: int

class ProfileBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    kra_pin: Optional[str] = None

    class Config:
        from_attributes = True

    class Config:
        from_attributes = True

class ProfileCreate(ProfileBase):
    pass

class ProfileUpdate(ProfileBase):
    nationalId: Optional[str] = None
    phone: Optional[str] = None
    annual_income: Optional[float] = None
    dependents: Optional[int] = None
    goals: Optional[Dict[str, Any]] = None
    questionnaire: Optional[List[int]] = None
    # Advisor-specific fields
    firm_name: Optional[str] = None
    license_number: Optional[str] = None
    professional_email: Optional[str] = None
    service_model: Optional[str] = None
    target_client_type: Optional[str] = None
    minimum_aum: Optional[str] = None

    class Config:
        from_attributes = True

class Profile(ProfileBase):
    id: int
    user_id: int

    class Config:
        from_attributes = True

class DeleteAccountRequest(BaseModel):
    password: str
    
class DeleteAccountResponse(BaseModel):
    message: str

class CreateAccountRequest(BaseModel):
    email: EmailStr
    password: constr(min_length=8)
    user_type: str = "user"  # 'user' or 'advisor'

class CreateAccountResponse(BaseModel):
    access_token: str
    token_type: str

class CompleteProfileRequest(BaseModel):
    first_name: str
    last_name: str
    date_of_birth: date
    nationalId: str
    kra_pin: str
    annual_income: float
    employment_status: str
    dependents: int
    goals: Dict[str, Any]
    questionnaire: List[int]

class CompleteProfileResponse(BaseModel):
    risk_score: int
    risk_level: int