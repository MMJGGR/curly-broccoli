from fastapi import APIRouter

from app.api.v1.endpoints import (
    profile, onboarding_consolidated, profile_clean, timeline_clean,
    transactions, accounts, analytics, income_v2_clean, goals_v2_clean,
    accounts_clean, assets_clean, expenses_clean, liabilities_clean, profile_v2_clean,
    transactions_clean, analytics_clean, relationships_clean, budget_v2_clean, tb_audit, ledger, metrics_ingest, audits_clean, milestones_clean, asset_reference, pl, events, seed  # timeline_v2_clean temporarily disabled due to dependencies
)

api_router = APIRouter()
# CONSOLIDATED ENDPOINTS - Single Source of Truth (Clean Architecture)
api_router.include_router(onboarding_consolidated.router, tags=["onboarding-v2-clean"])

# Legacy endpoints (DEPRECATED - use onboarding endpoints instead)
# api_router.include_router(profile.router, tags=["profile"]) # DEPRECATED: Use onboarding data
# api_router.include_router(profile_clean.router, prefix="/profile", tags=["profile-clean"]) # DEPRECATED: Use onboarding data
api_router.include_router(timeline_clean.router, tags=["timeline-clean"])

# New real data integration endpoints
# Legacy v1 endpoints (deprecated) are mounted under /api/v1/deprecated/* to avoid overlap
api_router.include_router(transactions.router, prefix="/deprecated", tags=["transactions-deprecated"])
api_router.include_router(accounts.router,     prefix="/deprecated", tags=["accounts-deprecated"])
# Clean Architecture endpoints (New)
api_router.include_router(income_v2_clean.router, tags=["income-v2-clean"])  # Fixed: Income V2 Clean Architecture
api_router.include_router(goals_v2_clean.router, tags=["goals-v2-clean"])
api_router.include_router(accounts_clean.router, tags=["accounts-v2-clean"])
api_router.include_router(assets_clean.router, tags=["assets-v2-clean"])
api_router.include_router(expenses_clean.router, tags=["expenses-v2-clean"])
api_router.include_router(liabilities_clean.router, tags=["liabilities-v2-clean"])
api_router.include_router(transactions_clean.router, tags=["transactions-v2-clean"])  # ✅ ENABLED - GetTransactions use case created
api_router.include_router(analytics_clean.router, tags=["analytics-v2-clean"])  # ✅ ENABLED - GetSpendingAnalytics use case created
api_router.include_router(profile_v2_clean.router, tags=["profile-v2-clean"])
api_router.include_router(relationships_clean.router, tags=["relationships-v2-clean"])  # ✅ ENABLED - Cross-component relationship management
api_router.include_router(budget_v2_clean.router, tags=["budget-v2-clean"])  # ✅ ENABLED - Budget V2 endpoints
api_router.include_router(tb_audit.router, tags=["tb-audit"])  # TB audit entries
api_router.include_router(ledger.router, tags=["ledger"])  # Journal entries
api_router.include_router(events.router, tags=["events"])  # Consolidated recent events
api_router.include_router(metrics_ingest.router, tags=["metrics-clean"])  # Client metrics ingestion
api_router.include_router(audits_clean.router, tags=["audits-clean"])  # Server-side audits
api_router.include_router(milestones_clean.router, tags=["milestones-clean"])  # Client milestones persistence
# api_router.include_router(timeline_v2_clean.router, tags=["timeline-v2-clean"])  # TEMPORARILY DISABLED - Missing repository dependencies

# Predictive Analytics endpoints
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

# Reference data + P&L endpoints
api_router.include_router(asset_reference.router, tags=["asset-reference-v1"])  # Asset categories/types
api_router.include_router(pl.router, tags=["pl-v1"])  # Canonical P&L
api_router.include_router(seed.router, tags=["seed"])  # Seed bundle upload
