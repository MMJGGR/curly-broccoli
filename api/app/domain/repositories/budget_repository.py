from abc import ABC, abstractmethod
from typing import Optional, List
from ..entities.budget import Budget
from ..value_objects.period import Period


class BudgetRepository(ABC):
    """Repository interface for Budget aggregate root"""
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> Optional[Budget]:
        """Get the current budget for a user"""
        pass
    
    @abstractmethod
    async def get_by_user_and_period(self, user_id: int, period: Period) -> Optional[Budget]:
        """Get budget for a specific period"""
        pass
    
    @abstractmethod
    async def save(self, budget: Budget) -> None:
        """Save or update a budget"""
        pass
    
    @abstractmethod
    async def delete(self, user_id: int, period: Period) -> None:
        """Delete a budget for a specific period"""
        pass
    
    @abstractmethod
    async def get_budget_history(self, user_id: int, months: int) -> List[Budget]:
        """Get budget history for the specified number of months"""
        pass
    
    @abstractmethod
    async def exists(self, user_id: int, period: Period) -> bool:
        """Check if a budget exists for the given user and period"""
        pass
    
    @abstractmethod
    async def get_all_user_budgets(self, user_id: int) -> List[Budget]:
        """Get all budgets for a user across all periods"""
        pass