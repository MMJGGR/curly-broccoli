from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session

from app.models import Transaction, Account
from app.schemas.transaction import TransactionCreate, TransactionUpdate


def create_transaction(db: Session, tx_in: TransactionCreate, user_id: int) -> Optional[Transaction]:
    account = db.query(Account).filter(Account.id == tx_in.account_id, Account.user_id == user_id).first()
    if account is None:
        return None
    tx = Transaction(**tx_in.dict(), user_id=user_id)
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


def get_transaction(db: Session, tx_id: int, user_id: int) -> Optional[Transaction]:
    return db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()


def get_transactions(db: Session, user_id: int, skip: int = 0, limit: int = 100, category: str = None, start_date: datetime = None, end_date: datetime = None, sort_by: str = None, sort_order: str = "asc") -> List[Transaction]:
    query = db.query(Transaction).filter(Transaction.user_id == user_id)

    if category:
        query = query.filter(Transaction.category.ilike(f"%{category}%"))
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)

    if sort_by:
        if sort_order == "desc":
            query = query.order_by(getattr(Transaction, sort_by).desc())
        else:
            query = query.order_by(getattr(Transaction, sort_by).asc())

    return query.offset(skip).limit(limit).all()


def update_transaction(db: Session, tx_id: int, tx_in: TransactionUpdate, user_id: int) -> Optional[Transaction]:
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
    if tx:
        for field, value in tx_in.dict(exclude_unset=True).items():
            setattr(tx, field, value)
        db.commit()
        db.refresh(tx)
    return tx


def delete_transaction(db: Session, tx_id: int, user_id: int) -> Optional[Transaction]:
    tx = db.query(Transaction).filter(Transaction.id == tx_id, Transaction.user_id == user_id).first()
    if tx:
        db.delete(tx)
        db.commit()
    return tx
