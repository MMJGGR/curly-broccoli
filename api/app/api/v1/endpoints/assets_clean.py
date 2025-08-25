"""
Asset Management API V2 - Clean Architecture Implementation
CFA-compliant asset tracking with domain entities and use cases
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime

from app.auth import get_current_user
from app.models import User
from app.database import get_db

# Import domain entities and enums
from app.domain.entities.asset import Asset, AssetType, AssetCategory
from app.domain.entities.money import Money

# Import repository
from app.infrastructure.repositories.sqlalchemy_asset_repository import SqlAlchemyAssetRepository

# Import use cases (we'll create these)
from app.application.use_cases.get_assets_summary import GetAssetsSummary
from app.application.use_cases.create_asset import CreateAsset
from app.application.use_cases.update_asset import UpdateAsset

router = APIRouter(prefix="/assets-v2", tags=["assets-v2-clean"])


def get_asset_repository(db: Session = Depends(get_db)) -> SqlAlchemyAssetRepository:
    """Dependency injection for asset repository"""
    return SqlAlchemyAssetRepository(db)


def get_assets_summary_use_case(db: Session = Depends(get_db)) -> GetAssetsSummary:
    """Dependency injection for assets summary use case"""
    repository = SqlAlchemyAssetRepository(db)
    return GetAssetsSummary(repository)


def get_create_asset_use_case(db: Session = Depends(get_db)) -> CreateAsset:
    """Dependency injection for create asset use case"""
    repository = SqlAlchemyAssetRepository(db)
    return CreateAsset(repository)


def get_update_asset_use_case(db: Session = Depends(get_db)) -> UpdateAsset:
    """Dependency injection for update asset use case"""
    repository = SqlAlchemyAssetRepository(db)
    return UpdateAsset(repository)


@router.get("/health")
async def assets_health_check():
    """Health check endpoint for assets service"""
    return {
        "status": "healthy",
        "service": "assets-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True,
        "features": [
            "asset_tracking", "portfolio_valuation", "gain_loss_calculation",
            "depreciation_tracking", "asset_categorization", "liquidity_analysis"
        ]
    }


@router.get("/", response_model=Dict[str, Any])
async def get_assets_summary_v2(
    current_user: User = Depends(get_current_user),
    use_case: GetAssetsSummary = Depends(get_assets_summary_use_case)
):
    """
    Get comprehensive assets summary using clean architecture.
    
    Returns asset portfolio overview with:
    - All user assets with current valuations
    - Asset categorization (Current, Investment, Fixed, Intangible)
    - Gain/loss calculations and depreciation tracking
    - Liquidity analysis and risk assessment
    - CFA-compliant portfolio metrics
    """
    try:
        result = await use_case.execute(current_user.id)
        
        # Convert to API response format
        assets_data = []
        for asset_info in result["assets"]:
            assets_data.append({
                "id": asset_info["id"],
                "name": asset_info["name"],
                "asset_type": asset_info["asset_type"],
                "asset_category": asset_info["asset_category"],
                "current_value": float(asset_info["current_value"].amount),
                "acquisition_cost": float(asset_info["acquisition_cost"].amount),
                "unrealized_gain_loss": float(asset_info["unrealized_gain_loss"].amount),
                "gain_loss_percentage": float(asset_info["gain_loss_percentage"]),
                "is_liquid": asset_info["is_liquid"],
                "is_appreciating": asset_info["is_appreciating"],
                "risk_level": asset_info["risk_level"],
                "acquisition_date": asset_info["acquisition_date"],
                "description": asset_info["description"],
                "location": asset_info["location"],
                "is_active": asset_info["is_active"],
                "currency": "KES"
            })
        
        return {
            "user_id": current_user.id,
            "assets": assets_data,
            "summary": {
                "total_assets": result["summary"]["total_assets"],
                "total_current_value": float(result["summary"]["total_current_value"].amount),
                "total_acquisition_cost": float(result["summary"]["total_acquisition_cost"].amount),
                "total_unrealized_gain_loss": float(result["summary"]["total_unrealized_gain_loss"].amount),
                "asset_count_by_category": result["summary"]["asset_count_by_category"],
                "currency": "KES"
            },
            "portfolio_analysis": {
                "liquidity_ratio": result["portfolio_analysis"]["liquidity_ratio"],
                "growth_assets_percentage": result["portfolio_analysis"]["growth_assets_percentage"],
                "diversification_score": result["portfolio_analysis"]["diversification_score"],
                "risk_assessment": result["portfolio_analysis"]["risk_assessment"]
            },
            "metadata": {
                "calculation_method": "clean_architecture",
                "cfa_compliant": True,
                "currency": "KES",
                "valuation_method": "current_market_value"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving assets summary: {str(e)}"
        )


@router.post("/", response_model=Dict[str, Any])
async def create_asset_v2(
    asset_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    use_case: CreateAsset = Depends(get_create_asset_use_case)
):
    """
    Create new asset with CFA-compliant validation.
    
    Expected asset_data format:
    {
        "name": "Emergency Fund Savings",
        "asset_type": "cash_equivalent",
        "current_value": 50000.00,
        "acquisition_cost": 50000.00,
        "acquisition_date": "2024-01-01T00:00:00Z",
        "useful_life_years": null,
        "description": "High-yield savings account",
        "location": "Nairobi"
    }
    """
    try:
        result = await use_case.execute(current_user.id, asset_data)
        
        return {
            "success": True,
            "asset": result.to_dict(),
            "message": f"Asset '{result.name}' created successfully",
            "metadata": {
                "created_at": result.created_at.isoformat(),
                "cfa_compliant": True
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid asset data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating asset: {str(e)}"
        )


@router.get("/{asset_id}", response_model=Dict[str, Any])
async def get_asset_by_id_v2(
    asset_id: int,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyAssetRepository = Depends(get_asset_repository)
):
    """Get specific asset by ID with detailed information"""
    try:
        asset = await repository.get_asset_by_id(current_user.id, asset_id)
        
        if not asset:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset {asset_id} not found"
            )
        
        return {
            "success": True,
            "asset": asset.to_dict(),
            "financial_metrics": {
                "current_value": float(asset.current_value.amount),
                "acquisition_cost": float(asset.acquisition_cost.amount),
                "unrealized_gain_loss": float(asset.unrealized_gain_loss.amount),
                "gain_loss_percentage": float(asset.gain_loss_percentage),
                "annual_depreciation": float(asset.calculate_annual_depreciation().amount),
                "book_value": float(asset.calculate_book_value().amount),
                "net_worth_contribution": float(asset.contribution_to_net_worth.amount)
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
            detail=f"Error retrieving asset: {str(e)}"
        )


@router.put("/{asset_id}", response_model=Dict[str, Any])
async def update_asset_v2(
    asset_id: int,
    asset_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    use_case: UpdateAsset = Depends(get_update_asset_use_case)
):
    """Update existing asset with validation"""
    try:
        result = await use_case.execute(current_user.id, asset_id, asset_data)
        
        return {
            "success": True,
            "asset": result.to_dict(),
            "message": f"Asset '{result.name}' updated successfully",
            "metadata": {
                "updated_at": result.updated_at.isoformat() if result.updated_at else None,
                "cfa_compliant": True
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid asset data: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating asset: {str(e)}"
        )


@router.delete("/{asset_id}", response_model=Dict[str, Any])
async def delete_asset_v2(
    asset_id: int,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyAssetRepository = Depends(get_asset_repository)
):
    """Soft delete asset (marks as inactive)"""
    try:
        success = await repository.delete_asset(current_user.id, asset_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Asset {asset_id} not found"
            )
        
        return {
            "success": True,
            "message": f"Asset {asset_id} deleted successfully",
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
            detail=f"Error deleting asset: {str(e)}"
        )


@router.get("/category/{category}", response_model=List[Dict[str, Any]])
async def get_assets_by_category_v2(
    category: str,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyAssetRepository = Depends(get_asset_repository)
):
    """Get assets filtered by asset type category"""
    try:
        assets = await repository.get_assets_by_category(current_user.id, category)
        
        assets_data = []
        for asset in assets:
            assets_data.append(asset.to_dict())
        
        return assets_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving assets by category: {str(e)}"
        )


@router.get("/types/available", response_model=Dict[str, Any])
async def get_available_asset_types():
    """Get all available asset types and categories for frontend forms"""
    asset_types = {}
    for asset_type in AssetType:
        # Create a dummy asset to get category
        dummy_asset = Asset(
            id=0, user_id=0, name="", asset_type=asset_type,
            current_value=Money(0), acquisition_cost=Money(0),
            acquisition_date=datetime.now()
        )
        category = dummy_asset.get_asset_category()
        
        if category.value not in asset_types:
            asset_types[category.value] = []
        
        asset_types[category.value].append({
            "value": asset_type.value,
            "label": asset_type.value.replace("_", " ").title(),
            "is_liquid": dummy_asset.is_liquid,
            "is_appreciating": dummy_asset.is_appreciating,
            "risk_level": dummy_asset.risk_level
        })
    
    return {
        "asset_categories": asset_types,
        "category_descriptions": {
            "current_assets": "Liquid assets convertible to cash within 1 year",
            "investment_assets": "Long-term investments for wealth building",
            "fixed_assets": "Property, plant, and equipment",
            "intangible_assets": "Intellectual property and business ownership"
        }
    }