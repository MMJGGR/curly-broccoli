# CHANGE REQUEST CR013 — Advisor Portal Alignment (Separate Advisor Journeys)

Date: 2025-09-18
Status: Proposed
Owner: Product + Engineering (Advisor Track)
Reviewers: UX, Backend Lead, Compliance

## 1) Summary
This CR addresses advisor‑specific journeys independently from client journeys. It complements CR012 (client) and must not be conflated with client outcomes. Security remains out of scope here.

## 2) Scope (Advisor Journeys Only)
In scope (examples):
- Advisor authentication and onboarding flows
- Client list, profile summaries, and insights for advisors
- Advisor tools (IPS generation/export, recommendations review, plan notes)
- Data access patterns and read models optimized for advisor dashboards

Out of scope:
- Client feature gaps addressed by CR012
- Security hardening, RBAC, PII encryption at rest (tracked separately)

## 3) Dependencies
- Clean arch read models for accounts, goals, balance sheet summaries
- Metrics/analytics endpoints for advisor summaries

## 4) Deliverables (High‑level)
- Advisor Dashboard alignment with IA; ensure consistent scroll/layout and compact formatting
- Client portfolio snapshot cards (net worth, allocation, risk profile, plan likelihood)
- IPS draft generator (uses CFA parameters and client profile/goals) — exportable
- Meeting notes and recommendations log (MVP)

## 5) Acceptance Criteria
1) Advisor routes and components are isolated from client IA; no cross‑contamination in contexts
2) Advisor dashboard renders portfolio summaries for assigned clients
3) IPS draft export works from advisor context
4) Documentation updated to reflect advisor/client separation

## 6) Relation to CR012
- Runs in parallel; does not claim or close CR012 items
- Shares common APIs (read‑only) but maintains separate UI flows and navigation

## 7) Next Steps
- Define detailed advisor stories and data contracts
- Map existing advisor components to clean arch patterns and contexts
- Prepare CR014 for advisor security, RBAC, and PII policy if needed (separate)

