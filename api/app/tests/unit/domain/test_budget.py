import pytest
from decimal import Decimal
from api.app.domain.entities.budget import Budget, BudgetCategory
from api.app.domain.value_objects.money import Money
from api.app.domain.value_objects.period import Period, PeriodType
from datetime import date


class TestBudgetCategory:
    """Test suite for BudgetCategory entity"""
    
    def test_budget_category_creation(self):
        """Test BudgetCategory creation"""
        category = BudgetCategory(
            name="Groceries",
            allocated_amount=Money(Decimal('500.00'))
        )
        
        assert category.name == "Groceries"
        assert category.allocated_amount.amount == Decimal('500.00')
        assert category.spent_amount.amount == Decimal('0.00')
        assert category.category_type == "expense"
    
    def test_budget_category_variance_calculation(self):
        """Test variance calculations"""
        category = BudgetCategory(
            name="Groceries",
            allocated_amount=Money(Decimal('500.00')),
            spent_amount=Money(Decimal('300.00'))
        )
        
        variance = category.calculate_variance()
        assert variance.amount == Decimal('200.00')  # 500 - 300
        
        variance_pct = category.calculate_variance_percentage()
        assert variance_pct == Decimal('40.00')  # 200/500 * 100
    
    def test_budget_category_over_budget(self):
        """Test over budget detection"""
        # Under budget
        category1 = BudgetCategory(
            name="Groceries",
            allocated_amount=Money(Decimal('500.00')),
            spent_amount=Money(Decimal('300.00'))
        )
        assert category1.is_over_budget() is False
        
        # Over budget
        category2 = BudgetCategory(
            name="Entertainment",
            allocated_amount=Money(Decimal('200.00')),
            spent_amount=Money(Decimal('250.00'))
        )
        assert category2.is_over_budget() is True
    
    def test_budget_category_utilization(self):
        """Test utilization percentage calculation"""
        category = BudgetCategory(
            name="Transport",
            allocated_amount=Money(Decimal('1000.00')),
            spent_amount=Money(Decimal('750.00'))
        )
        
        utilization = category.utilization_percentage()
        assert utilization == Decimal('75.00')
    
    def test_budget_category_zero_allocation(self):
        """Test category with zero allocation"""
        category = BudgetCategory(
            name="Emergency",
            allocated_amount=Money(Decimal('0.00')),
            spent_amount=Money(Decimal('100.00'))
        )
        
        assert category.calculate_variance_percentage() == Decimal('0')
        assert category.utilization_percentage() == Decimal('0')


class TestBudget:
    """Test suite for Budget entity"""
    
    def create_sample_budget(self) -> Budget:
        """Helper method to create a sample budget for testing"""
        period = Period.monthly(2025, 3)
        budget = Budget(
            user_id=1,
            period=period,
            monthly_income=Money(Decimal('5000.00'))
        )
        
        # Add expense categories
        budget.add_category(BudgetCategory(
            name="Groceries",
            allocated_amount=Money(Decimal('800.00')),
            category_type="expense"
        ))
        budget.add_category(BudgetCategory(
            name="Transport",
            allocated_amount=Money(Decimal('500.00')),
            category_type="expense"
        ))
        
        # Add savings category
        budget.add_category(BudgetCategory(
            name="Emergency Fund",
            allocated_amount=Money(Decimal('1000.00')),
            category_type="savings"
        ))
        
        # Add goal allocations
        budget.set_goal_allocation("House Deposit", Money(Decimal('1500.00')))
        
        return budget
    
    def test_budget_creation(self):
        """Test Budget creation"""
        period = Period.monthly(2025, 3)
        budget = Budget(
            user_id=1,
            period=period,
            monthly_income=Money(Decimal('5000.00'))
        )
        
        assert budget.user_id == 1
        assert budget.period == period
        assert budget.monthly_income.amount == Decimal('5000.00')
        assert len(budget.categories) == 0
        assert len(budget.goal_allocations) == 0
    
    def test_budget_total_calculations(self):
        """Test budget total calculations"""
        budget = self.create_sample_budget()
        
        # Total expenses (only expense categories)
        total_expenses = budget.calculate_total_expenses()
        assert total_expenses.amount == Decimal('1300.00')  # 800 + 500
        
        # Total savings (savings + investment categories)
        total_savings = budget.calculate_total_savings_allocations()
        assert total_savings.amount == Decimal('1000.00')  # Emergency Fund
        
        # Total goal allocations
        total_goals = budget.calculate_total_goal_allocations()
        assert total_goals.amount == Decimal('1500.00')  # House Deposit
    
    def test_budget_surplus_calculation(self):
        """Test budget surplus calculation"""
        budget = self.create_sample_budget()
        
        # Income: 5000, Expenses: 1300, Savings: 1000, Goals: 1500
        # Surplus = 5000 - 1300 - 1000 - 1500 = 1200
        surplus = budget.calculate_surplus()
        assert surplus.amount == Decimal('1200.00')
        assert budget.is_balanced() is True
    
    def test_budget_unbalanced(self):
        """Test unbalanced budget detection"""
        period = Period.monthly(2025, 3)
        budget = Budget(
            user_id=1,
            period=period,
            monthly_income=Money(Decimal('2000.00'))  # Low income
        )
        
        # Add high expenses
        budget.add_category(BudgetCategory(
            name="Rent",
            allocated_amount=Money(Decimal('1500.00')),
            category_type="expense"
        ))
        budget.add_category(BudgetCategory(
            name="Groceries",
            allocated_amount=Money(Decimal('800.00')),
            category_type="expense"
        ))
        
        # Income: 2000, Expenses: 2300 -> Deficit: -300
        surplus = budget.calculate_surplus()
        assert surplus.amount == Decimal('-300.00')
        assert budget.is_balanced() is False
    
    def test_budget_savings_rate(self):
        """Test savings rate calculation"""
        budget = self.create_sample_budget()
        
        # Total saved: 1000 (savings) + 1500 (goals) = 2500
        # Savings rate: 2500 / 5000 * 100 = 50%
        savings_rate = budget.get_savings_rate()
        assert savings_rate == Decimal('50.00')
    
    def test_budget_expense_ratio(self):
        """Test expense ratio calculation"""
        budget = self.create_sample_budget()
        
        # Total expenses: 1300, Income: 5000
        # Expense ratio: 1300 / 5000 * 100 = 26%
        expense_ratio = budget.get_expense_ratio()
        assert expense_ratio == Decimal('26.00')
    
    def test_budget_add_category(self):
        """Test adding budget categories"""
        budget = self.create_sample_budget()
        initial_count = len(budget.categories)
        
        new_category = BudgetCategory(
            name="Entertainment",
            allocated_amount=Money(Decimal('300.00'))
        )
        budget.add_category(new_category)
        
        assert len(budget.categories) == initial_count + 1
        assert "Entertainment" in budget.categories
        assert budget.categories["Entertainment"].allocated_amount.amount == Decimal('300.00')
    
    def test_budget_add_duplicate_category_fails(self):
        """Test adding duplicate category fails"""
        budget = self.create_sample_budget()
        
        duplicate_category = BudgetCategory(
            name="Groceries",  # Already exists
            allocated_amount=Money(Decimal('600.00'))
        )
        
        with pytest.raises(ValueError, match="Category 'Groceries' already exists"):
            budget.add_category(duplicate_category)
    
    def test_budget_update_category_allocation(self):
        """Test updating category allocation"""
        budget = self.create_sample_budget()
        
        budget.update_category_allocation("Groceries", Money(Decimal('900.00')))
        
        assert budget.categories["Groceries"].allocated_amount.amount == Decimal('900.00')
    
    def test_budget_update_nonexistent_category_fails(self):
        """Test updating nonexistent category fails"""
        budget = self.create_sample_budget()
        
        with pytest.raises(ValueError, match="Category 'NonExistent' not found"):
            budget.update_category_allocation("NonExistent", Money(Decimal('100.00')))
    
    def test_budget_update_category_spending(self):
        """Test updating category spending"""
        budget = self.create_sample_budget()
        
        budget.update_category_spending("Transport", Money(Decimal('350.00')))
        
        assert budget.categories["Transport"].spent_amount.amount == Decimal('350.00')
    
    def test_budget_remove_category(self):
        """Test removing budget category"""
        budget = self.create_sample_budget()
        initial_count = len(budget.categories)
        
        budget.remove_category("Transport")
        
        assert len(budget.categories) == initial_count - 1
        assert "Transport" not in budget.categories
    
    def test_budget_category_summary(self):
        """Test budget category summary generation"""
        budget = self.create_sample_budget()
        
        # Add some spending
        budget.update_category_spending("Groceries", Money(Decimal('600.00')))
        budget.update_category_spending("Transport", Money(Decimal('550.00')))  # Over budget
        
        summary = budget.get_category_summary()
        
        assert "Groceries" in summary
        assert summary["Groceries"]["allocated"] == Decimal('800.00')
        assert summary["Groceries"]["spent"] == Decimal('600.00')
        assert summary["Groceries"]["remaining"] == Decimal('200.00')
        assert summary["Groceries"]["over_budget"] is False
        
        assert summary["Transport"]["over_budget"] is True  # 550 > 500
    
    def test_budget_actual_surplus(self):
        """Test actual surplus calculation based on spent amounts"""
        budget = self.create_sample_budget()
        
        # Set actual spending
        budget.update_category_spending("Groceries", Money(Decimal('700.00')))
        budget.update_category_spending("Transport", Money(Decimal('400.00')))
        budget.update_category_spending("Emergency Fund", Money(Decimal('1000.00')))
        
        # Income: 5000, Actual spent: 700 + 400 + 1000 = 2100, Goals: 1500
        # Actual surplus = 5000 - 2100 - 1500 = 1400
        actual_surplus = budget.calculate_actual_surplus()
        assert actual_surplus.amount == Decimal('1400.00')