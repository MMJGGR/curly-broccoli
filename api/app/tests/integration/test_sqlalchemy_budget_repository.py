"""
Integration tests for SqlAlchemy budget repository.
Tests the mapping between domain entities and database tables.
"""
import pytest
import asyncio
from decimal import Decimal
from datetime import date

# Import test setup
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

# Import domain entities
from app.domain.entities.budget import Budget, BudgetCategory
from app.domain.value_objects.money import Money
from app.domain.value_objects.period import Period

# Import infrastructure
from app.infrastructure.repositories.sqlalchemy_budget_repository import SqlAlchemyBudgetRepository

# Import existing database models
from app.models import User, Profile, ExpenseCategory, Goal

# Import database setup
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.models import Base


class TestSqlAlchemyBudgetRepository:
    """Integration tests for budget repository"""
    
    def setup_method(self):
        """Setup test database for each test"""
        # Create in-memory SQLite database
        self.engine = create_engine("sqlite:///:memory:", echo=True)
        Base.metadata.create_all(self.engine)
        
        SessionLocal = sessionmaker(bind=self.engine)
        self.session = SessionLocal()
        
        # Create repository
        self.repository = SqlAlchemyBudgetRepository(self.session)
        
        # Create test user and profile
        self.test_user = User(
            id=1,
            email="test@example.com",
            hashed_password="hashed",
            is_active=True
        )
        self.session.add(self.test_user)
        
        self.test_profile = Profile(
            id=1,
            user_id=1,
            first_name="Test",
            last_name="User",
            monthly_income=5000.0
        )
        self.session.add(self.test_profile)
        
        self.session.commit()
    
    def teardown_method(self):
        """Cleanup after each test"""
        self.session.close()
    
    @pytest.mark.asyncio
    async def test_get_budget_with_existing_data(self):
        """Test getting budget when user has existing expense categories and goals"""
        # Create existing expense categories
        groceries = ExpenseCategory(
            name="Groceries",
            budgeted_amount=800.0,
            actual_amount=600.0,
            category_type="expense",
            user_id=1,
            is_active=True
        )
        transport = ExpenseCategory(
            name="Transport",
            budgeted_amount=500.0,
            actual_amount=450.0,
            category_type="expense",
            user_id=1,
            is_active=True
        )
        savings = ExpenseCategory(
            name="Emergency Fund",
            budgeted_amount=1000.0,
            actual_amount=0.0,
            category_type="savings",
            user_id=1,
            is_active=True
        )
        
        self.session.add_all([groceries, transport, savings])
        
        # Create existing goal
        house_goal = Goal(
            name="House Deposit",
            target="50000.0",
            current="5000.0",
            progress=10.0,
            target_date="2026-12-31",
            user_id=1
        )
        self.session.add(house_goal)
        self.session.commit()
        
        # Get budget through repository
        budget = await self.repository.get_by_user_id(1)
        
        # Verify budget mapping
        assert budget is not None
        assert budget.user_id == 1
        assert budget.monthly_income.amount == Decimal('5000.00')
        
        # Verify categories
        assert len(budget.categories) == 3
        assert "Groceries" in budget.categories
        assert "Transport" in budget.categories
        assert "Emergency Fund" in budget.categories
        
        groceries_cat = budget.categories["Groceries"]
        assert groceries_cat.allocated_amount.amount == Decimal('800.00')
        assert groceries_cat.spent_amount.amount == Decimal('600.00')
        assert groceries_cat.category_type == "expense"
        
        # Verify goal allocations
        assert len(budget.goal_allocations) == 1
        assert "House Deposit" in budget.goal_allocations
        assert budget.goal_allocations["House Deposit"].amount == Decimal('50000.00')
        
        # Verify calculations work
        total_expenses = budget.calculate_total_expenses()
        assert total_expenses.amount == Decimal('1300.00')  # 800 + 500
        
        surplus = budget.calculate_surplus()
        expected_surplus = Decimal('5000.00') - Decimal('1300.00') - Decimal('1000.00') - Decimal('50000.00')
        assert surplus.amount == expected_surplus
    
    @pytest.mark.asyncio
    async def test_get_budget_empty_user(self):
        """Test getting budget for user with no data"""
        # Create user with profile but no categories/goals
        empty_user = User(
            id=2,
            email="empty@example.com",
            hashed_password="hashed"
        )
        empty_profile = Profile(
            id=2,
            user_id=2,
            monthly_income=3000.0
        )
        self.session.add_all([empty_user, empty_profile])
        self.session.commit()
        
        # Get budget
        budget = await self.repository.get_by_user_id(2)
        
        # Verify empty budget
        assert budget is not None
        assert budget.user_id == 2
        assert budget.monthly_income.amount == Decimal('3000.00')
        assert len(budget.categories) == 0
        assert len(budget.goal_allocations) == 0
        
        # Verify calculations work with empty budget
        assert budget.calculate_total_expenses().amount == Decimal('0.00')
        assert budget.calculate_surplus().amount == Decimal('3000.00')
        assert budget.is_balanced() is True
    
    @pytest.mark.asyncio
    async def test_get_budget_nonexistent_user(self):
        """Test getting budget for non-existent user"""
        budget = await self.repository.get_by_user_id(999)
        assert budget is None
    
    @pytest.mark.asyncio
    async def test_save_budget_update_existing(self):
        """Test saving budget updates existing data"""
        # Create initial data
        groceries = ExpenseCategory(
            name="Groceries",
            budgeted_amount=800.0,
            actual_amount=600.0,
            category_type="expense",
            user_id=1,
            is_active=True
        )
        self.session.add(groceries)
        self.session.commit()
        
        # Get budget and modify it
        budget = await self.repository.get_by_user_id(1)
        assert budget is not None
        
        # Update existing category
        budget.update_category_allocation("Groceries", Money(Decimal('900.00')))
        budget.update_category_spending("Groceries", Money(Decimal('750.00')))
        
        # Add new category
        new_category = BudgetCategory(
            name="Entertainment",
            allocated_amount=Money(Decimal('300.00')),
            category_type="expense"
        )
        budget.add_category(new_category)
        
        # Update income
        budget.monthly_income = Money(Decimal('5500.00'))
        
        # Save budget
        await self.repository.save(budget)
        
        # Verify updates in database
        updated_groceries = self.session.query(ExpenseCategory).filter(
            ExpenseCategory.user_id == 1,
            ExpenseCategory.name == "Groceries"
        ).first()
        assert updated_groceries.budgeted_amount == 900.0
        assert updated_groceries.actual_amount == 750.0
        
        # Verify new category created
        entertainment = self.session.query(ExpenseCategory).filter(
            ExpenseCategory.user_id == 1,
            ExpenseCategory.name == "Entertainment"
        ).first()
        assert entertainment is not None
        assert entertainment.budgeted_amount == 300.0
        assert entertainment.category_type == "expense"
        
        # Verify profile updated
        updated_profile = self.session.query(Profile).filter(Profile.user_id == 1).first()
        assert updated_profile.monthly_income == 5500.0
    
    @pytest.mark.asyncio
    async def test_save_budget_new_goal(self):
        """Test saving budget with new goal allocation"""
        # Get budget
        budget = await self.repository.get_by_user_id(1)
        assert budget is not None
        
        # Add goal allocation
        budget.set_goal_allocation("Car Fund", Money(Decimal('25000.00')))
        
        # Save budget
        await self.repository.save(budget)
        
        # Verify goal created in database
        car_goal = self.session.query(Goal).filter(
            Goal.user_id == 1,
            Goal.name == "Car Fund"
        ).first()
        assert car_goal is not None
        assert car_goal.target == "25000.0"
    
    def test_inactive_categories_filtered(self):
        """Test that inactive categories are not included in budget"""
        # Create active and inactive categories
        active_cat = ExpenseCategory(
            name="Active Category",
            budgeted_amount=500.0,
            user_id=1,
            is_active=True
        )
        inactive_cat = ExpenseCategory(
            name="Inactive Category",
            budgeted_amount=300.0,
            user_id=1,
            is_active=False
        )
        self.session.add_all([active_cat, inactive_cat])
        self.session.commit()
        
        # Get budget - should only include active category
        async def test_filter():
            budget = await self.repository.get_by_user_id(1)
            assert budget is not None
            assert len(budget.categories) == 1
            assert "Active Category" in budget.categories
            assert "Inactive Category" not in budget.categories
        
        # Run async test
        asyncio.run(test_filter())


if __name__ == "__main__":
    # Run a simple test
    test_repo = TestSqlAlchemyBudgetRepository()
    test_repo.setup_method()
    
    print("Running integration test...")
    
    async def run_test():
        await test_repo.test_get_budget_empty_user()
        print("✓ Empty user test passed")
        
        await test_repo.test_get_budget_nonexistent_user()
        print("✓ Nonexistent user test passed")
    
    asyncio.run(run_test())
    test_repo.teardown_method()
    
    print("Integration tests completed successfully!")