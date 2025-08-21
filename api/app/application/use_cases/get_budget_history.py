from typing import List
from decimal import Decimal
from ..dto.budget_dto import BudgetHistoryDto, BudgetOverviewDto
from ...domain.repositories.budget_repository import BudgetRepository


class GetBudgetHistory:
    """Use case for retrieving budget history for a user"""
    
    def __init__(self, budget_repository: BudgetRepository):
        self._budget_repository = budget_repository
    
    async def execute(self, user_id: int, months: int = 12) -> BudgetHistoryDto:
        """
        Execute the get budget history use case
        
        Args:
            user_id: The user's ID
            months: Number of months of history to retrieve
            
        Returns:
            BudgetHistoryDto containing historical budget data
        """
        budgets = await self._budget_repository.get_budget_history(user_id, months)
        
        # Convert domain entities to DTOs
        budget_dtos: List[BudgetOverviewDto] = []
        total_surplus = Decimal('0')
        total_savings_rate = Decimal('0')
        
        for budget in budgets:
            dto = BudgetOverviewDto(
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
            budget_dtos.append(dto)
            total_surplus += dto.surplus
            total_savings_rate += dto.savings_rate
        
        # Calculate averages
        num_budgets = len(budget_dtos)
        average_surplus = total_surplus / num_budgets if num_budgets > 0 else Decimal('0')
        average_savings_rate = total_savings_rate / num_budgets if num_budgets > 0 else Decimal('0')
        
        return BudgetHistoryDto(
            budgets=budget_dtos,
            total_months=num_budgets,
            average_surplus=average_surplus,
            average_savings_rate=average_savings_rate
        )