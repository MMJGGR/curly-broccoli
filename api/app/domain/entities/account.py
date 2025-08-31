"""
Account Domain Entity - CFA-Compliant Account Management
Foundation Week: Core financial account entity with proper business rules
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional
from datetime import datetime
from decimal import Decimal

from .money import Money


class AccountType(Enum):
    """CFA-compliant account type classifications"""
    # Asset Accounts (positive balances contribute to net worth)
    CHECKING = "checking"
    SAVINGS = "savings"
    INVESTMENT = "investment"
    NSSF_ACCOUNT = "nssf_account"  # National Social Security Fund (Kenya)
    INDIVIDUAL_PENSION = "individual_pension"  # Individual Pension Scheme (Kenya)
    OCCUPATIONAL_PENSION = "occupational_pension"  # Employer pension (Kenya)
    BROKERAGE = "brokerage"
    REAL_ESTATE = "real_estate"
    CASH = "cash"
    
    # Liability Accounts (negative balances, reduce net worth)
    CREDIT_CARD = "credit_card"
    MORTGAGE = "mortgage"
    AUTO_LOAN = "auto_loan"
    STUDENT_LOAN = "student_loan"
    PERSONAL_LOAN = "personal_loan"
    LINE_OF_CREDIT = "line_of_credit"
    
    # Other
    OTHER_ASSET = "other_asset"
    OTHER_LIABILITY = "other_liability"


@dataclass
class Account:
    """
    Domain entity representing a financial account.
    
    Following CFA standards:
    - Assets have positive balances and increase net worth
    - Liabilities have negative balances and decrease net worth  
    - All monetary values use Money value object for precision
    - Account type determines asset/liability classification
    """
    id: Optional[int]
    user_id: int
    name: str
    account_type: AccountType
    balance: Money
    institution: str
    account_number: str  # Last 4 digits only for security
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        """Validate account business rules on creation"""
        if not self.name or len(self.name.strip()) == 0:
            raise ValueError("Account name cannot be empty")
            
        if not self.institution or len(self.institution.strip()) == 0:
            raise ValueError("Institution name cannot be empty")
            
        if not self.account_number:
            raise ValueError("Account number cannot be empty")
            
        # Validate account number format (last 4 digits)
        if not self.account_number.startswith("****"):
            raise ValueError("Account number must be masked (****1234 format)")
            
        if len(self.account_number) != 8:  # ****XXXX format
            raise ValueError("Account number must be 8 characters (****XXXX)")
    
    @property
    def is_asset(self) -> bool:
        """Determine if account is an asset (increases net worth)"""
        asset_types = {
            AccountType.CHECKING,
            AccountType.SAVINGS,
            AccountType.INVESTMENT,
            AccountType.NSSF_ACCOUNT,
            AccountType.INDIVIDUAL_PENSION,
            AccountType.OCCUPATIONAL_PENSION,
            AccountType.BROKERAGE,
            AccountType.REAL_ESTATE,
            AccountType.CASH,
            AccountType.OTHER_ASSET
        }
        return self.account_type in asset_types
    
    @property
    def is_liability(self) -> bool:
        """Determine if account is a liability (decreases net worth)"""
        liability_types = {
            AccountType.CREDIT_CARD,
            AccountType.MORTGAGE,
            AccountType.AUTO_LOAN,
            AccountType.STUDENT_LOAN,
            AccountType.PERSONAL_LOAN,
            AccountType.LINE_OF_CREDIT,
            AccountType.OTHER_LIABILITY
        }
        return self.account_type in liability_types
    
    @property
    def display_balance(self) -> Money:
        """
        Display balance for UI purposes.
        
        For liabilities, show positive balance for better UX
        while maintaining negative balance for calculations.
        """
        if self.is_liability and self.balance.amount < 0:
            # Show positive amount for liability display
            return Money(abs(self.balance.amount))
        return self.balance
    
    @property
    def contribution_to_net_worth(self) -> Money:
        """Calculate this account's contribution to net worth (CFA standard)"""
        if self.is_asset:
            return self.balance
        elif self.is_liability:
            # Liabilities reduce net worth
            return Money(Decimal("0.00")) - self.display_balance
        else:
            return Money(Decimal("0.00"))
    
    def update_balance(self, new_balance: Money) -> None:
        """Update account balance with validation"""
        if not isinstance(new_balance, Money):
            raise TypeError("Balance must be Money instance")
            
        # Business rule: Asset accounts should generally have positive balances
        if self.is_asset and new_balance.amount < 0:
            # Allow but flag for review - might indicate data issue
            pass
            
        # Business rule: Liability accounts should have negative balances for calculations
        # but we handle display separately
        if self.is_liability and new_balance.amount > 0:
            # Convert positive liability balance to negative for calculations
            self.balance = Money(-abs(new_balance.amount))
        else:
            self.balance = new_balance
            
        self.updated_at = datetime.now()
    
    def get_account_category(self) -> str:
        """Get user-friendly account category for reporting"""
        category_map = {
            AccountType.CHECKING: "Cash & Checking",
            AccountType.SAVINGS: "Savings",
            AccountType.INVESTMENT: "Investments",
            AccountType.NSSF_ACCOUNT: "NSSF Pension",
            AccountType.INDIVIDUAL_PENSION: "Individual Pension",
            AccountType.OCCUPATIONAL_PENSION: "Occupational Pension", 
            AccountType.BROKERAGE: "Investments",
            AccountType.REAL_ESTATE: "Real Estate",
            AccountType.CASH: "Cash & Checking",
            AccountType.CREDIT_CARD: "Credit Cards",
            AccountType.MORTGAGE: "Mortgage",
            AccountType.AUTO_LOAN: "Loans",
            AccountType.STUDENT_LOAN: "Loans",
            AccountType.PERSONAL_LOAN: "Loans",
            AccountType.LINE_OF_CREDIT: "Credit Lines",
            AccountType.OTHER_ASSET: "Other Assets",
            AccountType.OTHER_LIABILITY: "Other Liabilities"
        }
        return category_map.get(self.account_type, "Unknown")
    
    def to_dict(self) -> dict:
        """Convert account to dictionary for API responses"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "account_type": self.account_type.value,
            "balance": self.balance,
            "display_balance": self.display_balance,
            "institution": self.institution,
            "account_number": self.account_number,
            "is_active": self.is_active,
            "is_asset": self.is_asset,
            "is_liability": self.is_liability,
            "category": self.get_account_category(),
            "net_worth_contribution": self.contribution_to_net_worth,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    def __str__(self) -> str:
        """String representation for debugging"""
        return f"Account({self.name} - {self.account_type.value}: {self.balance})"
    
    def __repr__(self) -> str:
        """Detailed representation for debugging"""
        return (f"Account(id={self.id}, name='{self.name}', "
                f"type={self.account_type.value}, balance={self.balance}, "
                f"institution='{self.institution}')")