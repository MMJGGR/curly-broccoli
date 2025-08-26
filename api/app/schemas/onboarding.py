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
        if v < 1 or v > 5:  # Keep at 5 steps, replace preferences with employment
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
    employment_data: Optional[Dict[str, Any]] = None  # Replaces preferences_data as Step 5
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


class EmploymentProfileData(BaseModel):
    """Schema for employment profile step (Step 5) - CFA-compliant career data"""
    
    # Core Industry Classification
    industry_sector: str  # Required for discount rate calculation
    job_role_level: str   # entry, mid, senior, executive, owner
    employment_type: str  # permanent, contract, freelance, business_owner
    company_size: Optional[str] = "medium"  # startup, small, medium, large, enterprise
    
    # Stability & Experience Factors
    years_current_employer: float
    years_current_industry: float
    total_work_experience: float
    employment_gaps_months: int = 0  # Total months of unemployment in last 5 years
    
    # Income Characteristics
    income_variability: str = "fixed"  # fixed, commission_based, seasonal, project_based
    bonus_percentage: float = 0.0  # Percentage of total comp from bonuses/commissions
    stock_compensation_percentage: float = 0.0  # Percentage from equity/stock options
    
    # Career Outlook
    promotion_frequency_years: float = 3.0  # Average years between promotions
    skill_obsolescence_risk: str = "medium"  # low, medium, high
    industry_growth_outlook: str = "stable"  # declining, stable, growing, high_growth
    career_change_likelihood: str = "low"  # low, medium, high
    
    # Location & Professional Standing
    work_location: str  # nairobi, mombasa, kisumu, nakuru, rural, remote
    professional_certifications: List[str] = []  # CPA, CFA, PE, etc.
    union_membership: bool = False
    professional_licenses_required: bool = False
    
    # Additional Context
    job_security_perception: str = "stable"  # very_secure, stable, uncertain, at_risk
    remote_work_percentage: int = 0  # Percentage of work done remotely
    
    @validator('industry_sector')
    def validate_industry_sector(cls, v):
        valid_sectors = [
            'government', 'education', 'healthcare', 'legal', 'accounting',
            'financial_services', 'consulting', 'technology', 'manufacturing',
            'energy', 'construction', 'entertainment', 'startup', 'gig_economy',
            'agriculture', 'tourism', 'telecommunications', 'retail', 'other'
        ]
        if v.lower() not in valid_sectors:
            raise ValueError(f'Industry sector must be one of: {", ".join(valid_sectors)}')
        return v.lower()
    
    @validator('job_role_level')
    def validate_job_role_level(cls, v):
        valid_levels = ['entry', 'mid', 'senior', 'executive', 'owner']
        if v.lower() not in valid_levels:
            raise ValueError(f'Job role level must be one of: {", ".join(valid_levels)}')
        return v.lower()
    
    @validator('employment_type')
    def validate_employment_type(cls, v):
        valid_types = ['permanent', 'contract', 'freelance', 'business_owner']
        if v.lower() not in valid_types:
            raise ValueError(f'Employment type must be one of: {", ".join(valid_types)}')
        return v.lower()
    
    @validator('years_current_employer', 'years_current_industry', 'total_work_experience')
    def validate_years_positive(cls, v):
        if v < 0:
            raise ValueError('Years of experience cannot be negative')
        if v > 60:  # Reasonable career length limit
            raise ValueError('Years of experience seems unrealistically high')
        return v
    
    @validator('bonus_percentage', 'stock_compensation_percentage')
    def validate_percentage(cls, v):
        if v < 0 or v > 100:
            raise ValueError('Percentage must be between 0 and 100')
        return v
    
    @validator('work_location')
    def validate_work_location(cls, v):
        valid_locations = ['nairobi', 'mombasa', 'kisumu', 'nakuru', 'eldoret', 'thika', 'rural', 'remote', 'other']
        if v.lower() not in valid_locations:
            raise ValueError(f'Work location must be one of: {", ".join(valid_locations)}')
        return v.lower()