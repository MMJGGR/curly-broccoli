"""
Expense Repository Interface - Clean Architecture
"""
from abc import ABC, abstractmethod
from typing import List, Optional

from ...domain.entities.expense import Expense


class ExpenseRepository(ABC):
    """Abstract interface for expense data persistence"""
    
    @abstractmethod
    async def save(self, expense: Expense) -> Expense:
        """
        Save expense (create or update).
        
        Args:
            expense: Expense entity to save
            
        Returns:
            Expense: Saved expense with updated ID and timestamps
        """
        pass
    
    @abstractmethod
    async def get_by_id(self, expense_id: int) -> Optional[Expense]:
        """
        Retrieve expense by ID.
        
        Args:
            expense_id: Expense identifier
            
        Returns:
            Optional[Expense]: Expense if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int, include_inactive: bool = False) -> List[Expense]:
        """
        Retrieve all expenses for a user.
        
        Args:
            user_id: User identifier
            include_inactive: Whether to include inactive expenses
            
        Returns:
            List[Expense]: User's expenses
        """
        pass
    
    @abstractmethod
    async def delete(self, expense_id: int) -> bool:
        """
        Delete expense permanently.
        
        Args:
            expense_id: Expense identifier
            
        Returns:
            bool: True if deleted successfully
        """
        pass