from datetime import datetime, timedelta
from collections import defaultdict
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from ....auth import get_current_user
from ....models import User, IncomeSource, Expense, IncomeSourceHistory
from ....database import get_db

router = APIRouter(prefix="/pl", tags=["pl-v1"])


@router.get("/statement")
def get_pl_statement(
    months: int = 12,
    breakdown: int = 0,
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
    breakdown_rows = [] if breakdown else None
    for i in range(months):
        m = now - timedelta(days=i * 31)
        month_key = datetime(m.year, m.month, 1)
        # Income with temporal history: pick latest effective <= month for each source; respect start/end windows
        income = 0.0
        for src in income_sources:
            # Respect start/end
            if getattr(src, 'start_date', None) and src.start_date > month_key:
                continue
            if getattr(src, 'end_date', None) and src.end_date and src.end_date < month_key:
                continue
            amt = float(src.amount or 0.0)
            try:
                hist = db.query(IncomeSourceHistory).filter(
                    IncomeSourceHistory.user_id == current_user.id,
                    IncomeSourceHistory.income_source_id == src.id,
                    IncomeSourceHistory.effective_date <= month_key
                ).order_by(IncomeSourceHistory.effective_date.desc()).first()
                if hist:
                    amt = float(hist.amount or amt)
            except Exception:
                pass
            income += amt
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
        if breakdown:
            # Simple category breakdown by expense_type (fallback) for this month
            cats = defaultdict(float)
            q2 = db.query(Expense).filter(
                Expense.user_id == current_user.id,
                Expense.expense_date >= month_key,
            )
            # next month start
            next_month = datetime(month_key.year + (1 if month_key.month == 12 else 0), 1 if month_key.month == 12 else month_key.month + 1, 1)
            q2 = q2.filter(Expense.expense_date < next_month)
            for e in q2:
                try:
                    amt = float(e.amount or 0.0)
                except Exception:
                    amt = 0.0
                cat = None
                try:
                    cat = getattr(e, 'category_override', None)
                except Exception:
                    cat = None
                if not cat:
                    cat = getattr(e, 'expense_type', None) or 'uncategorized'
                cats[str(cat)] += amt
            breakdown_rows.append({
                "period": month_key.strftime("%Y-%m"),
                "expenses_by_category": cats,
            })
        totals["income"] += income
        totals["operating_expenses"] += operating_expenses
        totals["goal_contributions"] += goal_contributions
        totals["net_income"] += net
    out = {"rows": rows, "totals": totals}
    if breakdown:
        out["breakdown"] = breakdown_rows
    return out


@router.get("/statement.csv")
def get_pl_statement_csv(
    months: int = 12,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = get_pl_statement(months=months, breakdown=0, current_user=current_user, db=db)
    # Build CSV: period,income,operating_expenses,goal_contributions,net_income
    lines = ["period,income,operating_expenses,goal_contributions,net_income"]
    for row in data.get("rows", [])[::-1]:  # oldest-first
        lines.append(
            f"{row['period']},{row['income']:.2f},{row['operating_expenses']:.2f},{row['goal_contributions']:.2f},{row['net_income']:.2f}"
        )
    csv = "\n".join(lines) + "\n"
    return Response(content=csv, media_type="text/csv")
