"""
Liability Domain Entity - CFA-Compliant Debt Tracking
Complete debt obligations tracking with secured/unsecured categorization
"""
from enum import Enum
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional

from .money import Money


class LiabilityType(Enum):
    """Liability types for proper debt categorization"""
    # Secured Debt (Collateralized)
    MORTGAGE_PRIMARY = "mortgage_primary"
    MORTGAGE_INVESTMENT = "mortgage_investment"
    HOME_EQUITY_LINE = "home_equity_line"
    AUTO_LOAN = "auto_loan"
    SECURED_BUSINESS_LOAN = "secured_business_loan"
    
    # Unsecured Debt
    CREDIT_CARD = "credit_card"
    PERSONAL_LOAN = "personal_loan"
    STUDENT_LOAN = "student_loan"
    UNSECURED_BUSINESS_LOAN = "unsecured_business_loan"
    MEDICAL_DEBT = "medical_debt"
    
    # Short-term Obligations
    UTILITIES = "utilities"
    TAX_OWED = "tax_owed"
    RENT_PAYABLE = "rent_payable"
    
    # Investment/Business Liabilities
    MARGIN_DEBT = "margin_debt"
    BUSINESS_PAYABLE = "business_payable"
    
    # Other Liabilities
    LEGAL_JUDGMENT = "legal_judgment"
    OTHER = "other"


class LiabilityCategory(Enum):
    """CFA-standard liability categories for balance sheet classification"""
    CURRENT_LIABILITIES = "current_liabilities"      # Due within 1 year
    LONG_TERM_LIABILITIES = "long_term_liabilities"  # Due after 1 year
    SECURED_LIABILITIES = "secured_liabilities"      # Backed by collateral
    UNSECURED_LIABILITIES = "unsecured_liabilities"  # No collateral


class InterestRateType(Enum):
    """Interest rate structure for liability calculations"""
    FIXED = "fixed"              # Fixed rate throughout term
    VARIABLE = "variable"        # Variable/adjustable rate
    PROMOTIONAL = "promotional"  # Temporary promotional rate


@dataclass(frozen=True)
class Liability:
    """
    Domain entity representing a financial liability/debt obligation
    CFA-compliant debt tracking with proper categorization and valuation
    """
    # Core Identity
    liability_id: str
    user_id: int
    
    # Liability Details
    name: str                    # e.g., "Chase Freedom Credit Card", "Primary Mortgage"
    liability_type: LiabilityType
    category: LiabilityCategory
    
    # Financial Information
    current_balance: Money       # Current outstanding balance
    original_amount: Money       # Original loan/credit amount
    minimum_payment: Money       # Minimum monthly payment required
    interest_rate: Decimal       # Annual interest rate (as decimal: 0.1875 = 18.75%)
    rate_type: InterestRateType  # Fixed, variable, or promotional
    
    # Metadata - Required fields (must come before optional fields)
    created_at: datetime
    updated_at: datetime
    
    # Terms & Timeline - Optional fields with defaults
    term_months: Optional[int] = None        # Loan term in months (None for revolving credit)
    remaining_payments: Optional[int] = None  # Payments remaining
    payment_due_date: Optional[int] = None   # Day of month payment is due
    maturity_date: Optional[datetime] = None # Final payment date
    
    # Collateral & Security (for secured debts)
    is_secured: bool = False
    collateral_description: Optional[str] = None  # "2018 Honda Civic", "Primary Residence"
    collateral_value: Optional[Money] = None      # Current collateral value
    loan_to_value_ratio: Optional[Decimal] = None # Current LTV ratio
    
    # Credit Information
    credit_limit: Optional[Money] = None      # For credit cards/lines of credit
    available_credit: Optional[Money] = None  # Remaining available credit
    
    # Status & Performance - Optional fields with defaults
    is_active: bool = True
    is_in_default: bool = False
    days_past_due: int = 0
    payment_history_score: Optional[Decimal] = None  # Performance metric
    
    # Professional Notes
    advisor_notes: Optional[str] = None
    consolidation_candidate: bool = False     # Flag for debt consolidation review
    refinance_candidate: bool = False         # Flag for refinancing review
    
    def __post_init__(self):
        """Validate liability data integrity"""
        # Ensure current balance doesn't exceed original amount for fixed loans
        if (self.liability_type not in [LiabilityType.CREDIT_CARD, LiabilityType.HOME_EQUITY_LINE] 
            and self.current_balance.amount > self.original_amount.amount):
            raise ValueError("Current balance cannot exceed original amount for fixed loans")
        
        # Validate secured debt has collateral information
        if self.is_secured and not self.collateral_description:
            raise ValueError("Secured liability must have collateral description")
        
        # Validate credit utilization for revolving credit
        if self.credit_limit and self.current_balance.amount > self.credit_limit.amount:
            raise ValueError("Current balance cannot exceed credit limit")
        
        # Ensure interest rate is reasonable
        if self.interest_rate < 0 or self.interest_rate > Decimal('0.50'):  # 50% max
            raise ValueError("Interest rate must be between 0% and 50%")
    
    @property
    def monthly_payment(self) -> Money:
        """Calculate standard monthly payment"""
        # For revolving credit, return minimum payment
        if self.liability_type in [LiabilityType.CREDIT_CARD, LiabilityType.HOME_EQUITY_LINE]:
            return self.minimum_payment
        
        # For fixed loans, calculate payment using standard formula
        if self.term_months and self.term_months > 0:
            monthly_rate = self.interest_rate / 12
            if monthly_rate == 0:  # Zero interest loan
                return Money(self.current_balance.amount / self.term_months, self.current_balance.currency)
            
            # Standard loan payment formula: P = L[c(1 + c)^n]/[(1 + c)^n - 1]
            factor = (1 + monthly_rate) ** self.term_months
            payment_amount = self.current_balance.amount * (monthly_rate * factor) / (factor - 1)
            return Money(payment_amount, self.current_balance.currency)
        
        return self.minimum_payment
    
    @property
    def debt_to_income_impact(self) -> Decimal:
        """Calculate debt service impact for DTI calculations"""
        return self.monthly_payment.amount
    
    @property
    def credit_utilization_ratio(self) -> Optional[Decimal]:
        """Calculate credit utilization for revolving credit"""
        if not self.credit_limit:
            return None
        
        if self.credit_limit.amount == 0:
            return Decimal('1.0')  # 100% if no available credit
        
        return self.current_balance.amount / self.credit_limit.amount
    
    @property
    def is_high_interest(self) -> bool:
        """Flag high-interest debt for prioritization"""
        HIGH_INTEREST_THRESHOLD = Decimal('0.15')  # 15% APR
        return self.interest_rate > HIGH_INTEREST_THRESHOLD
    
    @property
    def payoff_timeline_months(self) -> Optional[int]:
        """Estimate months to payoff at minimum payment (credit cards)"""
        if self.liability_type != LiabilityType.CREDIT_CARD:
            return self.remaining_payments
        
        if self.minimum_payment.amount <= 0:
            return None  # Cannot calculate without payment
        
        # Simple estimation for credit card payoff
        monthly_rate = self.interest_rate / 12
        if monthly_rate == 0:
            return int(self.current_balance.amount / self.minimum_payment.amount)
        
        # More complex calculation for interest-bearing debt
        payment = self.minimum_payment.amount
        balance = self.current_balance.amount
        
        if payment <= balance * monthly_rate:
            return None  # Payment doesn't cover interest - never pays off
        
        # Calculate months using logarithmic formula
        import math
        months = -math.log(1 - (balance * monthly_rate / payment)) / math.log(1 + monthly_rate)
        return int(math.ceil(months))
    
    @property
    def is_temporal_liability(self) -> bool:
        """
        Determine if liability has temporal characteristics requiring finite payment periods.
        
        CFA Institute Standard: Proper classification of finite vs infinite payment streams
        """
        # Finite payment liabilities with defined end dates
        finite_liability_types = {
            LiabilityType.MORTGAGE_PRIMARY,
            LiabilityType.MORTGAGE_INVESTMENT,
            LiabilityType.AUTO_LOAN,
            LiabilityType.PERSONAL_LOAN,
            LiabilityType.STUDENT_LOAN,
            LiabilityType.SECURED_BUSINESS_LOAN,
            LiabilityType.UNSECURED_BUSINESS_LOAN
        }
        
        return (
            self.liability_type in finite_liability_types or
            self.maturity_date is not None or
            (self.remaining_payments is not None and self.remaining_payments > 0)
        )
    
    def calculate_lifetime_payment_pv(self, discount_rate: Decimal = Decimal('0.105')) -> Money:
        """
        Calculate present value of remaining liability payments.
        
        CFA-compliant methodology for temporal liability valuation in lifetime balance sheets.
        
        Args:
            discount_rate: Kenya-specific discount rate (default 10.5%)
            
        Returns:
            Money: Present value of future payments
        """
        if not self.is_temporal_liability:
            # Infinite payment liability (credit cards with minimum payments)
            # Use perpetuity formula with conservative assumptions
            monthly_discount = discount_rate / 12
            if monthly_discount == 0:
                return Money(self.monthly_payment.amount * 12 * 50, self.current_balance.currency)  # 50 years
            
            # Perpetuity PV = Payment / discount_rate (converted to annual)
            annual_payment = self.monthly_payment.amount * 12
            pv_amount = annual_payment / discount_rate
            return Money(pv_amount, self.current_balance.currency)
        
        # Finite payment liability - calculate based on actual payment schedule
        remaining_months = self.payoff_timeline_months or self.remaining_payments
        if not remaining_months:
            # Fallback: use current balance as proxy
            return self.current_balance
        
        # Calculate present value of payment stream
        monthly_discount = discount_rate / 12
        pv_payments = Decimal('0.00')
        
        for month in range(1, remaining_months + 1):
            # Standard payment amount
            payment_amount = self.monthly_payment.amount
            
            # Present value of this payment
            pv_factor = Decimal('1.0') / ((Decimal('1.0') + monthly_discount) ** month)
            pv_payments += payment_amount * pv_factor
        
        return Money(pv_payments, self.current_balance.currency)
    
    def get_category(self) -> LiabilityCategory:
        """Determine liability category based on type and terms"""
        # Current liabilities - due within 1 year
        current_types = [
            LiabilityType.CREDIT_CARD,
            LiabilityType.UTILITIES,
            LiabilityType.TAX_OWED,
            LiabilityType.RENT_PAYABLE,
            LiabilityType.MEDICAL_DEBT
        ]
        
        if self.liability_type in current_types:
            return LiabilityCategory.CURRENT_LIABILITIES
        
        # Check if remaining term is less than 1 year
        if self.remaining_payments and self.remaining_payments <= 12:
            return LiabilityCategory.CURRENT_LIABILITIES
        
        return LiabilityCategory.LONG_TERM_LIABILITIES


# Liability Classification Helpers
SECURED_LIABILITY_TYPES = {
    LiabilityType.MORTGAGE_PRIMARY,
    LiabilityType.MORTGAGE_INVESTMENT,
    LiabilityType.HOME_EQUITY_LINE,
    LiabilityType.AUTO_LOAN,
    LiabilityType.SECURED_BUSINESS_LOAN
}

HIGH_PRIORITY_PAYOFF_TYPES = {
    LiabilityType.CREDIT_CARD,
    LiabilityType.PERSONAL_LOAN,
    LiabilityType.MEDICAL_DEBT
}

# Factory function for common liability creation
def create_liability(
    liability_id: str,
    user_id: int,
    name: str,
    liability_type: LiabilityType,
    current_balance: Money,
    interest_rate: Decimal,
    **kwargs
) -> Liability:
    """Factory function to create liability with sensible defaults"""
    
    now = datetime.now(timezone.utc)
    
    # Determine category and security
    is_secured = liability_type in SECURED_LIABILITY_TYPES
    category = (LiabilityCategory.SECURED_LIABILITIES if is_secured 
               else LiabilityCategory.UNSECURED_LIABILITIES)
    
    # Set default minimum payment (2% of balance for credit cards)
    default_minimum = Money(
        current_balance.amount * Decimal('0.02'),
        current_balance.currency
    )
    
    return Liability(
        liability_id=liability_id,
        user_id=user_id,
        name=name,
        liability_type=liability_type,
        category=category,
        current_balance=current_balance,
        original_amount=kwargs.get('original_amount', current_balance),
        minimum_payment=kwargs.get('minimum_payment', default_minimum),
        interest_rate=interest_rate,
        rate_type=kwargs.get('rate_type', InterestRateType.FIXED),
        is_secured=is_secured,
        created_at=now,
        updated_at=now,
        **{k: v for k, v in kwargs.items() if k not in ['original_amount', 'minimum_payment', 'rate_type']}
    )