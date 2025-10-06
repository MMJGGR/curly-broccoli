# Feature Completion and Logic Matrix (Security Excluded)

Date: 2025-10-06
Owner: Engineering

Legend
- Status %: Estimated completion vs intended MVP/PRD scope
- Logic Summary: Current implementation and where logic lives
- Placeholders: Known mock/stub/hardcoded paths to be removed

Scope Note
- This matrix covers client user journeys only and excludes advisor journeys, which are tracked separately under CR013.

## Core Platform & Data
- UnifiedFinancialContext
  - Status: 95%
  - Logic: `frontend/src/contexts/TransactionContext.js` manages CRUD for assets, liabilities, income, expenses, goals, accounts, transactions; selectors for cash flow, budget, schedules; planning start date; TB audit helpers.
  - Placeholders: Server P&L available; FE continues to support schedule fallback.

- Data Model (FE side) & Selectors (Schedules/Audits)
  - Status: 95%
  - Logic: `frontend/src/utils/scheduleEngine.js`, `auditEngine.js`, `valuation.js`.
  - Placeholders: Statements prefer server outputs with schedule fallback.

## Domain CRUD
- Assets CRUD
  - Status: 95%
  - Logic: AssetDashboard/Form/List with context-backed CRUD; summary/analysis; API: `/api/v1/assets-v2/`.
  - Placeholders: Server category/type APIs used via `/api/v1/asset-reference/*` (no hardcoded models).

- Liabilities CRUD
  - Status: 95%
  - Logic: Context-backed CRUD; amortization schedule in schedule engine.
  - Placeholders: None major; ensure server-side parity for validations.

- Income CRUD
  - Status: 90–95%
  - Logic: Context-backed CRUD; optional asset→income relationship POST to relationships-v2.
  - Placeholders: SQLAlchemyIncomeRepository live; relationships v2 endpoints canonical.

- Expenses CRUD
  - Status: 95%
  - Logic: Context-backed CRUD; taxonomy normalization; monthly equivalence; inflation overrides.
  - Placeholders: None major.

- Goals CRUD
  - Status: 90%
  - Logic: Context-backed CRUD; budget category mapping for coverage via `Goal: …` categories.
  - Placeholders: Ensure server-side goals overview coverage coherence.

- Budget Categories
  - Status: 90%
  - Logic: Context reads from budget-v2 endpoints with fallback to local state; upsert/delete via API with local backup.
  - Placeholders: Shapes normalized; parity with server stabilized.

## Aggregations & Analytics
- Balance Sheet v2 (KPIs, Allocation, Liability Composition, Net Worth Trend)
  - Status: 95%
  - Logic: Views under `components/balance-sheet`; uses schedules, valuation, and context selectors.
  - Placeholders: Goals Impact panel v1; server canonical risk/valuation to follow.

- Cash Flow (Income Statement & Cash Flow Statement)
  - Status: 95%
  - Logic: `tools/IncomeStatement.jsx`, `tools/CashFlowStatement.jsx` using schedules; trial balance audit present.
  - Placeholders: Server-side P&L canonical; FE falls back to schedules if unavailable.

- Plan (Coverage Bars, Milestones, Audits)
  - Status: 95%
  - Logic: `plan/PlanDashboard.jsx` integrates audits→suggested milestones, coverage via budget categories.
  - Placeholders: None major; polish Goal Impact and quick-edit reliability.

- Timeline (Contextual Timeline)
  - Status: 90%
  - Logic: `timeline/ContextualTimelineDashboard.jsx` + `TimelineDashboard.jsx`; integrates AnalyticsContext.
  - Placeholders: Server persistence for milestones optional; currently local-first.

- Relationships (asset→income, goal funding, etc.)
  - Status: 95%
  - Logic: BE endpoints exist (`relationships_clean.py`); FE writes basic asset→income links.
  - Placeholders: Real repositories in place; extended relationship methods available.

- Scenario Controls
  - Status: 90%
  - Logic: `analytics/ScenarioControls` and `scenarioStore`; diffing vs current schedules.
  - Placeholders: Persisted scenarios & broader analytics rollout later.

- Trial Balance Audit
  - Status: 90%
  - Logic: Local journal-style suggestions; some BE endpoints for audit entries; apply suggestions pipeline.
  - Placeholders: Expand suggestions and persistence over time.

## CFA & Parameters
- CFA Validation Utilities
  - Status: 85%
  - Logic: `utils/cfaValidation.js`; life expectancy, discount/income growth; validation.
  - Placeholders: Promote parameters to server; canonicalize calculation on BE.

## Onboarding & Profile
- Onboarding Wizard
  - Status: 90%
  - Logic: New wizard; currently calls onboarding v2 endpoints directly; integrates goals/budget creation.
  - Placeholders: Move calls into context/service to avoid direct fetches.

- Profile & Preferences
  - Status: 95%
  - Logic: Unified profile fetch/update via context; analytics insights; recommended allocation widgets.
  - Placeholders: Ensure server-side insights parity and audit logging.

## Accounts & Transactions
- Accounts
  - Status: 85%
  - Logic: Read via accounts-v2; some writes still via deprecated endpoints.
  - Placeholders: Add accounts-v2 write paths.

- Transactions
  - Status: 85%
  - Logic: Read via transactions-v2; writes may route via deprecated endpoints.
  - Placeholders: Add transactions-v2 write paths; normalize shapes.

## UI/UX & Accessibility
- Design Patterns (cards, skeletons, empty states, compact formatting)
  - Status: 90–95%
  - Logic: Implemented across key views; CR011 lays out broader rollout.
  - Placeholders: Broad adoption complete; minor views polish ongoing.

- Accessibility
  - Status: 85%
  - Logic: Patterns in Technical Guide; some forms already compliant.
  - Placeholders: Final sweep via validator; ensure labels/aria across all forms.

## Testing
- E2E & Integration
  - Status: 80–85%
  - Logic: Cypress suites organized; guides in `TESTING_STRATEGY.md`.
  - Placeholders: Contract tests added for Relationships/P&L; expand persona flows and coverage.

## Hardcoded/Placeholder Inventory (status)
- `frontend/src/utils/kenyaReturnRiskModels.js` — no runtime use in AssetForm; retained for analytics modeling; server canonicalization later
- Component-level direct `fetch()` limited to allowlisted Auth/Onboarding/Profile actions and read-only endpoints; contexts/services used elsewhere
- Mock income repo removed — SQLAlchemyIncomeRepository live in Relationships v2
- Client-only P&L replaced by server endpoint; FE schedules used only as fallback
