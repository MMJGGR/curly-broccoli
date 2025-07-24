from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.schemas.income_source import IncomeSource, IncomeSourceCreate, IncomeSourceUpdate
from app.security import get_current_user
from app.crud import income_source as crud_income_source

router = APIRouter(prefix="/income-sources", tags=["income-sources"])

@router.post("/", response_model=IncomeSource, status_code=status.HTTP_201_CREATED)
def create_income_source(
    income_source: IncomeSourceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return crud_income_source.create_income_source(db=db, income_source=income_source, user_id=current_user.id)

@router.get("/{income_source_id}", response_model=IncomeSource)
def read_income_source(
    income_source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_income_source = crud_income_source.get_income_source(db=db, income_source_id=income_source_id, user_id=current_user.id)
    if db_income_source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income source not found")
    return db_income_source

@router.get("/", response_model=List[IncomeSource])
def read_income_sources(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    income_sources = crud_income_source.get_income_sources(db=db, user_id=current_user.id, skip=skip, limit=limit)
    return income_sources

@router.put("/{income_source_id}", response_model=IncomeSource)
def update_income_source(
    income_source_id: int,
    income_source: IncomeSourceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_income_source = crud_income_source.update_income_source(db=db, income_source_id=income_source_id, income_source=income_source, user_id=current_user.id)
    if db_income_source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income source not found")
    return db_income_source

@router.delete("/{income_source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income_source(
    income_source_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_income_source = crud_income_source.delete_income_source(db=db, income_source_id=income_source_id, user_id=current_user.id)
    if db_income_source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Income source not found")
    return {"message": "Income source deleted successfully"}