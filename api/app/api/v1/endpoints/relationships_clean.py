"""
Financial Relationships API V2 - Clean Architecture
Cross-component relationship management with CFA-compliant analysis
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from pydantic import BaseModel, Field
from datetime import date
from decimal import Decimal

from ....auth import get_current_user
from ....models import User
from ....database import get_db
from ....application.use_cases.manage_financial_relationships import ManageFinancialRelationships
from ....infrastructure.repositories.sqlalchemy_relationship_repository import SQLAlchemyRelationshipRepository
from ....infrastructure.repositories.sqlalchemy_asset_repository import SqlAlchemyAssetRepository
# Note: Income repository needs to be created or imported from correct location
# from ....infrastructure.repositories.sqlalchemy_income_repository import SQLAlchemyIncomeRepository  
from ....infrastructure.repositories.sqlalchemy_expense_repository import SqlAlchemyExpenseRepository
from ....infrastructure.repositories.sqlalchemy_liability_repository import SqlAlchemyLiabilityRepository

router = APIRouter(prefix="/relationships-v2", tags=["relationships-v2-clean"])


# Pydantic models for request/response
class CreateRelationshipRequest(BaseModel):
    relationship_type: str = Field(..., description="Type of relationship")
    source_type: str = Field(..., description="Source component type")
    source_id: int = Field(..., description="Source component ID")
    target_type: str = Field(..., description="Target component type")
    target_id: int = Field(..., description="Target component ID")
    amount: float = Field(None, description="Monthly amount")
    percentage: float = Field(None, description="Percentage allocation")
    frequency: str = Field(default="monthly", description="Frequency")
    start_date: date = Field(None, description="Start date")
    end_date: date = Field(None, description="End date")
    description: str = Field(None, description="Description")
    metadata: Dict[str, Any] = Field(default={}, description="Additional metadata")


class UpdateRelationshipRequest(BaseModel):
    amount: float = Field(None, description="Monthly amount")
    percentage: float = Field(None, description="Percentage allocation")
    frequency: str = Field(None, description="Frequency")
    status: str = Field(None, description="Relationship status")
    end_date: date = Field(None, description="End date")
    description: str = Field(None, description="Description")


class AssetIncomeRequest(BaseModel):
    description: str = Field(..., description="Income description")
    monthly_amount: float = Field(..., description="Monthly income amount")
    income_type: str = Field(default="asset_income", description="Income type")
    income_id: int = Field(None, description="Existing income ID to link")


class FundingSourceRequest(BaseModel):
    source_type: str = Field(..., description="Funding source type")
    source_id: int = Field(..., description="Funding source ID")
    monthly_amount: float = Field(None, description="Monthly funding amount")
    percentage: float = Field(None, description="Percentage allocation")


class GoalFundingRequest(BaseModel):
    funding_sources: List[FundingSourceRequest] = Field(..., description="List of funding sources")


def get_relationship_use_case(db: Session = Depends(get_db)) -> ManageFinancialRelationships:
    """Dependency injection for relationship use case"""
    relationship_repo = SQLAlchemyRelationshipRepository(db)
    asset_repo = SqlAlchemyAssetRepository(db)
    # Create a mock income repository for now - needs proper implementation
    income_repo = MockIncomeRepository()
    expense_repo = SqlAlchemyExpenseRepository(db)
    liability_repo = SqlAlchemyLiabilityRepository(db)
    
    return ManageFinancialRelationships(
        relationship_repo, asset_repo, income_repo, expense_repo, liability_repo
    )


class MockIncomeRepository:
    """Temporary mock income repository until proper one is implemented"""
    async def get_by_id(self, income_id: int, user_id: int):
        # Mock implementation - always return a valid result for validation
        class MockIncome:
            def __init__(self):
                self.id = income_id
                self.user_id = user_id
        return MockIncome()
    
    async def get_by_user_id(self, user_id: int):
        return []
    
    async def create(self, income):
        return income
    
    async def update(self, income):
        return income
    
    async def delete(self, income_id: int, user_id: int):
        return True
    
    async def get_monthly_total(self, user_id: int):
        return 0.0
    
    async def get_by_type(self, user_id: int, income_type: str):
        return []


@router.get("/health")
async def relationships_health_check():
    """Health check endpoint for relationships service"""
    return {
        "status": "healthy",
        "service": "relationships-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True
    }


@router.post("/")
async def create_relationship(
    request: CreateRelationshipRequest,
    current_user: User = Depends(get_current_user),
    use_case: ManageFinancialRelationships = Depends(get_relationship_use_case)
):
    """Create a new financial relationship between components"""
    try:
        result = await use_case.create_relationship(
            user_id=current_user.id,
            relationship_data=request.dict()
        )
        
        return {
            "data": result,
            "metadata": {
                "timestamp": date.today().isoformat(),
                "user_id": current_user.id,
                "operation": "create_relationship"
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create relationship: {str(e)}"
        )


@router.get("/component/{component_type}/{component_id}")
async def get_component_relationships(
    component_type: str,
    component_id: int,
    current_user: User = Depends(get_current_user),
    use_case: ManageFinancialRelationships = Depends(get_relationship_use_case)
):
    """Get all relationships for a specific component with analysis"""
    try:
        result = await use_case.get_component_relationships(
            user_id=current_user.id,
            component_type=component_type,
            component_id=component_id
        )
        
        return {
            "data": result,
            "metadata": {
                "timestamp": date.today().isoformat(),
                "user_id": current_user.id,
                "component": f"{component_type}:{component_id}"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get component relationships: {str(e)}"
        )


@router.get("/net-worth-impact")
async def get_net_worth_impact(
    current_user: User = Depends(get_current_user),
    use_case: ManageFinancialRelationships = Depends(get_relationship_use_case)
):
    """Get net worth impact analysis from all relationships"""
    try:
        result = await use_case.get_net_worth_impact(user_id=current_user.id)
        
        return {
            "data": result,
            "metadata": {
                "timestamp": date.today().isoformat(),
                "user_id": current_user.id,
                "analysis_type": "net_worth_impact"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate net worth impact: {str(e)}"
        )


@router.post("/asset/{asset_id}/income")
async def create_asset_income_relationship(
    asset_id: int,
    request: AssetIncomeRequest,
    current_user: User = Depends(get_current_user),
    use_case: ManageFinancialRelationships = Depends(get_relationship_use_case)
):
    """Create an asset-income relationship (e.g., rental property generates rental income)"""
    try:
        result = await use_case.create_asset_income_relationship(
            user_id=current_user.id,
            asset_id=asset_id,
            income_source_data=request.dict()
        )
        
        return {
            "data": result,
            "metadata": {
                "timestamp": date.today().isoformat(),
                "user_id": current_user.id,
                "operation": "create_asset_income",
                "asset_id": asset_id
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create asset income relationship: {str(e)}"
        )


@router.post("/goal/{goal_id}/funding")
async def create_goal_funding_plan(
    goal_id: int,
    request: GoalFundingRequest,
    current_user: User = Depends(get_current_user),
    use_case: ManageFinancialRelationships = Depends(get_relationship_use_case)
):
    """Create a comprehensive funding plan for a goal"""
    try:
        result = await use_case.create_goal_funding_plan(
            user_id=current_user.id,
            goal_id=goal_id,
            funding_sources=[source.dict() for source in request.funding_sources]
        )
        
        return {
            "data": result,
            "metadata": {
                "timestamp": date.today().isoformat(),
                "user_id": current_user.id,
                "operation": "create_goal_funding",
                "goal_id": goal_id
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create goal funding plan: {str(e)}"
        )


@router.put("/{relationship_id}")
async def update_relationship(
    relationship_id: int,
    request: UpdateRelationshipRequest,
    current_user: User = Depends(get_current_user),
    use_case: ManageFinancialRelationships = Depends(get_relationship_use_case)
):
    """Update an existing relationship"""
    try:
        result = await use_case.update_relationship(
            user_id=current_user.id,
            relationship_id=relationship_id,
            update_data=request.dict(exclude_unset=True)
        )
        
        return {
            "data": result,
            "metadata": {
                "timestamp": date.today().isoformat(),
                "user_id": current_user.id,
                "operation": "update_relationship",
                "relationship_id": relationship_id
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update relationship: {str(e)}"
        )


@router.delete("/{relationship_id}")
async def delete_relationship(
    relationship_id: int,
    current_user: User = Depends(get_current_user),
    use_case: ManageFinancialRelationships = Depends(get_relationship_use_case)
):
    """Delete a financial relationship"""
    try:
        result = await use_case.delete_relationship(
            user_id=current_user.id,
            relationship_id=relationship_id
        )
        
        return {
            "data": result,
            "metadata": {
                "timestamp": date.today().isoformat(),
                "user_id": current_user.id,
                "operation": "delete_relationship",
                "relationship_id": relationship_id
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete relationship: {str(e)}"
        )