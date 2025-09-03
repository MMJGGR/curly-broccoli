"""
Income Repository Interface - Clean Architecture
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import date

from ..entities.income import Income


class IncomeRepository(ABC):
    """Repository interface for income management"""
    
    @abstractmethod
    async def create(self, income: Income) -> Income:
        """Create a new income source"""
        pass
    
    @abstractmethod
    async def get_by_id(self, income_id: int, user_id: int) -> Optional[Income]:
        """Get an income source by ID"""
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> List[Income]:
        """Get all income sources for a user"""
        pass
    
    @abstractmethod
    async def update(self, income: Income) -> Income:
        """Update an existing income source"""
        pass
    
    @abstractmethod
    async def delete(self, income_id: int, user_id: int) -> bool:
        """Delete an income source"""
        pass
    
    @abstractmethod
    async def get_monthly_total(self, user_id: int) -> float:
        """Get total monthly income for a user"""
        pass
    
    @abstractmethod
    async def get_by_type(self, user_id: int, income_type: str) -> List[Income]:
        """Get income sources by type"""
        pass