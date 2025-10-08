"""
Liability Management API V2 - Clean Architecture Implementation
CFA-compliant debt tracking with domain entities and use cases
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List, Optional
from datetime import datetime
from decimal import Decimal
from pydantic import BaseModel

from app.auth import get_current_user
from app.models import User
from app.database import get_db

# Import domain entities and enums
from app.domain.entities.liability import Liability, LiabilityType, LiabilityCategory, InterestRateType
from app.domain.entities.money import Money

# Import repository
from app.infrastructure.repositories.sqlalchemy_liability_repository import SqlAlchemyLiabilityRepository

router = APIRouter(prefix="/liabilities-v2", tags=["liabilities-v2-clean"])


def get_liability_repository(db: Session = Depends(get_db)) -> SqlAlchemyLiabilityRepository:
    """Dependency injection for liability repository"""
    return SqlAlchemyLiabilityRepository(db)


# Pydantic models for API requests/responses
class CreateLiabilityRequest(BaseModel):
    name: str
    liability_type: str  # Will be validated against LiabilityType enum
    current_balance: float
    original_amount: Optional[float] = None
    minimum_payment: float
    interest_rate: float  # As percentage (e.g., 18.75 for 18.75%)
    rate_type: str = "fixed"
    
    # Optional fields
    term_months: Optional[int] = None
    remaining_payments: Optional[int] = None
    payment_due_date: Optional[int] = None  # Day of month
    
    # Collateral information
    is_secured: bool = False
    collateral_description: Optional[str] = None
    collateral_value: Optional[float] = None
    
    # Credit information
    credit_limit: Optional[float] = None
    available_credit: Optional[float] = None
    
    # Professional notes
    advisor_notes: Optional[str] = None
    consolidation_candidate: bool = False
    refinance_candidate: bool = False


class UpdateLiabilityRequest(BaseModel):
    name: Optional[str] = None
    current_balance: Optional[float] = None
    minimum_payment: Optional[float] = None
    interest_rate: Optional[float] = None
    rate_type: Optional[str] = None
    remaining_payments: Optional[int] = None
    collateral_value: Optional[float] = None
    available_credit: Optional[float] = None
    days_past_due: Optional[int] = None
    advisor_notes: Optional[str] = None
    consolidation_candidate: Optional[bool] = None
    refinance_candidate: Optional[bool] = None


class LiabilityResponse(BaseModel):
    liability_id: str
    name: str
    liability_type: str
    category: str
    current_balance: float
    original_amount: float
    minimum_payment: float
    interest_rate: float
    monthly_payment: float
    is_secured: bool
    is_high_interest: bool
    credit_utilization_ratio: Optional[float] = None
    payoff_timeline_months: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


class LiabilitiesSummaryResponse(BaseModel):
    total_liabilities: float
    monthly_debt_payments: float
    secured_debt_total: float
    unsecured_debt_total: float
    high_interest_debt_total: float
    credit_utilization_avg: float
    debt_count: int
    liabilities: List[LiabilityResponse]


@router.get("/", response_model=LiabilitiesSummaryResponse)
async def get_user_liabilities_summary(
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyLiabilityRepository = Depends(get_liability_repository)
) -> Dict[str, Any]:
    """Get comprehensive liability summary for the authenticated user"""
    
    try:
        # Get all user liabilities
        liabilities = await repository.get_user_liabilities(current_user.id)
        
        # Calculate summary metrics
        total_liabilities = Decimal('0')
        monthly_payments = Decimal('0')
        secured_total = Decimal('0')
        unsecured_total = Decimal('0')
        high_interest_total = Decimal('0')
        credit_utilization_sum = Decimal('0')
        credit_accounts_count = 0
        
        liability_responses = []
        
        for liability in liabilities:
            # Convert to response format
            liability_response = LiabilityResponse(
                liability_id=liability.liability_id,
                name=liability.name,
                liability_type=liability.liability_type.value,
                category=liability.category.value,
                current_balance=float(liability.current_balance.amount),
                original_amount=float(liability.original_amount.amount),
                minimum_payment=float(liability.minimum_payment.amount),
                interest_rate=float(liability.interest_rate * 100),  # Convert to percentage
                monthly_payment=float(liability.monthly_payment.amount),
                is_secured=liability.is_secured,
                is_high_interest=liability.is_high_interest,
                credit_utilization_ratio=float(liability.credit_utilization_ratio) if liability.credit_utilization_ratio else None,
                payoff_timeline_months=liability.payoff_timeline_months,
                created_at=liability.created_at
            )
            liability_responses.append(liability_response)
            
            # Accumulate totals
            total_liabilities += liability.current_balance.amount
            monthly_payments += liability.monthly_payment.amount
            
            if liability.is_secured:
                secured_total += liability.current_balance.amount
            else:
                unsecured_total += liability.current_balance.amount
            
            if liability.is_high_interest:
                high_interest_total += liability.current_balance.amount
            
            if liability.credit_utilization_ratio:
                credit_utilization_sum += liability.credit_utilization_ratio
                credit_accounts_count += 1
        
        # Calculate average credit utilization
        avg_credit_utilization = (
            float(credit_utilization_sum / credit_accounts_count) 
            if credit_accounts_count > 0 else 0.0
        )
        
        return LiabilitiesSummaryResponse(
            total_liabilities=float(total_liabilities),
            monthly_debt_payments=float(monthly_payments),
            secured_debt_total=float(secured_total),
            unsecured_debt_total=float(unsecured_total),
            high_interest_debt_total=float(high_interest_total),
            credit_utilization_avg=avg_credit_utilization,
            debt_count=len(liabilities),
            liabilities=liability_responses
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get liabilities summary: {str(e)}"
        )


@router.post("/", response_model=LiabilityResponse)
async def create_liability(
    liability_data: CreateLiabilityRequest,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyLiabilityRepository = Depends(get_liability_repository)
) -> Dict[str, Any]:
    """Create a new liability for the authenticated user"""
    
    try:
        # Validate liability type
        try:
            liability_type = LiabilityType(liability_data.liability_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid liability type: {liability_data.liability_type}"
            )
        
        # Validate rate type
        try:
            rate_type = InterestRateType(liability_data.rate_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid rate type: {liability_data.rate_type}"
            )
        
        # Create domain entity
        now = datetime.now()
        
        liability = Liability(
            liability_id="temp",  # Will be set by repository
            user_id=current_user.id,
            name=liability_data.name,
            liability_type=liability_type,
            category=LiabilityCategory.SECURED_LIABILITIES if liability_data.is_secured else LiabilityCategory.UNSECURED_LIABILITIES,
            current_balance=Money(Decimal(str(liability_data.current_balance)), "KES"),
            original_amount=Money(Decimal(str(liability_data.original_amount or liability_data.current_balance)), "KES"),
            minimum_payment=Money(Decimal(str(liability_data.minimum_payment)), "KES"),
            interest_rate=Decimal(str(liability_data.interest_rate / 100)),  # Convert percentage to decimal
            rate_type=rate_type,
            term_months=liability_data.term_months,
            remaining_payments=liability_data.remaining_payments,
            payment_due_date=liability_data.payment_due_date,
            is_secured=liability_data.is_secured,
            collateral_description=liability_data.collateral_description,
            collateral_value=Money(Decimal(str(liability_data.collateral_value)), "KES") if liability_data.collateral_value else None,
            credit_limit=Money(Decimal(str(liability_data.credit_limit)), "KES") if liability_data.credit_limit else None,
            available_credit=Money(Decimal(str(liability_data.available_credit)), "KES") if liability_data.available_credit else None,
            advisor_notes=liability_data.advisor_notes,
            consolidation_candidate=liability_data.consolidation_candidate,
            refinance_candidate=liability_data.refinance_candidate,
            created_at=now,
            updated_at=now
        )
        
        # Create liability through repository
        created_liability = await repository.create_liability(liability)
        
        return LiabilityResponse(
            liability_id=created_liability.liability_id,
            name=created_liability.name,
            liability_type=created_liability.liability_type.value,
            category=created_liability.category.value,
            current_balance=float(created_liability.current_balance.amount),
            original_amount=float(created_liability.original_amount.amount),
            minimum_payment=float(created_liability.minimum_payment.amount),
            interest_rate=float(created_liability.interest_rate * 100),
            monthly_payment=float(created_liability.monthly_payment.amount),
            is_secured=created_liability.is_secured,
            is_high_interest=created_liability.is_high_interest,
            credit_utilization_ratio=float(created_liability.credit_utilization_ratio) if created_liability.credit_utilization_ratio else None,
            payoff_timeline_months=created_liability.payoff_timeline_months,
            created_at=created_liability.created_at
        )
        
    except Exception as e:
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create liability: {str(e)}"
        )


@router.get("/{liability_id}", response_model=LiabilityResponse)
async def get_liability_by_id(
    liability_id: str,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyLiabilityRepository = Depends(get_liability_repository)
) -> Dict[str, Any]:
    """Get a specific liability by ID"""
    
    liability = await repository.get_liability_by_id(liability_id, current_user.id)
    
    if not liability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Liability {liability_id} not found"
        )
    
    return LiabilityResponse(
        liability_id=liability.liability_id,
        name=liability.name,
        liability_type=liability.liability_type.value,
        category=liability.category.value,
        current_balance=float(liability.current_balance.amount),
        original_amount=float(liability.original_amount.amount),
        minimum_payment=float(liability.minimum_payment.amount),
        interest_rate=float(liability.interest_rate * 100),
        monthly_payment=float(liability.monthly_payment.amount),
        is_secured=liability.is_secured,
        is_high_interest=liability.is_high_interest,
        credit_utilization_ratio=float(liability.credit_utilization_ratio) if liability.credit_utilization_ratio else None,
        payoff_timeline_months=liability.payoff_timeline_months,
        created_at=liability.created_at
    )


@router.put("/{liability_id}", response_model=LiabilityResponse)
async def update_liability(
    liability_id: str,
    update_data: UpdateLiabilityRequest,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyLiabilityRepository = Depends(get_liability_repository)
) -> Dict[str, Any]:
    """Update an existing liability"""
    
    # Get existing liability
    existing_liability = await repository.get_liability_by_id(liability_id, current_user.id)
    
    if not existing_liability:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Liability {liability_id} not found"
        )
    
    # Update only provided fields
    updated_fields = {}
    
    if update_data.name is not None:
        updated_fields['name'] = update_data.name
    if update_data.current_balance is not None:
        updated_fields['current_balance'] = Money(Decimal(str(update_data.current_balance)), "KES")
    if update_data.minimum_payment is not None:
        updated_fields['minimum_payment'] = Money(Decimal(str(update_data.minimum_payment)), "KES")
    if update_data.interest_rate is not None:
        updated_fields['interest_rate'] = Decimal(str(update_data.interest_rate / 100))
    if update_data.rate_type is not None:
        updated_fields['rate_type'] = InterestRateType(update_data.rate_type)
    if update_data.remaining_payments is not None:
        updated_fields['remaining_payments'] = update_data.remaining_payments
    if update_data.collateral_value is not None:
        updated_fields['collateral_value'] = Money(Decimal(str(update_data.collateral_value)), "KES")
    if update_data.available_credit is not None:
        updated_fields['available_credit'] = Money(Decimal(str(update_data.available_credit)), "KES")
    if update_data.days_past_due is not None:
        updated_fields['days_past_due'] = update_data.days_past_due
    if update_data.advisor_notes is not None:
        updated_fields['advisor_notes'] = update_data.advisor_notes
    if update_data.consolidation_candidate is not None:
        updated_fields['consolidation_candidate'] = update_data.consolidation_candidate
    if update_data.refinance_candidate is not None:
        updated_fields['refinance_candidate'] = update_data.refinance_candidate
    
    # Update timestamp
    updated_fields['updated_at'] = datetime.now()
    
    # Create updated liability entity
    # This is a bit verbose but ensures type safety
    updated_liability = Liability(
        liability_id=existing_liability.liability_id,
        user_id=existing_liability.user_id,
        name=updated_fields.get('name', existing_liability.name),
        liability_type=existing_liability.liability_type,
        category=existing_liability.category,
        current_balance=updated_fields.get('current_balance', existing_liability.current_balance),
        original_amount=existing_liability.original_amount,
        minimum_payment=updated_fields.get('minimum_payment', existing_liability.minimum_payment),
        interest_rate=updated_fields.get('interest_rate', existing_liability.interest_rate),
        rate_type=updated_fields.get('rate_type', existing_liability.rate_type),
        term_months=existing_liability.term_months,
        remaining_payments=updated_fields.get('remaining_payments', existing_liability.remaining_payments),
        payment_due_date=existing_liability.payment_due_date,
        maturity_date=existing_liability.maturity_date,
        is_secured=existing_liability.is_secured,
        collateral_description=existing_liability.collateral_description,
        collateral_value=updated_fields.get('collateral_value', existing_liability.collateral_value),
        loan_to_value_ratio=existing_liability.loan_to_value_ratio,
        credit_limit=existing_liability.credit_limit,
        available_credit=updated_fields.get('available_credit', existing_liability.available_credit),
        is_active=existing_liability.is_active,
        is_in_default=existing_liability.is_in_default,
        days_past_due=updated_fields.get('days_past_due', existing_liability.days_past_due),
        payment_history_score=existing_liability.payment_history_score,
        advisor_notes=updated_fields.get('advisor_notes', existing_liability.advisor_notes),
        consolidation_candidate=updated_fields.get('consolidation_candidate', existing_liability.consolidation_candidate),
        refinance_candidate=updated_fields.get('refinance_candidate', existing_liability.refinance_candidate),
        created_at=existing_liability.created_at,
        updated_at=updated_fields['updated_at']
    )
    
    # Save updated liability
    saved_liability = await repository.update_liability(updated_liability)
    
    return LiabilityResponse(
        liability_id=saved_liability.liability_id,
        name=saved_liability.name,
        liability_type=saved_liability.liability_type.value,
        category=saved_liability.category.value,
        current_balance=float(saved_liability.current_balance.amount),
        original_amount=float(saved_liability.original_amount.amount),
        minimum_payment=float(saved_liability.minimum_payment.amount),
        interest_rate=float(saved_liability.interest_rate * 100),
        monthly_payment=float(saved_liability.monthly_payment.amount),
        is_secured=saved_liability.is_secured,
        is_high_interest=saved_liability.is_high_interest,
        credit_utilization_ratio=float(saved_liability.credit_utilization_ratio) if saved_liability.credit_utilization_ratio else None,
        payoff_timeline_months=saved_liability.payoff_timeline_months,
        created_at=saved_liability.created_at
    )


@router.delete("/{liability_id}")
async def delete_liability(
    liability_id: str,
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyLiabilityRepository = Depends(get_liability_repository)
) -> Dict[str, str]:
    """Delete (soft delete) a liability"""
    
    success = await repository.delete_liability(liability_id, current_user.id)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Liability {liability_id} not found"
        )
    
    return {"message": f"Liability {liability_id} deleted successfully"}


@router.get("/analysis/high-interest")
async def get_high_interest_liabilities(
    min_rate: float = 15.0,  # Default 15% threshold
    current_user: User = Depends(get_current_user),
    repository: SqlAlchemyLiabilityRepository = Depends(get_liability_repository)
) -> Dict[str, Any]:
    """Get high-interest liabilities for payoff prioritization"""
    
    liabilities = await repository.get_high_interest_liabilities(
        current_user.id, 
        Decimal(str(min_rate / 100))
    )
    
    liability_responses = []
    total_high_interest_debt = Decimal('0')
    
    for liability in liabilities:
        liability_response = LiabilityResponse(
            liability_id=liability.liability_id,
            name=liability.name,
            liability_type=liability.liability_type.value,
            category=liability.category.value,
            current_balance=float(liability.current_balance.amount),
            original_amount=float(liability.original_amount.amount),
            minimum_payment=float(liability.minimum_payment.amount),
            interest_rate=float(liability.interest_rate * 100),
            monthly_payment=float(liability.monthly_payment.amount),
            is_secured=liability.is_secured,
            is_high_interest=liability.is_high_interest,
            credit_utilization_ratio=float(liability.credit_utilization_ratio) if liability.credit_utilization_ratio else None,
            payoff_timeline_months=liability.payoff_timeline_months,
            created_at=liability.created_at
        )
        liability_responses.append(liability_response)
        total_high_interest_debt += liability.current_balance.amount
    
    return {
        "threshold_rate": min_rate,
        "high_interest_count": len(liabilities),
        "total_high_interest_debt": float(total_high_interest_debt),
        "liabilities": liability_responses
    }