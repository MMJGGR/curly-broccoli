"""
GetAssetsSummary Use Case - Application Layer
Foundation Week Day 2: Comprehensive asset portfolio analysis with CFA compliance
"""
from typing import Dict, List
from decimal import Decimal

from ...domain.entities.money import Money
from ...domain.entities.asset import Asset
from ...domain.repositories.asset_repository import AssetRepository


class GetAssetsSummary:
    """
    Use case for retrieving comprehensive assets portfolio summary.
    
    Following CFA standards:
    - Asset categorization and portfolio analysis
    - Liquidity assessment and risk evaluation
    - Gain/loss tracking and performance metrics
    - Diversification analysis for optimal allocation
    """
    
    def __init__(self, asset_repository: AssetRepository):
        self._asset_repository = asset_repository
    
    async def execute(self, user_id: int) -> Dict:
        """
        Execute assets summary retrieval with portfolio analysis.
        
        Args:
            user_id: ID of user to get summary for
            
        Returns:
            Dictionary containing:
            - user_id: User identifier
            - assets: List of asset details
            - summary: Aggregated financial metrics
            - portfolio_analysis: CFA-compliant analysis
        """
        try:
            # Get all user assets
            assets = await self._asset_repository.get_user_assets(user_id)
            
            # Calculate summary metrics
            summary = await self._asset_repository.get_assets_summary(user_id)
            
            # Perform portfolio analysis
            portfolio_analysis = self._calculate_portfolio_analysis(assets, summary)
            
            # Format asset details
            asset_details = self._format_asset_details(assets)
            
            return {
                "user_id": user_id,
                "assets": asset_details,
                "summary": summary,
                "portfolio_analysis": portfolio_analysis
            }
            
        except Exception as e:
            # Re-raise with context for better error handling
            raise Exception(f"Failed to get assets summary for user {user_id}: {str(e)}")
    
    def _calculate_portfolio_analysis(self, assets: List[Asset], summary: Dict) -> Dict:
        """
        Perform CFA-compliant portfolio analysis.
        
        Args:
            assets: List of user assets
            summary: Summary statistics
            
        Returns:
            Dictionary with portfolio analysis metrics
        """
        total_value = summary["total_current_value"]
        
        if total_value.is_zero():
            return {
                "liquidity_ratio": 0.0,
                "growth_assets_percentage": 0.0,
                "diversification_score": 0,
                "risk_assessment": "no_assets"
            }
        
        # Calculate liquidity ratio (liquid assets / total assets)
        liquid_value = Money.zero()
        growth_value = Money.zero()
        asset_types_count = set()
        risk_levels = {"low": 0, "moderate": 0, "high": 0}
        
        for asset in assets:
            if asset.is_liquid:
                liquid_value = liquid_value.add(asset.current_value)
            
            if asset.is_appreciating:
                growth_value = growth_value.add(asset.current_value)
            
            asset_types_count.add(asset.asset_type.value)
            risk_levels[asset.risk_level] += 1
        
        # Liquidity ratio (should be 3-6 months of expenses per CFA)
        liquidity_ratio = (liquid_value.amount / total_value.amount) * 100
        
        # Growth assets percentage (should be age-appropriate per CFA)
        growth_percentage = (growth_value.amount / total_value.amount) * 100
        
        # Diversification score (1-10 based on asset type diversity)
        diversification_score = min(10, len(asset_types_count))
        
        # Risk assessment based on portfolio composition
        if risk_levels["high"] > risk_levels["low"] + risk_levels["moderate"]:
            risk_assessment = "aggressive"
        elif risk_levels["low"] > risk_levels["moderate"] + risk_levels["high"]:
            risk_assessment = "conservative"
        else:
            risk_assessment = "moderate"
        
        return {
            "liquidity_ratio": float(liquidity_ratio.quantize(Decimal('0.01'))),
            "growth_assets_percentage": float(growth_percentage.quantize(Decimal('0.01'))),
            "diversification_score": diversification_score,
            "risk_assessment": risk_assessment
        }
    
    def _format_asset_details(self, assets: List[Asset]) -> List[Dict]:
        """
        Format asset details for API response.
        
        Args:
            assets: List of asset entities
            
        Returns:
            List of formatted asset dictionaries
        """
        formatted_assets = []
        
        for asset in assets:
            asset_detail = {
                "id": asset.id,
                "name": asset.name,
                "asset_type": asset.asset_type.value,
                "asset_category": asset.get_asset_category().value,
                "current_value": asset.current_value,
                "acquisition_cost": asset.acquisition_cost,
                "unrealized_gain_loss": asset.unrealized_gain_loss,
                "gain_loss_percentage": asset.gain_loss_percentage,
                "is_liquid": asset.is_liquid,
                "is_appreciating": asset.is_appreciating,
                "is_depreciating": asset.is_depreciating,
                "risk_level": asset.risk_level,
                "acquisition_date": asset.acquisition_date.isoformat(),
                "description": asset.description,
                "location": asset.location,
                "is_active": asset.is_active,
                "created_at": asset.created_at.isoformat() if asset.created_at else None,
                "updated_at": asset.updated_at.isoformat() if asset.updated_at else None
            }
            formatted_assets.append(asset_detail)
        
        return formatted_assets