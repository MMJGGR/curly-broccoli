"""
CreateAsset Use Case - Application Layer
Foundation Week Day 2: Asset creation with CFA-compliant validation
"""
from typing import Dict
from datetime import datetime, timezone
from decimal import Decimal

from ...domain.entities.asset import Asset, AssetType
from ...domain.entities.money import Money
from ...domain.repositories.asset_repository import AssetRepository


class CreateAsset:
    """
    Use case for creating new assets with proper validation.
    
    Following CFA standards:
    - Asset classification validation
    - Required field validation
    - Logical consistency checks
    - Proper initialization of calculated fields
    """
    
    def __init__(self, asset_repository: AssetRepository):
        self._asset_repository = asset_repository
    
    async def execute(self, user_id: int, asset_data: Dict) -> Asset:
        """
        Execute asset creation with validation.
        
        Args:
            user_id: ID of user creating the asset
            asset_data: Dictionary containing asset information
            
        Returns:
            Created Asset entity
        """
        try:
            # Validate and extract required fields
            self._validate_required_fields(asset_data)
            
            # Parse and validate asset type
            asset_type = self._validate_asset_type(asset_data.get("asset_type"))
            
            # Parse monetary values
            current_value = Money(Decimal(str(asset_data["current_value"])))
            acquisition_cost = Money(Decimal(str(asset_data["acquisition_cost"])))
            
            # Parse acquisition date
            acquisition_date = self._parse_date(asset_data["acquisition_date"])
            
            # Validate business rules
            self._validate_business_rules(current_value, acquisition_cost, asset_data)
            
            # Create domain entity
            asset = Asset(
                id=0,  # Will be set by repository
                user_id=user_id,
                name=asset_data["name"].strip(),
                asset_type=asset_type,
                current_value=current_value,
                acquisition_cost=acquisition_cost,
                acquisition_date=acquisition_date,
                useful_life_years=asset_data.get("useful_life_years"),
                related_liability_id=asset_data.get("related_liability_id"),
                description=asset_data.get("description", "").strip() or None,
                location=asset_data.get("location", "").strip() or None,
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )
            
            # Save to repository
            return await self._asset_repository.create_asset(asset)
            
        except ValueError as e:
            raise ValueError(f"Invalid asset data: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to create asset: {str(e)}")
    
    def _validate_required_fields(self, asset_data: Dict) -> None:
        """Validate that all required fields are present"""
        required_fields = ["name", "asset_type", "current_value", "acquisition_cost", "acquisition_date"]
        
        for field in required_fields:
            if field not in asset_data or asset_data[field] is None:
                raise ValueError(f"Missing required field: {field}")
            
            if isinstance(asset_data[field], str) and not asset_data[field].strip():
                raise ValueError(f"Field '{field}' cannot be empty")
    
    def _validate_asset_type(self, asset_type_str: str) -> AssetType:
        """Validate and convert asset type string to enum"""
        try:
            return AssetType(asset_type_str.lower())
        except ValueError:
            valid_types = [t.value for t in AssetType]
            raise ValueError(f"Invalid asset_type '{asset_type_str}'. Valid types: {valid_types}")
    
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
    
    def _validate_business_rules(self, current_value: Money, acquisition_cost: Money, asset_data: Dict) -> None:
        """Validate business rules and logical consistency"""
        # Values must be non-negative
        if current_value.is_negative():
            raise ValueError("current_value must be non-negative")
        
        if acquisition_cost.is_negative():
            raise ValueError("acquisition_cost must be non-negative")
        
        # Name length validation
        name = asset_data["name"].strip()
        if len(name) < 2:
            raise ValueError("Asset name must be at least 2 characters long")
        
        if len(name) > 255:
            raise ValueError("Asset name must be less than 255 characters")
        
        # Useful life validation for depreciating assets
        useful_life_years = asset_data.get("useful_life_years")
        if useful_life_years is not None:
            if not isinstance(useful_life_years, int) or useful_life_years <= 0:
                raise ValueError("useful_life_years must be a positive integer")
            
            if useful_life_years > 100:
                raise ValueError("useful_life_years cannot exceed 100 years")
        
        # Description length validation
        description = asset_data.get("description", "")
        if description and len(description) > 1000:
            raise ValueError("Description must be less than 1000 characters")
        
        # Location length validation
        location = asset_data.get("location", "")
        if location and len(location) > 255:
            raise ValueError("Location must be less than 255 characters")