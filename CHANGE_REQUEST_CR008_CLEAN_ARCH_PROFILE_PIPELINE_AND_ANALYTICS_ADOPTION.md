# Change Request CR008 — Clean‑Arch Profile Pipeline & AnalyticsContext Adoption

Status: Proposed
Owner: Engineering
Date: 2025-09-16

## Summary
Consolidate profile management on clean architecture (CA) paths by expanding profile‑v2 write support and routing updates through CA use cases. In the frontend, adopt AnalyticsContext across priority views and surface recommended allocation from the CA profile insights via a lightweight widget.

## Goals
- Route profile updates through CA use cases with validation, while preserving legacy compatibility.
- Expand `/api/v1/profile-v2/` write endpoint to accept the broader ProfileUpdate shape.
- Switch frontend context updates to the v2 endpoint with graceful fallback.
- Migrate 2–3 priority analytics views to `AnalyticsContext`.
- Display recommended allocation in Profile using CA insights when available.

## Scope
- Backend
  - Extend profile‑v2 PUT to accept `ProfileUpdate` fields; internally use CA use case for core fields and persist supplemental fields on the profile model.
  - Keep `/auth/profile` operational but favor CA path in controller.
  - Add minimal CA read/write integration tests for profile‑v2.
- Frontend
  - Update `UnifiedFinancialContext.updateProfile` to call `/api/v1/profile-v2/` first, fallback to `/auth/profile`.
  - Migrate 2–3 components to `AnalyticsContext` (replace direct `predictiveAnalytics` imports): TimelineDashboard, ScenarioAnalysis, ProbabilityGauge.
  - Add a simple Recommended Allocation widget in Profile.

## Non‑Goals
- Full migration of all analytics views (tracked as stretch).
- Removal of all legacy API helpers — several are still referenced; safe pruning will be incremental.

## Rationale
Unifying profile writes under CA improves validation, testability, and future extensibility (PII controls, RBAC). Frontend adoption of a single analytics seam simplifies testing and evolution of analytics logic.

## Risks & Mitigations
- CA entity validation requires positive `monthly_income` and a valid name. Mitigation: derive from existing profile when not present in payload; fallback to legacy path if still insufficient.
- Legacy helper removal can break references. Mitigation: postpone deletions; annotate deprecations and track usage.

## Rollout Plan
1) Land backend PUT v2 expansion + tests
2) Switch frontend context update flow (with fallback)
3) Migrate 3 analytics views to `AnalyticsContext`
4) Add allocation widget
5) Verify via existing scripts + new tests

## Acceptance Criteria
- PUT `/api/v1/profile-v2/` accepts ProfileUpdate fields and persists both CA core and supplemental fields.
- Frontend updates profile via v2 endpoint and refreshes using `/auth/me` + `/api/v1/profile-v2/` insights.
- TimelineDashboard, ScenarioAnalysis, ProbabilityGauge use `AnalyticsContext` exclusively.
- Profile page shows recommended allocation when provided by CA insights.

