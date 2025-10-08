"""
Transaction Repository Interface - Clean Architecture
"""
from abc import ABC, abstractmethod
from typing import List, Optional
from datetime import date

from ..entities.transaction import Transaction


class TransactionRepository(ABC):
    """Abstract interface for transaction data persistence"""
    
    @abstractmethod
    async def save(self, transaction: Transaction) -> Transaction:
        """
        Save transaction (create or update).
        
        Args:
            transaction: Transaction entity to save
            
        Returns:
            Transaction: Saved transaction with updated ID and timestamps
        """
        pass
    
    @abstractmethod
    async def get_by_id(self, transaction_id: int) -> Optional[Transaction]:
        """
        Retrieve transaction by ID.
        
        Args:
            transaction_id: Transaction identifier
            
        Returns:
            Optional[Transaction]: Transaction if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def get_by_user_id(
        self, 
        user_id: int,
        account_id: Optional[int] = None,
        category: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 100,
        offset: int = 0
    ) -> List[Transaction]:
        """
        Retrieve transactions for a user with filtering.
        
        Args:
            user_id: User identifier
            account_id: Optional account filter
            category: Optional category filter
            start_date: Optional start date filter
            end_date: Optional end date filter
            limit: Maximum number of results
            offset: Pagination offset
            
        Returns:
            List[Transaction]: User's transactions
        """
        pass
    
    @abstractmethod
    async def delete(self, transaction_id: int) -> bool:
        """
        Delete transaction permanently.
        
        Args:
            transaction_id: Transaction identifier
            
        Returns:
            bool: True if deleted successfully
        """
        pass