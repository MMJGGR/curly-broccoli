# CHANGE REQUEST CR015 — Frontend Enterprise UI Refactor + Capability Alignment

Date: 2025-10-07
Status: Superseded (see CR017)
Owner: Frontend
Reviewers: Design, Backend Lead

Note (2025-10-07): This CR is superseded by CHANGE_REQUEST_CR017_STRUCTURED_UX_UNIFIED_IA_AND_PANEL_INTEGRATIONS.md. The unified structured IA and tab-specific panel integrations replace the generic refactor scope described here. Use CR017 for implementation.

## 1) Summary
Elevate the post‑onboarding UI to an enterprise‑grade experience that is quiet, consistent, and accessible. Normalize page scaffolding, reduce visual noise, remove nonessential emojis, standardize components (PageHeader, Card, Button, Alert, EmptyState, Skeleton), and ensure the frontend surfaces key completed backend capabilities (analytics, ledger) where relevant.

## 2) Goals & Non‑Goals
- Goals
  - Normalize Layout + PageHeader across Dashboard, Plan, Balance Sheet, Cash Flow, Timeline.
  - Replace page‑blocking spinners with localized Skeletons; add EmptyStates and Alerts consistently.
  - Remove emojis unless explicitly necessary; use unified Icon set and semantic tokens.
  - Consolidate controls into modals/drawers (progressive disclosure). 
  - Reduce API noise: debounce, short‑circuit repeated fetches, mount‑only metrics (done), quiet background refresh.
  - Surface completed backend capabilities with minimal UI (read‑only to start): Analytics V2 spending, Ledger journal list.
- Non‑Goals
  - New feature modeling (e.g., advanced portfolio optimizers beyond existing endpoints).
  - Major visual brand refresh.

## 3) Scope
- Tabs (in order): Plan, Balance Sheet, Dashboard, Cash Flow, Timeline.
- Cross‑cutting: remove emojis, tighten copy; unify paddings, radii, shadows via tokens; numeric alignment; a11y pass.
- Add thin UI for unused but completed backend endpoints:
  - GET `/api/v1/analytics-v2/spending?months=6` — Spending Analytics panel.
  - GET `/api/v1/ledger/journal` — Journal viewer; optional admin action to POST `/ledger/seed-coa`.

## 4) Acceptance Criteria
1. Visual consistency
   - All pages use `Layout` wrapper, `PageHeader` (title + primary/secondary actions), and `Card` containers.
   - Emojis removed from primary UI; standardized icons used (exceptions documented).
   - Spacing uses 4‑pt scale; consistent `p-6` inside cards.
2. UX states
   - Loading uses `Skeleton/SkeletonText` (no page‑blocking spinners).
   - Empty data states use `EmptyState` with a single primary CTA.
   - Errors use `Alert` with remediation.
3. Performance/noise
   - No repeated budget category fetch loops; background refresh throttled.
   - Metrics ingest posts once per view mount.
4. Backend capability surfacing
   - Spending Analytics panel reads from `/analytics-v2/spending` and renders category/trend summaries.
   - Journal viewer lists entries from `/ledger/journal`.
5. A11y
   - Focus rings visible; icons/buttons have aria‑labels; keyboard accessible modals/drawers; WCAG AA color contrast.

## 5) Implementation Plan
Phase 1 — Framework and Patterns (Day 1)
- Add `PageHeader` component under `components/ui`.
- Normalize `Layout` usage and `max-w-7xl` content width across target pages.
- Remove gradient backgrounds; prefer neutral surfaces.

Phase 2 — Cardization and States (Day 2)
- Plan: group into Cards (Goals Coverage, Budget Alerts, Debt Plan, Retirement Readiness). Collapse details via accordions.
- Balance Sheet: move “Adjust Assumptions” and Advanced panels into modal/drawer. Keep top KPIs in cards.
- Replace spinners with Skeletons; add EmptyStates and Alerts.

Phase 3 — Icons, Copy, A11y, and Backend Panels (Day 3)
- Replace emojis across contextual components with standardized icons; tighten microcopy.
- Add Spending Analytics panel (read‑only) via `/analytics-v2/spending`.
- Add Journal viewer (list) via `/ledger/journal`; optional COA seeding button for empty state.
- Final a11y pass.

## 6) Files (initial set)
- Scaffolding
  - `frontend/src/components/layout/Layout.jsx` (ensure wrapper + tokens)
  - `frontend/src/components/ui/PageHeader.jsx` (new)
- Tabs
  - `frontend/src/components/plan/PlanDashboard.jsx`
  - `frontend/src/components/balance-sheet/BalanceSheetDashboard.jsx`
  - `frontend/src/components/contextual/ContextualTimelineDashboard.jsx`
  - `frontend/src/components/cashflow/CashFlowDashboard.jsx`
  - `frontend/src/components/timeline/ContextualTimelineSystem.jsx` (reduce alerts; swap icons)
  - `frontend/src/components/timeline/MobileTimelineIndicators.jsx` (icon + copy)
- New panels
  - `frontend/src/components/analytics/SpendingAnalyticsPanel.jsx` (GET analytics‑v2)
  - `frontend/src/components/ledger/JournalViewer.jsx` (GET ledger/journal)
- Utilities
  - `frontend/src/utils/icons.tsx` or align with existing `../ui/icons`

## 7) Risks & Mitigations
- Risk: Visual regressions.
  - Mitigation: Component‑by‑component rollout, lightweight screenshots; reuse primitives only.
- Risk: Increased modals/drawers complexity.
  - Mitigation: Shared modal component; keyboard support enforced.
- Risk: Endpoint availability/envs.
  - Mitigation: Read‑only panels degrade gracefully with EmptyState.

## 8) Rollout & Validation
- Behind a feature flag `REACT_APP_ENTERPRISE_UI=1` for initial validation (optional if timelines tight).
- Validate tab‑by‑tab; run cypress smoke + manual a11y focus check.
- Confirm API logs: no repeated category fetches; one metrics POST per view.

## 9) Done When
- All 5 tabs share consistent scaffolding and states.
- Emojis removed (documented exceptions only in onboarding micro‑narrative).
- Analytics and Ledger read views available (read‑only) without breaking flows.

## 10) Open Questions
- Do we want dark mode parity in this pass?
- Do we expose Analytics V1 advanced endpoints in the UI or keep to V2 spending only initially?

---

## Backend Capability Alignment (Audit)
- Used by FE
  - assets‑v2, liabilities‑v2, income‑v2 (overview + CRUD), expenses‑v2, goals‑v2 (overview + CRUD), accounts‑v2, transactions‑v2, profile‑v2, relationships‑v2, budget‑v2, onboarding‑v2‑clean, timeline‑clean, tb‑audit, pl/statement, metrics/ingest, asset‑reference.
- Implemented but not surfaced (gaps)
  - analytics‑v2/spending (Clean architecture): NOT shown in UI — add SpendingAnalyticsPanel.
  - ledger GET `/ledger/journal` and `/ledger/accounts`: UI currently posts journal entries but doesn’t list/inspect them — add JournalViewer with EmptyState and optional seed‑COA action.
  - audits‑clean (server‑side audits): Not shown — optional future “Audit Log” panel.
- Notes
  - Timeline V2 Clean is disabled (deps) — FE uses timeline‑clean.
  - Analytics V1 endpoints exist; FE service points to `/api/v1/analytics/*` for advanced modeling. Keep, but prefer V2 spending for summary UX.
