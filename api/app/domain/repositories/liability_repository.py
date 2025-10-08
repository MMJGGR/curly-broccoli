"""
Abstract Liability Repository Interface - Clean Architecture
Domain layer repository contract for liability operations
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from decimal import Decimal

from ..entities.liability import Liability


class LiabilityRepository(ABC):
    """Abstract repository for liability operations"""
    
    @abstractmethod
    async def create_liability(self, liability: Liability) -> Liability:
        """Create a new liability"""
        pass
    
    @abstractmethod
    async def get_liability_by_id(self, liability_id: str, user_id: int) -> Optional[Liability]:
        """Get liability by ID for specific user"""
        pass
    
    @abstractmethod
    async def get_user_liabilities(self, user_id: int) -> List[Liability]:
        """Get all liabilities for a user"""
        pass
    
    @abstractmethod
    async def get_user_liabilities_by_type(self, user_id: int, liability_type: str) -> List[Liability]:
        """Get liabilities filtered by type"""
        pass
    
    @abstractmethod
    async def get_secured_liabilities(self, user_id: int) -> List[Liability]:
        """Get all secured liabilities for a user"""
        pass
    
    @abstractmethod
    async def get_unsecured_liabilities(self, user_id: int) -> List[Liability]:
        """Get all unsecured liabilities for a user"""
        pass
    
    @abstractmethod
    async def update_liability(self, liability: Liability) -> Liability:
        """Update existing liability"""
        pass
    
    @abstractmethod
    async def delete_liability(self, liability_id: str, user_id: int) -> bool:
        """Delete liability (soft delete)"""
        pass
    
    @abstractmethod
    async def get_user_total_liabilities(self, user_id: int) -> Decimal:
        """Get total liability balance for user"""
        pass
    
    @abstractmethod
    async def get_monthly_debt_payments(self, user_id: int) -> Decimal:
        """Calculate total monthly debt payment obligations"""
        pass
    
    @abstractmethod
    async def get_high_interest_liabilities(self, user_id: int, min_rate: Decimal) -> List[Liability]:
        """Get liabilities above specified interest rate threshold"""
        pass