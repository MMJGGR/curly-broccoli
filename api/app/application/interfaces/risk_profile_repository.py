"""
Risk Profile Repository Interface - Clean Architecture  
"""
from abc import ABC, abstractmethod
from typing import Optional
from ...domain.entities.profile import RiskProfile


class RiskProfileRepositoryInterface(ABC):
    """Interface for risk profile repository operations"""
    
    @abstractmethod
    def get_user_risk_profile(self, user_id: int) -> Optional[RiskProfile]:
        """Get user risk profile"""
        pass
    
    @abstractmethod
    def update_user_risk_profile(self, risk_profile: RiskProfile) -> RiskProfile:
        """Update user risk profile"""
        pass