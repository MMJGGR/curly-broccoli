"""
Transaction Management API - Complete CRUD operations for real financial data
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, extract, func, desc
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
import csv
import io
import json
import logging

from app.database import get_db
from app.models import User, Transaction, Account, ExpenseCategory
from app.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("/")
def get_transactions(
    account_id: Optional[int] = None,
    category: Optional[str] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's transactions with filtering options"""
    query = db.query(Transaction).filter(Transaction.user_id == current_user.id)
    
    # Apply filters
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if category:
        query = query.filter(Transaction.category == category)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    
    # Order by date descending and apply pagination
    transactions = query.order_by(desc(Transaction.date)).offset(offset).limit(limit).all()
    
    # Get total count for pagination
    total_count = query.count()
    
    return {
        "transactions": [format_transaction(t) for t in transactions],
        "total_count": total_count,
        "limit": limit,
        "offset": offset
    }


@router.get("/{transaction_id}")
def get_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific transaction by ID"""
    transaction = db.query(Transaction).filter(
        and_(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    return format_transaction(transaction)


@router.post("/")
def create_transaction(
    transaction_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new transaction"""
    # Validate required fields
    required_fields = ['date', 'description', 'amount', 'account_id']
    for field in required_fields:
        if field not in transaction_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Verify account belongs to user
    account = db.query(Account).filter(
        and_(Account.id == transaction_data['account_id'], Account.user_id == current_user.id)
    ).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Account not found"
        )
    
    try:
        # Parse date
        if isinstance(transaction_data['date'], str):
            transaction_date = datetime.strptime(transaction_data['date'], '%Y-%m-%d').date()
        else:
            transaction_date = transaction_data['date']
        
        # Create transaction
        transaction = Transaction(
            user_id=current_user.id,
            account_id=transaction_data['account_id'],
            date=transaction_date,
            description=transaction_data['description'],
            amount=float(transaction_data['amount']),
            transaction_type=transaction_data.get('transaction_type', 'debit' if transaction_data['amount'] < 0 else 'credit'),
            category=transaction_data.get('category', 'Uncategorized'),
            subcategory=transaction_data.get('subcategory'),
            merchant=transaction_data.get('merchant'),
            reference_id=transaction_data.get('reference_id'),
            notes=transaction_data.get('notes'),
            import_source='manual',
            is_pending=transaction_data.get('is_pending', False)
        )
        
        db.add(transaction)
        db.flush()  # Get the ID
        
        # Update account balance
        update_account_balance(db, account, transaction.amount)
        
        # Update expense category actual amount
        update_category_actual_amount(db, current_user.id, transaction)
        
        db.commit()
        db.refresh(transaction)
        
        logger.info(f"Transaction created: {transaction.id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Transaction created successfully",
            "transaction": format_transaction(transaction)
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create transaction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create transaction: {str(e)}"
        )


@router.put("/{transaction_id}")
def update_transaction(
    transaction_id: int,
    transaction_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing transaction"""
    transaction = db.query(Transaction).filter(
        and_(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    try:
        # Store original amount for balance adjustment
        original_amount = transaction.amount
        original_category = transaction.category
        
        # Update transaction fields
        for field, value in transaction_data.items():
            if field == 'date' and isinstance(value, str):
                value = datetime.strptime(value, '%Y-%m-%d').date()
            if hasattr(transaction, field) and field not in ['id', 'user_id', 'created_at']:
                setattr(transaction, field, value)
        
        # Update account balance if amount changed
        if original_amount != transaction.amount:
            account = transaction.account_rel
            # Reverse original amount and apply new amount
            update_account_balance(db, account, -original_amount)
            update_account_balance(db, account, transaction.amount)
        
        # Update category amounts if category or amount changed
        if original_category != transaction.category or original_amount != transaction.amount:
            update_category_actual_amount(db, current_user.id, transaction, reverse_original=True, original_amount=original_amount, original_category=original_category)
        
        transaction.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(transaction)
        
        logger.info(f"Transaction updated: {transaction.id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Transaction updated successfully",
            "transaction": format_transaction(transaction)
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update transaction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update transaction: {str(e)}"
        )


@router.delete("/{transaction_id}")
def delete_transaction(
    transaction_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transaction"""
    transaction = db.query(Transaction).filter(
        and_(Transaction.id == transaction_id, Transaction.user_id == current_user.id)
    ).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    try:
        # Reverse account balance
        account = transaction.account_rel
        update_account_balance(db, account, -transaction.amount)
        
        # Reverse category amount
        update_category_actual_amount(db, current_user.id, transaction, reverse_original=True, original_amount=transaction.amount, original_category=transaction.category)
        
        db.delete(transaction)
        db.commit()
        
        logger.info(f"Transaction deleted: {transaction_id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Transaction deleted successfully"
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete transaction: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete transaction: {str(e)}"
        )


@router.post("/import/csv")
async def import_transactions_csv(
    file: UploadFile = File(...),
    account_id: int = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Import transactions from CSV file"""
    if not file.filename.endswith('.csv'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV"
        )
    
    if account_id:
        # Verify account belongs to user
        account = db.query(Account).filter(
            and_(Account.id == account_id, Account.user_id == current_user.id)
        ).first()
        if not account:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Account not found"
            )
    
    try:
        contents = await file.read()
        csv_data = contents.decode('utf-8')
        reader = csv.DictReader(io.StringIO(csv_data))
        
        imported_count = 0
        skipped_count = 0
        errors = []
        batch_id = f"csv_import_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
        
        for row_num, row in enumerate(reader, start=1):
            try:
                # Map CSV columns to transaction fields
                transaction_data = map_csv_row_to_transaction(row)
                if account_id:
                    transaction_data['account_id'] = account_id
                
                # Check for duplicate
                if is_duplicate_transaction(db, current_user.id, transaction_data):
                    skipped_count += 1
                    continue
                
                # Create transaction
                transaction = Transaction(
                    user_id=current_user.id,
                    account_id=transaction_data['account_id'],
                    date=transaction_data['date'],
                    description=transaction_data['description'],
                    amount=transaction_data['amount'],
                    transaction_type=transaction_data.get('transaction_type', 'debit' if transaction_data['amount'] < 0 else 'credit'),
                    category=transaction_data.get('category', 'Uncategorized'),
                    merchant=transaction_data.get('merchant'),
                    import_source='csv',
                    import_batch_id=batch_id,
                    reference_id=transaction_data.get('reference_id')
                )
                
                db.add(transaction)
                imported_count += 1
                
            except Exception as row_error:
                errors.append(f"Row {row_num}: {str(row_error)}")
                continue
        
        db.commit()
        
        # Update account balances and category amounts
        if account_id:
            recalculate_account_balance(db, account_id)
        recalculate_category_amounts(db, current_user.id)
        
        logger.info(f"CSV import completed: {imported_count} imported, {skipped_count} skipped for user {current_user.id}")
        
        return {
            "success": True,
            "message": "CSV import completed",
            "imported_count": imported_count,
            "skipped_count": skipped_count,
            "batch_id": batch_id,
            "errors": errors[:10]  # Limit errors returned
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"CSV import failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"CSV import failed: {str(e)}"
        )


@router.get("/analytics/spending")
def get_spending_analytics(
    period: str = "month",  # month, quarter, year
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get spending analytics and trends"""
    # Set date range based on period
    if not start_date or not end_date:
        end_date = date.today()
        if period == "month":
            start_date = end_date.replace(day=1)
        elif period == "quarter":
            quarter_start_month = ((end_date.month - 1) // 3) * 3 + 1
            start_date = end_date.replace(month=quarter_start_month, day=1)
        elif period == "year":
            start_date = end_date.replace(month=1, day=1)
    
    # Get spending by category
    category_spending = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label('total_amount'),
        func.count(Transaction.id).label('transaction_count')
    ).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= start_date,
            Transaction.date <= end_date,
            Transaction.amount < 0  # Only expenses
        )
    ).group_by(Transaction.category).all()
    
    # Get monthly trends
    monthly_trends = db.query(
        extract('year', Transaction.date).label('year'),
        extract('month', Transaction.date).label('month'),
        func.sum(Transaction.amount).label('total_amount')
    ).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= start_date - timedelta(days=365),  # Extended range for trends
            Transaction.date <= end_date
        )
    ).group_by(
        extract('year', Transaction.date),
        extract('month', Transaction.date)
    ).order_by('year', 'month').all()
    
    return {
        "period": period,
        "start_date": start_date,
        "end_date": end_date,
        "category_breakdown": [
            {
                "category": cat[0],
                "amount": abs(cat[1]),  # Make positive for display
                "transaction_count": cat[2]
            }
            for cat in category_spending
        ],
        "monthly_trends": [
            {
                "year": int(trend[0]),
                "month": int(trend[1]),
                "total_spending": abs(trend[2])
            }
            for trend in monthly_trends
        ],
        "summary": {
            "total_spending": abs(sum(cat[1] for cat in category_spending)),
            "average_transaction": abs(sum(cat[1] for cat in category_spending) / max(sum(cat[2] for cat in category_spending), 1)),
            "top_category": max(category_spending, key=lambda x: abs(x[1]))[0] if category_spending else None
        }
    }


@router.get("/budget-comparison")
def get_budget_vs_actual(
    period: str = "month",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Compare actual spending vs budget by category"""
    # Get current period dates
    end_date = date.today()
    if period == "month":
        start_date = end_date.replace(day=1)
    elif period == "year":
        start_date = end_date.replace(month=1, day=1)
    
    # Get budget categories
    categories = db.query(ExpenseCategory).filter(
        and_(
            ExpenseCategory.user_id == current_user.id,
            ExpenseCategory.is_active == True
        )
    ).all()
    
    # Get actual spending by category
    actual_spending = {}
    for category in categories:
        total = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == current_user.id,
                Transaction.category == category.name,
                Transaction.date >= start_date,
                Transaction.date <= end_date,
                Transaction.amount < 0  # Expenses only
            )
        ).scalar() or 0
        actual_spending[category.name] = abs(total)
    
    # Create comparison data
    budget_comparison = []
    for category in categories:
        actual = actual_spending.get(category.name, 0)
        budgeted = category.budgeted_amount
        variance = budgeted - actual
        variance_pct = (variance / budgeted * 100) if budgeted > 0 else 0
        
        budget_comparison.append({
            "category": category.name,
            "budgeted": budgeted,
            "actual": actual,
            "variance": variance,
            "variance_percentage": variance_pct,
            "status": "under" if variance > 0 else "over" if variance < 0 else "on_target"
        })
    
    return {
        "period": period,
        "start_date": start_date,
        "end_date": end_date,
        "budget_comparison": budget_comparison,
        "summary": {
            "total_budgeted": sum(cat["budgeted"] for cat in budget_comparison),
            "total_actual": sum(cat["actual"] for cat in budget_comparison),
            "overall_variance": sum(cat["variance"] for cat in budget_comparison),
            "categories_over_budget": len([cat for cat in budget_comparison if cat["variance"] < 0])
        }
    }


# Helper functions
def format_transaction(transaction: Transaction) -> Dict[str, Any]:
    """Format transaction for API response"""
    return {
        "id": transaction.id,
        "date": transaction.date.isoformat(),
        "description": transaction.description,
        "amount": transaction.amount,
        "transaction_type": transaction.transaction_type,
        "category": transaction.category,
        "subcategory": transaction.subcategory,
        "merchant": transaction.merchant,
        "account_id": transaction.account_id,
        "account_name": transaction.account_rel.name if transaction.account_rel else None,
        "is_reconciled": transaction.is_reconciled,
        "is_pending": transaction.is_pending,
        "notes": transaction.notes,
        "import_source": transaction.import_source,
        "created_at": transaction.created_at.isoformat(),
        "updated_at": transaction.updated_at.isoformat()
    }


def update_account_balance(db: Session, account: Account, amount: float):
    """Update account balance with transaction amount"""
    account.balance += amount
    account.updated_at = datetime.utcnow()


def update_category_actual_amount(db: Session, user_id: int, transaction: Transaction, 
                                reverse_original: bool = False, original_amount: float = None, 
                                original_category: str = None):
    """Update expense category actual amount"""
    if reverse_original and original_category:
        # Reverse original category amount
        orig_category = db.query(ExpenseCategory).filter(
            and_(ExpenseCategory.user_id == user_id, ExpenseCategory.name == original_category)
        ).first()
        if orig_category:
            orig_category.actual_amount -= abs(original_amount) if original_amount < 0 else -abs(original_amount)
    
    # Update current category
    category = db.query(ExpenseCategory).filter(
        and_(ExpenseCategory.user_id == user_id, ExpenseCategory.name == transaction.category)
    ).first()
    if category and transaction.amount < 0:  # Only for expenses
        category.actual_amount += abs(transaction.amount)
        category.updated_at = datetime.utcnow()


def map_csv_row_to_transaction(row: Dict[str, str]) -> Dict[str, Any]:
    """Map CSV row to transaction data"""
    # Common CSV column mappings
    column_mappings = {
        'date': ['date', 'transaction_date', 'posted_date'],
        'description': ['description', 'memo', 'payee', 'transaction_description'],
        'amount': ['amount', 'debit', 'credit', 'transaction_amount'],
        'category': ['category', 'transaction_category'],
        'merchant': ['merchant', 'payee'],
        'reference_id': ['reference_id', 'transaction_id', 'ref_id']
    }
    
    transaction_data = {}
    for field, possible_columns in column_mappings.items():
        for col in possible_columns:
            if col.lower() in [k.lower() for k in row.keys()]:
                actual_col = next(k for k in row.keys() if k.lower() == col.lower())
                value = row[actual_col].strip()
                if value:
                    if field == 'date':
                        # Try multiple date formats
                        for fmt in ['%Y-%m-%d', '%m/%d/%Y', '%d/%m/%Y', '%Y-%m-%d %H:%M:%S']:
                            try:
                                transaction_data[field] = datetime.strptime(value, fmt).date()
                                break
                            except ValueError:
                                continue
                    elif field == 'amount':
                        # Handle amount formatting
                        value = value.replace('$', '').replace(',', '').replace('(', '-').replace(')', '')
                        transaction_data[field] = float(value)
                    else:
                        transaction_data[field] = value
                break
    
    return transaction_data


def is_duplicate_transaction(db: Session, user_id: int, transaction_data: Dict[str, Any]) -> bool:
    """Check if transaction is a duplicate"""
    existing = db.query(Transaction).filter(
        and_(
            Transaction.user_id == user_id,
            Transaction.date == transaction_data['date'],
            Transaction.description == transaction_data['description'],
            Transaction.amount == transaction_data['amount']
        )
    ).first()
    
    return existing is not None


def recalculate_account_balance(db: Session, account_id: int):
    """Recalculate account balance from all transactions"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return
    
    total_amount = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id == account_id
    ).scalar() or 0
    
    account.balance = total_amount
    account.updated_at = datetime.utcnow()


def recalculate_category_amounts(db: Session, user_id: int):
    """Recalculate all category actual amounts"""
    categories = db.query(ExpenseCategory).filter(ExpenseCategory.user_id == user_id).all()
    
    for category in categories:
        total = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.category == category.name,
                Transaction.amount < 0  # Expenses only
            )
        ).scalar() or 0
        
        category.actual_amount = abs(total)
        category.updated_at = datetime.utcnow()