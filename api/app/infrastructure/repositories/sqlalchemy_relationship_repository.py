"""
SQLAlchemy Relationship Repository Implementation - Clean Architecture
CFA-compliant financial relationship data persistence
"""
from typing import List, Optional, Dict, Any
from datetime import date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from ...domain.entities.financial_relationship import (
    FinancialRelationship, RelationshipType, RelationshipStatus
)
from ...domain.entities.money import Money
from ...domain.repositories.relationship_repository import RelationshipRepository
from ...models import FinancialRelationship as FinancialRelationshipModel


class SQLAlchemyRelationshipRepository(RelationshipRepository):
    """SQLAlchemy implementation of the relationship repository"""
    
    def __init__(self, db_session: Session):
        self._db = db_session
    
    async def create(self, relationship: FinancialRelationship) -> FinancialRelationship:
        """Create a new financial relationship"""
        db_relationship = FinancialRelationshipModel(
            user_id=relationship.user_id,
            relationship_type=relationship.relationship_type.value,
            source_type=relationship.source_type,
            source_id=relationship.source_id,
            target_type=relationship.target_type,
            target_id=relationship.target_id,
            amount=relationship.amount.amount if relationship.amount else None,
            percentage=relationship.percentage,
            frequency=relationship.frequency,
            start_date=relationship.start_date,
            end_date=relationship.end_date,
            status=relationship.status.value,
            description=relationship.description,
            relationship_metadata=relationship.metadata or {}
        )
        
        self._db.add(db_relationship)
        self._db.commit()
        self._db.refresh(db_relationship)
        
        return self._to_domain_entity(db_relationship)
    
    async def get_by_id(self, relationship_id: int) -> Optional[FinancialRelationship]:
        """Get a relationship by its ID"""
        db_relationship = self._db.query(FinancialRelationshipModel).filter(
            FinancialRelationshipModel.id == relationship_id
        ).first()
        
        return self._to_domain_entity(db_relationship) if db_relationship else None
    
    async def get_by_user_id(self, user_id: int) -> List[FinancialRelationship]:
        """Get all relationships for a user"""
        db_relationships = self._db.query(FinancialRelationshipModel).filter(
            FinancialRelationshipModel.user_id == user_id
        ).all()
        
        return [self._to_domain_entity(rel) for rel in db_relationships]
    
    async def get_by_component(
        self, 
        component_type: str, 
        component_id: int, 
        user_id: int
    ) -> List[FinancialRelationship]:
        """Get all relationships involving a specific component"""
        db_relationships = self._db.query(FinancialRelationshipModel).filter(
            and_(
                FinancialRelationshipModel.user_id == user_id,
                or_(
                    and_(
                        FinancialRelationshipModel.source_type == component_type,
                        FinancialRelationshipModel.source_id == component_id
                    ),
                    and_(
                        FinancialRelationshipModel.target_type == component_type,
                        FinancialRelationshipModel.target_id == component_id
                    )
                )
            )
        ).all()
        
        return [self._to_domain_entity(rel) for rel in db_relationships]
    
    async def get_by_type(
        self, 
        relationship_type: RelationshipType, 
        user_id: int
    ) -> List[FinancialRelationship]:
        """Get all relationships of a specific type for a user"""
        db_relationships = self._db.query(FinancialRelationshipModel).filter(
            and_(
                FinancialRelationshipModel.user_id == user_id,
                FinancialRelationshipModel.relationship_type == relationship_type.value
            )
        ).all()
        
        return [self._to_domain_entity(rel) for rel in db_relationships]
    
    async def update(self, relationship: FinancialRelationship) -> FinancialRelationship:
        """Update an existing relationship"""
        db_relationship = self._db.query(FinancialRelationshipModel).filter(
            FinancialRelationshipModel.id == relationship.id
        ).first()
        
        if not db_relationship:
            raise ValueError(f"Relationship {relationship.id} not found")
        
        # Update fields
        db_relationship.amount = relationship.amount.amount if relationship.amount else None
        db_relationship.percentage = relationship.percentage
        db_relationship.frequency = relationship.frequency
        db_relationship.start_date = relationship.start_date
        db_relationship.end_date = relationship.end_date
        db_relationship.status = relationship.status.value
        db_relationship.description = relationship.description
        db_relationship.relationship_metadata = relationship.metadata or {}
        
        self._db.commit()
        self._db.refresh(db_relationship)
        
        return self._to_domain_entity(db_relationship)
    
    async def delete(self, relationship_id: int, user_id: int) -> bool:
        """Delete a relationship"""
        db_relationship = self._db.query(FinancialRelationshipModel).filter(
            and_(
                FinancialRelationshipModel.id == relationship_id,
                FinancialRelationshipModel.user_id == user_id
            )
        ).first()
        
        if not db_relationship:
            return False
        
        self._db.delete(db_relationship)
        self._db.commit()
        
        return True
    
    async def get_active_relationships(
        self, 
        user_id: int, 
        as_of_date: Optional[date] = None
    ) -> List[FinancialRelationship]:
        """Get all active relationships for a user on a specific date"""
        if as_of_date is None:
            as_of_date = date.today()
        
        query = self._db.query(FinancialRelationshipModel).filter(
            and_(
                FinancialRelationshipModel.user_id == user_id,
                FinancialRelationshipModel.status == RelationshipStatus.ACTIVE.value
            )
        )
        
        # Filter by date range if specified
        query = query.filter(
            or_(
                FinancialRelationshipModel.start_date.is_(None),
                FinancialRelationshipModel.start_date <= as_of_date
            )
        ).filter(
            or_(
                FinancialRelationshipModel.end_date.is_(None),
                FinancialRelationshipModel.end_date >= as_of_date
            )
        )
        
        db_relationships = query.all()
        return [self._to_domain_entity(rel) for rel in db_relationships]
    
    async def get_relationships_by_source(
        self, 
        source_type: str, 
        source_id: int, 
        user_id: int
    ) -> List[FinancialRelationship]:
        """Get all relationships where component is the source"""
        db_relationships = self._db.query(FinancialRelationshipModel).filter(
            and_(
                FinancialRelationshipModel.user_id == user_id,
                FinancialRelationshipModel.source_type == source_type,
                FinancialRelationshipModel.source_id == source_id
            )
        ).all()
        
        return [self._to_domain_entity(rel) for rel in db_relationships]
    
    async def get_relationships_by_target(
        self, 
        target_type: str, 
        target_id: int, 
        user_id: int
    ) -> List[FinancialRelationship]:
        """Get all relationships where component is the target"""
        db_relationships = self._db.query(FinancialRelationshipModel).filter(
            and_(
                FinancialRelationshipModel.user_id == user_id,
                FinancialRelationshipModel.target_type == target_type,
                FinancialRelationshipModel.target_id == target_id
            )
        ).all()
        
        return [self._to_domain_entity(rel) for rel in db_relationships]
    
    def _to_domain_entity(self, db_relationship: FinancialRelationshipModel) -> FinancialRelationship:
        """Convert database model to domain entity"""
        return FinancialRelationship(
            id=db_relationship.id,
            user_id=db_relationship.user_id,
            relationship_type=RelationshipType(db_relationship.relationship_type),
            source_type=db_relationship.source_type,
            source_id=db_relationship.source_id,
            target_type=db_relationship.target_type,
            target_id=db_relationship.target_id,
            amount=Money(db_relationship.amount) if db_relationship.amount else None,
            percentage=db_relationship.percentage,
            frequency=db_relationship.frequency,
            start_date=db_relationship.start_date,
            end_date=db_relationship.end_date,
            status=RelationshipStatus(db_relationship.status),
            description=db_relationship.description,
            metadata=db_relationship.relationship_metadata,
            created_at=db_relationship.created_at,
            updated_at=db_relationship.updated_at
        )