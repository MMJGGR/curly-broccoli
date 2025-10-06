from datetime import datetime, timedelta
from collections import defaultdict
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ....auth import get_current_user
from ....models import User, IncomeSource, Expense
from ....database import get_db

router = APIRouter(prefix="/pl", tags=["pl-v1"])


@router.get("/statement")
def get_pl_statement(
    months: int = 12,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Canonical (MVP) P&L statement for the past N months.
    - Income: sum of IncomeSource.amount (treated as monthly) per month.
    - Expenses: sum of Expense.amount grouped by expense_date month.
    - Goal contributions: 0 (placeholder until explicit tagging exists).
    Returns newest-first rows and totals.
    """
    months = max(1, min(60, months))

    # Monthly income = sum of income sources (assumed monthly)
    income_sources = db.query(IncomeSource).filter(IncomeSource.user_id == current_user.id).all()
    monthly_income = float(sum((src.amount or 0.0) for src in income_sources))

    # Expenses by month (use expense_date)
    now = datetime.utcnow().replace(day=1)
    start = (now - timedelta(days=months * 31)).replace(day=1)
    exp_by_month = defaultdict(float)

    q = db.query(Expense).filter(
        Expense.user_id == current_user.id,
        Expense.expense_date >= start
    )
    for e in q:
        d = e.expense_date or now
        month_key = datetime(d.year, d.month, 1)
        try:
            amt = float(e.amount or 0.0)
        except Exception:
            amt = 0.0
        exp_by_month[month_key] += amt

    # Build rows newest-first
    rows = []
    totals = {"income": 0.0, "operating_expenses": 0.0, "goal_contributions": 0.0, "net_income": 0.0}
    for i in range(months):
        m = now - timedelta(days=i * 31)
        month_key = datetime(m.year, m.month, 1)
        income = monthly_income
        operating_expenses = -abs(exp_by_month.get(month_key, 0.0))  # negative in FE schedule convention
        goal_contributions = 0.0
        net = income + operating_expenses + goal_contributions
        rows.append({
            "period": month_key.strftime("%Y-%m"),
            "income": income,
            "operating_expenses": operating_expenses,
            "goal_contributions": goal_contributions,
            "net_income": net,
        })
        totals["income"] += income
        totals["operating_expenses"] += operating_expenses
        totals["goal_contributions"] += goal_contributions
        totals["net_income"] += net

    return {"rows": rows, "totals": totals}

