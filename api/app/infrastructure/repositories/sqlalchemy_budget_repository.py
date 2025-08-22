from sqlalchemy.orm import Session
from typing import Optional, List
from decimal import Decimal
from datetime import date, datetime

from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.entities.budget import Budget, BudgetCategory
from ...domain.value_objects.money import Money
from ...domain.value_objects.period import Period, PeriodType
from ...models import User, Profile, ExpenseCategory, Goal, OnboardingState


class SqlAlchemyBudgetRepository(BudgetRepository):
    """SqlAlchemy implementation of BudgetRepository that maps existing tables to domain entities"""
    
    def __init__(self, session: Session):
        self._session = session
    
    async def get_by_user_id(self, user_id: int) -> Optional[Budget]:
        """
        Get the current budget for a user by mapping from onboarding financial data.
        Maps from: OnboardingState.financial_data (expenses) + goals_data
        """
        # Get onboarding state which contains the actual financial data
        onboarding_state = self._session.query(OnboardingState).filter(
            OnboardingState.user_id == user_id
        ).first()
        
        if not onboarding_state or not onboarding_state.financial_data:
            raise ValueError("Budget not found. Please set up your budget first.")
        
        financial_data = onboarding_state.financial_data
        goals_data = onboarding_state.goals_data or {}
        
        # Create current month period
        current_date = date.today()
        period = Period.monthly(current_date.year, current_date.month)
        
        # Map standard expense categories from financial_data
        budget_categories = {}
        
        # Standard expense categories
        standard_expenses = {
            'rent': financial_data.get('rent', 0),
            'utilities': financial_data.get('utilities', 0), 
            'groceries': financial_data.get('groceries', 0),
            'transport': financial_data.get('transport', 0),
            'loanRepayments': financial_data.get('loanRepayments', 0)
        }
        
        # Add standard expense categories
        for category_name, amount in standard_expenses.items():
            if amount > 0:
                budget_categories[category_name] = BudgetCategory(
                    name=category_name,
                    allocated_amount=Money(Decimal(str(amount))),
                    spent_amount=Money(Decimal('0')),  # No actual spending tracked yet
                    category_type="expense"
                )
        
        # Add custom expense categories
        custom_expenses = financial_data.get('customExpenses', [])
        for custom_expense in custom_expenses:
            name = custom_expense.get('name', '').strip()
            amount = custom_expense.get('amount', 0)
            if name and amount > 0:
                budget_categories[name] = BudgetCategory(
                    name=name,
                    allocated_amount=Money(Decimal(str(amount))),
                    spent_amount=Money(Decimal('0')),  # No actual spending tracked yet
                    category_type="expense"
                )
        
        # Map goal allocations from goals_data (convert targets to monthly allocations)
        goal_allocations = {}
        timeframes = goals_data.get('timeframes', {})
        
        # Timeframe to months mapping
        timeframe_months = {
            '1-year': 12,
            '3-years': 36,
            '5-years': 60,
            '10-years': 120,
            '30-years': 360
        }
        
        for goal_name, goal_amount in goals_data.items():
            if goal_name != 'timeframes' and goal_amount:
                try:
                    target_amount = float(goal_amount) if goal_amount else 0.0
                    if target_amount > 0:
                        # Get timeframe for this goal
                        timeframe = timeframes.get(goal_name, '10-years')  # Default 10 years
                        months = timeframe_months.get(timeframe, 120)      # Default 120 months
                        
                        # Convert target to monthly allocation
                        monthly_allocation = target_amount / months
                        goal_allocations[goal_name] = Money(Decimal(str(monthly_allocation)))
                except (ValueError, TypeError):
                    # Skip invalid goal amounts
                    continue
        
        # Get monthly income from financial_data
        monthly_income = financial_data.get('monthlyIncome', 0)
        
        # Create Budget domain entity
        return Budget(
            user_id=user_id,
            period=period,
            monthly_income=Money(Decimal(str(monthly_income))),
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