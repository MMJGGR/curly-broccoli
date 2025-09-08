# 🏦 Personal Finance Application - Project Wiki

## **Project Mission & Overview**

Enterprise-grade personal finance application for the **Kenyan market**, providing CFA Institute-compliant financial planning and portfolio management. Built with React frontend and FastAPI backend, targeting professionals earning 100K+ KES monthly.

### **🎯 Core Value Propositions**
- **Lifetime Financial Planning**: Traditional + human capital valuation  
- **CFA Institute Compliance**: Professional-grade financial analysis
- **Real-time Cross-Component Sync**: Changes update instantly across all components
- **Kenya-Specific**: Local market assumptions, KES currency, regulatory considerations

### **🚀 Current Status: CR004 UnifiedFinancialContext Migration**
**Phase 2 COMPLETE** (3 critical dashboard components migrated to unified context)
- ✅ FinancialHealthDashboard.jsx - Removed 6 direct API calls
- ✅ AssetDashboard.jsx - Removed 2 direct API calls  
- ✅ BalanceSheetDashboard.jsx - Removed 4 direct API calls

**Next: Phase 3** - Asset & Liability Management components (21+ components remaining)

---

## **📚 Key Documentation**
- **[PRODUCT_REQUIREMENTS_DOCUMENT.md](PRODUCT_REQUIREMENTS_DOCUMENT.md)** - Complete user stories & feature specs
- **[TECHNICAL_DEVELOPMENT_GUIDE.md](TECHNICAL_DEVELOPMENT_GUIDE.md)** - MANDATORY development standards
- **[CFA_COMPLIANCE_GUIDE.md](CFA_COMPLIANCE_GUIDE.md)** - Financial analysis standards  
- **[CHANGE_REQUEST_CR004](CHANGE_REQUEST_CR004_COMPONENT_MIGRATION.md)** - Active component migration plan
- **[COMPREHENSIVE_IMPLEMENTATION_PLAN.md](COMPREHENSIVE_IMPLEMENTATION_PLAN.md)** - Overall project roadmap

---

## **👤 Target Users & Sample Journeys**
- **Sarah (32, Marketing Manager)**: 250K KES income → Onboarding → Goal planning  
- **David (45, Business Owner)**: 530K KES income → Portfolio analysis → Scenario planning
- **Grace (28, Software Engineer)**: 180K KES income → Daily expense tracking → Budget optimization


## **⚠️ Critical Non-Negotiables for New Team**
1. **MANDATORY**: Read TECHNICAL_DEVELOPMENT_GUIDE.md before any development
2. **PROHIBITED**: Direct API calls (`fetch()`) from financial components
3. **REQUIRED**: All changes follow structured change request process
4. **CRITICAL**: Maintain CFA Institute compliance in all calculations

---

## 2. Development Process

### 2.1. Branching Strategy

We use the GitFlow branching strategy. All new features should be developed in a feature branch and then merged into the `develop` branch. The `main` branch is reserved for production releases.

### 2.2. Code Style

We use Prettier to automatically format our code. Please make sure to run `npm run format` before committing your code.

### 2.3. Commit Messages

We use the Conventional Commits specification for our commit messages. This helps us to automatically generate changelogs and to keep our commit history clean and easy to read.

### 2.4. Dependency Management

We use npm to manage our dependencies. Please make sure to run `npm install` after pulling the latest changes from the repository.

## 3. Architecture

Our application is built using a clean architecture. This means that the code is separated into three layers:

*   **Domain:** The domain layer contains the core business logic of the application.
*   **Application:** The application layer contains the use cases and application-specific logic.
*   **Infrastructure:** The infrastructure layer contains the implementation details, such as the database and the API.

For more information, please see the [Technical Development Guide](TECHNICAL_DEVELOPMENT_GUIDE.md).

## 4. Design Decisions

(This section would contain a log of all the design decisions that have been made for the project.)

## 5. Additional Best Practices

*   **Code Reviews:** All new code should be reviewed by at least one other developer before it is merged into the main branch. The code review checklist should include a check to ensure that the code follows the technical guide.
*   **Automated Checks:** Use static analysis tools to automatically check for violations of the technical guide. For example, you could configure a linter to flag any direct API calls in the UI components.
*   **Communication:** Encourage developers to communicate more with each other. This could be done through regular team meetings, a dedicated Slack channel, or by using a tool like a wiki to document design decisions.