"""
Profile Management API V2 - Clean Architecture Implementation
CFA-compliant profile management with financial planning insights
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any
from decimal import Decimal

from ....auth import get_current_user
from ....models import User
from ....database import get_db

# Import use cases
from ....application.use_cases.get_user_profile import GetUserProfile, UpdateUserProfile

# Import repositories
from ....infrastructure.repositories.sqlalchemy_profile_repository import (
    SqlAlchemyProfileRepository, 
    SqlAlchemyRiskProfileRepository
)

# Import entities
from ....domain.entities.profile import UserProfile
from ....domain.value_objects.money import Money

router = APIRouter(prefix="/profile-v2", tags=["profile-v2-clean"])


def get_profile_use_case(db: Session = Depends(get_db)) -> GetUserProfile:
    """Dependency injection for profile use case"""
    profile_repo = SqlAlchemyProfileRepository(db)
    risk_repo = SqlAlchemyRiskProfileRepository(db)
    return GetUserProfile(profile_repo, risk_repo)


def get_update_profile_use_case(db: Session = Depends(get_db)) -> UpdateUserProfile:
    """Dependency injection for update profile use case"""
    profile_repo = SqlAlchemyProfileRepository(db)
    return UpdateUserProfile(profile_repo)


@router.get("/", response_model=Dict[str, Any])
async def get_user_profile_v2(
    current_user: User = Depends(get_current_user),
    use_case: GetUserProfile = Depends(get_profile_use_case)
):
    """
    Get comprehensive user profile using clean architecture.
    
    Returns profile with:
    - Basic profile information
    - Risk profile and investment preferences
    - Financial planning insights (emergency fund, age category)
    - CFA-compliant recommendations
    """
    try:
        result = await use_case.execute(current_user.id)
        
        profile = result["profile"]
        risk_profile = result["risk_profile"]
        planning = result["financial_planning"]
        
        # Convert to API response format
        response = {
            "user_id": current_user.id,
            "email": current_user.email,
            "profile": {
                "id": profile.id,
                "full_name": profile.full_name,
                "age": profile.age,
                "location": profile.location,
                "phone_number": profile.phone_number,
                "monthly_income": float(profile.monthly_income.amount),
                "currency": "KES",
                "created_at": profile.created_at,
                "updated_at": profile.updated_at
            },
            "financial_planning": {
                "age_category": planning["age_category"],
                "emergency_fund_target": float(planning["emergency_fund_target"].amount),
                "monthly_income": float(planning["monthly_income"].amount),
                "currency": "KES"
            }
        }
        
        # Add risk profile if it exists
        if risk_profile:
            response["risk_profile"] = {
                "id": risk_profile.id,
                "risk_score": risk_profile.risk_score,
                "risk_level": risk_profile.risk_level,
                "investment_experience": risk_profile.investment_experience,
                "time_horizon": risk_profile.time_horizon,
                "risk_consistency_valid": planning.get("risk_consistency_valid", True),
                "recommended_asset_allocation": planning.get("recommended_asset_allocation", {}),
                "expected_return_rate": float(planning.get("expected_return_rate", Decimal('0.05'))),
                "created_at": risk_profile.created_at,
                "updated_at": risk_profile.updated_at
            }
        else:
            response["risk_profile"] = None
        
        response["metadata"] = {
            "calculation_method": "clean_architecture",
            "cfa_compliant": True,
            "financial_planning_enabled": True,
            "currency": "KES"
        }
        
        return response
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving user profile: {str(e)}"
        )


@router.put("/", response_model=Dict[str, Any])
async def update_user_profile_v2(
    profile_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    use_case: UpdateUserProfile = Depends(get_update_profile_use_case)
):
    """
    Update user profile with business rule validation.
    
    Validates:
    - Age constraints (18-120)
    - Income requirements (positive)
    - Name validation (minimum length)
    """
    try:
        # Create domain entity from request
        profile = UserProfile(
            user_id=current_user.id,
            full_name=profile_data.get("full_name", ""),
            monthly_income=Money(Decimal(str(profile_data.get("monthly_income", 0)))),
            age=int(profile_data.get("age", 25)),
            location=profile_data.get("location", ""),
            phone_number=profile_data.get("phone_number")
        )
        
        # Execute use case with validation
        updated_profile = await use_case.execute(profile)
        
        return {
            "message": "Profile updated successfully",
            "profile": {
                "id": updated_profile.id,
                "full_name": updated_profile.full_name,
                "age": updated_profile.age,
                "location": updated_profile.location,
                "phone_number": updated_profile.phone_number,
                "monthly_income": float(updated_profile.monthly_income.amount),
                "currency": "KES",
                "updated_at": updated_profile.updated_at
            },
            "metadata": {
                "validation_passed": True,
                "cfa_compliant": True,
                "currency": "KES"
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating profile: {str(e)}"
        )


@router.get("/health")
async def profile_health_check():
    """Health check endpoint for profile service"""
    return {
        "status": "healthy",
        "service": "profile-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True,
        "features": [
            "user_profile_management",
            "risk_profile_integration", 
            "financial_planning_insights",
            "business_rule_validation"
        ]
    }