from ..dto.budget_dto import CreateBudgetCategoryRequest
from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.entities.budget import BudgetCategory
from ...domain.value_objects.money import Money
from decimal import Decimal


class CreateBudgetCategory:
    """Use case for creating a new budget category"""
    
    def __init__(self, budget_repository: BudgetRepository):
        self._budget_repository = budget_repository
    
    async def execute(self, request: CreateBudgetCategoryRequest) -> None:
        """
        Execute the create budget category use case
        
        Args:
            request: CreateBudgetCategoryRequest containing category details
            
        Raises:
            ValueError: If budget not found or category already exists
        """
        budget = await self._budget_repository.get_by_user_id(request.user_id)
        if not budget:
            raise ValueError(f"Budget not found for user {request.user_id}")
        
        # Check if category already exists
        if request.category_name in budget.categories:
            raise ValueError(f"Category '{request.category_name}' already exists")
        
        # Create new category
        new_category = BudgetCategory(
            name=request.category_name,
            allocated_amount=Money(request.allocated_amount),
            category_type=request.category_type
        )
        
        # Add category to budget
        budget.add_category(new_category)
        
        # Save the updated budget
        await self._budget_repository.save(budget)