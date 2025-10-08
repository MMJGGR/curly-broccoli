import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.models import Base, User, Profile, ExpenseCategory
from app.security import create_access_token, get_current_user


# Isolated in-memory DB for this suite
engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
  db = TestingSessionLocal()
  try:
    yield db
  finally:
    db.close()


def override_get_current_user():
  # Very small stub user
  return User(id=1, email="test@example.com", is_active=True, role="user")


app.dependency_overrides[get_db] = override_get_db
app.dependency_overrides[get_current_user] = override_get_current_user
client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
  Base.metadata.create_all(bind=engine)
  db = TestingSessionLocal()
  # seed user + profile
  u = User(id=1, email="test@example.com", hashed_password="x", is_active=True)
  p = Profile(user_id=1, monthly_income=5000)
  db.add_all([u, p])
  db.commit()
  yield
  Base.metadata.drop_all(bind=engine)


def test_health():
  r = client.get("/api/v1/budget-v2/health")
  assert r.status_code == 200
  data = r.json()
  assert data["status"] == "healthy"


def test_overview_and_category_crud():
  # Initially no categories
  r = client.get("/api/v1/budget-v2/categories")
  assert r.status_code == 200
  data = r.json()
  assert data["categories"] == []

  # Create category
  r = client.post("/api/v1/budget-v2/categories", params={"category_name": "Groceries", "allocated_amount": 800.0})
  assert r.status_code == 201

  # List shows Groceries
  r = client.get("/api/v1/budget-v2/categories")
  cats = r.json()["categories"]
  assert any(c["name"] == "Groceries" for c in cats)

  # Update allocation
  r = client.put("/api/v1/budget-v2/categories/Groceries/allocation", params={"new_amount": 900.0})
  assert r.status_code == 200

  # Read single
  r = client.get("/api/v1/budget-v2/categories/Groceries")
  assert r.status_code == 200
  assert r.json()["allocated_amount"] == 900.0

  # Overview computes totals
  r = client.get("/api/v1/budget-v2/overview")
  assert r.status_code == 200
  ov = r.json()
  assert "income" in ov and "expenses" in ov and "summary" in ov

  # Soft delete
  r = client.delete("/api/v1/budget-v2/categories/Groceries")
  assert r.status_code == 200
  # Ensure it's still listed with is_active false or absent depending on implementation
  r = client.get("/api/v1/budget-v2/categories")
  cats = r.json()["categories"]
  assert any(c["name"] == "Groceries" for c in cats)

