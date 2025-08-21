from datetime import datetime
from ..dto.budget_dto import CreateBudgetRequest
from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.entities.budget import Budget
from ...domain.value_objects.money import Money
from ...domain.value_objects.period import Period, PeriodType


class CreateBudget:
    """Use case for creating a new budget"""
    
    def __init__(self, budget_repository: BudgetRepository):
        self._budget_repository = budget_repository
    
    async def execute(self, request: CreateBudgetRequest) -> None:
        """
        Execute the create budget use case
        
        Args:
            request: CreateBudgetRequest containing budget details
            
        Raises:
            ValueError: If budget already exists for the period or invalid dates
        """
        # Parse dates
        try:
            start_date = datetime.fromisoformat(request.start_date).date()
            end_date = datetime.fromisoformat(request.end_date).date()
        except ValueError as e:
            raise ValueError(f"Invalid date format: {e}")
        
        # Create period
        period_type = PeriodType(request.period_type)
        period = Period(period_type, start_date, end_date)
        
        # Check if budget already exists for this period
        existing_budget = await self._budget_repository.get_by_user_and_period(
            request.user_id, period
        )
        if existing_budget:
            raise ValueError(f"Budget already exists for user {request.user_id} in period {period}")
        
        # Create new budget
        budget = Budget(
            user_id=request.user_id,
            period=period,
            monthly_income=Money(request.monthly_income),
            created_at=datetime.utcnow().isoformat(),
            updated_at=datetime.utcnow().isoformat()
        )
        
        # Save the budget
        await self._budget_repository.save(budget)