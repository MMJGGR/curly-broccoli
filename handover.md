# Project Handover: Personal Finance App

This document summarizes the current state of the Personal Finance App project, outlining progress against the Product Requirements Document (PRD), key architectural decisions, and proposed next steps.

## 1. Current Project Status

### 1.1. Frontend (Vite + React + Tailwind CSS)
**Progress:** The frontend is in a highly advanced state, with most MVP UI components implemented and functional.
**Key Implemented Components (from PRD):**
*   **Onboarding Screens:** `Onboarding.js`, `OnboardingWizard.jsx`, `OnboardingDataConnection.js`, `OnboardingCashFlowSetup.js`
*   **Lifetime Timeline & Advice:** `LifetimeJourneyTimeline.js`, `AdviceModuleDetail.js`
*   **Balance Sheet & Accounts:** `BalanceSheet.js`, `AccountsTransactions.js`
*   **Dashboard & Widgets:** `Dashboard.jsx`, `UserDashboard.js`
*   **Tools Suite:** `FIRECalculator.js`, `MonteCarloSimulation.js`, `DebtRepaymentPlanner.js`, `GoalsOverview.js`
*   **Navigation & UX Patterns:** `BottomNavBar.js`, `MessageBox.js`, `MainAppLayout.js`
*   **Advisor Portal Screens:** `AdvisorLogin.js`, `AdvisorDashboard.js`, `ClientList.js`, `ClientProfile.js`
**Assessment:** The frontend is largely complete for the MVP scope, providing a strong visual and interactive foundation.

### 1.2. Backend (FastAPI + SQLAlchemy + PostgreSQL)
**Progress:** The backend has a solid foundational structure and core authentication/user profile management implemented.
**Key Implemented Areas:**
*   **Authentication:** User registration, login, and JWT token generation are functional and tested.
*   **User & Profile Management:** `User`, `Profile`, and `RiskProfile` models are defined. Endpoints for reading and updating user profiles are implemented.
*   **Database Models:** `Transaction`, `Milestone`, and `Goal` models are defined. The `Account` model has been recently added and integrated.
**Gaps Identified:** While models exist, the CRUD operations and API endpoints for `Account`, `Transaction`, `Milestone`, and `Goal` are largely unimplemented.

### 1.3. Testing
**Status:** A comprehensive backend test suite using `pytest` is in place and currently **all tests are passing**.
**Coverage:**
*   Authentication (registration, login, token generation, invalid credentials)
*   User profile creation, reading, and updating (including risk score re-computation)
*   Security aspects (password hashing, JWT validation)
**Key Learnings from Testing:**
*   Initial database connection issues were resolved by configuring in-memory SQLite for tests.
*   Pydantic `ConfigError` was resolved by ensuring `orm_mode=True` was correctly applied to all relevant schemas (`User`, `UserInDB`, `ProfileOut`, `ProfileResponse`, `Profile`, `Goal`, `Milestone`, `RiskProfile`, `Transaction`).
*   Unique constraint violations (`kra_pin`, `email`) were addressed by implementing dynamic, UUID-based generation for test data.

## 2. Architecture and Constraints

### 2.1. Architecture
*   **Frontend:** Vite + React + Tailwind CSS
*   **Backend:** Node.js (or Python FastAPI) microservices; PostgreSQL for persistence (currently using SQLite for tests)
*   **Database Migrations:** Alembic
*   **Testing:** Jest + React Testing Library (frontend), Pytest (backend), Cypress (e2e)

### 2.2. Key Requirements (from PRD)
*   **Authentication & Security:** OAuth for SMS/Email ingestion (future), MFA for advisors (future).
*   **Data Processing:** Natural language parsing of SMS/email (future); mapping to ledger entries (future).
*   **Visualization:** Responsive charts (Trend, Bar, Timeline); interactive "Take Action" buttons.
*   **Scenario Tools:** Monte Carlo engine, FIRE formula, debt amortization model.
*   **Advisor Tools:** PDF report export; audit-trail logging; task automation scheduler.
*   **Internationalization:** Plug-and-play jurisdiction module for local social-security schemes.

### 2.3. Constraints
*   **Performance:** Onboarding ingestion latency < 2s; chart render < 500ms.
*   **Scalability:** Support 100k users & 5k advisors concurrently.
*   **Reliability:** 99.9% uptime; daily backups of financial data.
*   **Security:** Data encrypted at rest & in transit; compliance with Kenyan data-privacy laws.

## 3. Next Steps / Remaining Work (MVP Scope)

The primary focus for the next phase should be on completing the backend functionality to support the already built frontend components.

1.  **Implement CRUD Operations for `Account` Model:**
    *   Create FastAPI endpoints for `Account` creation, retrieval, update, and deletion.
    *   Develop corresponding CRUD functions in `api/app/crud`.
    *   Write unit and integration tests for these endpoints.

2.  **Implement CRUD Operations for `Transaction` Model:**
    *   Create FastAPI endpoints for `Transaction` creation, retrieval, update, and deletion.
    *   Develop corresponding CRUD functions in `api/app/crud`.
    *   Write unit and integration tests for these endpoints.

3.  **Implement CRUD Operations for `Milestone` Model:**
    *   Create FastAPI endpoints for `Milestone` creation, retrieval, update, and deletion.
    *   Develop corresponding CRUD functions in `api/app/crud`.
    *   Write unit and integration tests for these endpoints.

4.  **Implement CRUD Operations for `Goal` Model:**
    *   Create FastAPI endpoints for `Goal` creation, retrieval, update, and deletion.
    *   Develop corresponding CRUD functions in `api/app/crud`.
    *   Write unit and integration tests for these endpoints.

5.  **Integrate Frontend with Backend APIs:**
    *   Connect the existing frontend components (Balance Sheet, Dashboard, Tools) to the newly implemented backend APIs.

6.  **Implement Core Business Logic (Backend):**
    *   **Cash-Flow Setup:** Implement backend logic for processing income sources and expense categories.
    *   **Lifetime Timeline Logic:** Develop backend logic to dynamically generate timeline events and contextual CFA advice based on user data.
    *   **Tools Suite Logic:** Implement the core calculation logic for FIRE Calculator, Monte Carlo Simulator, and Debt Repayment Planner.

7.  **Advisor Portal Backend:**
    *   Implement backend APIs for advisor-specific functionalities (client management, reporting, scenario modeling).

8.  **Database Setup for Development/Production:**
    *   Transition from in-memory SQLite to PostgreSQL for development and production environments.
    *   Ensure Alembic migrations are correctly configured and applied.

## 4. Important Notes

*   **Code Quality:** Maintain strict adherence to linting (Flake8, Black), formatting (Prettier), and type-checking standards.
*   **Test-Driven Development:** Continue writing comprehensive unit and integration tests for all new features.
*   **Security:** Prioritize security best practices throughout development, especially when handling sensitive financial data.
*   **Modularity:** Continue to build out the backend with a modular microservices approach as outlined in the PRD.
