from dataclasses import dataclass
from typing import Dict, List, Optional
from decimal import Decimal


@dataclass
class BudgetOverviewDto:
    """DTO for budget overview response"""
    monthly_income: Decimal
    total_expenses: Decimal
    total_goals: Decimal
    surplus: Decimal
    categories: Dict[str, Decimal]
    variance_by_category: Dict[str, Decimal]
    is_balanced: bool
    savings_rate: Decimal
    expense_ratio: Decimal
    period_start: str
    period_end: str


@dataclass
class BudgetCategoryDto:
    """DTO for individual budget category"""
    name: str
    allocated_amount: Decimal
    spent_amount: Decimal
    category_type: str
    remaining_budget: Decimal
    utilization_percentage: Decimal
    variance_percentage: Decimal
    is_over_budget: bool


@dataclass
class CreateBudgetCategoryRequest:
    """Request DTO for creating a budget category"""
    user_id: int
    category_name: str
    allocated_amount: Decimal
    category_type: str = "expense"


@dataclass
class UpdateBudgetCategoryRequest:
    """Request DTO for updating a budget category"""
    user_id: int
    category_name: str
    new_amount: Decimal


@dataclass
class UpdateCategorySpendingRequest:
    """Request DTO for updating category spending"""
    user_id: int
    category_name: str
    spent_amount: Decimal


@dataclass
class CreateBudgetRequest:
    """Request DTO for creating a new budget"""
    user_id: int
    monthly_income: Decimal
    period_type: str  # monthly, yearly, quarterly, weekly
    start_date: str
    end_date: str


@dataclass
class SetGoalAllocationRequest:
    """Request DTO for setting goal allocation"""
    user_id: int
    goal_name: str
    allocation_amount: Decimal


@dataclass
class BudgetHistoryDto:
    """DTO for budget history response"""
    budgets: List[BudgetOverviewDto]
    total_months: int
    average_surplus: Decimal
    average_savings_rate: Decimal


@dataclass
class BudgetSummaryDto:
    """DTO for budget summary statistics"""
    user_id: int
    total_categories: int
    over_budget_categories: int
    under_budget_categories: int
    total_variance: Decimal
    best_performing_category: Optional[str]
    worst_performing_category: Optional[str]