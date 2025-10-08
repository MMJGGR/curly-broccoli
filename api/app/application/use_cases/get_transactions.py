"""
Get Transactions Use Case - Clean Architecture
CFA-compliant transaction retrieval with filtering and pagination
"""
from typing import Dict, Any, Optional, List
from datetime import date
from decimal import Decimal

from ...domain.entities.money import Money
from ...domain.repositories.transaction_repository import TransactionRepository


class GetTransactions:
    """Use case for retrieving user transactions with filtering and pagination"""
    
    def __init__(self, transaction_repository: TransactionRepository):
        self._transaction_repository = transaction_repository
    
    async def execute(
        self,
        user_id: int,
        account_id: Optional[int] = None,
        category: Optional[str] = None,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """
        Execute transaction retrieval with filtering and pagination
        
        Args:
            user_id: User identifier
            account_id: Optional account filter
            category: Optional category filter
            start_date: Optional start date filter
            end_date: Optional end date filter
            limit: Maximum number of results
            offset: Pagination offset
            
        Returns:
            Dict containing transactions and metadata
        """
        # Get filtered transactions from repository
        transactions = await self._transaction_repository.get_by_user_id(
            user_id=user_id,
            account_id=account_id,
            category=category,
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            offset=offset
        )
        
        # Calculate summary statistics
        total_income = Decimal('0')
        total_expenses = Decimal('0')
        transaction_count = len(transactions)
        
        for transaction in transactions:
            if transaction.amount.amount > 0:
                total_income += transaction.amount.amount
            else:
                total_expenses += abs(transaction.amount.amount)
        
        # Calculate net cash flow
        net_cash_flow = total_income - total_expenses
        
        return {
            "transactions": [
                {
                    "id": t.id,
                    "account_id": t.account_id,
                    "amount": {
                        "amount": str(t.amount.amount),
                        "currency": t.amount.currency
                    },
                    "description": t.description,
                    "category": t.category,
                    "transaction_date": t.transaction_date.isoformat(),
                    "created_at": t.created_at.isoformat() if t.created_at else None,
                    "updated_at": t.updated_at.isoformat() if t.updated_at else None
                }
                for t in transactions
            ],
            "summary": {
                "total_income": {
                    "amount": str(total_income),
                    "currency": "KES"
                },
                "total_expenses": {
                    "amount": str(total_expenses),
                    "currency": "KES"
                },
                "net_cash_flow": {
                    "amount": str(net_cash_flow),
                    "currency": "KES"
                },
                "transaction_count": transaction_count
            },
            "pagination": {
                "limit": limit,
                "offset": offset,
                "has_more": len(transactions) == limit  # Simple heuristic
            }
        }