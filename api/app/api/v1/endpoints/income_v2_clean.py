"""
Income Management API V2 - Clean Architecture Implementation (SIMPLE)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from ....auth import get_current_user
from ....models import User, IncomeSource as IncomeSourceModel
from ....database import get_db

router = APIRouter(prefix="/income-v2", tags=["income-v2-clean"])


@router.get("/health")
async def income_health_check():
    """Health check endpoint for income service"""
    return {
        "status": "healthy",
        "service": "income-v2-clean", 
        "architecture": "clean_architecture",
        "cfa_compliant": True
    }


@router.get("/overview")
async def get_income_overview_v2(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get income overview - SIMPLE version"""
    try:
        # Get all income sources for user
        sources = db.query(IncomeSourceModel).filter(
            IncomeSourceModel.user_id == current_user.id
        ).all()
        
        total_monthly = sum(float(source.amount) for source in sources)
        
        source_data = []
        for source in sources:
            source_data.append({
                "id": source.id,
                "source_name": source.name,
                "monthly_amount": float(source.amount),
                "frequency": source.frequency
            })
        
        return {
            "user_id": current_user.id,
            "total_monthly_income": total_monthly,
            "income_sources": source_data,
            "source_count": len(sources)
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving income overview: {str(e)}"
        )


@router.post("/sources", status_code=status.HTTP_201_CREATED)
async def create_income_source_v2(
    source_name: str,
    monthly_amount: float,
    frequency: str = "monthly",
    source_type: str = "salary",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new income source - SIMPLE version"""
    try:
        # Basic validation
        if monthly_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monthly amount must be positive"
            )
        
        # Create new income source
        new_source = IncomeSourceModel(
            user_id=current_user.id,
            name=source_name,
            amount=monthly_amount,
            frequency=frequency
        )
        
        db.add(new_source)
        db.commit()
        db.refresh(new_source)
        
        return {
            "message": f"Income source '{source_name}' created successfully",
            "income_source": {
                "id": new_source.id,
                "source_name": new_source.name,
                "monthly_amount": float(new_source.amount),
                "frequency": new_source.frequency
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating income source: {str(e)}"
        )


@router.get("/sources")
async def get_income_sources_v2(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all income sources for user - SIMPLE version"""
    try:
        sources = db.query(IncomeSourceModel).filter(
            IncomeSourceModel.user_id == current_user.id
        ).all()
        
        sources_data = []
        for source in sources:
            sources_data.append({
                "id": source.id,
                "source_name": source.name,
                "monthly_amount": float(source.amount),
                "frequency": source.frequency
            })
        
        return sources_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving income sources: {str(e)}"
        )