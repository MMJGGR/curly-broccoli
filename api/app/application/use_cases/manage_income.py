"""
Manage Income Use Cases - Clean Architecture Implementation
CFA-compliant income management with asset relationship orchestration
"""
from typing import List, Optional
from dataclasses import dataclass
from datetime import datetime

from ..interfaces.income_repository import IncomeRepository
from ..interfaces.asset_repository import AssetRepository
from ...domain.entities.income import Income, IncomeType, IncomeFrequency, TemporalPattern
from ...domain.entities.money import Money


@dataclass
class CreateIncomeRequest:
    """Request DTO for creating new income"""
    user_id: int
    description: str
    amount: Money
    income_type: IncomeType
    frequency: IncomeFrequency
    is_recurring: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    temporal_pattern: TemporalPattern = TemporalPattern.PERMANENT
    linked_asset_id: Optional[int] = None
    asset_relationship_type: Optional[str] = None
    growth_rate: Optional[float] = None
    notes: Optional[str] = None


@dataclass
class UpdateIncomeRequest:
    """Request DTO for updating income"""
    income_id: int
    user_id: int
    description: Optional[str] = None
    amount: Optional[Money] = None
    income_type: Optional[IncomeType] = None
    frequency: Optional[IncomeFrequency] = None
    is_recurring: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    temporal_pattern: Optional[TemporalPattern] = None
    linked_asset_id: Optional[int] = None
    asset_relationship_type: Optional[str] = None
    growth_rate: Optional[float] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


@dataclass
class IncomeAnalysisResponse:
    """Analysis response for income streams"""
    total_monthly_income: Money
    total_annual_income: Money
    stability_score: float
    asset_linked_income: Money
    employment_income: Money
    business_income: Money
    investment_income: Money
    income_diversification_score: float


class CreateIncome:
    """Use case for creating new income stream"""
    
    def __init__(self, income_repository: IncomeRepository, asset_repository: AssetRepository):
        self._income_repository = income_repository
        self._asset_repository = asset_repository
    
    async def execute(self, request: CreateIncomeRequest) -> Income:
        """
        Create new income stream with optional asset linking.
        
        Args:
            request: Income creation request
            
        Returns:
            Income: Created income entity
            
        Raises:
            ValueError: If asset linking fails or data is invalid
        """
        # Validate asset linking if provided
        if request.linked_asset_id:
            asset = await self._asset_repository.get_by_id(request.linked_asset_id)
            if not asset or asset.user_id != request.user_id:
                raise ValueError(f"Asset {request.linked_asset_id} not found or not owned by user")
        
        # Create income entity
        income = Income(
            id=0,  # Will be set by repository
            user_id=request.user_id,
            description=request.description,
            amount=request.amount,
            income_type=request.income_type,
            frequency=request.frequency,
            is_recurring=request.is_recurring,
            start_date=request.start_date,
            end_date=request.end_date,
            temporal_pattern=request.temporal_pattern,
            linked_asset_id=request.linked_asset_id,
            asset_relationship_type=request.asset_relationship_type,
            growth_rate=request.growth_rate,
            notes=request.notes
        )
        
        # Save and return
        return await self._income_repository.save(income)


class UpdateIncome:
    """Use case for updating existing income stream"""
    
    def __init__(self, income_repository: IncomeRepository, asset_repository: AssetRepository):
        self._income_repository = income_repository
        self._asset_repository = asset_repository
    
    async def execute(self, request: UpdateIncomeRequest) -> Income:
        """
        Update existing income stream.
        
        Args:
            request: Income update request
            
        Returns:
            Income: Updated income entity
            
        Raises:
            ValueError: If income not found or asset linking fails
        """
        # Get existing income
        income = await self._income_repository.get_by_id(request.income_id)
        if not income or income.user_id != request.user_id:
            raise ValueError(f"Income {request.income_id} not found or not owned by user")
        
        # Validate asset linking if being updated
        if request.linked_asset_id:
            asset = await self._asset_repository.get_by_id(request.linked_asset_id)
            if not asset or asset.user_id != request.user_id:
                raise ValueError(f"Asset {request.linked_asset_id} not found or not owned by user")
        
        # Update fields if provided
        if request.description is not None:
            income.description = request.description
        if request.amount is not None:
            income.amount = request.amount
        if request.income_type is not None:
            income.income_type = request.income_type
        if request.frequency is not None:
            income.frequency = request.frequency
        if request.is_recurring is not None:
            income.is_recurring = request.is_recurring
        if request.start_date is not None:
            income.start_date = request.start_date
        if request.end_date is not None:
            income.end_date = request.end_date
        if request.temporal_pattern is not None:
            income.temporal_pattern = request.temporal_pattern
        if request.linked_asset_id is not None:
            income.linked_asset_id = request.linked_asset_id
        if request.asset_relationship_type is not None:
            income.asset_relationship_type = request.asset_relationship_type
        if request.growth_rate is not None:
            income.growth_rate = request.growth_rate
        if request.notes is not None:
            income.notes = request.notes
        if request.is_active is not None:
            income.is_active = request.is_active
        
        income.updated_at = datetime.utcnow()
        
        # Save and return
        return await self._income_repository.save(income)


class GetUserIncomes:
    """Use case for retrieving user's income streams"""
    
    def __init__(self, income_repository: IncomeRepository):
        self._income_repository = income_repository
    
    async def execute(self, user_id: int, include_inactive: bool = False) -> List[Income]:
        """
        Get all income streams for a user.
        
        Args:
            user_id: User identifier
            include_inactive: Whether to include inactive incomes
            
        Returns:
            List[Income]: User's income streams
        """
        return await self._income_repository.get_by_user_id(user_id, include_inactive)


class DeleteIncome:
    """Use case for deleting income stream"""
    
    def __init__(self, income_repository: IncomeRepository):
        self._income_repository = income_repository
    
    async def execute(self, income_id: int, user_id: int) -> bool:
        """
        Delete income stream (soft delete by marking inactive).
        
        Args:
            income_id: Income identifier
            user_id: User identifier for ownership validation
            
        Returns:
            bool: True if deleted successfully
            
        Raises:
            ValueError: If income not found or not owned by user
        """
        income = await self._income_repository.get_by_id(income_id)
        if not income or income.user_id != user_id:
            raise ValueError(f"Income {income_id} not found or not owned by user")
        
        income.is_active = False
        income.updated_at = datetime.utcnow()
        
        await self._income_repository.save(income)
        return True


class AnalyzeUserIncome:
    """Use case for comprehensive income analysis"""
    
    def __init__(self, income_repository: IncomeRepository):
        self._income_repository = income_repository
    
    async def execute(self, user_id: int) -> IncomeAnalysisResponse:
        """
        Analyze user's complete income profile.
        
        Args:
            user_id: User identifier
            
        Returns:
            IncomeAnalysisResponse: Comprehensive income analysis
        """
        incomes = await self._income_repository.get_by_user_id(user_id, include_inactive=False)
        
        # Calculate totals
        total_monthly = Money.zero()
        employment_total = Money.zero()
        business_total = Money.zero()
        investment_total = Money.zero()
        asset_linked_total = Money.zero()
        
        stability_scores = []
        
        for income in incomes:
            monthly_amount = income.calculate_monthly_amount()
            total_monthly = total_monthly.add(monthly_amount)
            
            # Categorize by type
            if income.income_type in {IncomeType.SALARY, IncomeType.WAGES, IncomeType.BONUS, IncomeType.COMMISSION}:
                employment_total = employment_total.add(monthly_amount)
            elif income.income_type in {IncomeType.BUSINESS_INCOME, IncomeType.SELF_EMPLOYMENT, IncomeType.CONSULTING, IncomeType.FREELANCE}:
                business_total = business_total.add(monthly_amount)
            elif income.income_type in {IncomeType.DIVIDENDS, IncomeType.INTEREST, IncomeType.CAPITAL_GAINS, IncomeType.RENTAL_INCOME}:
                investment_total = investment_total.add(monthly_amount)
            
            # Track asset-linked income
            if income.is_asset_linked_income():
                asset_linked_total = asset_linked_total.add(monthly_amount)
            
            # Collect stability scores
            stability_scores.append(income.get_income_stability_score())
        
        # Calculate diversification score
        income_sources = len([x for x in [employment_total, business_total, investment_total] if not x.is_zero()])
        diversification_score = min(10.0, income_sources * 3.33)  # Max 10 for 3+ sources
        
        # Average stability score
        avg_stability = sum(stability_scores) / len(stability_scores) if stability_scores else 5.0
        
        return IncomeAnalysisResponse(
            total_monthly_income=total_monthly,
            total_annual_income=Money(total_monthly.amount * 12, total_monthly.currency),
            stability_score=avg_stability,
            asset_linked_income=asset_linked_total,
            employment_income=employment_total,
            business_income=business_total,
            investment_income=investment_total,
            income_diversification_score=diversification_score
        )


class GetAssetLinkedIncomes:
    """Use case for retrieving incomes linked to a specific asset"""
    
    def __init__(self, income_repository: IncomeRepository):
        self._income_repository = income_repository
    
    async def execute(self, asset_id: int, user_id: int) -> List[Income]:
        """
        Get all income streams linked to a specific asset.
        
        Args:
            asset_id: Asset identifier
            user_id: User identifier for ownership validation
            
        Returns:
            List[Income]: Incomes linked to the asset
        """
        all_incomes = await self._income_repository.get_by_user_id(user_id, include_inactive=False)
        return [income for income in all_incomes if income.linked_asset_id == asset_id]