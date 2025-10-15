# 🏦 Personal Finance Application — Kanban (Overhauled)

## 🚀 Current Status: CR012 Completed (Client Journeys) + CR013 Scope Finalized (Advisor)
Status: Completed | Confidence: High

- Clean-arch endpoints in production use for assets, liabilities, income, expenses, goals, relationships, timeline.
- Legacy endpoints mounted under /deprecated and /api/v1/deprecated with Deprecation + Sunset, warning logs, and no UI usage.
- Profile Hub: budget preferences + planning assumptions integrated; profile‑v2 insights merged into unified profile.
- UnifiedFinancialContext orchestrates all financial CRUD + profile; TimelineContext for timeline; AnalyticsContext added.

---

## 🎯 Active Sprint: CR012 Enterprise Readiness (Client Journeys) — Completed

### ✅ Completed (this sprint)
- Backend: Canonical P&L endpoint `/api/v1/pl/statement` (MVP)
- Backend: Asset reference endpoints `/api/v1/asset-reference/*` with seeded Kenya categories/types
- Frontend: AssetForm uses server categories/types (no hardcoded models)
- Frontend: IncomeStatement prefers server P&L with schedule fallback
 - Relationships v2: Replace mock income repo with SQLAlchemyIncomeRepository; asset↔income linking flows unblocked
 - Transactions→Budget variance: Month-to-date variance and basic alerts surfaced in Plan
 - Debt payoff optimizer v1 (snowball): summary panel in Plan (months, interest saved)
 - Retirement readiness v1: readiness score and monthly gap panel in Plan
 - Enforcement & a11y: ESLint rule bans fetch in components (allowlist for auth/onboarding); basic Layout/Stat components added
 - CR009 carryover: Goals Impact panel v1 (avg coverage, under/fully-funded counts)

### 📌 Committed (P0) — Completed
✅ 1) Relationships v2 — Verified E2E asset↔income linking flows (tracking tests)
✅ 2) Transactions→Budget variance drilldowns and alert tuning
✅ 3) Debt payoff optimizer: avalanche option and per‑debt breakdown
✅ 4) Retirement readiness: parameterized assumptions; sensitivity surfaced
✅ 5) Enforcement & a11y — Layout/Stat + skeletons/EmptyState rolled out across major views
✅ 6) Carryovers (from prior CRs, in‑scope) — Closed
   - CR004: removed residual direct fetches (AuthScreen, AdvisorOnboardingComplete, OnboardingWizard, ProfileActions, legacy tools); all financial components use context selectors
   - CR005: finalized budget‑v2 category normalization and goal‑linked naming; de‑duplicated category names
   - CR006: consolidated profile read/write path and coalesced `/auth/me` + insights calls across remaining views
   - CR008: adopted AnalyticsContext across remaining analytics views
   - CR009: finished Goals Impact panel v1; ensured snapshot cards/shared formatters across tabs
   - CR011: Layout wrapper + Stat component; converted “More” links; skeletons/EmptyState and quick a11y fixes

### 🧩 Stretch (P1) — Completed
✅ Cross‑tab scenario overlays (Cash Flow/BS)
✅ Expanded transaction integrations (imports/rules) and variance drilldowns

### ✅ Completed (pre‑sprint groundwork)
- Planning start month added; net‑cash‑flow sparkline + month labels
- After‑Goals Surplus surfaced on dashboard; expense summaries normalized
- Removed legacy FE endpoints (deprecated → v2); legacy profile UIs cleaned

### 📌 Committed (P0)
✅ 1) IA Restructure to 5 Tabs
   - Bottom nav: Dashboard, Plan, Balance Sheet, Cash Flow, Timeline
   - Remove Tools from primary nav; relocate calculators to contextual “More”
✅ 2) Balance Sheet v2 (MVP)
   - KPIs (Current vs Pro Forma), Asset Allocation donut, Liability Composition stack, Net Worth trend
   - Pro Forma control (toggle + date), Goals Impact panel (stub → v1)
✅ 3) Plan Tab Consolidation
   - Goals Reality Check + Goals Audit + coverage bars by goal
   - Milestone Cards hub; quick budget edits (adjust Goal: categories)
✅ 4) Cash Flow Tab
   - Income/Expenses CRUD, Income Statement, Cash Flow Statement
   - Trial Balance Audit in Advanced area; audit banners with suggested actions
✅ 5) Timeline Integration
   - Milestone markers; open Pro Forma snapshot for month; jump to Plan/BS

### 🧩 Stretch (P1)
✅ Domain audits (income/expense/assets/liabilities) produce milestones + actions — Implemented client-side with Suggested Milestones in Plan
✅ Likelihood scoring polish; export/share snapshots — Plan Likelihood gauge added; Balance Sheet snapshot export added
✅ Scenario A/B controls surfaced in Plan/Cash Flow/Balance Sheet (diff summaries)

### ✅ Completed (this sprint)
- Deprecated legacy routers (headers + logs) and removed legacy UI route
- Coalesced /auth/me and unified fetchProfile; merged /api/v1/profile‑v2 insights
- Profile: Budget Preferences + Planning Assumptions (persisted in investment_preferences)
- ProfileHighlights shows Age Category + Emergency Fund Target
- AnalyticsContext added and used by TimelineDashboard
- Risk engine compatibility wrapper fixed; API PUT /auth/profile no longer errors
- Audit logging for profile updates (non‑blocking)
- Route profile updates fully via CA use case path (controller delegates repo sync)
- Profile‑v2 write endpoint expanded (accepts ProfileUpdate) and FE context updates switched to it (with legacy fallback)
- Minimal CA read/write integration tests for profile‑v2 (api/tests/test_profile_v2_clean.py)
- AnalyticsContext adopted in priority views (TimelineDashboard, ScenarioAnalysis, ProbabilityGauge)
- Recommended allocation widget added to Profile
- Legacy helpers in frontend/src/api.js pruned; components migrated to contexts (Accounts, Goals, Timeline)
- E2E script for profile preferences + insights added (test-profile-preferences-e2e.cjs)

#### ✅ Additional Completed (Temporal + UI consistency)
- Profile: de-duplicated personal info block; added anchor to a single editable section
- Profile: goals mini overview synced to unified goals
- Tools: unified Goals + Reality Check into one flow (GoalsOverview + GoalRealityCheck in same section)
- Reality Check: added Before/After table (current vs target vs required/month and post-plan change)
- Income Management: list/edit/delete + total monthly income + lifetime timeline visualization
- Expense Management: lifetime expense timeline (finite, end-dated, linked, or ongoing to retirement)
- Balance Sheet: simplified to Lifetime-only (CFA) with Lifecycle Visualization (human capital vs actual capital)
- Added generic Relationship Engine for temporal links (asset/liability-linked flows, exclusivity, finite payments)

#### ✅ Completed (Trial Balance + Schedules + Valuation)
- Trial Balance (derived, suggestive): selectTrialBalance and applySuggestions in UnifiedFinancialContext
- Schedule Engine: monthly schedules for income/expenses/liability interest/goal funding
- Valuation module: PV utilities (flows, human capital, expenses)
- Balance Sheet wired to valuation + schedules for PV of expenses and human capital
- Trial Balance Audit tool (Tools) with Apply All suggestions
- Timeline overlay shows schedule tracks (Income/Expenses/Goal Funding) across horizon

#### ✅ Completed (Enhancements in this pass)
- Trial Balance Audit: month navigation and journal-style audit log (local)
- Expanded suggestions: asset-linked maintenance/insurance/property tax; loan payment creation/update
- Per-item overrides: income growth and expense inflation via forms; schedule engine consumes overrides
- Backend: TB audit entries endpoint (GET/POST/DELETE) for server-side persistence
- Timeline: click on Expenses track suggests rent end date at selected month
 - Timeline: Scenario A/B — save/load/delete scenarios and overlay tracks for comparison

### 🎯 Sprint Goal
- Lift Journey Coverage from ~67% to ~80% by delivering P&L canonical path, relationships repo, variance/alerts, and v1 advisorship features (debt payoff, retirement readiness), plus enforcement.

### 📌 Committed (P0)
- No remaining committed items — all completed
  - Implemented initial script `test-profile-preferences-e2e.cjs` (expand as needed)

### 🧩 Stretch (P1)
✅ AnalyticsContext adoption across all analytics views (beyond priority ones)

---

## 📋 Backlog — Closed
- Domain audits and milestone generation (income/expense/assets/liabilities) — Done (client)
- Likelihood model improvements; scenario A/B compare; export/share — Done (controls + diffs across tabs; export in BS)
- Expand budget preferences (carryover strategy, zero‑base mode, alert thresholds) — Done
- AnalyticsContext adoption across remaining analytics views — Done
- Optional: PII encryption (feature‑flagged) for nationalId/phone) — Flag wired (REACT_APP_PII_ENCRYPTION)

4) Trial Balance (TB) Enhancements
   - Add journal-style audit log for applied suggestions
   - Expand suggestions: liability amortization split checks; asset-linked maintenance suggestions

5) Schedule + Valuation Enhancements
   - Add per-item growth/inflation overrides surfaced in UI
   - Add curve-based and risk-adjusted modes; Monte Carlo hooks for flows

6) Timeline Integration
   - Add scenario branches (A/B timelines) and diffing of schedules
   - Drag/resize interactions produce suggestions; batch apply from overlay

---

## 🛠 Scripts Added/Updated (This Sprint)
- test-profile-preferences-e2e.cjs — Exercises profile‑v2 update and insights
- api/tests/test_profile_v2_clean.py — Minimal CA read/write integration test


---

## ✅ Done (Recent)
- Unified financial CRUD through UnifiedFinancialContext
- Clean‑arch timeline endpoints used via TimelineContext
- Legacy endpoint deprecation + observability
- Docker compose stability + FE base URL + healthchecks
- CR014 — Legacy Infra Model Removal: deleted `api/app/infrastructure/models/income_model.py` and `base.py`; repositories mapped to canonical `app.models`; dependencies verified (endpoints/use-cases/migrations/tests); API container boot verified

---

## 🧪 Testing Coverage (closed gaps)
- Profile preferences and planning assumptions save cycles (UI → /auth/profile → context refresh) — Covered
- Merge of profile‑v2 insights with /auth/me (happy/sad paths if insights unavailable) — Covered
- Deprecation headers + logs when legacy endpoints are hit — Covered
- AuditLog write on profile update (table creation via create_all path) — Covered
- AnalyticsContext usage in TimelineDashboard and other analytics views — Covered
- Risk score wrapper (compute_risk_score) in both signature modes — Covered
- Delegation in /auth/profile to CA repository (no regressions) — Covered

---

## 📊 Metrics
- Direct UI calls to legacy endpoints: 0 (only /deprecated if manually tested)
- Financial CRUD via contexts: 100%
- Profile insights coverage: age category, emergency fund, expected return
- Request coalescing: /auth/me calls coalesced within 2s window

---

## 🧩 Enterprise Gaps (tracked separately; out of CR012 scope)
- RBAC and field‑level access (advisor vs client)
- PII encryption at rest (nationalId, phone) and migration plan
- Observability: metrics dashboards, tracing, SLO alerts (server ingest endpoint in place)
- IPS generation/storage and advisor workflows
- Formal data retention/backups and data lineage/versioning

## 🎓 CFA Alignment Gaps (tracked separately; out of CR012 scope)
- IPS document and storage (risk, goals, allocation, constraints)
- Risk capacity integration alongside tolerance; questionnaire governance
- Goal funding optimizer tied to recommended allocations
- Scenario/assumption wiring into analytics and timeline
- Consistent server‑side canonical risk throughout UI (remove client calc)

---

Last Updated: 2025‑10‑06
Owner: Engineering

---

## 📦 Upcoming CRs (Bundled with Scenario Catalog)

New cluster CRs (bidirectional links to scenarios and tasks). Each CR lists the scenario tags it closes so we can bulk advance the catalog from Partial/Fail → Pass.

### CR019 — Unified CRUD from Onboarding → Ongoing (Linked & Intuitive)
- Why: Users must create/update income, expenses, liabilities, assets seamlessly during onboarding and later, with links (loan↔payment, asset↔maintenance/insurance) and instant propagation to selectors.
- Scenarios closed: [CR-CRUD] across DB/PL/BS/CF/TL
- Deliverables
  - FE: Consolidate CRUD forms under context; consistent field sets; inline link controls (e.g., “link to liability”)
  - UFC: Ensure normalization and link persistence; idempotent upserts; recalc on save
  - BE: Confirm v2 write paths parity for accounts/transactions
  - QA: Persona journeys for CRUD/linking; degraded states
- Tasks
  - FE: Unified entity form wrappers (Income/Expense/Liability/Asset)
  - FE: Inline link pickers + badges (asset↔expense, liability↔expense)
  - UFC: Normalize temporal/end_date; recalc triggers
  - QA: CRUD/linking e2e matrix (personas x entities)

Status: Completed
- Implemented: Unified entity forms (Assets/Liabilities) with inline linking; Profile quick‑add income; UFC normalization + propagation; onboarding income parity; form error surfacing and required fields
- Notes: Inline link pickers for asset↔maintenance/insurance and liability↔loan payment; recalc triggers validated

### CR020 — Suggestion Apply Pipeline
- Why: Insights must become actions — one‑click apply creates/updates the right entities, sets relationships, and refreshes summaries.
- Scenarios closed: [CR-SUGGEST] across PL/BS/TL/CF
- Deliverables: FE apply buttons, UFC apply handlers; journal entries for traceability
Status: Completed
- Implemented: `applySuggestions` handlers for set_goal_contribution, end_expense, asset maintenance/insurance/property tax, loan payments, and amount updates; audit + journal entries; Apply buttons in Timeline and Trial Balance audit
- Notes: Idempotent create/update paths; fetch + refresh wired

### CR021 — Debt Payoff Execution (Snowball/Avalanche + Apply)
- Why: Move beyond “insight only” — strategy toggle, extra payment, and “apply plan” that updates loan‑payment expenses and budget/goal allocations.
- Scenarios closed: [CR-DEBT] across PL/BS/TL
- Deliverables: Strategy UI; plan preview; apply flow; recalc; undo
Status: Completed
- Implemented: Strategy toggle (snowball/avalanche), monthly extra input, plan preview; Apply flow creates/updates recurring loan payment expenses; refresh + summary
- Notes: Journal+audit piggyback via suggestions pipeline

### CR022 — Variance Without Bank Data (Manual & CSV)
- Why: Budget must be useful without connected accounts; provide manual/CSV workflows with clear guidance.
- Scenarios closed: [CR-VAR] in CF/DB
- Deliverables: Variance UX without txns; CSV import flows; educational copy
Status: Completed
- Implemented: Manual Actuals modal (stores month actuals locally) included in Budget tools; CSV importer (seed modal) for transactions/expenses/income/goals/assets/liabilities/budget categories; variance and alerts computed client‑side
- Notes: Works with/without connected accounts; variance table shown in Structured Cash Flow

### CR023 — Asset Sale → Debt Paydown Workflow
- Why: Common user intent; model selling asset; post proceeds; allocate to debt or goals; reflect in flows/net worth.
- Scenarios closed: [CR-ASSET-SALE] in BS/PL/TL
- Deliverables: Sell flow; proceeds allocation; confirm schedule/net worth updates
Status: Completed
- Implemented: Asset Sale Wizard (Tools) with proceeds allocation to debts/goals; UFC `applyAssetSale` posts journal entries, updates asset value, creates one‑time loan payments, deposits to goals; summary refresh
- Notes: Net worth and cash flow reflect allocations; idempotent operations guarded per entity

### CR024 — Invest vs Debt Tradeoff
- Why: Show tradeoffs and capture the decision as actions (goal contributions vs extra debt payments).
- Scenarios closed: [CR-INV-TRADEOFF] in BS/PL/DB
- Deliverables: Compare view; decision capture → budget/goals or debt payments; summary deltas
Status: Completed
- Implemented: Invest vs Debt panel (Tools) — compare monthly extra allocation between debt strategy and goals coverage lift; Apply actions wire to debt plan and goals budget categories; `selectDebtPaydownPlan` supports extra override
- Notes: Quick, actionable control integrated into Tools

### CR025 — Guided Profile Completion (Point‑in‑Time + History)
- Why: Resolve missing profile fields and the “point‑in‑time vs historical” tension.
- Scenarios closed: [CR-PROFILE], [CR-HISTORY] across tabs
- Deliverables: As‑of snapshot + planning start; optional event backfill; household minimal model; guided CTAs
Status: Completed
- Implemented: Guided CTAs in Profile Health; Planning Start control; household‑aware selectors and computations; prompts wired to sections

---

## 🧭 New Initiative — CR017 Structured UX (Unified IA + Panels)
Status: Implementation (Phase 1–2 completed, Phase 3 in progress)

### Principles (applies to all tabs)
- Sectioned IA: Overview → Decision Center → Progress/Health → Analytics/Evidence → Utilities
- Consistent scaffolding: Layout, PageHeader, Card; tokenized spacing/radii/shadows
- Action-first: one Next Best Action with evidence-backed recommendations
- States: localized Skeletons, EmptyState, Alert; a11y and quiet refresh

### Mocks (SVG)
- Dashboard: `design/mockups/dashboard_final_structured.svg`
- Plan: `design/mockups/plan_final_structured.svg`
- Balance Sheet: `design/mockups/balance_sheet_final_structured.svg`
- Cash Flow: `design/mockups/cash_flow_final_structured.svg`
- Timeline: `design/mockups/timeline_final_structured.svg`

### Sprint Plan (CR017)
P0 — Phase 1: Scaffolding + IA skeleton — Completed
- Layout + PageHeader verified across tabs
- Per‑tab sections scaffolded behind feature flag (`REACT_APP_STRUCTURED_UX`)

P0 — Phase 2: Panels + read wiring — Completed
- Dashboard: KPI rail, Decision Center, Progress & Health, Spending Analytics (analytics‑v2), Journal teaser — wired
- Plan: Scenarios panel, Readiness gauge, Goal Portfolio coverage, Spending Analytics — wired
- Balance Sheet: Composition + Policy Bands sample, Reconciliation & Journal (ledger) — wired
- Cash Flow: P&L (12m), Waterfall (month), Variance table, Runway — wired
- Timeline: KPIs, lane‑based milestones panel, Event Log — wired

P0 — Phase 3: States + a11y + copy polish — In Progress
- Localized skeletons/empties/alerts via child panels; ARIA labels added in key links; pass pending

P1 — Optional (behind flag `REACT_APP_STRUCTURED_UX`)
- Scenario apply paths; deeper drilldowns; exports

### Tasks (Initial Breakdown)
- FE: Add `StructuredLayout` helpers and per‑tab shells [P0]
- FE: Wire Dashboard panels (analytics‑v2, ledger) [P0]
- FE: Wire Plan panels (goals‑v2/budget‑v2/pro‑forma read) [P0]
- FE: Wire Balance Sheet panels (tb‑audit, ledger, allocation/policy) [P0]
- FE: Wire Cash Flow panels (pl/statement, waterfall, variance, runway) [P0]
- FE: Wire Timeline panels (timeline‑clean lanes, event log) [P0]
- A11y + States pass across tabs [P0]
- Feature flag scaffolding (optional) [P1]

### Docs
- CR015/CR016 → Superseded by CR017
- Design Guide, PRD, Wiki → Updated for structured IA

Last Updated: 2025‑10‑07
Owner: Engineering

---

## 🧭 New Proposal — CR018 Structured UX Completions + Temporal History
Status: Proposed → In Planning

### Scope
- FE: icons mapping; wire stubs (Waterfall, Variance, Reports/Exports, Event Log); add Clear Journal utility
- BE: income temporal history; P&L monthly breakdown; variance endpoint; CSV exports; events endpoint; journal clear

### Tasks (Initial)
- BE: Alembic migration for income history (start_date/end_date + history table)
- BE: Extend /pl/statement with breakdown + CSV
- BE: Add /budget-v2/variance and /events/recent
- BE: Add /ledger/journal.csv and DELETE /ledger/journal (clear)
- FE: Icon mapping pass across structured shells
- FE: Cash Flow Waterfall → use breakdown; Variance table → use variance endpoint
- FE: Reports & Exports → CSV download buttons
- FE: Balance Sheet Allocation vs Policy → compute actual vs target
- FE: Timeline Event Log → wire to /events/recent
- FE: Journal → add Clear button with confirm
- Docs/Tests: update guides; add smoke for CSV, variance, events

### Risks
- Data shape drift in CSV/breakdown — mitigate with schema docs and versioning

Last Updated: 2025‑10‑07
Owner: Engineering
