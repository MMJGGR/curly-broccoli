from __future__ import annotations
import uuid
from dataclasses import dataclass, field
from datetime import date
from typing import Dict, Any, Optional
from sqlalchemy import Column, String, Integer, Date, Numeric, JSON, ForeignKey
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
    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    dob = Column(Date, nullable=False)
    kra_pin        = Column(String(20), nullable=False)
    annual_income  = Column(Numeric(12,2), nullable=False)
    dependents     = Column(Integer,      nullable=False, default=0)
    goals          = Column(JSON,         nullable=False)
    questionnaire  = Column(JSON,         nullable=False)  # store [1,2,3...]
    risk_score     = Column(Integer,      nullable=True)
    risk_level     = Column(Integer,      nullable=True)
