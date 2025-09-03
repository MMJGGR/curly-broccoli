"""
Manage Financial Relationships Use Case - Clean Architecture
CFA-compliant cross-component financial relationship management
"""
from typing import Dict, Any, List, Optional
from datetime import date
from decimal import Decimal

from ...domain.entities.financial_relationship import (
    FinancialRelationship, RelationshipType, RelationshipStatus,
    CrossComponentAnalyzer, RelationshipImpact
)
from ...domain.entities.money import Money
from ...domain.repositories.relationship_repository import RelationshipRepository
from ...domain.repositories.asset_repository import AssetRepository
from ...domain.repositories.income_repository import IncomeRepository
from ...domain.repositories.expense_repository import ExpenseRepository
from ...domain.repositories.liability_repository import LiabilityRepository


class ManageFinancialRelationships:
    """Use case for managing cross-component financial relationships"""
    
    def __init__(
        self,
        relationship_repository: RelationshipRepository,
        asset_repository: AssetRepository,
        income_repository: IncomeRepository,
        expense_repository: ExpenseRepository,
        liability_repository: LiabilityRepository
    ):
        self._relationship_repository = relationship_repository
        self._asset_repository = asset_repository
        self._income_repository = income_repository
        self._expense_repository = expense_repository
        self._liability_repository = liability_repository
    
    async def create_relationship(
        self,
        user_id: int,
        relationship_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create a new financial relationship between components"""
        
        # Validate component existence
        source_exists = await self._validate_component_exists(
            relationship_data['source_type'],
            relationship_data['source_id'],
            user_id
        )
        target_exists = await self._validate_component_exists(
            relationship_data['target_type'],
            relationship_data['target_id'],
            user_id
        )
        
        if not source_exists:
            raise ValueError(f"Source {relationship_data['source_type']} not found")
        if not target_exists:
            raise ValueError(f"Target {relationship_data['target_type']} not found")
        
        # Create relationship entity
        relationship = FinancialRelationship(
            id=None,
            user_id=user_id,
            relationship_type=RelationshipType(relationship_data['relationship_type']),
            source_type=relationship_data['source_type'],
            source_id=relationship_data['source_id'],
            target_type=relationship_data['target_type'],
            target_id=relationship_data['target_id'],
            amount=Money(Decimal(str(relationship_data.get('amount', 0)))) if relationship_data.get('amount') else None,
            percentage=Decimal(str(relationship_data.get('percentage', 0))) if relationship_data.get('percentage') else None,
            frequency=relationship_data.get('frequency', 'monthly'),
            start_date=relationship_data.get('start_date'),
            end_date=relationship_data.get('end_date'),
            status=RelationshipStatus(relationship_data.get('status', 'active')),
            description=relationship_data.get('description'),
            metadata=relationship_data.get('metadata', {})
        )
        
        # Save relationship
        saved_relationship = await self._relationship_repository.create(relationship)
        
        # Return response with impact analysis
        impact_analysis = await self._analyze_relationship_impact(saved_relationship)
        
        return {
            'relationship': self._relationship_to_dict(saved_relationship),
            'impact_analysis': impact_analysis,
            'success': True
        }
    
    async def get_component_relationships(
        self,
        user_id: int,
        component_type: str,
        component_id: int
    ) -> Dict[str, Any]:
        """Get all relationships for a specific component with impact analysis"""
        
        relationships = await self._relationship_repository.get_by_component(
            component_type, component_id, user_id
        )
        
        # Analyze relationships based on component type
        if component_type == 'asset':
            analysis = CrossComponentAnalyzer.analyze_asset_relationships(
                component_id, relationships
            )
        elif component_type == 'goal':
            analysis = CrossComponentAnalyzer.analyze_goal_funding(
                component_id, relationships
            )
        else:
            analysis = self._generic_component_analysis(component_id, relationships)
        
        return {
            'component_type': component_type,
            'component_id': component_id,
            'relationships': [self._relationship_to_dict(r) for r in relationships],
            'analysis': analysis,
            'total_relationships': len(relationships)
        }
    
    async def get_net_worth_impact(self, user_id: int) -> Dict[str, Any]:
        """Calculate how all relationships impact net worth"""
        
        all_relationships = await self._relationship_repository.get_by_user_id(user_id)
        impact_analysis = CrossComponentAnalyzer.calculate_net_worth_impact(all_relationships)
        
        return {
            'monthly_net_worth_impact': impact_analysis['net_monthly_impact'].amount,
            'asset_impacts': {k: v.amount for k, v in impact_analysis['monthly_asset_impact'].items()},
            'liability_impacts': {k: v.amount for k, v in impact_analysis['monthly_liability_impact'].items()},
            'total_relationships': len(all_relationships),
            'relationship_summary': await self._get_relationship_summary(all_relationships)
        }
    
    async def create_asset_income_relationship(
        self,
        user_id: int,
        asset_id: int,
        income_source_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Create an asset that generates income (e.g., rental property)"""
        
        # Create income source
        income_data = {
            'description': income_source_data['description'],
            'amount': income_source_data['monthly_amount'],
            'income_type': income_source_data.get('income_type', 'asset_income'),
            'frequency': 'monthly',
            'source_details': {
                'linked_asset_id': asset_id,
                'asset_generated': True
            }
        }
        
        # This would call the income repository to create the income source
        # For now, we'll simulate this by creating the relationship
        
        relationship_data = {
            'relationship_type': 'asset_income',
            'source_type': 'asset',
            'source_id': asset_id,
            'target_type': 'income',
            'target_id': income_source_data.get('income_id'),  # Would be created above
            'amount': income_source_data['monthly_amount'],
            'frequency': 'monthly',
            'description': f"Income generated by asset: {income_source_data['description']}"
        }
        
        return await self.create_relationship(user_id, relationship_data)
    
    async def create_goal_funding_plan(
        self,
        user_id: int,
        goal_id: int,
        funding_sources: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Create multiple funding relationships for a goal"""
        
        created_relationships = []
        total_monthly_funding = Money(Decimal('0'))
        
        for source in funding_sources:
            relationship_data = {
                'relationship_type': f"goal_{source['source_type']}",
                'source_type': source['source_type'],
                'source_id': source['source_id'],
                'target_type': 'goal',
                'target_id': goal_id,
                'amount': source.get('monthly_amount'),
                'percentage': source.get('percentage'),
                'frequency': 'monthly',
                'description': f"Funding for goal from {source['source_type']}"
            }
            
            result = await self.create_relationship(user_id, relationship_data)
            created_relationships.append(result['relationship'])
            
            if result['relationship']['amount']:
                amount = Money(Decimal(str(result['relationship']['amount'])))
                total_monthly_funding = Money(total_monthly_funding.amount + amount.amount)
        
        return {
            'goal_id': goal_id,
            'funding_relationships': created_relationships,
            'total_monthly_funding': total_monthly_funding.amount,
            'funding_sources_count': len(created_relationships),
            'success': True
        }
    
    async def update_relationship(
        self,
        user_id: int,
        relationship_id: int,
        update_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update an existing relationship"""
        
        existing = await self._relationship_repository.get_by_id(relationship_id)
        if not existing or existing.user_id != user_id:
            raise ValueError("Relationship not found or access denied")
        
        # Update fields
        if 'amount' in update_data:
            existing.amount = Money(Decimal(str(update_data['amount'])))
        if 'percentage' in update_data:
            existing.percentage = Decimal(str(update_data['percentage']))
        if 'frequency' in update_data:
            existing.frequency = update_data['frequency']
        if 'status' in update_data:
            existing.status = RelationshipStatus(update_data['status'])
        if 'description' in update_data:
            existing.description = update_data['description']
        if 'end_date' in update_data:
            existing.end_date = update_data['end_date']
        
        updated = await self._relationship_repository.update(existing)
        impact_analysis = await self._analyze_relationship_impact(updated)
        
        return {
            'relationship': self._relationship_to_dict(updated),
            'impact_analysis': impact_analysis,
            'success': True
        }
    
    async def delete_relationship(
        self,
        user_id: int,
        relationship_id: int
    ) -> Dict[str, Any]:
        """Delete a financial relationship"""
        
        existing = await self._relationship_repository.get_by_id(relationship_id)
        if not existing or existing.user_id != user_id:
            raise ValueError("Relationship not found or access denied")
        
        success = await self._relationship_repository.delete(relationship_id, user_id)
        
        return {
            'relationship_id': relationship_id,
            'deleted': success,
            'success': success
        }
    
    async def _validate_component_exists(
        self,
        component_type: str,
        component_id: int,
        user_id: int
    ) -> bool:
        """Validate that a component exists"""
        
        if component_type == 'asset':
            component = await self._asset_repository.get_by_id(component_id, user_id)
        elif component_type == 'income':
            component = await self._income_repository.get_by_id(component_id, user_id)
        elif component_type == 'expense':
            component = await self._expense_repository.get_by_id(component_id, user_id)
        elif component_type == 'liability':
            component = await self._liability_repository.get_by_id(component_id, user_id)
        elif component_type == 'goal':
            # Would need goal repository
            return True  # Assume valid for now
        else:
            return False
        
        return component is not None
    
    async def _analyze_relationship_impact(
        self,
        relationship: FinancialRelationship
    ) -> Dict[str, Any]:
        """Analyze the impact of a specific relationship"""
        
        monthly_impact = relationship.calculate_monthly_impact()
        
        return {
            'monthly_impact': monthly_impact.amount,
            'frequency': relationship.frequency,
            'relationship_type': relationship.relationship_type.value,
            'status': relationship.status.value,
            'description': relationship.get_relationship_description()
        }
    
    def _generic_component_analysis(
        self,
        component_id: int,
        relationships: List[FinancialRelationship]
    ) -> Dict[str, Any]:
        """Generic analysis for components without specific analyzers"""
        
        total_impact = Money(Decimal('0'))
        by_type = {}
        
        for rel in relationships:
            impact = rel.calculate_monthly_impact()
            total_impact = Money(total_impact.amount + impact.amount)
            
            rel_type = rel.relationship_type.value
            if rel_type not in by_type:
                by_type[rel_type] = {'count': 0, 'total_impact': Money(Decimal('0'))}
            
            by_type[rel_type]['count'] += 1
            by_type[rel_type]['total_impact'] = Money(
                by_type[rel_type]['total_impact'].amount + impact.amount
            )
        
        return {
            'component_id': component_id,
            'total_monthly_impact': total_impact.amount,
            'relationships_by_type': {k: {'count': v['count'], 'total_impact': v['total_impact'].amount} 
                                   for k, v in by_type.items()},
            'total_relationships': len(relationships)
        }
    
    async def _get_relationship_summary(
        self,
        relationships: List[FinancialRelationship]
    ) -> Dict[str, Any]:
        """Get summary statistics for a list of relationships"""
        
        by_type = {}
        active_count = 0
        total_monthly_impact = Money(Decimal('0'))
        
        for rel in relationships:
            if rel.status == RelationshipStatus.ACTIVE:
                active_count += 1
                impact = rel.calculate_monthly_impact()
                total_monthly_impact = Money(total_monthly_impact.amount + impact.amount)
            
            rel_type = rel.relationship_type.value
            if rel_type not in by_type:
                by_type[rel_type] = 0
            by_type[rel_type] += 1
        
        return {
            'total_relationships': len(relationships),
            'active_relationships': active_count,
            'total_monthly_impact': total_monthly_impact.amount,
            'relationships_by_type': by_type
        }
    
    def _relationship_to_dict(self, relationship: FinancialRelationship) -> Dict[str, Any]:
        """Convert relationship entity to dictionary for API response"""
        return {
            'id': relationship.id,
            'user_id': relationship.user_id,
            'relationship_type': relationship.relationship_type.value,
            'source_type': relationship.source_type,
            'source_id': relationship.source_id,
            'target_type': relationship.target_type,
            'target_id': relationship.target_id,
            'amount': relationship.amount.amount if relationship.amount else None,
            'percentage': relationship.percentage,
            'frequency': relationship.frequency,
            'start_date': relationship.start_date.isoformat() if relationship.start_date else None,
            'end_date': relationship.end_date.isoformat() if relationship.end_date else None,
            'status': relationship.status.value,
            'description': relationship.description,
            'metadata': relationship.metadata,
            'monthly_impact': relationship.calculate_monthly_impact().amount
        }