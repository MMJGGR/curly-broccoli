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
*   **API Helper Module:** `src/api.js` provides fetch-based CRUD helpers for Accounts, Transactions, Milestones and Goals.
**Assessment:** The frontend is largely complete for the MVP scope, providing a strong visual and interactive foundation.

### 1.2. Backend (FastAPI + SQLAlchemy + PostgreSQL)
**Progress:** The backend has a solid foundational structure and core authentication/user profile management implemented.
**Key Implemented Areas:**
*   **Authentication:** User registration, login, and JWT token generation are functional and tested.
*   **User & Profile Management:** `User`, `Profile`, and `RiskProfile` models are defined. Endpoints for reading and updating user profiles are implemented.
*   **Database Models:** `Transaction`, `Milestone`, and `Goal` models are defined. The `Account` model has been recently added and integrated.
**Gaps Identified:** While models exist, the CRUD operations and API endpoints for `Account`, `Transaction`, `Milestone`, and `Goal` require significant enhancement to meet PRD requirements (e.g., filtering, pagination) and support the advanced frontend components.

### 1.3. Testing
**Status:** A comprehensive backend test suite using `pytest` is in place and currently **all tests are passing**.
**Coverage:**
*   Authentication (registration, login, token generation, invalid credentials)
*   User profile creation, reading, and updating (including risk score re-computation)
*   Security aspects (password hashing, JWT validation)
**Key Learnings from Testing:**
*   Initial database connection issues were resolved by configuring in-memory SQLite for tests.
*   Pydantic `ConfigError` was resolved by enabling `from_attributes=True` (replacing the old `orm_mode=True`) on all relevant schemas (`User`, `UserInDB`, `ProfileOut`, `ProfileResponse`, `Profile`, `Goal`, `Milestone`, `RiskProfile`, `Transaction`).
*   Response validation errors were fixed by making `risk_level` an integer field consistently across schemas and tests.
*   Unique constraint violations (`kra_pin`, `email`) were addressed by implementing dynamic, UUID-based generation for test data.

## 2. Architecture and Constraints

### 2.1. Architecture
*   **Frontend:** Vite + React + Tailwind CSS
*   **Backend:** Python FastAPI; PostgreSQL for persistence (currently using SQLite for tests)
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

---

## 3. New Strategic Direction: Enterprise-Level Financial Source of Truth

Our strategic goal is to evolve into a self-sufficient, enterprise-grade personal finance application that provides all necessary tools for a normal user without reliance on external financial planning software (e.g., eMoney Advisor). Crucially, the application will also serve as a **verifiable source of truth for a user's financial life**, enabling other data users (e.g., for onboarding in other apps, similar to SmileID or Plaid's role) to gain assurance from our data, with appropriate user consent.

This direction prioritizes building robust internal capabilities, ensuring data integrity, and exposing secure, reliable APIs.

---

## 4. Revised Roadmap: Sprints for Core Functionality & Data Foundation

The following sprints focus on establishing a stable, feature-rich base aligned with the PRD's MVP and Phase II, while laying the groundwork for the "source of truth" capability.

### Sprint 1: Achieving a Clean Slate & Core Data Foundation (3 Weeks)

**Focus:** Resolving critical existing mismatches and establishing a robust, PRD-compliant core data foundation. This sprint ensures the backend and frontend are aligned and behaving as intended before building new complex features.

**Key Features & Changes:**
*   **Resolve Onboarding Mismatches (Frontend-Backend Alignment):**
    *   **Problem Addressed:** Frontend's multi-step onboarding flow is not fully supported by the backend's monolithic `RegisterRequest` schema. Backend lacks explicit support for multiple income sources, managing expense categories, and specific emergency fund goal onboarding.
    *   **PRD Link:**
        *   **Key Feature 4.1: Onboarding Screens** ("Multi-step form," "entering income sources and expense categories," "real-time goal recommendation (Emergency Fund target)").
        *   **Functional Requirement 1:** "Manual Setup: Guided multi-step forms for personal profile, income sources, expense categories, and goal targets."
        *   **Epic 1: Onboarding & Data Entry:** User Stories like "As a new user, I want to complete a guided welcome tour...", "As a user, I want to input my monthly net income...", "As a user, I want to add multiple income sources...", "As a user, I want to define my major expense categories...", "As a user, I want to set my emergency fund goal onboarding..."
    *   **Affected Parts of App:**
        *   **Backend Schemas:** New Pydantic schemas (e.g., `OnboardingProfileStep`, `OnboardingIncomeStep`, `OnboardingExpenseStep`) in `api/app/schemas/`.
        *   **Backend DB:** Potentially new SQLAlchemy model for `OnboardingSession` in `api/app/models/` if temporary state persistence is needed.
        *   **Backend APIs:** New dedicated API endpoints (e.g., `POST /onboarding/profile`, `POST /onboarding/income`, `POST /onboarding/expenses`) in a new `api/app/onboarding.py` router (or `api/app/main.py`).
        *   **Backend Logic:** Implement logic to process multiple income sources and expense categories. Ensure the emergency fund goal is structured correctly within the `Goal` schema.
        *   **Frontend Components:** `Onboarding.js`, `OnboardingWizard.jsx`, `OnboardingDataConnection.js`, `OnboardingCashFlowSetup.js` will be updated to interact with these new, granular backend endpoints.
    *   **Expected Outcome for User Journeys:** A smooth, PRD-compliant onboarding experience for new users like **Jamal** and **Aisha**, allowing them to accurately input their initial financial data.
    *   **Required Technology:** FastAPI, Pydantic, SQLAlchemy, React.
    *   **Orchestration Dependencies:** Frontend orchestrates multi-step API calls, managing local state across steps. Backend manages session/state across steps, aggregating data for final user creation.
*   **Expand Profile Update Scope:**
    *   **Problem Addressed:** `ProfileUpdate` schema is too limited compared to `ProfileOut`, preventing updates to fields like `annual_income`, `dependents`, `goals`, `questionnaire`.
    *   **PRD Link:**
        *   **Key Feature 4.7: Advisor Portal Screens:** "Client Profile: Overview, Goals Progress, Recent Activity, Advice History." (Advisors need to see and potentially update comprehensive client profiles).
        *   **Functional Requirement 1:** "Manual Setup: Guided multi-step forms for personal profile." (Implies profile can be updated post-onboarding).
    *   **Affected Parts of App:**
        *   **Backend Schemas:** Modify `api/app/schemas/user.py` to expand `ProfileUpdate` to include fields like `annual_income`, `dependents`, `goals`, `questionnaire` as optional.
        *   **Backend APIs:** Update `api/app/api/v1/endpoints/profile.py` (`PUT /profile`) to correctly handle updates for these newly included fields.
        *   **Frontend Components:** Relevant profile editing components (e.g., `frontend/src/components/ProfileEdit.js` if it exists) will be updated to send these fields.
    *   **Expected Outcome for User Journeys:** Users (**Jamal, Aisha, Samuel**) can fully update their financial profiles over time. Advisors (**Emily, Daniel**) can maintain comprehensive and accurate client profiles.
    *   **Required Technology:** Pydantic, FastAPI.
    *   **Orchestration Dependencies:** Standard CRUD orchestration for profile updates.
*   **Enhance Account, Transaction, Milestone, Goal CRUDs (Pagination, Filtering, Sorting):**
    *   **Problem Addressed:** Existing CRUD endpoints lack support for these essential features, which are required by the PRD and the frontend's advanced components for managing large datasets.
    *   **PRD Link:**
        *   **Key Feature 4.3: Lifetime Balance Sheet & Accounts:** "Accounts & Transactions: Filterable, searchable transaction table."
        *   **Key Feature 4.7: Advisor Portal Screens:** "Client List: Status badges, search/filter controls."
        *   **Functional Requirement 5:** "List APIs: All list endpoints must support pagination, filtering, and sorting."
        *   **Epic 3: Lifetime Balance Sheet & Accounts:** User Stories like "As a user, I want filters (date range, category, account) on the transaction table," "As a user, I want pagination or infinite scroll on the transaction list."
        *   **Epic 7: Advisor Portal:** User Story "As an advisor, I want to search or filter my client list."
    *   **Affected Parts of App:**
        *   **Backend Schemas:** No direct changes to existing data schemas, but API request schemas might be introduced for complex filter/sort parameters.
        *   **Backend DB:** SQLAlchemy queries within `api/app/crud/` will be updated to apply `offset()`, `limit()`, `filter_by()`, `order_by()`.
        *   **Backend APIs:** Modify `GET /accounts/`, `GET /transactions/`, `GET /milestones/`, `GET /goals/` endpoints in `api/app/accounts.py`, `api/app/transactions.py`, `api/app/milestones.py`, `api/app/goals.py` to accept query parameters for pagination, filtering, and sorting.
        *   **Frontend Components:** `AccountsTransactions.js`, `GoalsOverview.js`, `LifetimeJourneyTimeline.js`, `ClientList.js` will be updated to include UI elements for pagination, search, filtering, and sortable columns.
    *   **Expected Outcome for User Journeys:** Users (**Jamal, Aisha, Samuel**) can efficiently browse and manage their financial data. Advisors (**Emily, Daniel**) can quickly find and manage specific client data.
    *   **Required Technology:** FastAPI query parameters, SQLAlchemy `offset`/`limit`/`filter_by`/`order_by`, React UI components.
    *   **Orchestration Dependencies:** API endpoints orchestrate the construction of dynamic queries in the CRUD layer based on frontend parameters.
*   **Implement Income Source & Expense Category Management:**
    *   **Problem Addressed:** No dedicated backend support for managing user-defined income sources and expense categories.
    *   **PRD Link:**
        *   **Key Feature 4.1: Onboarding Screens:** "Multi-step form... for entering income sources and expense categories."
        *   **Functional Requirement 1:** "Manual Setup: Guided multi-step forms for... income sources, expense categories."
        *   **Epic 1: Onboarding & Data Entry:** User Stories "As a user, I want to add multiple income sources...", "As a user, I want to define my major expense categories..."
    *   **Affected Parts of App:**
        *   **Backend Schemas:** New Pydantic schemas (`IncomeSourceCreate`, `IncomeSource`, `ExpenseCategoryCreate`, `ExpenseCategory`) in `api/app/schemas/`.
        *   **Backend DB:** New SQLAlchemy models and corresponding tables (`income_sources`, `expense_categories`) in `api/app/models/`.
        *   **Backend APIs:** New FastAPI routers and CRUD endpoints (e.g., `api/app/income_sources.py`, `api/app/expense_categories.py`).
        *   **Frontend Components:** New UI components for managing income sources and expense categories (e.g., forms, lists).
    *   **Expected Outcome for User Journeys:** Users (**Jamal, Aisha, Samuel**) can accurately track and categorize their cash flow, foundational for budgeting and financial analysis.
    *   **Required Technology:** FastAPI, Pydantic, SQLAlchemy, React.
    *   **Orchestration Dependencies:** Standard CRUD orchestration for these new entities.
*   **Refine `Milestone` Schema for Dynamic Values:**
    *   **Problem Addressed:** `assets`, `liabilities`, `net_worth` in `MilestoneCreate` are currently `str` but should be dynamic numerical values calculated by the backend.
    *   **PRD Link:**
        *   **Key Feature 4.2: Lifetime Timeline & Advice:** "Event Cards: Each milestone shows... snapshot (Assets/Liabilities/Net Worth)."
        *   **Epic 2: Lifetime Timeline & Advice:** User Story "As a user, I want a snapshot of assets, liabilities, and net worth with each event so I see financial context."
    *   **Affected Parts of App:**
        *   **Backend Schemas:** Modify `api/app/schemas/milestone.py` to change `assets`, `liabilities`, `net_worth` from `str` to `float` (or `Decimal`).
        *   **Backend DB:** Modify `milestones` table column types in `api/app/models/milestone.py` (requires Alembic migration).
        *   **Backend APIs:** Update `POST /milestones/` and `PUT /milestones/{id}` in `api/app/milestones.py` to ensure these values are calculated and stored numerically.
        *   **Frontend Components:** `LifetimeJourneyTimeline.js` and other milestone display components will handle numerical values.
    *   **Expected Outcome for User Journeys:** The Lifetime Timeline accurately reflects a user's financial state at each milestone, providing meaningful context for **Jamal, Aisha, Samuel**.
    *   **Required Technology:** Pydantic, Python `Decimal` type, SQLAlchemy, FastAPI.
    *   **Orchestration Dependencies:** Backend logic orchestrates the calculation of these financial snapshots before storing/returning milestone data.
*   **Implement Initial Balance Sheet Calculation API:**
    *   **Problem Addressed:** No explicit API to provide an initial balance sheet snapshot during onboarding.
    *   **PRD Link:**
        *   **Key Feature 4.3: Lifetime Balance Sheet & Accounts:** "Balance Sheet: Register views for Assets and Liabilities with calculations (Total Assets, Total Liabilities, Net Worth)."
        *   **Epic 1: Onboarding & Data Entry:** User Story "As a user, I want to preview my initial Lifetime Balance Sheet snapshot after onboarding so I feel confident setup is accurate."
    *   **Affected Parts of App:**
        *   **Backend Schemas:** New Pydantic schema for the response (e.g., `InitialBalanceSheetSnapshot`) in `api/app/schemas/`.
        *   **Backend APIs:** New API endpoint (e.g., `GET /onboarding/initial-balance-sheet`) in `api/app/onboarding.py` (or `api/app/main.py`).
        *   **Frontend Components:** Onboarding components (e.g., `OnboardingCashFlowSetup.js`) will call this API and display the snapshot.
    *   **Expected Outcome for User Journeys:** Provides immediate feedback and confidence to new users like **Jamal** during onboarding, confirming their initial setup.
    *   **Required Technology:** FastAPI, SQLAlchemy.
    *   **Orchestration Dependencies:** API aggregates data from existing `Account` and `Transaction` models.

**Expected Outcome:** A fully aligned and functional core backend that correctly supports the existing frontend UI, resolves all identified critical mismatches, and provides a solid, queryable data foundation.

**Test Coverage:**
*   **Unit Tests:** For all new CRUD functions (income sources, expense categories), balance sheet calculation logic, and updated profile logic.
*   **Integration Tests:** For all new and enhanced API endpoints, verifying correct filtering, pagination, data integrity, and the complete onboarding flow.
*   **E2E Tests (Cypress):** Critical for verifying the entire onboarding user journey and core CRUD interactions from the frontend.
*   **Why Necessary:** This sprint is foundational. It ensures the application's core is stable, reliable, and accurately reflects the PRD's requirements, providing a "clean slate" from which to build more complex features.

### Sprint 2: Financial Tools Backend & Data Persistence (3 Weeks)

**Focus:** Implementing the core calculation logic and data storage for the PRD's specified financial planning tools.

**Key Features & Changes:**
*   **Implement FIRE Calculator Backend:**
    *   **PRD Link:**
        *   **Key Feature 4.5: Tools Suite:** "FIRE Calculator: Form inputs for savings, expenses, returns, and SWR, with instant projection."
        *   **Functional Requirement 4:** "Scenario Tools: FIRE formula."
        *   **Epic 5: Tools Suite:** User Story "As a user, I want inputs for current savings, annual expenses, return rate, and withdrawal rate so I can calculate my FIRE number."
    *   **Affected Parts of App:**
        *   **Backend Schemas:** New Pydantic schemas (`FireInput`, `FireResult`) in `api/app/schemas/fire.py`.
        *   **Backend DB:** New SQLAlchemy model (`FireCalculation`) in `api/app/models/fire_calculation.py` to persist inputs and results.
        *   **Backend Logic:** Update `compute/operations.py` with `calculate_fire` function.
        *   **Backend APIs:** New API endpoint (`POST /tools/fire`) in a new `api/app/tools.py` router.
    *   **Expected Outcome for User Journeys:** Users (**Jamal, Aisha, Samuel**) can calculate their FIRE number and save the results for future reference. This supports **Samuel's** pre-retirement planning and **Jamal's** long-term wealth accumulation goals.
    *   **Required Technology:** FastAPI, Pydantic, Python numerical libraries, SQLAlchemy.
    *   **Orchestration Dependencies:** API calls `compute` module for calculation, then persists results to DB.
*   **Implement Debt Repayment Planner Backend:**
    *   **PRD Link:**
        *   **Key Feature 4.5: Tools Suite:** "Debt Repayment Planner: Loan entry form and amortization output (Payoff time, Interest saved)."
        *   **Functional Requirement 4:** "Scenario Tools: debt amortization model."
        *   **Epic 5: Tools Suite:** User Story "As a user, I want to enter loan name, balance, rate, minimum payment, and extra payment so I can plan payoff."
    *   **Affected Parts of App:**
        *   **Backend Schemas:** New Pydantic schemas (`DebtPlannerInput`, `DebtPlannerResult`) in `api/app/schemas/debt_planner.py`.
        *   **Backend DB:** New SQLAlchemy model (`DebtPlan`) in `api/app/models/debt_plan.py` to persist inputs and results.
        *   **Backend Logic:** Update `compute/operations.py` with `calculate_debt_repayment` function.
        *   **Backend APIs:** New API endpoint (`POST /tools/debt-planner`) in `api/app/tools.py`.
    *   **Expected Outcome for User Journeys:** Users (**Jamal, Aisha**) can plan their debt payoff strategies and save the results. This directly supports **Jamal's** "pay off student loan" journey and **Aisha's** "mortgage management."
    *   **Required Technology:** FastAPI, Pydantic, Python numerical libraries, SQLAlchemy.
    *   **Orchestration Dependencies:** API calls `compute` module for calculation, then persists results to DB.
*   **Implement Monte Carlo Simulator Backend:**
    *   **PRD Link:**
        *   **Key Feature 4.5: Tools Suite:** "Monte Carlo Simulator: Parameterized inputs and results summary (Success Probability, Median, Worst Outcomes)."
        *   **Functional Requirement 4:** "Scenario Tools: Monte Carlo engine."
        *   **Epic 5: Tools Suite:** User Story "As a user, I want inputs for initial portfolio, annual contribution, return range, volatility, and runs so I can configure simulations."
        *   **User Journey:** **Emily (Advisor)**: "Login → select client → run Monte Carlo."
    *   **Affected Parts of App:**
        *   **Backend Schemas:** New Pydantic schemas (`MonteCarloInput`, `MonteCarloResult`) in `api/app/schemas/monte_carlo.py`.
        *   **Backend DB:** New SQLAlchemy model (`MonteCarloSimulation`) in `api/app/models/monte_carlo_simulation.py` to persist inputs and results.
        *   **Backend Logic:** Update `compute/operations.py` with `run_monte_carlo` function.
        *   **Backend APIs:** New API endpoint (`POST /tools/monte-carlo`) in `api/app/tools.py`.
    *   **Expected Outcome for User Journeys:** Users (**Samuel**) and Advisors (**Emily**) can run Monte Carlo simulations to understand investment risk and test financial plans. Results are persisted for review.
    *   **Required Technology:** FastAPI, Pydantic, NumPy/SciPy (for simulation), SQLAlchemy.
    *   **Orchestration Dependencies:** API calls `compute` module for simulation, then persists results to DB.
*   **Implement Historical Net Worth API:**
    *   **PRD Link:**
        *   **Key Feature 4.3: Lifetime Balance Sheet & Accounts:** "Balance Sheet: embedded Net Worth Trend chart placeholder."
        *   **Key Feature 4.4: Dashboard & Widgets:** "Snapshot Cards: Net Worth Snapshot, Net Worth Projection."
        *   **Epic 3: Lifetime Balance Sheet & Accounts:** User Story "As a user, I want to see a placeholder chart area for Net Worth Trend."
    *   **Affected Parts of App:**
        *   **Backend APIs:** New API endpoint (e.g., `GET /net-worth/history`) in `api/app/reports.py` (or `api/app/main.py`).
        *   **Backend Logic:** Aggregates historical account and transaction data to calculate net worth over time.
    *   **Expected Outcome for User Journeys:** Provides historical context for all users (**Jamal, Aisha, Samuel**) to track their financial progress and visualize trends.
    *   **Required Technology:** FastAPI, SQLAlchemy.
    *   **Orchestration Dependencies:** API aggregates historical data from `Account` and `Transaction` models.

**Expected Outcome:** Fully functional backend for FIRE, Debt Planner, and Monte Carlo tools, with persistent storage of simulation parameters and results for historical tracking and advisor review.

**Test Coverage:**
*   **Unit Tests:** Extensive tests for all calculation functions in `compute/operations.py` (edge cases, various inputs).
*   **Integration Tests:** For all new API endpoints, verifying correct input parsing, calculation, data persistence, and output formatting.
*   **Why Necessary:** Directly supports the existing frontend "Tools Suite" components, enables scenario planning, and is fundamental for the "source of truth" vision by persisting verifiable financial projections.

### Sprint 3: Frontend Integration & Dashboard Enhancements (2 Weeks)

**Focus:** Connecting the existing frontend UI to the newly implemented backend APIs and enhancing dashboard data.

**Key Features & Changes:**
*   **Integrate Frontend with FIRE, Debt, Monte Carlo APIs:**
    *   **PRD Link:** This directly fulfills the "UI" aspects of **Key Feature 4.5: Tools Suite** for FIRE, Monte Carlo, and Debt Repayment Planner, as the frontend components (`FIRECalculator.js`, `DebtRepaymentPlanner.js`, `MonteCarloSimulation.js`) are already built.
    *   **Affected Parts of App:**
        *   **Frontend API Helper:** Update `frontend/src/api.js` with new functions (e.g., `calculateFire`, `planDebtRepayment`, `runMonteCarlo`) to call the new backend APIs.
        *   **Frontend Components:** Update `FIRECalculator.js`, `DebtRepaymentPlanner.js`, `MonteCarloSimulation.js` to use these new API functions, handle loading states, error messages, and display the results.
    *   **Expected Outcome for User Journeys:** Fully functional, interactive financial planning tools for users (**Jamal, Aisha, Samuel**), allowing them to perform calculations and visualize outcomes.
    *   **Required Technology:** React, Fetch API.
    *   **Orchestration Dependencies:** Frontend calls backend APIs, handles loading/errors, and displays results.
*   **Implement Monthly Cash-Flow Summary API:**
    *   **PRD Link:**
        *   **Key Feature 4.4: Dashboard & Widgets:** "Monthly Cash-Flow Summary card with income, expenses, and savings rate."
        *   **Epic 4: Dashboard & Widgets:** User Story "As a user, I want a Monthly Cash-Flow Summary card..."
    *   **Affected Parts of App:**
        *   **Backend APIs:** New API endpoint (e.g., `GET /dashboard/cash-flow-summary`) in `api/app/reports.py` (or `api/app/main.py`).
        *   **Frontend Components:** `Dashboard.jsx`, `UserDashboard.js` will call this API and display the summary.
    *   **Expected Outcome for User Journeys:** Provides **Jamal** and **Aisha** with a clear, dynamic overview of their budgeting health and spending habits.
    *   **Required Technology:** FastAPI, SQLAlchemy, React.
    *   **Orchestration Dependencies:** Backend API aggregates income and expense data from `Transaction` and `IncomeSource` models.
*   **Implement Top Advice Carousel API:**
    *   **PRD Link:**
        *   **Key Feature 4.4: Dashboard & Widgets:** "Top Advice carousel, Goal Progress bars."
        *   **Epic 4: Dashboard & Widgets:** User Story "As a user, I want a Top Advice carousel with up to 5 personalized recommendations."
    *   **Affected Parts of App:**
        *   **Backend APIs:** New API endpoint (e.g., `GET /dashboard/top-advice`) in `api/app/advice.py` (or `api/app/main.py`).
        *   **Backend Logic:** Requires backend logic for generating or selecting personalized advice based on user data (potentially new `AdviceModule` model).
        *   **Frontend Components:** `Dashboard.jsx`, `UserDashboard.js` will call this API and display the advice carousel.
    *   **Expected Outcome for User Journeys:** Provides actionable, personalized insights for all users (**Jamal, Aisha, Samuel**), guiding them towards their financial goals.
    *   **Required Technology:** FastAPI, SQLAlchemy, React.
    *   **Orchestration Dependencies:** Backend API serves advice based on user data and predefined rules/content.
*   **Implement User Preferences API (Dashboard Customization):**
    *   **PRD Link:**
        *   **Epic 4: Dashboard & Widgets:** User Story "As a user, I want widget order to be customizable so I see the metrics most relevant to me first."
    *   **Affected Parts of App:**
        *   **Backend DB:** New SQLAlchemy model (`UserPreferences`) in `api/app/models/user_preferences.py`.
        *   **Backend APIs:** New API endpoints (e.g., `GET /user/preferences`, `PUT /user/preferences`) in `api/app/user.py` (or `api/app/main.py`).
        *   **Frontend Components:** Dashboard components will use this API to store and retrieve user-defined widget order.
    *   **Expected Outcome for User Journeys:** Enhances personalization for all users (**Jamal, Aisha, Samuel**), allowing them to tailor their dashboard experience to their preferences.
    *   **Required Technology:** FastAPI, SQLAlchemy, React.
    *   **Orchestration Dependencies:** Standard CRUD orchestration for user preferences.

**Expected Outcome:** A fully interactive frontend, with all core financial tools and dashboard widgets powered by the backend. Users can now perform calculations and see dynamic financial insights.

**Test Coverage:**
*   **E2E Tests (Cypress):** Critical for verifying the full user flow for each tool (input -> calculate -> display results) and dashboard interactions.
*   **Component Tests (Jest/RTL):** For frontend components, ensuring correct data rendering and interaction with API calls.
*   **Integration Tests:** For new dashboard/advice APIs.
*   **Why Necessary:** Activates the existing frontend UI, provides core value to the user, and enhances the overall user experience.

### Sprint 4: Advisor Portal Core & Data Assurance Foundation (3 Weeks)

**Focus:** Implementing core advisor functionalities and strengthening the data foundation for "source of truth" capabilities.

**Key Features & Changes:**
*   **Implement Advisor Role-Based Access Control (RBAC):**
    *   **PRD Link:**
        *   **Key Feature 4.7: Advisor Portal Screens:** Implies secure access for advisors.
        *   **Functional Requirement 1:** "Authentication & Security: MFA for advisors." (RBAC is foundational for this).
        *   **Functional Requirement 10.2: Developer Instructions:** "Authentication & Authorization: JWT with refresh tokens; RBAC for users vs advisors."
    *   **Affected Parts of App:**
        *   **Backend Logic:** Update `api/app/security.py` to include RBAC logic.
        *   **Backend APIs:** Apply FastAPI `Depends` to advisor-specific endpoints (e.g., in `api/app/advisor.py`) to enforce access control.
    *   **Expected Outcome for User Journeys:** Ensures secure and appropriate access for advisors (**Emily, Daniel**) to client data and advisor-specific functionalities.
    *   **Required Technology:** FastAPI dependencies, JWT claims.
    **Orchestration Dependencies:** Authentication/Authorization layer orchestrates access control for all incoming requests to protected endpoints.
*   **Implement Client Management APIs:**
    *   **PRD Link:**
        *   **Key Feature 4.7: Advisor Portal Screens:** "Client List: Status badges, search/filter controls, 'View Profile' actions."
        *   **Epic 7: Advisor Portal:** User Stories "As an advisor, I want to search or filter my client list...", "As an advisor, I want status badges...", "As an advisor, I want to view a client’s profile..."
    *   **Affected Parts of App:**
        *   **Backend DB:** New SQLAlchemy model (`AdvisorClient`) in `api/app/models/advisor_client.py` (or extend `User` model to link advisors to clients).
        *   **Backend APIs:** New API endpoints (e.g., `GET /advisors/clients`, `GET /advisors/clients/{client_id}`) in a new `api/app/advisor.py` router.
        *   **Frontend Components:** `ClientList.js`, `ClientProfile.js` will call these APIs.
    *   **Expected Outcome for User Journeys:** Advisors (**Emily, Daniel**) can efficiently manage their client base, search for clients, and view comprehensive client profiles.
    *   **Required Technology:** FastAPI, SQLAlchemy.
    *   **Orchestration Dependencies:** API aggregates data from multiple user-related models (`User`, `Profile`, `Account`, `Transaction`, `Goal`, `Milestone`, `Simulation Results`) to build comprehensive client profiles.
*   **Implement Advisor Dashboard APIs:**
    *   **PRD Link:**
        *   **Key Feature 4.7: Advisor Portal Screens:** "Advisor Dashboard: KPI cards (Total Clients, Pending Reviews, New Sign-ups) and Recent Activity list."
        *   **Epic 7: Advisor Portal:** User Stories "As an advisor, I want a dashboard with KPI cards...", "As an advisor, I want a Recent Activity list..."
    *   **Affected Parts of App:**
        *   **Backend APIs:** New API endpoints (e.g., `GET /advisors/dashboard/kpis`, `GET /advisors/dashboard/recent-activity`) in `api/app/advisor.py`.
        *   **Frontend Components:** `AdvisorDashboard.js` will call these APIs.
    *   **Expected Outcome for User Journeys:** Advisors (**Emily, Daniel**) get a quick overview of their practice's health and recent client activity.
    *   **Required Technology:** FastAPI, SQLAlchemy.
    *   **Orchestration Dependencies:** API aggregates data for KPIs from various user and client-related models.
*   **Implement Audit Trail Logging:**
    *   **PRD Link:**
        *   **Key Feature 4.7: Advisor Portal Screens:** "Client Profile: Advice History."
        *   **Functional Requirement 5:** "Advisor Tools: audit-trail logging."
        *   **Functional Requirement 10.2: Developer Instructions:** "Audit-trail logging."
    *   **Affected Parts of App:**
        *   **Backend DB:** New SQLAlchemy model (`AuditLog`) in `api/app/models/audit_log.py`.
        *   **Backend Logic:** Integrate logging into critical backend operations (e.g., data modifications, report generation, advisor actions) across various modules (e.g., `crud/`, API endpoints).
    *   **Expected Outcome for User Journeys:** Provides an immutable record of actions for compliance and accountability, crucial for the "source of truth" vision.
    *   **Required Technology:** SQLAlchemy event listeners, Python logging.
    *   **Orchestration Dependencies:** Intercepts critical operations at the service or CRUD layer to log changes.
*   **Implement Basic Report Generation API (PDF Export):**
    *   **PRD Link:**
        *   **Key Feature 4.7: Advisor Portal Screens:** "Client Profile: actionable buttons (Scenario, Report, Meeting)."
        *   **Functional Requirement 5:** "Advisor Tools: PDF report export."
        *   **Epic 7: Advisor Portal:** User Story "As an advisor, I want buttons to... generate a report."
    *   **Affected Parts of App:**
        *   **Backend APIs:** New API endpoint (e.g., `POST /reports/generate`) in `api/app/reports.py`.
        *   **Backend Logic:** Integrate with a Python PDF generation library (e.g., ReportLab, WeasyPrint).
        *   **Frontend Components:** `ClientProfile.js` will trigger this API.
    *   **Expected Outcome for User Journeys:** Advisors (**Emily, Daniel**) can generate basic PDF reports for clients directly from the platform.
    *   **Required Technology:** FastAPI, Python PDF libraries.
    *   **Orchestration Dependencies:** API triggers report generation logic, which pulls data from various models.

**Expected Outcome:** A functional advisor portal with secure access, client management capabilities, and a foundational audit trail for data assurance.

**Test Coverage:**
*   **Unit Tests:** For RBAC logic, audit logging functions.
*   **Integration Tests:** For all new advisor APIs, verifying access control, data aggregation, and report generation.
*   **Security Tests:** Specific tests for RBAC bypass attempts.
*   **Why Necessary:** Activates the existing frontend Advisor Portal, provides critical functionality for financial advisors, and is a cornerstone for the "source of truth" vision by ensuring data verifiability and accountability.

---

## 5. Future Accretive Features (Post-Stable Base)

Once the core functionality is stable and integrated, we can move to additional features that further enhance the enterprise-level capabilities and user experience, without relying on third-party financial planning apps.

*   **External Account Linking (Plaid/Direct API Integration):** Automated ingestion of transactions and balances from banks and M-PESA.
*   **Advanced Budgeting Tools:** Envelope/Zero-based budgeting, bill management, subscription tracking.
*   **Deeper Investment Analysis:** Portfolio performance tracking (TWR), asset allocation/rebalancing tools, tax-loss harvesting.
*   **Advanced Debt Management:** Debt snowball/avalance strategy tools.
*   **Comprehensive Reporting & Export:** Customizable financial reports for users and advisors (beyond basic PDF).
*   **AI/ML & Predictive Analytics:** Predictive cash flow forecasting, personalized spending insights, advanced risk profiling.
*   **Client Communication & Engagement Hub:** Integrated messaging, email templates, document sharing for advisors.
*   **Practice Management & Analytics:** Advisor dashboard KPIs, task automation, product recommendation engine.
*   **Multi-currency Support:** Backend to store currency per account and return converted totals.
*   **Real-time Updates:** WebSocket or SSE to notify clients when data changes on another device.
*   **Offline Usage:** PWA caching strategies and conflict resolution mechanisms.
*   **Dedicated Data Assurance/Verification API:** A secure, consent-driven API specifically designed for external parties to verify aspects of a user's financial data (e.g., for onboarding in other apps).

---

## 6. Important Notes

*   **Code Quality:** Maintain strict adherence to linting (Flake8, Black), formatting (Prettier), and type-checking standards.
*   **Test-Driven Development:** Continue writing comprehensive unit and integration tests for all new features.
*   **Security:** Prioritize security best practices throughout development, especially when handling sensitive financial data. This includes robust encryption for data at rest and in transit, secure API key management, and regular security audits.
*   **Modularity:** Continue to build out the backend with a modular approach, even within the current FastAPI monolith, to facilitate potential future microservices.
*   **Data as a Source of Truth:**
    *   **Data Integrity:** Emphasize strong database constraints, validation at the API layer, and robust error handling to ensure the accuracy and reliability of financial data.
    *   **API Robustness:** All APIs must be well-documented, versioned, and highly available to serve as a reliable source for internal and potential external consumers.
    *   **Auditability:** The implemented audit trail is crucial for verifying data changes and ensuring accountability, which is fundamental for external data assurance.
    *   **Consent Management:** Future considerations for external data sharing will require explicit, granular user consent mechanisms.