from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from app.auth import get_current_user
from app.core.database import get_db
from app.models import (
    User, Asset, Liability, Expense, Goal, ExpenseCategory,
    IncomeSource, IncomeSourceHistory, OnboardingState
)
from .ledger import JournalEntryModel
import json

router = APIRouter(prefix="/seed", tags=["seed"])


@router.post('/bundle')
def seed_bundle(
    payload: Dict[str, Any] = Body(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Seed multiple resources from a single JSON payload.
    Accepts keys: assets, liabilities, income (with sources[] and history per source),
    expenses, goals, budget_categories, journal (array of entries as in journal.sample.json).
    Returns counts per resource created.
    """
    created = {
        'assets': 0,
        'liabilities': 0,
        'income_sources': 0,
        'income_history': 0,
        'expenses': 0,
        'goals': 0,
        'budget_categories': 0,
        'journal': 0,
        'onboarding': 0,
    }

    try:
        # Onboarding/Profile (optional)
        onboarding_in = payload.get('onboarding') or payload.get('profile') or payload.get('profile_json')
        if isinstance(onboarding_in, dict):
            state = db.query(OnboardingState).filter(OnboardingState.user_id == current_user.id).first()
            if not state:
                state = OnboardingState(user_id=current_user.id)
                db.add(state)
            # Map FE-like keys to DB columns
            if 'personalData' in onboarding_in: state.personal_data = onboarding_in.get('personalData')
            if 'riskData' in onboarding_in: state.risk_data = onboarding_in.get('riskData')
            if 'financialData' in onboarding_in: state.financial_data = onboarding_in.get('financialData')
            if 'goalsData' in onboarding_in: state.goals_data = onboarding_in.get('goalsData')
            if 'preferencesData' in onboarding_in: state.preferences_data = onboarding_in.get('preferencesData')
            # Mark as complete for viewing in profile
            state.current_step = max(5, int(state.current_step or 5))
            state.completed_steps = [1,2,3,4,5]
            state.is_complete = True
            created['onboarding'] = 1

        # Assets
        for a in payload.get('assets', []) or []:
            try:
                row = Asset(
                    user_id=current_user.id,
                    name=a.get('name'),
                    asset_type=a.get('asset_type') or 'other',
                    current_value=a.get('current_value') or 0,
                    acquisition_cost=a.get('acquisition_cost') or 0,
                    acquisition_date=datetime.fromisoformat((a.get('acquisition_date') or '1970-01-01').replace('Z','+00:00')),
                    description=a.get('description')
                )
                db.add(row)
                created['assets'] += 1
            except Exception:
                continue

        # Liabilities
        for l in payload.get('liabilities', []) or []:
            try:
                row = Liability(
                    user_id=current_user.id,
                    name=l.get('name'),
                    liability_type=l.get('liability_type') or 'other',
                    current_balance=l.get('current_balance') or 0,
                    interest_rate=l.get('interest_rate') or 0,
                    monthly_payment=l.get('monthly_payment') or 0,
                    maturity_date=datetime.fromisoformat((l.get('maturity_date') or '1970-01-01').replace('Z','+00:00')) if l.get('maturity_date') else None,
                )
                db.add(row)
                created['liabilities'] += 1
            except Exception:
                continue

        # Income sources + history
        income = payload.get('income') or {}
        for s in income.get('sources', []) or []:
            try:
                src = IncomeSource(
                    user_id=current_user.id,
                    name=s.get('source_name') or s.get('name') or 'Income',
                    amount=s.get('monthly_amount') or s.get('amount') or 0,
                    frequency=s.get('frequency') or 'monthly',
                )
                # optional start/end
                if s.get('start_date'):
                    src.start_date = datetime.fromisoformat(s.get('start_date').replace('Z','+00:00'))
                if s.get('end_date'):
                    src.end_date = datetime.fromisoformat(s.get('end_date').replace('Z','+00:00'))
                db.add(src)
                db.flush()  # get ID
                created['income_sources'] += 1
                # history
                for h in s.get('history', []) or []:
                    try:
                        row = IncomeSourceHistory(
                            user_id=current_user.id,
                            income_source_id=src.id,
                            effective_date=datetime.fromisoformat(h.get('effective_date').replace('Z','+00:00')),
                            amount=h.get('amount') or 0,
                            frequency=h.get('frequency') or src.frequency
                        )
                        db.add(row)
                        created['income_history'] += 1
                    except Exception:
                        continue
            except Exception:
                continue

        # Expenses
        for e in payload.get('expenses', []) or []:
            try:
                row = Expense(
                    user_id=current_user.id,
                    description=e.get('description') or 'Expense',
                    amount=e.get('amount') or 0,
                    expense_type=e.get('expense_type') or 'general',
                    expense_date=datetime.fromisoformat((e.get('expense_date') or '1970-01-01').replace('Z','+00:00')),
                    is_recurring=False,
                )
                # optional override
                if e.get('category'):
                    setattr(row, 'category_override', e.get('category'))
                db.add(row)
                created['expenses'] += 1
            except Exception:
                continue

        # Goals
        for g in payload.get('goals', []) or []:
            try:
                row = Goal(
                    user_id=current_user.id,
                    name=g.get('name'),
                    target=str(g.get('target_amount') or g.get('target') or ''),
                    current=str(g.get('current_amount') or g.get('current') or ''),
                    target_date=(g.get('target_date') or None),
                )
                db.add(row)
                created['goals'] += 1
            except Exception:
                continue

        # Budget Categories
        for c in payload.get('budget_categories', []) or []:
            try:
                row = ExpenseCategory(
                    user_id=current_user.id,
                    name=c.get('name'),
                    budgeted_amount=c.get('allocated_amount') or c.get('budgeted_amount') or 0,
                    actual_amount=0.0,
                    category_type=c.get('category_type') or 'expense',
                )
                db.add(row)
                created['budget_categories'] += 1
            except Exception:
                continue

        # Journal entries
        for j in payload.get('journal', []) or []:
            try:
                ts = j.get('timestamp')
                ts_dt = datetime.fromisoformat((ts or datetime.utcnow().isoformat()).replace('Z','+00:00'))
                desc = j.get('description') or ''
                lines_json = json.dumps(j.get('lines') or [])
                meta_json = json.dumps(j.get('meta')) if j.get('meta') else None
                row = JournalEntryModel(user_id=current_user.id, timestamp=ts_dt, description=desc, lines_json=lines_json, is_balanced=True, meta_json=meta_json)
                db.add(row)
                created['journal'] += 1
            except Exception:
                continue

        db.commit()
        return { 'status': 'ok', 'created': created }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f'seed failed: {e}')
