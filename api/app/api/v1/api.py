from fastapi import APIRouter

from api.app.api.v1.endpoints import (
    profile, onboarding_consolidated, profile_clean, timeline_clean,
    transactions, accounts, budget, budget_v2_clean, analytics
)

api_router = APIRouter()
# CONSOLIDATED ENDPOINTS - Single Source of Truth
api_router.include_router(onboarding_consolidated.router, tags=["onboarding"])

# Legacy endpoints (DEPRECATED - use onboarding endpoints instead)
# api_router.include_router(profile.router, tags=["profile"]) # DEPRECATED: Use onboarding data
# api_router.include_router(profile_clean.router, prefix="/profile", tags=["profile-clean"]) # DEPRECATED: Use onboarding data
api_router.include_router(timeline_clean.router, prefix="/timeline", tags=["timeline-clean"])

# New real data integration endpoints
api_router.include_router(transactions.router, tags=["transactions"])
api_router.include_router(accounts.router, tags=["accounts"])
api_router.include_router(budget.router, tags=["budget"])

# Clean Architecture endpoints (New)
api_router.include_router(budget_v2_clean.router, tags=["budget-v2-clean"])

# Predictive Analytics endpoints
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
