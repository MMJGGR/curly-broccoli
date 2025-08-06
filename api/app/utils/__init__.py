"""
Utility modules for the API
"""
from typing import Any, List


def normalize_questionnaire(raw: Any) -> List[int]:
    """Return a list of int responses regardless of input format."""
    if isinstance(raw, dict):
        try:
            items = sorted(raw.items(), key=lambda kv: int(kv[0]))
        except Exception:
            items = raw.items()
        return [int(v) for _, v in items]
    return [int(v) for v in raw]