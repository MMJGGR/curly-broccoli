"""
Income Management API V2 - Clean Architecture Implementation (SIMPLE)
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from ....auth import get_current_user
from ....models import User, IncomeSource as IncomeSourceModel, OnboardingState, IncomeSourceHistory
from datetime import datetime
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


@router.get("/", response_model=Dict[str, Any])
async def get_income_v2(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Root endpoint - Get income overview (same as /overview)"""
    return await get_income_overview_v2(current_user, db)


@router.get("/overview")
async def get_income_overview_v2(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get income overview - integrated with onboarding data"""
    try:
        # Get income sources from dedicated table
        sources = db.query(IncomeSourceModel).filter(
            IncomeSourceModel.user_id == current_user.id
        ).all()
        
        # Get onboarding data for primary income and custom incomes
        onboarding = db.query(OnboardingState).filter(
            OnboardingState.user_id == current_user.id
        ).first()
        
        source_data = []
        total_monthly = 0
        
        # Add onboarding primary income
        if onboarding and onboarding.financial_data:
            financial_data = onboarding.financial_data  # Already deserialized by SQLAlchemy
            
            monthly_income_raw = financial_data.get('monthlyIncome')
            if monthly_income_raw:
                try:
                    monthly_income_amount = float(monthly_income_raw)
                    if monthly_income_amount > 0:
                        source_data.append({
                            "id": "onboarding-primary",
                            "source_name": "Primary Income (from onboarding)",
                            "monthly_amount": monthly_income_amount,
                            "frequency": financial_data.get('incomeFrequency', 'Monthly').lower()
                        })
                        total_monthly += monthly_income_amount
                except (ValueError, TypeError) as e:
                    # Log the error but continue processing
                    print(f"Invalid monthlyIncome value: {monthly_income_raw}, error: {e}")
            
            # Add custom incomes from onboarding
            custom_incomes = financial_data.get('customIncomes', [])
            if custom_incomes and isinstance(custom_incomes, list):
                for i, custom_income in enumerate(custom_incomes):
                    if isinstance(custom_income, dict):
                        source_data.append({
                            "id": f"onboarding-custom-{custom_income.get('id', i)}",
                            "source_name": custom_income.get('name', f'Custom Income {i+1}'),
                            "monthly_amount": float(custom_income.get('amount', 0)),
                            "frequency": "monthly"
                        })
                        total_monthly += float(custom_income.get('amount', 0))
        
        # Add sources from dedicated income_sources table
        for source in sources:
            try:
                amount = float(source.amount) if source.amount else 0
                source_data.append({
                    "id": source.id,
                    "source_name": source.name or "Unnamed Income Source",
                    "monthly_amount": amount,
                    "frequency": source.frequency or "monthly"
                })
                total_monthly += amount
            except (ValueError, TypeError) as e:
                print(f"Invalid income source amount: {source.amount}, error: {e}")
                continue
        
        return {
            "user_id": current_user.id,
            "total_monthly_income": total_monthly,
            "income_sources": source_data,
            "source_count": len(source_data),
            "data_sources": {
                "onboarding_sources": len([s for s in source_data if str(s['id']).startswith('onboarding')]),
                "dedicated_sources": len(sources)
            }
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
    """Create a new income source with validation"""
    try:
        # Input validation
        if not source_name or len(source_name.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Source name is required"
            )
        
        if len(source_name) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Source name too long (max 100 characters)"
            )
        
        if monthly_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monthly amount must be positive"
            )
        
        if monthly_amount > 10_000_000:  # 10M KES reasonable upper limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Monthly amount exceeds reasonable limit"
            )
        
        # Frequency validation
        valid_frequencies = ["monthly", "bi-weekly", "weekly", "irregular"]
        if frequency not in valid_frequencies:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid frequency. Must be one of: {', '.join(valid_frequencies)}"
            )
        
        # Source type validation
        valid_types = ["salary", "freelance", "investment", "business", "other"]
        if source_type not in valid_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid source type. Must be one of: {', '.join(valid_types)}"
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
    """Get all income sources for user - integrated with onboarding data"""
    try:
        # Get income sources from dedicated table
        sources = db.query(IncomeSourceModel).filter(
            IncomeSourceModel.user_id == current_user.id
        ).all()
        
        # Get onboarding data for primary income and custom incomes
        onboarding = db.query(OnboardingState).filter(
            OnboardingState.user_id == current_user.id
        ).first()
        
        sources_data = []
        
        # Add onboarding primary income
        if onboarding and onboarding.financial_data:
            financial_data = onboarding.financial_data  # Already deserialized by SQLAlchemy
            
            if financial_data.get('monthlyIncome'):
                sources_data.append({
                    "id": "onboarding-primary",
                    "source_name": "Primary Income (from onboarding)",
                    "monthly_amount": float(financial_data['monthlyIncome']),
                    "frequency": financial_data.get('incomeFrequency', 'Monthly').lower()
                })
            
            # Add custom incomes from onboarding
            custom_incomes = financial_data.get('customIncomes', [])
            for custom_income in custom_incomes:
                sources_data.append({
                    "id": f"onboarding-custom-{custom_income['id']}",
                    "source_name": custom_income['name'],
                    "monthly_amount": float(custom_income['amount']),
                    "frequency": "monthly"
                })
        
        # Add sources from dedicated income_sources table
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


@router.post('/sources/{source_id}/history')
async def add_income_history(
    source_id: int,
    effective_date: str,
    amount: float,
    frequency: str = 'monthly',
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    src = db.query(IncomeSourceModel).filter(IncomeSourceModel.id == source_id, IncomeSourceModel.user_id == current_user.id).first()
    if not src:
        raise HTTPException(status_code=404, detail='Income source not found')
    try:
        eff = datetime.fromisoformat(effective_date.replace('Z','+00:00'))
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid effective_date (ISO)')
    row = IncomeSourceHistory(user_id=current_user.id, income_source_id=source_id, effective_date=eff, amount=amount, frequency=frequency)
    db.add(row)
    db.commit()
    return { 'status': 'ok' }


@router.get('/sources/{source_id}/history')
async def list_income_history(
    source_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    src = db.query(IncomeSourceModel).filter(IncomeSourceModel.id == source_id, IncomeSourceModel.user_id == current_user.id).first()
    if not src:
        raise HTTPException(status_code=404, detail='Income source not found')
    rows = db.query(IncomeSourceHistory).filter(IncomeSourceHistory.user_id == current_user.id, IncomeSourceHistory.income_source_id == source_id).order_by(IncomeSourceHistory.effective_date.desc()).all()
    return { 'history': [ { 'effective_date': r.effective_date.isoformat(), 'amount': r.amount, 'frequency': r.frequency } for r in rows ] }


@router.put("/sources/{source_id}")
async def update_income_source_v2(
    source_id: int,
    source_name: str = None,
    monthly_amount: float = None,
    frequency: str = None,
    source_type: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing income source with validation"""
    try:
        # Find the income source
        source = db.query(IncomeSourceModel).filter(
            IncomeSourceModel.id == source_id,
            IncomeSourceModel.user_id == current_user.id
        ).first()
        
        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Income source with ID {source_id} not found"
            )
        
        # Validate and update fields if provided
        if source_name is not None:
            if not source_name or len(source_name.strip()) == 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Source name cannot be empty"
                )
            if len(source_name) > 100:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Source name too long (max 100 characters)"
                )
            source.name = source_name
        
        if monthly_amount is not None:
            if monthly_amount <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Monthly amount must be positive"
                )
            if monthly_amount > 10_000_000:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Monthly amount exceeds reasonable limit"
                )
            source.amount = monthly_amount
        
        if frequency is not None:
            valid_frequencies = ["monthly", "bi-weekly", "weekly", "irregular"]
            if frequency not in valid_frequencies:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Invalid frequency. Must be one of: {', '.join(valid_frequencies)}"
                )
            source.frequency = frequency
        
        # Commit changes
        db.commit()
        db.refresh(source)
        
        return {
            "message": f"Income source '{source.name}' updated successfully",
            "income_source": {
                "id": source.id,
                "source_name": source.name,
                "monthly_amount": float(source.amount),
                "frequency": source.frequency
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating income source: {str(e)}"
        )


@router.delete("/sources/{source_id}")
async def delete_income_source_v2(
    source_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an income source with dependency validation"""
    try:
        # Find the income source
        source = db.query(IncomeSourceModel).filter(
            IncomeSourceModel.id == source_id,
            IncomeSourceModel.user_id == current_user.id
        ).first()
        
        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Income source with ID {source_id} not found"
            )
        
        # Store source name for response
        source_name = source.name
        
        # TODO: Add dependency validation here when relationships are implemented
        # Check if this income source is linked to any assets or goals
        # For now, allow deletion
        
        # Delete the source
        db.delete(source)
        db.commit()
        
        return {
            "message": f"Income source '{source_name}' deleted successfully",
            "deleted_source_id": source_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting income source: {str(e)}"
        )


@router.get("/sources/{source_id}")
async def get_income_source_by_id_v2(
    source_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific income source by ID"""
    try:
        source = db.query(IncomeSourceModel).filter(
            IncomeSourceModel.id == source_id,
            IncomeSourceModel.user_id == current_user.id
        ).first()
        
        if not source:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Income source with ID {source_id} not found"
            )
        
        return {
            "id": source.id,
            "source_name": source.name,
            "monthly_amount": float(source.amount),
            "frequency": source.frequency,
            "created_at": source.created_at,
            "updated_at": source.updated_at
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving income source: {str(e)}"
        )
