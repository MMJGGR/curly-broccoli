"""
Unit tests for Financial Relationships - Clean Architecture
CFA-compliant testing for cross-component relationship management
"""
import pytest
from datetime import date, datetime
from decimal import Decimal
from unittest.mock import AsyncMock, Mock

from app.domain.entities.financial_relationship import (
    FinancialRelationship, RelationshipType, RelationshipStatus,
    CrossComponentAnalyzer, RelationshipImpact
)
from app.domain.entities.money import Money
from app.application.use_cases.manage_financial_relationships import ManageFinancialRelationships


class TestFinancialRelationshipEntity:
    """Test the FinancialRelationship domain entity"""

    def test_create_asset_income_relationship(self):
        """Test creating an asset-income relationship"""
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            amount=Money(Decimal('2500.00')),
            frequency='monthly',
            status=RelationshipStatus.ACTIVE,
            description='Rental income from Kileleshwa property'
        )
        
        assert relationship.relationship_type == RelationshipType.ASSET_INCOME
        assert relationship.source_type == 'asset'
        assert relationship.target_type == 'income'
        assert relationship.amount.amount == Decimal('2500.00')
        assert relationship.frequency == 'monthly'
        assert relationship.status == RelationshipStatus.ACTIVE

    def test_calculate_monthly_impact_monthly_frequency(self):
        """Test monthly impact calculation for monthly frequency"""
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            amount=Money(Decimal('2500.00')),
            frequency='monthly',
            status=RelationshipStatus.ACTIVE
        )
        
        monthly_impact = relationship.calculate_monthly_impact()
        assert monthly_impact.amount == Decimal('2500.00')

    def test_calculate_monthly_impact_quarterly_frequency(self):
        """Test monthly impact calculation for quarterly frequency"""
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_EXPENSE,
            source_type='asset',
            source_id=100,
            target_type='expense',
            target_id=300,
            amount=Money(Decimal('3000.00')),
            frequency='quarterly',
            status=RelationshipStatus.ACTIVE
        )
        
        monthly_impact = relationship.calculate_monthly_impact()
        assert monthly_impact.amount == Decimal('1000.00')  # 3000 / 3

    def test_calculate_monthly_impact_annually_frequency(self):
        """Test monthly impact calculation for annual frequency"""
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.LIABILITY_EXPENSE,
            source_type='liability',
            source_id=400,
            target_type='expense',
            target_id=500,
            amount=Money(Decimal('12000.00')),
            frequency='annually',
            status=RelationshipStatus.ACTIVE
        )
        
        monthly_impact = relationship.calculate_monthly_impact()
        assert monthly_impact.amount == Decimal('1000.00')  # 12000 / 12

    def test_is_active_on_date_within_range(self):
        """Test relationship is active within date range"""
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.GOAL_INCOME,
            source_type='goal',
            source_id=600,
            target_type='income',
            target_id=700,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 12, 31),
            status=RelationshipStatus.ACTIVE
        )
        
        assert relationship.is_active_on_date(date(2024, 6, 15)) is True

    def test_is_active_on_date_outside_range(self):
        """Test relationship is inactive outside date range"""
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.GOAL_INCOME,
            source_type='goal',
            source_id=600,
            target_type='income',
            target_id=700,
            start_date=date(2024, 1, 1),
            end_date=date(2024, 12, 31),
            status=RelationshipStatus.ACTIVE
        )
        
        assert relationship.is_active_on_date(date(2025, 6, 15)) is False

    def test_get_relationship_description_asset_income(self):
        """Test relationship description generation for asset income"""
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            status=RelationshipStatus.ACTIVE
        )
        
        description = relationship.get_relationship_description()
        assert 'asset generates income for income' in description

    def test_get_relationship_description_custom(self):
        """Test custom relationship description"""
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            description='Custom rental income description',
            status=RelationshipStatus.ACTIVE
        )
        
        description = relationship.get_relationship_description()
        assert description == 'Custom rental income description'


class TestCrossComponentAnalyzer:
    """Test the CrossComponentAnalyzer utility class"""

    def test_analyze_asset_relationships_income_only(self):
        """Test asset relationship analysis with income generation only"""
        relationships = [
            FinancialRelationship(
                id=1,
                user_id=1,
                relationship_type=RelationshipType.ASSET_INCOME,
                source_type='asset',
                source_id=100,
                target_type='income',
                target_id=200,
                amount=Money(Decimal('2500.00')),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            )
        ]
        
        analysis = CrossComponentAnalyzer.analyze_asset_relationships(100, relationships)
        
        assert analysis['asset_id'] == 100
        assert analysis['monthly_income_generated'].amount == Decimal('2500.00')
        assert analysis['monthly_expenses_required'].amount == Decimal('0.00')
        assert analysis['net_monthly_contribution'].amount == Decimal('2500.00')
        assert analysis['total_relationships'] == 1

    def test_analyze_asset_relationships_with_expenses(self):
        """Test asset relationship analysis with both income and expenses"""
        relationships = [
            FinancialRelationship(
                id=1,
                user_id=1,
                relationship_type=RelationshipType.ASSET_INCOME,
                source_type='asset',
                source_id=100,
                target_type='income',
                target_id=200,
                amount=Money(Decimal('2500.00')),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            ),
            FinancialRelationship(
                id=2,
                user_id=1,
                relationship_type=RelationshipType.ASSET_EXPENSE,
                source_type='asset',
                source_id=100,
                target_type='expense',
                target_id=300,
                amount=Money(Decimal('500.00')),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            )
        ]
        
        analysis = CrossComponentAnalyzer.analyze_asset_relationships(100, relationships)
        
        assert analysis['monthly_income_generated'].amount == Decimal('2500.00')
        assert analysis['monthly_expenses_required'].amount == Decimal('500.00')
        assert analysis['net_monthly_contribution'].amount == Decimal('2000.00')
        assert analysis['total_relationships'] == 2

    def test_analyze_goal_funding_multiple_sources(self):
        """Test goal funding analysis with multiple funding sources"""
        relationships = [
            FinancialRelationship(
                id=1,
                user_id=1,
                relationship_type=RelationshipType.GOAL_ASSET,
                source_type='asset',
                source_id=100,
                target_type='goal',
                target_id=600,
                amount=Money(Decimal('1000.00')),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            ),
            FinancialRelationship(
                id=2,
                user_id=1,
                relationship_type=RelationshipType.GOAL_INCOME,
                source_type='income',
                source_id=200,
                target_type='goal',
                target_id=600,
                amount=Money(Decimal('500.00')),
                percentage=Decimal('10.0'),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            )
        ]
        
        analysis = CrossComponentAnalyzer.analyze_goal_funding(600, relationships)
        
        assert analysis['goal_id'] == 600
        assert analysis['total_monthly_funding'].amount == Decimal('1500.00')
        assert analysis['funding_diversity_score'] == 2
        assert len(analysis['funding_sources']['assets']) == 1
        assert len(analysis['funding_sources']['income_allocations']) == 1

    def test_calculate_net_worth_impact(self):
        """Test net worth impact calculation from relationships"""
        relationships = [
            FinancialRelationship(
                id=1,
                user_id=1,
                relationship_type=RelationshipType.ASSET_INCOME,
                source_type='asset',
                source_id=100,
                target_type='income',
                target_id=200,
                amount=Money(Decimal('2500.00')),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            ),
            FinancialRelationship(
                id=2,
                user_id=1,
                relationship_type=RelationshipType.LIABILITY_EXPENSE,
                source_type='liability',
                source_id=400,
                target_type='expense',
                target_id=500,
                amount=Money(Decimal('800.00')),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            )
        ]
        
        impact = CrossComponentAnalyzer.calculate_net_worth_impact(relationships)
        
        assert 100 in impact['monthly_asset_impact']
        assert 400 in impact['monthly_liability_impact']
        assert impact['net_monthly_impact'].amount == Decimal('1700.00')  # 2500 - 800


class TestManageFinancialRelationshipsUseCase:
    """Test the ManageFinancialRelationships use case"""

    @pytest.fixture
    def mock_repositories(self):
        """Create mock repositories for testing"""
        return {
            'relationship_repo': AsyncMock(),
            'asset_repo': AsyncMock(),
            'income_repo': AsyncMock(),
            'expense_repo': AsyncMock(),
            'liability_repo': AsyncMock()
        }

    @pytest.fixture
    def use_case(self, mock_repositories):
        """Create use case instance with mocked dependencies"""
        return ManageFinancialRelationships(
            mock_repositories['relationship_repo'],
            mock_repositories['asset_repo'],
            mock_repositories['income_repo'],
            mock_repositories['expense_repo'],
            mock_repositories['liability_repo']
        )

    @pytest.mark.asyncio
    async def test_create_relationship_success(self, use_case, mock_repositories):
        """Test successful relationship creation"""
        # Setup mocks
        mock_repositories['asset_repo'].get_by_id.return_value = Mock(id=100)
        mock_repositories['income_repo'].get_by_id.return_value = Mock(id=200)
        
        created_relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            amount=Money(Decimal('2500.00')),
            frequency='monthly',
            status=RelationshipStatus.ACTIVE
        )
        mock_repositories['relationship_repo'].create.return_value = created_relationship

        # Test data
        relationship_data = {
            'relationship_type': 'asset_income',
            'source_type': 'asset',
            'source_id': 100,
            'target_type': 'income',
            'target_id': 200,
            'amount': '2500.00',
            'frequency': 'monthly'
        }

        # Execute
        result = await use_case.create_relationship(user_id=1, relationship_data=relationship_data)

        # Assertions
        assert result['success'] is True
        assert result['relationship']['id'] == 1
        assert result['relationship']['amount'] == Decimal('2500.00')
        assert 'impact_analysis' in result
        mock_repositories['relationship_repo'].create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_relationship_invalid_source(self, use_case, mock_repositories):
        """Test relationship creation with invalid source component"""
        # Setup mocks - source doesn't exist
        mock_repositories['asset_repo'].get_by_id.return_value = None
        mock_repositories['income_repo'].get_by_id.return_value = Mock(id=200)

        relationship_data = {
            'relationship_type': 'asset_income',
            'source_type': 'asset',
            'source_id': 999,
            'target_type': 'income',
            'target_id': 200,
            'amount': '2500.00',
            'frequency': 'monthly'
        }

        # Execute and assert exception
        with pytest.raises(ValueError, match="Source asset not found"):
            await use_case.create_relationship(user_id=1, relationship_data=relationship_data)

    @pytest.mark.asyncio
    async def test_get_component_relationships_asset(self, use_case, mock_repositories):
        """Test getting relationships for an asset component"""
        # Setup mock relationships
        relationships = [
            FinancialRelationship(
                id=1,
                user_id=1,
                relationship_type=RelationshipType.ASSET_INCOME,
                source_type='asset',
                source_id=100,
                target_type='income',
                target_id=200,
                amount=Money(Decimal('2500.00')),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            )
        ]
        mock_repositories['relationship_repo'].get_by_component.return_value = relationships

        # Execute
        result = await use_case.get_component_relationships(
            user_id=1, component_type='asset', component_id=100
        )

        # Assertions
        assert result['component_type'] == 'asset'
        assert result['component_id'] == 100
        assert result['total_relationships'] == 1
        assert 'analysis' in result
        assert result['analysis']['asset_id'] == 100
        assert result['analysis']['monthly_income_generated'] == Decimal('2500.00')

    @pytest.mark.asyncio
    async def test_create_asset_income_relationship(self, use_case, mock_repositories):
        """Test creating asset-income relationship helper method"""
        # Setup mocks
        created_relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            amount=Money(Decimal('2500.00')),
            frequency='monthly',
            status=RelationshipStatus.ACTIVE
        )
        mock_repositories['relationship_repo'].create.return_value = created_relationship
        mock_repositories['asset_repo'].get_by_id.return_value = Mock(id=100)
        mock_repositories['income_repo'].get_by_id.return_value = Mock(id=200)

        income_source_data = {
            'description': 'Rental income from Kileleshwa property',
            'monthly_amount': 2500.00,
            'income_type': 'rental_income',
            'income_id': 200
        }

        # Execute
        result = await use_case.create_asset_income_relationship(
            user_id=1, asset_id=100, income_source_data=income_source_data
        )

        # Assertions
        assert result['success'] is True
        assert 'relationship' in result
        assert 'impact_analysis' in result

    @pytest.mark.asyncio
    async def test_create_goal_funding_plan(self, use_case, mock_repositories):
        """Test creating a comprehensive goal funding plan"""
        # Setup mocks
        def create_relationship_side_effect(relationship):
            relationship.id = 1
            return relationship

        mock_repositories['relationship_repo'].create.side_effect = create_relationship_side_effect
        mock_repositories['asset_repo'].get_by_id.return_value = Mock(id=100)
        mock_repositories['income_repo'].get_by_id.return_value = Mock(id=200)

        funding_sources = [
            {
                'source_type': 'asset',
                'source_id': 100,
                'monthly_amount': 1000.0
            },
            {
                'source_type': 'income',
                'source_id': 200,
                'monthly_amount': 500.0,
                'percentage': 10.0
            }
        ]

        # Execute
        result = await use_case.create_goal_funding_plan(
            user_id=1, goal_id=600, funding_sources=funding_sources
        )

        # Assertions
        assert result['success'] is True
        assert result['goal_id'] == 600
        assert result['funding_sources_count'] == 2
        assert result['total_monthly_funding'] == Decimal('1500.0')

    @pytest.mark.asyncio
    async def test_get_net_worth_impact(self, use_case, mock_repositories):
        """Test net worth impact calculation"""
        # Setup mock relationships
        relationships = [
            FinancialRelationship(
                id=1,
                user_id=1,
                relationship_type=RelationshipType.ASSET_INCOME,
                source_type='asset',
                source_id=100,
                target_type='income',
                target_id=200,
                amount=Money(Decimal('2500.00')),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            ),
            FinancialRelationship(
                id=2,
                user_id=1,
                relationship_type=RelationshipType.LIABILITY_EXPENSE,
                source_type='liability',
                source_id=400,
                target_type='expense',
                target_id=500,
                amount=Money(Decimal('800.00')),
                frequency='monthly',
                status=RelationshipStatus.ACTIVE
            )
        ]
        mock_repositories['relationship_repo'].get_by_user_id.return_value = relationships

        # Execute
        result = await use_case.get_net_worth_impact(user_id=1)

        # Assertions
        assert result['monthly_net_worth_impact'] == Decimal('1700.00')
        assert result['total_relationships'] == 2
        assert 'relationship_summary' in result

    @pytest.mark.asyncio
    async def test_update_relationship(self, use_case, mock_repositories):
        """Test updating an existing relationship"""
        # Setup existing relationship
        existing_relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            amount=Money(Decimal('2500.00')),
            frequency='monthly',
            status=RelationshipStatus.ACTIVE
        )
        
        updated_relationship = existing_relationship
        updated_relationship.amount = Money(Decimal('3000.00'))
        
        mock_repositories['relationship_repo'].get_by_id.return_value = existing_relationship
        mock_repositories['relationship_repo'].update.return_value = updated_relationship

        update_data = {
            'amount': '3000.00',
            'description': 'Updated rental income'
        }

        # Execute
        result = await use_case.update_relationship(
            user_id=1, relationship_id=1, update_data=update_data
        )

        # Assertions
        assert result['success'] is True
        assert result['relationship']['amount'] == Decimal('3000.00')
        mock_repositories['relationship_repo'].update.assert_called_once()

    @pytest.mark.asyncio
    async def test_delete_relationship(self, use_case, mock_repositories):
        """Test deleting a relationship"""
        # Setup existing relationship
        existing_relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            status=RelationshipStatus.ACTIVE
        )
        
        mock_repositories['relationship_repo'].get_by_id.return_value = existing_relationship
        mock_repositories['relationship_repo'].delete.return_value = True

        # Execute
        result = await use_case.delete_relationship(user_id=1, relationship_id=1)

        # Assertions
        assert result['success'] is True
        assert result['deleted'] is True
        assert result['relationship_id'] == 1
        mock_repositories['relationship_repo'].delete.assert_called_once_with(1, 1)


class TestRelationshipImpact:
    """Test the RelationshipImpact helper class"""

    def test_relationship_impact_creation(self):
        """Test creating a relationship impact instance"""
        impact = RelationshipImpact(
            component_type='asset',
            component_id=100,
            total_monthly_impact=Money(Decimal('2000.00')),
            incoming_relationships=[],
            outgoing_relationships=[],
            net_impact=Money(Decimal('2000.00'))
        )
        
        assert impact.component_type == 'asset'
        assert impact.component_id == 100
        assert impact.total_monthly_impact.amount == Decimal('2000.00')
        assert impact.net_impact.amount == Decimal('2000.00')

    def test_add_incoming_relationship(self):
        """Test adding an incoming relationship"""
        impact = RelationshipImpact(
            component_type='asset',
            component_id=100,
            total_monthly_impact=Money(Decimal('0.00')),
            incoming_relationships=[],
            outgoing_relationships=[],
            net_impact=Money(Decimal('0.00'))
        )
        
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            amount=Money(Decimal('2500.00')),
            frequency='monthly',
            status=RelationshipStatus.ACTIVE
        )
        
        impact.add_incoming_relationship(relationship)
        
        assert len(impact.incoming_relationships) == 1
        assert impact.net_impact.amount == Decimal('2500.00')

    def test_add_outgoing_relationship(self):
        """Test adding an outgoing relationship"""
        impact = RelationshipImpact(
            component_type='asset',
            component_id=100,
            total_monthly_impact=Money(Decimal('0.00')),
            incoming_relationships=[],
            outgoing_relationships=[],
            net_impact=Money(Decimal('0.00'))
        )
        
        relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_EXPENSE,
            source_type='asset',
            source_id=100,
            target_type='expense',
            target_id=300,
            amount=Money(Decimal('500.00')),
            frequency='monthly',
            status=RelationshipStatus.ACTIVE
        )
        
        impact.add_outgoing_relationship(relationship)
        
        assert len(impact.outgoing_relationships) == 1
        assert impact.net_impact.amount == Decimal('-500.00')

    def test_net_impact_calculation(self):
        """Test net impact calculation with both incoming and outgoing relationships"""
        impact = RelationshipImpact(
            component_type='asset',
            component_id=100,
            total_monthly_impact=Money(Decimal('0.00')),
            incoming_relationships=[],
            outgoing_relationships=[],
            net_impact=Money(Decimal('0.00'))
        )
        
        # Add incoming relationship (positive impact)
        incoming_relationship = FinancialRelationship(
            id=1,
            user_id=1,
            relationship_type=RelationshipType.ASSET_INCOME,
            source_type='asset',
            source_id=100,
            target_type='income',
            target_id=200,
            amount=Money(Decimal('2500.00')),
            frequency='monthly',
            status=RelationshipStatus.ACTIVE
        )
        impact.add_incoming_relationship(incoming_relationship)
        
        # Add outgoing relationship (negative impact)
        outgoing_relationship = FinancialRelationship(
            id=2,
            user_id=1,
            relationship_type=RelationshipType.ASSET_EXPENSE,
            source_type='asset',
            source_id=100,
            target_type='expense',
            target_id=300,
            amount=Money(Decimal('500.00')),
            frequency='monthly',
            status=RelationshipStatus.ACTIVE
        )
        impact.add_outgoing_relationship(outgoing_relationship)
        
        # Net impact should be 2500 - 500 = 2000
        assert impact.net_impact.amount == Decimal('2000.00')
        assert impact.total_monthly_impact.amount == Decimal('2000.00')


if __name__ == '__main__':
    pytest.main([__file__, '-v'])