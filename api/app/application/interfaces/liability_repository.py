"""
Liability Repository Interface - Clean Architecture
"""
from abc import ABC, abstractmethod
from typing import List, Optional

from ...domain.entities.liability import Liability


class LiabilityRepository(ABC):
    """Abstract interface for liability data persistence"""
    
    @abstractmethod
    async def save(self, liability: Liability) -> Liability:
        """
        Save liability (create or update).
        
        Args:
            liability: Liability entity to save
            
        Returns:
            Liability: Saved liability with updated ID and timestamps
        """
        pass
    
    @abstractmethod
    async def get_by_id(self, liability_id: int) -> Optional[Liability]:
        """
        Retrieve liability by ID.
        
        Args:
            liability_id: Liability identifier
            
        Returns:
            Optional[Liability]: Liability if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int, include_inactive: bool = False) -> List[Liability]:
        """
        Retrieve all liabilities for a user.
        
        Args:
            user_id: User identifier
            include_inactive: Whether to include inactive liabilities
            
        Returns:
            List[Liability]: User's liabilities
        """
        pass
    
    @abstractmethod
    async def delete(self, liability_id: int) -> bool:
        """
        Delete liability permanently.
        
        Args:
            liability_id: Liability identifier
            
        Returns:
            bool: True if deleted successfully
        """
        pass