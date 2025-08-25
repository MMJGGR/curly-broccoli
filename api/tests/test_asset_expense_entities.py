"""
Test Asset and Expense Domain Entities - Foundation Week Day 2
TDD approach for comprehensive asset tracking and expense categorization
"""
import pytest
from decimal import Decimal
from datetime import datetime, timezone
from enum import Enum

from app.domain.entities.money import Money
from app.domain.entities.asset import Asset, AssetType, AssetCategory
from app.domain.entities.expense import Expense, ExpenseType, ExpenseCategory


class TestAssetEntity:
    """Test Asset domain entity with CFA-compliant business rules"""
    
    def test_create_basic_asset(self):
        """Test creating a basic asset with required fields"""
        asset = Asset(
            id=1,
            user_id=1,
            name="Emergency Fund Savings",
            asset_type=AssetType.CASH_EQUIVALENT,
            current_value=Money(Decimal("50000.00")),
            acquisition_cost=Money(Decimal("50000.00")),
            acquisition_date=datetime(2024, 1, 1, tzinfo=timezone.utc)
        )
        
        assert asset.id == 1
        assert asset.name == "Emergency Fund Savings"
        assert asset.asset_type == AssetType.CASH_EQUIVALENT
        assert asset.current_value == Money(Decimal("50000.00"))
        assert asset.acquisition_cost == Money(Decimal("50000.00"))
    
    def test_asset_gain_loss_calculation(self):
        """Test unrealized gain/loss calculation"""
        asset = Asset(
            id=2,
            user_id=1,
            name="NASI Equity Investment",
            asset_type=AssetType.EQUITY_INVESTMENT,
            current_value=Money(Decimal("125000.00")),
            acquisition_cost=Money(Decimal("100000.00")),
            acquisition_date=datetime(2024, 1, 1, tzinfo=timezone.utc)
        )
        
        # Test unrealized gain
        unrealized_gain = asset.unrealized_gain_loss
        assert unrealized_gain == Money(Decimal("25000.00"))
        
        # Test gain percentage
        gain_percentage = asset.gain_loss_percentage
        assert gain_percentage == Decimal("25.00")  # 25% gain
    
    def test_asset_categories(self):
        """Test asset categorization for balance sheet classification"""
        # Test liquid asset
        cash_asset = Asset(
            id=3, user_id=1, name="Checking Account",
            asset_type=AssetType.CASH_EQUIVALENT,
            current_value=Money(Decimal("25000.00")),
            acquisition_cost=Money(Decimal("25000.00")),
            acquisition_date=datetime.now(timezone.utc)
        )
        assert cash_asset.get_asset_category() == AssetCategory.CURRENT_ASSETS
        assert cash_asset.is_liquid is True
        
        # Test investment asset
        equity_asset = Asset(
            id=4, user_id=1, name="NSE Stock Portfolio",
            asset_type=AssetType.EQUITY_INVESTMENT,
            current_value=Money(Decimal("200000.00")),
            acquisition_cost=Money(Decimal("180000.00")),
            acquisition_date=datetime.now(timezone.utc)
        )
        assert equity_asset.get_asset_category() == AssetCategory.INVESTMENT_ASSETS
        assert equity_asset.is_liquid is False
        
        # Test fixed asset
        property_asset = Asset(
            id=5, user_id=1, name="Nairobi Apartment",
            asset_type=AssetType.REAL_ESTATE,
            current_value=Money(Decimal("8000000.00")),
            acquisition_cost=Money(Decimal("7500000.00")),
            acquisition_date=datetime.now(timezone.utc)
        )
        assert property_asset.get_asset_category() == AssetCategory.FIXED_ASSETS
        assert property_asset.is_liquid is False
    
    def test_asset_depreciation(self):
        """Test depreciation calculation for depreciable assets"""
        vehicle = Asset(
            id=6, user_id=1, name="Toyota Camry",
            asset_type=AssetType.VEHICLE,
            current_value=Money(Decimal("1800000.00")),
            acquisition_cost=Money(Decimal("2500000.00")),
            acquisition_date=datetime(2023, 1, 1, tzinfo=timezone.utc),
            useful_life_years=10
        )
        
        # Test depreciation calculation
        annual_depreciation = vehicle.calculate_annual_depreciation()
        assert annual_depreciation == Money(Decimal("250000.00"))  # 2.5M / 10 years
        
        # Test current book value vs market value
        assert vehicle.unrealized_gain_loss.amount < 0  # Depreciated asset


class TestExpenseEntity:
    """Test Expense domain entity with CFA expense categorization"""
    
    def test_create_basic_expense(self):
        """Test creating a basic expense with required fields"""
        expense = Expense(
            id=1,
            user_id=1,
            description="Rent Payment - Kilimani Apartment",
            amount=Money(Decimal("45000.00")),
            expense_type=ExpenseType.HOUSING,
            expense_date=datetime(2024, 8, 1, tzinfo=timezone.utc),
            is_recurring=True,
            frequency_months=1
        )
        
        assert expense.id == 1
        assert expense.description == "Rent Payment - Kilimani Apartment"
        assert expense.amount == Money(Decimal("45000.00"))
        assert expense.expense_type == ExpenseType.HOUSING
        assert expense.is_recurring is True
    
    def test_expense_categorization(self):
        """Test CFA-standard expense categorization"""
        # Test fixed expense (housing)
        rent = Expense(
            id=2, user_id=1, description="Monthly Rent",
            amount=Money(Decimal("45000.00")), expense_type=ExpenseType.HOUSING,
            expense_date=datetime.now(timezone.utc), is_recurring=True, frequency_months=1
        )
        assert rent.get_expense_category() == ExpenseCategory.FIXED_EXPENSES
        assert rent.is_essential is True
        
        # Test variable expense (groceries)
        groceries = Expense(
            id=3, user_id=1, description="Weekly Groceries - Carrefour",
            amount=Money(Decimal("8500.00")), expense_type=ExpenseType.FOOD_DINING,
            expense_date=datetime.now(timezone.utc), is_recurring=False
        )
        assert groceries.get_expense_category() == ExpenseCategory.VARIABLE_EXPENSES
        assert groceries.is_essential is True
        
        # Test discretionary expense (entertainment)
        entertainment = Expense(
            id=4, user_id=1, description="Movie Night - Century Cinemax",
            amount=Money(Decimal("2500.00")), expense_type=ExpenseType.ENTERTAINMENT,
            expense_date=datetime.now(timezone.utc), is_recurring=False
        )
        assert entertainment.get_expense_category() == ExpenseCategory.DISCRETIONARY_EXPENSES
        assert entertainment.is_essential is False
    
    def test_annual_expense_projection(self):
        """Test annual expense projection for budgeting"""
        # Monthly recurring expense
        insurance = Expense(
            id=5, user_id=1, description="Health Insurance Premium",
            amount=Money(Decimal("12000.00")), expense_type=ExpenseType.INSURANCE,
            expense_date=datetime.now(timezone.utc), is_recurring=True, frequency_months=1
        )
        
        annual_projection = insurance.calculate_annual_projection()
        assert annual_projection == Money(Decimal("144000.00"))  # 12K * 12 months
        
        # Quarterly expense
        maintenance = Expense(
            id=6, user_id=1, description="Car Service",
            amount=Money(Decimal("15000.00")), expense_type=ExpenseType.TRANSPORTATION,
            expense_date=datetime.now(timezone.utc), is_recurring=True, frequency_months=3
        )
        
        annual_projection = maintenance.calculate_annual_projection()
        assert annual_projection == Money(Decimal("60000.00"))  # 15K * 4 quarters
    
    def test_expense_ratios(self):
        """Test expense ratio calculations for financial health assessment"""
        monthly_income = Money(Decimal("150000.00"))
        
        # Test housing expense ratio (should be <= 30% per CFA guidelines)
        housing_expense = Expense(
            id=7, user_id=1, description="Rent + Utilities",
            amount=Money(Decimal("50000.00")), expense_type=ExpenseType.HOUSING,
            expense_date=datetime.now(timezone.utc), is_recurring=True, frequency_months=1
        )
        
        housing_ratio = housing_expense.calculate_expense_ratio(monthly_income)
        assert housing_ratio == Decimal("33.33")  # 50K / 150K = 33.33%
        assert housing_expense.is_expense_ratio_healthy(monthly_income) is False  # Over 30%
        
        # Test transportation expense ratio (should be <= 15% per CFA guidelines)
        transport_expense = Expense(
            id=8, user_id=1, description="Car Payment + Fuel",
            amount=Money(Decimal("20000.00")), expense_type=ExpenseType.TRANSPORTATION,
            expense_date=datetime.now(timezone.utc), is_recurring=True, frequency_months=1
        )
        
        transport_ratio = transport_expense.calculate_expense_ratio(monthly_income)
        assert transport_ratio == Decimal("13.33")  # 20K / 150K = 13.33%
        assert transport_expense.is_expense_ratio_healthy(monthly_income) is True  # Under 15%


class TestAssetExpenseIntegration:
    """Test integration between Asset and Expense entities"""
    
    def test_asset_expense_relationship(self):
        """Test relationships between assets and their related expenses"""
        # Create a vehicle asset
        car = Asset(
            id=10, user_id=1, name="Honda Accord",
            asset_type=AssetType.VEHICLE,
            current_value=Money(Decimal("2000000.00")),
            acquisition_cost=Money(Decimal("2500000.00")),
            acquisition_date=datetime(2023, 1, 1, tzinfo=timezone.utc)
        )
        
        # Create related expenses
        car_insurance = Expense(
            id=10, user_id=1, description="Car Insurance Premium",
            amount=Money(Decimal("8000.00")), expense_type=ExpenseType.INSURANCE,
            expense_date=datetime.now(timezone.utc), is_recurring=True, frequency_months=1,
            related_asset_id=car.id
        )
        
        car_maintenance = Expense(
            id=11, user_id=1, description="Car Servicing",
            amount=Money(Decimal("12000.00")), expense_type=ExpenseType.TRANSPORTATION,
            expense_date=datetime.now(timezone.utc), is_recurring=True, frequency_months=3,
            related_asset_id=car.id
        )
        
        # Test that expenses can be linked to assets
        assert car_insurance.related_asset_id == car.id
        assert car_maintenance.related_asset_id == car.id
        
        # Test total cost of ownership calculation
        annual_insurance = car_insurance.calculate_annual_projection()
        annual_maintenance = car_maintenance.calculate_annual_projection()
        total_annual_cost = annual_insurance.add(annual_maintenance)
        
        assert total_annual_cost == Money(Decimal("144000.00"))  # 96K + 48K
    
    def test_net_worth_impact_calculation(self):
        """Test how assets and expenses affect net worth calculations"""
        # Asset contributes positively to net worth
        savings = Asset(
            id=12, user_id=1, name="High Yield Savings",
            asset_type=AssetType.CASH_EQUIVALENT,
            current_value=Money(Decimal("100000.00")),
            acquisition_cost=Money(Decimal("100000.00")),
            acquisition_date=datetime.now(timezone.utc)
        )
        
        # Expenses reduce available cash flow for savings/investment
        monthly_expenses = [
            Expense(id=12, user_id=1, description="All Monthly Expenses",
                   amount=Money(Decimal("85000.00")), expense_type=ExpenseType.HOUSING,
                   expense_date=datetime.now(timezone.utc), is_recurring=True, frequency_months=1)
        ]
        
        # With 150K income and 85K expenses, should have 65K monthly surplus
        monthly_income = Money(Decimal("150000.00"))
        monthly_expense_total = Money.zero()
        for expense in monthly_expenses:
            monthly_expense_total = monthly_expense_total.add(expense.amount)
        
        monthly_surplus = monthly_income.subtract(monthly_expense_total)
        assert monthly_surplus == Money(Decimal("65000.00"))
        
        # This surplus can grow net worth through additional savings/investments
        potential_annual_savings = monthly_surplus.multiply(12)
        assert potential_annual_savings == Money(Decimal("780000.00"))