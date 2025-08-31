"""
SqlAlchemy Account Repository - Clean Architecture Implementation  
Foundation Week: Updated to use new domain entities and proper patterns
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, timezone
from decimal import Decimal

from ...models import Account as AccountModel
from ...domain.entities.account import Account, AccountType
from ...domain.entities.money import Money
from ...domain.repositories.account_repository import AccountRepository


class SqlAlchemyAccountRepository(AccountRepository):
    """SQLAlchemy implementation of AccountRepository interface"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_accounts(self, user_id: int) -> List[Account]:
        """Get all accounts for a user as domain entities"""
        # Get all user accounts from database
        account_models = self.db.query(AccountModel).filter(
            AccountModel.user_id == user_id
        ).all()
        
        # Convert to domain entities
        domain_accounts = []
        for model in account_models:
            try:
                # Map database account type to domain AccountType
                account_type = self._map_account_type(model.type)
                
                # Create Money object with proper balance
                balance = Money(Decimal(str(model.balance)) if model.balance else Decimal('0.00'))
                
                # Create domain entity
                domain_account = Account(
                    id=model.id,
                    user_id=model.user_id,
                    name=model.name,
                    account_type=account_type,
                    balance=balance,
                    institution=model.institution_name or "Unknown",
                    account_number=f"****{model.account_number[-4:]}" if model.account_number else "****0000",
                    is_active=model.is_active,
                    created_at=model.created_at or datetime.now(timezone.utc),
                    updated_at=model.updated_at
                )
                domain_accounts.append(domain_account)
                
            except Exception as e:
                # Log error but continue with other accounts
                print(f"Error converting account {model.id}: {e}")
                continue
        
        return domain_accounts
    
    def _map_account_type(self, db_type: str) -> AccountType:
        """Map database account type to domain AccountType enum"""
        type_mapping = {
            'checking': AccountType.CHECKING,
            'savings': AccountType.SAVINGS,
            'investment': AccountType.INVESTMENT,
            'money_market': AccountType.SAVINGS,
            'cd': AccountType.SAVINGS,
            'credit': AccountType.CREDIT_CARD,
            'credit_card': AccountType.CREDIT_CARD,
            'loan': AccountType.PERSONAL_LOAN,
            'personal_loan': AccountType.PERSONAL_LOAN,
            'auto_loan': AccountType.AUTO_LOAN,
            'student_loan': AccountType.STUDENT_LOAN,
            'mortgage': AccountType.MORTGAGE,
            'line_of_credit': AccountType.LINE_OF_CREDIT,
            'nssf_account': AccountType.NSSF_ACCOUNT,
            'individual_pension': AccountType.INDIVIDUAL_PENSION,
            'occupational_pension': AccountType.OCCUPATIONAL_PENSION,
            'brokerage': AccountType.BROKERAGE,
            'real_estate': AccountType.REAL_ESTATE,
            'cash': AccountType.CASH
        }
        
        return type_mapping.get(db_type.lower(), AccountType.OTHER_ASSET)
    
    async def get_account_by_id(self, user_id: int, account_id: int) -> Optional[Account]:
        """Get specific account by ID"""
        account_model = self.db.query(AccountModel).filter(
            and_(
                AccountModel.id == account_id,
                AccountModel.user_id == user_id
            )
        ).first()
        
        if not account_model:
            return None
        
        # Convert to domain entity
        try:
            account_type = self._map_account_type(account_model.type)
            balance = Money(Decimal(str(account_model.balance)) if account_model.balance else Decimal('0.00'))
            
            return Account(
                id=account_model.id,
                user_id=account_model.user_id,
                name=account_model.name,
                account_type=account_type,
                balance=balance,
                institution=account_model.institution_name or "Unknown",
                account_number=f"****{account_model.account_number[-4:]}" if account_model.account_number else "****0000",
                is_active=account_model.is_active,
                created_at=account_model.created_at or datetime.now(timezone.utc),
                updated_at=account_model.updated_at
            )
        except Exception as e:
            print(f"Error converting account {account_model.id}: {e}")
            return None
    
    async def create_account(self, account: Account) -> Account:
        """Create new account - TODO: Implement for Foundation Week"""
        raise NotImplementedError("Create account not implemented yet")
    
    async def update_account(self, account: Account) -> Account:
        """Update existing account - TODO: Implement for Foundation Week"""
        raise NotImplementedError("Update account not implemented yet")
    
    async def delete_account(self, user_id: int, account_id: int) -> bool:
        """Delete account - TODO: Implement for Foundation Week"""
        raise NotImplementedError("Delete account not implemented yet")