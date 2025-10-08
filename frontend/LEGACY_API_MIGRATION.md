# Legacy API Helpers → Clean Architecture Migration

This document maps legacy `frontend/src/api.js` helpers to their clean‑arch replacements and notes the current status.

## Accounts
- listAccounts
  - NOW: `GET /api/v1/accounts-v2/` → returns `{ accounts, summary }` (helper projects to array)
  - STATUS: Clean read path in place
- createAccount, updateAccount, deleteAccount
  - NOW: routed to `POST|PUT|DELETE /api/v1/deprecated/accounts/*` for compatibility
  - NEXT: Implement accounts-v2 CRUD; migrate callers to context or new endpoints; remove legacy routes

## Transactions
- listTransactions
  - NOW: `GET /api/v1/transactions-v2/` with query params; returns `transactions[]`
  - STATUS: Clean read path in place
- createTransaction, updateTransaction, deleteTransaction
  - NOW: routed to `POST|PUT|DELETE /api/v1/deprecated/transactions/*`
  - NEXT: Add transactions-v2 write endpoints; migrate callers; remove legacy routes

## Goals
- listGoals, createGoal, updateGoal, deleteGoal
  - NOW: wrappers map to `goals-v2` endpoints (overview, create, progress update, delete) with shape normalization
  - STATUS: Clean path in place; callers should move to UnifiedFinancialContext

## Milestones (Timeline)
- listMilestones
  - NOW: `GET /api/v1/timeline/journey` → helper projects to `milestones[]`
- createMilestone
  - NOW: `POST /api/v1/timeline/milestone`
- updateMilestone, deleteMilestone
  - NOW: throw deprecation error (no clean endpoints yet)
  - NEXT: Replace with Timeline management use cases/routes; migrate callers

## Deprecation Plan
1) Phase 1 (current): Helpers route to clean/deprecated endpoints; console deprecation warnings on use.
2) Phase 2: Migrate components to contexts (`UnifiedFinancialContext`, `AnalyticsContext`), remove direct helper usage.
3) Phase 3: Remove legacy helper exports from `api.js`.

