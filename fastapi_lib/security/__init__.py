from __future__ import annotations
from typing import Any, Dict
from .. import Request

class OAuth2PasswordBearer:
    def __init__(self, tokenUrl: str = ""):
        self.tokenUrl = tokenUrl
    def __call__(self, request: Request) -> str:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            return auth.split(" ", 1)[1]
        return ""

class OAuth2PasswordRequestForm:
    def __init__(self, request: Request):
        self.username = request.data.get("username")
        self.password = request.data.get("password")
