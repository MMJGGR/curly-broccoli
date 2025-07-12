from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, Any, Optional

@dataclass
class User:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    email: str = ""
    password_hash: str = ""
    profile: 'UserProfile' | None = None

@dataclass
class UserProfile:
    user_id: str
    dob: date
    kra_pin: str
    annual_income: float
    dependents: int = 0
    goals: Dict[str, Any] = field(default_factory=dict)
    risk_score: Optional[float] = None
    user: User | None = None
