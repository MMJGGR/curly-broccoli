**Product Requirements Document (PRD): Personal Finance App**

---

## 1. Overview

The Personal Finance App helps Kenyan users and financial advisors track, manage, and plan financial goals across life stages. Its centerpiece is the **Lifetime Timeline**, which contextualizes a user’s assets, liabilities, and advice modules according to four CFA-aligned life phases: Accumulation, Family & Property, Pre-Retirement Consolidation, and Decumulation & Legacy.

## 2. Objectives & Success Metrics

* **Empower Users**: Provide clear, actionable insights to improve saving, investing, debt management, and retirement planning.
* **Advisor Efficiency**: Streamline advisor-client workflows with shared dashboards, scenario modeling, and compliance automation.
* **Engagement**: 70% of active users reach at least one major milestone (e.g., emergency fund, debt payoff) within 6 months.
* **Adoption**: Onboard 10 financial advisors and 500 end-users in the first quarter post-launch.

## 3. Personas

| Persona                     | Description                               | Key Needs                                                      |
| --------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| **Jamal Mwangi** (User)     | 27, Early-Career Accumulator              | Emergency fund, debt payoff, automated transaction ingestion   |
| **Aisha Otieno** (User)     | 36, Family & Property                     | Education savings, mortgage management, insurance gap analysis |
| **Samuel Kariuki** (User)   | 54, Pre-Retirement Consolidation          | Portfolio rebalance, decumulation planning, LTC provisions     |
| **Emily Njeri** (Advisor)   | Fee-only CFP® for HNW clients             | Monte Carlo simulations, tax-efficient planning, audit trail   |
| **Daniel Mwangi** (Advisor) | Bank-affiliated planner for mass-affluent | Rapid KYC, product recommendations, compliance memos           |

## 4. Key Features

### 4.1 Onboarding Screens

* **Data Connection**: Interactive SMS/Email permission flow with secure modals and overlay (MessageBox component) to guide users through granting access
* **Cash-Flow Setup**: Multi-step form (Progress Bar) for entering income sources and expense categories, with “+ Add” actions and real-time goal recommendation (Emergency Fund target)
* **Manual Entry Fallback**: One-click switch to manual entry for any step, ensuring accessibility for all users

### 4.2 Lifetime Timeline & Advice

* **Visual Timeline Component**: Age-indexed milestone bubbles and alternating left/right layout
* **Event Cards**: Each milestone shows event title, phase, snapshot (Assets/Liabilities/Net Worth), and contextual CFA advice
* **Action CTAs**: “Take Action on this Advice” buttons trigger modals for step-by-step guidance
* **Custom Milestone**: “+ Add Custom Milestone” for personalized planning

### 4.3 Lifetime Balance Sheet & Accounts

* **Balance Sheet**: Register views for Assets and Liabilities with calculations (Total Assets, Total Liabilities, Net Worth) and embedded Net Worth Trend chart placeholder
* **Accounts & Transactions**: Filterable, searchable transaction table; dynamic linking of new accounts; category editing inline

### 4.4 Dashboard & Widgets

* **Snapshot Cards**: Reusable card components for Net Worth Snapshot, Net Worth Projection, Monthly Cash-Flow, Top Advice carousel, Goal Progress bars
* **Interactive Charts**: Mini line and bar charts with “Explore” buttons to deep-dive into projections

### 4.5 Tools Suite

* **Goals Overview**: Grid of goal cards with progress bars, “View Details” and “Adjust” actions
* **FIRE Calculator**: Form inputs for savings, expenses, returns, and SWR, with instant projection
* **Monte Carlo Simulator**: Parameterized inputs and results summary (Success Probability, Median, Worst Outcomes)
* **Debt Repayment Planner**: Loan entry form and amortization output (Payoff time, Interest saved)

### 4.6 Navigation & UX Patterns

* **BottomNavBar**: Fixed tab bar with icons for Cashflows, Balance Sheet, Dashboard, Tools, Profile
* **MessageBox Component**: Centralized overlay/dialog for all wireframe actions

### 4.7 Advisor Portal Screens

* **Advisor Login**: Simple form with “Forgot Password” and MessageBox feedback
* **Advisor Dashboard**: KPI cards (Total Clients, Pending Reviews, New Sign-ups) and Recent Activity list
* **Client List**: Status badges, search/filter controls, “View Profile” actions
* **Client Profile**: Overview, Goals Progress, Recent Activity, Advice History, and actionable buttons (Scenario, Report, Meeting)

## 5. User Journeys User Journeys

* **Jamal**: Onboard → ingest SMS → reach 6mo fund → pay off student loan → adjust investments → timeline updates
* **Aisha**: Onboard → set education goal → purchase insurance → refinance mortgage → rebalance portfolio
* **Samuel**: Onboard → rebalance for income → launch SWP → purchase annuity → secure LTC cover → estate planning
* **Emily**: Login → select client → run Monte Carlo → adjust allocation → generate report → schedule follow-up
* **Daniel**: Quick KYC → risk profile → product carousel → compliance memo → SMS reminders → quarterly review

## 6. Functional Requirements

1. **Authentication & Security**: OAuth for SMS/Email ingestion; MFA for advisors.
2. **Data Processing**: Natural language parsing of SMS/email; mapping to ledger entries.
3. **Visualization**: Responsive charts (Trend, Bar, Timeline); interactive "Take Action" buttons.
4. **Scenario Tools**: Monte Carlo engine, FIRE formula, debt amortization model.
5. **Advisor Tools**: PDF report export; audit-trail logging; task automation scheduler.
6. **Internationalization**: Plug-and-play jurisdiction module for local social-security schemes.

## 7. Non-Functional Requirements

* **Performance**: Onboarding ingestion latency < 2s; chart render < 500ms.
* **Scalability**: Support 100k users & 5k advisors concurrently.
* **Reliability**: 99.9% uptime; daily backups of financial data.
* **Security**: Data encrypted at rest & in transit; compliance with Kenyan data-privacy laws.

## 8. Technical Considerations

* **Frontend**: Vite + React + Tailwind CSS (existing setup)
* **Backend**: Node.js (or Python FastAPI) microservices; PostgreSQL for persistence
* **Integrations**: M-PESA & email API connectors; NSSF/NHIF module
* **Analytics**: Event tracking for feature usage; user milestone conversion rates

## 9. MVP & Roadmap

| Phase         | Deliverables                                                              | Timeline |
| ------------- | ------------------------------------------------------------------------- | -------- |
| **MVP**       | Onboarding, Timeline view, Balance Sheet, Dashboard, Basic Goals          | Q3 2025  |
| **Phase II**  | Tools suite (FIRE, Monte Carlo, Debt Planner), Advisor portal v1          | Q4 2025  |
| **Phase III** | Jurisdictional plugin, advanced estate planning, AI-driven micro-learning | Q1 2026  |

---

*This PRD aligns our personas, user journeys, and the wireframe into a consolidated specification for development, QA, and stakeholder review.*
# Epics & User Stories Backlog

Below is an exhaustive breakdown of Epics and associated User Stories for the Personal Finance App MVP. Each Epic corresponds to a Key Feature from the PRD.

---

## Epic 1: Onboarding & Data Entry

**Goal:** Enable users to set up their financial profile quickly with manual and bulk options.

1. **As a new user,** I want to complete a guided welcome tour so that I understand the core app features before starting.
2. **As a user,** I want to enter my personal details (name, age, occupation) so my profile is complete for personalized advice.
3. **As a user,** I want to input my monthly net income via a form so that my cash-flow is tracked accurately.
4. **As a user,** I want to add multiple income sources (salary, freelance, rental) so all inflows are considered.
5. **As a user,** I want to define my major expense categories (rent, utilities, groceries, transport) so my budget reflects reality.
6. **As a user,** I want to import a CSV/Excel of past transactions so I can bulk-upload my financial history.
7. **As a user,** I want the option to skip/import ingestion and proceed to manual entry so that I have full control.
8. **As a user,** I want to set my emergency fund goal onboarding so that the app can track progress immediately.
9. **As a user,** I want to preview my initial Lifetime Balance Sheet snapshot after onboarding so I feel confident setup is accurate.
10. **As a user,** I want clear validation errors when I enter invalid data so I can correct mistakes instantly.

---

## Epic 2: Lifetime Timeline & Advice

**Goal:** Provide a contextual, age-indexed view of milestones with actionable CFA-based advice.

1. **As a user,** I want to see milestone bubbles plotted along a vertical timeline so I can visualize my life stages.
2. **As a user,** I want alternating left/right event cards connected to each bubble so the UI remains scannable.
3. **As a user,** I want each milestone to display age, event name, and phase so I know where I stand.
4. **As a user,** I want a snapshot of assets, liabilities, and net worth with each event so I see financial context.
5. **As a user,** I want a short CFA-styled advice line under each event so I can take the next step.
6. **As a user,** I want a “Take Action on this Advice” button that opens a modal with step-by-step guidance so I can implement recommendations.
7. **As a user,** I want to add a custom milestone at any point so I can personalize my journey.
8. **As a user,** I want tooltip descriptions on timeline bubbles so I get quick hover-over context.
9. **As a user,** I want the timeline to scroll smoothly and snap to each milestone so navigation feels fluid.
10. **As a user,** I want the timeline to update in real-time when my financial data changes so it remains accurate.

---

## Epic 3: Lifetime Balance Sheet & Accounts

**Goal:** Maintain a detailed register of assets, liabilities, and transactional data with drill-down capabilities.

1. **As a user,** I want to view Total Assets, Total Liabilities, and Net Worth as summary cards so I get a quick snapshot.
2. **As a user,** I want to expand the Assets register to see each account (cash, investments, property) with amounts so I know my holdings.
3. **As a user,** I want to expand the Liabilities register to see each loan or payable with balances so I know my obligations.
4. **As a user,** I want to see a placeholder chart area for Net Worth Trend so the UI indicates future graph integration.
5. **As a user,** I want to add a new asset or liability via a form so I can keep the register up to date.
6. **As a user,** I want to link a new external account (MPESA, bank) with a single click so I can track balances without manual entry.
7. **As a user,** I want to categorize each transaction inline so I can ensure accuracy of my registers.
8. **As a user,** I want filters (date range, category, account) on the transaction table so I can drill down to specific entries.
9. **As a user,** I want to search transactions by keyword so I can find specific expenses quickly.
10. **As a user,** I want pagination or infinite scroll on the transaction list so I can browse large histories.

---

## Epic 4: Dashboard & Widgets

**Goal:** Deliver a consolidated view of key financial metrics and personalized advice.

1. **As a user,** I want a reusable card component for Net Worth Snapshot so consistency is maintained across the app.
2. **As a user,** I want a Net Worth Projection card showing the age when my net worth turns positive so I understand my trajectory.
3. **As a user,** I want a Monthly Cash-Flow Summary card with income, expenses, and savings rate so I gauge my budgeting health.
4. **As a user,** I want a Top Advice carousel with up to 5 personalized recommendations so I can act on high-impact items.
5. **As a user,** I want Goal Progress bars for emergency fund, loan payoff, and asset purchases so I track multiple goals at once.
6. **As a user,** I want “Explore” buttons on each widget to navigate to detailed views so I can deep-dive when needed.
7. **As a user,** I want dashboard to load in under 1s with cached widget data so the experience feels snappy.
8. **As a user,** I want widget order to be customizable so I see the metrics most relevant to me first.
9. **As a user,** I want a refresh control to manually reload all widgets so I can get the latest data.
10. **As a user,** I want empty-state guidance when I have no data so I know how to populate the dashboard.

---

## Epic 5: Tools Suite

**Goal:** Provide calculation and planning tools to support user goals and testing of financial plans.

### FIRE Calculator

1. **As a user,** I want inputs for current savings, annual expenses, return rate, and withdrawal rate so I can calculate my FIRE number.
2. **As a user,** I want an instant result displaying target FIRE number and years to FIRE so I get immediate feedback.
3. **As a user,** I want explanatory text on assumptions (e.g. “This estimate assumes a 4% SWR”) so I trust the calculation.

### Monte Carlo Simulator

4. **As a user,** I want inputs for initial portfolio, annual contribution, return range, volatility, and runs so I can configure simulations.
5. **As a user,** I want results showing success probability, median outcome, and worst-case so I understand risk.
6. **As a user,** I want a chart placeholder for distribution visualization so I know where to expect graph integration.

### Debt Repayment Planner

7. **As a user,** I want to enter loan name, balance, rate, minimum payment, and extra payment so I can plan payoff.
8. **As a user,** I want results showing original payoff time, new payoff time, and interest saved so I see the benefit.

### Goals Overview

9. **As a user,** I want cards for each active goal with progress and target so I track multiple objectives.
10. **As a user,** I want “View Details” and “Adjust” options per goal so I can modify or drill down.

---

## Epic 6: Navigation & UX Patterns

**Goal:** Ensure consistent, intuitive navigation and UI feedback across the app.

1. **As a user,** I want a fixed BottomNavBar with clearly labeled icons so I can jump between Cashflows, Balance Sheet, Dashboard, Tools, and Profile.
2. **As a user,** I want the active tab highlighted so I know my current location.
3. **As a user,** I want responsive layouts that adapt to mobile and desktop so I can use the app on any device.
4. **As a user,** I want a centralized MessageBox component that overlays with a dimmed background so I get clear feedback on all actions.
5. **As a user,** I want smooth scroll and snap behavior for sections so navigation feels natural.

---

## Epic 7: Advisor Portal

**Goal:** Provide advisors with streamlined client management and planning tools.

### Advisor Login & Dashboard

1. **As an advisor,** I want to log in with email/password and MFA so my access is secure.
2. **As an advisor,** I want a dashboard with KPI cards (Total Clients, Pending Reviews, New Sign-ups) so I see my workload at a glance.
3. **As an advisor,** I want a Recent Activity list so I track client actions and plan follow-ups.

### Client List & Profile

4. **As an advisor,** I want to search or filter my client list by name, status, or next review so I find clients quickly.
5. **As an advisor,** I want status badges (Needs Review, On Track, Urgent) so I prioritize my outreach.
6. **As an advisor,** I want to view a client’s profile with overview, goals progress, recent activity, and advice history so I get full context.
7. **As an advisor,** I want buttons to run scenario modeling, generate a report, or schedule a meeting directly from the client profile so I act efficiently.

---

*This backlog serves as the foundation for sprint planning and development execution.*
# Core App Features Summary

This document distills the essential functionality of the Personal Finance App, aligned to user and advisor needs.

---

## 1. Onboarding & Data Entry

* **Manual Setup**: Guided multi-step forms for personal profile, income sources, expense categories, and goal targets.
* **Bulk Import**: CSV/Excel upload for transaction history and account statements.
* **Fallbacks & Validation**: Switch to manual entry at any point; real-time input validation.

## 2. Lifetime Timeline & Advice

* **Visual Timeline**: Age-indexed milestone bubbles with alternating layout.
* **Milestone Cards**: Event name, life phase, snapshot (Assets/Liabilities/Net Worth), plus brief CFA-based recommendation.
* **Action Modals**: “Take Action” buttons open step-by-step guidance overlays.
* **Customization**: Add custom milestones tailored to individual journeys.

## 3. Financial Snapshot & Registers

* **Balance Sheet**: Detailed registers for Assets and Liabilities with totals and Net Worth calculation.
* **Transaction Ledger**: Filterable, searchable table; inline categorization and account linking.
* **Trend Visualization**: Placeholder for Net Worth growth chart integrated in register.

## 4. Dashboard & Key Metrics

* **Snapshot Cards**: Net Worth, Net Worth Projection, Monthly Cash-Flow, Top Advice, Goal Progress.
* **Interactive Charts**: Mini line/bar charts with “Explore” actions for deeper analysis.
* **Personalized Advice**: Carousel of up to five priority recommendations.

## 5. Planning Tools

* **Goals Overview**: Progress-tracking cards with adjust/view details.
* **FIRE Calculator**: Inputs for savings, expenses, returns, and withdrawal rate with instant projection.
* **Monte Carlo Simulator**: Configurable runs, return ranges, result summaries (success rate, median, tail outcomes).
* **Debt Planner**: Loan-entry form, amortization output (reduced payoff time, interest saved).

## 6. Navigation & UX Components

* **Bottom Navigation Bar**: Persistent tabs for Cashflows, Balance Sheet, Dashboard, Tools, Profile.
* **MessageBox Overlay**: Centralized modal component for in-app notifications and confirmations.
* **Responsive Design**: Mobile-first layouts that scale to desktop screens.

## 7. Advisor Portal

* **Secure Login**: Email/password with optional MFA and feedback modals.
* **Advisor Dashboard**: KPI cards (Total Clients, Pending Reviews, New Sign-ups) and Recent Activity stream.
* **Client Management**: Searchable list with status badges and next-review dates.
* **Client Profile**: Overview, goals, activity, advice history, plus scenario modeling, report generation, and meeting scheduling actions.

---

*These core features form the MVP scope for Q3 2025, delivering both user-facing and advisor-centric functionality.*


10.1 Identified Gaps in PRD/Core Features

Automated Ingestion as Future Scope: While automated SMS/email parsing is marked future, define clear criteria (e.g., manual entry error rates exceed 10%) to promote it as a core feature.

Reporting & Export: End-user exports (CSV/Excel of transactions, goal progress reports) are missing; add export endpoints and UI.

Notifications & Reminders: No specification for push notifications, email reminders, or in-app alerts for milestones and advice follow-up.

Error Handling & Edge Cases: Detailed flows needed for API errors, ingestion failures, offline mode, and data conflicts (e.g., duplicate imports).

Accessibility (WCAG): ARIA roles, keyboard navigation, color-contrast compliance must be specified.

Localization: Baseline multi-language support (English + Swahili) for all UI strings.

10.2 Developer Instructions & Best Practices

Architecture & Services

Modular Service Boundaries: Separate modules/services for Onboarding, Profile, Ledger, Timeline, Dashboard, Tools, Advisor Portal.

API-First Design: Define OpenAPI/Swagger specs before implementation.

Database Migrations: Use Alembic (Python) or Flyway (Java/Node) to version-control DB schema.

Frontend Implementation

Component Library: Centralize shared components (MessageBox, Card, Button, BottomNavBar) in /src/components.

Tailwind Configuration: Lock down color palette; extend with semantic tokens for financial contexts (e.g. networth-positive).

State Management: Use React Context or Zustand for user session, theme, and notifications.

Routing: Integrate React Router for deep-linking (e.g. /dashboard, /timeline, /advisor/client/:id).

Data & Backend

CRUD Endpoints: Full CRUD for User, Account, Transaction, Milestone, Goal, AdviceModule, Advisor, ClientProfile.

Batch Imports: Implement streaming CSV/Excel parsing for large files to avoid memory issues.

Caching: Cache expensive computations (timeline, Monte Carlo) in Redis with TTL.

List APIs: All list endpoints must support pagination, filtering, and sorting.

CI/CD & Quality

Linting & Formatting: ESLint + Prettier (frontend), Flake8 + Black (Python) or ESLint (Node).

Testing:

Frontend: Jest + React Testing Library for components; Cypress for end-to-end flows.

Backend: Pytest for FastAPI or Jest for Node endpoints.

CI Pipeline: On PR: install, lint, test, build (Vite), Dockerize. Deploy to staging on develop; production on main with manual approval.

Security & Compliance

Authentication & Authorization: JWT with refresh tokens; RBAC for users vs advisors; enforce HTTPS.

Data Encryption: Encrypt sensitive fields (e.g. account numbers) at rest and in transit.

Regulatory Compliance: Adhere to CBK data-privacy guidelines and data retention laws.

Monitoring & Observability

Logging: Structured JSON logs with request IDs.

Metrics: Expose Prometheus metrics for API latency, error rates, and milestone events.

Alerts: Set up alerts for high error rates (>5% of requests resulting in 5xx), ingestion pipeline failures, and service health checks.