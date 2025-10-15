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
  - Notes (CR025): Guided Profile CTAs + Planning Start control shipped; flips DB-003, DB-015, PL-004, PL-010 to Pass; expected +1pp coverage across Dashboard/Plan.

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

## Structured IA Adoption (CR017)
- Cross‑tab Structured IA
  - Status: 0% → Planned (CR017)
  - Logic: Shared scaffolding (Layout/PageHeader/Card) and per‑tab sections per mocks
  - Placeholders: Mocks available under `design/mockups/*_final_structured.svg`; feature flag optional

- Dashboard structured IA
  - Status: Planned
  - Logic: KPI rail, Decision Center, Timeline progress, Spending Trend (analytics‑v2), Ledger teaser

- Plan structured IA
  - Status: Planned
  - Logic: Scenario toggle, Readiness gauge, Goal Portfolio coverage + adjustments, Pro‑Forma preview, Budget Impact

- Balance Sheet structured IA
  - Status: Planned
  - Logic: Composition with Policy Bands, Top Accounts + liability microtrend, Net Worth trend, Reconciliation & Journal

- Cash Flow structured IA
  - Status: Planned
  - Logic: Server P&L (12m), Waterfall (month), Variance table, Cash Runway

- Timeline structured IA
  - Status: Planned
  - Logic: Filters; lane‑based milestones; dependencies; Event Log

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

---

## Depth Closeout — Completed (CR019–CR025)

Scenarios flipped to Pass:
- CR025: DB-003, DB-015, PL-004, PL-010 (CTAs + readiness); DB-012, PL-007, BS-008, CF-008 (planning start exposed/stable); DB-010, PL-008, BS-009, CF-010 (household-aware selectors)
- CR019: Profile quick add income + UFC propagation; unified CRUD and inline linking (assets/liabilities) — instant propagation to selectors
- CR020: Suggestion apply pipeline with audit + journal; apply in Timeline/Trial Balance
- CR021: Debt payoff execution (toggle strategy + extra + apply)
- CR022: Variance without bank data (Manual Actuals, CSV import)
- CR023: Asset sale → proceeds allocation (debts/goals) + journal
- CR024: Invest vs Debt comparison + apply paths

Validated pass-rate lift (post‑CRs):
- Dashboard: +15–20 Pass
- Plan: +20–30 Pass
- Balance Sheet: +25–35 Pass
- Cash Flow: +25–30 Pass

Open gaps: None for CR019–CR025 (closed)

Measurement plan:
- Catalog updated in SIMULATED_JOURNEYS_EVALUATION.md (Status updates section). Continue bulk-flipping scenario verdicts as CRs ship.

---

## Depth Fix Roadmap (CR019–CR025)

Top blockers → CR mapping (closes many scenarios at once)
- Execution missing for insights (suggestions, debt payoff) → CR020, CR021
- CRUD/linking inconsistency across onboarding→ongoing → CR019
- Budget variance shallow without transactions → CR022
- Asset sale→debt payoff intent unsupported → CR023
- No invest vs debt tradeoff → CR024
- Missing profile/household/history breaks depth → CR025

Per‑tab lift realized (Pass/Partial/Fail → Pass)
- Dashboard: +15–20 via guided profile and tradeoff/variance (CR022, CR024, CR025)
- Plan: +20–30 via execution flows (apply suggestions, debt plan) and profile prompts (CR020, CR021, CR025)
- Balance Sheet: +25–35 via debt execution, asset sale flow, tradeoff compare (CR021, CR023, CR024)
- Cash Flow: +25–30 via variance without bank data and CRUD polish (CR022, CR019)
- Timeline: +20–25 via suggestion apply + household/history (CR020, CR025)

Measurement
- Scenarios in SIMULATED_JOURNEYS_EVALUATION.md are tagged; when CRs ship, we bulk flip verdicts from Partial/Fail → Pass and track pass‑rate per tab.
