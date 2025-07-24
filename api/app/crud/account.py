from sqlalchemy.orm import Session
from typing import List, Optional

from app.models import Account, User
from app.schemas.account import AccountCreate, AccountUpdate

def create_account(db: Session, account: AccountCreate, user_id: int) -> Account:
    db_account = Account(
        name=account.name,
        type=account.type,
        balance=account.balance,
        institution_name=account.institution_name,
        user_id=user_id
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

def get_account(db: Session, account_id: int, user_id: int) -> Optional[Account]:
    return db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()

def get_accounts(db: Session, user_id: int, skip: int = 0, limit: int = 100, name: str = None, type: str = None, sort_by: str = None, sort_order: str = "asc") -> List[Account]:
    query = db.query(Account).filter(Account.user_id == user_id)

    if name:
        query = query.filter(Account.name.ilike(f"%{name}%"))
    if type:
        query = query.filter(Account.type.ilike(f"%{type}%"))

    if sort_by:
        if sort_order == "desc":
            query = query.order_by(getattr(Account, sort_by).desc())
        else:
            query = query.order_by(getattr(Account, sort_by).asc())

    return query.offset(skip).limit(limit).all()

def update_account(db: Session, account_id: int, account_in: AccountUpdate, user_id: int) -> Optional[Account]:
    db_account = db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()
    if db_account:
        for field, value in account_in.dict(exclude_unset=True).items():
            setattr(db_account, field, value)
        db.commit()
        db.refresh(db_account)
    return db_account

def delete_account(db: Session, account_id: int, user_id: int) -> Optional[Account]:
    db_account = db.query(Account).filter(Account.id == account_id, Account.user_id == user_id).first()
    if db_account:
        db.delete(db_account)
        db.commit()
    return db_account
