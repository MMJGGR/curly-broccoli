"""
SqlAlchemy Account Repository - Full Implementation
Provides comprehensive account management with balance calculations and categorization
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import Dict, List, Optional
from datetime import datetime
from decimal import Decimal

from app.models import Account, Transaction, User
from app.domain.value_objects.money import Money


class SqlAlchemyAccountRepository:
    """Full-featured account repository with financial calculations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_accounts_summary(self, user_id: int) -> Dict:
        """Get comprehensive accounts summary with net worth calculation"""
        # Get all user accounts
        accounts = self.db.query(Account).filter(
            Account.user_id == user_id
        ).all()
        
        # Prepare account data with categorization
        accounts_data = []
        total_assets = Decimal('0')
        total_liabilities = Decimal('0')
        active_accounts = 0
        
        for account in accounts:
            # Determine if account is asset or liability
            is_asset = account.type in ['checking', 'savings', 'investment', 'money_market', 'cd']
            is_liability = account.type in ['credit', 'loan', 'line_of_credit', 'mortgage']
            
            # Calculate display balance (positive for assets, negative for liabilities)
            balance = Decimal(str(account.balance))
            display_balance = balance if is_asset else -abs(balance)
            
            # Add to totals
            if is_asset and account.is_active:
                total_assets += balance
                active_accounts += 1
            elif is_liability and account.is_active:
                total_liabilities += abs(balance)  # Liabilities are positive amounts owed
                active_accounts += 1
            
            # Get account number last 4 digits
            last_four = account.account_number[-4:] if account.account_number else "****"
            
            accounts_data.append({
                "id": account.id,
                "name": account.name,
                "type": account.type,
                "balance": Money(balance),
                "display_balance": Money(display_balance),
                "is_asset": is_asset,
                "is_liability": is_liability,
                "institution": account.institution_name,
                "last_four": last_four,
                "is_active": account.is_active,
                "last_sync": account.last_sync,
                "created_at": account.created_at,
                "updated_at": account.updated_at
            })
        
        # Calculate net worth
        net_worth = total_assets - total_liabilities
        
        return {
            "accounts": accounts_data,
            "summary": {
                "total_accounts": len(accounts),
                "active_accounts": active_accounts,
                "total_assets": Money(total_assets),
                "total_liabilities": Money(total_liabilities),
                "net_worth": Money(net_worth)
            }
        }
    
    def get_account_by_id(self, user_id: int, account_id: int) -> Optional[Account]:
        """Get specific account by ID"""
        return self.db.query(Account).filter(
            and_(
                Account.id == account_id,
                Account.user_id == user_id
            )
        ).first()
    
    def create_account(self, user_id: int, account_data: Dict) -> Account:
        """Create new account"""
        account = Account(
            user_id=user_id,
            name=account_data.get("name"),
            account_number=account_data.get("account_number"),
            type=account_data.get("type"),
            balance=float(account_data.get("balance", 0.0)),
            institution_name=account_data.get("institution_name"),
            institution_id=account_data.get("institution_id"),
            is_active=account_data.get("is_active", True)
        )
        
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)
        return account
    
    def update_account(self, user_id: int, account_id: int, updates: Dict) -> Optional[Account]:
        """Update existing account"""
        account = self.db.query(Account).filter(
            and_(
                Account.id == account_id,
                Account.user_id == user_id
            )
        ).first()
        
        if not account:
            return None
        
        # Update allowed fields
        allowed_fields = ["name", "balance", "institution_name", "is_active", "last_sync"]
        for field, value in updates.items():
            if field in allowed_fields:
                setattr(account, field, value)
        
        account.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(account)
        return account
    
    def delete_account(self, user_id: int, account_id: int) -> bool:
        """Delete account (soft delete by marking inactive)"""
        account = self.db.query(Account).filter(
            and_(
                Account.id == account_id,
                Account.user_id == user_id
            )
        ).first()
        
        if not account:
            return False
        
        # Soft delete by marking inactive
        account.is_active = False
        account.updated_at = datetime.utcnow()
        self.db.commit()
        return True
    
    def get_account_transactions(self, user_id: int, account_id: int, limit: int = 50) -> List[Transaction]:
        """Get recent transactions for specific account"""
        return self.db.query(Transaction).filter(
            and_(
                Transaction.account_id == account_id,
                Transaction.user_id == user_id
            )
        ).order_by(Transaction.date.desc()).limit(limit).all()
    
    def calculate_account_balance(self, user_id: int, account_id: int) -> Decimal:
        """Calculate account balance from transactions"""
        # Get account
        account = self.get_account_by_id(user_id, account_id)
        if not account:
            return Decimal('0')
        
        # Calculate balance from transactions
        transactions = self.db.query(Transaction).filter(
            and_(
                Transaction.account_id == account_id,
                Transaction.user_id == user_id,
                Transaction.is_reconciled == True
            )
        ).all()
        
        balance = Decimal('0')
        for transaction in transactions:
            if transaction.transaction_type == 'credit':
                balance += Decimal(str(transaction.amount))
            else:  # debit
                balance -= Decimal(str(transaction.amount))
        
        return balance
    
    def sync_account_balance(self, user_id: int, account_id: int) -> Optional[Account]:
        """Sync account balance with transaction history"""
        account = self.get_account_by_id(user_id, account_id)
        if not account:
            return None
        
        calculated_balance = self.calculate_account_balance(user_id, account_id)
        account.balance = float(calculated_balance)
        account.last_sync = datetime.utcnow()
        account.updated_at = datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(account)
        return account
    
    def get_accounts_by_type(self, user_id: int, account_type: str) -> List[Account]:
        """Get accounts filtered by type"""
        return self.db.query(Account).filter(
            and_(
                Account.user_id == user_id,
                Account.type == account_type,
                Account.is_active == True
            )
        ).all()
    
    def get_net_worth_history(self, user_id: int, months: int = 12) -> List[Dict]:
        """Get net worth calculation over time (placeholder for future implementation)"""
        # This would require historical balance snapshots
        # For now, return current net worth
        summary = self.get_accounts_summary(user_id)
        return [{
            "date": datetime.now().date(),
            "net_worth": summary["summary"]["net_worth"].amount,
            "total_assets": summary["summary"]["total_assets"].amount,
            "total_liabilities": summary["summary"]["total_liabilities"].amount
        }]