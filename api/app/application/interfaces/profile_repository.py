"""
Profile Repository Interface - Clean Architecture
"""
from abc import ABC, abstractmethod
from typing import Tuple, Optional, Dict
from ...domain.entities.profile import UserProfile


class ProfileRepositoryInterface(ABC):
    """Interface for profile repository operations"""
    
    @abstractmethod
    def get_user_profile(self, user_id: int) -> Tuple[Optional[UserProfile], Dict]:
        """Get user profile with financial planning insights"""
        pass
    
    @abstractmethod
    def update_user_profile(self, profile: UserProfile) -> UserProfile:
        """Update user profile"""
        pass