# CHANGE REQUEST CR017 — Structured UX, Unified IA, and Panel Integrations (All Tabs)

Date: 2025-10-07
Status: Implementation (Phase 1–3 complete; optional P1 behind flag)
Owner: Frontend + Design
Reviewers: Product, Backend Lead, QA

Supersedes: CR015 Frontend Enterprise UI Refactor, CR016 Dashboard Tab UX Refinement

## 1) Summary
Adopt a unified, structured information architecture across the 5 primary tabs (Dashboard, Plan, Balance Sheet, Cash Flow, Timeline) using shared design principles and page scaffolding, while preserving each tab’s unique purpose and backend integrations. This CR consolidates and replaces CR015 and CR016 with a single, cohesive implementation plan tied to concrete mockups and acceptance criteria per tab.

## 2) Design Principles (Applied to Every Tab)
- Sectioned IA: Overview → Decision Center → Progress/Health → Analytics/Evidence → Utilities.
- Consistent scaffolding: Layout wrapper, PageHeader, Card containers, tokens, spacing, and elevation tiers.
- Action-first: a single Next Best Action supported by clear evidence and recommendations.
- Calm visuals: tokenized neutrals, softened accents, compact numerals, accessible contrast.
- States: localized Skeletons for loading, EmptyState for no data, Alert for errors/warnings.

## 3) Tabs — Unique Content/Nuance
- Dashboard (aggregator)
  - Cross-cut KPIs, Next Best Action, teasers for Analytics (Spending), and Ledger.
  - Mock: `design/mockups/dashboard_final_structured.svg`

- Plan (decision + scenarios)
  - Scenario toggle (Base/What‑if/Applied), Readiness gauge, Goal Portfolio with coverage + sliders, Pro‑Forma preview, Budget Impact summary.
  - Mock: `design/mockups/plan_final_structured.svg`

- Balance Sheet (policy + structure)
  - Composition with Policy Bands, Top Accounts with liability schedule microtrend, Net Worth trend, Reconciliation & Journal status.
  - Mock: `design/mockups/balance_sheet_final_structured.svg`

- Cash Flow (variance explanation)
  - Period control (Month/Qtr/Year), Server P&L (12m), monthly Waterfall (drivers), Variance table, Cash Runway.
  - Mock: `design/mockups/cash_flow_final_structured.svg`

- Timeline (lanes + dependencies)
  - Filters (All/Completed/Upcoming), lane‑based milestones (Financial Health, Debt, Goals), dependency markers, Event Log.
  - Mock: `design/mockups/timeline_final_structured.svg`

## 4) Backend Integrations (Read‑only unless noted)
- analytics‑v2/spending → Spending Trend panels (Dashboard, Plan, Cash Flow).
- pl/statement (12m) → Cash Flow P&L panel; Dashboard KPI derivations where applicable.
- ledger/journal (read) → Dashboard/Bal. Sheet/Cash Flow journal teasers.
- tb‑audit (read) → Balance Sheet “Reconciliation & Journal” status (balanced/last run).
- goals‑v2/budget‑v2 → Plan Goal Portfolio coverage bars and adjustments.
- timeline‑clean → Timeline lanes/milestones list + statuses.

## 5) Acceptance Criteria (Per Tab)
1) Shared scaffolding & tokens present (Layout, PageHeader, Card; radii/shadows per tokens; no gradient surfaces).
2) Overview KPIs reflect the tab’s purpose (see mocks) with tabular numerals and compact currency.
3) Decision Center exists with one primary “Next Best Action” and rationale; recommendations are evidence-backed.
4) Progress/Health panels present and meaningful per tab (e.g., Timeline progress; Budget Health; Reconciliation status).
5) Analytics/Evidence panels wire to backend endpoints (read-only) where available; graceful EmptyState otherwise.
6) A11y: keyboard/focus/ARIA verified for actions, filters, and charts; WCAG AA color contrast.
7) Performance: localized skeletons; no page‑blocking spinners; quiet background refresh; no repeated fetch loops.

## 6) Implementation Plan (Phased)
Phase 1 — Scaffolding + IA Skeleton (All Tabs) — Completed
- Add/ensure `Layout` + `PageHeader` usage; standardize content width (`max-w-7xl`), paddings, and elevation tiers.
- Lay out per‑tab sections matching the mocks (empty shell components and routes only).

Phase 2 — Panels + Read Wiring (Per Tab) — Completed
- Dashboard: KPI rail, Decision Center, Timeline progress, Spending Trend (analytics‑v2), Journal teaser.
- Plan: Scenario toggle, Readiness gauge, Goal Portfolio coverage bars + adjustment slider UI, Pro‑Forma preview (read‑only diff).
- Balance Sheet: Composition with Policy Bands, Top Accounts + liability schedule microtrend, Net Worth trend, Reconciliation & Journal status.
- Cash Flow: P&L (12m), Waterfall (month), Variance table, Cash Runway gauge.
- Timeline: Filters, lane‑based milestone bands with basic dependency visualization, Event Log (recent).

Phase 3 — States, A11y, Copy, and Polish — Completed
- Localized Skeletons/EmptyStates/Alerts across all panels; ARIA labels; tab order; focus management.
- Tighten microcopy, metrics formatting (tabular numerals), and spacing.

Phase 4 — Optional Enhancements (Feature Flag) — In Progress (optional)
- Scenario apply paths; deeper analytics drilldowns; export options (flag: `REACT_APP_STRUCTURED_UX`)

## 7) Files & Artifacts
- Mocks (SVG): see file paths listed per tab above; annotated variant available for Dashboard.
- Design Guide: update to include Structured IA principles.
- PRD/Wiki: update IA and per‑tab purpose sections.
- Kanban: add tasks per tab for Phases 1–3; track feature flag if used.

## 8) Risks & Mitigations
- Scope creep: keep to read‑only panel integrations + IA; defer apply/CRUD refactors unless trivial.
- Visual regression: componentized rollout with screenshot checks.
- Endpoint variability: always provide EmptyState fallback with remediation CTA.

## 9) Rollout & Validation
- Behind `REACT_APP_STRUCTURED_UX` if needed; otherwise, tab‑by‑tab merges acceptable.
- Cypress smoke per tab; a11y focus check; visual screenshot diffs.

## 10) Relation to Prior CRs
- Supersedes CR015 and CR016 (merge intent and design into this CR).
- Complements CR012 (readiness gaps) and CR014 (infra cleanup).

## 11) Done When — Current Status: Met
- All 5 tabs render with the structured IA and unique panels per mock, with states and a11y verified.
- Analytics/P&L/Ledger read panels wired with graceful fallbacks.
- Docs (Design Guide, PRD, Wiki, Kanban) updated and reflect this IA.
