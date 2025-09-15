"""
Budget V2 - Clean Architecture endpoints
Provides health, overview and category management for budgeting.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import date

from ....security import get_current_user
from ....core.database import get_db
from ....models import User, Profile, ExpenseCategory, Goal


router = APIRouter(prefix="/budget-v2", tags=["budget-v2-clean"])


@router.get("/health")
def budget_health_check():
    return {
        "status": "healthy",
        "service": "budget-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True,
    }


@router.get("/overview")
def get_budget_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Income (monthly)
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    monthly_income = float(profile.monthly_income) if profile and profile.monthly_income is not None else 0.0

    # Expense categories (budgeted)
    categories = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.user_id == current_user.id)
        .all()
    )
    expense_map: Dict[str, float] = {c.name: float(c.budgeted_amount or 0.0) for c in categories}
    total_expenses = sum(expense_map.values())

    # Goals total (treat as savings target within overview)
    goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
    def _to_float(v: Any) -> float:
        try:
            return float(v)
        except Exception:
            return 0.0
    total_goals = sum(_to_float(g.target) for g in goals)

    surplus = monthly_income - total_expenses - total_goals

    return {
        "user_id": current_user.id,
        "period": "monthly",
        "income": {"monthly_income": monthly_income, "currency": "KES"},
        "expenses": {
            "total_expenses": total_expenses,
            "categories": expense_map,
            "currency": "KES",
        },
        "savings_and_goals": {
            "total_goals": total_goals,
            "currency": "KES",
        },
        "summary": {
            "surplus": surplus,
            "is_balanced": surplus >= 0,
            "total_categories": len(expense_map),
        },
        "metadata": {
            "calculation_method": "clean_architecture",
            "cfa_compliant": True,
            "generated_at": date.today().isoformat(),
        },
    }


@router.post("/categories", status_code=status.HTTP_201_CREATED)
def create_budget_category(
    category_name: str,
    allocated_amount: float,
    category_type: str = "expense",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validations
    if allocated_amount < 0:
        raise HTTPException(status_code=400, detail="allocated_amount cannot be negative")
    if category_type not in {"expense", "income", "transfer"}:
        raise HTTPException(status_code=400, detail="category_type must be 'expense', 'income' or 'transfer'")

    existing = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.user_id == current_user.id, ExpenseCategory.name == category_name)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Category already exists")

    cat = ExpenseCategory(
        user_id=current_user.id,
        name=category_name,
        budgeted_amount=allocated_amount,
        actual_amount=0.0,
        category_type=category_type,
        is_active=True,
    )
    db.add(cat)
    db.commit()

    return {
        "message": f"Category '{category_name}' created successfully",
        "category": {
            "name": category_name,
            "allocated_amount": allocated_amount,
            "category_type": category_type,
            "currency": "KES",
        },
    }


@router.get("/categories")
def list_budget_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cats = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.user_id == current_user.id)
        .order_by(ExpenseCategory.name.asc())
        .all()
    )
    return {
        "user_id": current_user.id,
        "categories": [
            {
                "name": c.name,
                "allocated_amount": float(c.budgeted_amount or 0.0),
                "actual_amount": float(c.actual_amount or 0.0),
                "category_type": c.category_type,
                "is_active": bool(c.is_active),
                "currency": "KES",
            }
            for c in cats
        ],
    }


@router.delete("/categories/{category_name}")
def delete_budget_category(
    category_name: str,
    hard: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.user_id == current_user.id, ExpenseCategory.name == category_name)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    if hard:
        db.delete(cat)
    else:
        cat.is_active = False
        db.add(cat)
    db.commit()

    return {
        "deleted": True,
        "category": category_name,
        "hard": hard,
    }

@router.put("/categories/{category_name}/allocation")
def update_category_allocation(
    category_name: str,
    new_amount: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.user_id == current_user.id, ExpenseCategory.name == category_name)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")

    cat.budgeted_amount = new_amount
    db.add(cat)
    db.commit()

    return {
        "message": f"Category '{category_name}' updated successfully",
        "category": category_name,
        "new_allocation": new_amount,
        "currency": "KES",
    }


@router.put("/categories/{category_name}/spending")
def update_category_spending(
    category_name: str,
    spent_amount: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.user_id == current_user.id, ExpenseCategory.name == category_name)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=400, detail="Category not found")

    cat.actual_amount = spent_amount
    db.add(cat)
    db.commit()

    return {
        "message": f"Category '{category_name}' updated successfully",
        "category": category_name,
        "spent_amount": spent_amount,
        "currency": "KES",
    }


@router.get("/categories/{category_name}")
def get_budget_category(
    category_name: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cat = (
        db.query(ExpenseCategory)
        .filter(ExpenseCategory.user_id == current_user.id, ExpenseCategory.name == category_name)
        .first()
    )
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")

    return {
        "name": cat.name,
        "allocated_amount": float(cat.budgeted_amount or 0.0),
        "actual_amount": float(cat.actual_amount or 0.0),
        "category_type": cat.category_type,
        "is_active": bool(cat.is_active),
        "currency": "KES",
    }
