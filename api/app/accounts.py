from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.account import Account, AccountCreate, AccountUpdate
from app.security import get_current_user
from app.crud import account as crud_account

from app.models import User

router = APIRouter(prefix="/accounts", tags=["accounts"])

@router.post("/", response_model=Account, status_code=status.HTTP_201_CREATED)
def create_account(
    account: AccountCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_account.create_account(db=db, account=account, user_id=current_user.id)

@router.get("/{account_id}", response_model=Account)
def read_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_account = crud_account.get_account(db=db, account_id=account_id, user_id=current_user.id)
    if db_account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return db_account

@router.get("/", response_model=List[Account])
def read_accounts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    accounts = crud_account.get_accounts(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return accounts

@router.put("/{account_id}", response_model=Account)
def update_account(
    account_id: int,
    account: AccountUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_account = crud_account.update_account(db=db, account_id=account_id, account_in=account, user_id=current_user.id)
    if db_account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return db_account

@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    account_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_account = crud_account.delete_account(db=db, account_id=account_id, user_id=current_user.id)
    if db_account is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return {"message": "Account deleted successfully"}