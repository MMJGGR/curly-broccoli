"""
Asset Repository Interface - Clean Architecture
"""
from abc import ABC, abstractmethod
from typing import List, Optional

from ...domain.entities.asset import Asset


class AssetRepository(ABC):
    """Abstract interface for asset data persistence"""
    
    @abstractmethod
    async def save(self, asset: Asset) -> Asset:
        """
        Save asset (create or update).
        
        Args:
            asset: Asset entity to save
            
        Returns:
            Asset: Saved asset with updated ID and timestamps
        """
        pass
    
    @abstractmethod
    async def get_by_id(self, asset_id: int) -> Optional[Asset]:
        """
        Retrieve asset by ID.
        
        Args:
            asset_id: Asset identifier
            
        Returns:
            Optional[Asset]: Asset if found, None otherwise
        """
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int, include_inactive: bool = False) -> List[Asset]:
        """
        Retrieve all assets for a user.
        
        Args:
            user_id: User identifier
            include_inactive: Whether to include inactive assets
            
        Returns:
            List[Asset]: User's assets
        """
        pass
    
    @abstractmethod
    async def delete(self, asset_id: int) -> bool:
        """
        Delete asset permanently.
        
        Args:
            asset_id: Asset identifier
            
        Returns:
            bool: True if deleted successfully
        """
        pass