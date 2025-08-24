"""
Account Repository Interface - Domain Layer
Defines contracts for account data access without implementation details
"""
from abc import ABC, abstractmethod
from typing import Dict, List, Optional


class AccountRepository(ABC):
    """Abstract account repository interface following clean architecture"""
    
    @abstractmethod
    async def get_accounts_summary(self, user_id: int) -> Dict:
        """Get comprehensive accounts summary with net worth calculation"""
        pass
    
    @abstractmethod
    async def get_account_by_id(self, user_id: int, account_id: int) -> Optional[Dict]:
        """Get specific account by ID"""
        pass
    
    @abstractmethod
    async def create_account(self, user_id: int, account_data: Dict) -> Dict:
        """Create new account"""
        pass
    
    @abstractmethod
    async def update_account(self, user_id: int, account_id: int, updates: Dict) -> Optional[Dict]:
        """Update existing account"""
        pass
    
    @abstractmethod
    async def delete_account(self, user_id: int, account_id: int) -> bool:
        """Delete account"""
        pass