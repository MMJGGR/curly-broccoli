"""
Pytest Suite for Income Management - Clean Architecture Testing
Tests for KISS asset linking and CFA-compliant income calculations
"""
import pytest
from decimal import Decimal
from datetime import datetime, timezone
from unittest.mock import Mock, AsyncMock

from api.app.domain.entities.income import Income, IncomeType, IncomeFrequency, TemporalPattern
from api.app.domain.entities.money import Money
from api.app.domain.entities.asset import Asset, AssetType
from api.app.application.use_cases.manage_income import (
    CreateIncome, UpdateIncome, AnalyzeUserIncome,
    CreateIncomeRequest, UpdateIncomeRequest
)


class TestIncomeEntity:
    """Test Income domain entity with CFA-compliant calculations"""
    
    def test_create_income_entity(self):
        """Test basic income entity creation"""
        income = Income(
            id=1,
            user_id=1,
            description="Software Developer Salary",
            amount=Money(Decimal('324759'), 'KES'),
            income_type=IncomeType.SALARY,
            frequency=IncomeFrequency.MONTHLY,
            is_recurring=True,
            temporal_pattern=TemporalPattern.PERMANENT
        )
        
        assert income.description == "Software Developer Salary"
        assert income.amount.amount == Decimal('324759')
        assert income.income_type == IncomeType.SALARY
        assert income.frequency == IncomeFrequency.MONTHLY
        assert income.is_recurring is True
    
    def test_monthly_amount_calculation(self):
        """Test monthly equivalent calculation for different frequencies"""
        # Monthly income (no conversion)
        monthly_income = Income(
            id=1, user_id=1, description="Monthly", 
            amount=Money(Decimal('100000'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.MONTHLY
        )
        assert monthly_income.calculate_monthly_amount().amount == Decimal('100000')
        
        # Annual income (divide by 12)
        annual_income = Income(
            id=2, user_id=1, description="Annual",
            amount=Money(Decimal('1200000'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.ANNUALLY
        )
        assert annual_income.calculate_monthly_amount().amount == Decimal('100000')
        
        # Quarterly income (divide by 3)
        quarterly_income = Income(
            id=3, user_id=1, description="Quarterly",
            amount=Money(Decimal('300000'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.QUARTERLY
        )
        assert quarterly_income.calculate_monthly_amount().amount == Decimal('100000')
    
    def test_asset_linking_detection(self):
        """Test asset-linked income detection"""
        # Rental income (asset-linked by type)
        rental_income = Income(
            id=1, user_id=1, description="Rental",
            amount=Money(Decimal('45000'), 'KES'),
            income_type=IncomeType.RENTAL_INCOME, frequency=IncomeFrequency.MONTHLY
        )
        assert rental_income.is_asset_linked_income() is True
        
        # Salary (not asset-linked)
        salary_income = Income(
            id=2, user_id=1, description="Salary",
            amount=Money(Decimal('300000'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.MONTHLY
        )
        assert salary_income.is_asset_linked_income() is False
        
        # Salary with explicit asset link
        asset_linked_salary = Income(
            id=3, user_id=1, description="Business Salary",
            amount=Money(Decimal('300000'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.MONTHLY,
            linked_asset_id=5
        )
        assert asset_linked_salary.is_asset_linked_income() is True
    
    def test_income_stability_scoring(self):
        """Test CFA-compliant income stability scoring"""
        # Salary (high stability)
        salary = Income(
            id=1, user_id=1, description="Salary",
            amount=Money(Decimal('300000'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.MONTHLY
        )
        assert salary.get_income_stability_score() >= 8
        
        # Freelance (low stability)
        freelance = Income(
            id=2, user_id=1, description="Freelance",
            amount=Money(Decimal('100000'), 'KES'),
            income_type=IncomeType.FREELANCE, frequency=IncomeFrequency.MONTHLY
        )
        assert freelance.get_income_stability_score() <= 3
        
        # Business income (medium stability)
        business = Income(
            id=3, user_id=1, description="Business",
            amount=Money(Decimal('200000'), 'KES'),
            income_type=IncomeType.BUSINESS_INCOME, frequency=IncomeFrequency.MONTHLY
        )
        assert 3 <= business.get_income_stability_score() <= 6
    
    def test_present_value_calculation(self):
        """Test human capital present value calculation"""
        income = Income(
            id=1, user_id=1, description="Salary",
            amount=Money(Decimal('324759'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.MONTHLY,
            growth_rate=Decimal('0.03')  # 3% annual growth
        )
        
        # Calculate 30-year present value
        pv = income.calculate_present_value(discount_rate=Decimal('0.125'), years=30)
        
        # Should be substantial (Richard's human capital)
        assert pv.amount > Decimal('40000000')  # Over 40M KES
        assert pv.currency == 'KES'
    
    def test_tax_treatment_classification(self):
        """Test Kenya tax system classification"""
        # Employment income
        salary = Income(
            id=1, user_id=1, description="Salary",
            amount=Money(Decimal('300000'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.MONTHLY
        )
        assert salary.get_tax_treatment_category() == "employment"
        
        # Business income
        business = Income(
            id=2, user_id=1, description="Business",
            amount=Money(Decimal('200000'), 'KES'),
            income_type=IncomeType.BUSINESS_INCOME, frequency=IncomeFrequency.MONTHLY
        )
        assert business.get_tax_treatment_category() == "business"
        
        # Investment income
        dividends = Income(
            id=3, user_id=1, description="Dividends",
            amount=Money(Decimal('50000'), 'KES'),
            income_type=IncomeType.DIVIDENDS, frequency=IncomeFrequency.MONTHLY
        )
        assert dividends.get_tax_treatment_category() == "investment"


class TestCreateIncomeUseCase:
    """Test CreateIncome use case with asset linking"""
    
    @pytest.fixture
    def mock_income_repository(self):
        return Mock()
    
    @pytest.fixture
    def mock_asset_repository(self):
        return Mock()
    
    @pytest.fixture
    def create_income_use_case(self, mock_income_repository, mock_asset_repository):
        return CreateIncome(mock_income_repository, mock_asset_repository)
    
    @pytest.mark.asyncio
    async def test_create_income_without_asset_link(self, create_income_use_case, mock_income_repository):
        """Test creating income without asset linking"""
        # Setup
        request = CreateIncomeRequest(
            user_id=1,
            description="Software Developer Salary",
            amount=Money(Decimal('324759'), 'KES'),
            income_type=IncomeType.SALARY,
            frequency=IncomeFrequency.MONTHLY
        )
        
        mock_income_repository.save = AsyncMock(return_value=Income(
            id=1, user_id=1, description="Software Developer Salary",
            amount=Money(Decimal('324759'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.MONTHLY
        ))
        
        # Execute
        result = await create_income_use_case.execute(request)
        
        # Verify
        assert result.description == "Software Developer Salary"
        assert result.amount.amount == Decimal('324759')
        assert result.linked_asset_id is None
        mock_income_repository.save.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_income_with_asset_link(self, create_income_use_case, 
                                                mock_income_repository, mock_asset_repository):
        """Test creating income with asset linking (KISS approach)"""
        # Setup - mock asset exists
        mock_asset = Asset(
            id=5, user_id=1, name="Rental Property #1",
            asset_type=AssetType.REAL_ESTATE, current_value=Money(Decimal('4500000'), 'KES')
        )
        mock_asset_repository.get_by_id = AsyncMock(return_value=mock_asset)
        
        request = CreateIncomeRequest(
            user_id=1,
            description="Rental Income - Kileleshwa Property",
            amount=Money(Decimal('45000'), 'KES'),
            income_type=IncomeType.RENTAL_INCOME,
            frequency=IncomeFrequency.MONTHLY,
            linked_asset_id=5,
            asset_relationship_type="rental"
        )
        
        mock_income_repository.save = AsyncMock(return_value=Income(
            id=2, user_id=1, description="Rental Income - Kileleshwa Property",
            amount=Money(Decimal('45000'), 'KES'),
            income_type=IncomeType.RENTAL_INCOME, frequency=IncomeFrequency.MONTHLY,
            linked_asset_id=5, asset_relationship_type="rental"
        ))
        
        # Execute
        result = await create_income_use_case.execute(request)
        
        # Verify
        assert result.linked_asset_id == 5
        assert result.asset_relationship_type == "rental"
        assert result.is_asset_linked_income() is True
        mock_asset_repository.get_by_id.assert_called_once_with(5)
        mock_income_repository.save.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_create_income_invalid_asset_link(self, create_income_use_case, mock_asset_repository):
        """Test error when linking to non-existent asset"""
        # Setup - asset doesn't exist
        mock_asset_repository.get_by_id = AsyncMock(return_value=None)
        
        request = CreateIncomeRequest(
            user_id=1,
            description="Invalid Link Test",
            amount=Money(Decimal('50000'), 'KES'),
            income_type=IncomeType.RENTAL_INCOME,
            frequency=IncomeFrequency.MONTHLY,
            linked_asset_id=999  # Non-existent asset
        )
        
        # Execute & Verify
        with pytest.raises(ValueError, match="Asset 999 not found"):
            await create_income_use_case.execute(request)


class TestAnalyzeUserIncomeUseCase:
    """Test income analysis with asset linking metrics"""
    
    @pytest.fixture
    def mock_income_repository(self):
        return Mock()
    
    @pytest.fixture
    def analyze_income_use_case(self, mock_income_repository):
        return AnalyzeUserIncome(mock_income_repository)
    
    @pytest.mark.asyncio
    async def test_richard_income_analysis(self, analyze_income_use_case, mock_income_repository):
        """Test Richard's complete income profile analysis"""
        # Setup Richard's income streams
        richards_incomes = [
            # Salary income
            Income(
                id=1, user_id=1, description="Software Developer Salary",
                amount=Money(Decimal('324759'), 'KES'),
                income_type=IncomeType.SALARY, frequency=IncomeFrequency.MONTHLY,
                is_recurring=True, temporal_pattern=TemporalPattern.PERMANENT
            ),
            # Rental income (asset-linked)
            Income(
                id=2, user_id=1, description="Rental - Kileleshwa Property",
                amount=Money(Decimal('45000'), 'KES'),
                income_type=IncomeType.RENTAL_INCOME, frequency=IncomeFrequency.MONTHLY,
                is_recurring=True, linked_asset_id=5, asset_relationship_type="rental"
            ),
            # Business income (salon - currently negative, but potential)
            Income(
                id=3, user_id=1, description="Salon Business Revenue",
                amount=Money(Decimal('180000'), 'KES'),
                income_type=IncomeType.BUSINESS_INCOME, frequency=IncomeFrequency.MONTHLY,
                is_recurring=True, linked_asset_id=10, asset_relationship_type="business_operations"
            )
        ]
        
        mock_income_repository.get_by_user_id = AsyncMock(return_value=richards_incomes)
        
        # Execute
        analysis = await analyze_income_use_case.execute(user_id=1)
        
        # Verify comprehensive analysis
        expected_monthly = Decimal('324759') + Decimal('45000') + Decimal('180000')
        assert analysis.total_monthly_income.amount == expected_monthly
        assert analysis.total_annual_income.amount == expected_monthly * 12
        
        # Asset-linked income (rental + business)
        expected_asset_linked = Decimal('45000') + Decimal('180000')
        assert analysis.asset_linked_income.amount == expected_asset_linked
        
        # Income categorization
        assert analysis.employment_income.amount == Decimal('324759')
        assert analysis.business_income.amount == Decimal('180000')
        assert analysis.investment_income.amount == Decimal('45000')  # Rental treated as investment
        
        # Diversification score (3 income sources)
        assert analysis.income_diversification_score >= 9.0  # Should be high with 3 sources
        
        # Stability score (weighted average)
        assert 5.0 <= analysis.stability_score <= 8.0  # Mixed stability


class TestRichardSpecificScenarios:
    """Test Richard's specific KISS user flows"""
    
    def test_richard_salon_income_classification(self):
        """Test salon business income setup"""
        salon_income = Income(
            id=1, user_id=1, description="Mama Lucy's Hair Salon Revenue",
            amount=Money(Decimal('180000'), 'KES'),
            income_type=IncomeType.BUSINESS_INCOME, frequency=IncomeFrequency.MONTHLY,
            linked_asset_id=10, asset_relationship_type="business_operations",
            notes="Currently in growth phase, funding operational deficit"
        )
        
        # Verify business income classification
        assert salon_income.income_type == IncomeType.BUSINESS_INCOME
        assert salon_income.is_asset_linked_income() is True
        assert salon_income.get_tax_treatment_category() == "business"
        
        # Business income has lower stability
        assert salon_income.get_income_stability_score() <= 6
    
    def test_richard_rental_property_income(self):
        """Test rental property income from 4.5M property"""
        rental_income = Income(
            id=2, user_id=1, description="Rental Income - Kileleshwa Property",
            amount=Money(Decimal('45000'), 'KES'),
            income_type=IncomeType.RENTAL_INCOME, frequency=IncomeFrequency.MONTHLY,
            linked_asset_id=5, asset_relationship_type="rental",
            growth_rate=Decimal('0.03')  # 3% annual growth
        )
        
        # Verify rental income classification
        assert rental_income.income_type == IncomeType.RENTAL_INCOME
        assert rental_income.is_asset_linked_income() is True
        assert rental_income.get_tax_treatment_category() == "investment"
        
        # Calculate annual and present value
        annual = rental_income.calculate_annual_amount()
        assert annual.amount == Decimal('540000')  # 45K * 12
        
        # Present value should be substantial
        pv = rental_income.calculate_present_value(years=20)  # 20-year rental projection
        assert pv.amount > Decimal('8000000')  # Over 8M KES present value
    
    def test_richard_tech_salary_stability(self):
        """Test Richard's tech salary stability and human capital"""
        tech_salary = Income(
            id=3, user_id=1, description="Senior Software Developer - Tech Startup",
            amount=Money(Decimal('324759'), 'KES'),
            income_type=IncomeType.SALARY, frequency=IncomeFrequency.MONTHLY,
            temporal_pattern=TemporalPattern.PERMANENT,
            growth_rate=Decimal('0.045'),  # 4.5% annual growth in tech
            notes="Tech industry, high growth potential"
        )
        
        # High stability for tech salary
        assert tech_salary.get_income_stability_score() >= 8
        
        # Substantial human capital (Richard is 31, retirement at 65)
        pv = tech_salary.calculate_present_value(
            discount_rate=Decimal('0.147'),  # Tech industry discount rate from onboarding
            years=34  # 65 - 31 = 34 working years
        )
        
        # Should match expected human capital valuation
        assert pv.amount > Decimal('40000000')  # Over 40M KES
        assert pv.amount < Decimal('60000000')  # Under 60M KES (reasonable range)


if __name__ == "__main__":
    # Run specific test for Richard's scenarios
    pytest.main([__file__ + "::TestRichardSpecificScenarios", "-v"])