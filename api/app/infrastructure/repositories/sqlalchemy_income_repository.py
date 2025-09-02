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
from ..models.income_model import IncomeModel


class SQLAlchemyIncomeRepository(IncomeRepository):
    """SQLAlchemy implementation of IncomeRepository"""
    
    def __init__(self, session: Session):
        self._session = session
    
    async def save(self, income: Income) -> Income:
        """Save income to database"""
        try:
            if income.id == 0:
                # Create new
                model = IncomeModel(
                    user_id=income.user_id,
                    description=income.description,
                    amount=float(income.amount.amount),
                    currency=income.amount.currency,
                    income_type=income.income_type.value,
                    frequency=income.frequency.value,
                    is_recurring=income.is_recurring,
                    start_date=income.start_date,
                    end_date=income.end_date,
                    temporal_pattern=income.temporal_pattern.value,
                    linked_asset_id=income.linked_asset_id,
                    asset_relationship_type=income.asset_relationship_type,
                    is_taxable=income.is_taxable,
                    tax_category=income.get_tax_treatment_category(),
                    growth_rate=float(income.growth_rate) if income.growth_rate else None,
                    is_active=income.is_active,
                    notes=income.notes,
                    created_at=income.created_at,
                    updated_at=income.updated_at
                )
                self._session.add(model)
                self._session.flush()
                income.id = model.id
            else:
                # Update existing
                model = self._session.query(IncomeModel).filter_by(id=income.id).first()
                if not model:
                    raise ValueError(f"Income {income.id} not found")
                
                model.description = income.description
                model.amount = float(income.amount.amount)
                model.currency = income.amount.currency
                model.income_type = income.income_type.value
                model.frequency = income.frequency.value
                model.is_recurring = income.is_recurring
                model.start_date = income.start_date
                model.end_date = income.end_date
                model.temporal_pattern = income.temporal_pattern.value
                model.linked_asset_id = income.linked_asset_id
                model.asset_relationship_type = income.asset_relationship_type
                model.is_taxable = income.is_taxable
                model.tax_category = income.get_tax_treatment_category()
                model.growth_rate = float(income.growth_rate) if income.growth_rate else None
                model.is_active = income.is_active
                model.notes = income.notes
                model.updated_at = income.updated_at
            
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
        return Income(
            id=model.id,
            user_id=model.user_id,
            description=model.description,
            amount=Money(Decimal(str(model.amount)), model.currency),
            income_type=IncomeType(model.income_type),
            frequency=IncomeFrequency(model.frequency),
            is_recurring=model.is_recurring,
            start_date=model.start_date,
            end_date=model.end_date,
            temporal_pattern=TemporalPattern(model.temporal_pattern),
            linked_asset_id=model.linked_asset_id,
            asset_relationship_type=model.asset_relationship_type,
            is_taxable=model.is_taxable,
            tax_category=model.tax_category,
            growth_rate=Decimal(str(model.growth_rate)) if model.growth_rate else None,
            is_active=model.is_active,
            notes=model.notes,
            created_at=model.created_at,
            updated_at=model.updated_at
        )