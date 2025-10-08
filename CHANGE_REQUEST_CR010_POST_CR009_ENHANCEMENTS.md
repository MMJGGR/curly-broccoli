# CHANGE REQUEST CR010: Post-CR009 Enhancements (Audits, Scenarios, Export, Preferences, PII Flag)

Date: 2025-09-18
Status: Implemented (Frontend MVP)
Priority: P1
Type: Product + Analytics + UX
Assignee: Engineering
Reviewer: Product, UX, CFA Compliance

---

## Scope Delivered
- Domain audits → Suggested Milestones panel in Plan.
- Likelihood indicator added to Plan (Probability Gauge).
- Scenario controls (save/load/delete) available in Plan; Timeline remains the primary scenario A/B canvas.
- Balance Sheet export snapshot (JSON) of KPIs + pro forma delta.
- Budget preferences expanded in Profile (zero-based, carryover, alert threshold, rounding).
- PII encryption feature flag (REACT_APP_PII_ENCRYPTION) applied in profile update path (frontend stub).
- Milestones: local-first fallback persistence when server is unavailable.
- Observability: perf marks on Plan and Balance Sheet views; collector hook.
 - Backend: metrics ingestion endpoint (`/api/v1/metrics/ingest`) implemented (file-based sink).
 - Backend: milestones persistence endpoint (`/api/v1/milestones/`) implemented (file-based MVP).
 - Backend: audits generation endpoint (`/api/v1/audits/generate`) available for server-side audits.

## Deferred / Next
- Cross-tab scenario diff overlays for Cash Flow and Balance Sheet (visual overlays beyond summaries).
- Proper cryptography for PII at rest, with migrations and key management.

---

## Rollback
- Features are additive and behind UI only; remove panels/components or disable via feature flags.

---

## Notes
- All work is non-breaking; older routes untouched.
- E2E tests should be updated incrementally to assert presence of new UI blocks.
