"""
Enhanced Expense Management Use Cases - KISS Asset/Liability Linking
"""
from typing import List, Optional
from dataclasses import dataclass
from datetime import datetime

from ..interfaces.expense_repository import ExpenseRepository
from ..interfaces.asset_repository import AssetRepository
from ..interfaces.liability_repository import LiabilityRepository
from ...domain.entities.expense import Expense, ExpenseType, ExpenseCategory
from ...domain.entities.money import Money
from ...domain.entities.liability import Liability, LiabilityType


@dataclass
class UpdateExpenseWithLinkingRequest:
    """Enhanced request for updating expense with asset/liability linking"""
    expense_id: int
    user_id: int
    description: Optional[str] = None
    amount: Optional[Money] = None
    expense_type: Optional[ExpenseType] = None
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


@dataclass
class ExpenseToLiabilityConversionRequest:
    """Request to convert finite expense to liability"""
    expense_id: int
    user_id: int
    liability_name: str
    liability_type: LiabilityType
    principal_balance: Money
    interest_rate: Optional[float] = None
    term_months: Optional[int] = None


@dataclass
class ExpenseAnalysisResponse:
    """Enhanced expense analysis with linking information"""
    total_monthly_expenses: Money
    total_annual_expenses: Money
    asset_linked_expenses: Money
    liability_linked_expenses: Money
    finite_payment_expenses: Money
    convertible_to_liability_expenses: Money
    expense_breakdown_by_category: dict
    financial_health_score: float


class UpdateExpenseWithLinking:
    """Use case for updating expense with enhanced asset/liability linking"""
    
    def __init__(self, expense_repository: ExpenseRepository, 
                 asset_repository: AssetRepository,
                 liability_repository: LiabilityRepository):
        self._expense_repository = expense_repository
        self._asset_repository = asset_repository
        self._liability_repository = liability_repository
    
    async def execute(self, request: UpdateExpenseWithLinkingRequest) -> Expense:
        """
        Update expense with KISS asset/liability linking.
        
        Args:
            request: Enhanced update request with linking options
            
        Returns:
            Expense: Updated expense entity
            
        Raises:
            ValueError: If expense not found or linking validation fails
        """
        # Get existing expense
        expense = await self._expense_repository.get_by_id(request.expense_id)
        if not expense or expense.user_id != request.user_id:
            raise ValueError(f"Expense {request.expense_id} not found or not owned by user")
        
        # Validate asset linking if provided
        if request.related_asset_id:
            asset = await self._asset_repository.get_by_id(request.related_asset_id)
            if not asset or asset.user_id != request.user_id:
                raise ValueError(f"Asset {request.related_asset_id} not found or not owned by user")
        
        # Validate liability linking if provided  
        if request.related_liability_id:
            liability = await self._liability_repository.get_by_id(request.related_liability_id)
            if not liability or liability.user_id != request.user_id:
                raise ValueError(f"Liability {request.related_liability_id} not found or not owned by user")
        
        # Update fields if provided
        if request.description is not None:
            expense.description = request.description
        if request.amount is not None:
            expense.amount = request.amount
        if request.expense_type is not None:
            expense.expense_type = request.expense_type
        if request.related_asset_id is not None:
            expense.related_asset_id = request.related_asset_id
        if request.related_liability_id is not None:
            expense.related_liability_id = request.related_liability_id
        if request.relationship_type is not None:
            expense.relationship_type = request.relationship_type
        if request.is_finite_payment is not None:
            expense.is_finite_payment = request.is_finite_payment
        if request.total_payments_remaining is not None:
            expense.total_payments_remaining = request.total_payments_remaining
        if request.payment_end_date is not None:
            expense.payment_end_date = request.payment_end_date
        if request.is_recurring is not None:
            expense.is_recurring = request.is_recurring
        if request.frequency_months is not None:
            expense.frequency_months = request.frequency_months
        if request.vendor is not None:
            expense.vendor = request.vendor
        if request.notes is not None:
            expense.notes = request.notes
        if request.is_active is not None:
            expense.is_active = request.is_active
        
        expense.updated_at = datetime.utcnow()
        
        return await self._expense_repository.save(expense)


class ConvertExpenseToLiability:
    """Use case for converting finite expense to liability"""
    
    def __init__(self, expense_repository: ExpenseRepository,
                 liability_repository: LiabilityRepository):
        self._expense_repository = expense_repository
        self._liability_repository = liability_repository
    
    async def execute(self, request: ExpenseToLiabilityConversionRequest) -> tuple[Liability, Expense]:
        """
        Convert finite payment expense to proper liability.
        
        KISS Flow: User confirms expense is finite → System creates liability → Links expense to liability
        
        Args:
            request: Conversion request with liability details
            
        Returns:
            tuple[Liability, Expense]: Created liability and updated expense
            
        Raises:
            ValueError: If expense not found or not suitable for conversion
        """
        # Get and validate expense
        expense = await self._expense_repository.get_by_id(request.expense_id)
        if not expense or expense.user_id != request.user_id:
            raise ValueError(f"Expense {request.expense_id} not found or not owned by user")
        
        if not expense.should_convert_to_liability():
            raise ValueError(f"Expense {request.expense_id} is not suitable for liability conversion")
        
        # Create new liability
        liability = Liability(
            id=0,  # Will be set by repository
            user_id=request.user_id,
            name=request.liability_name,
            liability_type=request.liability_type,
            balance=request.principal_balance,
            original_amount=request.principal_balance,
            interest_rate=request.interest_rate,
            minimum_payment=expense.amount,
            due_date=None,  # Monthly payment
            term_months=request.term_months,
            is_secured=False,  # Default for personal loans
            collateral_description=None,
            notes=f"Created from expense: {expense.description}",
            is_active=True
        )
        
        # Save liability
        created_liability = await self._liability_repository.save(liability)
        
        # Link expense to liability
        expense.related_liability_id = created_liability.id
        expense.relationship_type = "loan_payment"
        expense.updated_at = datetime.utcnow()
        
        # Update expense
        updated_expense = await self._expense_repository.save(expense)
        
        return created_liability, updated_expense


class AnalyzeUserExpensesWithLinking:
    """Enhanced expense analysis including asset/liability relationships"""
    
    def __init__(self, expense_repository: ExpenseRepository):
        self._expense_repository = expense_repository
    
    async def execute(self, user_id: int) -> ExpenseAnalysisResponse:
        """
        Analyze user's expenses with enhanced linking information.
        
        Args:
            user_id: User identifier
            
        Returns:
            ExpenseAnalysisResponse: Comprehensive expense analysis
        """
        expenses = await self._expense_repository.get_by_user_id(user_id, include_inactive=False)
        
        # Calculate totals
        total_monthly = Money.zero()
        asset_linked = Money.zero()
        liability_linked = Money.zero()
        finite_payment = Money.zero()
        convertible = Money.zero()
        
        category_breakdown = {
            "fixed_expenses": Money.zero(),
            "variable_expenses": Money.zero(),
            "discretionary_expenses": Money.zero()
        }
        
        health_scores = []
        
        for expense in expenses:
            monthly_amount = expense.calculate_monthly_equivalent()
            total_monthly = total_monthly.add(monthly_amount)
            
            # Asset/Liability linking analysis
            if expense.is_asset_linked_expense():
                asset_linked = asset_linked.add(monthly_amount)
            
            if expense.is_liability_linked_expense():
                liability_linked = liability_linked.add(monthly_amount)
            
            if expense.is_finite_payment:
                finite_payment = finite_payment.add(monthly_amount)
            
            if expense.should_convert_to_liability():
                convertible = convertible.add(monthly_amount)
            
            # Category breakdown
            category = expense.get_expense_category()
            if category == ExpenseCategory.FIXED_EXPENSES:
                category_breakdown["fixed_expenses"] = category_breakdown["fixed_expenses"].add(monthly_amount)
            elif category == ExpenseCategory.VARIABLE_EXPENSES:
                category_breakdown["variable_expenses"] = category_breakdown["variable_expenses"].add(monthly_amount)
            elif category == ExpenseCategory.DISCRETIONARY_EXPENSES:
                category_breakdown["discretionary_expenses"] = category_breakdown["discretionary_expenses"].add(monthly_amount)
            
            # Health scoring
            health_scores.append(expense.get_budget_impact_score())
        
        # Calculate average health score
        avg_health_score = sum(health_scores) / len(health_scores) if health_scores else 5.0
        
        return ExpenseAnalysisResponse(
            total_monthly_expenses=total_monthly,
            total_annual_expenses=Money(total_monthly.amount * 12, total_monthly.currency),
            asset_linked_expenses=asset_linked,
            liability_linked_expenses=liability_linked,
            finite_payment_expenses=finite_payment,
            convertible_to_liability_expenses=convertible,
            expense_breakdown_by_category={
                k: v.to_dict() for k, v in category_breakdown.items()
            },
            financial_health_score=avg_health_score
        )


class GetExpenseConversionRecommendations:
    """Use case for identifying expenses that should be converted to liabilities"""
    
    def __init__(self, expense_repository: ExpenseRepository):
        self._expense_repository = expense_repository
    
    async def execute(self, user_id: int) -> List[dict]:
        """
        Get recommendations for converting expenses to liabilities.
        
        Args:
            user_id: User identifier
            
        Returns:
            List[dict]: Conversion recommendations
        """
        expenses = await self._expense_repository.get_by_user_id(user_id, include_inactive=False)
        
        recommendations = []
        
        for expense in expenses:
            if expense.should_convert_to_liability():
                remaining_balance = expense.calculate_remaining_liability_balance()
                
                recommendations.append({
                    "expense_id": expense.id,
                    "expense_description": expense.description,
                    "monthly_payment": expense.amount.to_dict(),
                    "estimated_remaining_balance": remaining_balance.to_dict() if remaining_balance else None,
                    "total_payments_remaining": expense.total_payments_remaining,
                    "payment_end_date": expense.payment_end_date.isoformat() if expense.payment_end_date else None,
                    "recommendation": "Convert to liability for proper balance sheet treatment",
                    "benefit": "Accurate net worth calculation and debt tracking"
                })
        
        return recommendations


class GetAssetLiabilityOptions:
    """Use case for getting available assets and liabilities for linking"""
    
    def __init__(self, asset_repository: AssetRepository, 
                 liability_repository: LiabilityRepository):
        self._asset_repository = asset_repository
        self._liability_repository = liability_repository
    
    async def execute(self, user_id: int) -> dict:
        """
        Get available assets and liabilities for expense linking.
        
        Args:
            user_id: User identifier
            
        Returns:
            dict: Available linking options
        """
        assets = await self._asset_repository.get_by_user_id(user_id)
        liabilities = await self._liability_repository.get_by_user_id(user_id)
        
        # Filter relevant assets (those that typically have expenses)
        expense_related_assets = [
            asset for asset in assets 
            if asset.asset_type.value in {
                "real_estate", "vehicle", "business_investment", 
                "rental_property", "equipment", "other_tangible"
            } and asset.is_active
        ]
        
        # Filter relevant liabilities (those with payments)
        payment_liabilities = [
            liability for liability in liabilities
            if liability.is_active and liability.balance.amount > 0
        ]
        
        return {
            "assets": [
                {
                    "id": asset.id,
                    "name": asset.name,
                    "asset_type": asset.asset_type.value,
                    "current_value": asset.current_value.to_dict()
                }
                for asset in expense_related_assets
            ],
            "liabilities": [
                {
                    "id": liability.id,
                    "name": liability.name,
                    "liability_type": liability.liability_type.value,
                    "balance": liability.balance.to_dict(),
                    "minimum_payment": liability.minimum_payment.to_dict() if liability.minimum_payment else None
                }
                for liability in payment_liabilities
            ]
        }