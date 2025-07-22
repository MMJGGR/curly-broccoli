from __future__ import annotations
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import SessionLocal as Session

from app.main import app
from app.database import Base, get_db
from app.models import User, Account
from app.security import hash_password, create_access_token

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(name="session")
def session_fixture():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(name="client")
def client_fixture(session):
    def override_get_db():
        yield session
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()

@pytest.fixture(name="test_user")
def test_user_fixture(session):
    hashed_password = hash_password("testpassword")
    user = User(email="test@example.com", hashed_password=hashed_password, role="user")
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@pytest.fixture(name="test_token")
def test_token_fixture(test_user: User):
    return create_access_token(test_user)

@pytest.fixture(name="authenticated_client")
def authenticated_client_fixture(client: TestClient, test_token: str):
    client.headers = {
        **client.headers,
        "Authorization": f"Bearer {test_token}"
    }
    return client

# Test Cases

def test_create_account(authenticated_client: TestClient):
    response = authenticated_client.post(
        "/accounts/",
        json={
            "name": "Savings Account",
            "type": "Savings",
            "balance": 1000.0,
            "institution_name": "Bank of Test"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Savings Account"
    assert data["type"] == "Savings"
    assert data["balance"] == 1000.0
    assert data["institution_name"] == "Bank of Test"
    assert "id" in data
    assert "user_id" in data

def test_create_account_invalid_data(authenticated_client: TestClient):
    response = authenticated_client.post(
        "/accounts/",
        json={
            "name": "", # Invalid name
            "type": "Savings",
            "balance": 1000.0,
            "institution_name": "Bank of Test"
        }
    )
    assert response.status_code == 422 # Unprocessable Entity

def test_read_accounts(authenticated_client: TestClient, test_user: User, session):
    # Create a few accounts for the test user
    account1 = Account(name="Checking", type="Checking", balance=500.0, institution_name="Test Bank 1", user_id=test_user.id)
    account2 = Account(name="Investment", type="Investment", balance=2000.0, institution_name="Test Bank 2", user_id=test_user.id)
    session.add_all([account1, account2])
    session.commit()

    response = authenticated_client.get("/accounts/")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert data[0]["name"] == "Checking"
    assert data[1]["name"] == "Investment"

def test_read_single_account(authenticated_client: TestClient, test_user: User, session):
    account = Account(name="Credit Card", type="Credit Card", balance=-500.0, institution_name="Test Bank 3", user_id=test_user.id)
    session.add(account)
    session.commit()
    session.refresh(account)

    response = authenticated_client.get(f"/accounts/{account.id}")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Credit Card"
    assert data["id"] == account.id

def test_read_single_account_not_found(authenticated_client: TestClient):
    response = authenticated_client.get("/accounts/9999") # Non-existent ID
    assert response.status_code == 404

def test_read_single_account_unauthorized(client: TestClient, test_user: User, session):
    # Create an account for a different user
    other_user = User(email="other@example.com", hashed_password=hash_password("otherpassword"), role="user")
    session.add(other_user)
    session.commit()
    session.refresh(other_user)
    other_account = Account(name="Other Account", type="Savings", balance=100.0, institution_name="Other Bank", user_id=other_user.id)
    session.add(other_account)
    session.commit()
    session.refresh(other_account)

    # Attempt to access with test_user's token
    response = client.get(f"/accounts/{other_account.id}", headers=authenticated_client.headers)
    assert response.status_code == 404 # Should return 404 to prevent enumeration

def test_update_account(authenticated_client: TestClient, test_user: User, session):
    account = Account(name="Old Name", type="Savings", balance=100.0, institution_name="Old Bank", user_id=test_user.id)
    session.add(account)
    session.commit()
    session.refresh(account)

    updated_data = {"name": "New Name", "balance": 200.0}
    response = authenticated_client.put(f"/accounts/{account.id}", json=updated_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "New Name"
    assert data["balance"] == 200.0
    assert data["type"] == "Savings" # Type should remain unchanged

def test_update_account_not_found(authenticated_client: TestClient):
    response = authenticated_client.put(
        "/accounts/9999",
        json={
            "name": "Non Existent"
        }
    )
    assert response.status_code == 404

def test_delete_account(authenticated_client: TestClient, test_user: User, session):
    account = Account(name="Account to Delete", type="Checking", balance=100.0, institution_name="Delete Bank", user_id=test_user.id)
    session.add(account)
    session.commit()
    session.refresh(account)

    response = authenticated_client.delete(f"/accounts/{account.id}")
    assert response.status_code == 204 # No Content

    # Verify account is deleted
    deleted_account = session.query(Account).filter(Account.id == account.id).first()
    assert deleted_account is None

def test_delete_account_not_found(authenticated_client: TestClient):
    response = authenticated_client.delete("/accounts/9999")
    assert response.status_code == 404
