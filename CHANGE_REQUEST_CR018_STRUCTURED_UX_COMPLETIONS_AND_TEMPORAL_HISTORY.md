# CHANGE REQUEST CR018 — Structured UX Completions, Temporal History, and Reporting

Date: 2025-10-07
Status: Proposed → In Planning
Owner: Product + Frontend + Backend
Reviewers: Design, Backend Lead, QA

Related: CR017 (Structured UX, IA + Panels)

## 1) Summary
Finalize the Structured UX introduced in CR017 by replacing placeholders with functional panels, improving iconography and visual semantics, and adding temporal history support for incomes. Extend server endpoints to power Cash Flow waterfall/variance, Balance Sheet allocation vs policy, Timeline event logs, and basic CSV exports. Add a clear journal utility for easier reseeding and QA.

## 2) Why
- Icons are duplicated or ambiguous (e.g., Goals vs Savings Rate) and reduce clarity.
- Some UI sections are still stubs (Waterfall, Variance, Reports/Exports, Event Log) and need real data.
- Temporal baselining exists in FE (planningStartDate), but incomes lack start/end effective dating at the API layer; P&L is monthly-constant for income.
- Testing and reseeding journal data is clunky without a “clear journal” utility.

## 3) Scope
In-scope
- FE: icon mapping, panel wiring, CSV downloads, event log, “clear journal”, UX polish.
- BE: income temporal history, P&L per-month breakdown, variance, exports, event consolidation.
- Docs/Tests: update guides and add smoke/regression tests.

Out of scope
- Advisor portal changes (tracked under CR013).
- Deep forecasting/Monte Carlo and advanced optimizers beyond current endpoints.

## 4) Deliverables
### 4.1 Frontend
- Iconography & Semantics
  - Map Stats and key CTAs to domain icons (PiggyBank, Flag, Gauge, TrendUp, BookOpen, AlertTriangle, ShieldCheck). Remove duplicates.
- Dashboard
  - Keep “Apply Allocation” as route-only for now; add tooltip copy clarifying action.
- Plan
  - Keep “Apply Adjustment” as route-only; add tooltip and pro‑forma preview stub behind flag (optional).
- Cash Flow
  - Waterfall (Month): wire to server per-month expense category breakdown.
  - Variance Table: wire to variance endpoint (Budget vs Actual by category/month).
  - Reports & Exports: add CSV download buttons for P&L and Journal.
- Balance Sheet
  - Allocation vs Policy: compute from assets with policy bands and show variance to target.
- Timeline
  - Event Log: list recent events consolidated from audits/ledger meta; link to source.
- Journal
  - “Clear journal” button (admin gated or feature flag) with confirm dialog.

### 4.2 Backend
- Income temporal history
  - Add `start_date` and `end_date` to `income_sources`.
  - New `income_source_history` table: income_source_id, effective_date, amount, frequency, created_at.
  - Endpoints:
    - POST /api/v1/income-v2/sources/{id}/history
    - GET /api/v1/income-v2/sources/{id}/history
  - P&L uses latest effective <= each month when computing income rows.
- P&L per-month breakdown
  - GET /api/v1/pl/statement?months=12&breakdown=1 returns per-month category aggregates for expenses.
- Variance endpoint
  - GET /api/v1/budget-v2/variance?months=12 → per-month Budget vs Actual by category; totals and deltas.
- Exports
  - GET /api/v1/pl/statement.csv?months=12
  - GET /api/v1/ledger/journal.csv?start=YYYY-MM&end=YYYY-MM
- Timeline events
  - GET /api/v1/events/recent → consolidate tb-audit entries + journal meta (description/period) and surface 20 most recent.
- Journal utility
  - DELETE /api/v1/ledger/journal?before=ISO (optional `all=1`) for reseeding.

## 5) Acceptance Criteria
1) Icons & Semantics
- Stats on Dashboard/Plan/BS/CF/Timeline use distinct, domain-appropriate icons.
- No duplicated/conflicting icons in core KPIs.

2) Cash Flow
- Waterfall uses server monthly breakdown and reflects top drivers.
- Variance table shows Budget vs Actual per category/month for last 12 months.
- “Reports & Exports” allows CSV download of P&L and Journal; files open in Excel/Numbers.

3) Balance Sheet
- Allocation vs Policy shows % actual vs target band highlighting deltas.

4) Timeline
- Event Log lists recent changes sourced from audits/journal meta with timestamps.

5) Temporal History
- Income sources support start/end dates; P&L income reflects effective amounts over time.
- API returns income history; FE reads when showing income edits (optional display).

6) Journal Utility
- “Clear journal” confirms and deletes entries; reseed flow works cleanly.

7) Docs & Tests
- Design Guide updated for icon/semantic mapping.
- PRD updated to note temporal income history and reporting.
- E2E: seed/clear/verify journal → CSV export; variance rendering smoke; P&L breakdown present.

## 6) Implementation Plan
Phase 1 — Backend Foundations
- Alembic migration: income_sources (start_date, end_date), create income_source_history.
- Extend pl/statement for breakdown & CSV; add variance endpoint; add journal CSV; add events endpoint; add journal clear.

Phase 2 — Frontend Wiring & Icons
- Apply icon mapping; tooltips for route-only CTAs.
- Wire Waterfall to breakdown; Variance table to endpoint; add CSV download buttons.
- Add Allocation vs Policy calculations; Timeline Event Log panel.
- Add “Clear journal” with confirmation modal.

Phase 3 — Temporal UI Touches & QA
- Income edit dialog: optional “Effective from” (posts to history endpoint).
- Update tests (Cypress + unit) and docs.

Feature flagging (optional)
- REACT_APP_STRUCTURED_UX stays on; use REACT_APP_REPORTING=1 to guard CSV UI if needed.

## 7) Risks & Mitigations
- Data shape drift: document CSV schema; version query param for complex responses.
- Performance: paginate journal CSV; limit months; server-side aggregation indexes.
- Visual regressions: component-by-component rollout with screenshots.

## 8) Rollout & Validation
- Staged: BE first, FE panels then switch on by flag.
- Validate CSV downloads open; variance/Waterfall render; Timeline events list; P&L reflects income history.

## 9) Done When
- All acceptance criteria are met across tabs.
- Exports functional; income temporal history reflected in P&L.
- Docs/tests updated; Kanban tasks closed.

---

