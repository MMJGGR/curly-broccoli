from typing import List, Optional
from sqlalchemy.orm import Session

from app.models import ExpenseCategory
from app.schemas.expense_category import ExpenseCategoryCreate, ExpenseCategoryUpdate

def create_expense_category(db: Session, expense_category: ExpenseCategoryCreate, user_id: int) -> ExpenseCategory:
    db_expense_category = ExpenseCategory(**expense_category.dict(), user_id=user_id)
    db.add(db_expense_category)
    db.commit()
    db.refresh(db_expense_category)
    return db_expense_category

def get_expense_category(db: Session, expense_category_id: int, user_id: int) -> Optional[ExpenseCategory]:
    return db.query(ExpenseCategory).filter(ExpenseCategory.id == expense_category_id, ExpenseCategory.user_id == user_id).first()

def get_expense_categories(db: Session, user_id: int, skip: int = 0, limit: int = 100) -> List[ExpenseCategory]:
    return db.query(ExpenseCategory).filter(ExpenseCategory.user_id == user_id).offset(skip).limit(limit).all()

def update_expense_category(db: Session, expense_category_id: int, expense_category: ExpenseCategoryUpdate, user_id: int) -> Optional[ExpenseCategory]:
    db_expense_category = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense_category_id, ExpenseCategory.user_id == user_id).first()
    if db_expense_category:
        for field, value in expense_category.dict(exclude_unset=True).items():
            setattr(db_expense_category, field, value)
        db.commit()
        db.refresh(db_expense_category)
    return db_expense_category

def delete_expense_category(db: Session, expense_category_id: int, user_id: int) -> Optional[ExpenseCategory]:
    db_expense_category = db.query(ExpenseCategory).filter(ExpenseCategory.id == expense_category_id, ExpenseCategory.user_id == user_id).first()
    if db_expense_category:
        db.delete(db_expense_category)
        db.commit()
    return db_expense_category