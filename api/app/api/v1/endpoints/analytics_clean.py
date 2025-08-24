"""
Analytics API V2 - Clean Architecture Implementation
CFA-compliant financial analytics using domain entities and use cases
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any

from ....auth import get_current_user
from ....models import User
from ....database import get_db

# Import use cases
from ....application.use_cases.get_spending_analytics import GetSpendingAnalytics

# Import repositories
from ....infrastructure.repositories.sqlalchemy_transaction_repository import SqlAlchemyTransactionRepository

router = APIRouter(prefix="/analytics-v2", tags=["analytics-v2-clean"])


def get_analytics_use_case(db: Session = Depends(get_db)) -> GetSpendingAnalytics:
    """Dependency injection for analytics use case"""
    repository = SqlAlchemyTransactionRepository(db)
    return GetSpendingAnalytics(repository)


@router.get("/spending", response_model=Dict[str, Any])
async def get_spending_analytics_v2(
    months: int = 6,
    current_user: User = Depends(get_current_user),
    use_case: GetSpendingAnalytics = Depends(get_analytics_use_case)
):
    """
    Get comprehensive spending analytics using clean architecture.
    
    Returns spending analysis with:
    - Income vs expense totals
    - Savings rate and expense ratio
    - Category breakdowns
    - Monthly trends
    """
    try:
        if months < 1 or months > 24:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Months must be between 1 and 24"
            )
        
        analytics = await use_case.execute(current_user.id, months)
        
        # Convert to API response format
        return {
            "user_id": current_user.id,
            "period": {
                "months": months,
                "analysis_type": "spending_analytics"
            },
            "totals": {
                "total_income": float(analytics.total_income.amount),
                "total_expenses": float(analytics.total_expenses.amount),
                "net_cash_flow": float(analytics.net_cash_flow.amount),
                "currency": "KES"
            },
            "ratios": {
                "savings_rate_pct": float(analytics.get_savings_rate()),
                "expense_ratio_pct": float(analytics.get_expense_ratio())
            },
            "category_breakdown": {
                category: float(amount.amount) 
                for category, amount in analytics.expense_by_category.items()
            },
            "insights": {
                "largest_expense_category": analytics.get_largest_expense_category(),
                "cash_flow_status": "positive" if analytics.net_cash_flow.amount > 0 else "negative",
                "financial_health": "excellent" if analytics.get_savings_rate() > 20 else
                                 "good" if analytics.get_savings_rate() > 10 else
                                 "needs_improvement"
            },
            "monthly_trends": [
                {
                    "month": trend["month"],
                    "income": float(trend["income"].amount),
                    "expenses": float(trend["expenses"].amount),
                    "net": float(trend["net"].amount)
                }
                for trend in analytics.monthly_trends
            ],
            "metadata": {
                "calculation_method": "clean_architecture",
                "cfa_compliant": True,
                "analysis_period_months": months,
                "currency": "KES"
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating spending analytics: {str(e)}"
        )


@router.get("/health")
async def analytics_health_check():
    """Health check endpoint for analytics service"""
    return {
        "status": "healthy",
        "service": "analytics-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True,
        "features": ["spending_analytics", "category_breakdown", "savings_rate"]
    }