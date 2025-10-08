import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User
from app.security import create_access_token, get_current_user

# Setup in-memory SQLite for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Expose an override_get_db function for tests that import it directly
def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest.fixture(name="session")
def session_fixture():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(name="test_db_session")
def test_db_session_fixture(session):
    """Alias fixture name expected by some integration tests."""
    return session

@pytest.fixture(name="test_user")
def test_user_fixture(session):
    """Create a test user and provide a JWT token for auth-protected endpoints."""
    user = User(email="test@example.com", hashed_password="irrelevant", role="user")
    session.add(user)
    session.commit()
    session.refresh(user)
    # generate a real JWT so security.get_current_user works
    token = create_access_token(user)
    # attach token attribute for convenience in tests
    setattr(user, "token", token)

    # Override auth dependency to always return this user when called by the app
    app.dependency_overrides[get_current_user] = lambda: user
    return user

# Export aliases for tests that import by name
test_db_session = test_db_session_fixture
test_user = test_user_fixture

@pytest.fixture(name="client")
def client_fixture(session):
    # Override DB dependency with the session-scoped SQLite
    def _override_db():
        try:
            yield session
        finally:
            session.close()
    app.dependency_overrides[get_db] = _override_db
    from fastapi.testclient import TestClient
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
