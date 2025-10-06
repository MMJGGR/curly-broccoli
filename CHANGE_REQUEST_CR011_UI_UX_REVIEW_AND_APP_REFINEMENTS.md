# Change Request CR011 — UI/UX Review and App Refinements

Author: Team
Date: 2025-09-18
Status: Proposed

## Summary

This CR implements a cohesive set of UI/UX improvements based on a holistic review against best practices. It focuses on navigation, layout/scroll behavior, data presentation, loading states, consistency of design primitives, and accessibility. It also addresses specific issues observed: non‑scrollable dashboard, timeline loading deadlock, overflowing numbers in cards, inconsistent “More” links, verbose copy, and uneven whitespace.

## Goals

- Ensure all pages are scrollable and content is not obscured by fixed navigation.
- Present data clearly with compact formatting where appropriate and full detail where needed.
- Provide responsive, accessible, and consistent UI primitives across views.
- Replace blocking spinners with localized skeletons and fallbacks.
- Reduce cognitive load via concise copy and consistent layout.

## Non‑Goals

- No major visual rebrand or new design system; we build atop existing tokens/components.
- No charting library migrations.

## Design References

- See “Frontend Design Guide” (design_guide.md) updated in this CR with the UI/UX guidelines and patterns (compact currency, scroll container recipe, loading fallback pattern, button/link styles).

## User Stories

- As a user, I can scroll all dashboard pages on mobile and desktop, and bottom navigation never covers content.
- As a user, I see large numbers formatted compactly in small cards (KES 1.2M), and exact values in details.
- As a user, I don’t get stuck on a loading screen; I can continue to the dashboard with partial data.
- As a user, I see consistent buttons/links and predictable layouts across pages.

## Scope of Work

1) Navigation & Layout
- Make the app shell reliably scrollable under fixed bottom nav with padding.
- Constrain content width responsibly and standardize page padding.

2) Data Presentation
- Add `formatCurrencyCompact` utility and apply to summary tiles.
- Keep full `formatCurrency` for detailed tables/rows.

3) Loading & Empty States
- Use localized skeletons; avoid page‑blocking spinners.
- Add a “Continue anyway” fallback for long loads (timeline/dashboard).

4) Consistency
- Convert "More" links to standardized Button variant with chevron.
- Unify card spacing and heading hierarchy.

5) Accessibility
- Ensure focus rings on interactive elements, sticky headers have adequate contrast, and keyboard navigation is consistent.

6) Content
- Trim verbose copy; move details to collapsible/learn‑more patterns; clamp long text in cards.

## Implementation Plan

Phase 0 (Quick Fixes — completed in this CR)
- Make timeline app scrollable and pad content above bottom nav.
- Add timeline loading fallback (“Continue anyway”).
- Add compact currency formatter and use it on Budget Overview and select summary cards.

Phase 1 (Navigation/Layout Consistency)
- Introduce Layout wrapper to enforce max width, paddings, and bottom padding for nav.
- Audit all major pages to wrap content with Layout and verify scroll.

Phase 2 (Primitives & Consistency)
- Add a `Stat` component (icon, label, value, delta) for summary tiles; migrate summary cards.
- Convert "More ▸" anchor links to secondary Buttons with chevron icons.

Phase 3 (Loading/Empty/Error States)
- Replace full‑page loaders with localized skeletons per panel in Dashboard, Tools, Balance Sheet.
- Standardize EmptyState usage for all empty views; ensure alerts for errors.

Phase 4 (Accessibility & Copy)
- Add keyboard focus checks, ARIA labels where missing, and ensure contrast.
- Trim verbose paragraphs; move details into expandable sections.

## Acceptance Criteria

- All dashboard and tools pages scroll on mobile/desktop; no content is hidden under bottom nav.
- Summary tiles use compact currency with no visual overflow in common breakpoints.
- Timeline dashboard never blocks indefinitely; “Continue anyway” renders main content.
- Buttons and "More" actions are visually consistent; no bare anchors for primary actions.
- Accessibility quick audit passes: focus visible, labels present, basic keyboard navigation works.

## Risks & Mitigations

- Risk: CSS layout regressions across pages. Mitigation: introduce a Layout wrapper and migrate incrementally with visual QA.
- Risk: Compact currency may reduce precision. Mitigation: show full values in tooltips or detailed tables.

## QA Plan

- Manual responsive checks (mobile/desktop) on Dashboard, Timeline, Tools (Income, Expenses, Goals, Trial Balance), Balance Sheet, and Accounts.
- Verify loading behavior with simulated slow network; confirm fallback CTA.
- Check keyboard navigation and focus management on forms and modals.

## Change Log (Phase 0)

- TimelineMainAppLayout: scrollable layout with bottom padding.
- ContextualTimelineDashboard: loading fallback with “Continue anyway.”
- formatters: added `formatCurrencyCompact`.
- BudgetOverview/Accounts/Transactions: applied compact currency to summary tiles.

## Follow‑ups

- Implement Layout wrapper and Stat component.
- Convert “More” links to Buttons.
- Roll out skeletons and EmptyState to all major views.

