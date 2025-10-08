"""
SQLAlchemy Income Repository Implementation - Clean Architecture
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from decimal import Decimal

from ...application.interfaces.income_repository import IncomeRepository
from ...domain.entities.income import Income, IncomeType, IncomeFrequency, TemporalPattern
from ...domain.entities.money import Money
# Use existing app models to avoid missing infrastructure model imports
# Map IncomeModel to the existing SQLAlchemy model `IncomeSource`
from ...models import IncomeSource as IncomeModel


class SQLAlchemyIncomeRepository(IncomeRepository):
    """SQLAlchemy implementation of IncomeRepository"""
    
    def __init__(self, session: Session):
        self._session = session
    
    async def save(self, income: Income) -> Income:
        """Save income to database"""
        try:
            if income.id == 0:
                # Create new
                # IncomeSource has a minimal schema: name, amount, frequency, user_id
                model = IncomeModel(
                    user_id=income.user_id,
                    name=income.description or "Income",
                    amount=float(income.amount.amount),
                    frequency=income.frequency.value,
                )
                self._session.add(model)
                self._session.flush()
                income.id = model.id
            else:
                # Update existing
                model = self._session.query(IncomeModel).filter_by(id=income.id).first()
                if not model:
                    raise ValueError(f"Income {income.id} not found")

                # Update minimal fields present in IncomeSource
                model.name = income.description or model.name
                model.amount = float(income.amount.amount)
                model.frequency = income.frequency.value
            
            self._session.commit()
            return income
            
        except SQLAlchemyError as e:
            self._session.rollback()
            raise RuntimeError(f"Database error saving income: {str(e)}")
    
    async def get_by_id(self, income_id: int) -> Optional[Income]:
        """Retrieve income by ID"""
        try:
            model = self._session.query(IncomeModel).filter_by(id=income_id).first()
            if not model:
                return None
            
            return self._model_to_entity(model)
            
        except SQLAlchemyError as e:
            raise RuntimeError(f"Database error retrieving income: {str(e)}")
    
    async def get_by_user_id(self, user_id: int, include_inactive: bool = False) -> List[Income]:
        """Retrieve all incomes for a user"""
        try:
            query = self._session.query(IncomeModel).filter_by(user_id=user_id)
            
            if not include_inactive:
                query = query.filter_by(is_active=True)
            
            models = query.order_by(IncomeModel.created_at.desc()).all()
            return [self._model_to_entity(model) for model in models]
            
        except SQLAlchemyError as e:
            raise RuntimeError(f"Database error retrieving user incomes: {str(e)}")
    
    async def delete(self, income_id: int) -> bool:
        """Delete income permanently"""
        try:
            result = self._session.query(IncomeModel).filter_by(id=income_id).delete()
            self._session.commit()
            return result > 0
            
        except SQLAlchemyError as e:
            self._session.rollback()
            raise RuntimeError(f"Database error deleting income: {str(e)}")
    
    def _model_to_entity(self, model: IncomeModel) -> Income:
        """Convert database model to domain entity"""
        # Map minimal IncomeSource fields to the richer domain entity
        # Fields not present in IncomeSource are defaulted
        try:
            freq = IncomeFrequency(model.frequency)
        except Exception:
            freq = IncomeFrequency.MONTHLY
        return Income(
            id=model.id,
            user_id=model.user_id,
            description=getattr(model, "name", None) or getattr(model, "description", "Income"),
            amount=Money(Decimal(str(model.amount)), "KES"),
            income_type=IncomeType.OTHER,
            frequency=freq,
            is_recurring=freq != IncomeFrequency.IRREGULAR,
            start_date=None,
            end_date=None,
            temporal_pattern=TemporalPattern.PERMANENT,
            linked_asset_id=None,
            asset_relationship_type=None,
            is_taxable=True,
            tax_category="other",
            growth_rate=None,
            is_active=True,
            notes=None,
            created_at=None,
            updated_at=None,
        )
