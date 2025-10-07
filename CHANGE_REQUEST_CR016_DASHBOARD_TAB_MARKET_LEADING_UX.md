# CHANGE REQUEST CR016 — Dashboard Tab: Market‑Leading UX, IA, and Visual Refinement

Date: 2025‑10‑07
Status: Superseded (see CR017)
Owner: Frontend + Design
Reviewers: Product, Backend Lead, QA

Note (2025-10-07): This CR is superseded by CHANGE_REQUEST_CR017_STRUCTURED_UX_UNIFIED_IA_AND_PANEL_INTEGRATIONS.md, which consolidates dashboard work with cross-tab structured IA and backend panel integrations. Refer to CR017 for current scope, acceptance criteria, and mocks.

## 1) Summary
Elevate the Dashboard tab to an enterprise‑grade, market‑leading experience grounded in our design tokens and UI primitives. Rationalize information architecture, remove visual noise, improve accessibility, and standardize loading/empty/error states. Adopt consistent scaffolding (`Layout` + `PageHeader` + `Card`) and replace ad‑hoc utility stacks with our `components/ui` primitives for a crisp, reliable, and extensible interface.

Primary target: `frontend/src/components/timeline/ContextualTimelineDashboard.jsx` (current route for `/app/dashboard`). Secondary: `ContextualTimelineSystem.jsx`, `BottomNavBar.js` (labels/icons), and localized widgets.

## 2) Why (Comparative Analysis)
- Design docs alignment
  - Our Design Guide mandates tokenized colors/radii/shadows, cardization, and standardized states (Alert, Skeleton, EmptyState). Current dashboard uses many hardcoded Tailwind colors, gradient backgrounds, and custom info banners.
  - Technical Development Guide calls for responsive widget grids, progressive disclosure, and skeletons instead of page‑blocking spinners. Current loading is largely blocking with limited skeleton usage.
- Enterprise benchmarks (patterns)
  - Consistent page header + action cluster, stat tiles, quick actions, contextual insights in cards, and non‑blocking loading (skeletons). Numeric alignment, compact currency formatting, and clear affordances.
  - Token‑driven theming and accessible icons (no emojis in core chrome). Clear empty/error remediation and keyboard navigability.

## 3) Current State Deep Dive (Findings)
- Structure & IA
  - Header: present but varies across variants; inconsistent use of `PageHeader` in the primary `timeline/ContextualTimelineDashboard.jsx`.
  - Content: mixed utility classes (gradients, many color families) and custom panels. Information density and hierarchy vary between left/right columns.
  - Quick actions and alerts exist but don’t use UI primitives; affordances and visual priority can be clearer.
- Visual & Tokens
  - Hardcoded color classes (`blue‑50`, `emerald‑50`, etc.) instead of tokens (`brand`, `success`, `surface`). Gradient backgrounds add noise and reduce print/readability.
  - Inconsistent card paddings/radii/shadows vs tokens (`--radius‑*`, `--elev‑*`). Emojis are used pervasively.
- States & A11y
  - Loading: page‑blocking spinner with a “Continue anyway” escape; few skeletons.
  - Errors: bespoke banners, not `Alert` components.
  - Empty: no standardized `EmptyState` for missing budgets/goals/milestones.
  - Accessibility: some interactive controls lack explicit labels; iconography is emoji‑based; tab order and focus management need review.
- Performance/Noise
  - Repeated fetch guards exist but rely on checks (e.g., categories) without consistent throttling/debouncing.
  - Persona theming and gradient backgrounds create redundant style branches.

## 4) Goals
- Consistent scaffolding and tokens across the Dashboard tab.
- Clear IA: top‑level KPIs, actionable insights, quick actions, and timeline progress.
- Enterprise‑grade states: Skeletons for loading, `EmptyState` for no data, `Alert` for errors/warnings.
- Accessibility: keyboard/focus/ARIA correctness; numeric alignment; readable contrast.
- Performance calm: no redundant fetch loops; fast first contentful paint with progressive enhancement.

## 5) Proposed IA (Before → After)
- Before
  - Mixed header, metric tiles with gradients, contextual guidance blocks, timeline progress in right column, ad‑hoc alerts, emoji icons.
- After
  - Page header: `PageHeader` with title, description, primary action (e.g., Add Goal), secondary (e.g., Review Budget).
  - KPI row: `StatCard` tiles (Monthly Surplus, After‑Goals Surplus, Alignment, Next Milestone), tabular numerals, compact currency.
  - Insights: `Card` with Contextual Guidance (CFA lifecycle), link‑out actions.
  - Timeline: `TimelineProgressWidget` in `Card`; optional compact timeline drawer.
  - Quick Actions: `Card` with standardized `Button`s and clear copy.
  - Alerts: replace custom alert banners with `Alert` (info/success/warning/danger) using tokens.
  - Empty states: goals/budget/milestones use `EmptyState` with a single CTA.

## 6) Visual System Changes
- Remove gradient surfaces; use `surface` tokens for backgrounds.
- Replace hardcoded color utilities with Tailwind mappings to tokens (`brand`, `success`, `danger`, `warning`, `info`).
- Use `Card` with `p‑6`, `rounded‑lg`, `shadow‑elev2` consistently. No mixing borders and heavy shadows.
- Replace emojis in core chrome with icons from `components/ui/icons.jsx`. Limit emojis to content copy only, if at all.

## 7) Interaction & Copy
- Compact, action‑oriented copy. Titles use verbs where applicable (“Review Budget”, “Set New Goal”).
- Buttons: `Button` variants (`default`, `outline`, `ghost`) with `aria‑label`s.
- Inputs: add labels/ARIA for `Planning Start` month input; move into a `Card` “Planning Controls”.
- Programmatic focus after navigation/actions; maintain keyboard flow. Ensure tab order logical, use `role` where appropriate.

## 8) States
- Loading: local `Skeleton`/`SkeletonText` for KPI tiles, guidance card, and progress panel. Keep optional “Continue anyway” only after 3.5s.
- Empty: `EmptyState` with primary CTA (e.g., Add First Goal, Set Up Budget) and minimal supportive text.
- Error: `Alert` with remediation and links to relevant tabs.

## 9) Accessibility
- Visible focus rings (already tokenized) and ARIA labels on icon buttons.
- Role annotations for landmark regions (e.g., `main`, `nav`).
- Numeric alignment with `tabular-nums`; right‑align currency in tables.
- Respect `prefers-reduced-motion`; reduce animation in loaders.

## 10) Performance
- Guard repeated fetches (categories, overview) via single‑flight/throttle.
- Defer heavy analytics to idle/visibility. Cache persona/theme lookups.
- Replace animated gradients with static tokenized surfaces.

## 11) Implementation Plan
- Phase 1: Scaffolding & Tokens (Day 1)
  - Wrap content in `Layout`/`max‑w‑7xl`; apply `PageHeader` consistently.
  - Remove gradient backgrounds; map colors to tokens.
  - Introduce KPI `StatCard`s for metrics; adopt `tabular-nums` utility.
- Phase 2: Cards & States (Day 2)
  - Convert insights, progress, quick actions, and planning controls into `Card`s.
  - Replace spinner with localized `Skeleton`/`SkeletonText` patterns.
  - Standardize error `Alert` and empty `EmptyState` usage.
- Phase 3: A11y & Icons (Day 3)
  - Replace emojis with `icons.jsx` where appropriate; add ARIA labels.
  - Keyboard navigation pass (modals/drawers, focus trap, Escape).
  - Throttle/debounce fetches; ensure background refresh quiet.

## 12) File‑Level Changes (Targeted)
- `frontend/src/components/timeline/ContextualTimelineDashboard.jsx`
  - Use `PageHeader` (`components/ui`) for title/actions.
  - Replace metric gradient tiles with `StatCard` using tokens and `formatCurrencyCompact`.
  - Convert Alert banner to `Alert` component with severity variants.
  - Add `EmptyState` when no milestones/budget present.
  - Replace loading spinner with Skeletons per card.
  - Remove emoji icons from core UI; use `icons.jsx`.
- `frontend/src/components/timeline/ContextualTimelineSystem.jsx`
  - Map colors to tokens; replace emoji icons with standardized icons.
  - Ensure `TimelineAlert` uses `Alert` styling and tokens.
- `frontend/src/components/BottomNavBar.js`
  - Replace text labels + emojis with icons + text from `icons.jsx`; ensure ARIA labels and current state.

## 13) Example Diffs (Illustrative)
- Replace gradient metric tile with `StatCard` (example)

```jsx
// Before
<div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
  <div className="text-sm font-medium text-green-800">Monthly Surplus</div>
  <div className="text-2xl font-bold text-green-600 mt-1">{formatAmount(actualSurplus)}</div>
</div>

// After
import { Stat } from '../ui/stat';

<Stat.Card>
  <Stat.Label>Monthly Surplus</Stat.Label>
  <Stat.Value className="tabular-nums">{formatCurrencyCompact(actualSurplus)}</Stat.Value>
  <Stat.Trend status={actualSurplus >= 0 ? 'positive' : 'negative'} value={trendPct} />
</Stat.Card>
```

- Replace alert banner with `Alert`

```jsx
import { Alert, AlertTitle, AlertDescription } from '../ui/alert';
import { AlertTriangle } from '../ui/icons';

<Alert variant={actualSurplus < 0 ? 'danger' : 'info'}>
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>{actualSurplus < 0 ? 'Timeline at Risk' : 'Budget Check'}</AlertTitle>
  <AlertDescription>
    {actualSurplus < 0 ? 'Monthly deficit threatens goals. Review budget.' : 'Consider allocating surplus toward goals.'}
  </AlertDescription>
</Alert>
```

- Localized skeletons for loading

```jsx
import { Skeleton, SkeletonText } from '../ui/skeleton';

{loading && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div className="p-6 bg-white rounded-lg border">
      <Skeleton className="h-4 w-1/3 mb-3" />
      <Skeleton className="h-8 w-2/3 mb-2" />
      <Skeleton className="h-3 w-1/3" />
    </div>
    {/* repeat for other tiles */}
  </div>
)}
```

## 14) Acceptance Criteria
1) Scaffolding & Tokens
- Uses `PageHeader` and `Card` containers; no gradient page/backgrounds.
- Colors use token‑mapped Tailwind; consistent radii/shadows.
2) Information Architecture
- KPI row (4–5 tiles), contextual insights card, timeline progress card, quick actions card.
- Clear empty states for missing budget/goals/milestones.
3) States & A11y
- Loading skeletons replace page‑blocking spinners; optional continue.
- Alerts/EmptyStates standardized. All icon buttons have ARIA labels.
- Focus/focus‑trap for modals where used; keyboard navigation verified.
4) Performance
- No repeated fetch loops for categories/overview; quiet background refresh.
- FCP improved; no heavy animations.

## 15) Risks & Mitigations
- Visual regression: roll out behind flag and validate with screenshots.
- Scope creep: limit to primitives adoption, IA refactor, and states.
- Endpoint variability: empty/error patterns must degrade gracefully.

## 16) Rollout Plan
- Feature gate optional: `REACT_APP_ENTERPRISE_UI=1` to switch to tokenized variant if needed.
- Phase by phase merge; run cypress smoke + a11y focus checks.
- Document changes in `design_guide.md` if new tokens or icon mappings added.

## 17) Success Metrics
- Time to Interact reduced (localized skeletons vs page spinner).
- A11y audit: WCAG AA pass on Dashboard.
- Support tickets on navigation/clarity drop.
- Consistency audit: 100% primitives adoption in Dashboard.

## 18) Out‑of‑Scope/Follow‑ups
- Dark mode parity (consider as a follow‑up once tokens are in place).
- Visualization theming alignment for charts (if/when charts are reintroduced).

---

Appendix — Audit Notes (as of this CR)
- Primary route uses `timeline/ContextualTimelineDashboard.jsx`, not `components/contextual/ContextualTimelineDashboard.jsx` (which already employs `PageHeader`). Consider aligning or deprecating one to reduce duplication.
- `ContextualTimelineSystem.jsx` uses emoji and hardcoded colors; migrate to icons and tokens to align with `design_guide.md`.
- `BottomNavBar.js` should ensure `aria-current="page"` on active tab and icon + label pairing for screen readers.
