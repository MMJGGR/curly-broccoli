from sqlalchemy.orm import Session
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime

from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.entities.budget import Budget, BudgetCategory
from ...domain.value_objects.money import Money
from ...domain.value_objects.period import Period, PeriodType
from ...models import User, Profile, ExpenseCategory, Goal


class SqlAlchemyBudgetRepository(BudgetRepository):
    """SqlAlchemy implementation of BudgetRepository that maps existing tables to domain entities"""
    
    def __init__(self, session: Session):
        self._session = session
    
    async def get_by_user_id(self, user_id: int) -> Optional[Budget]:
        """
        Get the current budget for a user by mapping existing data to domain entities.
        Maps from: Profile (income) + ExpenseCategory (categories) + Goal (goals)
        """
        # Get user profile for income data
        profile = self._session.query(Profile).filter(Profile.user_id == user_id).first()
        if not profile:
            return None
        
        # Get expense categories for budget categories
        expense_categories = self._session.query(ExpenseCategory).filter(
            ExpenseCategory.user_id == user_id,
            ExpenseCategory.is_active == True
        ).all()
        
        # Get goals for goal allocations
        goals = self._session.query(Goal).filter(Goal.user_id == user_id).all()
        
        # Create current month period (defaulting to monthly budgets)
        current_date = date.today()
        period = Period.monthly(current_date.year, current_date.month)
        
        # Map to domain entities
        budget_categories = {}
        for expense_cat in expense_categories:
            # Map database fields to domain category
            budget_categories[expense_cat.name] = BudgetCategory(
                name=expense_cat.name,
                allocated_amount=Money(Decimal(str(expense_cat.budgeted_amount or 0))),
                spent_amount=Money(Decimal(str(expense_cat.actual_amount or 0))),
                category_type=expense_cat.category_type or "expense"
            )
        
        # Map goal allocations
        goal_allocations = {}
        for goal in goals:
            try:
                # Parse target as float and convert to Money
                target_amount = float(goal.target) if goal.target else 0.0
                goal_allocations[goal.name] = Money(Decimal(str(target_amount)))
            except (ValueError, TypeError):
                # Skip goals with invalid target amounts
                continue
        
        # Create Budget domain entity
        return Budget(
            user_id=user_id,
            period=period,
            monthly_income=Money(Decimal(str(profile.monthly_income or 0))),
            categories=budget_categories,
            goal_allocations=goal_allocations,
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat()
        )
    
    async def get_by_user_and_period(self, user_id: int, period: Period) -> Optional[Budget]:
        """
        Get budget for a specific period. Currently maps to current data since
        the existing schema doesn't have period-based budgets yet.
        """
        # For now, return current budget regardless of period
        # TODO: Implement period-based budget storage in future migration
        return await self.get_by_user_id(user_id)
    
    async def save(self, budget: Budget) -> None:
        """
        Save budget by updating existing database tables.
        Maps Budget domain entity back to Profile + ExpenseCategory + Goal tables.
        """
        # Update profile with monthly income
        profile = self._session.query(Profile).filter(Profile.user_id == budget.user_id).first()
        if profile:
            profile.monthly_income = float(budget.monthly_income.amount)
        
        # Update or create expense categories
        for category_name, budget_category in budget.categories.items():
            expense_category = self._session.query(ExpenseCategory).filter(
                ExpenseCategory.user_id == budget.user_id,
                ExpenseCategory.name == category_name
            ).first()
            
            if expense_category:
                # Update existing category
                expense_category.budgeted_amount = float(budget_category.allocated_amount.amount)
                expense_category.actual_amount = float(budget_category.spent_amount.amount)
                expense_category.category_type = budget_category.category_type
                expense_category.updated_at = datetime.utcnow()
            else:
                # Create new category
                new_expense_category = ExpenseCategory(
                    name=category_name,
                    budgeted_amount=float(budget_category.allocated_amount.amount),
                    actual_amount=float(budget_category.spent_amount.amount),
                    category_type=budget_category.category_type,
                    user_id=budget.user_id,
                    is_active=True,
                    created_at=datetime.utcnow(),
                    updated_at=datetime.utcnow()
                )
                self._session.add(new_expense_category)
        
        # Update or create goals
        for goal_name, goal_amount in budget.goal_allocations.items():
            goal = self._session.query(Goal).filter(
                Goal.user_id == budget.user_id,
                Goal.name == goal_name
            ).first()
            
            if goal:
                # Update existing goal
                goal.target = str(float(goal_amount.amount))
            else:
                # Create new goal
                new_goal = Goal(
                    name=goal_name,
                    target=str(float(goal_amount.amount)),
                    current="0",  # Default current to 0
                    progress=0.0,
                    target_date="",  # Default empty
                    user_id=budget.user_id
                )
                self._session.add(new_goal)
        
        # Commit all changes
        self._session.commit()
    
    async def delete(self, user_id: int, period: Period) -> None:
        """
        Delete budget for a specific period.
        Currently deletes all budget data for user since we don't have period-based storage yet.
        """
        # Delete expense categories
        self._session.query(ExpenseCategory).filter(
            ExpenseCategory.user_id == user_id
        ).delete()
        
        # Delete goals
        self._session.query(Goal).filter(
            Goal.user_id == user_id
        ).delete()
        
        # Reset profile monthly income
        profile = self._session.query(Profile).filter(Profile.user_id == user_id).first()
        if profile:
            profile.monthly_income = None
        
        self._session.commit()
    
    async def get_budget_history(self, user_id: int, months: int) -> List[Budget]:
        """
        Get budget history for the specified number of months.
        Currently returns current budget only since we don't have historical data yet.
        TODO: Implement historical budget storage in future migration.
        """
        current_budget = await self.get_by_user_id(user_id)
        return [current_budget] if current_budget else []
    
    async def exists(self, user_id: int, period: Period) -> bool:
        """Check if a budget exists for the given user and period"""
        budget = await self.get_by_user_id(user_id)
        return budget is not None
    
    async def get_all_user_budgets(self, user_id: int) -> List[Budget]:
        """Get all budgets for a user across all periods"""
        current_budget = await self.get_by_user_id(user_id)
        return [current_budget] if current_budget else []
    
    def _create_sample_categories(self, user_id: int) -> List[BudgetCategory]:
        """Helper method to create sample categories if none exist"""
        sample_categories = [
            BudgetCategory(
                name="Groceries",
                allocated_amount=Money(Decimal('800.00')),
                category_type="expense"
            ),
            BudgetCategory(
                name="Transport",
                allocated_amount=Money(Decimal('500.00')),
                category_type="expense"
            ),
            BudgetCategory(
                name="Emergency Fund",
                allocated_amount=Money(Decimal('1000.00')),
                category_type="savings"
            )
        ]
        return sample_categories