"""
SqlAlchemy Profile Repository - Full Implementation
Provides comprehensive user profile and risk profile management
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import Dict, List, Optional, Tuple
from datetime import datetime, date
from decimal import Decimal
import json

from app.models import Profile, RiskProfile, User
from app.domain.value_objects.money import Money


class SqlAlchemyProfileRepository:
    """Full-featured profile repository with financial planning capabilities"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_profile(self, user_id: int) -> Tuple[Optional['UserProfileEntity'], Dict]:
        """Get user profile with financial planning insights"""
        # Get profile from database
        profile = self.db.query(Profile).filter(Profile.user_id == user_id).first()
        
        if not profile:
            return None, {}
        
        # Create profile entity
        profile_entity = UserProfileEntity(
            id=profile.id,
            user_id=profile.user_id,
            full_name=f"{profile.first_name or ''} {profile.last_name or ''}".strip(),
            age=self._calculate_age(profile.date_of_birth) if profile.date_of_birth else None,
            location=f"{profile.first_name or ''} Location",  # Placeholder
            phone_number=profile.phone,
            monthly_income=Money(Decimal(str(profile.monthly_income or 0))),
            created_at=datetime.utcnow(),  # Placeholder
            updated_at=datetime.utcnow()   # Placeholder
        )
        
        # Calculate financial planning insights
        financial_planning = self._calculate_financial_planning(profile)
        
        return profile_entity, financial_planning
    
    def update_user_profile(self, profile_entity: 'UserProfileEntity') -> 'UserProfileEntity':
        """Update user profile with validation"""
        # Get existing profile
        profile = self.db.query(Profile).filter(Profile.user_id == profile_entity.user_id).first()
        
        if not profile:
            # Create new profile
            profile = Profile(user_id=profile_entity.user_id)
            self.db.add(profile)
        
        # Update profile fields
        if profile_entity.full_name:
            # Split full name into first and last
            name_parts = profile_entity.full_name.strip().split(' ', 1)
            profile.first_name = name_parts[0]
            profile.last_name = name_parts[1] if len(name_parts) > 1 else ""
        
        profile.phone = profile_entity.phone_number
        profile.monthly_income = float(profile_entity.monthly_income.amount)
        
        self.db.commit()
        self.db.refresh(profile)
        
        # Return updated entity
        return UserProfileEntity(
            id=profile.id,
            user_id=profile.user_id,
            full_name=f"{profile.first_name or ''} {profile.last_name or ''}".strip(),
            age=self._calculate_age(profile.date_of_birth) if profile.date_of_birth else None,
            location=profile_entity.location,
            phone_number=profile.phone,
            monthly_income=Money(Decimal(str(profile.monthly_income))),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    def _calculate_age(self, date_of_birth: date) -> int:
        """Calculate age from date of birth"""
        today = date.today()
        return today.year - date_of_birth.year - ((today.month, today.day) < (date_of_birth.month, date_of_birth.day))
    
    def _calculate_financial_planning(self, profile: Profile) -> Dict:
        """Calculate financial planning insights"""
        age = self._calculate_age(profile.date_of_birth) if profile.date_of_birth else 30
        monthly_income = Money(Decimal(str(profile.monthly_income or 0)))
        
        # Age category classification
        if age < 25:
            age_category = "young_professional"
        elif age < 35:
            age_category = "early_career"
        elif age < 50:
            age_category = "mid_career"
        elif age < 65:
            age_category = "pre_retirement"
        else:
            age_category = "retirement"
        
        # Emergency fund target (3-6 months of expenses)
        emergency_fund_target = Money(monthly_income.amount * 6)
        
        return {
            "age_category": age_category,
            "emergency_fund_target": emergency_fund_target,
            "monthly_income": monthly_income,
            "age": age
        }


class SqlAlchemyRiskProfileRepository:
    """Risk profile repository for investment preferences"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_risk_profile(self, user_id: int) -> Optional['RiskProfileEntity']:
        """Get user's risk profile"""
        risk_profile = self.db.query(RiskProfile).filter(RiskProfile.user_id == user_id).first()
        
        if not risk_profile:
            return None
        
        return RiskProfileEntity(
            id=risk_profile.id,
            user_id=risk_profile.user_id,
            risk_score=risk_profile.risk_score,
            risk_level=risk_profile.risk_level,
            investment_experience=self._get_investment_experience(risk_profile.risk_score),
            time_horizon=self._get_time_horizon(risk_profile.risk_score),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
    
    def _get_investment_experience(self, risk_score: int) -> str:
        """Map risk score to investment experience"""
        if risk_score <= 3:
            return "beginner"
        elif risk_score <= 6:
            return "intermediate"
        else:
            return "advanced"
    
    def _get_time_horizon(self, risk_score: int) -> str:
        """Map risk score to time horizon"""
        if risk_score <= 3:
            return "short_term"
        elif risk_score <= 6:
            return "medium_term"
        else:
            return "long_term"


class UserProfileEntity:
    """User profile domain entity"""
    
    def __init__(self, id: int, user_id: int, full_name: str, age: Optional[int],
                 location: str, phone_number: Optional[str], monthly_income: Money,
                 created_at: datetime, updated_at: datetime):
        self.id = id
        self.user_id = user_id
        self.full_name = full_name
        self.age = age
        self.location = location
        self.phone_number = phone_number
        self.monthly_income = monthly_income
        self.created_at = created_at
        self.updated_at = updated_at
        
        # Validation
        self._validate()
    
    def _validate(self):
        """Validate profile data"""
        if not self.full_name or len(self.full_name.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters")
        
        if self.age is not None and (self.age < 18 or self.age > 120):
            raise ValueError("Age must be between 18 and 120")
        
        if self.monthly_income.amount < 0:
            raise ValueError("Monthly income must be positive")


class RiskProfileEntity:
    """Risk profile domain entity"""
    
    def __init__(self, id: int, user_id: int, risk_score: int, risk_level: str,
                 investment_experience: str, time_horizon: str,
                 created_at: datetime, updated_at: datetime):
        self.id = id
        self.user_id = user_id
        self.risk_score = risk_score
        self.risk_level = risk_level
        self.investment_experience = investment_experience
        self.time_horizon = time_horizon
        self.created_at = created_at
        self.updated_at = updated_at