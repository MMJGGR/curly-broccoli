import pytest
from decimal import Decimal
from api.app.application.use_cases.create_budget_category import CreateBudgetCategory
from api.app.application.dto.budget_dto import CreateBudgetCategoryRequest
from api.app.domain.entities.budget import Budget, BudgetCategory
from api.app.domain.value_objects.money import Money
from api.app.domain.value_objects.period import Period
from datetime import date


class MockBudgetRepository:
    """Mock repository for testing"""
    
    def __init__(self):
        self.budgets = {}
        self.saved_budgets = []
    
    async def get_by_user_id(self, user_id: int):
        return self.budgets.get(user_id)
    
    async def save(self, budget: Budget):
        self.saved_budgets.append(budget)
        self.budgets[budget.user_id] = budget
    
    def set_budget_for_user(self, user_id: int, budget: Budget):
        self.budgets[user_id] = budget


@pytest.fixture
def mock_repository():
    return MockBudgetRepository()


@pytest.fixture
def sample_budget():
    """Create a sample budget for testing"""
    period = Period.monthly(2025, 3)
    budget = Budget(
        user_id=1,
        period=period,
        monthly_income=Money(Decimal('5000.00'))
    )
    
    # Add existing category
    budget.add_category(BudgetCategory(
        name="Groceries",
        allocated_amount=Money(Decimal('800.00'))
    ))
    
    return budget


class TestCreateBudgetCategory:
    """Test suite for CreateBudgetCategory use case"""
    
    @pytest.mark.asyncio
    async def test_create_budget_category_success(self, mock_repository, sample_budget):
        """Test successful budget category creation"""
        # Setup
        user_id = 1
        mock_repository.set_budget_for_user(user_id, sample_budget)
        use_case = CreateBudgetCategory(mock_repository)
        
        request = CreateBudgetCategoryRequest(
            user_id=user_id,
            category_name="Transport",
            allocated_amount=Decimal('500.00'),
            category_type="expense"
        )
        
        # Execute
        await use_case.execute(request)
        
        # Assert
        assert len(mock_repository.saved_budgets) == 1
        saved_budget = mock_repository.saved_budgets[0]
        
        assert "Transport" in saved_budget.categories
        transport_category = saved_budget.categories["Transport"]
        assert transport_category.name == "Transport"
        assert transport_category.allocated_amount.amount == Decimal('500.00')
        assert transport_category.category_type == "expense"
        assert transport_category.spent_amount.amount == Decimal('0.00')
    
    @pytest.mark.asyncio
    async def test_create_budget_category_with_savings_type(self, mock_repository, sample_budget):
        """Test creating a savings category"""
        # Setup
        user_id = 1
        mock_repository.set_budget_for_user(user_id, sample_budget)
        use_case = CreateBudgetCategory(mock_repository)
        
        request = CreateBudgetCategoryRequest(
            user_id=user_id,
            category_name="Emergency Fund",
            allocated_amount=Decimal('1000.00'),
            category_type="savings"
        )
        
        # Execute
        await use_case.execute(request)
        
        # Assert
        saved_budget = mock_repository.saved_budgets[0]
        emergency_category = saved_budget.categories["Emergency Fund"]
        assert emergency_category.category_type == "savings"
        assert emergency_category.allocated_amount.amount == Decimal('1000.00')
    
    @pytest.mark.asyncio
    async def test_create_budget_category_user_not_found(self, mock_repository):
        """Test creating category when user budget not found"""
        # Setup
        use_case = CreateBudgetCategory(mock_repository)
        
        request = CreateBudgetCategoryRequest(
            user_id=999,  # Non-existent user
            category_name="Transport",
            allocated_amount=Decimal('500.00')
        )
        
        # Execute & Assert
        with pytest.raises(ValueError, match="Budget not found for user 999"):
            await use_case.execute(request)
        
        # Verify nothing was saved
        assert len(mock_repository.saved_budgets) == 0
    
    @pytest.mark.asyncio
    async def test_create_budget_category_duplicate_name(self, mock_repository, sample_budget):
        """Test creating category with duplicate name fails"""
        # Setup
        user_id = 1
        mock_repository.set_budget_for_user(user_id, sample_budget)
        use_case = CreateBudgetCategory(mock_repository)
        
        request = CreateBudgetCategoryRequest(
            user_id=user_id,
            category_name="Groceries",  # Already exists
            allocated_amount=Decimal('600.00')
        )
        
        # Execute & Assert
        with pytest.raises(ValueError, match="Category 'Groceries' already exists"):
            await use_case.execute(request)
        
        # Verify nothing was saved
        assert len(mock_repository.saved_budgets) == 0
    
    @pytest.mark.asyncio
    async def test_create_budget_category_default_type(self, mock_repository, sample_budget):
        """Test creating category with default type"""
        # Setup
        user_id = 1
        mock_repository.set_budget_for_user(user_id, sample_budget)
        use_case = CreateBudgetCategory(mock_repository)
        
        # Request without explicit category_type (should default to "expense")
        request = CreateBudgetCategoryRequest(
            user_id=user_id,
            category_name="Entertainment",
            allocated_amount=Decimal('300.00')
            # category_type defaults to "expense"
        )
        
        # Execute
        await use_case.execute(request)
        
        # Assert
        saved_budget = mock_repository.saved_budgets[0]
        entertainment_category = saved_budget.categories["Entertainment"]
        assert entertainment_category.category_type == "expense"
    
    @pytest.mark.asyncio
    async def test_create_budget_category_zero_amount(self, mock_repository, sample_budget):
        """Test creating category with zero amount"""
        # Setup
        user_id = 1
        mock_repository.set_budget_for_user(user_id, sample_budget)
        use_case = CreateBudgetCategory(mock_repository)
        
        request = CreateBudgetCategoryRequest(
            user_id=user_id,
            category_name="Miscellaneous",
            allocated_amount=Decimal('0.00')
        )
        
        # Execute
        await use_case.execute(request)
        
        # Assert
        saved_budget = mock_repository.saved_budgets[0]
        misc_category = saved_budget.categories["Miscellaneous"]
        assert misc_category.allocated_amount.amount == Decimal('0.00')
    
    @pytest.mark.asyncio
    async def test_create_budget_category_large_amount(self, mock_repository, sample_budget):
        """Test creating category with large amount"""
        # Setup
        user_id = 1
        mock_repository.set_budget_for_user(user_id, sample_budget)
        use_case = CreateBudgetCategory(mock_repository)
        
        request = CreateBudgetCategoryRequest(
            user_id=user_id,
            category_name="Investment",
            allocated_amount=Decimal('50000.99'),
            category_type="investment"
        )
        
        # Execute
        await use_case.execute(request)
        
        # Assert
        saved_budget = mock_repository.saved_budgets[0]
        investment_category = saved_budget.categories["Investment"]
        assert investment_category.allocated_amount.amount == Decimal('50000.99')
        assert investment_category.category_type == "investment"