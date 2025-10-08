"""
Enhanced Expense Management API v2 - KISS Asset/Liability Linking
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime

from ....application.use_cases.manage_expense import (
    UpdateExpenseWithLinking, ConvertExpenseToLiability, 
    AnalyzeUserExpensesWithLinking, GetExpenseConversionRecommendations,
    GetAssetLiabilityOptions,
    UpdateExpenseWithLinkingRequest, ExpenseToLiabilityConversionRequest
)
from ....domain.entities.expense import ExpenseType
from ....domain.entities.liability import LiabilityType
from ....domain.entities.money import Money
from ....infrastructure.database import get_db_session
from ....infrastructure.repositories.sqlalchemy_expense_repository import SQLAlchemyExpenseRepository
from ....infrastructure.repositories.sqlalchemy_asset_repository import SQLAlchemyAssetRepository
from ....infrastructure.repositories.sqlalchemy_liability_repository import SQLAlchemyLiabilityRepository
from ...dependencies import get_current_user

router = APIRouter(prefix="/expense-v2-enhanced", tags=["Enhanced Expense Management"])


# Request Models
class UpdateExpenseWithLinkingRequestModel(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    expense_type: Optional[str] = None
    # KISS Asset/Liability Linking
    related_asset_id: Optional[int] = None
    related_liability_id: Optional[int] = None
    relationship_type: Optional[str] = None
    # Finite vs Infinite Classification
    is_finite_payment: Optional[bool] = None
    total_payments_remaining: Optional[int] = None
    payment_end_date: Optional[datetime] = None
    # Other fields
    is_recurring: Optional[bool] = None
    frequency_months: Optional[int] = None
    vendor: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class ExpenseToLiabilityConversionRequestModel(BaseModel):
    liability_name: str
    liability_type: str
    principal_balance: float
    currency: str = "KES"
    interest_rate: Optional[float] = None
    term_months: Optional[int] = None


# Response Models
class EnhancedExpenseAnalysisResponseModel(BaseModel):
    total_monthly_expenses: dict
    total_annual_expenses: dict
    asset_linked_expenses: dict
    liability_linked_expenses: dict
    finite_payment_expenses: dict
    convertible_to_liability_expenses: dict
    expense_breakdown_by_category: dict
    financial_health_score: float


# Dependency injection
def get_update_expense_with_linking_use_case(session = Depends(get_db_session)):
    expense_repo = SQLAlchemyExpenseRepository(session)
    asset_repo = SQLAlchemyAssetRepository(session)
    liability_repo = SQLAlchemyLiabilityRepository(session)
    return UpdateExpenseWithLinking(expense_repo, asset_repo, liability_repo)


def get_convert_expense_to_liability_use_case(session = Depends(get_db_session)):
    expense_repo = SQLAlchemyExpenseRepository(session)
    liability_repo = SQLAlchemyLiabilityRepository(session)
    return ConvertExpenseToLiability(expense_repo, liability_repo)


def get_analyze_expenses_with_linking_use_case(session = Depends(get_db_session)):
    expense_repo = SQLAlchemyExpenseRepository(session)
    return AnalyzeUserExpensesWithLinking(expense_repo)


def get_conversion_recommendations_use_case(session = Depends(get_db_session)):
    expense_repo = SQLAlchemyExpenseRepository(session)
    return GetExpenseConversionRecommendations(expense_repo)


def get_asset_liability_options_use_case(session = Depends(get_db_session)):
    asset_repo = SQLAlchemyAssetRepository(session)
    liability_repo = SQLAlchemyLiabilityRepository(session)
    return GetAssetLiabilityOptions(asset_repo, liability_repo)


# API Endpoints
@router.put("/{expense_id}/link", response_model=dict)
async def update_expense_with_linking(
    expense_id: int,
    request: UpdateExpenseWithLinkingRequestModel,
    current_user = Depends(get_current_user),
    use_case: UpdateExpenseWithLinking = Depends(get_update_expense_with_linking_use_case)
):
    """
    Update expense with KISS asset/liability linking.
    
    KISS Flow:
    1. User edits expense
    2. User selects "Related to asset?" → dropdown of assets
    3. User selects "Related to liability?" → dropdown of liabilities  
    4. User confirms "Is this finite?" → Yes/No + payment details
    5. System updates with proper linking
    """
    try:
        # Convert request
        update_request = UpdateExpenseWithLinkingRequest(
            expense_id=expense_id,
            user_id=current_user.id,
            description=request.description,
            amount=Money(request.amount, request.currency or "KES") if request.amount else None,
            expense_type=ExpenseType(request.expense_type) if request.expense_type else None,
            related_asset_id=request.related_asset_id,
            related_liability_id=request.related_liability_id,
            relationship_type=request.relationship_type,
            is_finite_payment=request.is_finite_payment,
            total_payments_remaining=request.total_payments_remaining,
            payment_end_date=request.payment_end_date,
            is_recurring=request.is_recurring,
            frequency_months=request.frequency_months,
            vendor=request.vendor,
            notes=request.notes,
            is_active=request.is_active
        )
        
        expense = await use_case.execute(update_request)
        return expense.to_dict()
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error updating expense"
        )


@router.post("/{expense_id}/convert-to-liability")
async def convert_expense_to_liability(
    expense_id: int,
    request: ExpenseToLiabilityConversionRequestModel,
    current_user = Depends(get_current_user),
    use_case: ConvertExpenseToLiability = Depends(get_convert_expense_to_liability_use_case)
):
    """
    Convert finite payment expense to proper liability.
    
    Richard's Use Case:
    - 33,253 KES monthly payment (currently infinite expense)
    - User confirms: "Is this finite?" → Yes
    - User provides: 36 payments remaining
    - System creates liability with 1,197,108 KES balance
    - Links expense to liability as payment
    """
    try:
        conversion_request = ExpenseToLiabilityConversionRequest(
            expense_id=expense_id,
            user_id=current_user.id,
            liability_name=request.liability_name,
            liability_type=LiabilityType(request.liability_type),
            principal_balance=Money(request.principal_balance, request.currency),
            interest_rate=request.interest_rate,
            term_months=request.term_months
        )
        
        liability, expense = await use_case.execute(conversion_request)
        
        return {
            "message": "Expense successfully converted to liability",
            "created_liability": liability.to_dict(),
            "updated_expense": expense.to_dict()
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error converting expense"
        )


@router.get("/analysis/enhanced", response_model=EnhancedExpenseAnalysisResponseModel)
async def get_enhanced_expense_analysis(
    current_user = Depends(get_current_user),
    use_case: AnalyzeUserExpensesWithLinking = Depends(get_analyze_expenses_with_linking_use_case)
):
    """Get comprehensive expense analysis with asset/liability linking information"""
    try:
        analysis = await use_case.execute(current_user.id)
        
        return {
            "total_monthly_expenses": analysis.total_monthly_expenses.to_dict(),
            "total_annual_expenses": analysis.total_annual_expenses.to_dict(),
            "asset_linked_expenses": analysis.asset_linked_expenses.to_dict(),
            "liability_linked_expenses": analysis.liability_linked_expenses.to_dict(),
            "finite_payment_expenses": analysis.finite_payment_expenses.to_dict(),
            "convertible_to_liability_expenses": analysis.convertible_to_liability_expenses.to_dict(),
            "expense_breakdown_by_category": analysis.expense_breakdown_by_category,
            "financial_health_score": analysis.financial_health_score
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error analyzing expenses"
        )


@router.get("/conversion-recommendations")
async def get_expense_conversion_recommendations(
    current_user = Depends(get_current_user),
    use_case: GetExpenseConversionRecommendations = Depends(get_conversion_recommendations_use_case)
):
    """
    Get recommendations for converting expenses to liabilities.
    
    KISS Flow:
    - Shows expenses that should be liabilities
    - "33,253 KES loan payment → Convert to liability?"
    - One-click conversion suggestions
    """
    try:
        recommendations = await use_case.execute(current_user.id)
        
        return {
            "recommendations": recommendations,
            "total_convertible": len(recommendations),
            "message": "These expenses should be converted to liabilities for accurate balance sheet treatment"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error getting recommendations"
        )


@router.get("/linking-options")
async def get_asset_liability_linking_options(
    current_user = Depends(get_current_user),
    use_case: GetAssetLiabilityOptions = Depends(get_asset_liability_options_use_case)
):
    """
    Get available assets and liabilities for expense linking dropdowns.
    
    KISS UI Support:
    - Dropdown of assets that can have expenses (car, property, business)
    - Dropdown of liabilities that have payments (loans, mortgages)
    - User selects from existing options or "Create New"
    """
    try:
        options = await use_case.execute(current_user.id)
        
        return {
            **options,
            "instructions": {
                "asset_linking": "Select an asset this expense maintains/operates",
                "liability_linking": "Select a loan/debt this expense pays down",
                "relationship_types": {
                    "asset_maintenance": "Regular maintenance costs",
                    "asset_operation": "Operating costs (fuel, utilities)",
                    "loan_payment": "Monthly loan/mortgage payment",
                    "business_operating": "Business operational expense"
                }
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error getting linking options"
        )