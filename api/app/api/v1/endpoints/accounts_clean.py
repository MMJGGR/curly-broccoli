"""
Account Management API V2 - Clean Architecture Implementation
CFA-compliant account tracking with domain entities and use cases
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.auth import get_current_user
from app.models import User
from app.database import get_db

# Import use cases
from app.application.use_cases.get_accounts_summary import GetAccountsSummary

# Import repositories
from app.infrastructure.repositories.sqlalchemy_account_repository import SqlAlchemyAccountRepository

router = APIRouter(prefix="/accounts-v2", tags=["accounts-v2-clean"])


def get_accounts_use_case(db: Session = Depends(get_db)) -> GetAccountsSummary:
    """Dependency injection for accounts use case"""
    repository = SqlAlchemyAccountRepository(db)
    return GetAccountsSummary(repository)


@router.get("/", response_model=Dict[str, Any])
async def get_accounts_summary_v2(
    current_user: User = Depends(get_current_user),
    use_case: GetAccountsSummary = Depends(get_accounts_use_case)
):
    """
    Get comprehensive accounts summary using clean architecture.
    
    Returns account overview with:
    - All user accounts with balances
    - Asset vs liability categorization
    - Net worth calculation
    - CFA-compliant financial metrics
    """
    try:
        result = await use_case.execute(current_user.id)
        
        # Convert to API response format
        accounts_data = []
        for account_info in result["accounts"]:
            accounts_data.append({
                "id": account_info["id"],
                "name": account_info["name"],
                "account_type": account_info["type"],
                "balance": float(account_info["balance"].amount),
                "display_balance": float(account_info["display_balance"].amount),
                "is_asset": account_info["is_asset"],
                "is_liability": account_info["is_liability"],
                "institution_name": account_info["institution"],
                "account_number_last_four": account_info["last_four"],
                "is_active": account_info["is_active"],
                "currency": "KES"
            })
        
        return {
            "user_id": current_user.id,
            "accounts": accounts_data,
            "summary": {
                "total_accounts": result["summary"]["total_accounts"],
                "active_accounts": result["summary"]["active_accounts"],
                "total_assets": float(result["summary"]["total_assets"].amount),
                "total_liabilities": float(result["summary"]["total_liabilities"].amount),
                "net_worth": float(result["summary"]["net_worth"].amount),
                "currency": "KES"
            },
            "financial_health": {
                "asset_liability_ratio": (
                    float(result["summary"]["total_assets"].amount) / 
                    max(float(result["summary"]["total_liabilities"].amount), 1)
                ),
                "net_worth_status": "positive" if result["summary"]["net_worth"].amount > 0 else "negative",
                "accounts_diversification": "good" if result["summary"]["total_accounts"] >= 2 else "limited"
            },
            "metadata": {
                "calculation_method": "clean_architecture",
                "cfa_compliant": True,
                "currency": "KES",
                "net_worth_calculation": "Assets - Liabilities"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving accounts summary: {str(e)}"
        )


@router.get("/health")
async def accounts_health_check():
    """Health check endpoint for accounts service"""
    return {
        "status": "healthy",
        "service": "accounts-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True,
        "features": ["accounts_summary", "net_worth_calculation", "asset_liability_categorization"]
    }