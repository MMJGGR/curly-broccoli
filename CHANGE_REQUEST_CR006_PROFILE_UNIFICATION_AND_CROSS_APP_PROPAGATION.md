# CHANGE REQUEST CR006: Profile Unification & Cross‑App Recalculation (CFA‑Compliant)

Date: 2025-09-13  
Status: Proposed  
Priority: P0 – Core functional alignment  
Type: Multi‑component integration + context enhancements  
Assignee: Development Team  
Reviewer: Technical Lead, CFA Compliance Officer

---

## Problem Statement

The Profile tab does not act as a single, authoritative data source. Profile edits (age, income, risk, baseline expenses) do not consistently propagate to dependent features (Budget, Dashboard, Balance Sheet, Goals). Surplus and human capital are not recalculated centrally, and smart entity linkages (e.g., loan payments → liabilities; rental income → property asset) are not enforced in UX. This breaks the Technical Development Guide’s single source of truth principle, weakens CFA‑grade analysis fidelity, and deviates from user journey requirements (e.g., Richard’s).

---

## Scope

In Scope:
- Unify profile into `UnifiedFinancialContext` (read/write) with on‑load hydration and update methods.
- Centralized recalc pipeline on profile changes: Human Capital (HC), Profit & Loss (PL), Balance Sheet (BS) aggregates/ratios, Guidance.
- Budget integration: wire `BudgetOverview.jsx` to unified context; re‑introduce `BudgetCategoryForm.jsx` (CRUD) and add a simple 12‑month projection.
- PL calculator service: derive PL from incomes + expenses; drive Dashboard metrics and BS cross‑checks.
- Smart linking UX: enforce and assist expense↔liability and income↔asset relationships.
- Balance Sheet enhancements: net worth trend (basic) and debt payoff timeline panels.
- Performance: memoized selectors and scoped state updates; <2s cross‑tab sync target.
- Tests, docs, and CI integration updates.

Out of Scope:
- Security hardening, auth changes.
- New backend domains beyond existing v2 endpoints (only minimal profile endpoint consolidation if needed).
- Visual restyling outside of specific components listed.

---

## User Impact

- Primary: All users, especially Richard’s journey, get real‑time, CFA‑consistent calculations when editing profile data.  
- Secondary: QA/Product – consistent data across tabs; fewer discrepancies.

---

## Dependencies

Hard:
- UnifiedFinancialContext in `frontend/src/contexts/TransactionContext.js` (present).
- Profile endpoints: `GET /auth/me`, `PUT /auth/profile`; onboarding state fallback `GET /api/v1/onboarding-v2-clean/state`.
- Existing assets/liabilities/income/expenses/goals v2 endpoints.

Soft:
- Shared expense type defs (already added) and existing BS calculators.
- CI pipeline `.github/workflows/ci.yml`.

---

## Risks & Mitigations

- Data structure mismatches (profile shape vs consumers)  
  Mitigation: Context adapter + selectors; migration in small PRs.
- Performance regressions from broad re‑renders  
  Mitigation: Memoized selectors, scoped dispatches, recalcs on save with debounce during editing.
- UX friction when enforcing smart links  
  Mitigation: Non‑blocking prompts with clear suggestions and quick linking controls.
- Incomplete propagation  
  Mitigation: Automated integration tests verifying Dashboard/Budget/BS updates after profile edits.

---

## Acceptance Criteria

Functional:
- Editing profile income/age/retirement updates BS human capital and Dashboard surplus within 2 seconds.
- “Apply baseline to Budget” on Profile creates or updates normalized expense items; Budget totals and BS monthly expenses reflect immediately.
- Risk questionnaire updates risk profile in context; guidance and allocation recommendations adjust accordingly.
- Expense marked as `loan_payment` prompts linking to a liability; finite payments show remaining term/payoff in BS.
- Rental/investment income can link to an asset (e.g., property/dividends) and is surfaced in portfolio/analytics.

Technical:
- No direct profile fetches in components; only context methods (`fetchProfile`, `updateProfile`).
- Recalc pipeline (HC, PL, BS aggregates/ratios, guidance) executed on `SET_PROFILE` and exposes memoized selectors.
- BudgetOverview and CategoryForm read/write through context and use shared taxonomy.
- E2E: Profile edit → Dashboard/Budget/BS reflect updates; Richard’s flows pass.

Performance:
- Context updates do not trigger unnecessary wide re‑renders; selectors pass basic perf checks.

---

## Affected Sections Mapping

Code Modules (frontend):
- Context: `src/contexts/TransactionContext.js` (profile methods, recalc pipeline, selectors)
- Profile: `src/components/ProfileDynamic.js` → refactor to unified context; deprecate direct fetches
- Budget: `src/components/budget/BudgetOverview.jsx` (wire to context), `src/components/budget/BudgetCategoryForm.jsx` (re‑add, CRUD)
- Expenses: `src/components/tools/ExpenseManagement.jsx` (finite payment validations + link prompts)
- Income: `src/components/tools/IncomeManagement.jsx` (asset linkage controls)
- Balance Sheet: `src/components/balance-sheet/BalanceSheetDashboard.jsx` (trend & payoff panels)
- Shared: `src/components/expenses/expenseTypeDefs.js` (already present)

Tests:
- Unit: selectors (HC, PL, budget summary, risk)
- Integration: profile save → dependent recalcs in Dashboard/Budget/BS
- E2E: Richard journey validations (income change, finite loan, rental property linkage)

Docs:
- WIKI and Kanban entries for CR006; Technical Guide references aligned.

---

## Implementation Plan

Phase A – Context Foundations (profile + pipeline)
1. Add `fetchProfile`/`updateProfile` and `SET_PROFILE` reducer case; hydrate `userProfile` on app start (fallback to onboarding state).
2. Central recalc pipeline on profile change:
   - Human Capital PV (age, retirement, income, growth/discount, survival)
   - PL (sum incomes/expenses via normalized fields)
   - BS aggregates/ratios; guidance updates (risk, emergency fund target)
3. Selectors: `selectHumanCapital`, `selectNetCashFlow`, `selectBudgetSummary`, `selectRiskProfile` (memoized).

Phase B – Profile Refactor
1. Refactor `ProfileDynamic` to rely on unified context; remove direct fetches.
2. Save action: call `updateProfile`, run recalc pipeline, show toast.
3. “Apply baseline to Budget” action: create/update expense items via context using shared taxonomy & `monthly_equivalent`.

Phase C – Budget Overview & Category Form
1. Wire `BudgetOverview.jsx` to unified context; show budget vs actual tiles.
2. Re‑introduce `BudgetCategoryForm.jsx` with CRUD via context and validations.
3. Add simple 12‑month projection using current totals and basic assumptions.

Phase D – PL Calculator Service
1. Implement PL derivation in frontend context (initially) from incomes/expenses.
2. Replace any placeholder surplus logic in Dashboard with PL output.

Phase E – Smart Linking
1. Expense: if `is_finite_payment` or type `debt_payments`, prompt to link `related_liability_id`; enforce end date or remaining payments.
2. Income: add `asset_id` linking for rental/dividend/business income; surface in analytics.

Phase F – Balance Sheet Enhancements
1. Net worth trend using stored snapshots or rolling window of calculations.
2. Debt payoff timeline panel fed by finite liabilities and expense link.

Phase G – Performance & Sync
1. Memoize selectors; scope state to limit renders.
2. Debounce multi‑field profile edits; recalc on save.

Phase H – Tests, Docs, CI
1. Add unit/integration/E2E tests per above.
2. Update WIKI/Kanban and add CR006 link.
3. Ensure CI passes on PRs.

---

## Test Plan

- Unit: selector correctness for HC, PL, budget summary, risk profile.
- Integration: simulate profile update → assert Dashboard surplus, BS human capital/net worth, Budget totals change accordingly.
- E2E: Richard’s flows — income change; loan payment finite & linked; rental income linking to asset; verify cross‑tab updates under 2s.

---

## Rollback Strategy

- Component‑level rollback by PR revert (Profile, BudgetOverview, BS panels).
- Pipeline rollback: disable recalc triggers; fall back to existing calculations.
- Linking rollback: make prompts non‑blocking and turn off enforcement via flag.

---

## CI/CD & Release

- Use existing GitHub Actions workflow `.github/workflows/ci.yml` (API + frontend lint/format/tests + E2E).
- Staged PRs per phase; merge sequentially; monitor CI.
- Update `PROJECT_KANBAN.md` at each merge.

---

## References (Docs Relied On)

- TECHNICAL_DEVELOPMENT_GUIDE.md – Unified context, CRUD standard, real‑time sync, zero hardcoded values.
- PRODUCT_REQUIREMENTS_DOCUMENT.md – Budget (4.2/5.2), Dashboard (4.3/5.3), Balance Sheet (5.4), CRUD features (5.5+).
- CHANGE_REQUEST_CR004_COMPONENT_MIGRATION.md – Migration process and acceptance criteria.
- UNIFIED_FINANCIAL_CONTEXT_IMPLEMENTATION.md – Context consolidation and patterns.
- CR004_PHASE3_IMPLEMENTATION_PLAN.md – Cross‑component sync plans.
- RICHARD_MACHARIA_USER_JOURNEY_ANALYSIS.md – Journey‑driven functional expectations (salary→HC, finite debt, investment).
- WIKI.md – Process non‑negotiables and current phase tracking.

---

## Completion Definition

- Profile edits propagate to Dashboard, Budget, BS, and Guidance under 2s.
- BudgetOverview and CategoryForm functional via context; shared taxonomy everywhere.
- PL calculator drives surplus; no placeholder values.
- Smart linking UX active; debt payoff timeline visible.
- Tests pass; CI green; docs and Kanban updated.

