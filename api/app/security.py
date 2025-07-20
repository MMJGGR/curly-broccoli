from __future__ import annotations
import os
import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from typing import Optional

import jwt
from fastapi import Depends, status
from api.app.core.exceptions import UnauthorizedException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User

SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

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

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = UnauthorizedException(
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user