# CHANGE REQUEST CR014 — Remove Legacy Infrastructure Models

Date: 2025-10-06
Status: Completed
Owner: Engineering
Reviewers: Backend Lead

## 1) Summary
Remove unused legacy infrastructure ORM models in favor of the canonical SQLAlchemy models under `app.models`. This eliminates duplicate mappings and fixes import issues during container startup.

## 2) Scope
- Delete legacy infra model files:
  - `api/app/infrastructure/models/income_model.py`
  - `api/app/infrastructure/models/base.py`
- Ensure repositories and endpoints reference canonical models from `app.models`.

Out of scope:
- Any schema changes or data migrations (none required).
- Broader infra model refactors beyond the deleted files.

## 3) Changes
- Repository update: `sqlalchemy_income_repository` now maps to `app.models.IncomeSource` (canonical) and adapts field mapping accordingly.
- Removed legacy infra models that caused `ModuleNotFoundError` in API container startup.

## 4) Acceptance Criteria
1. No imports remain that reference `app.infrastructure.models.*`.
2. API boots successfully in Docker (`uvicorn` starts and `/healthz` responds).
3. Relationships v2 flows continue to function with the updated income repository.

## 5) Verification
- Grep shows no remaining references to `infrastructure.models`.
- Local Docker compose builds and starts; API is reachable.

## 6) Notes
- No DB schema changes; canonical models remain the source of truth.
- Follow-ups (optional): Add API healthcheck and Alembic run on container start.

## 7) Dependencies and Impact
- Repositories
  - `SQLAlchemyIncomeRepository` now maps to canonical `app.models.IncomeSource`; interface preserved.
  - Other repositories (asset/expense/liability/relationship) already use canonical models — no change.
- Endpoints / Use Cases
  - `income_v2` endpoints use `SQLAlchemyIncomeRepository` via DI — unchanged after mapping switch.
  - `relationships_clean` DI constructs `SQLAlchemyIncomeRepository`; validation paths continue to work.
  - Use-cases under `manage_income`/`manage_financial_relationships` rely on the repository interface — unchanged.
- Migrations
  - Alembic targets `app.models.Base` metadata; infra models were not part of migration graph — no migration required.
- Tests
  - No tests import infra models; tests use canonical models or domain entities. No changes required.
- Runtime Behavior
  - IncomeSource does not persist currency/type fields; repository maps sensible defaults (e.g., currency="KES").
  - If future features require persisted currency/type for income, add columns via migration and update mapping accordingly.

## 8) Rollback Plan
- If unexpected import/mapping issues arise, re-introduce a thin mapping shim referencing canonical models (no duplicate tables), or add required columns to `IncomeSource` and migrate.
