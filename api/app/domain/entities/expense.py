"""
Expense Domain Entity - Foundation Week Day 2
CFA-compliant expense tracking with proper categorization and budgeting
"""
from enum import Enum
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime, timezone
from typing import Optional

from .money import Money


class ExpenseType(Enum):
    """Detailed expense types for comprehensive tracking"""
    # Housing (Typically 25-30% of income)
    HOUSING = "housing"
    UTILITIES = "utilities"
    MAINTENANCE_REPAIRS = "maintenance_repairs"
    PROPERTY_TAX = "property_tax"
    HOME_INSURANCE = "home_insurance"
    
    # Transportation (Typically 15-20% of income)
    TRANSPORTATION = "transportation"
    VEHICLE_PAYMENT = "vehicle_payment"
    FUEL = "fuel"
    VEHICLE_INSURANCE = "vehicle_insurance"
    VEHICLE_MAINTENANCE = "vehicle_maintenance"
    PUBLIC_TRANSPORT = "public_transport"
    
    # Food & Dining (Typically 10-15% of income)
    FOOD_DINING = "food_dining"
    GROCERIES = "groceries"
    RESTAURANTS = "restaurants"
    
    # Healthcare (Typically 5-10% of income)
    HEALTHCARE = "healthcare"
    HEALTH_INSURANCE = "health_insurance"
    MEDICAL_EXPENSES = "medical_expenses"
    DENTAL = "dental"
    VISION = "vision"
    PHARMACY = "pharmacy"
    
    # Insurance (Typically 5-10% of income)
    INSURANCE = "insurance"
    LIFE_INSURANCE = "life_insurance"
    DISABILITY_INSURANCE = "disability_insurance"
    
    # Debt Payments (Ideally <20% of income)
    DEBT_PAYMENT = "debt_payment"
    CREDIT_CARD = "credit_card"
    STUDENT_LOAN = "student_loan"
    PERSONAL_LOAN = "personal_loan"
    
    # Personal Care (Typically 2-5% of income)
    PERSONAL_CARE = "personal_care"
    CLOTHING = "clothing"
    GROOMING = "grooming"
    
    # Entertainment & Recreation (Typically 5-10% of income)
    ENTERTAINMENT = "entertainment"
    HOBBIES = "hobbies"
    TRAVEL = "travel"
    SUBSCRIPTIONS = "subscriptions"
    
    # Education (Variable)
    EDUCATION = "education"
    TRAINING = "training"
    BOOKS_SUPPLIES = "books_supplies"
    
    # Charity & Gifts (Typically 5-10% of income)
    CHARITY_GIFTS = "charity_gifts"
    
    # Business Expenses (For entrepreneurs)
    BUSINESS_EXPENSE = "business_expense"
    
    # Taxes (Handled separately but tracked)
    TAXES = "taxes"
    
    # Miscellaneous
    MISCELLANEOUS = "miscellaneous"


class ExpenseCategory(Enum):
    """CFA-standard expense categories for budgeting analysis"""
    FIXED_EXPENSES = "fixed_expenses"              # Rent, insurance, loan payments
    VARIABLE_EXPENSES = "variable_expenses"        # Groceries, utilities, gas
    DISCRETIONARY_EXPENSES = "discretionary_expenses"  # Entertainment, dining out


@dataclass
class Expense:
    """
    Expense domain entity for comprehensive spending tracking.
    
    Following CFA standards for:
    - Expense categorization and budgeting
    - Essential vs. discretionary classification
    - Recurring expense projection
    - Expense ratio analysis for financial health
    - Temporal liability tracking for lifetime balance sheet accuracy
    - KISS user-driven asset/liability linking
    """
    id: int
    user_id: int
    description: str
    amount: Money
    expense_type: ExpenseType
    expense_date: datetime
    is_recurring: bool = False
    frequency_months: Optional[int] = None  # How often it recurs (1=monthly, 3=quarterly, 12=annually)
    
    # KISS Asset/Liability Relationship (User-Driven Selection)
    related_asset_id: Optional[int] = None      # Link to asset (car, property, business)
    related_liability_id: Optional[int] = None  # Link to liability (loan, mortgage, credit card)
    relationship_type: Optional[str] = None     # "asset_maintenance", "loan_payment", "business_operating"
    
    # Finite vs Infinite Classification (User Confirms)
    is_finite_payment: bool = False             # User confirms if this expense will end
    total_payments_remaining: Optional[int] = None  # Number of payments left (user provides)
    payment_end_date: Optional[datetime] = None     # When payments end (user provides)
    
    vendor: Optional[str] = None
    category_override: Optional[ExpenseCategory] = None  # Manual category override
    notes: Optional[str] = None
    is_active: bool = True
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    # Temporal Characteristics (CFA-compliant finite expense tracking)
    is_temporal: bool = False  # Has defined end date/payment count
    end_date: Optional[datetime] = None  # When expense stops (e.g., loan maturity)
    remaining_payments: Optional[int] = None  # Number of payments left
    linked_liability_id: Optional[int] = None  # Associated debt obligation
    temporal_type: Optional[str] = None  # 'finite_payments', 'maturity_based', 'lifecycle_based'
    
    def __post_init__(self):
        """Initialize calculated fields and validate data"""
        if self.created_at is None:
            self.created_at = datetime.now(timezone.utc)
        if self.updated_at is None:
            self.updated_at = datetime.now(timezone.utc)
    
    def get_expense_category(self) -> ExpenseCategory:
        """
        Categorize expense according to CFA budgeting standards.
        
        Returns:
            ExpenseCategory: Appropriate category for budgeting
        """
        # Allow manual override
        if self.category_override:
            return self.category_override
        
        # Fixed expenses (same amount each period)
        fixed_expense_types = {
            ExpenseType.HOUSING,
            ExpenseType.VEHICLE_PAYMENT,
            ExpenseType.HEALTH_INSURANCE,
            ExpenseType.HOME_INSURANCE,
            ExpenseType.VEHICLE_INSURANCE,
            ExpenseType.LIFE_INSURANCE,
            ExpenseType.DISABILITY_INSURANCE,
            ExpenseType.STUDENT_LOAN,
            ExpenseType.PERSONAL_LOAN,
            ExpenseType.SUBSCRIPTIONS,
            ExpenseType.PROPERTY_TAX
        }
        
        # Discretionary expenses (lifestyle choices)
        discretionary_types = {
            ExpenseType.ENTERTAINMENT,
            ExpenseType.HOBBIES,
            ExpenseType.TRAVEL,
            ExpenseType.RESTAURANTS,
            ExpenseType.CLOTHING,
            ExpenseType.CHARITY_GIFTS,
            ExpenseType.MISCELLANEOUS
        }
        
        if self.expense_type in fixed_expense_types:
            return ExpenseCategory.FIXED_EXPENSES
        elif self.expense_type in discretionary_types:
            return ExpenseCategory.DISCRETIONARY_EXPENSES
        else:
            return ExpenseCategory.VARIABLE_EXPENSES
    
    @property
    def is_essential(self) -> bool:
        """
        Determine if expense is essential for basic living.
        
        Returns:
            bool: True if essential (needs vs. wants)
        """
        essential_types = {
            ExpenseType.HOUSING,
            ExpenseType.UTILITIES,
            ExpenseType.GROCERIES,
            ExpenseType.FOOD_DINING,  # Essential food expenses
            ExpenseType.HEALTHCARE,
            ExpenseType.HEALTH_INSURANCE,
            ExpenseType.TRANSPORTATION,
            ExpenseType.FUEL,
            ExpenseType.DEBT_PAYMENT,
            ExpenseType.TAXES,
            ExpenseType.HOME_INSURANCE,
            ExpenseType.VEHICLE_INSURANCE,
            ExpenseType.LIFE_INSURANCE
        }
        return self.expense_type in essential_types
    
    def calculate_annual_projection(self) -> Money:
        """
        Project annual expense amount for budgeting.
        
        Returns:
            Money: Projected annual expense amount
        """
        if not self.is_recurring or not self.frequency_months:
            return self.amount  # One-time expense
        
        # Calculate how many times per year this expense occurs
        occurrences_per_year = 12 / self.frequency_months
        annual_amount = self.amount.multiply(occurrences_per_year)
        
        return annual_amount
    
    def calculate_monthly_equivalent(self) -> Money:
        """
        Convert expense to monthly equivalent for budgeting.
        
        Returns:
            Money: Monthly equivalent amount
        """
        if not self.is_recurring or not self.frequency_months:
            return Money.zero()  # One-time expenses don't have monthly equivalent
        
        if self.frequency_months == 1:
            return self.amount  # Already monthly
        else:
            # Convert to monthly (e.g., quarterly ÷ 3, annually ÷ 12)
            monthly_amount = self.amount.amount / self.frequency_months
            return Money(monthly_amount.quantize(Decimal('0.01')))
    
    def calculate_expense_ratio(self, monthly_income: Money) -> Decimal:
        """
        Calculate expense as percentage of monthly income.
        
        Args:
            monthly_income: User's monthly gross income
            
        Returns:
            Decimal: Expense ratio as percentage (e.g., 25.50 for 25.5%)
        """
        if monthly_income.is_zero():
            return Decimal("0.00")
        
        monthly_expense = self.calculate_monthly_equivalent()
        if monthly_expense.is_zero():
            # For one-time expenses, use actual amount
            monthly_expense = self.amount
        
        ratio = (monthly_expense.amount / monthly_income.amount) * 100
        return ratio.quantize(Decimal('0.01'))
    
    def is_expense_ratio_healthy(self, monthly_income: Money) -> bool:
        """
        Check if expense ratio is within CFA recommended guidelines.
        
        Args:
            monthly_income: User's monthly gross income
            
        Returns:
            bool: True if within healthy limits
        """
        ratio = self.calculate_expense_ratio(monthly_income)
        
        # CFA recommended expense ratios by category
        healthy_limits = {
            ExpenseType.HOUSING: Decimal("30.00"),           # Max 30%
            ExpenseType.TRANSPORTATION: Decimal("15.00"),     # Max 15%
            ExpenseType.FOOD_DINING: Decimal("15.00"),       # Max 15%
            ExpenseType.GROCERIES: Decimal("10.00"),         # Max 10%
            ExpenseType.HEALTHCARE: Decimal("10.00"),        # Max 10%
            ExpenseType.INSURANCE: Decimal("10.00"),         # Max 10%
            ExpenseType.DEBT_PAYMENT: Decimal("20.00"),      # Max 20%
            ExpenseType.ENTERTAINMENT: Decimal("10.00"),     # Max 10%
            ExpenseType.PERSONAL_CARE: Decimal("5.00"),      # Max 5%
        }
        
        limit = healthy_limits.get(self.expense_type, Decimal("5.00"))  # Default 5%
        return ratio <= limit
    
    def get_budget_impact_score(self) -> int:
        """
        Calculate budget impact score (1-10 scale).
        Higher score = greater impact on financial health.
        
        Returns:
            int: Impact score from 1 (low) to 10 (high)
        """
        base_score = 5  # Default moderate impact
        
        # Adjust based on category
        if self.get_expense_category() == ExpenseCategory.FIXED_EXPENSES:
            base_score += 2  # Fixed expenses have higher impact
        elif self.get_expense_category() == ExpenseCategory.DISCRETIONARY_EXPENSES:
            base_score -= 1  # Discretionary expenses have lower base impact
        
        # Adjust based on whether it's essential
        if not self.is_essential:
            base_score -= 2  # Non-essential expenses have lower impact priority
        
        # Adjust based on recurring nature
        if self.is_recurring:
            base_score += 1  # Recurring expenses have higher long-term impact
        
        # Clamp to 1-10 range
        return max(1, min(10, base_score))
    
    @property
    def financial_health_impact(self) -> str:
        """
        Assess impact on financial health.
        
        Returns:
            str: Impact assessment (positive, neutral, negative)
        """
        if self.is_essential and self.get_expense_category() == ExpenseCategory.FIXED_EXPENSES:
            return "neutral"  # Necessary fixed expenses
        elif not self.is_essential and self.get_expense_category() == ExpenseCategory.DISCRETIONARY_EXPENSES:
            return "negative"  # Unnecessary spending
        elif self.expense_type in {ExpenseType.EDUCATION, ExpenseType.HEALTHCARE, ExpenseType.TRAINING}:
            return "positive"  # Investment in self/health
        else:
            return "neutral"
    
    @property
    def is_temporal_expense(self) -> bool:
        """
        Determine if expense has temporal/finite characteristics.
        
        CFA Institute Standard: Proper classification of finite vs perpetual cash flows
        """
        return (
            self.is_temporal or
            self.end_date is not None or
            (self.remaining_payments is not None and self.remaining_payments > 0) or
            self.linked_liability_id is not None or
            self.expense_type in {ExpenseType.DEBT_PAYMENT, ExpenseType.STUDENT_LOAN, ExpenseType.PERSONAL_LOAN}
        )
    
    def calculate_lifetime_expense_pv(self, discount_rate: Decimal = Decimal('0.105'), current_date: Optional[datetime] = None) -> Money:
        """
        Calculate present value of remaining expense payments for lifetime balance sheet.
        
        CFA-compliant temporal expense valuation methodology.
        
        Args:
            discount_rate: Kenya-specific discount rate (default 10.5%)
            current_date: Calculation date (default: now)
            
        Returns:
            Money: Present value of future expense payments
        """
        if current_date is None:
            current_date = datetime.now(timezone.utc)
        
        if not self.is_temporal_expense:
            # Infinite/perpetual expense - use perpetuity calculation with lifecycle adjustments
            annual_expense = self.calculate_annual_projection().amount
            
            # Conservative finite assumption for non-temporal expenses (50 years max)
            pv_amount = Decimal('0.00')
            for year in range(1, 51):  # 50 years
                pv_amount += annual_expense / (Decimal('1.0') + discount_rate) ** year
            
            return Money(pv_amount, self.amount.currency)
        
        # Temporal/finite expense calculation
        if self.end_date:
            # End date-based calculation
            months_remaining = max(0, (self.end_date.replace(tzinfo=timezone.utc) - current_date).days // 30)
        elif self.remaining_payments:
            # Payment count-based calculation
            payment_frequency = self.frequency_months or 1
            months_remaining = self.remaining_payments * payment_frequency
        else:
            # Fallback: assume reasonable finite period
            months_remaining = 60  # 5 years default
        
        # Calculate present value of payment stream
        monthly_discount = discount_rate / 12
        pv_payments = Decimal('0.00')
        monthly_payment = self.calculate_monthly_equivalent().amount
        
        for month in range(1, months_remaining + 1):
            pv_factor = Decimal('1.0') / ((Decimal('1.0') + monthly_discount) ** month)
            pv_payments += monthly_payment * pv_factor
        
        return Money(pv_payments, self.amount.currency)
    
    def get_temporal_classification(self) -> str:
        """
        Classify temporal characteristics for CFA reporting.
        
        Returns:
            str: Temporal classification type
        """
        if not self.is_temporal_expense:
            return "perpetual"
        
        if self.end_date:
            return "maturity_based"
        elif self.remaining_payments:
            return "payment_count_based"
        elif self.linked_liability_id:
            return "liability_linked"
        else:
            return "finite_assumed"

    def is_liability_linked_expense(self) -> bool:
        """
        Check if expense is linked to a liability (loan payment, etc.).
        
        Returns:
            bool: True if expense represents a liability payment
        """
        return (
            self.related_liability_id is not None or
            self.is_finite_payment or
            self.expense_type in {
                ExpenseType.DEBT_PAYMENT,
                ExpenseType.CREDIT_CARD,
                ExpenseType.STUDENT_LOAN,
                ExpenseType.PERSONAL_LOAN
            }
        )
    
    def is_asset_linked_expense(self) -> bool:
        """
        Check if expense is related to maintaining/operating an asset.
        
        Returns:
            bool: True if expense is asset-related
        """
        return (
            self.related_asset_id is not None or
            self.expense_type in {
                ExpenseType.MAINTENANCE_REPAIRS,
                ExpenseType.VEHICLE_MAINTENANCE,
                ExpenseType.PROPERTY_TAX,
                ExpenseType.HOME_INSURANCE,
                ExpenseType.VEHICLE_INSURANCE,
                ExpenseType.BUSINESS_EXPENSE
            }
        )
    
    def should_convert_to_liability(self) -> bool:
        """
        Determine if this expense should be converted to a liability.
        
        KISS Logic: If user confirms it's finite and represents debt payments,
        suggest conversion to liability for proper balance sheet treatment.
        
        Returns:
            bool: True if expense should become a liability
        """
        return (
            self.is_finite_payment and
            self.is_liability_linked_expense() and
            (self.total_payments_remaining is not None or self.payment_end_date is not None)
        )
    
    def calculate_remaining_liability_balance(self) -> Optional[Money]:
        """
        Calculate remaining balance if this expense represents loan payments.
        
        Returns:
            Optional[Money]: Estimated remaining liability balance
        """
        if not self.should_convert_to_liability():
            return None
        
        if self.total_payments_remaining:
            return Money(self.amount.amount * self.total_payments_remaining, self.amount.currency)
        elif self.payment_end_date:
            # Estimate payments remaining based on end date
            months_remaining = max(0, (self.payment_end_date.replace(tzinfo=timezone.utc) - datetime.now(timezone.utc)).days // 30)
            payment_frequency = self.frequency_months or 1
            payments_remaining = months_remaining // payment_frequency
            return Money(self.amount.amount * payments_remaining, self.amount.currency)
        
        return None

    def to_dict(self) -> dict:
        """Convert expense to dictionary for API serialization"""
        return {
            "id": self.id,
            "description": self.description,
            "amount": self.amount.to_dict(),
            "expense_type": self.expense_type.value,
            "expense_category": self.get_expense_category().value,
            "expense_date": self.expense_date.isoformat(),
            "is_recurring": self.is_recurring,
            "frequency_months": self.frequency_months,
            "annual_projection": self.calculate_annual_projection().to_dict(),
            "monthly_equivalent": self.calculate_monthly_equivalent().to_dict(),
            "is_essential": self.is_essential,
            "budget_impact_score": self.get_budget_impact_score(),
            "financial_health_impact": self.financial_health_impact,
            "vendor": self.vendor,
            "notes": self.notes,
            # KISS Asset/Liability Linking
            "related_asset_id": self.related_asset_id,
            "related_liability_id": self.related_liability_id,
            "relationship_type": self.relationship_type,
            # Finite vs Infinite Classification
            "is_finite_payment": self.is_finite_payment,
            "total_payments_remaining": self.total_payments_remaining,
            "payment_end_date": self.payment_end_date.isoformat() if self.payment_end_date else None,
            # Helper Properties
            "is_liability_linked": self.is_liability_linked_expense(),
            "is_asset_linked": self.is_asset_linked_expense(),
            "should_convert_to_liability": self.should_convert_to_liability(),
            "remaining_liability_balance": self.calculate_remaining_liability_balance().to_dict() if self.calculate_remaining_liability_balance() else None,
            # Metadata
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            # Legacy temporal attributes (for backward compatibility)
            "is_temporal": self.is_temporal_expense,
            "end_date": self.end_date.isoformat() if self.end_date else None,
            "remaining_payments": self.remaining_payments,
            "linked_liability_id": self.linked_liability_id,
            "temporal_classification": self.get_temporal_classification()
        }