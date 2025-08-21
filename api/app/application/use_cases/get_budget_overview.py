from typing import Optional
from ..dto.budget_dto import BudgetOverviewDto
from ...domain.repositories.budget_repository import BudgetRepository


class GetBudgetOverview:
    """Use case for retrieving budget overview for a user"""
    
    def __init__(self, budget_repository: BudgetRepository):
        self._budget_repository = budget_repository
    
    async def execute(self, user_id: int) -> Optional[BudgetOverviewDto]:
        """
        Execute the get budget overview use case
        
        Args:
            user_id: The user's ID
            
        Returns:
            BudgetOverviewDto if budget exists, None otherwise
        """
        budget = await self._budget_repository.get_by_user_id(user_id)
        if not budget:
            return None
        
        return BudgetOverviewDto(
            monthly_income=budget.monthly_income.amount,
            total_expenses=budget.calculate_total_expenses().amount,
            total_goals=budget.calculate_total_goal_allocations().amount,
            surplus=budget.calculate_surplus().amount,
            categories={name: cat.allocated_amount.amount 
                       for name, cat in budget.categories.items()},
            variance_by_category={name: cat.calculate_variance_percentage() 
                                 for name, cat in budget.categories.items()},
            is_balanced=budget.is_balanced(),
            savings_rate=budget.get_savings_rate(),
            expense_ratio=budget.get_expense_ratio(),
            period_start=budget.period.start_date.isoformat(),
            period_end=budget.period.end_date.isoformat()
        )