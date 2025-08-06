"""
Onboarding API Schemas - Built from scratch for bulletproof validation
"""
from pydantic import BaseModel, validator
from typing import Dict, Any, List, Optional
from datetime import datetime


class OnboardingStepRequest(BaseModel):
    """Request to save data for a specific onboarding step"""
    step_number: int
    step_data: Dict[str, Any]
    
    @validator('step_number')
    def validate_step_number(cls, v):
        if v < 1 or v > 5:
            raise ValueError('Step number must be between 1 and 5')
        return v


class OnboardingStateResponse(BaseModel):
    """Response containing current onboarding state"""
    current_step: int
    completed_steps: List[int]
    is_complete: bool
    personal_data: Optional[Dict[str, Any]] = None
    risk_data: Optional[Dict[str, Any]] = None
    financial_data: Optional[Dict[str, Any]] = None
    goals_data: Optional[Dict[str, Any]] = None
    preferences_data: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class OnboardingCompleteRequest(BaseModel):
    """Request to complete onboarding process"""
    final_review: bool = True


class OnboardingCompleteResponse(BaseModel):
    """Response after completing onboarding"""
    success: bool
    message: str
    profile_id: int
    risk_score: Optional[int] = None
    risk_level: Optional[int] = None


# Step-specific validation schemas
class PersonalInfoData(BaseModel):
    """Schema for personal information step (Step 1)"""
    firstName: str
    lastName: str
    dateOfBirth: str  # YYYY-MM-DD format
    phone: str
    nationalId: Optional[str] = None
    kraPin: Optional[str] = None
    employmentStatus: str = "Employed"
    dependents: int = 0
    
    @validator('phone')
    def validate_phone(cls, v):
        # Basic Kenya phone number validation
        if not v.startswith('+254') and not v.startswith('0'):
            raise ValueError('Phone number must be in Kenya format (+254 or 0)')
        return v
    
    @validator('dateOfBirth')
    def validate_date_of_birth(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
        except ValueError:
            raise ValueError('Date of birth must be in YYYY-MM-DD format')
        return v


class RiskAssessmentData(BaseModel):
    """Schema for risk assessment step (Step 2)"""
    questionnaire: List[int]
    
    @validator('questionnaire')
    def validate_questionnaire(cls, v):
        if len(v) != 5:
            raise ValueError('Questionnaire must have exactly 5 responses')
        for response in v:
            if response < 1 or response > 4:
                raise ValueError('Each questionnaire response must be between 1 and 4')
        return v


class FinancialInfoData(BaseModel):
    """Schema for financial information step (Step 3)"""
    monthlyIncome: float
    incomeFrequency: str = "Monthly"
    rent: Optional[float] = 0
    utilities: Optional[float] = 0
    groceries: Optional[float] = 0
    transport: Optional[float] = 0
    loanRepayments: Optional[float] = 0
    
    @validator('monthlyIncome')
    def validate_monthly_income(cls, v):
        if v <= 0:
            raise ValueError('Monthly income must be greater than 0')
        if v > 10000000:  # 10M KES seems reasonable as max
            raise ValueError('Monthly income seems unrealistically high')
        return v


class GoalsData(BaseModel):
    """Schema for financial goals step (Step 4)"""
    emergencyFund: Optional[float] = None
    homeDownPayment: Optional[float] = None
    education: Optional[float] = None
    retirement: Optional[float] = None
    investment: Optional[float] = None
    other: Optional[str] = None


class PreferencesData(BaseModel):
    """Schema for preferences step (Step 5) - Optional"""
    notifications: bool = True
    dataSharing: bool = False
    marketingEmails: bool = False
    newsletterSubscription: bool = True