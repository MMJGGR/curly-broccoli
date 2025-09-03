"""
Financial Relationship Entities - Clean Architecture
Defines relationships between financial components (assets, income, expenses, goals)
"""
from dataclasses import dataclass
from typing import Optional, Dict, Any
from datetime import date
from decimal import Decimal
from enum import Enum

from .money import Money


class RelationshipType(Enum):
    """Types of relationships between financial components"""
    ASSET_INCOME = "asset_income"  # Asset generates income (rental property -> rental income)
    ASSET_EXPENSE = "asset_expense"  # Asset requires expenses (property -> maintenance)
    LIABILITY_EXPENSE = "liability_expense"  # Liability requires payments (loan -> payment)
    GOAL_ASSET = "goal_asset"  # Goal is funded by asset (house goal -> savings account)
    GOAL_INCOME = "goal_income"  # Goal is funded by income allocation
    INCOME_EXPENSE = "income_expense"  # Income is reduced by expense (salary -> taxes)


class RelationshipStatus(Enum):
    """Status of the relationship"""
    ACTIVE = "active"
    INACTIVE = "inactive"
    PENDING = "pending"
    COMPLETED = "completed"


@dataclass
class FinancialRelationship:
    """
    Represents a relationship between two financial components
    Following CFA principles for comprehensive financial planning
    """
    id: Optional[int]
    user_id: int
    relationship_type: RelationshipType
    source_type: str  # 'asset', 'income', 'expense', 'liability', 'goal'
    source_id: int
    target_type: str  # 'asset', 'income', 'expense', 'liability', 'goal'
    target_id: int
    amount: Optional[Money] = None  # Amount of the relationship (e.g., monthly rental income)
    percentage: Optional[Decimal] = None  # Percentage allocation (e.g., 20% of income to goal)
    frequency: Optional[str] = None  # 'monthly', 'quarterly', 'annually', 'one_time'
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: RelationshipStatus = RelationshipStatus.ACTIVE
    metadata: Optional[Dict[str, Any]] = None  # Additional relationship-specific data
    description: Optional[str] = None
    created_at: Optional[date] = None
    updated_at: Optional[date] = None

    def calculate_monthly_impact(self) -> Money:
        """Calculate the monthly financial impact of this relationship"""
        if not self.amount:
            return Money(Decimal('0'))
            
        if self.frequency == 'monthly':
            return self.amount
        elif self.frequency == 'quarterly':
            return Money(self.amount.amount / 3)
        elif self.frequency == 'annually':
            return Money(self.amount.amount / 12)
        elif self.frequency == 'one_time':
            return Money(Decimal('0'))  # One-time impacts need special handling
        
        return self.amount

    def is_active_on_date(self, check_date: date) -> bool:
        """Check if relationship is active on a specific date"""
        if self.status != RelationshipStatus.ACTIVE:
            return False
            
        if self.start_date and check_date < self.start_date:
            return False
            
        if self.end_date and check_date > self.end_date:
            return False
            
        return True

    def get_relationship_description(self) -> str:
        """Generate human-readable description of the relationship"""
        if self.description:
            return self.description
            
        type_descriptions = {
            RelationshipType.ASSET_INCOME: f"{self.source_type} generates income for {self.target_type}",
            RelationshipType.ASSET_EXPENSE: f"{self.source_type} requires expenses for {self.target_type}",
            RelationshipType.LIABILITY_EXPENSE: f"{self.source_type} requires payments to {self.target_type}",
            RelationshipType.GOAL_ASSET: f"{self.source_type} is funded by {self.target_type}",
            RelationshipType.GOAL_INCOME: f"{self.source_type} receives allocation from {self.target_type}",
            RelationshipType.INCOME_EXPENSE: f"{self.source_type} is reduced by {self.target_type}"
        }
        
        return type_descriptions.get(self.relationship_type, "Financial relationship")


@dataclass
class RelationshipImpact:
    """
    Represents the calculated impact of relationships on financial components
    Used for cross-component analysis and reporting
    """
    component_type: str  # 'asset', 'income', 'expense', 'liability', 'goal'
    component_id: int
    total_monthly_impact: Money
    incoming_relationships: list  # List of relationships that increase this component
    outgoing_relationships: list  # List of relationships that decrease this component
    net_impact: Money  # Net monthly impact considering all relationships
    
    def add_incoming_relationship(self, relationship: FinancialRelationship):
        """Add a relationship that positively impacts this component"""
        if not hasattr(self, 'incoming_relationships'):
            self.incoming_relationships = []
        self.incoming_relationships.append(relationship)
        self._recalculate_impact()
    
    def add_outgoing_relationship(self, relationship: FinancialRelationship):
        """Add a relationship that negatively impacts this component"""
        if not hasattr(self, 'outgoing_relationships'):
            self.outgoing_relationships = []
        self.outgoing_relationships.append(relationship)
        self._recalculate_impact()
    
    def _recalculate_impact(self):
        """Recalculate the net impact based on all relationships"""
        incoming_total = Money(Decimal('0'))
        outgoing_total = Money(Decimal('0'))
        
        for rel in getattr(self, 'incoming_relationships', []):
            incoming_total = Money(incoming_total.amount + rel.calculate_monthly_impact().amount)
            
        for rel in getattr(self, 'outgoing_relationships', []):
            outgoing_total = Money(outgoing_total.amount + rel.calculate_monthly_impact().amount)
        
        self.net_impact = Money(incoming_total.amount - outgoing_total.amount)
        self.total_monthly_impact = Money(abs(self.net_impact.amount))


class CrossComponentAnalyzer:
    """
    Analyzes cross-component relationships for comprehensive financial insights
    CFA-compliant analysis for integrated financial planning
    """
    
    @staticmethod
    def analyze_asset_relationships(asset_id: int, relationships: list) -> Dict[str, Any]:
        """Analyze all relationships for a specific asset"""
        asset_relationships = [r for r in relationships if 
                             (r.source_type == 'asset' and r.source_id == asset_id) or
                             (r.target_type == 'asset' and r.target_id == asset_id)]
        
        income_generated = Money(Decimal('0'))
        expenses_required = Money(Decimal('0'))
        
        for rel in asset_relationships:
            impact = rel.calculate_monthly_impact()
            
            if rel.relationship_type == RelationshipType.ASSET_INCOME:
                income_generated = Money(income_generated.amount + impact.amount)
            elif rel.relationship_type == RelationshipType.ASSET_EXPENSE:
                expenses_required = Money(expenses_required.amount + impact.amount)
        
        return {
            'asset_id': asset_id,
            'monthly_income_generated': income_generated,
            'monthly_expenses_required': expenses_required,
            'net_monthly_contribution': Money(income_generated.amount - expenses_required.amount),
            'total_relationships': len(asset_relationships),
            'relationship_details': asset_relationships
        }
    
    @staticmethod
    def analyze_goal_funding(goal_id: int, relationships: list) -> Dict[str, Any]:
        """Analyze funding sources for a specific goal"""
        goal_relationships = [r for r in relationships if 
                            r.target_type == 'goal' and r.target_id == goal_id]
        
        funding_sources = {
            'assets': [],
            'income_allocations': [],
            'total_monthly_funding': Money(Decimal('0'))
        }
        
        for rel in goal_relationships:
            impact = rel.calculate_monthly_impact()
            funding_sources['total_monthly_funding'] = Money(
                funding_sources['total_monthly_funding'].amount + impact.amount
            )
            
            if rel.relationship_type == RelationshipType.GOAL_ASSET:
                funding_sources['assets'].append({
                    'asset_id': rel.source_id,
                    'monthly_contribution': impact,
                    'relationship': rel
                })
            elif rel.relationship_type == RelationshipType.GOAL_INCOME:
                funding_sources['income_allocations'].append({
                    'income_id': rel.source_id,
                    'monthly_allocation': impact,
                    'percentage': rel.percentage,
                    'relationship': rel
                })
        
        return {
            'goal_id': goal_id,
            'funding_sources': funding_sources,
            'total_monthly_funding': funding_sources['total_monthly_funding'],
            'funding_diversity_score': len(goal_relationships)  # More sources = better diversification
        }
    
    @staticmethod
    def calculate_net_worth_impact(relationships: list) -> Dict[str, Money]:
        """Calculate how relationships impact overall net worth"""
        asset_impacts = {}
        liability_impacts = {}
        
        for rel in relationships:
            impact = rel.calculate_monthly_impact()
            
            # Track impacts on assets
            if rel.target_type == 'asset':
                asset_id = rel.target_id
                if asset_id not in asset_impacts:
                    asset_impacts[asset_id] = Money(Decimal('0'))
                
                if rel.relationship_type == RelationshipType.ASSET_INCOME:
                    asset_impacts[asset_id] = Money(asset_impacts[asset_id].amount + impact.amount)
                elif rel.relationship_type == RelationshipType.ASSET_EXPENSE:
                    asset_impacts[asset_id] = Money(asset_impacts[asset_id].amount - impact.amount)
            
            # Track impacts on liabilities
            elif rel.target_type == 'liability' or rel.relationship_type == RelationshipType.LIABILITY_EXPENSE:
                liability_id = rel.target_id if rel.target_type == 'liability' else rel.source_id
                if liability_id not in liability_impacts:
                    liability_impacts[liability_id] = Money(Decimal('0'))
                
                liability_impacts[liability_id] = Money(liability_impacts[liability_id].amount + impact.amount)
        
        return {
            'monthly_asset_impact': asset_impacts,
            'monthly_liability_impact': liability_impacts,
            'net_monthly_impact': Money(
                sum(impact.amount for impact in asset_impacts.values()) - 
                sum(impact.amount for impact in liability_impacts.values())
            )
        }