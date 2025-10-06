# CHANGE REQUEST CR012 — Enterprise Readiness Gap Closure (Core Features, CFA Alignment)

Date: 2025-09-18
Status: Proposed
Owner: Product + Engineering
Reviewers: UX, Backend Lead, CFA Compliance

## 1) Summary
Close remaining core feature gaps to reach enterprise-grade usability and CFA-aligned execution (security excluded). This CR consolidates fixes from prior CRs (esp. CR009 IA/BS v2 and CR011 UI/UX), removes placeholders, finishes missing backend services, eliminates hardcoded domain data, and standardizes front-end patterns under UnifiedFinancialContext.

This CR complements—not replaces—prior CRs. It only closes items explicitly listed here and will not claim closure of deferred items in earlier CRs unless implemented as part of CR012 (see “Relation to Prior CRs”).

## 2) Problem Statement
- Direct `fetch()` calls in several components bypass the unified context.
- Hardcoded Kenya asset categories/risk models (`utils/kenyaReturnRiskModels.js`).
- Relationships service uses a mock income repo; no canonical server-side P&L.
- UI patterns not fully enforced (Selects, forms, accessibility), and skeleton/empty-state patterns not universal.
- Documentation partially lags implementation; some user‑journey and PRD alignment items are incomplete.

## 3) Goals (Non-Security)
- Single source of truth for all financial data and calculations (context + server services).
- No hardcoded business data: all categories/types served by APIs and persisted.
- Canonical server-side services for Relationships and P&L.
- Consistent enterprise UX: forms, validation, accessibility, skeletons, empty states.
- Updated, aligned docs (PRD, Technical Guide, QA Guide, Wiki, Journeys) and test coverage uplift.

## 4) Scope
In scope:
- FE: context adoption, UI/UX enforcement, placeholder removals, BS v2 polish, Plan coverage, Cash Flow statements alignment.
- BE: asset categories/types endpoints + migrations; Relationships with real repos; P&L service endpoint; finalize v2 write paths where pending.
- Docs + Tests: updates and new checks per below.

Out of scope:
- Security hardening, RBAC, PII-at-rest changes (tracked separately).
- Advisor journeys and advisor portal workflows (tracked in CR013; see separation below).

Scope separation
- Client user journeys only: onboarding/profile, income/expenses/budget, debt, goals, balance sheet/net worth, cash flow/P&L, timeline/milestones, scenarios.
- Advisor journeys are independent and will be addressed in CR013 Advisor Portal Alignment.

## 5) Deliverables
### 5.1 Frontend
- Remove direct component `fetch()` for financial data; route through `UnifiedFinancialContext`:
  - Asset types list (AssetForm) → context service `listAssetTypes()` with API backing and fallback.
  - Onboarding save/complete/status → `useUnifiedFinancialContext()` or dedicated `useOnboarding()` shim backed by v2 endpoints.
  - Profile health/state fetches (consolidate via `fetchProfile`).
- Replace hardcoded Kenya models with API-backed selects (categories/types) and feature flag a mock fallback if API unavailable.
- Standardize forms: enterprise validation, accessibility, and keyboard support; ensure real-time validation defaults.
- Apply skeleton/empty-state patterns consistently to Balance Sheet, Plan, Cash Flow summary tiles, and lists.
- Plan tab: Finish Goals Impact panel and ensure budget category (“Goal: …”) quick edits reflect in context and statements.

### 5.2 Backend
- Add database-backed domain data:
  - Tables: `asset_categories`, `asset_types` (as sketched in COMPREHENSIVE_IMPLEMENTATION_PLAN.md).
  - Endpoints: `GET /api/v1/asset-categories`, `GET /api/v1/asset-types/{categoryId}`, `POST/PUT` admin paths.
- Relationships v2: Replace `MockIncomeRepository` with `SQLAlchemyIncomeRepository`; ensure `ManageFinancialRelationships` validates and persists consistently.
- P&L Service: `GET /api/v1/pl/statement?months=12` returning aggregate by month + totals (income, operating_expenses, goal_contributions, net_income). Client statements should use server data when available.
- Finalize v2 write paths parity (accounts/transactions where still routed via deprecated writes) with shape normalization and migration guidance.

### 5.3 Advisor/Life-Coach Step Changes (Outcomes first)
- Baseline Plan: After onboarding, compute budget baseline, surplus, and after‑goals surplus; surface 2–3 highest‑impact actions.
- Debt Plan: For each liability, generate payoff plan (minimums + target), show interest saved; allow “snowball/avalanche” selection.
- Goal Coverage: For each goal, show required/month vs budgeted and one‑tap adjusters; feed milestones and timeline.
- Position & Trajectory: Always‑available BS KPIs + net worth trend and cash‑flow statements; keep “what changed this month” visible.
- What‑ifs: Simple scenario toggles (e.g., +10% income, −15% discretionary) with 12‑month diffs and “apply” to plan.
- Retirement Readiness (v1): Given current income/expenses/liabilities + age, compute simple readiness score and monthly gap.

### 5.4 Enforcement & Tooling
- Pre-commit hooks:
  - UI component validator (SelectContent misuse, required aria patterns on FormField).
  - Hardcoded financial value detection (flag known Kenya model imports; require API/source attribution).
- ESLint rule additions: forbid direct `fetch()` in `components/**` (allow in `contexts/**`, `services/**`).

### 5.5 Documentation Updates
- PRD: Add Architectural Standards (SST via Unified Context; no hardcoded values), Server P&L as canonical, Relationships domain behaviors, and 5‑tab IA user stories integration.
- Technical Guide: Enforcement mechanisms, selector contracts (Pro Forma/Milestones), form/accessibility baseline, API endpoint patterns for domain data.
- QA Testing Guide: Add relationships/P&L contract tests, UI validator tests, and feature coverage checklist.
- Wiki: Update “Current Status” to reflect BS v2 MVP completion and P&L/Relationships service availability.
- User Journeys Addendum: Confirm end-to-end flows and reflect Plan coverage + likelihood ties to budget surplus.

## 6) Acceptance Criteria
1) All financial components access data via context/service; no direct `fetch()` in `components/**` for financial data.
2) Asset categories/types are served from API; no hardcoded Kenya models used in runtime flows.
3) Relationships-v2 uses real repos; FE linking asset→income works and persists.
4) P&L endpoint returns accurate monthly rows and totals; FE statements prefer server data and match client schedules within tolerance.
5) Skeletons/empty-states and enterprise form patterns applied across targeted views.
6) Docs updated as listed; new pre-commit checks prevent regressions; E2E covers Richard persona path.

## 7) Implementation Plan (2 Weeks)
- Week 1
  - BE: Asset categories/types schema + endpoints; SQLAlchemyIncomeRepository; Relationships-v2 integration.
  - FE: Replace hardcoded Kenya models with API-backed selects; move remaining component fetches into context; apply form/accessibility baseline.
- Week 2
  - BE: P&L service endpoint; finalize v2 write paths; response shape normalization.
  - FE: Statements switch to server data with fallback to schedule engine; skeletons/empty-states rollout.
  - Tooling: Pre-commit validators; ESLint rule for direct fetch.
  - Docs + Tests: Update PRD/Tech/QA/Wiki/Journeys; add E2E contracts for Relationships/P&L and full persona flow.

## 8) Risks & Mitigations
- API shape drift: pin response contracts and add contract tests.
- Perceived regression when removing hardcoded lists: provide local fallback with visible banner until API responds.
- Timeline: prioritize P&L/Relationships and category/type APIs in Week 1 if capacity tight.

## 9) Affected Files (Illustrative)
- FE: `src/components/assets/AssetForm.jsx`, `src/components/onboarding/*`, `src/components/profile/*`, `src/contexts/TransactionContext.js`, `src/services/domainData.ts` (new) for categories/types.
- BE: `api/app/api/v1/endpoints/asset_categories.py` (new), `asset_types.py` (new), `.../endpoints/relationships_clean.py` (repo swap), `.../endpoints/pl.py` (new), SQLAlchemy repos for income.
- Docs: `PRODUCT_REQUIREMENTS_DOCUMENT.md`, `TECHNICAL_DEVELOPMENT_GUIDE.md`, `QA_TESTING_GUIDE.md`, `WIKI.md`, `USER_JOURNEYS_ALIGNMENT_ADDENDUM.md`.

## 10) Test Plan
- Unit: Relationships use case with real repos; P&L calculator; category/type repositories.
- Integration: Endpoints for categories/types, relationships, P&L; shape/edge-case validation.
- E2E: Persona (Richard) — create asset → link rental income → add loan → verify BS KPIs, statements, and Plan coverage; verify validators block regressions.

## 11) Closeouts
- CR009: Mark BS v2 MVP complete with Pro Forma + Goals Impact v1.
- CR011: Confirm scroll/layout & compact currency across views; ensure skeletons adopted widely.
- Update Kanban with tasks and statuses per this CR.

## 12) Journey Completion Impact (Estimated)
Baseline Journey Coverage Index (conservative): ~67%

Workstreams and expected lift (non‑additive; overlapping benefits):
- Canonical Server P&L + FE switch: +5–6 pts (statements, drill‑downs, trust)
- Relationships v2 with real repos: +3–4 pts (asset↔income, goal funding correctness)
- API‑backed asset categories/types (remove hardcoded): +2 pts (asset flows, forms stability)
- Transactions→budget variance + simple alerts: +4–5 pts (real‑world budgeting)
- Debt payoff optimizer (snowball/avalanche) v1: +2–3 pts (actionability)
- Retirement readiness (v1): +2–3 pts (advisor‑grade guidance)
- Enforcement + accessibility polish: +1 pt (consistency)

Expected overall after CR012: +13–16 pts → ~80–83% Journey Coverage
Notes: Further gains (>85%) would require deeper transaction integration (imports/rules), advanced goal optimizer, and life‑event playbooks (move abroad, etc.).

## 13) Relation to Prior Change Requests (Complement, don’t conflate)
- CR004 Component Migration: CR012 does not refactor legacy components further; it enforces context usage and removes hardcoded models where still present. Any remaining component migration cleanups stay tracked under CR004.
- CR005 Budget Categories Alignment: CR012’s budget variance and alerts rely on budget‑v2 APIs but do not alter category semantics. CR005 remains the source for category taxonomy work.
- CR006 Profile Unification & Cross‑App Propagation: CR012 depends on unified profile, but does not change propagation mechanics. Any propagation gaps remain under CR006.
- CR007 Profile Experience & Settings Hub: CR012 surfaces baseline plan outcomes; settings UX polish remains in CR007.
- CR008 Clean Arch Profile Pipeline & Analytics Adoption: CR012 builds on these patterns; any profile pipeline analytics gaps remain under CR008.
- CR009 Balance Sheet v2 & IA Restructure: CR012 complements by improving statements/relationships; CR009 stays the owner of IA/BS components beyond MVP.
- CR010 Post‑CR009 Enhancements: CR012 does not close CR010 deferred items (cross‑tab scenario overlays; PII at rest). Those remain open in CR010.
- CR011 UI/UX Review & App Refinements: CR012 adopts enforcement/patterns broadly but leaves visual rebrand out of scope; any non‑addressed UI items remain under CR011.

Advisor separation
- Advisor workflows are not part of CR012 and must not be considered closed here. They are tracked under CR013 Advisor Portal Alignment.
