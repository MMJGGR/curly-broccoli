"""
Budget Repository Interface - Domain Layer
Defines contracts for budget data access without implementation details
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
from ..entities.budget import Budget
from ..value_objects.money import Money


class BudgetRepository(ABC):
    """Abstract budget repository interface following clean architecture"""
    
    @abstractmethod
    async def get_budget_overview(self, user_id: int) -> Optional[Budget]:
        """Get comprehensive budget overview for user"""
        pass
    
    @abstractmethod
    async def create_budget_category(self, user_id: int, category_data: Dict) -> Dict:
        """Create new budget category"""
        pass
    
    @abstractmethod
    async def update_budget_category(self, user_id: int, category_id: int, updates: Dict) -> Optional[Dict]:
        """Update existing budget category"""
        pass
    
    @abstractmethod
    async def update_category_spending(self, user_id: int, category_id: int, amount: Money) -> Optional[Dict]:
        """Update actual spending for a category"""
        pass
    
    @abstractmethod
    async def delete_budget_category(self, user_id: int, category_id: int) -> bool:
        """Delete budget category"""
        pass