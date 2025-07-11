import base64
import os
from typing import Optional

from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from sqlalchemy.types import TypeDecorator, String

_KEY = os.getenv("ENCRYPTION_KEY")
if _KEY:
    key = base64.urlsafe_b64decode(_KEY)
else:
    key = AESGCM.generate_key(bit_length=256)
    os.environ["ENCRYPTION_KEY"] = base64.urlsafe_b64encode(key).decode()

class EncryptedString(TypeDecorator):
    impl = String

    def process_bind_param(self, value: Optional[str], dialect):
        if value is None:
            return value
        aes = AESGCM(key)
        nonce = os.urandom(12)
        ct = aes.encrypt(nonce, value.encode(), None)
        return base64.b64encode(nonce + ct).decode()

    def process_result_value(self, value: Optional[str], dialect):
        if value is None:
            return value
        data = base64.b64decode(value)
        nonce = data[:12]
        ct = data[12:]
        aes = AESGCM(key)
        return aes.decrypt(nonce, ct, None).decode()
