# Frontend Design Guide

This guide documents the design language, tokens, components, and patterns for the app. It enables a consistent, high‑quality, enterprise‑grade UI.

## 1. Design Tokens (CSS Variables)

Defined in `frontend/src/index.css` for light and dark (via `[data-theme="dark"]`).

- Palette
  - Brand: `--brand-50..900` (primary blues)
  - Surfaces & text: `--color-bg`, `--color-surface`, `--color-fg`, `--color-muted-fg`
  - Semantic: `--success-600`, `--warning-600`, `--danger-600`, `--info-600`
- Radius: `--radius-sm/md/lg/xl`
- Elevation: `--elev-0..4`
- Focus ring: global `:focus-visible` outline uses brand color

Tailwind maps tokens in `frontend/tailwind.config.js` (`theme.extend.colors`, `borderRadius`, `boxShadow`, `fontFamily`).

## 2. Typography

- Base font: system UI (`fontFamily.brand` in Tailwind)
- Sizes: use Tailwind scale with consistent semantic mapping:
  - Display: `text-4xl`/`text-5xl`, headings: `text-3xl..text-lg`, body: `text-base`, caption: `text-sm`/`text-xs`
- Weight: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

## 3. Layout & Navigation

- App shell: persistent header + left nav (collapsible) + content area
- Page structure: page header (title + actions), filters/toolbar, content cards in responsive grid
- Spacing: 4pt base (use Tailwind `p-*`, `m-*` with 1/2/3/4 multiples)

## 4. Components

Located under `frontend/src/components/ui` and exported via `index.js`.

- Primitives
  - `Button` (variant: default|outline|ghost; size: sm|md|lg; loading/disabled supported)
  - `Input`, `Textarea`, `Select`, `Checkbox/Radio/Switch` (consistent focus, invalid, helper, error)
  - `Badge`, `Tag`, `Avatar`, `Icon`
- Containers
  - `Card` (Header/Title/Content), `Modal/Drawer` (future), `Popover`, `Tabs`, `Accordion`, `Table`
  - `Alert` (info|success|warning|danger), `Skeleton`/`SkeletonText`, `EmptyState`

### Button Usage

```
<Button variant="default" size="md">Save</Button>
<Button variant="outline" size="sm">Cancel</Button>
<Button variant="ghost" size="lg">Details</Button>
```

### Card Usage

```
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Alerts

```
<Alert variant="success" title="Saved">Your changes were saved.</Alert>
```

### Skeletons and Empty States

```
<Skeleton className="h-6 w-1/2" />
<SkeletonText lines={3} />
<EmptyState icon="📊" title="No data yet" description="Start by adding a goal." actionLabel="Add Goal" onAction={...} />
```

## 5. States: Loading / Empty / Error

- Use `Skeleton`/`SkeletonText` during loading.
- Use `EmptyState` for no data; provide a clear CTA.
- Use `Alert` for errors/warnings; include remediation.

## 6. Accessibility (A11y)

- Keyboard focus is visible (`:focus-visible`).
- Ensure interactive components are reachable via keyboard and have ARIA roles/labels.
- High contrast for critical text and UI elements; meet WCAG AA.
- Use live regions/ARIA for toasts if necessary.

## 7. Motion

- Keep motion subtle; use 100–300ms durations and ease‑in‑out.
- Respect `prefers-reduced-motion` for users with motion sensitivity.

## 8. Theming (Dark Mode)

- Set `[data-theme="dark"]` on `<html>` or `<body>` to enable dark theme tokens.
- Avoid hardcoded colors; use Tailwind classes mapped to tokens or CSS variables.

## 9. Data Visualization

- Use a consistent chart library and theme (colors, fonts, gridlines, tooltips). Map series colors to tokens.
- Ensure tooltips, legends, and axes match typography and have adequate contrast.
- Provide empty state visuals and loading skeletons for charts.

## 10. Patterns & Best Practices

- Prefer composition with UI primitives over ad‑hoc utility chains.
- Keep radii, shadows, and spacing within tokenized scales.
- Reuse EmptyState/Alert/Skeleton across all pages.
- Wrap pages with consistent padding/margins; maintain consistent max widths.

## 11. Documentation & QA

- Add Storybook to document components (future).
- Add visual regression (Chromatic) for critical components.
- Add a short design checklist to PRs (contrast, focus, keyboard navigation, responsive layout).

## 12. Adoption Plan

- Refactor most visited pages first (Dashboard, Profile, Budget, Tools) to the canonical Button, Card, and Field components.
- Replace ad‑hoc error banners with `Alert`.
- Replace spinners with `Skeleton` while loading and `EmptyState` for no data.

---

This guide evolves with the product. Please update tokens, components, and examples as the brand and UI mature.

