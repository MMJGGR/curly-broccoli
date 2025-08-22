"""
Integration tests for Budget V2 Clean Architecture endpoints.
Tests the complete flow: HTTP → Controller → Use Case → Repository → Database
"""
import pytest
import asyncio
import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Import app and dependencies
from app.main import app
from app.models import Base, User, Profile, ExpenseCategory, Goal
from app.core.database import get_db
from app.auth import get_current_user

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_budget_v2.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_get_current_user():
    """Override auth dependency for testing"""
    return User(id=1, email="test@example.com", is_active=True)


# Override dependencies
app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user

# Create test client
client = TestClient(app)


class TestBudgetV2Endpoints:
    """Integration tests for Budget V2 Clean Architecture endpoints"""
    
    def setup_method(self):
        """Setup test database for each test"""
        Base.metadata.create_all(bind=engine)
        
        # Create test data
        db = TestingSessionLocal()
        
        # Create test user and profile
        user = User(id=1, email="test@example.com", hashed_password="hashed", is_active=True)
        profile = Profile(
            id=1,
            user_id=1,
            first_name="Test",
            last_name="User",
            monthly_income=5000.0
        )
        
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
        
        # Create existing goal
        emergency_goal = Goal(
            name="Emergency Fund",
            target="10000.0",
            current="2000.0",
            user_id=1
        )
        
        db.add_all([user, profile, groceries, transport, emergency_goal])
        db.commit()
        db.close()
    
    def teardown_method(self):
        """Cleanup after each test"""
        Base.metadata.drop_all(bind=engine)
    
    def test_health_check_endpoint(self):
        """Test health check endpoint works"""
        response = client.get("/api/v1/budget-v2/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "budget-v2-clean"
        assert data["architecture"] == "clean_architecture"
        assert data["cfa_compliant"] is True
    
    def test_get_budget_overview_success(self):
        """Test getting budget overview through clean architecture"""
        response = client.get("/api/v1/budget-v2/overview")
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify response structure
        assert "user_id" in data
        assert "period" in data
        assert "income" in data
        assert "expenses" in data
        assert "savings_and_goals" in data
        assert "summary" in data
        assert "metadata" in data
        
        # Verify financial data
        income_data = data["income"]
        assert income_data["monthly_income"] == 5000.0
        assert income_data["currency"] == "KES"
        
        expenses_data = data["expenses"]
        assert expenses_data["total_expenses"] == 1300.0  # 800 + 500
        assert "Groceries" in expenses_data["categories"]
        assert "Transport" in expenses_data["categories"]
        
        # Verify savings and goals
        savings_data = data["savings_and_goals"]
        assert savings_data["total_goals"] == 10000.0
        
        # Verify summary
        summary_data = data["summary"]
        assert summary_data["surplus"] == -6300.0  # 5000 - 1300 - 10000
        assert summary_data["is_balanced"] is False
        assert summary_data["total_categories"] == 2
        
        # Verify metadata
        metadata = data["metadata"]
        assert metadata["calculation_method"] == "clean_architecture"
        assert metadata["cfa_compliant"] is True
        
        print("✓ Budget overview endpoint works correctly")
    
    def test_create_budget_category_success(self):
        """Test creating new budget category"""
        response = client.post(
            "/api/v1/budget-v2/categories",
            params={
                "category_name": "Entertainment",
                "allocated_amount": 300.0,
                "category_type": "expense"
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        
        assert "message" in data
        assert "Entertainment" in data["message"]
        
        category_data = data["category"]
        assert category_data["name"] == "Entertainment"
        assert category_data["allocated_amount"] == 300.0
        assert category_data["category_type"] == "expense"
        assert category_data["currency"] == "KES"
        
        print("✓ Create budget category endpoint works correctly")
    
    def test_create_category_validation(self):
        """Test validation for creating budget category"""
        # Test negative amount
        response = client.post(
            "/api/v1/budget-v2/categories",
            params={
                "category_name": "Invalid",
                "allocated_amount": -100.0
            }
        )
        assert response.status_code == 400
        assert "cannot be negative" in response.json()["detail"]
        
        # Test invalid category type
        response = client.post(
            "/api/v1/budget-v2/categories",
            params={
                "category_name": "Invalid",
                "allocated_amount": 100.0,
                "category_type": "invalid_type"
            }
        )
        assert response.status_code == 400
        assert "must be" in response.json()["detail"]
        
        print("✓ Category validation works correctly")
    
    def test_create_duplicate_category(self):
        """Test creating duplicate category fails"""
        response = client.post(
            "/api/v1/budget-v2/categories",
            params={
                "category_name": "Groceries",  # Already exists
                "allocated_amount": 600.0
            }
        )
        
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]
        
        print("✓ Duplicate category detection works correctly")
    
    def test_update_category_allocation(self):
        """Test updating category allocation"""
        response = client.put(
            "/api/v1/budget-v2/categories/Groceries/allocation",
            params={"new_amount": 900.0}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "updated successfully" in data["message"]
        assert data["category"] == "Groceries"
        assert data["new_allocation"] == 900.0
        assert data["currency"] == "KES"
        
        print("✓ Update category allocation endpoint works correctly")
    
    def test_update_category_spending(self):
        """Test updating category spending"""
        response = client.put(
            "/api/v1/budget-v2/categories/Transport/spending",
            params={"spent_amount": 520.0}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "updated successfully" in data["message"]
        assert data["category"] == "Transport"
        assert data["spent_amount"] == 520.0
        assert data["currency"] == "KES"
        
        print("✓ Update category spending endpoint works correctly")
    
    def test_update_nonexistent_category(self):
        """Test updating non-existent category fails"""
        response = client.put(
            "/api/v1/budget-v2/categories/NonExistent/allocation",
            params={"new_amount": 100.0}
        )
        
        assert response.status_code == 400
        assert "not found" in response.json()["detail"]
        
        print("✓ Non-existent category handling works correctly")


if __name__ == "__main__":
    # Run tests manually
    test_class = TestBudgetV2Endpoints()
    
    print("Running Budget V2 Clean Architecture Endpoint Tests...")
    print()
    
    try:
        test_class.setup_method()
        test_class.test_health_check_endpoint()
        test_class.teardown_method()
        
        test_class.setup_method()
        test_class.test_get_budget_overview_success()
        test_class.teardown_method()
        
        test_class.setup_method()
        test_class.test_create_budget_category_success()
        test_class.teardown_method()
        
        test_class.setup_method()
        test_class.test_create_category_validation()
        test_class.teardown_method()
        
        test_class.setup_method()
        test_class.test_create_duplicate_category()
        test_class.teardown_method()
        
        test_class.setup_method()
        test_class.test_update_category_allocation()
        test_class.teardown_method()
        
        test_class.setup_method()
        test_class.test_update_category_spending()
        test_class.teardown_method()
        
        test_class.setup_method()
        test_class.test_update_nonexistent_category()
        test_class.teardown_method()
        
        print()
        print("🎉 All Budget V2 Clean Architecture Endpoint Tests PASSED!")
        print()
        print("✅ Complete integration verified:")
        print("   - HTTP requests → Controllers")
        print("   - Controllers → Use Cases (via DI)")
        print("   - Use Cases → Domain Entities")
        print("   - Entities → Repository → Database")
        print("   - Error handling and validation")
        print()
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        import traceback
        traceback.print_exc()