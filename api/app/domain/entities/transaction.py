"""
Transaction Entity - Clean Architecture Domain Model
CFA-compliant transaction tracking with proper categorization
"""
from dataclasses import dataclass
from datetime import datetime, date
from typing import Optional
from decimal import Decimal

from .money import Money


@dataclass
class Transaction:
    """
    Transaction domain entity representing financial transactions
    
    CFA Level 1 compliant transaction categorization and tracking
    """
    # Core Identity
    id: int
    user_id: int
    account_id: int
    
    # Transaction Details
    amount: Money
    description: str
    category: str
    transaction_date: date
    
    # Optional Reference Information
    reference_number: Optional[str] = None
    merchant: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    
    # System Fields
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    def __post_init__(self):
        """Validate transaction data after initialization"""
        if self.amount.amount == Decimal('0'):
            raise ValueError("Transaction amount cannot be zero")
        
        if not self.description or not self.description.strip():
            raise ValueError("Transaction description is required")
        
        if not self.category or not self.category.strip():
            raise ValueError("Transaction category is required")
    
    def is_income(self) -> bool:
        """Check if transaction represents income (positive amount)"""
        return self.amount.amount > Decimal('0')
    
    def is_expense(self) -> bool:
        """Check if transaction represents expense (negative amount)"""
        return self.amount.amount < Decimal('0')
    
    def get_absolute_amount(self) -> Money:
        """Get absolute value of transaction amount"""
        return Money(abs(self.amount.amount), self.amount.currency)
    
    def categorize_transaction(self) -> str:
        """
        Categorize transaction for financial reporting
        
        Returns:
            str: Transaction classification (income/expense/transfer)
        """
        if self.is_income():
            return "income"
        elif self.is_expense():
            return "expense"
        else:
            return "neutral"  # Should not happen due to validation
    
    def get_month_key(self) -> str:
        """Get month key for aggregation (YYYY-MM format)"""
        return self.transaction_date.strftime("%Y-%m")
    
    def get_quarter_key(self) -> str:
        """Get quarter key for aggregation"""
        quarter = (self.transaction_date.month - 1) // 3 + 1
        return f"{self.transaction_date.year}-Q{quarter}"
    
    def matches_category_filter(self, category_filter: str) -> bool:
        """Check if transaction matches category filter"""
        if not category_filter:
            return True
        return self.category.lower() == category_filter.lower()
    
    def matches_description_search(self, search_term: str) -> bool:
        """Check if transaction matches description search"""
        if not search_term:
            return True
        
        search_fields = [
            self.description.lower(),
            self.merchant.lower() if self.merchant else "",
            self.notes.lower() if self.notes else ""
        ]
        
        search_term_lower = search_term.lower()
        return any(search_term_lower in field for field in search_fields)
    
    def to_dict(self) -> dict:
        """Convert transaction to dictionary for API responses"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "account_id": self.account_id,
            "amount": {
                "amount": str(self.amount.amount),
                "currency": self.amount.currency
            },
            "description": self.description,
            "category": self.category,
            "transaction_date": self.transaction_date.isoformat(),
            "reference_number": self.reference_number,
            "merchant": self.merchant,
            "location": self.location,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "transaction_type": self.categorize_transaction(),
            "absolute_amount": {
                "amount": str(self.get_absolute_amount().amount),
                "currency": self.get_absolute_amount().currency
            }
        }