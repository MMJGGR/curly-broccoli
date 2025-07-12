import base64
import os
import datetime

import pytest

from app.encryption import EncryptedString


def test_encrypted_string_roundtrip():
    key = b"0" * 32
    os.environ["ENCRYPTION_KEY"] = base64.urlsafe_b64encode(key).decode()
    field = EncryptedString()
    data = "secret-value"
    encrypted = field.process_bind_param(data, None)
    assert encrypted != data
    decrypted = field.process_result_value(encrypted, None)
    assert decrypted == data


def test_none_roundtrip():
    field = EncryptedString()
    assert field.process_bind_param(None, None) is None
    assert field.process_result_value(None, None) is None


def test_date_encodes_as_str():
    field = EncryptedString()
    dt = datetime.date(2020, 1, 1)
    encrypted = field.process_bind_param(dt, None)
    assert encrypted != dt.isoformat()
    decrypted = field.process_result_value(encrypted, None)
    assert decrypted == dt.isoformat()
