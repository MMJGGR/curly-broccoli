import base64
import os
import datetime
from typing import Optional, Any
from sqlalchemy.types import TypeDecorator, String

_key_env = os.getenv("ENCRYPTION_KEY")
if _key_env:
    key = base64.urlsafe_b64decode(_key_env)
else:
    key = os.urandom(32)
    os.environ["ENCRYPTION_KEY"] = base64.urlsafe_b64encode(key).decode()

class EncryptedString(TypeDecorator):
    impl = String

    def process_bind_param(self, value: Optional[Any], dialect):
        if value is None:
            return value
        if isinstance(value, (datetime.date, datetime.datetime)):
            value = value.isoformat()
        data = str(value).encode("utf-8")
        enc = bytes(b ^ key[i % len(key)] for i, b in enumerate(data))
        return base64.b64encode(enc).decode()

    def process_result_value(self, value: Optional[str], dialect):
        if value is None:
            return value
        data = base64.b64decode(value)
        dec = bytes(b ^ key[i % len(key)] for i, b in enumerate(data))
        return dec.decode()
