from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Float, JSON
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship, declarative_base


Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    role = Column(String, default="user")

    profile = relationship("Profile", back_populates="owner", uselist=False)
    risk_profile = relationship("RiskProfile", back_populates="owner")
    transactions = relationship("Transaction", back_populates="owner")
    milestones = relationship("Milestone", back_populates="owner")
    goals = relationship("Goal", back_populates="owner")
    accounts = relationship("Account", back_populates="owner")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    date_of_birth = Column(Date)
    kra_pin = Column(String, unique=True, index=True)
    annual_income = Column(Float)
    dependents = Column(Integer)
    goals = Column(JSON)  # Stored as JSON
    questionnaire = Column(ARRAY(Integer))  # Stored as ARRAY of Integers
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="profile")

class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(Integer, primary_key=True, index=True)
    questionnaire_answers = Column(String) # Store as JSON string or similar
    risk_score = Column(Integer)
    risk_level = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="risk_profile")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    balance = Column(Float)
    institution_name = Column(String) # Added based on PRD review
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account_rel")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(String) # Store as string for now, convert to DateTime later
    description = Column(String)
    amount = Column(Float)
    category = Column(String)
    account = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))

    owner = relationship("User", back_populates="transactions")
    account_rel = relationship("Account", back_populates="transactions")

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    phase = Column(String)
    event = Column(String)
    assets = Column(String)
    liabilities = Column(String)
    net_worth = Column(String)
    advice = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="milestones")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    target = Column(String)
    current = Column(String)
    progress = Column(Float)
    target_date = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="goals")
