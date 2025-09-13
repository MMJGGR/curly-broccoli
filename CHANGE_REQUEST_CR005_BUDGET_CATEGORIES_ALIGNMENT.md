# CHANGE REQUEST CR005: Budget Categories Alignment & Styling

Date: 2025-09-13
Status: In Progress
Priority: P1 – UX Consistency, Data Integrity
Type: UX Consistency + Context Integration
Assignee: Development Team
Reviewer: Technical Lead / CFA Compliance Officer

---

## Problem Statement

Users see only high‑level expense groupings (Fixed, Variable, Discretionary) on the Budget tab, while the Tools tab (Expense Management) exposes detailed types (e.g., Housing, Transportation, Food & Dining, Taxes). This mismatch confuses users and obscures where money goes. In addition, the category list on Budget lacks the card styling used across the app, reducing visual consistency.

## Scope

In Scope:
- Align Budget tab expense categories with Tools tab types (detailed type list).
- Use unified context expense data (no direct API calls).
- Apply card styling consistent with the app’s design system.
- Keep totals computed via `monthly_equivalent` to respect frequency normalization.

Out of Scope:
- Backend schema/endpoint changes.
- New budgeting features (editing categories, custom rules).
- Changing Tools tab taxonomy.

## User Impact

- Primary: All users reviewing Budget. Clear, consistent category breakdown improves comprehension and actionability.
- Secondary: QA/Product — fewer discrepancies between pages.

## Dependencies

Hard:
- UnifiedFinancialContext normalizes `expense_type` and `monthly_equivalent` (already in place).

Soft:
- Design system components (Card) available in `frontend/src/components/ui`.

## Risks & Mitigations

- Risk: Some expenses may have unknown/legacy types. Mitigation: Default to `other` with a friendly label.
- Risk: Performance when rendering many cards. Mitigation: Simple mapping, no heavy computation; totals pre-aggregated in render.

## Acceptance Criteria

1. Budget tab lists detailed expense types matching Tools tab labels.
2. Totals per type use `monthly_equivalent` from context for accuracy.
3. Styling matches app card components (consistent spacing/typography).
4. No direct API calls; uses `useUnifiedFinancialContext()` only.
5. Works with empty/missing types (renders zero amounts gracefully).

## Implementation Plan

Tasks:
- Update `BudgetCashflows.jsx` to:
  - Define the canonical list of expense types (reuse Tools set).
  - Aggregate expenses by `expense_type` using `monthly_equivalent`.
  - Render a responsive grid of Cards with label + amount.
- Keep existing totals/surplus calculations intact.
- Do not change backend or context APIs.

Files:
- `frontend/src/components/budget/BudgetCashflows.jsx` (modified)
- This change request document (new)

## Test Plan

- Manual: With mixed expense set, verify each type aggregates correctly and matches Tools tab types/labels.
- Edge: No expenses → all cards render KES 0; unknown type → appears under Other.
- Regression: Totals, surplus/deficit, recommendations still render.

## Rollback Strategy

- Revert `BudgetCashflows.jsx` to previous revision. Impact limited to UI layer.

---

Status: Pending review and merge.
