from sqlalchemy import Column, Integer, String, Float, Date, JSON
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)

    profile = relationship("UserProfile", back_populates="user", uselist=False)

class UserProfile(Base):
    __tablename__ = "profiles"

    user_id = Column(String, sa.ForeignKey('users.id'), primary_key=True, index=True)
    dob = Column(Date)
    kra_pin = Column(String)
    annual_income = Column(Float)
    dependents = Column(Integer)
    goals = Column(JSON)
    questionnaire = Column(JSON)
    risk_score = Column(Integer)
    risk_level = Column(Integer)

    user = relationship("User", back_populates="profile")

import uuid
from datetime import date
from typing import Dict, Any, Optional
