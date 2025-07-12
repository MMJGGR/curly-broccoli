from __future__ import annotations
import os
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta

import jwt

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.sha256(salt + password.encode()).digest()
    return base64.b64encode(salt + digest).decode()


def verify_password(password: str, hashed: str) -> bool:
    data = base64.b64decode(hashed.encode())
    salt, digest = data[:16], data[16:]
    return hmac.compare_digest(digest, hashlib.sha256(salt + password.encode()).digest())


def create_access_token(sub: str, scope: str = "user") -> str:
    now = datetime.utcnow()
    payload = {
        "sub": sub,
        "iat": now.timestamp(),
        "exp": (now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp(),
        "scope": scope,
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
