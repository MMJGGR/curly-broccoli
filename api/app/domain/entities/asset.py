"""
Asset Domain Entity - Foundation Week Day 2
CFA-compliant asset tracking with proper categorization and valuation
"""
from enum import Enum
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional

from .money import Money


class AssetType(Enum):
    """Asset types for proper categorization and valuation"""
    # Current Assets (Liquid)
    CASH_EQUIVALENT = "cash_equivalent"
    CHECKING_ACCOUNT = "checking_account"
    SAVINGS_ACCOUNT = "savings_account"
    MONEY_MARKET = "money_market"
    CERTIFICATES_DEPOSIT = "certificates_deposit"
    
    # Investment Assets
    EQUITY_INVESTMENT = "equity_investment"
    BOND_INVESTMENT = "bond_investment"
    MUTUAL_FUNDS = "mutual_funds"
    ETF = "etf"
    RETIREMENT_401K = "retirement_401k"
    RETIREMENT_IRA = "retirement_ira"
    BROKERAGE_ACCOUNT = "brokerage_account"
    
    # Fixed Assets (Illiquid)
    REAL_ESTATE = "real_estate"
    VEHICLE = "vehicle"
    EQUIPMENT = "equipment"
    FURNITURE = "furniture"
    COLLECTIBLES = "collectibles"
    PRECIOUS_METALS = "precious_metals"
    
    # Other Assets
    INTELLECTUAL_PROPERTY = "intellectual_property"
    BUSINESS_OWNERSHIP = "business_ownership"
    OTHER = "other"


class AssetCategory(Enum):
    """CFA-standard asset categories for balance sheet classification"""
    CURRENT_ASSETS = "current_assets"          # Liquid within 1 year
    INVESTMENT_ASSETS = "investment_assets"    # Long-term investments
    FIXED_ASSETS = "fixed_assets"              # Property, plant, equipment
    INTANGIBLE_ASSETS = "intangible_assets"    # IP, goodwill, etc.


@dataclass
class Asset:
    """
    Asset domain entity representing user's wealth components.
    
    Following CFA standards for:
    - Asset categorization and valuation
    - Unrealized gain/loss calculation
    - Depreciation and appreciation tracking
    - Liquidity assessment
    """
    id: int
    user_id: int
    name: str
    asset_type: AssetType
    current_value: Money
    acquisition_cost: Money
    acquisition_date: datetime
    useful_life_years: Optional[int] = None
    related_liability_id: Optional[int] = None  # e.g., mortgage for property
    description: Optional[str] = None
    location: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        """Initialize calculated fields and validate data"""
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)
    
    @property
    def unrealized_gain_loss(self) -> Money:
        """
        Calculate unrealized gain or loss.
        
        Returns:
            Money: Positive for gains, negative for losses
        """
        return self.current_value.subtract(self.acquisition_cost)
    
    @property
    def gain_loss_percentage(self) -> Decimal:
        """
        Calculate gain/loss as percentage of acquisition cost.
        
        Returns:
            Decimal: Percentage gain/loss (e.g., 25.00 for 25%)
        """
        if self.acquisition_cost.is_zero():
            return Decimal("0.00")
        
        gain_loss = self.unrealized_gain_loss
        percentage = (gain_loss.amount / self.acquisition_cost.amount) * 100
        return percentage.quantize(Decimal('0.01'))
    
    def get_asset_category(self) -> AssetCategory:
        """
        Categorize asset according to CFA balance sheet standards.
        
        Returns:
            AssetCategory: Appropriate category for balance sheet
        """
        liquid_types = {
            AssetType.CASH_EQUIVALENT,
            AssetType.CHECKING_ACCOUNT,
            AssetType.SAVINGS_ACCOUNT,
            AssetType.MONEY_MARKET,
            AssetType.CERTIFICATES_DEPOSIT
        }
        
        investment_types = {
            AssetType.EQUITY_INVESTMENT,
            AssetType.BOND_INVESTMENT,
            AssetType.MUTUAL_FUNDS,
            AssetType.ETF,
            AssetType.RETIREMENT_401K,
            AssetType.RETIREMENT_IRA,
            AssetType.BROKERAGE_ACCOUNT
        }
        
        fixed_types = {
            AssetType.REAL_ESTATE,
            AssetType.VEHICLE,
            AssetType.EQUIPMENT,
            AssetType.FURNITURE,
            AssetType.COLLECTIBLES,
            AssetType.PRECIOUS_METALS
        }
        
        intangible_types = {
            AssetType.INTELLECTUAL_PROPERTY,
            AssetType.BUSINESS_OWNERSHIP
        }
        
        if self.asset_type in liquid_types:
            return AssetCategory.CURRENT_ASSETS
        elif self.asset_type in investment_types:
            return AssetCategory.INVESTMENT_ASSETS
        elif self.asset_type in fixed_types:
            return AssetCategory.FIXED_ASSETS
        elif self.asset_type in intangible_types:
            return AssetCategory.INTANGIBLE_ASSETS
        else:
            return AssetCategory.CURRENT_ASSETS  # Default
    
    @property
    def is_liquid(self) -> bool:
        """
        Determine if asset can be easily converted to cash.
        
        Returns:
            bool: True if liquid (convertible within 90 days)
        """
        liquid_types = {
            AssetType.CASH_EQUIVALENT,
            AssetType.CHECKING_ACCOUNT,
            AssetType.SAVINGS_ACCOUNT,
            AssetType.MONEY_MARKET,
            AssetType.CERTIFICATES_DEPOSIT,
            AssetType.MUTUAL_FUNDS,
            AssetType.ETF,
            AssetType.BROKERAGE_ACCOUNT
        }
        return self.asset_type in liquid_types
    
    @property
    def is_appreciating(self) -> bool:
        """
        Check if asset typically appreciates in value.
        
        Returns:
            bool: True if asset type typically appreciates
        """
        appreciating_types = {
            AssetType.REAL_ESTATE,
            AssetType.EQUITY_INVESTMENT,
            AssetType.MUTUAL_FUNDS,
            AssetType.ETF,
            AssetType.RETIREMENT_401K,
            AssetType.RETIREMENT_IRA,
            AssetType.COLLECTIBLES,
            AssetType.PRECIOUS_METALS,
            AssetType.INTELLECTUAL_PROPERTY,
            AssetType.BUSINESS_OWNERSHIP
        }
        return self.asset_type in appreciating_types
    
    @property
    def is_depreciating(self) -> bool:
        """
        Check if asset typically depreciates in value.
        
        Returns:
            bool: True if asset type typically depreciates
        """
        depreciating_types = {
            AssetType.VEHICLE,
            AssetType.EQUIPMENT,
            AssetType.FURNITURE
        }
        return self.asset_type in depreciating_types
    
    def calculate_annual_depreciation(self) -> Money:
        """
        Calculate annual straight-line depreciation.
        
        Returns:
            Money: Annual depreciation amount
        """
        if not self.is_depreciating or not self.useful_life_years:
            return Money.zero()
        
        depreciation_per_year = self.acquisition_cost.amount / self.useful_life_years
        return Money(depreciation_per_year.quantize(Decimal('0.01')))
    
    def calculate_book_value(self, as_of_date: Optional[datetime] = None) -> Money:
        """
        Calculate current book value considering depreciation.
        
        Args:
            as_of_date: Date to calculate book value for (default: now)
            
        Returns:
            Money: Current book value
        """
        if not self.is_depreciating or not self.useful_life_years:
            return self.acquisition_cost
        
        if as_of_date is None:
            as_of_date = datetime.now(timezone.utc)
        
        # Calculate years since acquisition
        years_owned = (as_of_date - self.acquisition_date).days / 365.25
        years_owned = min(years_owned, self.useful_life_years)  # Cap at useful life
        
        # Calculate accumulated depreciation
        annual_depreciation = self.calculate_annual_depreciation()
        accumulated_depreciation = annual_depreciation.multiply(years_owned)
        
        # Book value = Cost - Accumulated Depreciation
        book_value = self.acquisition_cost.subtract(accumulated_depreciation)
        return Money(max(book_value.amount, Decimal("0.00")))  # Cannot be negative
    
    @property
    def contribution_to_net_worth(self) -> Money:
        """
        Calculate asset's contribution to net worth.
        Uses current market value for net worth calculation.
        
        Returns:
            Money: Current market value contributing to net worth
        """
        return self.current_value
    
    def get_asset_allocation_weight(self, total_assets: Money) -> Decimal:
        """
        Calculate asset's weight in total portfolio.
        
        Args:
            total_assets: Total value of all assets
            
        Returns:
            Decimal: Percentage weight (0.00 to 100.00)
        """
        if total_assets.is_zero():
            return Decimal("0.00")
        
        weight = (self.current_value.amount / total_assets.amount) * 100
        return weight.quantize(Decimal('0.01'))
    
    @property
    def risk_level(self) -> str:
        """
        Assess risk level of asset type.
        
        Returns:
            str: Risk assessment (low, moderate, high)
        """
        low_risk_types = {
            AssetType.CASH_EQUIVALENT,
            AssetType.CHECKING_ACCOUNT,
            AssetType.SAVINGS_ACCOUNT,
            AssetType.MONEY_MARKET,
            AssetType.CERTIFICATES_DEPOSIT,
            AssetType.BOND_INVESTMENT
        }
        
        high_risk_types = {
            AssetType.EQUITY_INVESTMENT,
            AssetType.COLLECTIBLES,
            AssetType.PRECIOUS_METALS,
            AssetType.BUSINESS_OWNERSHIP,
            AssetType.INTELLECTUAL_PROPERTY
        }
        
        if self.asset_type in low_risk_types:
            return "low"
        elif self.asset_type in high_risk_types:
            return "high"
        else:
            return "moderate"
    
    def to_dict(self) -> dict:
        """Convert asset to dictionary for API serialization"""
        return {
            "id": self.id,
            "name": self.name,
            "asset_type": self.asset_type.value,
            "asset_category": self.get_asset_category().value,
            "current_value": self.current_value.to_dict(),
            "acquisition_cost": self.acquisition_cost.to_dict(),
            "unrealized_gain_loss": self.unrealized_gain_loss.to_dict(),
            "gain_loss_percentage": float(self.gain_loss_percentage),
            "is_liquid": self.is_liquid,
            "is_appreciating": self.is_appreciating,
            "is_depreciating": self.is_depreciating,
            "risk_level": self.risk_level,
            "acquisition_date": self.acquisition_date.isoformat(),
            "description": self.description,
            "location": self.location,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }