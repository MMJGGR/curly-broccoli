"""
Financial Relationship Repository Interface - Clean Architecture
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import date

from ..entities.financial_relationship import FinancialRelationship, RelationshipType


class RelationshipRepository(ABC):
    """Repository interface for financial relationships"""
    
    @abstractmethod
    async def create(self, relationship: FinancialRelationship) -> FinancialRelationship:
        """Create a new financial relationship"""
        pass
    
    @abstractmethod
    async def get_by_id(self, relationship_id: int) -> Optional[FinancialRelationship]:
        """Get a relationship by its ID"""
        pass
    
    @abstractmethod
    async def get_by_user_id(self, user_id: int) -> List[FinancialRelationship]:
        """Get all relationships for a user"""
        pass
    
    @abstractmethod
    async def get_by_component(
        self, 
        component_type: str, 
        component_id: int, 
        user_id: int
    ) -> List[FinancialRelationship]:
        """Get all relationships involving a specific component"""
        pass
    
    @abstractmethod
    async def get_by_type(
        self, 
        relationship_type: RelationshipType, 
        user_id: int
    ) -> List[FinancialRelationship]:
        """Get all relationships of a specific type for a user"""
        pass
    
    @abstractmethod
    async def update(self, relationship: FinancialRelationship) -> FinancialRelationship:
        """Update an existing relationship"""
        pass
    
    @abstractmethod
    async def delete(self, relationship_id: int, user_id: int) -> bool:
        """Delete a relationship"""
        pass
    
    @abstractmethod
    async def get_active_relationships(
        self, 
        user_id: int, 
        as_of_date: Optional[date] = None
    ) -> List[FinancialRelationship]:
        """Get all active relationships for a user on a specific date"""
        pass
    
    @abstractmethod
    async def get_relationships_by_source(
        self, 
        source_type: str, 
        source_id: int, 
        user_id: int
    ) -> List[FinancialRelationship]:
        """Get all relationships where component is the source"""
        pass
    
    @abstractmethod
    async def get_relationships_by_target(
        self, 
        target_type: str, 
        target_id: int, 
        user_id: int
    ) -> List[FinancialRelationship]:
        """Get all relationships where component is the target"""
        pass