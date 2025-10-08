"""
Income Management API v2 - Clean Architecture Endpoints
KISS approach with direct user asset/liability linking
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from datetime import datetime

from ....application.use_cases.manage_income import (
    CreateIncome, UpdateIncome, GetUserIncomes, DeleteIncome, 
    AnalyzeUserIncome, GetAssetLinkedIncomes,
    CreateIncomeRequest, UpdateIncomeRequest
)
from ....domain.entities.income import IncomeType, IncomeFrequency, TemporalPattern
from ....domain.entities.money import Money
from ....infrastructure.database import get_db_session
from ....infrastructure.repositories.sqlalchemy_income_repository import SQLAlchemyIncomeRepository
from ....infrastructure.repositories.sqlalchemy_asset_repository import SQLAlchemyAssetRepository
from ...dependencies import get_current_user

router = APIRouter(prefix="/income-v2", tags=["Income Management V2"])


# Request/Response Models
class CreateIncomeRequestModel(BaseModel):
    description: str
    amount: float
    currency: str = "KES"
    income_type: str
    frequency: str
    is_recurring: bool = True
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    temporal_pattern: str = "permanent"
    linked_asset_id: Optional[int] = None
    asset_relationship_type: Optional[str] = None
    growth_rate: Optional[float] = None
    notes: Optional[str] = None


class UpdateIncomeRequestModel(BaseModel):
    description: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    income_type: Optional[str] = None
    frequency: Optional[str] = None
    is_recurring: Optional[bool] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    temporal_pattern: Optional[str] = None
    linked_asset_id: Optional[int] = None
    asset_relationship_type: Optional[str] = None
    growth_rate: Optional[float] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None


class IncomeResponseModel(BaseModel):
    id: int
    description: str
    amount: dict
    income_type: str
    frequency: str
    monthly_equivalent: dict
    annual_equivalent: dict
    is_recurring: bool
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    temporal_pattern: str
    linked_asset_id: Optional[int] = None
    asset_relationship_type: Optional[str] = None
    is_taxable: bool
    tax_category: str
    growth_rate: Optional[float] = None
    stability_score: int
    is_asset_linked: bool
    notes: Optional[str] = None
    is_active: bool
    created_at: str
    updated_at: str


class IncomeAnalysisResponseModel(BaseModel):
    total_monthly_income: dict
    total_annual_income: dict
    stability_score: float
    asset_linked_income: dict
    employment_income: dict
    business_income: dict
    investment_income: dict
    income_diversification_score: float


class AssetOptionModel(BaseModel):
    id: int
    name: str
    asset_type: str
    current_value: dict


# Dependency injection
def get_create_income_use_case(session = Depends(get_db_session)):
    income_repo = SQLAlchemyIncomeRepository(session)
    asset_repo = SQLAlchemyAssetRepository(session)
    return CreateIncome(income_repo, asset_repo)


def get_update_income_use_case(session = Depends(get_db_session)):
    income_repo = SQLAlchemyIncomeRepository(session)
    asset_repo = SQLAlchemyAssetRepository(session)
    return UpdateIncome(income_repo, asset_repo)


def get_user_incomes_use_case(session = Depends(get_db_session)):
    income_repo = SQLAlchemyIncomeRepository(session)
    return GetUserIncomes(income_repo)


def get_delete_income_use_case(session = Depends(get_db_session)):
    income_repo = SQLAlchemyIncomeRepository(session)
    return DeleteIncome(income_repo)


def get_analyze_income_use_case(session = Depends(get_db_session)):
    income_repo = SQLAlchemyIncomeRepository(session)
    return AnalyzeUserIncome(income_repo)


def get_asset_linked_incomes_use_case(session = Depends(get_db_session)):
    income_repo = SQLAlchemyIncomeRepository(session)
    return GetAssetLinkedIncomes(income_repo)


# API Endpoints
@router.post("/", response_model=IncomeResponseModel)
async def create_income(
    request: CreateIncomeRequestModel,
    current_user = Depends(get_current_user),
    use_case: CreateIncome = Depends(get_create_income_use_case)
):
    """
    Create new income stream with optional asset linking.
    
    KISS Flow:
    1. User enters income details
    2. User optionally selects existing asset from dropdown
    3. System creates income with asset relationship
    """
    try:
        # Convert request to use case request
        create_request = CreateIncomeRequest(
            user_id=current_user.id,
            description=request.description,
            amount=Money(request.amount, request.currency),
            income_type=IncomeType(request.income_type),
            frequency=IncomeFrequency(request.frequency),
            is_recurring=request.is_recurring,
            start_date=request.start_date,
            end_date=request.end_date,
            temporal_pattern=TemporalPattern(request.temporal_pattern),
            linked_asset_id=request.linked_asset_id,
            asset_relationship_type=request.asset_relationship_type,
            growth_rate=request.growth_rate,
            notes=request.notes
        )
        
        income = await use_case.execute(create_request)
        return income.to_dict()
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error creating income"
        )


@router.get("/", response_model=List[IncomeResponseModel])
async def get_user_incomes(
    include_inactive: bool = False,
    current_user = Depends(get_current_user),
    use_case: GetUserIncomes = Depends(get_user_incomes_use_case)
):
    """Get all income streams for the current user"""
    try:
        incomes = await use_case.execute(current_user.id, include_inactive)
        return [income.to_dict() for income in incomes]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error retrieving incomes"
        )


@router.get("/analysis", response_model=IncomeAnalysisResponseModel)
async def get_income_analysis(
    current_user = Depends(get_current_user),
    use_case: AnalyzeUserIncome = Depends(get_analyze_income_use_case)
):
    """Get comprehensive analysis of user's income profile"""
    try:
        analysis = await use_case.execute(current_user.id)
        return {
            "total_monthly_income": analysis.total_monthly_income.to_dict(),
            "total_annual_income": analysis.total_annual_income.to_dict(),
            "stability_score": analysis.stability_score,
            "asset_linked_income": analysis.asset_linked_income.to_dict(),
            "employment_income": analysis.employment_income.to_dict(),
            "business_income": analysis.business_income.to_dict(),
            "investment_income": analysis.investment_income.to_dict(),
            "income_diversification_score": analysis.income_diversification_score
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error analyzing income"
        )


@router.get("/{income_id}", response_model=IncomeResponseModel)
async def get_income(
    income_id: int,
    current_user = Depends(get_current_user),
    use_case: GetUserIncomes = Depends(get_user_incomes_use_case)
):
    """Get specific income stream"""
    try:
        incomes = await use_case.execute(current_user.id, include_inactive=True)
        income = next((i for i in incomes if i.id == income_id), None)
        
        if not income:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Income {income_id} not found"
            )
        
        return income.to_dict()
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error retrieving income"
        )


@router.put("/{income_id}", response_model=IncomeResponseModel)
async def update_income(
    income_id: int,
    request: UpdateIncomeRequestModel,
    current_user = Depends(get_current_user),
    use_case: UpdateIncome = Depends(get_update_income_use_case)
):
    """Update existing income stream"""
    try:
        # Convert request to use case request
        update_request = UpdateIncomeRequest(
            income_id=income_id,
            user_id=current_user.id,
            description=request.description,
            amount=Money(request.amount, request.currency or "KES") if request.amount else None,
            income_type=IncomeType(request.income_type) if request.income_type else None,
            frequency=IncomeFrequency(request.frequency) if request.frequency else None,
            is_recurring=request.is_recurring,
            start_date=request.start_date,
            end_date=request.end_date,
            temporal_pattern=TemporalPattern(request.temporal_pattern) if request.temporal_pattern else None,
            linked_asset_id=request.linked_asset_id,
            asset_relationship_type=request.asset_relationship_type,
            growth_rate=request.growth_rate,
            notes=request.notes,
            is_active=request.is_active
        )
        
        income = await use_case.execute(update_request)
        return income.to_dict()
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error updating income"
        )


@router.delete("/{income_id}")
async def delete_income(
    income_id: int,
    current_user = Depends(get_current_user),
    use_case: DeleteIncome = Depends(get_delete_income_use_case)
):
    """Delete income stream (soft delete)"""
    try:
        success = await use_case.execute(income_id, current_user.id)
        if success:
            return {"message": "Income deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Income {income_id} not found"
            )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error deleting income"
        )


@router.get("/by-asset/{asset_id}", response_model=List[IncomeResponseModel])
async def get_asset_linked_incomes(
    asset_id: int,
    current_user = Depends(get_current_user),
    use_case: GetAssetLinkedIncomes = Depends(get_asset_linked_incomes_use_case)
):
    """Get all income streams linked to a specific asset"""
    try:
        incomes = await use_case.execute(asset_id, current_user.id)
        return [income.to_dict() for income in incomes]
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error retrieving asset-linked incomes"
        )


@router.get("/asset-options/dropdown")
async def get_asset_options_for_linking(
    current_user = Depends(get_current_user),
    session = Depends(get_db_session)
):
    """
    Get available assets for linking dropdown (KISS approach).
    
    Returns assets that can generate income:
    - Real estate (rental income)
    - Business assets (business income)  
    - Investment accounts (dividend/interest income)
    """
    try:
        asset_repo = SQLAlchemyAssetRepository(session)
        assets = await asset_repo.get_by_user_id(current_user.id)
        
        # Filter assets that can generate income
        income_generating_types = {
            "real_estate", "business_investment", "investment_account", 
            "stocks", "bonds", "mutual_funds", "rental_property"
        }
        
        linkable_assets = [
            {
                "id": asset.id,
                "name": asset.name,
                "asset_type": asset.asset_type.value,
                "current_value": asset.current_value.to_dict()
            }
            for asset in assets 
            if asset.asset_type.value in income_generating_types and asset.is_active
        ]
        
        return {
            "assets": linkable_assets,
            "message": "Select an asset this income comes from, or create a new asset first"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error retrieving asset options"
        )