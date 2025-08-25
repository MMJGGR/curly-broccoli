"""
UpdateAsset Use Case - Application Layer
Foundation Week Day 2: Asset updates with CFA-compliant validation
"""
from typing import Dict
from datetime import datetime, timezone
from decimal import Decimal

from ...domain.entities.asset import Asset, AssetType
from ...domain.entities.money import Money
from ...domain.repositories.asset_repository import AssetRepository


class UpdateAsset:
    """
    Use case for updating existing assets with proper validation.
    
    Following CFA standards:
    - Asset classification validation
    - Business rule enforcement
    - Audit trail maintenance
    - Logical consistency checks
    """
    
    def __init__(self, asset_repository: AssetRepository):
        self._asset_repository = asset_repository
    
    async def execute(self, user_id: int, asset_id: int, asset_data: Dict) -> Asset:
        """
        Execute asset update with validation.
        
        Args:
            user_id: ID of user updating the asset
            asset_id: ID of asset to update
            asset_data: Dictionary containing updated asset information
            
        Returns:
            Updated Asset entity
        """
        try:
            # Get existing asset
            existing_asset = await self._asset_repository.get_asset_by_id(user_id, asset_id)
            
            if not existing_asset:
                raise ValueError(f"Asset {asset_id} not found or not owned by user {user_id}")
            
            # Validate update data
            self._validate_update_data(asset_data)
            
            # Create updated asset entity
            updated_asset = self._create_updated_asset(existing_asset, asset_data)
            
            # Save to repository
            return await self._asset_repository.update_asset(updated_asset)
            
        except ValueError as e:
            raise ValueError(f"Invalid asset update data: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to update asset: {str(e)}")
    
    def _validate_update_data(self, asset_data: Dict) -> None:
        """Validate update data (similar to create but allows partial updates)"""
        # Validate asset type if provided
        if "asset_type" in asset_data:
            try:
                AssetType(asset_data["asset_type"].lower())
            except ValueError:
                valid_types = [t.value for t in AssetType]
                raise ValueError(f"Invalid asset_type '{asset_data['asset_type']}'. Valid types: {valid_types}")
        
        # Validate monetary values if provided
        for field in ["current_value", "acquisition_cost"]:
            if field in asset_data:
                try:
                    value = Decimal(str(asset_data[field]))
                    if value < 0:
                        raise ValueError(f"{field} must be non-negative")
                except (ValueError, TypeError):
                    raise ValueError(f"Invalid {field}. Must be a valid number")
        
        # Validate name if provided
        if "name" in asset_data:
            name = str(asset_data["name"]).strip()
            if len(name) < 2:
                raise ValueError("Asset name must be at least 2 characters long")
            if len(name) > 255:
                raise ValueError("Asset name must be less than 255 characters")
        
        # Validate useful life if provided
        if "useful_life_years" in asset_data and asset_data["useful_life_years"] is not None:
            useful_life = asset_data["useful_life_years"]
            if not isinstance(useful_life, int) or useful_life <= 0:
                raise ValueError("useful_life_years must be a positive integer")
            if useful_life > 100:
                raise ValueError("useful_life_years cannot exceed 100 years")
        
        # Validate description length if provided
        if "description" in asset_data and asset_data["description"]:
            if len(str(asset_data["description"])) > 1000:
                raise ValueError("Description must be less than 1000 characters")
        
        # Validate location length if provided
        if "location" in asset_data and asset_data["location"]:
            if len(str(asset_data["location"])) > 255:
                raise ValueError("Location must be less than 255 characters")
        
        # Validate acquisition date if provided
        if "acquisition_date" in asset_data:
            self._parse_date(asset_data["acquisition_date"])
    
    def _create_updated_asset(self, existing_asset: Asset, asset_data: Dict) -> Asset:
        """Create updated asset entity with new values"""
        # Start with existing asset values
        updated_values = {
            "id": existing_asset.id,
            "user_id": existing_asset.user_id,
            "name": existing_asset.name,
            "asset_type": existing_asset.asset_type,
            "current_value": existing_asset.current_value,
            "acquisition_cost": existing_asset.acquisition_cost,
            "acquisition_date": existing_asset.acquisition_date,
            "useful_life_years": existing_asset.useful_life_years,
            "related_liability_id": existing_asset.related_liability_id,
            "description": existing_asset.description,
            "location": existing_asset.location,
            "is_active": existing_asset.is_active,
            "created_at": existing_asset.created_at,
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Apply updates
        if "name" in asset_data:
            updated_values["name"] = asset_data["name"].strip()
        
        if "asset_type" in asset_data:
            updated_values["asset_type"] = AssetType(asset_data["asset_type"].lower())
        
        if "current_value" in asset_data:
            updated_values["current_value"] = Money(Decimal(str(asset_data["current_value"])))
        
        if "acquisition_cost" in asset_data:
            updated_values["acquisition_cost"] = Money(Decimal(str(asset_data["acquisition_cost"])))
        
        if "acquisition_date" in asset_data:
            updated_values["acquisition_date"] = self._parse_date(asset_data["acquisition_date"])
        
        if "useful_life_years" in asset_data:
            updated_values["useful_life_years"] = asset_data["useful_life_years"]
        
        if "related_liability_id" in asset_data:
            updated_values["related_liability_id"] = asset_data["related_liability_id"]
        
        if "description" in asset_data:
            description = asset_data["description"]
            updated_values["description"] = description.strip() if description else None
        
        if "location" in asset_data:
            location = asset_data["location"]
            updated_values["location"] = location.strip() if location else None
        
        if "is_active" in asset_data:
            updated_values["is_active"] = bool(asset_data["is_active"])
        
        return Asset(**updated_values)
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime object"""
        try:
            if isinstance(date_str, str):
                # Handle ISO format dates
                if 'T' in date_str:
                    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                else:
                    dt = datetime.fromisoformat(date_str)
                
                # Ensure timezone awareness
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                
                return dt
            else:
                raise ValueError("Date must be a string")
                
        except Exception as e:
            raise ValueError(f"Invalid acquisition_date format. Expected ISO format: {str(e)}")