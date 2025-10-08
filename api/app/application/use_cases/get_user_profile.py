"""
Get User Profile Use Case - Clean Architecture Implementation
CFA-compliant profile retrieval with financial planning insights
"""
from typing import Dict, Any
from decimal import Decimal

from ..interfaces.profile_repository import ProfileRepositoryInterface
from ..interfaces.risk_profile_repository import RiskProfileRepositoryInterface
from ...domain.entities.profile import UserProfile


class GetUserProfile:
    """
    Use case for retrieving comprehensive user profile information
    
    Combines profile data with risk profile and provides financial planning insights
    """
    
    def __init__(
        self,
        profile_repository: ProfileRepositoryInterface,
        risk_repository: RiskProfileRepositoryInterface
    ):
        self.profile_repository = profile_repository
        self.risk_repository = risk_repository
    
    async def execute(self, user_id: int) -> Dict[str, Any]:
        """
        Execute the get user profile use case
        
        Args:
            user_id: ID of the user to retrieve profile for
            
        Returns:
            Dict containing profile, risk profile, and financial planning data
            
        Raises:
            ValueError: If user profile not found
        """
        # Get user profile
        profile, financial_planning = self.profile_repository.get_user_profile(user_id)
        
        if not profile:
            raise ValueError(f"User profile not found for user_id: {user_id}")
        
        # Get risk profile (optional)
        risk_profile = self.risk_repository.get_user_risk_profile(user_id)
        
        # Enhance financial planning with risk profile data
        if risk_profile:
            financial_planning.update({
                "risk_consistency_valid": self._validate_risk_consistency(profile, risk_profile),
                "recommended_asset_allocation": self._get_recommended_allocation(risk_profile),
                "expected_return_rate": risk_profile.expected_return_rate
            })
        
        return {
            "profile": profile,
            "risk_profile": risk_profile,
            "financial_planning": financial_planning
        }
    
    def _validate_risk_consistency(self, profile: UserProfile, risk_profile) -> bool:
        """Validate if risk profile is consistent with user age and income"""
        if not profile.age:
            return True  # Cannot validate without age
        
        # Young investors can typically take more risk
        if profile.age < 35 and risk_profile.risk_level in ["very_low", "low"]:
            return False  # May be too conservative for young age
        
        # Older investors should be more conservative
        if profile.age > 55 and risk_profile.risk_level in ["very_high"]:
            return False  # May be too aggressive for older age
            
        return True
    
    def _get_recommended_allocation(self, risk_profile) -> Dict[str, float]:
        """Get recommended asset allocation based on risk level"""
        allocations = {
            "very_low": {"stocks": 20, "bonds": 70, "cash": 10},
            "low": {"stocks": 30, "bonds": 60, "cash": 10},
            "moderate": {"stocks": 50, "bonds": 40, "cash": 10},
            "high": {"stocks": 70, "bonds": 25, "cash": 5},
            "very_high": {"stocks": 85, "bonds": 10, "cash": 5}
        }
        
        return allocations.get(risk_profile.risk_level.lower(), allocations["moderate"])


class UpdateUserProfile:
    """
    Use case for updating user profile information
    """
    
    def __init__(self, profile_repository: ProfileRepositoryInterface):
        self.profile_repository = profile_repository
    
    async def execute(self, profile: UserProfile) -> UserProfile:
        """
        Execute the update user profile use case
        
        Args:
            profile: UserProfile entity with updated information
            
        Returns:
            Updated UserProfile entity
            
        Raises:
            ValueError: If validation fails
        """
        # The profile entity already validates data in __post_init__
        # Additional business rules can be added here
        
        # Ensure profile is valid for financial planning
        if not profile.is_valid_for_financial_planning:
            raise ValueError("Profile does not meet financial planning requirements")
        
        # Update profile in repository
        updated_profile = self.profile_repository.update_user_profile(profile)
        
        return updated_profile