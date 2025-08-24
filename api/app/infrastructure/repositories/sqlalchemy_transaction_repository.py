"""
SqlAlchemy Transaction Repository - Full Implementation
Provides comprehensive transaction management and analytics
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_, desc
from typing import Dict, List, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal

from app.models import Transaction, Account, ExpenseCategory
from app.domain.value_objects.money import Money


class SqlAlchemyTransactionRepository:
    """Full-featured transaction repository with analytics capabilities"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_transactions(self, user_id: int, account_id: Optional[int] = None, 
                        category: Optional[str] = None, start_date: Optional[date] = None,
                        end_date: Optional[date] = None, limit: int = 100, 
                        offset: int = 0) -> Dict:
        """Get filtered and paginated transactions"""
        
        # Build query
        query = self.db.query(Transaction).filter(Transaction.user_id == user_id)
        
        # Apply filters
        if account_id:
            query = query.filter(Transaction.account_id == account_id)
        if category:
            query = query.filter(Transaction.category == category)
        if start_date:
            query = query.filter(Transaction.date >= start_date)
        if end_date:
            query = query.filter(Transaction.date <= end_date)
        
        # Get total count before pagination
        total = query.count()
        
        # Apply pagination and ordering
        transactions = query.order_by(desc(Transaction.date)).offset(offset).limit(limit).all()
        
        # Convert to domain entities
        transaction_entities = []
        for tx in transactions:
            # Create transaction entity with business logic
            entity = TransactionEntity(
                id=tx.id,
                account_id=tx.account_id,
                amount=Money(Decimal(str(tx.amount))),
                category=tx.category,
                description=tx.description,
                date=tx.date,
                transaction_type=tx.transaction_type,
                created_at=tx.created_at,
                updated_at=tx.updated_at
            )
            transaction_entities.append(entity)
        
        return {
            "transactions": transaction_entities,
            "total": total,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total
        }
    
    def get_spending_analytics(self, user_id: int, months: int = 6) -> 'SpendingAnalytics':
        """Get comprehensive spending analytics"""
        
        # Calculate date range
        end_date = date.today()
        start_date = end_date - timedelta(days=months * 30)
        
        # Get transactions in date range
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.date >= start_date,
                Transaction.date <= end_date
            )
        ).all()
        
        # Calculate totals
        total_income = Money(Decimal('0'))
        total_expenses = Money(Decimal('0'))
        expense_by_category = {}
        monthly_trends = []
        
        for tx in transactions:
            amount = Money(Decimal(str(tx.amount)))
            
            if tx.transaction_type == 'credit' or amount.amount > 0:
                total_income = Money(total_income.amount + abs(amount.amount))
            else:
                total_expenses = Money(total_expenses.amount + abs(amount.amount))
                
                # Categorize expenses
                category = tx.category or "Uncategorized"
                if category not in expense_by_category:
                    expense_by_category[category] = Money(Decimal('0'))
                expense_by_category[category] = Money(
                    expense_by_category[category].amount + abs(amount.amount)
                )
        
        # Calculate monthly trends
        for i in range(months):
            month_start = end_date - timedelta(days=(months - i) * 30)
            month_end = end_date - timedelta(days=(months - i - 1) * 30)
            
            month_transactions = [tx for tx in transactions 
                                if month_start <= tx.date <= month_end]
            
            month_income = sum([abs(Decimal(str(tx.amount))) for tx in month_transactions 
                              if tx.transaction_type == 'credit'], Decimal('0'))
            month_expenses = sum([abs(Decimal(str(tx.amount))) for tx in month_transactions 
                                if tx.transaction_type == 'debit'], Decimal('0'))
            
            monthly_trends.append({
                "month": month_start.strftime("%Y-%m"),
                "income": Money(month_income),
                "expenses": Money(month_expenses),
                "net": Money(month_income - month_expenses)
            })
        
        # Calculate net cash flow
        net_cash_flow = Money(total_income.amount - total_expenses.amount)
        
        return SpendingAnalytics(
            total_income=total_income,
            total_expenses=total_expenses,
            net_cash_flow=net_cash_flow,
            expense_by_category=expense_by_category,
            monthly_trends=monthly_trends
        )
    
    def create_transaction(self, user_id: int, transaction_data: Dict) -> Transaction:
        """Create new transaction"""
        transaction = Transaction(
            user_id=user_id,
            account_id=transaction_data.get("account_id"),
            date=transaction_data.get("date"),
            description=transaction_data.get("description"),
            amount=float(transaction_data.get("amount")),
            transaction_type=transaction_data.get("transaction_type"),
            category=transaction_data.get("category"),
            subcategory=transaction_data.get("subcategory"),
            merchant=transaction_data.get("merchant"),
            notes=transaction_data.get("notes"),
            import_source=transaction_data.get("import_source", "manual")
        )
        
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def update_transaction(self, user_id: int, transaction_id: int, updates: Dict) -> Optional[Transaction]:
        """Update existing transaction"""
        transaction = self.db.query(Transaction).filter(
            and_(
                Transaction.id == transaction_id,
                Transaction.user_id == user_id
            )
        ).first()
        
        if not transaction:
            return None
        
        # Update allowed fields
        allowed_fields = ["description", "amount", "category", "subcategory", 
                         "merchant", "notes", "is_reconciled"]
        for field, value in updates.items():
            if field in allowed_fields:
                setattr(transaction, field, value)
        
        transaction.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def delete_transaction(self, user_id: int, transaction_id: int) -> bool:
        """Delete transaction"""
        transaction = self.db.query(Transaction).filter(
            and_(
                Transaction.id == transaction_id,
                Transaction.user_id == user_id
            )
        ).first()
        
        if not transaction:
            return False
        
        self.db.delete(transaction)
        self.db.commit()
        return True
    
    def get_transactions_by_category(self, user_id: int, category: str, 
                                   months: int = 3) -> List[Transaction]:
        """Get transactions filtered by category"""
        start_date = date.today() - timedelta(days=months * 30)
        
        return self.db.query(Transaction).filter(
            and_(
                Transaction.user_id == user_id,
                Transaction.category == category,
                Transaction.date >= start_date
            )
        ).order_by(desc(Transaction.date)).all()


class TransactionEntity:
    """Transaction domain entity with business logic"""
    
    def __init__(self, id: int, account_id: int, amount: Money, category: str,
                 description: str, date: date, transaction_type: str,
                 created_at: datetime, updated_at: datetime):
        self.id = id
        self.account_id = account_id
        self.amount = amount
        self.category = category
        self.description = description
        self.date = date
        self.transaction_type = transaction_type
        self.created_at = created_at
        self.updated_at = updated_at
    
    def is_income(self) -> bool:
        """Check if transaction is income"""
        return self.transaction_type == 'credit' or self.amount.amount > 0
    
    def is_expense(self) -> bool:
        """Check if transaction is expense"""
        return self.transaction_type == 'debit' or self.amount.amount < 0
    
    def get_display_amount(self) -> Money:
        """Get display amount (always positive for UI)"""
        return Money(abs(self.amount.amount))


class SpendingAnalytics:
    """Spending analytics domain entity"""
    
    def __init__(self, total_income: Money, total_expenses: Money, 
                 net_cash_flow: Money, expense_by_category: Dict[str, Money],
                 monthly_trends: List[Dict]):
        self.total_income = total_income
        self.total_expenses = total_expenses
        self.net_cash_flow = net_cash_flow
        self.expense_by_category = expense_by_category
        self.monthly_trends = monthly_trends
    
    def get_savings_rate(self) -> float:
        """Calculate savings rate as percentage"""
        if self.total_income.amount == 0:
            return 0
        return float((self.net_cash_flow.amount / self.total_income.amount) * 100)
    
    def get_expense_ratio(self) -> float:
        """Calculate expense ratio as percentage"""
        if self.total_income.amount == 0:
            return 0
        return float((self.total_expenses.amount / self.total_income.amount) * 100)
    
    def get_largest_expense_category(self) -> str:
        """Get the category with highest spending"""
        if not self.expense_by_category:
            return "No expenses"
        
        return max(self.expense_by_category.keys(), 
                  key=lambda k: self.expense_by_category[k].amount)