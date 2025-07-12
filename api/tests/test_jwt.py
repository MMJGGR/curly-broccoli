import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
from app.security import create_access_token, SECRET_KEY, ALGORITHM
import jwt


def test_jwt_contains_scope_claim():
    token = create_access_token("user@example.com", scope="google")
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["scope"] == "google"
