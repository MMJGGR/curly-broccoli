"""
Budget Management API V2 - Clean Architecture Implementation
CFA-compliant financial calculations using domain entities and use cases
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from ....auth import get_current_user
from ....models import User

# Import clean architecture dependencies
from ....infrastructure.dependencies import (
    get_budget_overview_use_case,
    get_create_budget_category_use_case,
    get_update_budget_category_use_case,
    get_update_category_spending_use_case
)

# Import use cases
from ....application.use_cases.get_budget_overview import GetBudgetOverview
from ....application.use_cases.create_budget_category import CreateBudgetCategory
from ....application.use_cases.update_budget_category import UpdateBudgetCategory, UpdateCategorySpending

# Import DTOs
from ....application.dto.budget_dto import (
    BudgetOverviewDto,
    CreateBudgetCategoryRequest,
    UpdateBudgetCategoryRequest,
    UpdateCategorySpendingRequest
)

router = APIRouter(prefix="/budget-v2", tags=["budget-v2-clean"])


@router.get("/overview", response_model=Dict[str, Any])
async def get_budget_overview_v2(
    current_user: User = Depends(get_current_user),
    use_case: GetBudgetOverview = Depends(get_budget_overview_use_case)
):
    """
    Get comprehensive budget overview using clean architecture.
    
    Returns budget summary with:
    - Monthly income and expenses
    - Category breakdowns with variance analysis
    - Savings rate and financial ratios
    - Goal allocation tracking
    """
    try:
        result = await use_case.execute(current_user.id)
        
        if not result:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Budget not found. Please set up your budget first."
            )
        
        # Convert DTO to API response format
        return {
            "user_id": current_user.id,
            "period": {
                "start_date": result.period_start,
                "end_date": result.period_end,
                "type": "monthly"
            },
            "income": {
                "monthly_income": float(result.monthly_income),
                "currency": "KES"
            },
            "expenses": {
                "total_expenses": float(result.total_expenses),
                "categories": {name: float(amount) for name, amount in result.categories.items()},
                "variance_by_category": {name: float(pct) for name, pct in result.variance_by_category.items()}
            },
            "savings_and_goals": {
                "total_goals": float(result.total_goals),
                "savings_rate": float(result.savings_rate),
                "expense_ratio": float(result.expense_ratio)
            },
            "summary": {
                "surplus": float(result.surplus),
                "is_balanced": result.is_balanced,
                "total_categories": len(result.categories)
            },
            "metadata": {
                "calculation_method": "clean_architecture",
                "precision": "decimal",
                "cfa_compliant": True
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving budget overview: {str(e)}"
        )


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_budget_category_v2(
    category_name: str,
    allocated_amount: float,
    category_type: str = "expense",
    current_user: User = Depends(get_current_user),
    use_case: CreateBudgetCategory = Depends(get_create_budget_category_use_case)
):
    """
    Create a new budget category using clean architecture.
    
    Args:
        category_name: Name of the category (e.g., "Groceries", "Transport")
        allocated_amount: Monthly budget allocation
        category_type: Type of category ("expense", "savings", "investment")
    """
    try:
        # Validate input
        if allocated_amount < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Allocated amount cannot be negative"
            )
        
        if category_type not in ["expense", "savings", "investment"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category type must be 'expense', 'savings', or 'investment'"
            )
        
        # Create request DTO
        request = CreateBudgetCategoryRequest(
            user_id=current_user.id,
            category_name=category_name.strip(),
            allocated_amount=allocated_amount,
            category_type=category_type
        )
        
        # Execute use case
        await use_case.execute(request)
        
        return {
            "message": f"Category '{category_name}' created successfully",
            "category": {
                "name": category_name,
                "allocated_amount": allocated_amount,
                "category_type": category_type,
                "currency": "KES"
            }
        }
        
    except ValueError as e:
        # Handle business rule violations
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating budget category: {str(e)}"
        )


@router.put("/categories/{category_name}/allocation")
async def update_category_allocation_v2(
    category_name: str,
    new_amount: float,
    current_user: User = Depends(get_current_user),
    use_case: UpdateBudgetCategory = Depends(get_update_budget_category_use_case)
):
    """
    Update budget allocation for an existing category.
    
    Args:
        category_name: Name of the category to update
        new_amount: New budget allocation amount
    """
    try:
        if new_amount < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Budget allocation cannot be negative"
            )
        
        # Create request DTO
        request = UpdateBudgetCategoryRequest(
            user_id=current_user.id,
            category_name=category_name,
            new_amount=new_amount
        )
        
        # Execute use case
        await use_case.execute(request)
        
        return {
            "message": f"Budget allocation for '{category_name}' updated successfully",
            "category": category_name,
            "new_allocation": new_amount,
            "currency": "KES"
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating category allocation: {str(e)}"
        )


@router.put("/categories/{category_name}/spending")
async def update_category_spending_v2(
    category_name: str,
    spent_amount: float,
    current_user: User = Depends(get_current_user),
    use_case: UpdateCategorySpending = Depends(get_update_category_spending_use_case)
):
    """
    Update actual spending for a budget category.
    
    Args:
        category_name: Name of the category to update
        spent_amount: Amount actually spent in this category
    """
    try:
        if spent_amount < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Spending amount cannot be negative"
            )
        
        # Create request DTO
        request = UpdateCategorySpendingRequest(
            user_id=current_user.id,
            category_name=category_name,
            spent_amount=spent_amount
        )
        
        # Execute use case
        await use_case.execute(request)
        
        return {
            "message": f"Spending for '{category_name}' updated successfully",
            "category": category_name,
            "spent_amount": spent_amount,
            "currency": "KES"
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating category spending: {str(e)}"
        )


@router.get("/health")
async def budget_health_check():
    """Health check endpoint for budget service"""
    return {
        "status": "healthy",
        "service": "budget-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True,
        "precision": "decimal"
    }