"""
Income Repository Interface - Clean Architecture
"""
from abc import ABC, abstractmethod
from typing import List, Optional

from ...domain.entities.income import Income


class IncomeRepository(ABC):
    """Abstract interface for income data persistence"""
    
    @abstractmethod
    async def save(self, income: Income) -> Income:
        """
        Save income (create or update).
        
        Args:
            income: Income entity to save
            
        Returns:
            Income: Saved income with updated ID and timestamps
        """
        pass
    
    @abstractmethod
    async def get_by_id(self, income_id: int) -> Optional[Income]:
        """
        Retrieve income by ID.
        
        Args:
            income_id: Income identifier
            
        Returns:
            Optional[Income]: Income if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int, include_inactive: bool = False) -> List[Income]:
        """
        Retrieve all incomes for a user.
        
        Args:
            user_id: User identifier
            include_inactive: Whether to include inactive incomes
            
        Returns:
            List[Income]: User's income streams
        """
        pass
    
    @abstractmethod
    async def delete(self, income_id: int) -> bool:
        """
        Delete income permanently.
        
        Args:
            income_id: Income identifier
            
        Returns:
            bool: True if deleted successfully
        """
        pass