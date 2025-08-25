"""
Account Repository Interface - Domain Layer
Defines contracts for account data access without implementation details
"""
from abc import ABC, abstractmethod
from typing import List, Optional

from ..entities.account import Account


class AccountRepository(ABC):
    """Abstract account repository interface following clean architecture"""
    
    @abstractmethod
    async def get_user_accounts(self, user_id: int) -> List[Account]:
        """Get all accounts for a user"""
        pass
    
    @abstractmethod
    async def get_account_by_id(self, user_id: int, account_id: int) -> Optional[Account]:
        """Get specific account by ID"""
        pass
    
    @abstractmethod
    async def create_account(self, account: Account) -> Account:
        """Create new account"""
        pass
    
    @abstractmethod
    async def update_account(self, account: Account) -> Account:
        """Update existing account"""
        pass
    
    @abstractmethod
    async def delete_account(self, user_id: int, account_id: int) -> bool:
        """Delete account"""
        pass