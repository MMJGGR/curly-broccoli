"""
Account Management API - Complete CRUD operations for financial accounts
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Dict, Any, Optional
from datetime import datetime, date
import logging

from api.app.database import get_db
from api.app.models import User, Account, Transaction
from api.app.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.get("/")
def get_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all user accounts with balances and summary"""
    accounts = db.query(Account).filter(
        and_(Account.user_id == current_user.id, Account.is_active == True)
    ).all()
    
    account_summaries = []
    total_assets = 0
    total_liabilities = 0
    
    for account in accounts:
        # Get recent transactions count
        recent_transactions = db.query(func.count(Transaction.id)).filter(
            and_(
                Transaction.account_id == account.id,
                Transaction.date >= date.today().replace(day=1)  # This month
            )
        ).scalar()
        
        # Get last transaction date
        last_transaction = db.query(func.max(Transaction.date)).filter(
            Transaction.account_id == account.id
        ).scalar()
        
        account_data = {
            "id": account.id,
            "name": account.name,
            "account_number": account.account_number,
            "type": account.type,
            "balance": account.balance,
            "institution_name": account.institution_name,
            "institution_id": account.institution_id,
            "last_sync": account.last_sync.isoformat() if account.last_sync else None,
            "recent_transactions_count": recent_transactions,
            "last_transaction_date": last_transaction.isoformat() if last_transaction else None,
            "created_at": account.created_at.isoformat(),
            "updated_at": account.updated_at.isoformat()
        }
        
        account_summaries.append(account_data)
        
        # Categorize for net worth calculation
        if account.type in ['checking', 'savings', 'investment']:
            total_assets += account.balance
        elif account.type in ['credit', 'loan']:
            total_liabilities += abs(account.balance)  # Liabilities are typically negative
    
    return {
        "accounts": account_summaries,
        "summary": {
            "total_accounts": len(account_summaries),
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "net_worth": total_assets - total_liabilities
        }
    }


@router.get("/{account_id}")
def get_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get specific account details with transaction summary"""
    account = db.query(Account).filter(
        and_(Account.id == account_id, Account.user_id == current_user.id)
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Get transaction statistics
    transaction_stats = db.query(
        func.count(Transaction.id).label('total_transactions'),
        func.sum(Transaction.amount).label('total_amount'),
        func.avg(Transaction.amount).label('avg_amount'),
        func.max(Transaction.date).label('last_transaction_date'),
        func.min(Transaction.date).label('first_transaction_date')
    ).filter(Transaction.account_id == account_id).first()
    
    # Get recent transactions (last 10)
    recent_transactions = db.query(Transaction).filter(
        Transaction.account_id == account_id
    ).order_by(Transaction.date.desc()).limit(10).all()
    
    return {
        "id": account.id,
        "name": account.name,
        "account_number": account.account_number,
        "type": account.type,
        "balance": account.balance,
        "institution_name": account.institution_name,
        "institution_id": account.institution_id,
        "is_active": account.is_active,
        "last_sync": account.last_sync.isoformat() if account.last_sync else None,
        "created_at": account.created_at.isoformat(),
        "updated_at": account.updated_at.isoformat(),
        "statistics": {
            "total_transactions": transaction_stats.total_transactions or 0,
            "total_amount": transaction_stats.total_amount or 0,
            "average_transaction": transaction_stats.avg_amount or 0,
            "first_transaction_date": transaction_stats.first_transaction_date.isoformat() if transaction_stats.first_transaction_date else None,
            "last_transaction_date": transaction_stats.last_transaction_date.isoformat() if transaction_stats.last_transaction_date else None
        },
        "recent_transactions": [
            {
                "id": t.id,
                "date": t.date.isoformat(),
                "description": t.description,
                "amount": t.amount,
                "category": t.category
            }
            for t in recent_transactions
        ]
    }


@router.post("/")
def create_account(
    account_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new financial account"""
    # Validate required fields
    required_fields = ['name', 'type', 'institution_name']
    for field in required_fields:
        if field not in account_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Validate account type
    valid_types = ['checking', 'savings', 'credit', 'investment', 'loan', 'mortgage']
    if account_data['type'] not in valid_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid account type. Must be one of: {', '.join(valid_types)}"
        )
    
    try:
        account = Account(
            user_id=current_user.id,
            name=account_data['name'],
            account_number=account_data.get('account_number'),
            type=account_data['type'],
            balance=float(account_data.get('balance', 0.0)),
            institution_name=account_data['institution_name'],
            institution_id=account_data.get('institution_id'),
            is_active=account_data.get('is_active', True)
        )
        
        db.add(account)
        db.commit()
        db.refresh(account)
        
        logger.info(f"Account created: {account.id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Account created successfully",
            "account": {
                "id": account.id,
                "name": account.name,
                "type": account.type,
                "balance": account.balance,
                "institution_name": account.institution_name
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create account: {str(e)}"
        )


@router.put("/{account_id}")
def update_account(
    account_id: int,
    account_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing account"""
    account = db.query(Account).filter(
        and_(Account.id == account_id, Account.user_id == current_user.id)
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    try:
        # Update account fields
        for field, value in account_data.items():
            if hasattr(account, field) and field not in ['id', 'user_id', 'created_at']:
                setattr(account, field, value)
        
        account.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(account)
        
        logger.info(f"Account updated: {account.id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Account updated successfully",
            "account": {
                "id": account.id,
                "name": account.name,
                "type": account.type,
                "balance": account.balance,
                "institution_name": account.institution_name,
                "updated_at": account.updated_at.isoformat()
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update account: {str(e)}"
        )


@router.delete("/{account_id}")
def delete_account(
    account_id: int,
    force: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an account (soft delete by default, force delete if specified)"""
    account = db.query(Account).filter(
        and_(Account.id == account_id, Account.user_id == current_user.id)
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    # Check if account has transactions
    transaction_count = db.query(func.count(Transaction.id)).filter(
        Transaction.account_id == account_id
    ).scalar()
    
    if transaction_count > 0 and not force:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot delete account with {transaction_count} transactions. Use force=true to proceed."
        )
    
    try:
        if force and transaction_count > 0:
            # Delete all transactions first
            db.query(Transaction).filter(Transaction.account_id == account_id).delete()
            logger.info(f"Deleted {transaction_count} transactions for account {account_id}")
        
        if force:
            # Hard delete
            db.delete(account)
            message = "Account and all associated data deleted permanently"
        else:
            # Soft delete
            account.is_active = False
            account.updated_at = datetime.utcnow()
            message = "Account deactivated successfully"
        
        db.commit()
        
        logger.info(f"Account {'deleted' if force else 'deactivated'}: {account_id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": message,
            "force_deleted": force,
            "transactions_deleted": transaction_count if force else 0
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )


@router.post("/{account_id}/sync")
def sync_account(
    account_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Sync account with external data source (placeholder for banking API integration)"""
    account = db.query(Account).filter(
        and_(Account.id == account_id, Account.user_id == current_user.id)
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    try:
        # Placeholder for actual banking API integration
        # This would connect to banking APIs like Plaid, Yodlee, etc.
        
        # For now, just update the last_sync timestamp
        account.last_sync = datetime.utcnow()
        account.updated_at = datetime.utcnow()
        
        db.commit()
        
        logger.info(f"Account sync initiated: {account_id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Account sync completed",
            "account_id": account_id,
            "last_sync": account.last_sync.isoformat(),
            "note": "Banking API integration coming soon - this updates sync timestamp only"
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to sync account: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync account: {str(e)}"
        )


@router.get("/{account_id}/balance-history")
def get_balance_history(
    account_id: int,
    days: int = 30,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get account balance history over time"""
    account = db.query(Account).filter(
        and_(Account.id == account_id, Account.user_id == current_user.id)
    ).first()
    
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    try:
        # Get transactions for the period
        start_date = date.today() - datetime.timedelta(days=days)
        transactions = db.query(Transaction).filter(
            and_(
                Transaction.account_id == account_id,
                Transaction.date >= start_date
            )
        ).order_by(Transaction.date.asc()).all()
        
        # Calculate running balance
        balance_history = []
        current_balance = account.balance
        
        # Work backwards from current balance
        for transaction in reversed(transactions):
            balance_history.append({
                "date": transaction.date.isoformat(),
                "balance": current_balance,
                "transaction_amount": transaction.amount,
                "transaction_description": transaction.description
            })
            current_balance -= transaction.amount
        
        # Reverse to get chronological order
        balance_history.reverse()
        
        return {
            "account_id": account_id,
            "account_name": account.name,
            "period_days": days,
            "start_date": start_date.isoformat(),
            "end_date": date.today().isoformat(),
            "current_balance": account.balance,
            "balance_history": balance_history,
            "summary": {
                "starting_balance": balance_history[0]["balance"] if balance_history else account.balance,
                "ending_balance": account.balance,
                "net_change": account.balance - (balance_history[0]["balance"] if balance_history else account.balance),
                "transaction_count": len(transactions)
            }
        }
        
    except Exception as e:
        logger.error(f"Failed to get balance history: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get balance history: {str(e)}"
        )


@router.get("/types/supported")
def get_supported_account_types():
    """Get list of supported account types and their descriptions"""
    account_types = {
        "checking": {
            "name": "Checking Account",
            "description": "Primary spending account for daily transactions",
            "category": "asset"
        },
        "savings": {
            "name": "Savings Account",
            "description": "Interest-bearing account for storing money",
            "category": "asset"
        },
        "credit": {
            "name": "Credit Card",
            "description": "Revolving credit account for purchases",
            "category": "liability"
        },
        "investment": {
            "name": "Investment Account",
            "description": "Brokerage or retirement account for investments",
            "category": "asset"
        },
        "loan": {
            "name": "Personal Loan",
            "description": "Fixed-term loan with regular payments",
            "category": "liability"
        },
        "mortgage": {
            "name": "Mortgage",
            "description": "Home loan secured by real estate",
            "category": "liability"
        }
    }
    
    return {
        "supported_types": account_types,
        "categories": {
            "asset": "Accounts that increase net worth",
            "liability": "Accounts that decrease net worth"
        }
    }