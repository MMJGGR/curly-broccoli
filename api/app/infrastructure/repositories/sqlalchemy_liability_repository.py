"""
SqlAlchemy Liability Repository - Clean Architecture Implementation
Complete liability/debt management with CFA-compliant business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_
from typing import List, Optional
from datetime import datetime, timezone
from decimal import Decimal

from ...models import Liability as LiabilityModel
from ...domain.entities.liability import Liability, LiabilityType, LiabilityCategory, InterestRateType
from ...domain.entities.money import Money
from ...domain.repositories.liability_repository import LiabilityRepository


class SqlAlchemyLiabilityRepository(LiabilityRepository):
    """SQLAlchemy implementation of LiabilityRepository interface"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def _model_to_entity(self, model: LiabilityModel) -> Liability:
        """Convert SQLAlchemy model to domain entity"""
        return Liability(
            liability_id=str(model.id),
            user_id=model.user_id,
            name=model.name,
            liability_type=LiabilityType(model.liability_type),
            category=LiabilityCategory(model.category),
            current_balance=Money(Decimal(str(model.current_balance)), "KES"),
            original_amount=Money(Decimal(str(model.original_amount)), "KES"),
            minimum_payment=Money(Decimal(str(model.minimum_payment)), "KES"),
            interest_rate=Decimal(str(model.interest_rate)),
            rate_type=InterestRateType(model.rate_type),
            term_months=model.term_months,
            remaining_payments=model.remaining_payments,
            payment_due_date=model.payment_due_date,
            maturity_date=model.maturity_date,
            is_secured=model.is_secured,
            collateral_description=model.collateral_description,
            collateral_value=Money(Decimal(str(model.collateral_value)), "KES") if model.collateral_value else None,
            loan_to_value_ratio=Decimal(str(model.loan_to_value_ratio)) if model.loan_to_value_ratio else None,
            credit_limit=Money(Decimal(str(model.credit_limit)), "KES") if model.credit_limit else None,
            available_credit=Money(Decimal(str(model.available_credit)), "KES") if model.available_credit else None,
            is_active=model.is_active,
            is_in_default=model.is_in_default,
            days_past_due=model.days_past_due,
            payment_history_score=Decimal(str(model.payment_history_score)) if model.payment_history_score else None,
            advisor_notes=model.advisor_notes,
            consolidation_candidate=model.consolidation_candidate,
            refinance_candidate=model.refinance_candidate,
            created_at=model.created_at,
            updated_at=model.updated_at
        )
    
    def _entity_to_model(self, entity: Liability) -> LiabilityModel:
        """Convert domain entity to SQLAlchemy model"""
        return LiabilityModel(
            id=int(entity.liability_id) if entity.liability_id.isdigit() else None,
            user_id=entity.user_id,
            name=entity.name,
            liability_type=entity.liability_type.value,
            category=entity.category.value,
            current_balance=float(entity.current_balance.amount),
            original_amount=float(entity.original_amount.amount),
            minimum_payment=float(entity.minimum_payment.amount),
            interest_rate=float(entity.interest_rate),
            rate_type=entity.rate_type.value,
            term_months=entity.term_months,
            remaining_payments=entity.remaining_payments,
            payment_due_date=entity.payment_due_date,
            maturity_date=entity.maturity_date,
            is_secured=entity.is_secured,
            collateral_description=entity.collateral_description,
            collateral_value=float(entity.collateral_value.amount) if entity.collateral_value else None,
            loan_to_value_ratio=float(entity.loan_to_value_ratio) if entity.loan_to_value_ratio else None,
            credit_limit=float(entity.credit_limit.amount) if entity.credit_limit else None,
            available_credit=float(entity.available_credit.amount) if entity.available_credit else None,
            is_active=entity.is_active,
            is_in_default=entity.is_in_default,
            days_past_due=entity.days_past_due,
            payment_history_score=float(entity.payment_history_score) if entity.payment_history_score else None,
            advisor_notes=entity.advisor_notes,
            consolidation_candidate=entity.consolidation_candidate,
            refinance_candidate=entity.refinance_candidate,
            created_at=entity.created_at,
            updated_at=entity.updated_at
        )
    
    async def create_liability(self, liability: Liability) -> Liability:
        """Create a new liability"""
        model = self._entity_to_model(liability)
        model.id = None  # Let database assign ID
        model.created_at = datetime.now(timezone.utc)
        model.updated_at = model.created_at
        
        self.db.add(model)
        self.db.commit()
        self.db.refresh(model)
        
        return self._model_to_entity(model)
    
    async def get_liability_by_id(self, liability_id: str, user_id: int) -> Optional[Liability]:
        """Get liability by ID for specific user"""
        model = self.db.query(LiabilityModel).filter(
            and_(
                LiabilityModel.id == int(liability_id),
                LiabilityModel.user_id == user_id,
                LiabilityModel.is_active == True
            )
        ).first()
        
        return self._model_to_entity(model) if model else None
    
    async def get_user_liabilities(self, user_id: int) -> List[Liability]:
        """Get all active liabilities for a user"""
        models = self.db.query(LiabilityModel).filter(
            and_(
                LiabilityModel.user_id == user_id,
                LiabilityModel.is_active == True
            )
        ).order_by(LiabilityModel.current_balance.desc()).all()
        
        return [self._model_to_entity(model) for model in models]
    
    async def get_user_liabilities_by_type(self, user_id: int, liability_type: str) -> List[Liability]:
        """Get liabilities filtered by type"""
        models = self.db.query(LiabilityModel).filter(
            and_(
                LiabilityModel.user_id == user_id,
                LiabilityModel.liability_type == liability_type,
                LiabilityModel.is_active == True
            )
        ).order_by(LiabilityModel.current_balance.desc()).all()
        
        return [self._model_to_entity(model) for model in models]
    
    async def get_secured_liabilities(self, user_id: int) -> List[Liability]:
        """Get all secured liabilities for a user"""
        models = self.db.query(LiabilityModel).filter(
            and_(
                LiabilityModel.user_id == user_id,
                LiabilityModel.is_secured == True,
                LiabilityModel.is_active == True
            )
        ).order_by(LiabilityModel.current_balance.desc()).all()
        
        return [self._model_to_entity(model) for model in models]
    
    async def get_unsecured_liabilities(self, user_id: int) -> List[Liability]:
        """Get all unsecured liabilities for a user"""
        models = self.db.query(LiabilityModel).filter(
            and_(
                LiabilityModel.user_id == user_id,
                LiabilityModel.is_secured == False,
                LiabilityModel.is_active == True
            )
        ).order_by(LiabilityModel.current_balance.desc()).all()
        
        return [self._model_to_entity(model) for model in models]
    
    async def update_liability(self, liability: Liability) -> Liability:
        """Update existing liability"""
        model = self.db.query(LiabilityModel).filter(
            and_(
                LiabilityModel.id == int(liability.liability_id),
                LiabilityModel.user_id == liability.user_id
            )
        ).first()
        
        if not model:
            raise ValueError(f"Liability {liability.liability_id} not found for user {liability.user_id}")
        
        # Update fields
        model.name = liability.name
        model.liability_type = liability.liability_type.value
        model.category = liability.category.value
        model.current_balance = float(liability.current_balance.amount)
        model.original_amount = float(liability.original_amount.amount)
        model.minimum_payment = float(liability.minimum_payment.amount)
        model.interest_rate = float(liability.interest_rate)
        model.rate_type = liability.rate_type.value
        model.term_months = liability.term_months
        model.remaining_payments = liability.remaining_payments
        model.payment_due_date = liability.payment_due_date
        model.maturity_date = liability.maturity_date
        model.is_secured = liability.is_secured
        model.collateral_description = liability.collateral_description
        model.collateral_value = float(liability.collateral_value.amount) if liability.collateral_value else None
        model.loan_to_value_ratio = float(liability.loan_to_value_ratio) if liability.loan_to_value_ratio else None
        model.credit_limit = float(liability.credit_limit.amount) if liability.credit_limit else None
        model.available_credit = float(liability.available_credit.amount) if liability.available_credit else None
        model.is_active = liability.is_active
        model.is_in_default = liability.is_in_default
        model.days_past_due = liability.days_past_due
        model.payment_history_score = float(liability.payment_history_score) if liability.payment_history_score else None
        model.advisor_notes = liability.advisor_notes
        model.consolidation_candidate = liability.consolidation_candidate
        model.refinance_candidate = liability.refinance_candidate
        model.updated_at = datetime.now(timezone.utc)
        
        self.db.commit()
        self.db.refresh(model)
        
        return self._model_to_entity(model)
    
    async def delete_liability(self, liability_id: str, user_id: int) -> bool:
        """Delete liability (soft delete)"""
        model = self.db.query(LiabilityModel).filter(
            and_(
                LiabilityModel.id == int(liability_id),
                LiabilityModel.user_id == user_id
            )
        ).first()
        
        if not model:
            return False
        
        model.is_active = False
        model.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        
        return True
    
    async def get_user_total_liabilities(self, user_id: int) -> Decimal:
        """Get total liability balance for user"""
        result = self.db.query(func.sum(LiabilityModel.current_balance)).filter(
            and_(
                LiabilityModel.user_id == user_id,
                LiabilityModel.is_active == True
            )
        ).scalar()
        
        return Decimal(str(result)) if result else Decimal('0')
    
    async def get_monthly_debt_payments(self, user_id: int) -> Decimal:
        """Calculate total monthly debt payment obligations"""
        result = self.db.query(func.sum(LiabilityModel.minimum_payment)).filter(
            and_(
                LiabilityModel.user_id == user_id,
                LiabilityModel.is_active == True
            )
        ).scalar()
        
        return Decimal(str(result)) if result else Decimal('0')
    
    async def get_high_interest_liabilities(self, user_id: int, min_rate: Decimal) -> List[Liability]:
        """Get liabilities above specified interest rate threshold"""
        models = self.db.query(LiabilityModel).filter(
            and_(
                LiabilityModel.user_id == user_id,
                LiabilityModel.interest_rate > float(min_rate),
                LiabilityModel.is_active == True
            )
        ).order_by(LiabilityModel.interest_rate.desc()).all()
        
        return [self._model_to_entity(model) for model in models]