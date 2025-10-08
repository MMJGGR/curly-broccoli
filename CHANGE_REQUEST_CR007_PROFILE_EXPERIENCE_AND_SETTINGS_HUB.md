# CHANGE REQUEST CR007: Profile Experience and Settings Hub (Cross‑Tab Integrations)

Date: 2025-09-14
Status: PROPOSED
Priority: P0 (Profile UX + Persistence), P1 (Household/Tax/Insurance)
Type: UX/Feature + Cross-Component Integration (no security changes in this CR)
Assignee: Development Team
Reviewer: Technical Lead + Product + CFA Reviewer

---

## Problem Statement

The Profile tab currently shows a basic readout of the user’s data and risk profile but lacks:
- Inline editing for personal/employment details and preferences with reliable persistence.
- A clear completeness/health indicator with actionable guidance.
- A concise highlights strip that ties to Timeline (lifecycle/guidance), Budget (cash flow/savings), and Balance Sheet (human capital).
- Account actions (export/delete) surfaced in one place.

At the same time, deep analytics already exist in other tabs (Timeline, Budget, Balance Sheet). Duplicating those in Profile increases complexity and inconsistency.

Business impact: Users cannot manage core identity and preferences efficiently; onboarding completeness isn’t visible; cross‑tab value is under‑signaled from Profile.

---

## Goals & Non‑Goals

Goals (P0):
- Turn Profile into the single place to view/edit personal data and preferences.
- Persist preferences; surface completeness/health and next steps.
- Provide “highlights” that link to the specialized tabs for deep analysis.
- Add account actions (export, delete) with safe UX.

Goals (P1):
- Add Household/Dependents panel; basic Tax/Insurance subsections (fields already in model).

Non‑Goals:
- Reimplement Timeline/Budget/Balance Sheet analytics inside Profile.
- Security, KYC storage, and PII encryption (tracked separately; implement later).

---

## Scope

In Scope (P0):
- Frontend: Profile subcomponents and save flows in `ProfileDynamic`.
- Backend: Preferences persistence via `/auth/profile`; onboarding preferences mapping.
- Completeness computation (frontend) using `/auth/me` + `/api/v1/onboarding-v2-clean/state`.

In Scope (P1):
- Household editor; Tax/Insurance minimal editors using existing Profile fields.

Out of Scope:
- Schema/infra changes for document storage, consent ledgers, or 3rd‑party integrations.

---

## Deliverables

- Profile subcomponents (new):
  - `ProfileOverviewCard`, `ProfileEditPersonal`, `ProfileEditEmployment`, `ProfilePreferences`
  - `ProfileHealth` (completeness/missing fields + CTAs)
  - `ProfileHighlights` (links: Timeline/Budget/Balance Sheet/Risk retake)
  - `ProfileActions` (Export JSON, Delete Account)
- UnifiedFinancialContext additions:
  - `updateProfile(updates)` already present; add `updatePreferences(updates)` alias and ensure `fetchProfile()` merges preferences.
- Backend adjustments:
  - Include `preferences` JSON in profile responses/updates OR reuse `investment_preferences` as `preferences` container.
  - Map onboarding `preferences_data` → profile preferences in `ProfileDataService.transfer_onboarding_to_profile`.
- Cypress tests: profile load/edit/preferences/delete; deep links verified.

Goal Funding Reality Check & Planner (Cross‑Tab)
- Frontend components:
  - `GoalRealityCheck` panel (Tools/Budget) and a compact `ProfileHighlights` link.
  - Strategy toggles: (A) Adjust timelines to fit surplus; (B) Allocate surplus by goal priority; (C) Recommend discretionary cuts.
  - Plan preview: required monthly per goal vs available surplus; before/after target dates; deficit/excess summary.
- Frontend logic (utility or context method):
  - Inputs: monthly income/expenses from selectors; goals from `/api/v1/goals-v2/overview` (fallback to onboarding goals).
  - Compute per‑goal required monthly = (target - current) / months_to_target.
  - Compare sum(required) vs surplus; derive plan according to chosen strategy.
  - Optional: create budget categories for goal savings using `budget-v2` endpoints to reflect contributions.
- Backend (incremental):
  - Add `PUT /api/v1/goals-v2/{goal_id}` to update `name`, `target`, `target_date` (so timeline adjustments persist).
  - Optional analytics endpoint: `POST /api/v1/analytics/goal-feasibility` to compute server‑side (shared with CI/other clients).
  - No schema changes required for P0; priority can be client‑side weight; future CR may add `priority` and `planned_monthly_contribution` fields.
- Tests:
  - Cypress: generate plan for a user with surplus/deficit; verify proposed dates/allocations; apply plan updates goals/budget categories.
  - Contract tests for new goals update endpoint.

---

## Current State Summary

- ProfileDynamic loads profile via UnifiedFinancialContext, shows risk and some financial info.
- Timeline implements lifecycle guidance; Budget implements cashflow/savings rate; Balance Sheet implements human capital and lifetime view.
- Onboarding stores `preferences_data` but it isn’t surfaced consistently on Profile; Profile model has `investment_preferences` JSON, not general `preferences`.

---

## Proposed Changes

### Frontend
- Add `frontend/src/components/profile/` subcomponents as above and refactor `ProfileDynamic` to compose them.
- Keep heavy analytics out of Profile; instead, show:
  - Savings rate and net cash flow (from selectors) as compact KPIs with a link to Budget.
  - Lifecycle phase and 2–3 “Next Actions” with a link to Timeline.
  - Human capital headline (from selector) with a link to Balance Sheet lifetime view.
- Add preferences toggles (notifications, data sharing, marketing, newsletter) with save to `/auth/profile`.
- Add completeness/health meter (computed client‑side) and list missing items with CTA buttons to edit sections.
- Add Export (download `/auth/me` JSON) and Delete (calls `DELETE /auth/delete-account`, password‑gated) actions.

### Backend
- Profile preferences persistence (choose one):
  1) Add `preferences` JSON field (migration) and include in `ProfileResponse`/`ProfileUpdate`.
  2) Reuse `investment_preferences` as the backing store for UI preferences (least invasive), expose it in `ProfileResponse` as `preferences`.
- `ProfileDataService.transfer_onboarding_to_profile`: if `onboarding.preferences_data` is present, set `profile.preferences`.
- No new endpoints required; reuse `/auth/me`, `/auth/profile`, `/auth/delete-account`.

Goal Funding Reality Check
- Add `PUT /api/v1/goals-v2/{goal_id}` endpoint for updating general goal attributes (target, target_date, name). Keep existing `/progress` for progress only.
- Optional: add `POST /api/v1/analytics/goal-feasibility` to produce a canonical plan given incomes, expenses, and goals (usable by frontend and CI). Initial version can remain frontend‑only.

### Testing
- Cypress: 
  - Profile loads with data → edit personal → save → reload persists.
  - Toggle preferences → save → reload persists.
  - “Retake Risk” link navigates correctly; after retake, risk score updates.
  - Delete flow guarded by confirmation; user logged out after success.
  - Highlights links navigate to Timeline/Budget/Balance Sheet.
- Contract tests: `/auth/me` includes `preferences`; `/auth/profile` accepts partial updates.

---

## Acceptance Criteria

- Profile tab shows Overview, Edit sections, Preferences, Health, Highlights, and Actions.
- Editing personal/employment info persists via `PUT /auth/profile`; risk recalculates if relevant fields change.
- Preferences toggles persist and round‑trip in `/auth/me`.
- Completeness meter and missing fields render consistently; CTAs navigate to the correct edit sections.
- Highlights appear and link correctly to their respective tabs.
- Delete and Export actions work and do not break navigation.
- No duplicated analytics logic from Timeline/Budget/Balance Sheet.

Goal Funding Reality Check
- Reality Check computes per‑goal required monthly vs surplus; plan clearly indicates feasibility and deficits.
- Strategy A (timeline adjust): updated target dates persist via goals update endpoint.
- Strategy B (priority allocation): proposed monthly per goal sums to available surplus; infeasible goals flagged.
- Strategy C (budget cuts): suggested discretionary categories and amounts presented; applying plan updates budget categories.
- Plan application is explicit (preview + confirm), with undo guidance.

---

## Risks & Mitigations

- Data duplication/inconsistency: Avoid by reading analytics via selectors and linking to owning tabs.
- Performance: Recalc only on save; rely on existing selectors for computed values.
- Schema drift: Prefer reuse of `investment_preferences` for P0 to avoid immediate DB migration.

---

## Implementation Plan & Estimates

Phase 1 (1–2 days): Frontend scaffolding
- Add Profile subcomponents; refactor `ProfileDynamic` to compose them.
- Wire save flows to existing `/auth/profile` endpoint.

Phase 2 (0.5–1 day): Preferences
- Use `investment_preferences` as `preferences` (P0) and expose in responses.
- Map onboarding `preferences_data` → `preferences` in service.

Phase 3 (0.5 day): Health & Highlights
- Client‑side completeness computation using `/auth/me` + `/onboarding-v2-clean/state`.
- Highlights strip using existing selectors and links.

Phase 4 (0.5 day): Actions
- Export JSON; Delete flow with password confirm.

Phase 5 (0.5–1 day): Tests
- Cypress specs + minor API contract tests.

Total P0 estimate: ~3–5 days.

P1 (subsequent): Household, Tax, Insurance minimal editors (2–3 days).

P1/P2: Goal Funding Reality Check & Planner (2–4 days)
- Day 1: UI panel + core computation util; wire to selectors and goals API.
- Day 2: Strategy toggles (A/B/C) + plan preview; apply plan (frontend only) + budget category integration.
- Day 3–4: Optional backend update endpoint; analytics endpoint (if needed); Cypress tests.

---

## Affected Areas

Frontend:
- `frontend/src/components/ProfileDynamic.js` (refactor)
- `frontend/src/components/profile/*.js` (new)
- `frontend/src/contexts/TransactionContext.js` (ensure preferences merge; small additions only)

Backend:
- `api/app/auth.py` (ensure preferences included in ProfileResponse/Update)
- `api/app/services/profile_data_service.py` (map onboarding.preferences_data)
- Optional: migration to add `preferences` JSON (or alias reuse)

Docs:
- Update `PROJECT_KANBAN.md` on merge.
- Update `E2E_TESTING_GUIDE.md` (add profile tests) and WIKI.

---

## Rollback Strategy
- UI: Revert Profile subcomponents and restore prior `ProfileDynamic`.
- Backend: If preferences aliasing causes issues, drop exposure without schema change.

---

## References
- PRODUCT_REQUIREMENTS_DOCUMENT.md – Onboarding/Profile/Guidance requirements.
- RICHARD_MACHARIA_USER_JOURNEY_ANALYSIS.md – Journey pain points, outcomes.
- UNIFIED_FINANCIAL_CONTEXT_IMPLEMENTATION.md – Selectors and data flow.
- CHANGE_REQUEST_CR006_PROFILE_UNIFICATION_AND_CROSS_APP_PROPAGATION.md – Prior foundation work.
- TECHNICAL_DEVELOPMENT_GUIDE.md – UX/architecture standards.
