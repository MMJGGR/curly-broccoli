"""
Asset Repository Interface - Domain Layer
Defines contracts for asset data access without implementation details
"""
from abc import ABC, abstractmethod
from typing import List, Optional

from ..entities.asset import Asset


class AssetRepository(ABC):
    """Abstract asset repository interface following clean architecture"""
    
    @abstractmethod
    async def get_user_assets(self, user_id: int) -> List[Asset]:
        """Get all assets for a user"""
        pass
    
    @abstractmethod
    async def get_asset_by_id(self, user_id: int, asset_id: int) -> Optional[Asset]:
        """Get specific asset by ID"""
        pass
    
    @abstractmethod
    async def create_asset(self, asset: Asset) -> Asset:
        """Create new asset"""
        pass
    
    @abstractmethod
    async def update_asset(self, asset: Asset) -> Asset:
        """Update existing asset"""
        pass
    
    @abstractmethod
    async def delete_asset(self, user_id: int, asset_id: int) -> bool:
        """Delete asset"""
        pass
    
    @abstractmethod
    async def get_assets_by_category(self, user_id: int, category: str) -> List[Asset]:
        """Get assets filtered by category"""
        pass
    
    @abstractmethod
    async def get_assets_summary(self, user_id: int) -> dict:
        """Get summary statistics for user's assets"""
        pass