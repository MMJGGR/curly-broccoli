"""
Integration tests for Relationships API - Clean Architecture
CFA-compliant testing for cross-component relationship endpoints
"""
import pytest
from datetime import date
from decimal import Decimal
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.database import get_db
from app.models import User, Asset, Income, Expense, Liability, Goal as GoalModel
from tests.conftest import override_get_db, test_db_session, test_user


class TestRelationshipsAPI:
    """Integration tests for relationships API endpoints"""

    @pytest.fixture
    def client(self, test_db_session):
        """Create test client with database override"""
        app.dependency_overrides[get_db] = lambda: test_db_session
        return TestClient(app)

    @pytest.fixture
    def sample_assets(self, test_db_session: Session, test_user: User):
        """Create sample assets for testing"""
        assets = [
            Asset(
                user_id=test_user.id,
                name="Kileleshwa Property",
                asset_type="real_estate",
                current_value=5000000.00,
                purchase_price=3500000.00,
                purchase_date=date(2023, 1, 1),
                description="Rental property in Kileleshwa"
            ),
            Asset(
                user_id=test_user.id,
                name="SACCO Shares",
                asset_type="investment_account",
                current_value=500000.00,
                purchase_price=400000.00,
                description="Shares in local SACCO"
            )
        ]
        
        for asset in assets:
            test_db_session.add(asset)
        test_db_session.commit()
        
        for asset in assets:
            test_db_session.refresh(asset)
        
        return assets

    @pytest.fixture
    def sample_income(self, test_db_session: Session, test_user: User):
        """Create sample income for testing"""
        income_sources = [
            Income(
                user_id=test_user.id,
                description="Salary",
                amount=75000.00,
                income_type="salary",
                frequency="monthly"
            ),
            Income(
                user_id=test_user.id,
                description="Rental Income",
                amount=25000.00,
                income_type="rental",
                frequency="monthly"
            )
        ]
        
        for income in income_sources:
            test_db_session.add(income)
        test_db_session.commit()
        
        for income in income_sources:
            test_db_session.refresh(income)
        
        return income_sources

    @pytest.fixture
    def sample_expenses(self, test_db_session: Session, test_user: User):
        """Create sample expenses for testing"""
        expenses = [
            Expense(
                user_id=test_user.id,
                description="Property Maintenance",
                amount=3000.00,
                expense_category="maintenance",
                frequency="monthly"
            )
        ]
        
        for expense in expenses:
            test_db_session.add(expense)
        test_db_session.commit()
        
        for expense in expenses:
            test_db_session.refresh(expense)
        
        return expenses

    @pytest.fixture
    def sample_goals(self, test_db_session: Session, test_user: User):
        """Create sample goals for testing"""
        goals = [
            GoalModel(
                user_id=test_user.id,
                goal_name="Emergency Fund",
                target_amount=300000.00,
                current_amount=100000.00,
                target_date=date(2025, 12, 31),
                goal_type="emergency_fund"
            )
        ]
        
        for goal in goals:
            test_db_session.add(goal)
        test_db_session.commit()
        
        for goal in goals:
            test_db_session.refresh(goal)
        
        return goals

    def test_health_check(self, client):
        """Test relationships health check endpoint"""
        response = client.get("/api/v1/relationships-v2/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "relationships-v2-clean"
        assert data["architecture"] == "clean_architecture"
        assert data["cfa_compliant"] is True

    def test_create_asset_income_relationship(
        self, client, test_user, sample_assets, sample_income
    ):
        """Test creating an asset-income relationship"""
        asset = sample_assets[0]  # Kileleshwa Property
        income = sample_income[1]  # Rental Income
        
        relationship_data = {
            "relationship_type": "asset_income",
            "source_type": "asset",
            "source_id": asset.id,
            "target_type": "income",
            "target_id": income.id,
            "amount": 25000.0,
            "frequency": "monthly",
            "description": "Rental income from Kileleshwa property"
        }
        
        response = client.post(
            "/api/v1/relationships-v2/",
            json=relationship_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["success"] is True
        
        relationship = data["data"]["relationship"]
        assert relationship["relationship_type"] == "asset_income"
        assert relationship["source_type"] == "asset"
        assert relationship["target_type"] == "income"
        assert relationship["amount"] == 25000.0
        assert relationship["monthly_impact"] == 25000.0
        
        # Check impact analysis
        impact = data["data"]["impact_analysis"]
        assert impact["monthly_impact"] == 25000.0
        assert impact["frequency"] == "monthly"

    def test_create_asset_expense_relationship(
        self, client, test_user, sample_assets, sample_expenses
    ):
        """Test creating an asset-expense relationship"""
        asset = sample_assets[0]  # Kileleshwa Property
        expense = sample_expenses[0]  # Property Maintenance
        
        relationship_data = {
            "relationship_type": "asset_expense",
            "source_type": "asset",
            "source_id": asset.id,
            "target_type": "expense",
            "target_id": expense.id,
            "amount": 3000.0,
            "frequency": "monthly",
            "description": "Monthly maintenance costs for property"
        }
        
        response = client.post(
            "/api/v1/relationships-v2/",
            json=relationship_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["success"] is True
        
        relationship = data["data"]["relationship"]
        assert relationship["relationship_type"] == "asset_expense"
        assert relationship["amount"] == 3000.0

    def test_create_goal_income_relationship(
        self, client, test_user, sample_income, sample_goals
    ):
        """Test creating a goal-income relationship"""
        income = sample_income[0]  # Salary
        goal = sample_goals[0]  # Emergency Fund
        
        relationship_data = {
            "relationship_type": "goal_income",
            "source_type": "income",
            "source_id": income.id,
            "target_type": "goal",
            "target_id": goal.id,
            "amount": 15000.0,
            "percentage": 20.0,
            "frequency": "monthly",
            "description": "20% of salary allocated to emergency fund"
        }
        
        response = client.post(
            "/api/v1/relationships-v2/",
            json=relationship_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["success"] is True
        
        relationship = data["data"]["relationship"]
        assert relationship["relationship_type"] == "goal_income"
        assert relationship["percentage"] == 20.0

    def test_create_relationship_invalid_source(self, client, test_user, sample_income):
        """Test creating relationship with invalid source component"""
        income = sample_income[0]
        
        relationship_data = {
            "relationship_type": "asset_income",
            "source_type": "asset",
            "source_id": 99999,  # Non-existent asset
            "target_type": "income",
            "target_id": income.id,
            "amount": 25000.0,
            "frequency": "monthly"
        }
        
        response = client.post(
            "/api/v1/relationships-v2/",
            json=relationship_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 400
        assert "Source asset not found" in response.json()["detail"]

    def test_get_component_relationships_asset(
        self, client, test_user, sample_assets, sample_income, sample_expenses
    ):
        """Test getting relationships for an asset component"""
        asset = sample_assets[0]
        income = sample_income[1]
        expense = sample_expenses[0]
        
        # Create asset-income relationship
        income_relationship_data = {
            "relationship_type": "asset_income",
            "source_type": "asset",
            "source_id": asset.id,
            "target_type": "income",
            "target_id": income.id,
            "amount": 25000.0,
            "frequency": "monthly"
        }
        
        client.post(
            "/api/v1/relationships-v2/",
            json=income_relationship_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        # Create asset-expense relationship
        expense_relationship_data = {
            "relationship_type": "asset_expense",
            "source_type": "asset",
            "source_id": asset.id,
            "target_type": "expense",
            "target_id": expense.id,
            "amount": 3000.0,
            "frequency": "monthly"
        }
        
        client.post(
            "/api/v1/relationships-v2/",
            json=expense_relationship_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        # Get asset relationships
        response = client.get(
            f"/api/v1/relationships-v2/component/asset/{asset.id}",
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["data"]["component_type"] == "asset"
        assert data["data"]["component_id"] == asset.id
        assert data["data"]["total_relationships"] == 2
        
        # Check analysis
        analysis = data["data"]["analysis"]
        assert analysis["asset_id"] == asset.id
        assert analysis["monthly_income_generated"] == 25000.0
        assert analysis["monthly_expenses_required"] == 3000.0
        assert analysis["net_monthly_contribution"] == 22000.0

    def test_create_asset_income_helper_endpoint(
        self, client, test_user, sample_assets
    ):
        """Test the helper endpoint for creating asset-income relationships"""
        asset = sample_assets[0]
        
        income_data = {
            "description": "Rental income from Kileleshwa property",
            "monthly_amount": 25000.0,
            "income_type": "rental_income"
        }
        
        response = client.post(
            f"/api/v1/relationships-v2/asset/{asset.id}/income",
            json=income_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["success"] is True

    def test_create_goal_funding_plan(
        self, client, test_user, sample_assets, sample_income, sample_goals
    ):
        """Test creating a comprehensive goal funding plan"""
        asset = sample_assets[1]  # SACCO Shares
        income = sample_income[0]  # Salary
        goal = sample_goals[0]  # Emergency Fund
        
        funding_plan = {
            "funding_sources": [
                {
                    "source_type": "asset",
                    "source_id": asset.id,
                    "monthly_amount": 5000.0
                },
                {
                    "source_type": "income",
                    "source_id": income.id,
                    "monthly_amount": 10000.0,
                    "percentage": 13.33
                }
            ]
        }
        
        response = client.post(
            f"/api/v1/relationships-v2/goal/{goal.id}/funding",
            json=funding_plan,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        result = data["data"]
        assert result["success"] is True
        assert result["goal_id"] == goal.id
        assert result["funding_sources_count"] == 2
        assert result["total_monthly_funding"] == 15000.0

    def test_get_net_worth_impact(
        self, client, test_user, sample_assets, sample_income, sample_expenses
    ):
        """Test getting net worth impact analysis"""
        asset = sample_assets[0]
        income = sample_income[1]
        expense = sample_expenses[0]
        
        # Create relationships first
        relationships_data = [
            {
                "relationship_type": "asset_income",
                "source_type": "asset",
                "source_id": asset.id,
                "target_type": "income",
                "target_id": income.id,
                "amount": 25000.0,
                "frequency": "monthly"
            },
            {
                "relationship_type": "asset_expense",
                "source_type": "asset",
                "source_id": asset.id,
                "target_type": "expense",
                "target_id": expense.id,
                "amount": 3000.0,
                "frequency": "monthly"
            }
        ]
        
        for rel_data in relationships_data:
            client.post(
                "/api/v1/relationships-v2/",
                json=rel_data,
                headers={"Authorization": f"Bearer {test_user.token}"}
            )
        
        # Get net worth impact
        response = client.get(
            "/api/v1/relationships-v2/net-worth-impact",
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        result = data["data"]
        assert result["monthly_net_worth_impact"] == 22000.0  # 25000 - 3000
        assert result["total_relationships"] == 2
        assert "relationship_summary" in result

    def test_update_relationship(
        self, client, test_user, sample_assets, sample_income
    ):
        """Test updating an existing relationship"""
        asset = sample_assets[0]
        income = sample_income[1]
        
        # Create relationship first
        relationship_data = {
            "relationship_type": "asset_income",
            "source_type": "asset",
            "source_id": asset.id,
            "target_type": "income",
            "target_id": income.id,
            "amount": 20000.0,
            "frequency": "monthly"
        }
        
        create_response = client.post(
            "/api/v1/relationships-v2/",
            json=relationship_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        relationship_id = create_response.json()["data"]["relationship"]["id"]
        
        # Update relationship
        update_data = {
            "amount": 25000.0,
            "description": "Updated rental income amount"
        }
        
        response = client.put(
            f"/api/v1/relationships-v2/{relationship_id}",
            json=update_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        updated_relationship = data["data"]["relationship"]
        assert updated_relationship["amount"] == 25000.0
        assert updated_relationship["description"] == "Updated rental income amount"

    def test_delete_relationship(
        self, client, test_user, sample_assets, sample_income
    ):
        """Test deleting a relationship"""
        asset = sample_assets[0]
        income = sample_income[1]
        
        # Create relationship first
        relationship_data = {
            "relationship_type": "asset_income",
            "source_type": "asset",
            "source_id": asset.id,
            "target_type": "income",
            "target_id": income.id,
            "amount": 25000.0,
            "frequency": "monthly"
        }
        
        create_response = client.post(
            "/api/v1/relationships-v2/",
            json=relationship_data,
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        relationship_id = create_response.json()["data"]["relationship"]["id"]
        
        # Delete relationship
        response = client.delete(
            f"/api/v1/relationships-v2/{relationship_id}",
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["data"]["deleted"] is True
        assert data["data"]["relationship_id"] == relationship_id

    def test_unauthorized_access(self, client):
        """Test unauthorized access to endpoints"""
        response = client.get("/api/v1/relationships-v2/net-worth-impact")
        assert response.status_code == 401

    def test_get_nonexistent_component_relationships(self, client, test_user):
        """Test getting relationships for non-existent component"""
        response = client.get(
            "/api/v1/relationships-v2/component/asset/99999",
            headers={"Authorization": f"Bearer {test_user.token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["total_relationships"] == 0


if __name__ == '__main__':
    pytest.main([__file__, '-v'])