from ..dto.budget_dto import CreateBudgetCategoryRequest
from ...domain.repositories.budget_repository import BudgetRepository
from ...domain.entities.budget import BudgetCategory
from ...domain.value_objects.money import Money
from app.domain.services.validation_service import CFAValidationService
from ..exceptions import ValidationException, BusinessRuleViolationException, raise_validation_error
from decimal import Decimal


class CreateBudgetCategory:
    """Use case for creating a new budget category"""
    
    def __init__(self, budget_repository: BudgetRepository):
        self._budget_repository = budget_repository
    
    async def execute(self, request: CreateBudgetCategoryRequest) -> None:
        """
        Execute the create budget category use case with CFA validation
        
        Args:
            request: CreateBudgetCategoryRequest containing category details
            
        Raises:
            ValidationException: If validation fails
            BusinessRuleViolationException: If business rules are violated
        """
        budget = await self._budget_repository.get_by_user_id(request.user_id)
        if not budget:
            raise ValueError(f"Budget not found for user {request.user_id}")
        
        # Check if category already exists
        if request.category_name in budget.categories:
            raise BusinessRuleViolationException(
                f"Category '{request.category_name}' already exists",
                "DUPLICATE_CATEGORY",
                {"category_name": request.category_name, "user_id": request.user_id}
            )
        
        # Create new category
        new_category = BudgetCategory(
            name=request.category_name,
            allocated_amount=Money(request.allocated_amount),
            category_type=request.category_type
        )
        
        # CFA Validation: Validate the category
        validation_errors = CFAValidationService.validate_budget_category(new_category, budget.monthly_income)
        if validation_errors:
            raise_validation_error(validation_errors)
        
        # Business Rule: Check total budget doesn't exceed income after adding category
        total_expenses_after = budget.calculate_total_expenses().add(new_category.allocated_amount)
        total_savings = budget.calculate_total_savings_allocations()
        total_goals = budget.calculate_total_goal_allocations()
        
        total_commitments = total_expenses_after.add(total_savings).add(total_goals)
        
        if total_commitments.amount > budget.monthly_income.amount:
            overage = total_commitments.amount - budget.monthly_income.amount
            raise BusinessRuleViolationException(
                f"Adding category would exceed budget by {overage} KES",
                "BUDGET_EXCEEDED",
                {
                    "overage_amount": float(overage),
                    "category_name": request.category_name,
                    "monthly_income": float(budget.monthly_income.amount)
                }
            )
        
        # Add category to budget
        budget.add_category(new_category)
        
        # Final validation of complete budget
        budget_validation_errors = CFAValidationService.validate_budget(budget)
        if budget_validation_errors:
            raise_validation_error(budget_validation_errors)
        
        # Save the updated budget
        await self._budget_repository.save(budget)