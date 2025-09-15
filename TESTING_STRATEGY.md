# Testing Strategy & Organization
*Created while waiting for containers to build...*

## 📊 Current Test Inventory
- **Total E2E Tests**: 48 files
- **Recent Additions**: Simple login tests, UnifiedFinancialContext tests
- **Status**: Mixed - some working, some outdated

## 🎯 Test Categories & Organization

### **Priority 1: Core Functionality Tests** 
*Run these first to validate basic app functionality*
```
cypress/e2e/critical/
├── simple-login-test.cy.js           ✅ NEW - Basic auth validation
├── login-and-dashboard-flow.cy.js    ✅ NEW - Full workflow test
├── unified-context-mock-test.cy.js   ✅ NEW - Context integration
└── app-smoke-test.cy.js              📝 TODO - Basic app loading
```

### **Priority 2: Feature Tests**
*Test specific features with backend integration*
```
cypress/e2e/features/
├── asset-management.cy.js            📋 EXISTING - Asset CRUD
├── balance-sheet.cy.js               📋 EXISTING - Balance sheet functionality  
├── income-expense.cy.js              📋 EXISTING - Income/expense management
└── financial-health.cy.js            📝 TODO - Health dashboard tests
```

### **Priority 3: Integration Tests**
*Full end-to-end user workflows*
```
cypress/e2e/integration/
├── onboarding-complete-flow.cy.js    📋 EXISTING - Full onboarding
├── cross-component-sync.cy.js        📋 EXISTING - Component integration
└── persona-workflows.cy.js           📋 EXISTING - User persona tests
```

### **Priority 4: Regression Tests**
*Automated regression testing*
```
cypress/e2e/regression/
├── cr004-phase2-validation.cy.js     ✅ EXISTING - Context migration validation
├── clean-architecture-*.cy.js        📋 EXISTING - Architecture tests
└── performance-benchmarks.cy.js      📋 EXISTING - Performance validation
```

---

## 🚀 Recommended Test Execution Strategy

### **Daily Development Testing**
```bash
# Quick smoke test (2-3 minutes)
npx cypress run --spec "cypress/e2e/critical/**"

# Feature testing (5-10 minutes)  
npx cypress run --spec "cypress/e2e/features/**"
```

### **Pre-deployment Testing**
```bash
# Full integration test suite (15-20 minutes)
npx cypress run --spec "cypress/e2e/integration/**"

# Regression testing (10-15 minutes)
npx cypress run --spec "cypress/e2e/regression/**"
```

### **CI/CD Pipeline Testing**
```bash
# Critical path only (for fast feedback)
npx cypress run --spec "cypress/e2e/critical/**" --env API_MODE=mock

# Full suite on merge to main
npx cypress run --env API_MODE=integration
```

---

## 🛠️ Test Environment Configuration

### **Mock Mode** (Frontend Only - No Backend Required)
- **Use Case**: Development, quick validation, CI/CD
- **Setup**: `--env API_MODE=mock`
- **Benefits**: Fast, reliable, no dependencies

### **Local Mode** (Full Stack - Backend Required)
- **Use Case**: Feature development, integration testing
- **Setup**: `docker-compose up -d && npx cypress run --env API_MODE=local`
- **Benefits**: Real API testing, database integration

### **Integration Mode** (Production-like)
- **Use Case**: Pre-deployment, staging validation
- **Setup**: `--env API_MODE=integration --baseUrl=https://staging.app.com`
- **Benefits**: Production environment validation

---

## 📋 Test Maintenance Tasks

### **Immediate Actions** (While containers build)
- [x] Create login test suite
- [x] Set up mock API testing
- [ ] Organize existing tests into categories
- [ ] Create test execution scripts
- [ ] Document test data requirements

### **Short Term** (Next 1-2 weeks)
- [ ] Migrate legacy tests to new patterns
- [ ] Add data-testid attributes to components
- [ ] Create component-specific test helpers
- [ ] Set up test reporting dashboard

### **Long Term** (Next month)
- [ ] Implement visual regression testing
- [ ] Add performance monitoring
- [ ] Create automated test generation
- [ ] Set up cross-browser testing

---

## 🎯 Success Metrics

### **Test Coverage Goals**
- **Critical Path**: 100% coverage
- **Feature Tests**: 80% coverage  
- **Edge Cases**: 60% coverage

### **Performance Targets**
- **Smoke Tests**: < 3 minutes
- **Feature Tests**: < 10 minutes
- **Full Suite**: < 30 minutes

### **Reliability Targets**
- **Flaky Test Rate**: < 5%
- **False Positive Rate**: < 2%
- **Test Maintenance Time**: < 2 hours/week

---

## 🔧 Tools & Utilities

### **Custom Cypress Commands**
```javascript
// Already implemented
cy.loginWithTestUser()          // Quick authentication
cy.verifyDashboardAccess()      // Verify post-login state
cy.shouldShowNoErrors()         // Check for JS errors
cy.setupMockAPI()               // Mock all API endpoints
```

### **Test Data Management**
```javascript
// Mock data files created
fixtures/mockAssets.json        ✅ Asset test data
fixtures/mockLiabilities.json   ✅ Liability test data  
fixtures/mockIncome.json        ✅ Income test data
fixtures/mockExpenses.json      ✅ Expense test data
```

### **Execution Scripts** 
```bash
# Quick test scripts we can create
npm run test:smoke      # Critical tests only
npm run test:features   # Feature testing
npm run test:full       # Complete test suite
npm run test:mock       # Frontend-only testing
```

---

## 💡 Next Steps

1. **Organize existing 48 test files** into the category structure above
2. **Create test execution scripts** for different scenarios  
3. **Add missing critical path tests** (app smoke test, component integration)
4. **Set up automated test reporting** and notifications
5. **Document test data requirements** and setup procedures

This gives us a solid foundation for reliable, maintainable testing as our application grows!
## CR006 E2E via Docker Compose

To run the end‑to‑end tests for Change Request CR006 without installing local desktop deps for Cypress, use the `cypress` compose service.

### What it does
- Waits for `frontend` (http://frontend:3000) and `api` (http://api:8000/healthz).
- Seeds a test user (idempotent) and baseline data (asset, salary income, rent/utilities, a budget category).
- Runs the CR006 Cypress specs under `frontend/cypress/e2e-cr006/` in a headless container with all required Electron libraries.

### Commands
```
docker compose up -d --build api frontend
docker compose up --build --abort-on-container-exit cypress
```

### Credentials used
- Email: `richard.mmacharia@gmail.com`
- Password: `jaggerthee`

You can override via environment variables `TEST_USER_EMAIL`, `TEST_USER_PASSWORD`.

### Running locally (optional)
If you prefer to run Cypress locally instead of the container, install system deps required by Cypress Electron (on Ubuntu/Debian):
```
sudo apt-get update && sudo apt-get install -y \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0 \
  libasound2 libxss1 libgbm1 libxshmfence1 xvfb
```
Then run:
```
cd frontend && npm run e2e
```
