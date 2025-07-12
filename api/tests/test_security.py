import jwt

from app.security import (
    hash_password,
    verify_password,
    create_access_token,
    SECRET_KEY,
    ALGORITHM,
)


def test_password_hash_and_verify():
    hashed = hash_password("secret")
    assert hashed != "secret"
    assert verify_password("secret", hashed)
    assert not verify_password("bad", hashed)


def test_create_access_token_contains_claims():
    token = create_access_token("user1")
    decoded = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert decoded["sub"] == "user1"
    assert decoded["scope"] == "user"
