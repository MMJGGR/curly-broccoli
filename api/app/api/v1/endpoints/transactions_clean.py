"""
Transaction Management API V2 - Clean Architecture Implementation
CFA-compliant transaction tracking with domain entities and use cases
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional, List
from datetime import date

from ....auth import get_current_user
from ....models import User
from ....database import get_db

# Import use cases
from ....application.use_cases.get_transactions import GetTransactions

# Import repositories
from ....infrastructure.repositories.sqlalchemy_transaction_repository import SqlAlchemyTransactionRepository

router = APIRouter(prefix="/transactions-v2", tags=["transactions-v2-clean"])


def get_transaction_use_case(db: Session = Depends(get_db)) -> GetTransactions:
    """Dependency injection for transaction use case"""
    repository = SqlAlchemyTransactionRepository(db)
    return GetTransactions(repository)


@router.get("/", response_model=Dict[str, Any])
async def get_transactions_v2(
    account_id: Optional[int] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    use_case: GetTransactions = Depends(get_transaction_use_case)
):
    """
    Get user's transactions with filtering using clean architecture.
    
    Returns paginated transactions with:
    - Filtering by account, category, and date range
    - Pagination metadata
    - CFA-compliant transaction categorization
    """
    try:
        result = await use_case.execute(
            user_id=current_user.id,
            account_id=account_id,
            category=category,
            start_date=start_date,
            end_date=end_date,
            limit=limit,
            offset=offset
        )
        
        # Convert domain entities to API response format
        transactions_data = []
        for transaction in result["transactions"]:
            transactions_data.append({
                "id": transaction.id,
                "account_id": transaction.account_id,
                "amount": float(transaction.amount.amount),
                "display_amount": float(transaction.get_display_amount().amount),
                "category": transaction.category,
                "description": transaction.description,
                "date": str(transaction.date),
                "transaction_type": transaction.transaction_type,
                "is_income": transaction.is_income(),
                "is_expense": transaction.is_expense(),
                "currency": "KES",
                "created_at": transaction.created_at,
                "updated_at": transaction.updated_at
            })
        
        return {
            "user_id": current_user.id,
            "transactions": transactions_data,
            "pagination": {
                "total": result["total"],
                "limit": result["limit"],
                "offset": result["offset"],
                "has_more": result["has_more"],
                "current_page": (result["offset"] // result["limit"]) + 1 if result["limit"] > 0 else 1
            },
            "filters": {
                "account_id": account_id,
                "category": category,
                "start_date": str(start_date) if start_date else None,
                "end_date": str(end_date) if end_date else None
            },
            "metadata": {
                "calculation_method": "clean_architecture",
                "cfa_compliant": True,
                "currency": "KES"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving transactions: {str(e)}"
        )


@router.get("/health")
async def transactions_health_check():
    """Health check endpoint for transactions service"""
    return {
        "status": "healthy",
        "service": "transactions-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True,
        "features": ["get_transactions", "filtering", "pagination"]
    }