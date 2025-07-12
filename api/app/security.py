import os
from datetime import datetime, timedelta
from passlib.context import CryptContext
import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    return pwd_context.verify(password, hashed)


def create_access_token(sub: str, scope: str = "user") -> str:
    now = datetime.utcnow()
    payload = {
        "sub": sub,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "scope": scope,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
