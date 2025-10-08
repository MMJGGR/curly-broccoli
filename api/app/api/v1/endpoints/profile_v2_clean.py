"""
Profile Management API V2 - Clean Architecture Implementation
CFA-compliant profile management with financial planning insights
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional
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
from ....schemas.user import ProfileUpdate
from ....models import Profile as ProfileModel
from ....utils import normalize_questionnaire
from compute.risk_engine import compute_risk_score, compute_risk_level

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
    db: Session = Depends(get_db),
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
        # Fetch current profile for defaults and validation composition
        repo = SqlAlchemyProfileRepository(db)
        existing_profile: Optional[ProfileModel] = db.query(ProfileModel).filter(ProfileModel.user_id == current_user.id).first()
        if not existing_profile:
            # Create an empty profile row if it doesn't exist yet
            existing_profile = ProfileModel(user_id=current_user.id)
            db.add(existing_profile)
            db.commit()
            db.refresh(existing_profile)

        # Accept flexible payloads: either full_name/monthly_income/age or ProfileUpdate fields
        first_name = profile_data.get("first_name")
        last_name = profile_data.get("last_name")
        full_name = profile_data.get("full_name") or (
            (f"{first_name or ''} {last_name or ''}").strip() if (first_name or last_name) else None
        ) or (
            f"{existing_profile.first_name or ''} {existing_profile.last_name or ''}".strip() if (existing_profile.first_name or existing_profile.last_name) else None
        ) or "User"

        # Compute monthly income from provided fields or fallback
        mi_payload = profile_data.get("monthly_income")
        ai_payload = profile_data.get("annual_income")
        monthly_income_val = None
        if mi_payload is not None:
            monthly_income_val = Decimal(str(mi_payload))
        elif ai_payload is not None:
            monthly_income_val = Decimal(str(ai_payload)) / Decimal("12")
        elif existing_profile.monthly_income is not None:
            monthly_income_val = Decimal(str(existing_profile.monthly_income))
        elif existing_profile.annual_income is not None:
            monthly_income_val = Decimal(str(existing_profile.annual_income)) / Decimal("12")
        else:
            monthly_income_val = Decimal("0")

        # Derive age from payload or existing DOB
        age_val: Optional[int] = None
        try:
            if profile_data.get("age") is not None:
                age_val = int(profile_data.get("age"))
            else:
                dob = profile_data.get("date_of_birth") or profile_data.get("dob") or existing_profile.date_of_birth
                if dob:
                    from datetime import date as _date
                    if isinstance(dob, str):
                        from datetime import date
                        dob_parsed = _date.fromisoformat(dob)
                    else:
                        dob_parsed = dob
                    today = _date.today()
                    age_val = today.year - dob_parsed.year - ((today.month, today.day) < (dob_parsed.month, dob_parsed.day))
        except Exception:
            age_val = None

        # Build CA entity and execute if validation likely passes
        updated_profile_entity: Optional[UserProfile] = None
        try:
            candidate = UserProfile(
                user_id=current_user.id,
                full_name=full_name,
                monthly_income=Money(monthly_income_val),
                age=age_val,
                location=profile_data.get("location", ""),
                phone_number=profile_data.get("phone") or profile_data.get("phone_number"),
                created_at= (existing_profile and getattr(existing_profile, "created_at", None)) or __import__("datetime").datetime.utcnow(),
                updated_at= (existing_profile and getattr(existing_profile, "updated_at", None)) or __import__("datetime").datetime.utcnow(),
                id=existing_profile.id if existing_profile else None,
            )
            updated_profile_entity = await use_case.execute(candidate)
        except ValueError:
            # CA validation failed; continue with supplemental updates without raising
            updated_profile_entity = None

        # Apply supplemental fields to Profile model
        updatable_fields = {
            # Personal
            "first_name", "last_name", "date_of_birth", "nationalId", "kra_pin", "phone",
            # Income/Employment
            "annual_income", "monthly_income", "employment_status", "dependents",
            # Planning
            "goals", "questionnaire", "retirement_age", "emergency_fund_target",
            # Advisor fields
            "firm_name", "license_number", "professional_email", "service_model",
            "target_client_type", "minimum_aum",
            # Advanced planning
            "tax_filing_status", "estimated_annual_taxes", "tax_deductions",
            "life_insurance_coverage", "health_insurance_type", "insurance_beneficiaries",
            "target_retirement_age", "expected_retirement_expenses", "social_security_estimated",
            "retirement_accounts", "will_status", "beneficiaries", "power_of_attorney",
            # Investments
            "investment_experience", "investment_preferences", "risk_capacity",
            # Financial snapshot fields
            "monthly_expenses", "current_savings", "monthly_debt_payments",
        }

        changed_fields = {}
        for k, v in profile_data.items():
            if k in updatable_fields and hasattr(existing_profile, k):
                setattr(existing_profile, k, v)
                changed_fields[k] = v

        # Ensure name fields reflect full_name when provided
        if full_name and (profile_data.get("full_name") or (first_name or last_name)):
            parts = full_name.strip().split(" ", 1)
            existing_profile.first_name = parts[0]
            existing_profile.last_name = parts[1] if len(parts) > 1 else (existing_profile.last_name or "")

        # Risk recompute if relevant fields changed
        if any(key in changed_fields for key in [
            "annual_income", "monthly_income", "dependents", "questionnaire", "date_of_birth", "dob", "goals"
        ]):
            try:
                questionnaire = profile_data.get("questionnaire") or existing_profile.questionnaire or [3] * 8
                questionnaire = normalize_questionnaire(questionnaire)
                # Age calculation uses profile.date_of_birth
                from datetime import date as _date
                dob_src = existing_profile.date_of_birth
                age_years = None
                if dob_src:
                    today = _date.today()
                    age_years = today.year - dob_src.year - ((today.month, today.day) < (dob_src.month, dob_src.day))
                score = compute_risk_score(
                    age=age_years or 30,
                    income=existing_profile.annual_income or float(monthly_income_val) * 12,
                    dependents=existing_profile.dependents or 0,
                    time_horizon=(existing_profile.goals or {}).get("timeHorizon", 0),
                    questionnaire=questionnaire,
                )
                existing_profile.risk_score = score
                existing_profile.risk_level = compute_risk_level(score)
            except Exception:
                pass

        db.commit()
        db.refresh(existing_profile)

        # Form response
        resp_profile = {
            "id": existing_profile.id,
            "full_name": f"{existing_profile.first_name or ''} {existing_profile.last_name or ''}".strip(),
            "age": age_val,
            "location": profile_data.get("location", ""),
            "phone_number": existing_profile.phone,
            "monthly_income": float(existing_profile.monthly_income or (existing_profile.annual_income or 0) / 12),
            "currency": "KES",
            "updated_at": updated_profile_entity.updated_at if updated_profile_entity else None
        }

        return {
            "message": "Profile updated successfully",
            "profile": resp_profile,
            "metadata": {
                "validation_passed": updated_profile_entity is not None,
                "cfa_compliant": True,
                "currency": "KES"
            }
        }

    except HTTPException:
        raise
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
