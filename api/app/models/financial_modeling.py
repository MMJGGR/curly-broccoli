"""
CFA-Compliant Financial Modeling Database Schema Enhancements
Supports Kenya-specific return/risk modeling and advanced assumptions management
"""

from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, ForeignKey, Float, JSON, Numeric, Text, Index
from sqlalchemy.orm import relationship
from datetime import datetime
from . import Base

class AssetReturnAssumption(Base):
    """
    CFA-compliant return/risk assumptions for different asset classes
    Supports Kenya market-specific modeling with historical data integration
    """
    __tablename__ = "asset_return_assumptions"

    id = Column(Integer, primary_key=True, index=True)
    
    # Asset classification
    asset_type = Column(String(50), nullable=False, index=True)  # From KENYA_ASSET_CLASSES
    asset_category = Column(String(50), nullable=False, index=True)  # equities, fixed_income, etc.
    market_region = Column(String(20), default="kenya", index=True)
    
    # CFA-compliant return metrics
    expected_annual_return = Column(Numeric(precision=8, scale=6), nullable=False)  # Decimal format
    annual_volatility = Column(Numeric(precision=8, scale=6), nullable=False)  # Standard deviation
    sharpe_ratio = Column(Numeric(precision=8, scale=4), nullable=True)
    beta = Column(Numeric(precision=8, scale=4), nullable=True, default=1.0)
    
    # Risk metrics
    var_95 = Column(Numeric(precision=8, scale=6), nullable=True)  # 95% Value at Risk
    cvar_95 = Column(Numeric(precision=8, scale=6), nullable=True)  # Conditional VaR
    maximum_drawdown = Column(Numeric(precision=8, scale=6), nullable=True)
    
    # Kenya-specific factors
    inflation_correlation = Column(Numeric(precision=8, scale=6), nullable=True)
    currency_risk_factor = Column(Numeric(precision=8, scale=6), nullable=True)  # For USD exposure
    liquidity_score = Column(Numeric(precision=4, scale=3), nullable=False)  # 0-1 scale
    
    # Cost structure
    expense_ratio = Column(Numeric(precision=6, scale=5), nullable=True, default=0.0)  # Annual expense ratio
    management_fee = Column(Numeric(precision=6, scale=5), nullable=True, default=0.0)
    transaction_cost = Column(Numeric(precision=6, scale=5), nullable=True, default=0.0)
    
    # Investment constraints
    minimum_investment = Column(Numeric(precision=15, scale=2), nullable=True)
    maximum_single_position = Column(Numeric(precision=5, scale=4), nullable=True, default=1.0)  # % of portfolio
    
    # Tax implications (Kenya-specific)
    capital_gains_tax_rate = Column(Numeric(precision=5, scale=4), nullable=True, default=0.0)
    dividend_withholding_rate = Column(Numeric(precision=5, scale=4), nullable=True, default=0.0)
    interest_withholding_rate = Column(Numeric(precision=5, scale=4), nullable=True, default=0.0)
    is_tax_advantaged = Column(Boolean, default=False)  # For retirement accounts
    
    # Correlation matrix (stored as JSON)
    correlations = Column(JSON, nullable=True)  # {"bonds": 0.2, "real_estate": 0.3, etc.}
    
    # Historical performance data
    historical_returns = Column(JSON, nullable=True)  # Array of annual returns
    performance_attribution = Column(JSON, nullable=True)  # Factor decomposition
    
    # Regulatory and compliance
    cfa_compliance_level = Column(String(20), default="full")  # full, partial, custom
    regulatory_classification = Column(String(50), nullable=True)  # CMA, CBK, etc.
    
    # Metadata
    data_source = Column(String(100), nullable=True)  # NSE, Bloomberg, Reuters, etc.
    last_updated = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_active = Column(Boolean, default=True, index=True)
    confidence_interval = Column(Numeric(precision=5, scale=4), default=0.95)
    
    # Relationships
    user_overrides = relationship("UserAssetAssumptionOverride", back_populates="base_assumption")
    
    # Indexes for performance
    __table_args__ = (
        Index('idx_asset_type_region', 'asset_type', 'market_region'),
        Index('idx_category_active', 'asset_category', 'is_active'),
    )


class UserAssetAssumptionOverride(Base):
    """
    User-specific overrides for asset return assumptions
    Supports custom CFA-compliant assumptions while maintaining base models
    """
    __tablename__ = "user_asset_assumption_overrides"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    base_assumption_id = Column(Integer, ForeignKey("asset_return_assumptions.id"), nullable=False)
    
    # Override fields (only store what user changes)
    expected_annual_return = Column(Numeric(precision=8, scale=6), nullable=True)
    annual_volatility = Column(Numeric(precision=8, scale=6), nullable=True)
    liquidity_score = Column(Numeric(precision=4, scale=3), nullable=True)
    
    # Risk tolerance adjustments
    personal_risk_multiplier = Column(Numeric(precision=5, scale=4), default=1.0)
    confidence_level = Column(Numeric(precision=5, scale=4), default=0.95)
    
    # Custom correlations
    correlation_overrides = Column(JSON, nullable=True)
    
    # Justification and notes
    override_reason = Column(String(500), nullable=True)
    advisor_notes = Column(Text, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    user = relationship("User")
    base_assumption = relationship("AssetReturnAssumption", back_populates="user_overrides")


class LiabilityCostModel(Base):
    """
    CFA-compliant liability cost modeling for Kenya debt instruments
    Supports comprehensive debt analysis and optimization
    """
    __tablename__ = "liability_cost_models"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Liability classification
    liability_type = Column(String(50), nullable=False, index=True)  # From KENYA_LIABILITY_TYPES
    liability_category = Column(String(50), nullable=False, index=True)
    market_segment = Column(String(30), default="kenyan_banking", index=True)
    
    # Rate structure
    base_interest_rate = Column(Numeric(precision=8, scale=6), nullable=False)
    credit_spread = Column(Numeric(precision=8, scale=6), nullable=False, default=0.0)
    rate_type = Column(String(20), nullable=False)  # fixed, variable, hybrid
    
    # Terms and structure
    typical_term_months = Column(Integer, nullable=True)
    minimum_term_months = Column(Integer, nullable=True)
    maximum_term_months = Column(Integer, nullable=True)
    
    # Cost components
    processing_fee_rate = Column(Numeric(precision=6, scale=5), nullable=False, default=0.0)
    annual_fee = Column(Numeric(precision=10, scale=2), nullable=True, default=0.0)
    early_payment_penalty_rate = Column(Numeric(precision=6, scale=5), nullable=True, default=0.0)
    
    # Ongoing costs (stored as JSON for flexibility)
    ongoing_costs = Column(JSON, nullable=True)  # {"insurance": 0.02, "administration": 0.01}
    
    # Risk factors
    default_probability = Column(Numeric(precision=6, scale=5), nullable=False)
    recovery_rate = Column(Numeric(precision=5, scale=4), nullable=False, default=0.5)
    
    # Collateral requirements (for secured debt)
    collateral_requirement_ratio = Column(Numeric(precision=5, scale=4), nullable=True)
    collateral_depreciation_rate = Column(Numeric(precision=6, scale=5), nullable=True)
    loan_to_value_max = Column(Numeric(precision=5, scale=4), nullable=True)
    
    # Tax implications
    interest_tax_deductible = Column(Boolean, default=False)
    deductibility_limit = Column(Numeric(precision=15, scale=2), nullable=True)
    
    # Market data
    market_benchmark_spread = Column(Numeric(precision=8, scale=6), nullable=True)
    peer_average_rate = Column(Numeric(precision=8, scale=6), nullable=True)
    
    # Refinancing metrics
    prepayment_option = Column(Boolean, default=True)
    refinancing_break_even = Column(Numeric(precision=6, scale=5), nullable=True)
    
    # Metadata
    data_source = Column(String(100), nullable=True)  # CBK, CRB, bank surveys
    last_market_update = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True, index=True)
    
    # Relationships
    user_liability_instances = relationship("UserLiabilityInstance", back_populates="cost_model")


class UserLiabilityInstance(Base):
    """
    User-specific liability instances with actual terms and performance tracking
    Links to cost models while storing actual user debt details
    """
    __tablename__ = "user_liability_instances"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    cost_model_id = Column(Integer, ForeignKey("liability_cost_models.id"), nullable=False)
    
    # Actual liability details
    principal_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    current_balance = Column(Numeric(precision=15, scale=2), nullable=False)
    actual_interest_rate = Column(Numeric(precision=8, scale=6), nullable=False)
    actual_term_months = Column(Integer, nullable=False)
    
    # Payment tracking
    monthly_payment = Column(Numeric(precision=15, scale=2), nullable=False)
    payments_made = Column(Integer, default=0)
    payments_remaining = Column(Integer, nullable=False)
    
    # Performance metrics
    total_interest_paid = Column(Numeric(precision=15, scale=2), default=0)
    total_fees_paid = Column(Numeric(precision=15, scale=2), default=0)
    effective_apr = Column(Numeric(precision=8, scale=6), nullable=True)
    
    # Status and health
    payment_status = Column(String(20), default="current")  # current, late, default
    days_past_due = Column(Integer, default=0)
    payment_history_score = Column(Numeric(precision=5, scale=4), nullable=True, default=1.0)
    
    # Optimization tracking
    refinancing_analyzed = Column(Boolean, default=False)
    potential_savings = Column(Numeric(precision=15, scale=2), nullable=True)
    optimization_recommendations = Column(JSON, nullable=True)
    
    # Collateral (for secured debt)
    collateral_value = Column(Numeric(precision=15, scale=2), nullable=True)
    current_ltv = Column(Numeric(precision=5, scale=4), nullable=True)
    
    # Dates
    origination_date = Column(DateTime, nullable=False)
    maturity_date = Column(DateTime, nullable=False)
    last_payment_date = Column(DateTime, nullable=True)
    next_payment_date = Column(DateTime, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True, index=True)
    
    # Relationships
    user = relationship("User")
    cost_model = relationship("LiabilityCostModel", back_populates="user_liability_instances")
    payment_history = relationship("LiabilityPaymentHistory", back_populates="liability")


class LiabilityPaymentHistory(Base):
    """
    Detailed payment tracking for liability analysis and performance metrics
    """
    __tablename__ = "liability_payment_history"
    
    id = Column(Integer, primary_key=True, index=True)
    liability_instance_id = Column(Integer, ForeignKey("user_liability_instances.id"), nullable=False)
    
    # Payment details
    payment_date = Column(Date, nullable=False, index=True)
    payment_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    principal_portion = Column(Numeric(precision=15, scale=2), nullable=False)
    interest_portion = Column(Numeric(precision=15, scale=2), nullable=False)
    fees_portion = Column(Numeric(precision=15, scale=2), default=0)
    
    # Balance after payment
    remaining_balance = Column(Numeric(precision=15, scale=2), nullable=False)
    
    # Payment status
    payment_method = Column(String(50), nullable=True)
    is_on_time = Column(Boolean, default=True)
    days_late = Column(Integer, default=0)
    
    # Additional charges
    late_fees = Column(Numeric(precision=15, scale=2), default=0)
    penalty_interest = Column(Numeric(precision=15, scale=2), default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    liability = relationship("UserLiabilityInstance", back_populates="payment_history")
    
    # Indexes
    __table_args__ = (
        Index('idx_liability_payment_date', 'liability_instance_id', 'payment_date'),
    )


class UserFinancialAssumptions(Base):
    """
    Advanced assumptions management for CFA-compliant financial planning
    Supports hybrid auto-save + user defaults approach
    """
    __tablename__ = "user_financial_assumptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Assumption profile
    profile_name = Column(String(100), nullable=False)
    profile_type = Column(String(50), default="custom")  # default, custom, advisor_recommended
    
    # Demographics assumptions
    demographics_assumptions = Column(JSON, nullable=False)
    # {
    #   "lifeExpectancy": 75,
    #   "retirementAge": 65, 
    #   "healthAdjustment": 2,
    #   "dependents": 2
    # }
    
    # Economic assumptions
    economic_assumptions = Column(JSON, nullable=False)
    # {
    #   "gdpGrowthRate": 0.055,
    #   "inflationVolatility": 0.15,
    #   "currencyStabilityFactor": 0.85
    # }
    
    # Career assumptions
    career_assumptions = Column(JSON, nullable=False)
    # {
    #   "incomeProgressionRate": 0.05,
    #   "jobChangeFrequency": 5,
    #   "industryStabilityScore": 0.80
    # }
    
    # Lifestyle assumptions
    lifestyle_assumptions = Column(JSON, nullable=False)
    # {
    #   "lifestyleInflationRate": 0.025,
    #   "discretionarySpendingGrowth": 0.035,
    #   "familySizeGrowthFactor": 1.0
    # }
    
    # Investment preferences
    investment_assumptions = Column(JSON, nullable=False)
    # {
    #   "riskTolerance": "moderate",
    #   "liquidityPreference": 0.25,
    #   "domesticBias": 0.70,
    #   "realEstateAllocation": 0.25
    # }
    
    # Rate assumptions
    rate_assumptions = Column(JSON, nullable=False)
    # {
    #   "incomeDiscountRate": 12.5,
    #   "expenseDiscountRate": 10.5,
    #   "incomeGrowthRate": 3.0,
    #   "expenseInflationRate": 5.5
    # }
    
    # Validation and compliance
    cfa_compliance_score = Column(Numeric(precision=5, scale=4), nullable=True)
    validation_errors = Column(JSON, nullable=True)
    validation_warnings = Column(JSON, nullable=True)
    
    # Usage tracking
    is_default = Column(Boolean, default=False, index=True)
    usage_count = Column(Integer, default=0)
    last_used = Column(DateTime, nullable=True)
    
    # Auto-save support
    session_id = Column(String(100), nullable=True, index=True)
    auto_saved_count = Column(Integer, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, onupdate=datetime.utcnow)
    is_active = Column(Boolean, default=True, index=True)
    
    # Relationships
    user = relationship("User")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_default', 'user_id', 'is_default'),
        Index('idx_user_active', 'user_id', 'is_active'),
    )


class PortfolioOptimizationResult(Base):
    """
    Store portfolio optimization results using CFA-compliant Modern Portfolio Theory
    Supports Kenya-specific optimization with multiple constraints
    """
    __tablename__ = "portfolio_optimization_results"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    assumptions_profile_id = Column(Integer, ForeignKey("user_financial_assumptions.id"), nullable=True)
    
    # Optimization parameters
    optimization_method = Column(String(50), default="mean_variance")  # mean_variance, black_litterman, etc.
    risk_tolerance = Column(String(20), nullable=False)  # conservative, moderate, aggressive
    target_return = Column(Numeric(precision=8, scale=6), nullable=True)
    target_volatility = Column(Numeric(precision=8, scale=6), nullable=True)
    
    # Constraints
    liquidity_requirement = Column(Numeric(precision=5, scale=4), nullable=False, default=0.2)
    max_single_asset = Column(Numeric(precision=5, scale=4), nullable=False, default=0.4)
    total_investment_amount = Column(Numeric(precision=15, scale=2), nullable=False)
    
    # Results - Asset allocations (stored as JSON)
    optimal_allocations = Column(JSON, nullable=False)
    # {"nse_large_cap": 0.30, "government_bonds": 0.25, "residential_property": 0.20, etc.}
    
    # Portfolio metrics
    expected_return = Column(Numeric(precision=8, scale=6), nullable=False)
    expected_volatility = Column(Numeric(precision=8, scale=6), nullable=False)
    sharpe_ratio = Column(Numeric(precision=8, scale=4), nullable=False)
    portfolio_beta = Column(Numeric(precision=8, scale=4), nullable=True, default=1.0)
    
    # Risk metrics
    var_95 = Column(Numeric(precision=8, scale=6), nullable=True)
    cvar_95 = Column(Numeric(precision=8, scale=6), nullable=True)
    maximum_drawdown = Column(Numeric(precision=8, scale=6), nullable=True)
    
    # Diversification metrics
    diversification_ratio = Column(Numeric(precision=8, scale=4), nullable=True)
    concentration_index = Column(Numeric(precision=8, scale=4), nullable=True)  # Herfindahl index
    
    # Performance projections (stored as JSON)
    performance_projections = Column(JSON, nullable=True)
    # {"1_year": {"low": 0.05, "expected": 0.12, "high": 0.19}, ...}
    
    # Alternative portfolios (for comparison)
    efficient_frontier = Column(JSON, nullable=True)
    alternative_allocations = Column(JSON, nullable=True)
    
    # Implementation details
    transaction_costs = Column(Numeric(precision=15, scale=2), nullable=True)
    tax_efficiency_score = Column(Numeric(precision=5, scale=4), nullable=True)
    rebalancing_frequency = Column(String(20), default="quarterly")
    
    # Metadata
    optimization_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    market_data_date = Column(DateTime, nullable=True)
    is_implemented = Column(Boolean, default=False)
    confidence_level = Column(Numeric(precision=5, scale=4), default=0.95)
    
    # Relationships
    user = relationship("User")
    assumptions_profile = relationship("UserFinancialAssumptions")
    
    # Indexes
    __table_args__ = (
        Index('idx_user_optimization_date', 'user_id', 'optimization_date'),
    )


# Additional indexes for performance optimization
Index('idx_asset_assumptions_lookup', 
      AssetReturnAssumption.asset_type, 
      AssetReturnAssumption.market_region, 
      AssetReturnAssumption.is_active)

Index('idx_liability_cost_lookup',
      LiabilityCostModel.liability_type,
      LiabilityCostModel.market_segment,
      LiabilityCostModel.is_active)

Index('idx_user_assumptions_active',
      UserFinancialAssumptions.user_id,
      UserFinancialAssumptions.is_active,
      UserFinancialAssumptions.is_default)