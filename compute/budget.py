"""Budget-related compute helpers to mirror frontend selectors for tests."""
from typing import List, Dict


def sum_monthly_income(incomes: List[Dict]) -> float:
    """Sum monthly income from a list of income dicts.
    Accepts keys `monthly_amount` or `amount`.
    """
    total = 0.0
    for inc in incomes or []:
        total += float(inc.get("monthly_amount") or inc.get("amount") or 0)
    return total


def sum_monthly_expenses(expenses: List[Dict]) -> float:
    """Sum normalized monthly expenses from a list of expense dicts.
    Accepts keys `monthly_equivalent` or `amount`.
    """
    total = 0.0
    for exp in expenses or []:
        total += float(exp.get("monthly_equivalent") or exp.get("amount") or 0)
    return total


def compute_net_cash_flow(incomes: List[Dict], expenses: List[Dict]) -> float:
    """Return monthly net cash flow (income - expenses)."""
    return sum_monthly_income(incomes) - sum_monthly_expenses(expenses)


def compute_budget_summary(incomes: List[Dict], expenses: List[Dict]) -> Dict:
    """Return a summary dict similar to the frontend budget selector."""
    monthly_income = sum_monthly_income(incomes)
    monthly_expenses = sum_monthly_expenses(expenses)
    remaining = monthly_income - monthly_expenses
    utilization = (monthly_expenses / monthly_income * 100) if monthly_income > 0 else 0
    return {
        "total_budgeted": monthly_income,
        "total_spent": monthly_expenses,
        "remaining_budget": remaining,
        "budget_utilization": utilization,
    }

