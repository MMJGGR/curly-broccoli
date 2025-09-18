# 🏦 Personal Finance Application — Kanban (Overhauled)

## 🚀 Current Status: Clean Architecture Alignment + Profile Hub
Status: Active | Confidence: High

- Clean-arch endpoints in production use for assets, liabilities, income, expenses, goals, relationships, timeline.
- Legacy endpoints mounted under /deprecated and /api/v1/deprecated with Deprecation + Sunset, warning logs, and no UI usage.
- Profile Hub: budget preferences + planning assumptions integrated; profile‑v2 insights merged into unified profile.
- UnifiedFinancialContext orchestrates all financial CRUD + profile; TimelineContext for timeline; AnalyticsContext added.

---

## 🎯 Active Sprint: Clean‑Arch Completion + Profile Hub Polish (P0)

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
- Complete CA profile update pipeline and adopt AnalyticsContext in priority views, including recommended allocation UI.

### 📌 Committed (P0)
- No remaining committed items — all completed
  - Implemented initial script `test-profile-preferences-e2e.cjs` (expand as needed)

### 🧩 Stretch (P1)
- AnalyticsContext adoption across all remaining analytics views (beyond priority ones)

---

## 📋 Backlog (Prioritized)
- Note: Items previously #1, #2, and #5 moved to Active Sprint. Item #4 partially moved (priority views now; remainder stays here).
1) Expand budget preferences (carryover strategy, strict zero‑base mode, per‑category alert thresholds)
2) AnalyticsContext adoption across remaining analytics views (post‑sprint remainder)
3) Optional: PII encryption (feature‑flagged) for nationalId/phone; add migration before enabling

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

---

## 🧪 Testing Gaps (to cover)
- Profile preferences and planning assumptions save cycles (UI -> /auth/profile -> context refresh)
- Merge of profile‑v2 insights with /auth/me (happy/sad paths if insights unavailable)
- Deprecation headers + logs when legacy endpoints are hit
- AuditLog write on profile update (table creation via create_all path)
- AnalyticsContext usage in TimelineDashboard (and other analytics views once migrated)
- Risk score wrapper (compute_risk_score) in both signature modes
- Delegation in /auth/profile to CA repository (no behavioral regressions)

---

## 📊 Metrics
- Direct UI calls to legacy endpoints: 0 (only /deprecated if manually tested)
- Financial CRUD via contexts: 100%
- Profile insights coverage: age category, emergency fund, expected return
- Request coalescing: /auth/me calls coalesced within 2s window

---

## 🧩 Enterprise Gaps
- RBAC and field‑level access (advisor vs client)
- PII encryption feature‑flag (nationalId, phone) and migration plan
- Observability: metrics dashboards, tracing, SLO alerts
- IPS generation/storage and advisor workflows
- Formal data retention/backups and data lineage/versioning

## 🎓 CFA Alignment Gaps
- IPS document and storage (risk, goals, allocation, constraints)
- Risk capacity integration alongside tolerance; questionnaire governance
- Goal funding optimizer tied to recommended allocations
- Scenario/assumption wiring into analytics and timeline
- Consistent server‑side canonical risk throughout UI (remove client calc)

---

Last Updated: 2025‑09‑18
Owner: Engineering
