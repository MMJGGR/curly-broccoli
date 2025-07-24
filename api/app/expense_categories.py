from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas.expense_category import ExpenseCategory, ExpenseCategoryCreate, ExpenseCategoryUpdate
from app.security import get_current_user
from app.crud import expense_category as crud_expense_category

router = APIRouter(prefix="/expense-categories", tags=["expense-categories"])

@router.post("/", response_model=ExpenseCategory, status_code=status.HTTP_201_CREATED)
def create_expense_category(
    expense_category: ExpenseCategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_expense_category.create_expense_category(db=db, expense_category=expense_category, user_id=current_user.id)

@router.get("/{expense_category_id}", response_model=ExpenseCategory)
def read_expense_category(
    expense_category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_expense_category = crud_expense_category.get_expense_category(db=db, expense_category_id=expense_category_id, user_id=current_user.id)
    if db_expense_category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense category not found")
    return db_expense_category

@router.get("/", response_model=List[ExpenseCategory])
def read_expense_categories(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense_categories = crud_expense_category.get_expense_categories(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return expense_categories

@router.put("/{expense_category_id}", response_model=ExpenseCategory)
def update_expense_category(
    expense_category_id: int,
    expense_category: ExpenseCategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_expense_category = crud_expense_category.update_expense_category(db=db, expense_category_id=expense_category_id, expense_category=expense_category, user_id=current_user.id)
    if db_expense_category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense category not found")
    return db_expense_category

@router.delete("/{expense_category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense_category(
    expense_category_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_expense_category = crud_expense_category.delete_expense_category(db=db, expense_category_id=expense_category_id, user_id=current_user.id)
    if db_expense_category is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense category not found")
    return {"message": "Expense category deleted successfully"}