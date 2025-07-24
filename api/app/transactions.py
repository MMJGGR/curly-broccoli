from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas import Transaction as TransactionSchema, TransactionCreate, TransactionUpdate
from app.security import get_current_user
from app.crud import transaction as crud_transaction

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.post("/", response_model=TransactionSchema, status_code=status.HTTP_201_CREATED)
def create_transaction(
    tx_in: TransactionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = crud_transaction.create_transaction(db=db, tx_in=tx_in, user_id=current_user.id)
    if tx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Account not found")
    return tx


@router.get("/", response_model=list[TransactionSchema])
def list_transactions(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    start_date: datetime = None,
    end_date: datetime = None,
    sort_by: str = None,
    sort_order: str = "asc",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return crud_transaction.get_transactions(db=db, user_id=current_user.id)


@router.get("/{tx_id}", response_model=TransactionSchema)
def get_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = crud_transaction.get_transaction(db=db, tx_id=tx_id, user_id=current_user.id)
    if tx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return tx


@router.put("/{tx_id}", response_model=TransactionSchema)
def update_transaction(
    tx_id: int,
    tx_in: TransactionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = crud_transaction.update_transaction(db=db, tx_id=tx_id, tx_in=tx_in, user_id=current_user.id)
    if tx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return tx


@router.delete("/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(
    tx_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    tx = crud_transaction.delete_transaction(db=db, tx_id=tx_id, user_id=current_user.id)
    if tx is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Transaction not found")
    return None
