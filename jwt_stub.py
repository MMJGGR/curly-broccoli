import base64
import json
import hmac
import hashlib
from typing import Any, Dict

class PyJWTError(Exception):
    pass

def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode()

def _b64decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def encode(payload: Dict[str, Any], key: str, algorithm: str = 'HS256') -> str:
    header = {'alg': algorithm, 'typ': 'JWT'}
    header_b64 = _b64encode(json.dumps(header).encode())
    payload_b64 = _b64encode(json.dumps(payload, default=str).encode())
    signing_input = f"{header_b64}.{payload_b64}".encode()
    signature = hmac.new(key.encode(), signing_input, hashlib.sha256).digest()
    signature_b64 = _b64encode(signature)
    return f"{header_b64}.{payload_b64}.{signature_b64}"

def decode(token: str, key: str, algorithms=None) -> Dict[str, Any]:
    try:
        header_b64, payload_b64, signature_b64 = token.split('.')
    except ValueError:
        raise PyJWTError('Invalid token')
    signing_input = f"{header_b64}.{payload_b64}".encode()
    expected = hmac.new(key.encode(), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(_b64decode(signature_b64), expected):
        raise PyJWTError('Invalid signature')
    payload = json.loads(_b64decode(payload_b64))
    return payload
