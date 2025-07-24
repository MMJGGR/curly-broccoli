from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import IncomeSource
from app.schemas.income_source import IncomeSourceCreate, IncomeSourceUpdate

def create_income_source(db: Session, income_source: IncomeSourceCreate, user_id: int) -> IncomeSource:
    db_income_source = IncomeSource(**income_source.dict(), user_id=user_id)
    db.add(db_income_source)
    db.commit()
    db.refresh(db_income_source)
    return db_income_source

def get_income_source(db: Session, income_source_id: int, user_id: int) -> Optional[IncomeSource]:
    return db.query(IncomeSource).filter(IncomeSource.id == income_source_id, IncomeSource.user_id == user_id).first()

def get_income_sources(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[IncomeSource]:
    return db.query(IncomeSource).filter(IncomeSource.user_id == user_id).offset(skip).limit(limit).all()

def update_income_source(db: Session, income_source_id: int, income_source: IncomeSourceUpdate, user_id: int) -> Optional[IncomeSource]:
    db_income_source = db.query(IncomeSource).filter(IncomeSource.id == income_source_id, IncomeSource.user_id == user_id).first()
    if db_income_source:
        for field, value in income_source.dict(exclude_unset=True).items():
            setattr(db_income_source, field, value)
        db.commit()
        db.refresh(db_income_source)
    return db_income_source

def delete_income_source(db: Session, income_source_id: int, user_id: int) -> Optional[IncomeSource]:
    db_income_source = db.query(IncomeSource).filter(IncomeSource.id == income_source_id, IncomeSource.user_id == user_id).first()
    if db_income_source:
        db.delete(db_income_source)
        db.commit()
    return db_income_source