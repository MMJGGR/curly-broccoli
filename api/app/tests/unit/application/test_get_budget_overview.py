import pytest
from unittest.mock import AsyncMock
from decimal import Decimal
from api.app.application.use_cases.get_budget_overview import GetBudgetOverview
from api.app.domain.entities.budget import Budget, BudgetCategory
from api.app.domain.value_objects.money import Money
from api.app.domain.value_objects.period import Period, PeriodType
from api.app.domain.repositories.budget_repository import BudgetRepository
from datetime import date


class MockBudgetRepository:
    """Mock repository for testing"""
    
    def __init__(self):
        self.budgets = {}
    
    async def get_by_user_id(self, user_id: int):
        return self.budgets.get(user_id)
    
    def set_budget_for_user(self, user_id: int, budget: Budget):
        self.budgets[user_id] = budget


@pytest.fixture
def mock_repository():
    return MockBudgetRepository()


@pytest.fixture
def sample_budget():
    """Create a sample budget for testing"""
    period = Period(PeriodType.MONTHLY, date(2025, 3, 1), date(2025, 3, 31))
    budget = Budget(
        user_id=1,
        period=period,
        monthly_income=Money(Decimal('5000.00'))
    )
    
    # Add categories
    budget.add_category(BudgetCategory(
        name="Groceries",
        allocated_amount=Money(Decimal('800.00')),
        spent_amount=Money(Decimal('600.00')),
        category_type="expense"
    ))
    budget.add_category(BudgetCategory(
        name="Transport",
        allocated_amount=Money(Decimal('500.00')),
        spent_amount=Money(Decimal('450.00')),
        category_type="expense"
    ))
    budget.add_category(BudgetCategory(
        name="Savings",
        allocated_amount=Money(Decimal('1000.00')),
        category_type="savings"
    ))
    
    # Add goal allocation
    budget.set_goal_allocation("Emergency Fund", Money(Decimal('1200.00')))
    
    return budget


class TestGetBudgetOverview:
    """Test suite for GetBudgetOverview use case"""
    
    @pytest.mark.asyncio
    async def test_get_budget_overview_success(self, mock_repository, sample_budget):
        """Test successful budget overview retrieval"""
        # Setup
        user_id = 1
        mock_repository.set_budget_for_user(user_id, sample_budget)
        use_case = GetBudgetOverview(mock_repository)
        
        # Execute
        result = await use_case.execute(user_id)
        
        # Assert
        assert result is not None
        assert result.monthly_income == Decimal('5000.00')
        assert result.total_expenses == Decimal('1300.00')  # 800 + 500
        assert result.total_goals == Decimal('1200.00')
        assert result.surplus == Decimal('1500.00')  # 5000 - 1300 - 1000 - 1200
        assert result.is_balanced is True
        
        # Check categories
        assert "Groceries" in result.categories
        assert result.categories["Groceries"] == Decimal('800.00')
        assert "Transport" in result.categories
        assert result.categories["Transport"] == Decimal('500.00')
        
        # Check variance calculations
        assert "Groceries" in result.variance_by_category
        groceries_variance = result.variance_by_category["Groceries"]
        assert groceries_variance == Decimal('25.00')  # (800-600)/800 * 100
        
        # Check rates
        assert result.savings_rate == Decimal('44.00')  # (1000+1200)/5000 * 100
        assert result.expense_ratio == Decimal('26.00')  # 1300/5000 * 100
        
        # Check period dates
        assert result.period_start == "2025-03-01"
        assert result.period_end == "2025-03-31"
    
    @pytest.mark.asyncio
    async def test_get_budget_overview_user_not_found(self, mock_repository):
        """Test budget overview when user not found"""
        # Setup
        use_case = GetBudgetOverview(mock_repository)
        
        # Execute
        result = await use_case.execute(999)  # Non-existent user
        
        # Assert
        assert result is None
    
    @pytest.mark.asyncio
    async def test_get_budget_overview_empty_budget(self, mock_repository):
        """Test budget overview with empty budget"""
        # Setup
        period = Period.monthly(2025, 3)
        empty_budget = Budget(
            user_id=2,
            period=period,
            monthly_income=Money(Decimal('3000.00'))
        )
        mock_repository.set_budget_for_user(2, empty_budget)
        use_case = GetBudgetOverview(mock_repository)
        
        # Execute
        result = await use_case.execute(2)
        
        # Assert
        assert result is not None
        assert result.monthly_income == Decimal('3000.00')
        assert result.total_expenses == Decimal('0.00')
        assert result.total_goals == Decimal('0.00')
        assert result.surplus == Decimal('3000.00')
        assert result.is_balanced is True
        assert len(result.categories) == 0
        assert len(result.variance_by_category) == 0
        assert result.savings_rate == Decimal('0.00')
        assert result.expense_ratio == Decimal('0.00')
    
    @pytest.mark.asyncio
    async def test_get_budget_overview_unbalanced_budget(self, mock_repository):
        """Test budget overview with unbalanced budget"""
        # Setup
        period = Period.monthly(2025, 3)
        budget = Budget(
            user_id=3,
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
        
        mock_repository.set_budget_for_user(3, budget)
        use_case = GetBudgetOverview(mock_repository)
        
        # Execute
        result = await use_case.execute(3)
        
        # Assert
        assert result is not None
        assert result.surplus == Decimal('-300.00')  # 2000 - 2300
        assert result.is_balanced is False