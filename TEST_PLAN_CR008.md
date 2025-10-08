## Test Plan — CR008 Clean‑Arch Profile Pipeline & Analytics Adoption

### Objectives
- Verify backend profile‑v2 write expansion and compatibility with `/auth/me`.
- Verify frontend update flow uses profile‑v2 first with legacy fallback.
- Verify AnalyticsContext adoption in TimelineDashboard, ScenarioAnalysis, ProbabilityGauge.
- Verify Recommended Allocation widget renders from v2 insights.
- Ensure legacy helper redirects keep legacy components functional during migration.

### Test Matrix

- Backend API
  - Register: POST `/auth/register` returns token.
  - Get v2 profile: GET `/api/v1/profile-v2/` returns profile, financial_planning (age_category, emergency_fund_target) and optionally risk_profile.
  - Update v2 profile (minimal): PUT `/api/v1/profile-v2/` with `{ full_name, monthly_income, phone_number }` returns 200 and reflects in `/auth/me`.
  - Update v2 profile (ProfileUpdate fields): include `investment_preferences`, `employment_status`, `dependents`, `goals`, `questionnaire`; verify persistence and risk recompute.

- Frontend behavior
  - Profile update path: in UI (ProfileDynamic -> useUnifiedFinancialContext.updateProfile), update a simple field and verify UI refresh reflects change.
  - Profile fetch path: ensure `recommended_asset_allocation` appears in Profile when v2 returns a recommendation.
  - AnalyticsContext usage: in TimelineDashboard, ScenarioAnalysis, ProbabilityGauge, confirm formatting and color come from context (no direct service imports).

- Legacy helper compatibility
  - AccountsTransactions: listAccounts/listTransactions use v2 read; create/update/delete accounts & transactions hit deprecated routes without breaking UI.
  - GoalsOverview (legacy): legacy helper names map to goals‑v2; creating, updating progress, and deleting goals still works.
  - LifetimeJourneyTimeline: list + create work via timeline endpoints; update/delete emit deprecation errors (expected for migration phase).

### How to Run

1) Docker build & run
- `docker compose build --no-cache`
- `docker compose up -d`
- Health checks:
  - API: `curl http://localhost:8000/healthz`
  - Frontend: visit `http://localhost:3000`

2) Automated tests
- Python tests (from repo root):
  - `pip install -r api/requirements.txt` (if needed)
  - `pytest -q api/tests/test_profile_v2_clean.py`
- Node scripts:
  - `node test-profile-preferences-e2e.cjs`
  - `node test-unified-context-data.cjs` (optional broader check)

3) Manual checks
- Use a REST client with an auth token to exercise GET/PUT `/api/v1/profile-v2/` and verify `/auth/me`.
- In UI:
  - Update profile field; confirm change persists and refreshes.
  - Navigate to Timeline dashboard; confirm analytics formatting and cache clear use context.
  - Check Profile page shows Recommended Allocation when present.

### Acceptance Criteria
- All API calls above return expected structures and state persists.
- Frontend update + fetch flow works with v2 preference; no console errors from removed analytics service imports in migrated components.
- Legacy components continue to function via redirected helpers, with console deprecation warnings only.

### Rollback
- Revert helper changes in `frontend/src/api.js` to previous paths if needed.
- Toggle backend to rely solely on legacy `/auth/profile` temporarily (not recommended).

