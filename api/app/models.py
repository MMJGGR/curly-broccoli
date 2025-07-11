import uuid
from sqlalchemy import Column, String, Boolean, DateTime, Enum, Integer, Numeric, ForeignKey
from .encryption import EncryptedString
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    mfa_enabled = Column(Boolean, default=False)

    profile = relationship("UserProfile", back_populates="user", uselist=False)
    dependents = relationship("Dependent", back_populates="user")


class UserProfile(Base):
    __tablename__ = "user_profiles"

    user_id = Column(String(36), ForeignKey("users.id"), primary_key=True)
    full_name = Column(EncryptedString(255), nullable=False)
    date_of_birth = Column(EncryptedString(32), nullable=False)
    id_type = Column(Enum("ID", "Passport", name="id_type"), nullable=False)
    id_number = Column(EncryptedString(64), nullable=False)
    kra_pin = Column(EncryptedString(20), nullable=False)
    marital_status = Column(Enum("Single", "Married", "Divorced", "Widowed", name="marital_status"))
    employment_status = Column(Enum("Employed", "Self-employed", "Unemployed", "Student", "Retired", name="employment_status"), nullable=False)
    # Store amounts as strings to preserve decimal precision in SQLite
    monthly_income_kes = Column(String, nullable=False)
    net_worth_estimate = Column(String)
    risk_tolerance_score = Column(Integer, nullable=False)
    retirement_age_goal = Column(Integer)
    investment_goals = Column(String)

    user = relationship("User", back_populates="profile")


class Dependent(Base):
    __tablename__ = "dependents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    relation_type = Column(Enum("Spouse", "Child", "Parent", "Other", name="relationship"), nullable=False)
    date_of_birth = Column(String, nullable=False)

    user = relationship("User", back_populates="dependents")
