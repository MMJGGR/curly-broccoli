from typing import Any, Dict, List
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth import get_current_user
from app.models import User

router = APIRouter(prefix="/audits", tags=["audits-clean"])


def _to_number(v, d=0.0) -> float:
    try:
        return float(v)
    except Exception:
        return d


def _generate_audits(snapshot: Dict[str, Any]) -> List[Dict[str, Any]]:
    incomes = snapshot.get("incomes") or snapshot.get("incomeSource") or []
    expenses = snapshot.get("expenses") or []
    liabilities = snapshot.get("liabilities") or []
    assets = snapshot.get("assets") or []
    goals = snapshot.get("goals") or []
    budget_categories = snapshot.get("budgetCategories") or []

    audits: List[Dict[str, Any]] = []
    monthly_income = sum(_to_number(i.get("monthly_amount") or i.get("amount"), 0.0) for i in incomes)
    monthly_exp = sum(_to_number(e.get("monthly_equivalent") or e.get("amount"), 0.0) for e in expenses)
    net = monthly_income - monthly_exp
    if net < 0:
        audits.append({
            "domain": "budget",
            "severity": "high",
            "message": "Monthly deficit detected",
            "action": "Reduce discretionary spending by 10% and/or increase income",
            "suggestion": {"type": "optimize_budget", "target": "discretionary", "pct": 10}
        })

    for l in liabilities:
        mp = _to_number(l.get("monthly_payment"), 0.0)
        if mp > 0:
            lname = (l.get("name") or "").lower()
            has_payment = any(((e.get("description") or "").lower().find(lname) >= 0) or ((e.get("expense_type") or "").lower().find("debt") >= 0) for e in expenses)
            if not has_payment:
                audits.append({
                    "domain": "liability",
                    "severity": "medium",
                    "message": f"No expense for loan payment: {l.get('name') or 'Loan'}",
                    "action": "Create a monthly loan payment expense aligned to liability",
                    "suggestion": {"type": "create_expense_loan_payment", "liabilityId": l.get("id"), "name": l.get("name"), "amount": round(mp), "is_finite_payment": True}
                })

    for a in assets:
        at = (a.get("asset_type") or "").lower()
        if "real" in at or "property" in at:
            asset_id = a.get("id")
            has_maint = any((e.get("linked_asset_id") == asset_id) and ((e.get("description") or "").lower().find("maintenance") >= 0) for e in expenses)
            has_ins = any((e.get("linked_asset_id") == asset_id) and ((e.get("description") or "").lower().find("insurance") >= 0) for e in expenses)
            curv = _to_number(a.get("current_value"), 0.0)
            if not has_maint:
                audits.append({
                    "domain": "asset",
                    "severity": "low",
                    "message": f"Add maintenance for {a.get('name') or 'property'}",
                    "action": "Create monthly maintenance expense (~1% p.a.)",
                    "suggestion": {"type": "create_expense_asset_maintenance", "assetId": asset_id, "name": a.get("name"), "estimate": round(curv * 0.01 / 12)}
                })
            if not has_ins:
                audits.append({
                    "domain": "asset",
                    "severity": "low",
                    "message": f"Add insurance for {a.get('name') or 'property'}",
                    "action": "Create monthly insurance premium",
                    "suggestion": {"type": "create_expense_insurance_premium", "assetId": asset_id, "name": a.get("name"), "estimate": 3000}
                })

    def _find_budgeted_for_goal(name: str) -> float:
        nm = f"goal: {name.lower()}"
        s = 0.0
        for c in budget_categories:
            n = (c.get("name") or "").lower()
            if n == nm:
                s += _to_number(c.get("budgeted_amount"), 0.0)
        return s

    from datetime import datetime
    for g in goals:
        target = _to_number(g.get("target_amount") or g.get("target"), 0.0)
        current = _to_number(g.get("current_amount") or g.get("current"), 0.0)
        remaining = max(0.0, target - current)
        months = 0
        try:
            td = g.get("target_date")
            if td:
                d = datetime.fromisoformat(td.replace("Z", "").split("T")[0])
                months = max(0, round((d - datetime.utcnow()).days / 30))
        except Exception:
            months = 0
        req = remaining / months if months > 0 else 0.0
        budgeted = _find_budgeted_for_goal(str(g.get("name") or ""))
        if req > 0 and budgeted < req:
            audits.append({
                "domain": "goals",
                "severity": "medium",
                "message": f"Underfunded goal: {g.get('name')}",
                "action": f"Allocate KES {round(req - budgeted):,} more per month",
                "suggestion": {"type": "set_goal_contribution", "name": g.get("name"), "monthly_amount": round(req)}
            })

    return audits


@router.post("/generate")
async def generate_audits(snapshot: Dict[str, Any], current_user: User = Depends(get_current_user)):
    """Generates audits from a client-provided snapshot (no storage)."""
    try:
        return {"user_id": current_user.id, "audits": _generate_audits(snapshot)}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

