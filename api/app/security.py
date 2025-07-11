import os
from datetime import datetime, timedelta
import bcrypt
import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_access_token(sub: str, scope: str = "user") -> str:
    now = datetime.utcnow()
    payload = {
        "sub": sub,
        "iat": now,
        "exp": now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
        "scope": scope,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
