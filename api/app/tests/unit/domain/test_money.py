import pytest
from decimal import Decimal
from api.app.domain.value_objects.money import Money


class TestMoney:
    """Test suite for Money value object"""
    
    def test_money_creation(self):
        """Test Money object creation and precision"""
        money = Money(Decimal('100.50'))
        assert money.amount == Decimal('100.50')
        assert money.currency == "KES"
    
    def test_money_precision_rounding(self):
        """Test Money rounds to 2 decimal places"""
        money = Money(Decimal('100.567'))
        assert money.amount == Decimal('100.57')
        
        money = Money(Decimal('100.563'))
        assert money.amount == Decimal('100.56')
    
    def test_money_custom_currency(self):
        """Test Money with custom currency"""
        money = Money(Decimal('100.00'), "USD")
        assert money.currency == "USD"
    
    def test_money_addition(self):
        """Test Money addition"""
        money1 = Money(Decimal('100.50'))
        money2 = Money(Decimal('50.25'))
        result = money1.add(money2)
        
        assert result.amount == Decimal('150.75')
        assert result.currency == "KES"
    
    def test_money_addition_different_currencies_fails(self):
        """Test Money addition fails with different currencies"""
        money1 = Money(Decimal('100.50'), "KES")
        money2 = Money(Decimal('50.25'), "USD")
        
        with pytest.raises(ValueError, match="Cannot add different currencies"):
            money1.add(money2)
    
    def test_money_subtraction(self):
        """Test Money subtraction"""
        money1 = Money(Decimal('100.50'))
        money2 = Money(Decimal('50.25'))
        result = money1.subtract(money2)
        
        assert result.amount == Decimal('50.25')
        assert result.currency == "KES"
    
    def test_money_multiplication(self):
        """Test Money multiplication"""
        money = Money(Decimal('100.50'))
        result = money.multiply(Decimal('2'))
        
        assert result.amount == Decimal('201.00')
        assert result.currency == "KES"
    
    def test_money_division(self):
        """Test Money division"""
        money = Money(Decimal('100.50'))
        result = money.divide(Decimal('2'))
        
        assert result.amount == Decimal('50.25')
        assert result.currency == "KES"
    
    def test_money_division_by_zero_fails(self):
        """Test Money division by zero fails"""
        money = Money(Decimal('100.50'))
        
        with pytest.raises(ValueError, match="Cannot divide by zero"):
            money.divide(Decimal('0'))
    
    def test_money_equality(self):
        """Test Money equality comparison"""
        money1 = Money(Decimal('100.50'))
        money2 = Money(Decimal('100.50'))
        money3 = Money(Decimal('100.51'))
        
        assert money1 == money2
        assert money1 != money3
        assert money1 != "not a money object"
    
    def test_money_comparison(self):
        """Test Money comparison operators"""
        money1 = Money(Decimal('100.50'))
        money2 = Money(Decimal('50.25'))
        money3 = Money(Decimal('150.75'))
        
        assert money1 > money2
        assert money1 >= money2
        assert money2 < money1
        assert money2 <= money1
        assert money1 < money3
    
    def test_money_comparison_different_currencies_fails(self):
        """Test Money comparison fails with different currencies"""
        money1 = Money(Decimal('100.50'), "KES")
        money2 = Money(Decimal('50.25'), "USD")
        
        with pytest.raises(ValueError, match="Cannot compare different currencies"):
            money1 > money2
    
    def test_money_string_representation(self):
        """Test Money string formatting"""
        money = Money(Decimal('1234.56'))
        assert str(money) == "KES 1,234.56"
    
    def test_money_immutability(self):
        """Test Money is immutable"""
        money = Money(Decimal('100.50'))
        
        # Should not be able to change amount or currency
        with pytest.raises(AttributeError):
            money.amount = Decimal('200.00')
        
        with pytest.raises(AttributeError):
            money.currency = "USD"