# Project Analysis and Recommendations

## 1. Overview

This document provides a comprehensive analysis of the current project implementation against the technical guide. It also includes recommendations for refactoring and cleanup, with a dependency analysis to ensure that the proposed changes will not break the application.

## 2. Alignment with Technical Guide

The current implementation deviates significantly from the technical guide in several key areas:

*   **Architecture:** The application does not follow the clean architecture principles outlined in the guide. The frontend components are tightly coupled with API calls, and there is no clear separation of concerns.
*   **Data Management:** The application has multiple, siloed data stores, which is in direct opposition to the unified data architecture described in the guide. The `kenyaReturnRiskModels.js` file also violates the "No Hardcoded Values" policy.
*   **Financial Calculations:** The financial calculations in the application are not consistently at the CFA level.
*   **API Standards:** The API does not consistently follow the standards outlined in the guide.
*   **Frontend Architecture:** The frontend architecture does not follow the prescribed structure.

## 3. Redundant Files and Code

*   **`kenyaReturnRiskModels.js`:** This file contains hardcoded financial data and should be removed.
*   **Siloed Components:** The `GoalsOverview.jsx`, `IncomeManagement.jsx`, `ExpenseManagement.jsx`, and `LiabilityManagement.jsx` components are redundant and should be refactored.
*   **Multiple Contexts:** The `OnboardingContext.js` and `TransactionContext.js` are redundant.
*   **Inconsistent API Endpoints:** The application has multiple, inconsistent API endpoints for the same types of data.

## 4. Core Functionalities, Related Files, and Recommendations

| Core Functionality | Related Files | Recommendations |
| :--- | :--- | :--- |
| **User Onboarding** | `frontend/src/components/onboarding/`, `frontend/src/contexts/OnboardingContext.js` | Merge the `OnboardingContext` with the `TransactionContext`. |
| **Profile Management**| `frontend/src/components/profile/EnhancedProfile.jsx` | | 
| **Budgeting** | `frontend/src/components/budget/`, `frontend/src/contexts/TransactionContext.js` | | 
| **Asset Management** | `frontend/src/components/assets/`, `frontend/src/components/tools/AssetManagement.jsx` | Remove the `AssetManagement.jsx` component in the `tools` directory. |
| **Liability Management**| `frontend/src/components/tools/LiabilityManagement.jsx` | Refactor to use the `TransactionContext`. |
| **Income Management** | `frontend/src/components/tools/IncomeManagement.jsx` | Refactor to use the `TransactionContext`. |
| **Expense Management**| `frontend/src/components/tools/ExpenseManagement.jsx` | Refactor to use the `TransactionContext`. |
| **Goal Management** | `frontend/src/components/goals/GoalsOverview.jsx` | Refactor to use the `TransactionContext`. |
| **Financial Data** | `frontend/src/utils/kenyaReturnRiskModels.js` | Remove this file and move the data to a database. |

## 5. Dependency Analysis and Recommendations

### 5.1. Consolidate Data Management into `TransactionContext`

*   **Change:** Merge the `OnboardingContext` with the `TransactionContext` and refactor all siloed components to use the `TransactionContext`.
*   **Affected Files:**
    *   `frontend/src/contexts/OnboardingContext.js` (to be removed)
    *   `frontend/src/contexts/TransactionContext.js` (to be updated)
    *   `frontend/src/components/onboarding/FinancialInfoStep.js`
    *   `frontend/src/components/goals/GoalsOverview.jsx`
    *   `frontend/src/components/tools/IncomeManagement.jsx`
    *   `frontend/src/components/tools/ExpenseManagement.jsx`
    *   `frontend/src/components/tools/LiabilityManagement.jsx`
*   **Dependency Analysis:**
    *   The `OnboardingContext` is only used within the onboarding components. Removing it will not affect any other part of the application.
    *   The `TransactionContext` is used by the `EnhancedProfile` and `BudgetOverview` components. Expanding it to include all financial data will not break these components, but it will require them to be updated to use the new data structure.
    *   The siloed components are not used by any other parts of the application, so refactoring them will not have any downstream effects.
*   **Recommendation:** This is a major refactoring effort, but it is essential for fixing the data integration issues and aligning the application with the technical guide. The changes should be made in a phased approach, as outlined in the updated change request.

### 5.2. Remove `kenyaReturnRiskModels.js`

*   **Change:** Remove the `kenyaReturnRiskModels.js` file and move the data to a database.
*   **Affected Files:**
    *   `frontend/src/utils/kenyaReturnRiskModels.js` (to be removed)
    *   `frontend/src/components/assets/AssetForm.jsx`
    *   `frontend/src/components/balance-sheet/BalanceSheetDashboard.jsx`
*   **Dependency Analysis:**
    *   The `getKenyaAssetCategories` function from this file is used in `AssetForm.jsx` to populate the asset type dropdown.
    *   The `KENYA_ASSET_CLASSES` and other constants are used in `BalanceSheetDashboard.jsx` for calculations.
*   **Recommendation:**
    1.  Create a new API endpoint to fetch the asset categories from the database.
    2.  Update `AssetForm.jsx` to use this new endpoint.
    3.  Create new API endpoints to perform the financial calculations that are currently done on the frontend using the hardcoded data.
    4.  Update `BalanceSheetDashboard.jsx` to use these new endpoints.

### 5.3. Remove Redundant Components

*   **Change:** Remove the redundant `AssetManagement.jsx` component from the `tools` directory.
*   **Affected Files:**
    *   `frontend/src/components/tools/AssetManagement.jsx` (to be removed)
*   **Dependency Analysis:**
    *   This component is not used anywhere in the application.
*   **Recommendation:** This is a safe change that will help to clean up the project.
