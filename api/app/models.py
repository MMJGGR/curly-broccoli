from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, Any, Optional
from .database import Base

@dataclass
class User:
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    email: str = ""
    password_hash: str = ""
    profile: 'UserProfile' | None = None

@dataclass
class UserProfile:
    __tablename__ = 'profiles'
    user_id: str = ""
    dob: date | None = None
    kra_pin: str = ""
    annual_income: float = 0.0
    dependents: int = 0
    goals: Dict[str, Any] = field(default_factory=dict)
    questionnaire: Any = field(default_factory=list)
    risk_score: Optional[int] = None
    risk_level: Optional[int] = None
