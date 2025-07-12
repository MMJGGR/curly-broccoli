import datetime
from app.encryption import EncryptedString


def test_encrypt_date_values():
    enc = EncryptedString()
    data = datetime.date(2020, 1, 1)
    stored = enc.process_bind_param(data, None)
    result = enc.process_result_value(stored, None)
    assert result == "2020-01-01"
