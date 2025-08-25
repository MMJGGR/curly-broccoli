"""
Expense Repository Interface - Domain Layer
Defines contracts for expense data access without implementation details
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import datetime

from ..entities.expense import Expense


class ExpenseRepository(ABC):
    """Abstract expense repository interface following clean architecture"""
    
    @abstractmethod
    async def get_user_expenses(self, user_id: int) -> List[Expense]:
        """Get all expenses for a user"""
        pass
    
    @abstractmethod
    async def get_expense_by_id(self, user_id: int, expense_id: int) -> Optional[Expense]:
        """Get specific expense by ID"""
        pass
    
    @abstractmethod
    async def create_expense(self, expense: Expense) -> Expense:
        """Create new expense"""
        pass
    
    @abstractmethod
    async def update_expense(self, expense: Expense) -> Expense:
        """Update existing expense"""
        pass
    
    @abstractmethod
    async def delete_expense(self, user_id: int, expense_id: int) -> bool:
        """Delete expense"""
        pass
    
    @abstractmethod
    async def get_expenses_by_category(self, user_id: int, category: str) -> List[Expense]:
        """Get expenses filtered by category"""
        pass
    
    @abstractmethod
    async def get_expenses_by_date_range(self, user_id: int, start_date: datetime, end_date: datetime) -> List[Expense]:
        """Get expenses within date range"""
        pass
    
    @abstractmethod
    async def get_recurring_expenses(self, user_id: int) -> List[Expense]:
        """Get all recurring expenses for a user"""
        pass
    
    @abstractmethod
    async def get_expenses_summary(self, user_id: int) -> dict:
        """Get summary statistics for user's expenses"""
        pass