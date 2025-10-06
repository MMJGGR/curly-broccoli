# CHANGE REQUEST CR009: Balance Sheet v2 + 5‑Tab IA (Milestones/Pro Forma)

Date: 2025-09-18
Status: Implemented (MVP)
Priority: P0 (Delivered – MVP)
Type: Product + IA + Feature Set
Assignee: Engineering
Reviewer: Product, UX, CFA Compliance

---

## Problem Statement

- Navigation overload (Tools tab) and duplicated domain CRUD reduce cohesion and increase cognitive load.
- No single, calm canvas to compare Current vs Desired (Pro Forma) balance sheet and P&L across the app.
- Goals, budget, assets/liabilities, and timeline are not unified by a single change model.

Business impact: Users can’t see how day‑to‑day changes (budget, income/expenses) move them toward major goals (e.g., home purchase, emergency fund) in a single, intuitive flow.

---

## Proposed Solution

Adopt a 5‑tab IA and introduce a Milestone + Pro Forma model that ties Plan, Balance Sheet, Cash Flow, and Timeline together.

Tabs (max 5):
1) Dashboard
2) Plan (Goals + Budget + Milestones + Audits)
3) Balance Sheet (v2)
4) Cash Flow (Income + Expenses + P&L + CF)
5) Timeline

Core features:
- Milestones: time‑bound targets with required monthly actions and dependencies.
- Pro Forma engine: compute snapshots at a future date using schedules + goal mappings.
- Consistent visual language: Snapshot KPIs, Milestone Cards, allocation/cash‑flow charts, Pro Forma controls.

---

## Scope

In scope (P0):
- IA restructure to 5 tabs (routes + nav) and contextual “More” menus for calculators/simulators.
- Balance Sheet v2 MVP: KPIs (Current vs Pro Forma), Asset Allocation donut, Liability Composition stacked bar, Net Worth trend; Goals Impact panel; Pro Forma control.
- Plan tab consolidation: Goals Reality Check + Goals Audit + coverage by goal; quick budget edits; Milestone Cards hub.
- Cash Flow tab: unify Income/Expenses CRUD, Income Statement (existing), Cash Flow Statement, audit banners; “Advanced” area for Trial Balance Audit.
- Timeline markers for milestones; Pro Forma preview.

Out of scope (P0):
- Server storage for milestones/audits (local‑first acceptable). Can be added later.
- Advisor‑specific workflows.

---

## Impacted Users

- All end users (cleaner, calmer navigation; direct line of sight between actions and outcomes).
- Product/UX (clearer IA, simpler flows).
- Engineering (fewer redundant surfaces; single source of truth).

---

## Dependencies

- UnifiedFinancialContext (available) and schedule engine (available).
- v2 endpoints for assets/liabilities/income/expenses/goals/timeline (available).
- Budget‑v2 categories for “Goal:” allocations (available / best‑effort fallback).

---

## Risks & Mitigations

- Perceived loss of features when removing Tools items → Mitigate with deep‑links to domain tabs and “Top Actions” surfaced contextually in Plan.
- Overcrowding BS with detail → Progressive disclosure: KPIs + 2 charts by default; expand for registers.
- Inconsistent color/labels → Establish shared snapshot and card components.

---

## Acceptance Criteria (MVP)

1) Navigation shows exactly 5 tabs (Dashboard, Plan, Balance Sheet, Cash Flow, Timeline).
2) Balance Sheet v2 displays Current and Pro Forma KPIs, allocation donut, liability stack, and net worth trend; Pro Forma toggle/date works.
3) Plan shows coverage by goal, Goals Audit table, Milestone Cards; budget category updates work.
4) Cash Flow shows Income/Expenses CRUD, Income Statement and Cash Flow statements, with audit banners.
5) Timeline shows milestone markers and allows opening the Pro Forma snapshot for that month.

---

## Implementation Plan

Phase 1 (Scaffold + MVP):
- Create Milestone model/selectors (local‑first).
- BS v2 shell with KPIs + charts + Pro Forma control + Goals Impact stub.
- Plan tab: Goals Audit + coverage bars + Milestone Cards hub; quick budget edits.
- Consolidate Tools into Plan/Cash Flow; remove redundant domain CRUD from Tools.

Phase 2 (Audits + Milestones):
- Income/Expense/Assets/Liabilities audits produce suggested milestones and budget/goal changes.
- Link CTAs to Timeline and BS views.

Phase 3 (Polish):
- Likelihood scoring; scenario A/B; export/share snapshots; advisor workflows.

---

## Rollback

- Keep routes behind feature flag/branch; ability to revert nav to current state.
- Maintain domain CRUD components; only their entry points move.

---

## Affected Sections Mapping

Routes/IA:
- BottomNav: Dashboard, Plan, Balance Sheet, Cash Flow, Timeline.
- Remove Tools from primary nav; calculators live under Plan/Cash Flow “More”.

Components (rehome, not rewrite):
- Income/Expenses CRUD → Cash Flow
- Goals Overview + Reality Check → Plan
- Asset/Liability registers → Balance Sheet (expand area)
- Trial Balance Audit → Cash Flow (Advanced)

Documentation:
- Update Kanban (Active Sprint + Committed tasks)
- Update user journeys alignment
- Update technical guide (Milestones/Pro Forma selectors)

---

## Metrics (post‑launch)

- Task success and time on task (Plan → achieve coverage; BS → understand deltas).
- Fewer navigation bounces; increased completion of suggested actions.
- Reduced support requests about “where to find X”.
