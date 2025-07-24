from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Account, Transaction
from app.schemas.balance_sheet import InitialBalanceSheetSnapshot
from app.security import get_current_user

router = APIRouter(prefix="/onboarding", tags=["onboarding"])

@router.get("/initial-balance-sheet", response_model=InitialBalanceSheetSnapshot)
def get_initial_balance_sheet(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.id

    total_assets = sum([account.balance for account in db.query(Account).filter(Account.user_id == user_id).all()])
    total_liabilities = 0.0 # Placeholder for now, assuming liabilities are not yet tracked in accounts

    # You might want to calculate liabilities from specific transaction categories or dedicated liability accounts
    # For now, let's assume liabilities are not directly in 'accounts' model for simplicity in this initial snapshot

    net_worth = total_assets - total_liabilities

    return InitialBalanceSheetSnapshot(
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        net_worth=net_worth
    )