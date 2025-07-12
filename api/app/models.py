import uuid
from sqlalchemy import (
    Column,
    String,
    Date,
    Integer,
    Numeric,
    JSON,
    ForeignKey,
)
from sqlalchemy.orm import relationship

from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

    profile = relationship("UserProfile", back_populates="user")


class UserProfile(Base):
    __tablename__ = "profiles"

    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    dob = Column(Date, nullable=False)
    kra_pin = Column(String(20), nullable=False)
    annual_income = Column(Numeric(12, 2), nullable=False)
    dependents = Column(Integer, default=0, nullable=False)
    goals = Column(JSON, nullable=False)
    risk_score = Column(Numeric(4, 2), nullable=True)

    user = relationship("User", back_populates="profile")


