from typing import List, Optional
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


def get_transactions(db: Session, user_id: int) -> List[Transaction]:
    return db.query(Transaction).filter(Transaction.user_id == user_id).all()


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
