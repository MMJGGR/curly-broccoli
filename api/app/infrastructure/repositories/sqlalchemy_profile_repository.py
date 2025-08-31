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
from app.domain.entities.profile import UserProfile, RiskProfile as RiskProfileEntity
from app.application.interfaces.profile_repository import ProfileRepositoryInterface
from app.application.interfaces.risk_profile_repository import RiskProfileRepositoryInterface


class SqlAlchemyProfileRepository(ProfileRepositoryInterface):
    """Full-featured profile repository with financial planning capabilities"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_profile(self, user_id: int) -> Tuple[Optional[UserProfile], Dict]:
        """Get user profile with financial planning insights"""
        # Get profile from database
        profile = self.db.query(Profile).filter(Profile.user_id == user_id).first()
        
        if not profile:
            return None, {}
        
        # Create profile entity
        profile_entity = UserProfile(
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
    
    def update_user_profile(self, profile_entity: UserProfile) -> UserProfile:
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
        return UserProfile(
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


class SqlAlchemyRiskProfileRepository(RiskProfileRepositoryInterface):
    """Risk profile repository implementation"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_risk_profile(self, user_id: int) -> Optional[RiskProfileEntity]:
        """Get user risk profile"""
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
    
    def update_user_risk_profile(self, risk_profile_entity: RiskProfileEntity) -> RiskProfileEntity:
        """Update user risk profile"""
        risk_profile = self.db.query(RiskProfile).filter(RiskProfile.user_id == risk_profile_entity.user_id).first()
        
        if not risk_profile:
            # Create new risk profile
            risk_profile = RiskProfile(
                user_id=risk_profile_entity.user_id,
                risk_score=risk_profile_entity.risk_score,
                risk_level=risk_profile_entity.risk_level
            )
            self.db.add(risk_profile)
        else:
            # Update existing risk profile
            risk_profile.risk_score = risk_profile_entity.risk_score
            risk_profile.risk_level = risk_profile_entity.risk_level
        
        self.db.commit()
        self.db.refresh(risk_profile)
        
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
        if risk_score <= 30:
            return "beginner"
        elif risk_score <= 70:
            return "intermediate"
        else:
            return "advanced"
    
    def _get_time_horizon(self, risk_score: int) -> str:
        """Map risk score to time horizon"""
        if risk_score <= 30:
            return "short_term"
        elif risk_score <= 70:
            return "medium_term"
        else:
            return "long_term"