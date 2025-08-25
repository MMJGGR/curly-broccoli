"""
Money Value Object - CFA-Compliant Financial Precision
Foundation Week: Core money handling with decimal precision and business rules
"""
from dataclasses import dataclass
from decimal import Decimal, ROUND_HALF_UP
from typing import Union, Dict, Any
import json


@dataclass(frozen=True)
class Money:
    """
    Immutable Money value object following CFA standards.
    
    Key features:
    - Decimal precision to avoid floating point errors
    - Immutable to prevent accidental modifications
    - CFA-compliant rounding and calculations
    - Currency-aware (defaults to KES)
    - JSON serializable for API responses
    """
    amount: Decimal
    currency: str = "KES"
    
    def __post_init__(self):
        """Validate money creation"""
        if not isinstance(self.amount, Decimal):
            # Convert to Decimal if not already
            object.__setattr__(self, 'amount', Decimal(str(self.amount)))
        
        # Round to 2 decimal places (standard for currency)
        rounded_amount = self.amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
        object.__setattr__(self, 'amount', rounded_amount)
        
        if not isinstance(self.currency, str) or len(self.currency) != 3:
            raise ValueError("Currency must be 3-letter code (e.g., 'KES', 'USD')")
    
    @classmethod
    def from_float(cls, amount: float, currency: str = "KES") -> 'Money':
        """Create Money from float (with proper decimal conversion)"""
        return cls(Decimal(str(amount)), currency)
    
    @classmethod
    def from_int(cls, cents: int, currency: str = "KES") -> 'Money':
        """Create Money from cents/kobo (e.g., 10050 cents = 100.50 KES)"""
        return cls(Decimal(cents) / 100, currency)
    
    @classmethod
    def zero(cls, currency: str = "KES") -> 'Money':
        """Create zero money amount"""
        return cls(Decimal('0.00'), currency)
    
    def add(self, other: 'Money') -> 'Money':
        """Add two money amounts (must be same currency)"""
        self._ensure_same_currency(other)
        return Money(self.amount + other.amount, self.currency)
    
    def subtract(self, other: 'Money') -> 'Money':
        """Subtract two money amounts (must be same currency)"""
        self._ensure_same_currency(other)
        return Money(self.amount - other.amount, self.currency)
    
    def multiply(self, factor: Union[int, float, Decimal]) -> 'Money':
        """Multiply money by a factor"""
        if isinstance(factor, (int, float)):
            factor = Decimal(str(factor))
        return Money(self.amount * factor, self.currency)
    
    def divide(self, divisor: Union[int, float, Decimal]) -> 'Money':
        """Divide money by a divisor"""
        if isinstance(divisor, (int, float)):
            divisor = Decimal(str(divisor))
        if divisor == 0:
            raise ZeroDivisionError("Cannot divide money by zero")
        return Money(self.amount / divisor, self.currency)
    
    def percentage_of(self, total: 'Money') -> Decimal:
        """Calculate what percentage this amount is of total"""
        self._ensure_same_currency(total)
        if total.amount == 0:
            return Decimal('0.00')
        return (self.amount / total.amount * 100).quantize(Decimal('0.01'))
    
    def apply_percentage(self, percentage: Union[int, float, Decimal]) -> 'Money':
        """Apply percentage to this money amount"""
        if isinstance(percentage, (int, float)):
            percentage = Decimal(str(percentage))
        factor = percentage / 100
        return self.multiply(factor)
    
    def abs(self) -> 'Money':
        """Return absolute value of money"""
        return Money(abs(self.amount), self.currency)
    
    def is_positive(self) -> bool:
        """Check if amount is positive"""
        return self.amount > 0
    
    def is_negative(self) -> bool:
        """Check if amount is negative"""
        return self.amount < 0
    
    def is_zero(self) -> bool:
        """Check if amount is zero"""
        return self.amount == 0
    
    def _ensure_same_currency(self, other: 'Money') -> None:
        """Ensure two money amounts have same currency"""
        if self.currency != other.currency:
            raise ValueError(f"Cannot operate on different currencies: {self.currency} vs {other.currency}")
    
    def format(self, include_currency: bool = True) -> str:
        """Format money for display"""
        # Format with thousands separator
        formatted_amount = f"{self.amount:,.2f}"
        
        if include_currency:
            if self.currency == "KES":
                return f"KES {formatted_amount}"
            elif self.currency == "USD":
                return f"${formatted_amount}"
            else:
                return f"{self.currency} {formatted_amount}"
        else:
            return formatted_amount
    
    def to_cents(self) -> int:
        """Convert to cents/kobo for storage"""
        return int(self.amount * 100)
    
    def to_float(self) -> float:
        """Convert to float (use cautiously - may lose precision)"""
        return float(self.amount)
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary for JSON serialization"""
        return {
            "amount": str(self.amount),  # Use string to preserve precision
            "currency": self.currency,
            "formatted": self.format(),
            "cents": self.to_cents()
        }
    
    def __str__(self) -> str:
        """String representation"""
        return self.format()
    
    def __repr__(self) -> str:
        """Detailed representation for debugging"""
        return f"Money({self.amount}, '{self.currency}')"
    
    def __eq__(self, other: 'Money') -> bool:
        """Equality comparison"""
        if not isinstance(other, Money):
            return False
        return self.amount == other.amount and self.currency == other.currency
    
    def __lt__(self, other: 'Money') -> bool:
        """Less than comparison"""
        self._ensure_same_currency(other)
        return self.amount < other.amount
    
    def __le__(self, other: 'Money') -> bool:
        """Less than or equal comparison"""
        self._ensure_same_currency(other)
        return self.amount <= other.amount
    
    def __gt__(self, other: 'Money') -> bool:
        """Greater than comparison"""
        self._ensure_same_currency(other)
        return self.amount > other.amount
    
    def __ge__(self, other: 'Money') -> bool:
        """Greater than or equal comparison"""
        self._ensure_same_currency(other)
        return self.amount >= other.amount
    
    def __add__(self, other: 'Money') -> 'Money':
        """Addition operator"""
        return self.add(other)
    
    def __sub__(self, other: 'Money') -> 'Money':
        """Subtraction operator"""
        return self.subtract(other)
    
    def __mul__(self, factor: Union[int, float, Decimal]) -> 'Money':
        """Multiplication operator"""
        return self.multiply(factor)
    
    def __rmul__(self, factor: Union[int, float, Decimal]) -> 'Money':
        """Reverse multiplication operator"""
        return self.multiply(factor)
    
    def __truediv__(self, divisor: Union[int, float, Decimal]) -> 'Money':
        """Division operator"""
        return self.divide(divisor)
    
    def __hash__(self) -> int:
        """Hash for use in sets and dictionaries"""
        return hash((self.amount, self.currency))


# Custom JSON encoder for Money objects
class MoneyJSONEncoder(json.JSONEncoder):
    """JSON encoder that handles Money objects"""
    def default(self, obj):
        if isinstance(obj, Money):
            return obj.to_dict()
        return super().default(obj)