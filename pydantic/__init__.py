from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, Type
import datetime

class BaseModel:
    def __init__(self, **data: Any):
        fields = getattr(self, '__annotations__', {})
        for name, typ in fields.items():
            value = data.get(name)
            if value is not None:
                if typ is datetime.date and isinstance(value, str):
                    value = datetime.date.fromisoformat(value)
            setattr(self, name, value)

    def dict(self, *, exclude_unset: bool = False) -> Dict[str, Any]:
        fields = getattr(self, '__annotations__', {})
        return {name: getattr(self, name) for name in fields}

    @classmethod
    def from_orm(cls: Type['BaseModel'], obj: Any) -> 'BaseModel':
        data = {name: getattr(obj, name) for name in cls.__annotations__ if hasattr(obj, name)}
        return cls(**data)

EmailStr = str

def constr(**kwargs):
    return str
