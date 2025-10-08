"""
SqlAlchemy Expense Repository - Clean Architecture Implementation
Foundation Week Day 2 - Expense tracking with CFA-compliant categorization
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_, between
from typing import List, Optional
from datetime import datetime, timezone
from decimal import Decimal

from ...models import Expense as ExpenseModel
from ...domain.entities.expense import Expense, ExpenseType, ExpenseCategory
from ...domain.entities.money import Money
from ...domain.repositories.expense_repository import ExpenseRepository


class SqlAlchemyExpenseRepository(ExpenseRepository):
    """SQLAlchemy implementation of ExpenseRepository interface"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_expenses(self, user_id: int) -> List[Expense]:
        """Get all expenses for a user as domain entities"""
        # Get all user expenses from database, ordered by date (newest first)
        expense_models = self.db.query(ExpenseModel).filter(
            ExpenseModel.user_id == user_id
        ).order_by(ExpenseModel.expense_date.desc()).all()
        
        # Convert to domain entities
        domain_expenses = []
        for model in expense_models:
            try:
                domain_expense = self._model_to_entity(model)
                domain_expenses.append(domain_expense)
            except Exception as e:
                # Log error but continue with other expenses
                print(f"Error converting expense {model.id}: {e}")
                continue
        
        return domain_expenses
    
    async def get_expense_by_id(self, user_id: int, expense_id: int) -> Optional[Expense]:
        """Get specific expense by ID"""
        expense_model = self.db.query(ExpenseModel).filter(
            and_(
                ExpenseModel.id == expense_id,
                ExpenseModel.user_id == user_id
            )
        ).first()
        
        if not expense_model:
            return None
        
        try:
            return self._model_to_entity(expense_model)
        except Exception as e:
            print(f"Error converting expense {expense_model.id}: {e}")
            return None
    
    async def create_expense(self, expense: Expense) -> Expense:
        """Create new expense"""
        try:
            # Convert domain entity to database model
            expense_model = ExpenseModel(
                user_id=expense.user_id,
                description=expense.description,
                amount=expense.amount.amount,
                expense_type=expense.expense_type.value,
                expense_date=expense.expense_date,
                is_recurring=expense.is_recurring,
                frequency_months=expense.frequency_months,
                related_asset_id=expense.related_asset_id,
                vendor=expense.vendor,
                category_override=expense.category_override.value if expense.category_override else None,
                notes=expense.notes,
                is_active=expense.is_active
            )
            
            self.db.add(expense_model)
            self.db.commit()
            self.db.refresh(expense_model)
            
            # Return updated domain entity with new ID
            return self._model_to_entity(expense_model)
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create expense: {str(e)}")
    
    async def update_expense(self, expense: Expense) -> Expense:
        """Update existing expense"""
        try:
            expense_model = self.db.query(ExpenseModel).filter(
                and_(
                    ExpenseModel.id == expense.id,
                    ExpenseModel.user_id == expense.user_id
                )
            ).first()
            
            if not expense_model:
                raise Exception(f"Expense {expense.id} not found")
            
            # Update model fields
            expense_model.description = expense.description
            expense_model.amount = expense.amount.amount
            expense_model.expense_type = expense.expense_type.value
            expense_model.expense_date = expense.expense_date
            expense_model.is_recurring = expense.is_recurring
            expense_model.frequency_months = expense.frequency_months
            expense_model.related_asset_id = expense.related_asset_id
            expense_model.vendor = expense.vendor
            expense_model.category_override = expense.category_override.value if expense.category_override else None
            expense_model.notes = expense.notes
            expense_model.is_active = expense.is_active
            expense_model.updated_at = datetime.now(timezone.utc)
            
            self.db.commit()
            self.db.refresh(expense_model)
            
            return self._model_to_entity(expense_model)
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update expense: {str(e)}")
    
    async def delete_expense(self, user_id: int, expense_id: int) -> bool:
        """Delete expense (soft delete by setting is_active = False)"""
        try:
            expense_model = self.db.query(ExpenseModel).filter(
                and_(
                    ExpenseModel.id == expense_id,
                    ExpenseModel.user_id == expense_id
                )
            ).first()
            
            if not expense_model:
                return False
            
            # Soft delete
            expense_model.is_active = False
            expense_model.updated_at = datetime.now(timezone.utc)
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to delete expense: {str(e)}")
    
    async def get_expenses_by_category(self, user_id: int, category: str) -> List[Expense]:
        """Get expenses filtered by category (expense_type)"""
        expense_models = self.db.query(ExpenseModel).filter(
            and_(
                ExpenseModel.user_id == user_id,
                ExpenseModel.expense_type == category,
                ExpenseModel.is_active == True
            )
        ).order_by(ExpenseModel.expense_date.desc()).all()
        
        domain_expenses = []
        for model in expense_models:
            try:
                domain_expense = self._model_to_entity(model)
                domain_expenses.append(domain_expense)
            except Exception as e:
                print(f"Error converting expense {model.id}: {e}")
                continue
        
        return domain_expenses
    
    async def get_expenses_by_date_range(self, user_id: int, start_date: datetime, end_date: datetime) -> List[Expense]:
        """Get expenses within date range"""
        expense_models = self.db.query(ExpenseModel).filter(
            and_(
                ExpenseModel.user_id == user_id,
                between(ExpenseModel.expense_date, start_date, end_date),
                ExpenseModel.is_active == True
            )
        ).order_by(ExpenseModel.expense_date.desc()).all()
        
        domain_expenses = []
        for model in expense_models:
            try:
                domain_expense = self._model_to_entity(model)
                domain_expenses.append(domain_expense)
            except Exception as e:
                print(f"Error converting expense {model.id}: {e}")
                continue
        
        return domain_expenses
    
    async def get_recurring_expenses(self, user_id: int) -> List[Expense]:
        """Get all recurring expenses for a user"""
        expense_models = self.db.query(ExpenseModel).filter(
            and_(
                ExpenseModel.user_id == user_id,
                ExpenseModel.is_recurring == True,
                ExpenseModel.is_active == True
            )
        ).all()
        
        domain_expenses = []
        for model in expense_models:
            try:
                domain_expense = self._model_to_entity(model)
                domain_expenses.append(domain_expense)
            except Exception as e:
                print(f"Error converting expense {model.id}: {e}")
                continue
        
        # Sort by monthly equivalent amount (highest first)
        domain_expenses.sort(key=lambda e: e.calculate_monthly_equivalent().amount, reverse=True)
        return domain_expenses
    
    async def get_expenses_summary(self, user_id: int) -> dict:
        """Get summary statistics for user's expenses"""
        expense_models = self.db.query(ExpenseModel).filter(
            and_(
                ExpenseModel.user_id == user_id,
                ExpenseModel.is_active == True
            )
        ).all()
        
        total_amount = Money.zero()
        monthly_recurring_total = Money.zero()
        expense_count_by_category = {}
        expense_count_by_type = {}
        
        for model in expense_models:
            try:
                domain_expense = self._model_to_entity(model)
                
                # Accumulate totals
                total_amount = total_amount.add(domain_expense.amount)
                
                # Add monthly equivalent for recurring expenses
                if domain_expense.is_recurring:
                    monthly_equivalent = domain_expense.calculate_monthly_equivalent()
                    monthly_recurring_total = monthly_recurring_total.add(monthly_equivalent)
                
                # Count by category and type
                category = domain_expense.get_expense_category().value
                expense_type = domain_expense.expense_type.value
                
                expense_count_by_category[category] = expense_count_by_category.get(category, 0) + 1
                expense_count_by_type[expense_type] = expense_count_by_type.get(expense_type, 0) + 1
                
            except Exception as e:
                print(f"Error processing expense {model.id}: {e}")
                continue
        
        # Calculate essential vs discretionary split
        essential_count = expense_count_by_category.get("fixed_expenses", 0) + \
                        expense_count_by_category.get("variable_expenses", 0)
        discretionary_count = expense_count_by_category.get("discretionary_expenses", 0)
        
        return {
            "total_expenses": len(expense_models),
            "total_amount": total_amount,
            "monthly_recurring_total": monthly_recurring_total,
            "expense_count_by_category": expense_count_by_category,
            "expense_count_by_type": expense_count_by_type,
            "essential_expenses": essential_count,
            "discretionary_expenses": discretionary_count
        }
    
    def _model_to_entity(self, model: ExpenseModel) -> Expense:
        """Convert database model to domain entity"""
        # Map string expense_type back to enum
        try:
            expense_type = ExpenseType(model.expense_type)
        except ValueError:
            expense_type = ExpenseType.MISCELLANEOUS  # Default fallback
        
        # Map category override if present
        category_override = None
        if model.category_override:
            try:
                category_override = ExpenseCategory(model.category_override)
            except ValueError:
                category_override = None
        
        return Expense(
            id=model.id,
            user_id=model.user_id,
            description=model.description,
            amount=Money(Decimal(str(model.amount))),
            expense_type=expense_type,
            expense_date=model.expense_date,
            is_recurring=model.is_recurring,
            frequency_months=model.frequency_months,
            related_asset_id=model.related_asset_id,
            vendor=model.vendor,
            category_override=category_override,
            notes=model.notes,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at
        )