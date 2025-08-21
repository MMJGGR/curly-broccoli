from ..dto.budget_dto import UpdateBudgetCategoryRequest, UpdateCategorySpendingRequest
from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.value_objects.money import Money


class UpdateBudgetCategory:
    """Use case for updating budget category allocation"""
    
    def __init__(self, budget_repository: BudgetRepository):
        self._budget_repository = budget_repository
    
    async def execute(self, request: UpdateBudgetCategoryRequest) -> None:
        """
        Execute the update budget category use case
        
        Args:
            request: UpdateBudgetCategoryRequest containing update details
            
        Raises:
            ValueError: If budget or category not found
        """
        budget = await self._budget_repository.get_by_user_id(request.user_id)
        if not budget:
            raise ValueError(f"Budget not found for user {request.user_id}")
        
        # Update category allocation
        budget.update_category_allocation(
            request.category_name, 
            Money(request.new_amount)
        )
        
        # Save the updated budget
        await self._budget_repository.save(budget)


class UpdateCategorySpending:
    """Use case for updating category spending amounts"""
    
    def __init__(self, budget_repository: BudgetRepository):
        self._budget_repository = budget_repository
    
    async def execute(self, request: UpdateCategorySpendingRequest) -> None:
        """
        Execute the update category spending use case
        
        Args:
            request: UpdateCategorySpendingRequest containing spending details
            
        Raises:
            ValueError: If budget or category not found
        """
        budget = await self._budget_repository.get_by_user_id(request.user_id)
        if not budget:
            raise ValueError(f"Budget not found for user {request.user_id}")
        
        # Update category spending
        budget.update_category_spending(
            request.category_name, 
            Money(request.spent_amount)
        )
        
        # Save the updated budget
        await self._budget_repository.save(budget)