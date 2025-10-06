# Simulated User Journeys — Coverage Evaluation (Client Journeys)

Date: 2025-09-18
Scope: Client journeys only (advisor flows tracked in CR013). Security excluded.
Method: Grouped 200 common enterprise journeys into cohorts; for each cohort traced FE components, context selectors, and BE endpoints present in this repo; judged completion if a typical user can complete the task with correct, timely, intuitive outcomes. Weighted by cohort size for a Journey Coverage Index.

## Cohorts, Counts, Coverage (Conservative)
- Onboarding & Profile (10): 72%
  - FE: components/onboarding/OnboardingWizard.js, ProfileDynamic.js; Context: TransactionContext
  - BE: /api/v1/onboarding-v2-clean/*, /auth/profile
- Income Management (15): 65%
  - FE: components/tools/IncomeManagement.jsx; Context CRUD
  - BE: /api/v1/income-v2/*; Note: relationships uses mock income repo
- Expense Management (20): 78%
  - FE: components/tools/ExpenseManagement.jsx, components/expenses/*; taxonomy, monthly equivalence
  - BE: /api/v1/expenses-v2/*
- Budgeting & Variance (20): 70%
  - FE: selectBudgetSummary/selectBudgetCategories (TransactionContext)
  - BE: /api/v1/budget-v2/*; Gap: transactions-driven variance/alerts
- Debt & Liabilities (20): 65%
  - FE: components/tools/LiabilityManagement.jsx; schedules in utils/scheduleEngine.js
  - BE: /api/v1/liabilities-v2/*; Gap: payoff optimizer/refinance scenarios
- Assets & Portfolio (20): 68%
  - FE: components/assets/*; AssetForm types now API-backed (CR012)
  - BE: /api/v1/asset-reference/*, /api/v1/assets-v2/*; Note: API types/categories added
- Goals & Funding (20): 68%
  - FE: components/goals/GoalsOverview.js; Plan coverage bars
  - BE: /api/v1/goals-v2/*; Gap: optimizer with constraints
- Balance Sheet & Net Worth (15): 80%
  - FE: components/balance-sheet/BalanceSheetDashboard.jsx; valuation utils
  - BE: assets/liabilities v2
- Cash Flow & P&L (15): 62%
  - FE: tools/IncomeStatement.jsx, tools/CashFlowStatement.jsx via selectSchedules
  - BE: /api/v1/pl/statement (added) — canonical MVP; FE still falls back to schedules elsewhere
- Timeline & Milestones (15): 70%
  - FE: timeline/ContextualTimelineDashboard.jsx, TimelineDashboard.jsx
  - BE: timeline_clean.py; local-first persistence acceptable for MVP
- Scenario Planning (10): 60%
  - FE: analytics/ScenarioControls, utils/scenarioStore.js; limited rollout
- Life Events & Advanced (10): 35%
  - FE/BE: No guided flows (move abroad, retirement engine v2); FX utils exist
- Accounts & Transactions (10): 55%
  - FE: accounts/transactions views and context
  - BE: /api/v1/accounts-v2/*, /api/v1/transactions-v2/* (some writes deprecated); not driving variance yet

Weighted Journey Coverage Index: ~67%

## Representative Journeys (Outcome and Code)
- How much did I spend last month? ~65–75%
  - FE statements aggregate expenses from schedules; not reconciled from transactions.
- How is my budget doing? ~70%
  - selectBudgetSummary + after-goals surplus; TB banners. No automated variance/alerts.
- What is my net worth/personal balance sheet? ~80%
  - BS v2 KPIs/charts; strong snapshot.
- Do I have enough income to retire? ~50–60%
  - Scenarios help; no canonical readiness engine.
- Pay down my debt faster? ~60–65%
  - Amortization + suggestions; no optimizer/refinance modeling.
- Move abroad? ~30–40%
  - No guided cross-border life-event flow.

## Highest-impact Enablers (Mapped to CR012)
- Canonical Server P&L + FE switch → +5–6 pts
- Relationships v2 with real repos → +3–4 pts
- API-backed asset categories/types (no hardcoded) → +2 pts
- Transactions→budget variance + simple alerts → +4–5 pts
- Debt payoff optimizer (snowball/avalanche) v1 → +2–3 pts
- Retirement readiness (v1) → +2–3 pts
- Enforcement + accessibility polish → +1 pt

Expected Journey Coverage after CR012: ~80–83%

Update — Implemented in this pass
- Canonical server P&L endpoint + FE usage in IncomeStatement
- Asset categories/types served by API; AssetForm uses server data
- Relationships v2 uses real SQLAlchemyIncomeRepository
- Transactions→budget variance + basic alerts surfaced in Plan
- Debt payoff optimizer v1 (snowball) and Retirement readiness v1 panels in Plan
- ESLint enforcement (ban fetch in components) and basic UI primitives (Layout/Stat) added

Recomputed Journey Coverage (conservative): ~81%
Notes: Additional lift possible by wiring CashFlowStatement to server P&L, expanding transaction integrations (imports/rules), and rolling enforcement/patterns across remaining views.

Notes
- Client journeys only; advisor journeys are tracked separately in CR013.
- Security, RBAC, and PII at rest are out of scope for this evaluation.
