"""
Test cases for GetAccountsSummary use case following TDD approach.
Foundation Week - Day 1: Testing missing architecture components
"""
import pytest
from decimal import Decimal
from unittest.mock import Mock, AsyncMock
from datetime import datetime, timezone

from app.application.use_cases.get_accounts_summary import GetAccountsSummary
from app.domain.entities.account import Account, AccountType
from app.domain.entities.money import Money
from app.domain.repositories.account_repository import AccountRepository


@pytest.fixture
def mock_account_repository():
    """Mock repository for testing"""
    return Mock(spec=AccountRepository)


@pytest.fixture
def sample_accounts():
    """Sample accounts for testing"""
    return [
        Account(
            id=1,
            user_id=1,
            name="Primary Savings",
            account_type=AccountType.SAVINGS,
            balance=Money(Decimal("150000.00")),
            institution="KCB Bank",
            account_number="****1234",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        ),
        Account(
            id=2,
            user_id=1,
            name="Credit Card",
            account_type=AccountType.CREDIT_CARD,
            balance=Money(Decimal("-25000.00")),  # Negative for liability
            institution="Equity Bank",
            account_number="****5678",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        ),
        Account(
            id=3,
            user_id=1,
            name="Investment Account",
            account_type=AccountType.INVESTMENT,
            balance=Money(Decimal("75000.00")),
            institution="CIC Asset Management",
            account_number="****9012",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
    ]


@pytest.mark.asyncio
async def test_get_accounts_summary_success(mock_account_repository, sample_accounts):
    """Test successful accounts summary retrieval"""
    # Arrange
    user_id = 1
    mock_account_repository.get_user_accounts = AsyncMock(return_value=sample_accounts)
    use_case = GetAccountsSummary(mock_account_repository)
    
    # Act
    result = await use_case.execute(user_id)
    
    # Assert
    assert result is not None
    assert result["user_id"] == user_id
    assert len(result["accounts"]) == 3
    
    # Verify summary calculations
    summary = result["summary"]
    assert summary["total_accounts"] == 3
    assert summary["active_accounts"] == 3
    assert summary["total_assets"] == Money(Decimal("225000.00"))  # 150K + 75K
    assert summary["total_liabilities"] == Money(Decimal("25000.00"))  # 25K (absolute value)
    assert summary["net_worth"] == Money(Decimal("200000.00"))  # 225K - 25K
    
    # Verify account details
    savings_account = next(acc for acc in result["accounts"] if acc["name"] == "Primary Savings")
    assert savings_account["balance"] == Money(Decimal("150000.00"))
    assert savings_account["is_asset"] is True
    assert savings_account["is_liability"] is False
    
    credit_card = next(acc for acc in result["accounts"] if acc["name"] == "Credit Card")
    assert credit_card["balance"] == Money(Decimal("-25000.00"))
    assert credit_card["is_asset"] is False
    assert credit_card["is_liability"] is True


@pytest.mark.asyncio
async def test_get_accounts_summary_no_accounts(mock_account_repository):
    """Test accounts summary with no accounts"""
    # Arrange
    user_id = 1
    mock_account_repository.get_user_accounts = AsyncMock(return_value=[])
    use_case = GetAccountsSummary(mock_account_repository)
    
    # Act
    result = await use_case.execute(user_id)
    
    # Assert
    assert result["user_id"] == user_id
    assert len(result["accounts"]) == 0
    assert result["summary"]["total_accounts"] == 0
    assert result["summary"]["total_assets"] == Money(Decimal("0.00"))
    assert result["summary"]["total_liabilities"] == Money(Decimal("0.00"))
    assert result["summary"]["net_worth"] == Money(Decimal("0.00"))


@pytest.mark.asyncio
async def test_get_accounts_summary_assets_only(mock_account_repository):
    """Test accounts summary with only asset accounts"""
    # Arrange
    user_id = 1
    assets_only = [
        Account(
            id=1,
            user_id=1,
            name="Savings",
            account_type=AccountType.SAVINGS,
            balance=Money(Decimal("100000.00")),
            institution="KCB Bank",
            account_number="****1111",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        ),
        Account(
            id=2,
            user_id=1,
            name="Investment",
            account_type=AccountType.INVESTMENT,
            balance=Money(Decimal("50000.00")),
            institution="CIC",
            account_number="****2222",
            is_active=True,
            created_at=datetime.now(timezone.utc)
        )
    ]
    
    mock_account_repository.get_user_accounts = AsyncMock(return_value=assets_only)
    use_case = GetAccountsSummary(mock_account_repository)
    
    # Act
    result = await use_case.execute(user_id)
    
    # Assert
    assert result["summary"]["total_assets"] == Money(Decimal("150000.00"))
    assert result["summary"]["total_liabilities"] == Money(Decimal("0.00"))
    assert result["summary"]["net_worth"] == Money(Decimal("150000.00"))


@pytest.mark.asyncio
async def test_get_accounts_summary_repository_error(mock_account_repository):
    """Test handling of repository errors"""
    # Arrange
    user_id = 1
    mock_account_repository.get_user_accounts = AsyncMock(side_effect=Exception("Database error"))
    use_case = GetAccountsSummary(mock_account_repository)
    
    # Act & Assert
    with pytest.raises(Exception) as exc_info:
        await use_case.execute(user_id)
    
    assert "Database error" in str(exc_info.value)


@pytest.mark.asyncio
async def test_cfa_compliant_calculations(mock_account_repository, sample_accounts):
    """Test CFA-compliant financial calculations"""
    # Arrange
    mock_account_repository.get_user_accounts = AsyncMock(return_value=sample_accounts)
    use_case = GetAccountsSummary(mock_account_repository)
    
    # Act
    result = await use_case.execute(1)
    
    # Assert CFA compliance
    summary = result["summary"]
    
    # Net worth calculation: Assets - Liabilities (CFA standard)
    expected_net_worth = Money(Decimal("225000.00")) - Money(Decimal("25000.00"))
    assert summary["net_worth"] == expected_net_worth
    
    # Asset categorization should follow CFA guidelines
    asset_accounts = [acc for acc in result["accounts"] if acc["is_asset"]]
    liability_accounts = [acc for acc in result["accounts"] if acc["is_liability"]]
    
    assert len(asset_accounts) == 2  # Savings + Investment
    assert len(liability_accounts) == 1  # Credit Card
    
    # Verify money precision (CFA requires decimal accuracy)
    for account in result["accounts"]:
        assert isinstance(account["balance"], Money)
        assert account["balance"].amount.as_tuple().exponent <= -2  # At least 2 decimal places


if __name__ == "__main__":
    pytest.main([__file__, "-v"])