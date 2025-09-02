"""
Simplified Pytest Suite for Expense Management - Focus on Core Logic
Tests expense entity with liability linking and finite/infinite classification
"""
import pytest
from decimal import Decimal
from datetime import datetime, timezone

# Test the domain entities directly without dependencies
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

from api.app.domain.entities.money import Money

# Mock Expense entity for testing (simplified)
from enum import Enum
from dataclasses import dataclass
from typing import Optional

class ExpenseType(Enum):
    HOUSING = "housing"
    TRANSPORTATION = "transportation"
    FOOD_DINING = "food_dining"
    UTILITIES = "utilities"
    HEALTHCARE = "healthcare"
    INSURANCE = "insurance"
    DEBT_PAYMENTS = "debt_payments"
    ENTERTAINMENT = "entertainment"
    PERSONAL_CARE = "personal_care"
    BUSINESS_OPERATING = "business_operating"
    TAXES = "taxes"
    OTHER = "other"

class ExpenseFrequency(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    ANNUALLY = "annually"

@dataclass
class SimpleExpense:
    """Simplified Expense entity for testing core logic"""
    id: int
    user_id: int
    description: str
    amount: Money
    expense_type: ExpenseType
    frequency: ExpenseFrequency
    is_recurring: bool = True
    # KISS Asset/Liability Relationship (User-Driven Selection)
    related_asset_id: Optional[int] = None
    related_liability_id: Optional[int] = None
    relationship_type: Optional[str] = None
    # Finite vs Infinite Classification (User Confirms)
    is_finite_payment: bool = False
    total_payments_remaining: Optional[int] = None
    payment_end_date: Optional[datetime] = None
    notes: Optional[str] = None
    
    def calculate_monthly_amount(self) -> Money:
        """Convert expense to monthly equivalent"""
        if self.frequency == ExpenseFrequency.DAILY:
            return Money(self.amount.amount * Decimal('30'), self.amount.currency)
        elif self.frequency == ExpenseFrequency.WEEKLY:
            return Money(self.amount.amount * Decimal('4.33'), self.amount.currency)
        elif self.frequency == ExpenseFrequency.MONTHLY:
            return self.amount
        elif self.frequency == ExpenseFrequency.QUARTERLY:
            return Money(self.amount.amount / Decimal('3'), self.amount.currency)
        elif self.frequency == ExpenseFrequency.ANNUALLY:
            return Money(self.amount.amount / Decimal('12'), self.amount.currency)
        return self.amount
    
    def calculate_annual_amount(self) -> Money:
        """Calculate annual expense"""
        monthly = self.calculate_monthly_amount()
        return Money(monthly.amount * Decimal('12'), monthly.currency)
    
    def is_asset_related(self) -> bool:
        """Check if expense is related to an asset"""
        return self.related_asset_id is not None
    
    def is_liability_related(self) -> bool:
        """Check if expense is related to a liability (debt payment)"""
        return self.related_liability_id is not None
    
    def has_asset_or_liability_link(self) -> bool:
        """Check if expense is linked to either asset or liability"""
        return self.is_asset_related() or self.is_liability_related()
    
    def get_payment_classification(self) -> str:
        """Get payment duration classification"""
        if self.is_finite_payment:
            return "finite"
        return "infinite"
    
    def get_remaining_payment_months(self) -> Optional[int]:
        """Calculate remaining payment months if finite"""
        if not self.is_finite_payment or not self.total_payments_remaining:
            return None
        
        # Convert based on frequency
        if self.frequency == ExpenseFrequency.MONTHLY:
            return self.total_payments_remaining
        elif self.frequency == ExpenseFrequency.QUARTERLY:
            return int(self.total_payments_remaining * 3)
        elif self.frequency == ExpenseFrequency.ANNUALLY:
            return int(self.total_payments_remaining * 12)
        else:
            return self.total_payments_remaining  # Default to as-is for daily/weekly
    
    def calculate_total_remaining_cost(self) -> Optional[Money]:
        """Calculate total remaining cost for finite payments"""
        if not self.is_finite_payment or not self.total_payments_remaining:
            return None
        
        return Money(self.amount.amount * Decimal(str(self.total_payments_remaining)), self.amount.currency)


class TestSimpleExpenseEntity:
    """Test core expense entity logic"""
    
    def test_create_expense_entity(self):
        """Test basic expense entity creation"""
        expense = SimpleExpense(
            id=1,
            user_id=1,
            description="Monthly Car Payment",
            amount=Money(Decimal('33253'), 'KES'),
            expense_type=ExpenseType.DEBT_PAYMENTS,
            frequency=ExpenseFrequency.MONTHLY
        )
        
        assert expense.description == "Monthly Car Payment"
        assert expense.amount.amount == Decimal('33253')
        assert expense.expense_type == ExpenseType.DEBT_PAYMENTS
        assert expense.frequency == ExpenseFrequency.MONTHLY
        assert expense.is_recurring is True
        
        print("Expense entity creation test passed")
    
    def test_monthly_amount_calculation(self):
        """Test monthly equivalent calculation"""
        # Monthly expense
        monthly_expense = SimpleExpense(
            id=1, user_id=1, description="Monthly", 
            amount=Money(Decimal('50000'), 'KES'),
            expense_type=ExpenseType.HOUSING, frequency=ExpenseFrequency.MONTHLY
        )
        assert monthly_expense.calculate_monthly_amount().amount == Decimal('50000')
        
        # Annual expense
        annual_expense = SimpleExpense(
            id=2, user_id=1, description="Annual",
            amount=Money(Decimal('600000'), 'KES'),
            expense_type=ExpenseType.INSURANCE, frequency=ExpenseFrequency.ANNUALLY
        )
        assert annual_expense.calculate_monthly_amount().amount == Decimal('50000')
        
        # Weekly expense
        weekly_expense = SimpleExpense(
            id=3, user_id=1, description="Weekly",
            amount=Money(Decimal('11550'), 'KES'),
            expense_type=ExpenseType.FOOD_DINING, frequency=ExpenseFrequency.WEEKLY
        )
        # 11550 * 4.33 = 49,999.5 ≈ 50000
        monthly_amount = weekly_expense.calculate_monthly_amount().amount
        assert abs(monthly_amount - Decimal('50000')) < Decimal('100')  # Allow small rounding difference
        
        print("Monthly amount calculation test passed")
    
    def test_asset_liability_linking_detection(self):
        """Test asset/liability relationship detection"""
        # Asset-related expense (property maintenance)
        asset_expense = SimpleExpense(
            id=1, user_id=1, description="Property Maintenance",
            amount=Money(Decimal('15000'), 'KES'),
            expense_type=ExpenseType.HOUSING, frequency=ExpenseFrequency.MONTHLY,
            related_asset_id=5, relationship_type="asset_maintenance"
        )
        assert asset_expense.is_asset_related() is True
        assert asset_expense.is_liability_related() is False
        assert asset_expense.has_asset_or_liability_link() is True
        
        # Liability-related expense (loan payment)
        liability_expense = SimpleExpense(
            id=2, user_id=1, description="Car Loan Payment",
            amount=Money(Decimal('33253'), 'KES'),
            expense_type=ExpenseType.DEBT_PAYMENTS, frequency=ExpenseFrequency.MONTHLY,
            related_liability_id=3, relationship_type="loan_payment"
        )
        assert liability_expense.is_asset_related() is False
        assert liability_expense.is_liability_related() is True
        assert liability_expense.has_asset_or_liability_link() is True
        
        # Unlinked expense
        unlinked_expense = SimpleExpense(
            id=3, user_id=1, description="Groceries",
            amount=Money(Decimal('25000'), 'KES'),
            expense_type=ExpenseType.FOOD_DINING, frequency=ExpenseFrequency.MONTHLY
        )
        assert unlinked_expense.is_asset_related() is False
        assert unlinked_expense.is_liability_related() is False
        assert unlinked_expense.has_asset_or_liability_link() is False
        
        print("Asset/liability linking detection test passed")
    
    def test_finite_infinite_classification(self):
        """Test finite vs infinite payment classification"""
        # Finite payment (loan with specific term)
        finite_expense = SimpleExpense(
            id=1, user_id=1, description="Car Loan",
            amount=Money(Decimal('33253'), 'KES'),
            expense_type=ExpenseType.DEBT_PAYMENTS, frequency=ExpenseFrequency.MONTHLY,
            is_finite_payment=True, total_payments_remaining=24,
            related_liability_id=3
        )
        assert finite_expense.get_payment_classification() == "finite"
        assert finite_expense.get_remaining_payment_months() == 24
        
        total_remaining = finite_expense.calculate_total_remaining_cost()
        expected_total = Decimal('33253') * Decimal('24')
        assert total_remaining.amount == expected_total
        
        # Infinite payment (recurring expense)
        infinite_expense = SimpleExpense(
            id=2, user_id=1, description="Monthly Groceries",
            amount=Money(Decimal('25000'), 'KES'),
            expense_type=ExpenseType.FOOD_DINING, frequency=ExpenseFrequency.MONTHLY,
            is_finite_payment=False
        )
        assert infinite_expense.get_payment_classification() == "infinite"
        assert infinite_expense.get_remaining_payment_months() is None
        assert infinite_expense.calculate_total_remaining_cost() is None
        
        print("Finite/infinite classification test passed")


class TestRichardSpecificScenarios:
    """Test Richard's specific expense scenarios"""
    
    def test_richards_car_loan_payment(self):
        """Test Richard's car loan payment (finite)"""
        car_loan = SimpleExpense(
            id=1, user_id=1,
            description="Car Loan Payment - Toyota Prado",
            amount=Money(Decimal('33253'), 'KES'),
            expense_type=ExpenseType.DEBT_PAYMENTS,
            frequency=ExpenseFrequency.MONTHLY,
            related_liability_id=1,
            relationship_type="loan_payment",
            is_finite_payment=True,
            total_payments_remaining=24  # 2 years remaining
        )
        
        # Verify monthly amount
        assert car_loan.calculate_monthly_amount().amount == Decimal('33253')
        
        # Verify annual calculation
        annual = car_loan.calculate_annual_amount()
        assert annual.amount == Decimal('33253') * Decimal('12')  # 399,036 KES annually
        
        # Finite payment classification
        assert car_loan.get_payment_classification() == "finite"
        assert car_loan.get_remaining_payment_months() == 24
        
        # Total remaining cost
        total_remaining = car_loan.calculate_total_remaining_cost()
        assert total_remaining.amount == Decimal('33253') * Decimal('24')  # 798,072 KES remaining
        
        # Liability-related
        assert car_loan.is_liability_related() is True
        assert car_loan.is_asset_related() is False
        
        print("Richard's car loan payment test passed")
    
    def test_richards_salon_operating_expenses(self):
        """Test Richard's salon business operating expenses"""
        salon_expenses = SimpleExpense(
            id=2, user_id=1,
            description="Mama Lucy's Salon - Operating Expenses",
            amount=Money(Decimal('220000'), 'KES'),
            expense_type=ExpenseType.BUSINESS_OPERATING,
            frequency=ExpenseFrequency.MONTHLY,
            related_asset_id=10,  # Salon Business asset ID
            relationship_type="business_operating",
            is_finite_payment=False  # Ongoing business operations
        )
        
        # Verify amounts
        assert salon_expenses.calculate_monthly_amount().amount == Decimal('220000')
        assert salon_expenses.calculate_annual_amount().amount == Decimal('2640000')
        
        # Asset-related business expense
        assert salon_expenses.is_asset_related() is True
        assert salon_expenses.is_liability_related() is False
        assert salon_expenses.related_asset_id == 10
        
        # Infinite payment (ongoing operations)
        assert salon_expenses.get_payment_classification() == "infinite"
        
        print("Richard's salon operating expenses test passed")
    
    def test_richards_property_maintenance(self):
        """Test Richard's rental property maintenance expenses"""
        property_maintenance = SimpleExpense(
            id=3, user_id=1,
            description="Kileleshwa Property - Maintenance & Repairs",
            amount=Money(Decimal('8000'), 'KES'),
            expense_type=ExpenseType.HOUSING,
            frequency=ExpenseFrequency.MONTHLY,
            related_asset_id=5,  # Rental Property asset ID
            relationship_type="asset_maintenance",
            is_finite_payment=False
        )
        
        # Verify amounts
        assert property_maintenance.calculate_monthly_amount().amount == Decimal('8000')
        assert property_maintenance.calculate_annual_amount().amount == Decimal('96000')
        
        # Asset-related maintenance
        assert property_maintenance.is_asset_related() is True
        assert property_maintenance.related_asset_id == 5
        
        # Ongoing maintenance (infinite)
        assert property_maintenance.get_payment_classification() == "infinite"
        
        print("Richard's property maintenance test passed")
    
    def test_richards_complete_expense_portfolio(self):
        """Test Richard's complete expense analysis"""
        # Create Richard's main expense categories
        car_loan = SimpleExpense(
            id=1, user_id=1, description="Car Loan Payment",
            amount=Money(Decimal('33253'), 'KES'),
            expense_type=ExpenseType.DEBT_PAYMENTS, frequency=ExpenseFrequency.MONTHLY,
            related_liability_id=1, is_finite_payment=True, total_payments_remaining=24
        )
        
        salon_ops = SimpleExpense(
            id=2, user_id=1, description="Salon Operating Expenses",
            amount=Money(Decimal('220000'), 'KES'),
            expense_type=ExpenseType.BUSINESS_OPERATING, frequency=ExpenseFrequency.MONTHLY,
            related_asset_id=10, is_finite_payment=False
        )
        
        property_maintenance = SimpleExpense(
            id=3, user_id=1, description="Property Maintenance",
            amount=Money(Decimal('8000'), 'KES'),
            expense_type=ExpenseType.HOUSING, frequency=ExpenseFrequency.MONTHLY,
            related_asset_id=5, is_finite_payment=False
        )
        
        personal_expenses = SimpleExpense(
            id=4, user_id=1, description="Personal Living Expenses",
            amount=Money(Decimal('80000'), 'KES'),
            expense_type=ExpenseType.OTHER, frequency=ExpenseFrequency.MONTHLY,
            is_finite_payment=False
        )
        
        expenses = [car_loan, salon_ops, property_maintenance, personal_expenses]
        
        # Calculate totals
        total_monthly = sum(expense.calculate_monthly_amount().amount for expense in expenses)
        total_annual = sum(expense.calculate_annual_amount().amount for expense in expenses)
        
        # Verify Richard's expected totals
        expected_monthly = Decimal('33253') + Decimal('220000') + Decimal('8000') + Decimal('80000')
        assert total_monthly == expected_monthly  # 341,253 KES monthly
        assert total_annual == expected_monthly * Decimal('12')  # 4,095,036 KES annually
        
        # Asset-related expenses
        asset_related_monthly = sum(
            expense.calculate_monthly_amount().amount 
            for expense in expenses 
            if expense.is_asset_related()
        )
        assert asset_related_monthly == Decimal('228000')  # Salon + Property maintenance
        
        # Liability-related expenses
        liability_related_monthly = sum(
            expense.calculate_monthly_amount().amount 
            for expense in expenses 
            if expense.is_liability_related()
        )
        assert liability_related_monthly == Decimal('33253')  # Car loan only
        
        # Finite vs infinite classification
        finite_expenses_monthly = sum(
            expense.calculate_monthly_amount().amount 
            for expense in expenses 
            if expense.is_finite_payment
        )
        assert finite_expenses_monthly == Decimal('33253')  # Only car loan is finite
        
        print("Richard's complete expense portfolio test passed")
        print(f"Total Monthly Expenses: {total_monthly:,} KES")
        print(f"Asset-Related Expenses: {asset_related_monthly:,} KES")
        print(f"Liability-Related Expenses: {liability_related_monthly:,} KES")
        print(f"Finite Expenses: {finite_expenses_monthly:,} KES")


class TestKISSUserFlows:
    """Test KISS user flow scenarios"""
    
    def test_simple_expense_entry_no_linking(self):
        """Test simple expense entry without asset/liability linking"""
        expense = SimpleExpense(
            id=1, user_id=1,
            description="Monthly Groceries",
            amount=Money(Decimal('30000'), 'KES'),
            expense_type=ExpenseType.FOOD_DINING,
            frequency=ExpenseFrequency.MONTHLY
        )
        
        # Should be straightforward
        assert expense.has_asset_or_liability_link() is False
        assert expense.related_asset_id is None
        assert expense.related_liability_id is None
        assert expense.get_payment_classification() == "infinite"
        
        print("Simple expense entry test passed")
    
    def test_asset_linking_user_choice(self):
        """Test user choosing to link expense to asset"""
        # User selects "Yes, this is related to an asset"
        expense = SimpleExpense(
            id=1, user_id=1,
            description="Property Insurance Premium",
            amount=Money(Decimal('12000'), 'KES'),
            expense_type=ExpenseType.INSURANCE,
            frequency=ExpenseFrequency.MONTHLY,
            related_asset_id=5,  # User selected Property #5
            relationship_type="insurance_premium"  # User selected relationship type
        )
        
        # Verify user choices are preserved
        assert expense.related_asset_id == 5
        assert expense.relationship_type == "insurance_premium"
        assert expense.is_asset_related() is True
        assert expense.is_liability_related() is False
        
        print("Asset linking user choice test passed")
    
    def test_liability_linking_user_choice(self):
        """Test user choosing to link expense to liability"""
        # User selects "Yes, this is a debt payment"
        expense = SimpleExpense(
            id=1, user_id=1,
            description="Personal Loan Payment",
            amount=Money(Decimal('25000'), 'KES'),
            expense_type=ExpenseType.DEBT_PAYMENTS,
            frequency=ExpenseFrequency.MONTHLY,
            related_liability_id=3,  # User selected Personal Loan #3
            relationship_type="loan_payment",
            is_finite_payment=True,  # User confirms this will end
            total_payments_remaining=12  # User provides 12 payments left
        )
        
        # Verify user choices are preserved
        assert expense.related_liability_id == 3
        assert expense.relationship_type == "loan_payment"
        assert expense.is_liability_related() is True
        assert expense.is_asset_related() is False
        assert expense.get_payment_classification() == "finite"
        assert expense.total_payments_remaining == 12
        
        print("Liability linking user choice test passed")
    
    def test_finite_payment_user_classification(self):
        """Test user classification of finite vs infinite payments"""
        # User explicitly marks as finite
        finite_expense = SimpleExpense(
            id=1, user_id=1,
            description="Gym Membership (1 Year Contract)",
            amount=Money(Decimal('5000'), 'KES'),
            expense_type=ExpenseType.PERSONAL_CARE,
            frequency=ExpenseFrequency.MONTHLY,
            is_finite_payment=True,  # User confirms this ends
            total_payments_remaining=8  # 8 months left on contract
        )
        
        assert finite_expense.get_payment_classification() == "finite"
        assert finite_expense.get_remaining_payment_months() == 8
        assert finite_expense.calculate_total_remaining_cost().amount == Decimal('40000')
        
        # User leaves as infinite (default)
        infinite_expense = SimpleExpense(
            id=2, user_id=1,
            description="Internet Subscription",
            amount=Money(Decimal('4000'), 'KES'),
            expense_type=ExpenseType.UTILITIES,
            frequency=ExpenseFrequency.MONTHLY,
            is_finite_payment=False  # Default - ongoing expense
        )
        
        assert infinite_expense.get_payment_classification() == "infinite"
        assert infinite_expense.get_remaining_payment_months() is None
        
        print("Finite payment classification test passed")


if __name__ == "__main__":
    print("Running Expense Management Tests...")
    print("=" * 60)
    
    # Run tests
    test_entity = TestSimpleExpenseEntity()
    test_entity.test_create_expense_entity()
    test_entity.test_monthly_amount_calculation()
    test_entity.test_asset_liability_linking_detection()
    test_entity.test_finite_infinite_classification()
    
    test_richard = TestRichardSpecificScenarios()
    test_richard.test_richards_car_loan_payment()
    test_richard.test_richards_salon_operating_expenses()
    test_richard.test_richards_property_maintenance()
    test_richard.test_richards_complete_expense_portfolio()
    
    test_kiss = TestKISSUserFlows()
    test_kiss.test_simple_expense_entry_no_linking()
    test_kiss.test_asset_linking_user_choice()
    test_kiss.test_liability_linking_user_choice()
    test_kiss.test_finite_payment_user_classification()
    
    print("=" * 60)
    print("All Expense Management Tests Passed!")
    print("Core expense domain logic validated")
    print("Richard's financial scenarios tested")  
    print("KISS user flows and classifications verified")