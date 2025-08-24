from fastapi import APIRouter

from app.api.v1.endpoints import (
    profile, onboarding_consolidated, profile_clean, timeline_clean,
    transactions, accounts, budget, budget_v2_clean, analytics, income_v2_clean, goals_v2_clean
    # transactions_clean, analytics_clean, accounts_clean, profile_v2_clean, timeline_v2_clean  # Temporarily disabled - missing use cases
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
api_router.include_router(income_v2_clean.router, tags=["income-v2-clean"])  # Fixed: Income V2 Clean Architecture
api_router.include_router(goals_v2_clean.router, tags=["goals-v2-clean"])
# api_router.include_router(transactions_clean.router, tags=["transactions-v2-clean"])  # Temporarily disabled - missing use case
# api_router.include_router(analytics_clean.router, tags=["analytics-v2-clean"])  # Temporarily disabled - missing use case
# api_router.include_router(accounts_clean.router, tags=["accounts-v2-clean"])  # Temporarily disabled - missing use case
# api_router.include_router(profile_v2_clean.router, tags=["profile-v2-clean"])  # Temporarily disabled - missing use case
# api_router.include_router(timeline_v2_clean.router, tags=["timeline-v2-clean"])  # Temporarily disabled - missing use case

# Predictive Analytics endpoints
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
