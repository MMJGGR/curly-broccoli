"""
SqlAlchemy Asset Repository - Clean Architecture Implementation
Foundation Week Day 2 - Asset management with CFA-compliant business logic
"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from datetime import datetime, timezone
from decimal import Decimal

from ...models import Asset as AssetModel
from ...domain.entities.asset import Asset, AssetType
from ...domain.entities.money import Money
from ...domain.repositories.asset_repository import AssetRepository


class SqlAlchemyAssetRepository(AssetRepository):
    """SQLAlchemy implementation of AssetRepository interface"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def get_user_assets(self, user_id: int) -> List[Asset]:
        """Get all assets for a user as domain entities"""
        # Get all user assets from database
        asset_models = self.db.query(AssetModel).filter(
            AssetModel.user_id == user_id
        ).all()
        
        # Convert to domain entities
        domain_assets = []
        for model in asset_models:
            try:
                domain_asset = self._model_to_entity(model)
                domain_assets.append(domain_asset)
            except Exception as e:
                # Log error but continue with other assets
                print(f"Error converting asset {model.id}: {e}")
                continue
        
        # Sort by current value (highest first)
        domain_assets.sort(key=lambda a: a.current_value.amount, reverse=True)
        return domain_assets
    
    async def get_asset_by_id(self, user_id: int, asset_id: int) -> Optional[Asset]:
        """Get specific asset by ID"""
        asset_model = self.db.query(AssetModel).filter(
            and_(
                AssetModel.id == asset_id,
                AssetModel.user_id == user_id
            )
        ).first()
        
        if not asset_model:
            return None
        
        try:
            return self._model_to_entity(asset_model)
        except Exception as e:
            print(f"Error converting asset {asset_model.id}: {e}")
            return None
    
    async def create_asset(self, asset: Asset) -> Asset:
        """Create new asset"""
        try:
            # Convert domain entity to database model
            asset_model = AssetModel(
                user_id=asset.user_id,
                name=asset.name,
                asset_type=asset.asset_type.value,
                current_value=asset.current_value.amount,
                acquisition_cost=asset.acquisition_cost.amount,
                acquisition_date=asset.acquisition_date,
                useful_life_years=asset.useful_life_years,
                related_liability_id=asset.related_liability_id,
                description=asset.description,
                location=asset.location,
                is_active=asset.is_active
            )
            
            self.db.add(asset_model)
            self.db.commit()
            self.db.refresh(asset_model)
            
            # Return updated domain entity with new ID
            return self._model_to_entity(asset_model)
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to create asset: {str(e)}")
    
    async def update_asset(self, asset: Asset) -> Asset:
        """Update existing asset"""
        try:
            asset_model = self.db.query(AssetModel).filter(
                and_(
                    AssetModel.id == asset.id,
                    AssetModel.user_id == asset.user_id
                )
            ).first()
            
            if not asset_model:
                raise Exception(f"Asset {asset.id} not found")
            
            # Update model fields
            asset_model.name = asset.name
            asset_model.asset_type = asset.asset_type.value
            asset_model.current_value = asset.current_value.amount
            asset_model.acquisition_cost = asset.acquisition_cost.amount
            asset_model.acquisition_date = asset.acquisition_date
            asset_model.useful_life_years = asset.useful_life_years
            asset_model.related_liability_id = asset.related_liability_id
            asset_model.description = asset.description
            asset_model.location = asset.location
            asset_model.is_active = asset.is_active
            asset_model.updated_at = datetime.now(timezone.utc)
            
            self.db.commit()
            self.db.refresh(asset_model)
            
            return self._model_to_entity(asset_model)
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to update asset: {str(e)}")
    
    async def delete_asset(self, user_id: int, asset_id: int) -> bool:
        """Delete asset (soft delete by setting is_active = False)"""
        try:
            asset_model = self.db.query(AssetModel).filter(
                and_(
                    AssetModel.id == asset_id,
                    AssetModel.user_id == user_id
                )
            ).first()
            
            if not asset_model:
                return False
            
            # Soft delete
            asset_model.is_active = False
            asset_model.updated_at = datetime.now(timezone.utc)
            
            self.db.commit()
            return True
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to delete asset: {str(e)}")
    
    async def get_assets_by_category(self, user_id: int, category: str) -> List[Asset]:
        """Get assets filtered by category (asset_type)"""
        asset_models = self.db.query(AssetModel).filter(
            and_(
                AssetModel.user_id == user_id,
                AssetModel.asset_type == category,
                AssetModel.is_active == True
            )
        ).all()
        
        domain_assets = []
        for model in asset_models:
            try:
                domain_asset = self._model_to_entity(model)
                domain_assets.append(domain_asset)
            except Exception as e:
                print(f"Error converting asset {model.id}: {e}")
                continue
        
        return domain_assets
    
    async def get_assets_summary(self, user_id: int) -> dict:
        """Get summary statistics for user's assets"""
        asset_models = self.db.query(AssetModel).filter(
            and_(
                AssetModel.user_id == user_id,
                AssetModel.is_active == True
            )
        ).all()
        
        total_current_value = Money.zero()
        total_acquisition_cost = Money.zero()
        total_unrealized_gain = Money.zero()
        asset_count_by_category = {}
        
        for model in asset_models:
            try:
                domain_asset = self._model_to_entity(model)
                
                # Accumulate totals
                total_current_value = total_current_value.add(domain_asset.current_value)
                total_acquisition_cost = total_acquisition_cost.add(domain_asset.acquisition_cost)
                total_unrealized_gain = total_unrealized_gain.add(domain_asset.unrealized_gain_loss)
                
                # Count by category
                category = domain_asset.get_asset_category().value
                asset_count_by_category[category] = asset_count_by_category.get(category, 0) + 1
                
            except Exception as e:
                print(f"Error processing asset {model.id}: {e}")
                continue
        
        return {
            "total_assets": len(asset_models),
            "total_current_value": total_current_value,
            "total_acquisition_cost": total_acquisition_cost,
            "total_unrealized_gain_loss": total_unrealized_gain,
            "asset_count_by_category": asset_count_by_category
        }
    
    def _model_to_entity(self, model: AssetModel) -> Asset:
        """Convert database model to domain entity"""
        # Map string asset_type back to enum
        try:
            asset_type = AssetType(model.asset_type)
        except ValueError:
            asset_type = AssetType.OTHER  # Default fallback
        
        return Asset(
            id=model.id,
            user_id=model.user_id,
            name=model.name,
            asset_type=asset_type,
            current_value=Money(Decimal(str(model.current_value))),
            acquisition_cost=Money(Decimal(str(model.acquisition_cost))),
            acquisition_date=model.acquisition_date,
            useful_life_years=model.useful_life_years,
            related_liability_id=model.related_liability_id,
            description=model.description,
            location=model.location,
            is_active=model.is_active,
            created_at=model.created_at,
            updated_at=model.updated_at
        )