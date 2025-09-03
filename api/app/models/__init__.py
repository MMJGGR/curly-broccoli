from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Float, JSON, Numeric, Text
from datetime import datetime
# Use JSON for portable storage of lists. ARRAY is not supported by SQLite,
# which is used in tests, so replacing ARRAY(Integer) with JSON ensures the
# models work across different databases.
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
    onboarding_state = relationship("OnboardingState", back_populates="owner", uselist=False)
    transactions = relationship("Transaction", back_populates="owner")
    milestones = relationship("Milestone", back_populates="owner")
    goals = relationship("Goal", back_populates="owner")
    accounts = relationship("Account", back_populates="owner")
    income_sources = relationship("IncomeSource", back_populates="owner")
    expense_categories = relationship("ExpenseCategory", back_populates="owner")
    assets = relationship("Asset", back_populates="owner")
    expenses = relationship("Expense", back_populates="owner")
    liabilities = relationship("Liability", back_populates="owner")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, index=True)
    last_name = Column(String, index=True)
    date_of_birth = Column(Date)
    nationalId = Column(String, index=True)
    kra_pin = Column(String, index=True)
    phone = Column(String, nullable=True)
    annual_income = Column(Float)
    monthly_income = Column(Float, nullable=True)  # CRITICAL: Missing field for budgets
    employment_status = Column(String)
    dependents = Column(Integer)
    goals = Column(JSON)  # Stored as JSON
    # Store questionnaire responses as JSON to maintain cross-database
    # compatibility (e.g. SQLite used in tests).
    questionnaire = Column(JSON)
    risk_score = Column(Integer)
    risk_level = Column(Integer)
    
    # CRITICAL: Missing financial fields used by Budget and Timeline
    monthly_expenses = Column(Float, nullable=True)
    current_savings = Column(Float, nullable=True) 
    monthly_debt_payments = Column(Float, nullable=True)
    emergency_fund_target = Column(Float, nullable=True)
    retirement_age = Column(Integer, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Advisor-specific fields
    firm_name = Column(String, nullable=True, index=True)
    license_number = Column(String, nullable=True, index=True)
    professional_email = Column(String, nullable=True)
    service_model = Column(String, nullable=True)  # fee-only, commission, hybrid
    target_client_type = Column(String, nullable=True)  # high-net-worth, mass-affluent, etc.
    minimum_aum = Column(String, nullable=True)  # Minimum assets under management
    
    # Advanced Financial Planning Fields
    # Tax Planning Fields
    tax_filing_status = Column(String, nullable=True)  # Single, Married Filing Jointly, etc.
    estimated_annual_taxes = Column(Float, nullable=True)
    tax_deductions = Column(JSON, nullable=True)  # Store as JSON for flexibility
    
    # Insurance Planning Fields
    life_insurance_coverage = Column(Float, nullable=True)
    health_insurance_type = Column(String, nullable=True)
    insurance_beneficiaries = Column(JSON, nullable=True)
    
    # Retirement Planning Fields
    target_retirement_age = Column(Integer, nullable=True)
    expected_retirement_expenses = Column(Float, nullable=True)
    social_security_estimated = Column(Float, nullable=True)
    retirement_accounts = Column(JSON, nullable=True)  # Store retirement account details
    
    # Estate Planning Fields
    will_status = Column(String, nullable=True)  # None, Basic, Comprehensive
    beneficiaries = Column(JSON, nullable=True)
    power_of_attorney = Column(String, nullable=True)
    
    # Advanced Investment Data
    investment_experience = Column(String, nullable=True)  # Beginner, Intermediate, Advanced
    investment_preferences = Column(JSON, nullable=True)
    risk_capacity = Column(Integer, nullable=True)  # 1-10 scale

    owner = relationship("User", back_populates="profile")

class RiskProfile(Base):
    __tablename__ = "risk_profiles"

    id = Column(Integer, primary_key=True, index=True)
    questionnaire_answers = Column(String) # Store as JSON string or similar
    risk_score = Column(Integer)
    risk_level = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="risk_profile")


class OnboardingState(Base):
    """Tracks user onboarding progress with step-by-step data persistence"""
    __tablename__ = "onboarding_states"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, index=True)
    
    # Step tracking
    current_step = Column(Integer, default=1)  # Current onboarding step (1-5)
    completed_steps = Column(JSON, default=lambda: [])  # List of completed step numbers
    is_complete = Column(Boolean, default=False)
    
    # Step-wise data storage (JSON for flexibility)
    personal_data = Column(JSON, nullable=True)  # Step 1: Personal info including phone
    risk_data = Column(JSON, nullable=True)      # Step 2: Risk questionnaire responses
    financial_data = Column(JSON, nullable=True) # Step 3: Income and expense data
    goals_data = Column(JSON, nullable=True)     # Step 4: Financial goals
    preferences_data = Column(JSON, nullable=True) # Step 5: Additional preferences
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    owner = relationship("User", back_populates="onboarding_state")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    account_number = Column(String, nullable=True)  # Masked account number
    type = Column(String)  # checking, savings, credit, investment
    balance = Column(Float, default=0.0)
    institution_name = Column(String)
    institution_id = Column(String, nullable=True)  # For banking API integration
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)  # Last transaction sync
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="accounts")
    transactions = relationship("Transaction", back_populates="account_rel", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)  # Proper date type for filtering/sorting
    description = Column(String)
    amount = Column(Float)
    transaction_type = Column(String)  # debit, credit
    category = Column(String)
    subcategory = Column(String, nullable=True)
    merchant = Column(String, nullable=True)
    reference_id = Column(String, nullable=True)  # Bank reference ID
    is_reconciled = Column(Boolean, default=False)
    is_pending = Column(Boolean, default=False)
    notes = Column(String, nullable=True)
    import_source = Column(String, nullable=True)  # manual, csv, bank_api
    import_batch_id = Column(String, nullable=True)  # For tracking import batches
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"))
    account_id = Column(Integer, ForeignKey("accounts.id"))
    expense_category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="transactions")
    account_rel = relationship("Account", back_populates="transactions")
    expense_category_rel = relationship("ExpenseCategory")

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    age = Column(Integer)
    phase = Column(String)
    event = Column(String)
    assets = Column(Float)
    liabilities = Column(Float)
    net_worth = Column(Float)
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

class IncomeSource(Base):
    __tablename__ = "income_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    amount = Column(Float)
    frequency = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="income_sources")

class ExpenseCategory(Base):
    __tablename__ = "expense_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    budgeted_amount = Column(Float, default=0.0)
    actual_amount = Column(Float, default=0.0)  # Running total from transactions
    category_type = Column(String, default="expense")  # expense, income, transfer
    is_active = Column(Boolean, default=True)
    budget_period = Column(String, default="monthly")  # monthly, yearly
    parent_category_id = Column(Integer, ForeignKey("expense_categories.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    owner = relationship("User", back_populates="expense_categories")
    parent_category = relationship("ExpenseCategory", remote_side="ExpenseCategory.id", backref="subcategories")
    
    @property
    def variance(self):
        """Calculate budget variance (positive = under budget, negative = over budget)"""
        return self.budgeted_amount - self.actual_amount
    
    @property
    def variance_percentage(self):
        """Calculate variance as percentage"""
        if self.budgeted_amount == 0:
            return 0
        return (self.variance / self.budgeted_amount) * 100


class Asset(Base):
    """SQLAlchemy model for assets table"""
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    asset_type = Column(String(50), nullable=False, index=True)
    current_value = Column(Numeric(precision=15, scale=2), nullable=False)
    acquisition_cost = Column(Numeric(precision=15, scale=2), nullable=False)
    acquisition_date = Column(DateTime(timezone=True), nullable=False)
    useful_life_years = Column(Integer, nullable=True)
    related_liability_id = Column(Integer, nullable=True)
    description = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="assets")
    expenses = relationship("Expense", back_populates="related_asset", foreign_keys="Expense.related_asset_id")


class Expense(Base):
    """SQLAlchemy model for expenses table"""
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    description = Column(String(500), nullable=False)
    amount = Column(Numeric(precision=15, scale=2), nullable=False)
    expense_type = Column(String(50), nullable=False, index=True)
    expense_date = Column(DateTime(timezone=True), nullable=False, index=True)
    is_recurring = Column(Boolean, nullable=False, default=False, index=True)
    frequency_months = Column(Integer, nullable=True)
    related_asset_id = Column(Integer, ForeignKey("assets.id", ondelete="SET NULL"), nullable=True)
    vendor = Column(String(255), nullable=True)
    category_override = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="expenses")
    related_asset = relationship("Asset", back_populates="expenses", foreign_keys=[related_asset_id])


class Liability(Base):
    """SQLAlchemy model for liabilities table - Debt obligations tracking"""
    __tablename__ = "liabilities"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Basic liability information
    name = Column(String(255), nullable=False)
    liability_type = Column(String(50), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    
    # Financial details
    current_balance = Column(Numeric(precision=15, scale=2), nullable=False)
    original_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    minimum_payment = Column(Numeric(precision=15, scale=2), nullable=False)
    interest_rate = Column(Numeric(precision=8, scale=6), nullable=False)  # Store as decimal
    rate_type = Column(String(20), nullable=False, default="fixed")
    
    # Terms and timeline
    term_months = Column(Integer, nullable=True)
    remaining_payments = Column(Integer, nullable=True)
    payment_due_date = Column(Integer, nullable=True)  # Day of month
    maturity_date = Column(DateTime(timezone=True), nullable=True)
    
    # Collateral and security
    is_secured = Column(Boolean, nullable=False, default=False, index=True)
    collateral_description = Column(String(500), nullable=True)
    collateral_value = Column(Numeric(precision=15, scale=2), nullable=True)
    loan_to_value_ratio = Column(Numeric(precision=5, scale=4), nullable=True)
    
    # Credit information (for revolving credit)
    credit_limit = Column(Numeric(precision=15, scale=2), nullable=True)
    available_credit = Column(Numeric(precision=15, scale=2), nullable=True)
    
    # Status and performance
    is_active = Column(Boolean, nullable=False, default=True, index=True)
    is_in_default = Column(Boolean, nullable=False, default=False, index=True)
    days_past_due = Column(Integer, nullable=False, default=0)
    payment_history_score = Column(Numeric(precision=5, scale=4), nullable=True)
    
    # Professional notes and flags
    advisor_notes = Column(Text, nullable=True)
    consolidation_candidate = Column(Boolean, nullable=False, default=False)
    refinance_candidate = Column(Boolean, nullable=False, default=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    owner = relationship("User", back_populates="liabilities")


class FinancialRelationship(Base):
    """SQLAlchemy model for financial relationships between components"""
    __tablename__ = "financial_relationships"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Relationship definition
    relationship_type = Column(String(50), nullable=False, index=True)
    source_type = Column(String(50), nullable=False, index=True)
    source_id = Column(Integer, nullable=False, index=True)
    target_type = Column(String(50), nullable=False, index=True)
    target_id = Column(Integer, nullable=False, index=True)
    
    # Relationship parameters
    amount = Column(Numeric(precision=15, scale=2), nullable=True)
    percentage = Column(Numeric(precision=8, scale=6), nullable=True)
    frequency = Column(String(20), nullable=False, default="monthly")
    
    # Timeline
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    
    # Status and metadata
    status = Column(String(20), nullable=False, default="active", index=True)
    description = Column(String(500), nullable=True)
    relationship_metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=True)

    # Relationships
    owner = relationship("User", backref="financial_relationships")


# Import advanced financial modeling components
from .financial_modeling import (
    AssetReturnAssumption,
    UserAssetAssumptionOverride,
    LiabilityCostModel,
    UserLiabilityInstance,
    LiabilityPaymentHistory,
    UserFinancialAssumptions,
    PortfolioOptimizationResult
)
