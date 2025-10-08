"""
Expense Management API V2 - Clean Architecture Implementation
CFA-compliant expense tracking with domain entities and budgeting analysis
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime

from app.auth import get_current_user
from app.models import User
from app.database import get_db

# Import domain entities and enums
from app.domain.entities.expense import Expense, ExpenseType, ExpenseCategory
from app.domain.entities.money import Money

# Import repository
from app.infrastructure.repositories.sqlalchemy_expense_repository import SqlAlchemyExpenseRepository

# Import use cases (we'll create these)
from app.application.use_cases.get_expenses_summary import GetExpensesSummary
from app.application.use_cases.create_expense import CreateExpense
from app.application.use_cases.update_expense import UpdateExpense

router = APIRouter(prefix="/expenses-v2", tags=["expenses-v2-clean"])


def get_expense_repository(db: Session = Depends(get_db)) -> SqlAlchemyExpenseRepository:
    """Dependency injection for expense repository"""
    return SqlAlchemyExpenseRepository(db)


def get_expenses_summary_use_case(db: Session = Depends(get_db)) -> GetExpensesSummary:
    """Dependency injection for expenses summary use case"""
    repository = SqlAlchemyExpenseRepository(db)
    return GetExpensesSummary(repository)


def get_create_expense_use_case(db: Session = Depends(get_db)) -> CreateExpense:
    """Dependency injection for create expense use case"""
    repository = SqlAlchemyExpenseRepository(db)
    return CreateExpense(repository)


def get_update_expense_use_case(db: Session = Depends(get_db)) -> UpdateExpense:
    """Dependency injection for update expense use case"""
    repository = SqlAlchemyExpenseRepository(db)
    return UpdateExpense(repository)


@router.get("/health")
async def expenses_health_check():
    """Health check endpoint for expenses service"""
    return {
        "status": "healthy",
        "service": "expenses-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True,
        "features": [
            "expense_tracking", "budget_analysis", "recurring_expenses",
            "expense_categorization", "financial_ratios", "cash_flow_analysis"
        ]
    }


@router.get("/", response_model=Dict[str, Any])
async def get_expenses_summary_v2(
    current_user: User = Depends(get_current_user),
    use_case: GetExpensesSummary = Depends(get_expenses_summary_use_case),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive expenses summary using clean architecture.
    
    Returns expense analysis with:
    - All user expenses with categorization
    - CFA-standard budget analysis (Fixed, Variable, Discretionary)
    - Essential vs. non-essential expense classification
    - Recurring expense projections and cash flow impact
    - Expense ratios and financial health indicators
    - Onboarding data integration
    """
    try:
        print(f"DEBUG: Expenses endpoint called for user {current_user.id}")
        # Get regular expenses from database
        result = await use_case.execute(current_user.id)
        print(f"DEBUG: Use case result: {result}")
        print(f"DEBUG: Number of expenses from DB: {len(result['expenses'])}")
        
        # Get onboarding expenses
        from app.models import OnboardingState
        onboarding = db.query(OnboardingState).filter(OnboardingState.user_id == current_user.id).first()
        onboarding_expenses = []
        
        print(f"DEBUG: Onboarding found for user {current_user.id}: {onboarding is not None}")
        if onboarding:
            print(f"DEBUG: Financial data exists: {onboarding.financial_data is not None}")
            if onboarding.financial_data:
                print(f"DEBUG: Financial data: {onboarding.financial_data}")
        
        if onboarding and onboarding.financial_data:
            financial_data = onboarding.financial_data
            
            # Convert standard expense categories from onboarding
            standard_expenses = [
                {"name": "Rent", "amount": financial_data.get('rent', 0), "type": "housing"},
                {"name": "Utilities", "amount": financial_data.get('utilities', 0), "type": "utilities"}, 
                {"name": "Groceries", "amount": financial_data.get('groceries', 0), "type": "food_dining"},
                {"name": "Transport", "amount": financial_data.get('transport', 0), "type": "transportation"},
                {"name": "Loan Repayments", "amount": financial_data.get('loanRepayments', 0), "type": "debt_payment"}
            ]
            
            for expense in standard_expenses:
                if expense["amount"] > 0:
                    onboarding_expenses.append({
                        "id": f"onboarding-{expense['type']}",
                        "description": f"{expense['name']} (from onboarding)",
                        "amount": float(expense["amount"]),
                        "expense_type": expense["type"],
                        "expense_category": "fixed_expenses" if expense["type"] in ["housing", "debt_payment"] else "variable_expenses",
                        "expense_date": None,
                        "is_recurring": True,
                        "frequency_months": 1,
                        "annual_projection": float(expense["amount"]) * 12,
                        "monthly_equivalent": float(expense["amount"]),
                        "is_essential": True,
                        "budget_impact_score": 8 if expense["type"] in ["housing", "debt_payment"] else 6,
                        "financial_health_impact": "high" if expense["type"] in ["housing", "debt_payment"] else "medium",
                        "vendor": None,
                        "notes": f"Imported from onboarding - {expense['name']}",
                        "is_active": True,
                        "currency": "KES",
                        "source": "onboarding"
                    })
            
            # Add custom expenses from onboarding
            custom_expenses = financial_data.get('customExpenses', [])
            for custom_expense in custom_expenses:
                onboarding_expenses.append({
                    "id": f"onboarding-custom-{custom_expense.get('id', 0)}",
                    "description": f"{custom_expense.get('name', 'Custom Expense')} (from onboarding)",
                    "amount": float(custom_expense.get('amount', 0)),
                    "expense_type": "other",
                    "expense_category": "discretionary_expenses",
                    "expense_date": None,
                    "is_recurring": True,
                    "frequency_months": 1,
                    "annual_projection": float(custom_expense.get('amount', 0)) * 12,
                    "monthly_equivalent": float(custom_expense.get('amount', 0)),
                    "is_essential": False,
                    "budget_impact_score": 4,
                    "financial_health_impact": "low",
                    "vendor": None,
                    "notes": f"Custom expense from onboarding - {custom_expense.get('name', 'Unnamed')}",
                    "is_active": True,
                    "currency": "KES",
                    "source": "onboarding"
                })
        
        # Convert database expenses to API format
        database_expenses = []
        for expense_info in result["expenses"]:
            database_expenses.append({
                "id": expense_info["id"],
                "description": expense_info["description"],
                "amount": float(expense_info["amount"].amount),
                "expense_type": expense_info["expense_type"],
                "expense_category": expense_info["expense_category"],
                "expense_date": expense_info["expense_date"],
                "is_recurring": expense_info["is_recurring"],
                "frequency_months": expense_info["frequency_months"],
                "annual_projection": float(expense_info["annual_projection"].amount),
                "monthly_equivalent": float(expense_info["monthly_equivalent"].amount),
                "is_essential": expense_info["is_essential"],
                "budget_impact_score": expense_info["budget_impact_score"],
                "financial_health_impact": expense_info["financial_health_impact"],
                "vendor": expense_info["vendor"],
                "notes": expense_info["notes"],
                "is_active": expense_info["is_active"],
                "currency": "KES",
                "source": "database"
            })
        
        # Combine onboarding and database expenses
        all_expenses = onboarding_expenses + database_expenses
        total_amount = sum(exp["amount"] for exp in all_expenses)
        monthly_recurring = sum(exp["monthly_equivalent"] for exp in all_expenses if exp["is_recurring"])
        
        return {
            "user_id": current_user.id,
            "expenses": all_expenses,
            "data_sources": {
                "onboarding_expenses": len(onboarding_expenses),
                "dedicated_expenses": len(database_expenses)
            },
            "summary": {
                "total_expenses": len(all_expenses),
                "total_amount": total_amount,
                "monthly_recurring_total": monthly_recurring,
                "expense_count_by_category": result["summary"]["expense_count_by_category"],
                "expense_count_by_type": result["summary"]["expense_count_by_type"],
                "essential_expenses": result["summary"]["essential_expenses"],
                "discretionary_expenses": result["summary"]["discretionary_expenses"],
                "currency": "KES"
            },
            "budget_analysis": {
                "fixed_expenses_percentage": result["budget_analysis"]["fixed_expenses_percentage"],
                "variable_expenses_percentage": result["budget_analysis"]["variable_expenses_percentage"],
                "discretionary_expenses_percentage": result["budget_analysis"]["discretionary_expenses_percentage"],
                "essential_vs_discretionary_ratio": result["budget_analysis"]["essential_vs_discretionary_ratio"],
                "monthly_cash_flow_impact": float(result["budget_analysis"]["monthly_cash_flow_impact"].amount)
            },
            "financial_health": {
                "budget_discipline_score": result["financial_health"]["budget_discipline_score"],
                "spending_pattern_analysis": result["financial_health"]["spending_pattern_analysis"],
                "recommendations": result["financial_health"]["recommendations"]
            },
            "metadata": {
                "calculation_method": "clean_architecture",
                "cfa_compliant": True,
                "currency": "KES",
                "expense_analysis_standard": "CFA_Institute"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving expenses summary: {str(e)}"
        )


@router.post("/", response_model=Dict[str, Any])
async def create_expense_v2(
    expense_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    use_case: CreateExpense = Depends(get_create_expense_use_case)
):
    """
    Create new expense with CFA-compliant validation.
    
    Expected expense_data format:
    {
        "description": "Rent Payment - Kilimani Apartment",
        "amount": 45000.00,
        "expense_type": "housing",
        "expense_date": "2024-08-01T00:00:00Z",
        "is_recurring": true,
        "frequency_months": 1,
        "vendor": "Property Manager Ltd",
        "notes": "Monthly rent payment"
    }
    """
    try:
        result = await use_case.execute(current_user.id, expense_data)
        
        return {
            "success": True,
            "expense": result.to_dict(),
            "message": f"Expense '{result.description}' created successfully",
            "budget_impact": {
                "budget_impact_score": result.get_budget_impact_score(),
                "financial_health_impact": result.financial_health_impact,
                "annual_projection": float(result.calculate_annual_projection().amount),
                "monthly_equivalent": float(result.calculate_monthly_equivalent().amount)
            },
            "metadata": {
                "created_at": result.created_at.isoformat(),
                "cfa_compliant": True
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid expense data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating expense: {str(e)}"
        )


@router.get("/overview", response_model=Dict[str, Any])
async def get_expenses_overview_v2(
    current_user: User = Depends(get_current_user),
    use_case: GetExpensesSummary = Depends(get_expenses_summary_use_case),
    db: Session = Depends(get_db)
):
    """
    Get expenses overview with onboarding integration.
    Alias for the main endpoint that includes onboarding data.
    """
    return await get_expenses_summary_v2(current_user, use_case, db)


@router.get("/{expense_id}", response_model=Dict[str, Any])
async def get_expense_by_id_v2(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyExpenseRepository = Depends(get_expense_repository)
):
    """Get specific expense by ID with detailed analysis"""
    try:
        expense = await repository.get_expense_by_id(current_user.id, expense_id)
        
        if not expense:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense {expense_id} not found"
            )
        
        # Mock monthly income for ratio calculation (should come from user profile)
        monthly_income = Money(150000)  # KES 150,000 default
        
        return {
            "success": True,
            "expense": expense.to_dict(),
            "financial_metrics": {
                "amount": float(expense.amount.amount),
                "annual_projection": float(expense.calculate_annual_projection().amount),
                "monthly_equivalent": float(expense.calculate_monthly_equivalent().amount),
                "expense_ratio": float(expense.calculate_expense_ratio(monthly_income)),
                "is_ratio_healthy": expense.is_expense_ratio_healthy(monthly_income),
                "budget_impact_score": expense.get_budget_impact_score(),
                "financial_health_impact": expense.financial_health_impact
            },
            "categorization": {
                "expense_category": expense.get_expense_category().value,
                "is_essential": expense.is_essential,
                "expense_type": expense.expense_type.value
            },
            "metadata": {
                "cfa_compliant": True,
                "currency": "KES"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving expense: {str(e)}"
        )


@router.put("/{expense_id}", response_model=Dict[str, Any])
async def update_expense_v2(
    expense_id: int,
    expense_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    use_case: UpdateExpense = Depends(get_update_expense_use_case)
):
    """Update existing expense with validation"""
    try:
        result = await use_case.execute(current_user.id, expense_id, expense_data)
        
        return {
            "success": True,
            "expense": result.to_dict(),
            "message": f"Expense '{result.description}' updated successfully",
            "metadata": {
                "updated_at": result.updated_at.isoformat() if result.updated_at else None,
                "cfa_compliant": True
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid expense data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating expense: {str(e)}"
        )


@router.delete("/{expense_id}", response_model=Dict[str, Any])
async def delete_expense_v2(
    expense_id: int,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyExpenseRepository = Depends(get_expense_repository)
):
    """Soft delete expense (marks as inactive)"""
    try:
        success = await repository.delete_expense(current_user.id, expense_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Expense {expense_id} not found"
            )
        
        return {
            "success": True,
            "message": f"Expense {expense_id} deleted successfully",
            "metadata": {
                "deleted_at": datetime.now().isoformat(),
                "soft_delete": True
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting expense: {str(e)}"
        )


@router.get("/category/{category}", response_model=List[Dict[str, Any]])
async def get_expenses_by_category_v2(
    category: str,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyExpenseRepository = Depends(get_expense_repository)
):
    """Get expenses filtered by expense type category"""
    try:
        expenses = await repository.get_expenses_by_category(current_user.id, category)
        
        expenses_data = []
        for expense in expenses:
            expenses_data.append(expense.to_dict())
        
        return expenses_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving expenses by category: {str(e)}"
        )


@router.get("/recurring/all", response_model=List[Dict[str, Any]])
async def get_recurring_expenses_v2(
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyExpenseRepository = Depends(get_expense_repository)
):
    """Get all recurring expenses for budget planning"""
    try:
        expenses = await repository.get_recurring_expenses(current_user.id)
        
        expenses_data = []
        total_monthly_impact = Money.zero()
        
        for expense in expenses:
            expense_dict = expense.to_dict()
            monthly_equiv = expense.calculate_monthly_equivalent()
            total_monthly_impact = total_monthly_impact.add(monthly_equiv)
            expenses_data.append(expense_dict)
        
        return {
            "recurring_expenses": expenses_data,
            "summary": {
                "total_recurring_expenses": len(expenses),
                "total_monthly_impact": float(total_monthly_impact.amount),
                "annual_projection": float(total_monthly_impact.multiply(12).amount),
                "currency": "KES"
            },
            "metadata": {
                "cfa_compliant": True,
                "budget_planning_ready": True
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving recurring expenses: {str(e)}"
        )


@router.get("/types/available", response_model=Dict[str, Any])
async def get_available_expense_types():
    """Get all available expense types and categories for frontend forms"""
    expense_types = {}
    for expense_type in ExpenseType:
        # Create a dummy expense to get category
        dummy_expense = Expense(
            id=0, user_id=0, description="", amount=Money(0),
            expense_type=expense_type, expense_date=datetime.now()
        )
        category = dummy_expense.get_expense_category()
        
        if category.value not in expense_types:
            expense_types[category.value] = []
        
        expense_types[category.value].append({
            "value": expense_type.value,
            "label": expense_type.value.replace("_", " ").title(),
            "is_essential": dummy_expense.is_essential,
            "budget_impact_score": dummy_expense.get_budget_impact_score(),
            "financial_health_impact": dummy_expense.financial_health_impact
        })
    
    return {
        "expense_categories": expense_types,
        "category_descriptions": {
            "fixed_expenses": "Same amount each period (rent, insurance, loan payments)",
            "variable_expenses": "Essential but amount varies (groceries, utilities, gas)",
            "discretionary_expenses": "Lifestyle choices (entertainment, dining out, travel)"
        },
        "cfa_expense_guidelines": {
            "housing": "≤ 30% of gross income",
            "transportation": "≤ 15% of gross income",
            "food_dining": "≤ 15% of gross income",
            "debt_payment": "≤ 20% of gross income",
            "savings": "≥ 20% of gross income"
        }
    }