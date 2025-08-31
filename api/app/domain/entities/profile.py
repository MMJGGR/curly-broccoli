"""
Profile Domain Entity - Clean Architecture Implementation
CFA-compliant profile management with financial planning insights
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime
from decimal import Decimal

from ..value_objects.money import Money


@dataclass(frozen=True)
class UserProfile:
    """
    User Profile Domain Entity
    
    Represents a user's personal and financial profile information
    following clean architecture principles.
    """
    # Core Identity
    user_id: int
    
    # Personal Information  
    full_name: str
    monthly_income: Money
    
    # Metadata - Required fields (must come before optional fields)
    created_at: datetime
    updated_at: datetime
    
    # Optional Personal Information
    id: Optional[int] = None
    age: Optional[int] = None
    location: Optional[str] = None
    phone_number: Optional[str] = None
    
    def __post_init__(self):
        """Validate profile data after initialization"""
        if self.age is not None and (self.age < 18 or self.age > 120):
            raise ValueError("Age must be between 18 and 120")
        
        if self.monthly_income.amount <= 0:
            raise ValueError("Monthly income must be positive")
        
        if len(self.full_name.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters")

    @property
    def annual_income(self) -> Money:
        """Calculate annual income from monthly income"""
        return Money(self.monthly_income.amount * 12)
    
    @property
    def is_valid_for_financial_planning(self) -> bool:
        """Check if profile has sufficient data for financial planning"""
        return (
            self.age is not None and
            self.monthly_income.amount > 0 and
            len(self.full_name.strip()) >= 2
        )


@dataclass(frozen=True) 
class RiskProfile:
    """
    Risk Profile Domain Entity
    
    Represents a user's investment risk profile and preferences
    """
    # Core Identity
    user_id: int
    
    # Risk Assessment
    risk_score: int
    risk_level: str
    investment_experience: str
    time_horizon: str
    
    # Metadata - Required fields
    created_at: datetime
    updated_at: datetime
    
    # Optional fields
    id: Optional[int] = None
    
    def __post_init__(self):
        """Validate risk profile data after initialization"""
        if not 0 <= self.risk_score <= 100:
            raise ValueError("Risk score must be between 0 and 100")
        
        valid_risk_levels = ["very_low", "low", "moderate", "high", "very_high"]
        if self.risk_level.lower() not in valid_risk_levels:
            raise ValueError(f"Risk level must be one of: {valid_risk_levels}")
    
    @property
    def expected_return_rate(self) -> Decimal:
        """Get expected return rate based on risk level"""
        risk_return_mapping = {
            "very_low": Decimal("0.03"),
            "low": Decimal("0.04"), 
            "moderate": Decimal("0.06"),
            "high": Decimal("0.08"),
            "very_high": Decimal("0.10")
        }
        return risk_return_mapping.get(self.risk_level.lower(), Decimal("0.06"))
    
    @property
    def is_consistent_with_age(self) -> bool:
        """Check if risk profile is age-appropriate (requires age from UserProfile)"""
        # This would need age from UserProfile to implement properly
        return True  # Placeholder