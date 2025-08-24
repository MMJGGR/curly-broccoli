"""
Financial Domain Events - Following Clean Architecture
"""
from dataclasses import dataclass
from decimal import Decimal
from .base import DomainEvent


class BudgetExceededEvent(DomainEvent):
    """Event fired when a budget category is exceeded"""
    
    def __init__(self, user_id: int, category: str, budgeted: Decimal, spent: Decimal, overage_pct: Decimal):
        super().__init__()
        self.user_id = user_id
        self.category = category
        self.budgeted = budgeted
        self.spent = spent
        self.overage_pct = overage_pct


class FinancialHealthWarningEvent(DomainEvent):
    """Event fired when financial health metrics indicate concern"""
    
    def __init__(self, user_id: int, warning_type: str, severity: str, metrics: dict):
        super().__init__()
        self.user_id = user_id
        self.warning_type = warning_type
        self.severity = severity
        self.metrics = metrics