# 🔧 Cypress Environment Issues - Root Cause Analysis

**Date:** February 1, 2025  
**Issue:** Cypress E2E tests timing out and failing  
**Status:** 🔍 **DIAGNOSED - MULTIPLE ENVIRONMENT CONFLICTS**

---

## 🚨 **ROOT CAUSE ANALYSIS**

### **Issue #1: API URL Mismatch Between Runtime & Tests**

#### **Production Frontend (Working):**
```javascript
// frontend/src/api.js
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

// package.json
"start": "cross-env REACT_APP_API_BASE_URL=http://api:8000 react-scripts start"
```
**Runtime API URL:** `http://api:8000` (Docker internal network)

#### **Cypress Tests (Failing):**
```javascript
// cypress/e2e/*.cy.js
cy.request('POST', 'http://localhost:8000/auth/register', ...)
```
**Test API URL:** `http://localhost:8000` (Host network)

#### **🚨 PROBLEM:**
- **Frontend in Docker** calls API at `http://api:8000` (works)
- **Cypress from host** calls API at `http://localhost:8000` (works for direct curl)
- **But Cypress running from frontend container** gets confused about which network to use

---

### **Issue #2: Docker Network vs Host Network Confusion**

#### **Container Network Configuration:**
```yaml
# docker-compose.yml
services:
  frontend:
    ports: ["3000:3000"]
    environment:
      REACT_APP_API_BASE_URL: http://api:8000  # Internal Docker network
  api:
    ports: ["8000:8000"]
```

#### **Cypress Configuration:**
```javascript
// cypress.config.js
baseUrl: 'http://localhost:3000'  # Host network
```

#### **🚨 PROBLEM:**
- Cypress runs from **host network** (`localhost:3000`)
- Frontend serves from **Docker network** with API at `api:8000`
- Tests make API calls to `localhost:8000` which works from host
- But frontend JavaScript expects `api:8000` from Docker network

---

### **Issue #3: Environment Variable Propagation**

#### **Production Environment:**
```bash
# In Docker container
REACT_APP_API_BASE_URL=http://api:8000
```

#### **Test Environment:**
```bash
# Cypress doesn't inherit Docker environment variables
REACT_APP_API_BASE_URL=undefined (falls back to http://localhost:8000)
```

#### **🚨 PROBLEM:**
- Tests don't inherit the Docker environment variables
- Frontend code uses different API base URL during tests
- Creates inconsistency between test and production behavior

---

### **Issue #4: Windows/Linux Path & Permission Issues**

#### **Observed Errors:**
```
Error: Command 'Get-CimInstance -className win32_process' terminated with code: 143
[GPU process exited unexpectedly: exit_code=143]
CondaError: Run 'conda init' before 'conda activate'
chcp: command not found
```

#### **🚨 PROBLEM:**
- Windows-specific path separators and commands
- GPU process crashes (Chrome in Windows Docker)
- Conda environment conflicts
- Command prompt encoding issues

---

## 🔧 **SOLUTIONS**

### **Solution 1: Fix API URL Consistency**

#### **Option A: Use Host Network for Tests**
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      API_BASE_URL: 'http://localhost:8000'  // Force host network for tests
    }
  }
});
```

#### **Option B: Create Test-Specific Environment**
```json
// package.json
"scripts": {
  "e2e": "cross-env REACT_APP_API_BASE_URL=http://localhost:8000 cypress run --browser chrome",
  "e2e:docker": "cypress run --browser chrome"
}
```

### **Solution 2: Fix Docker Network Issues**

#### **Create Cypress Service in Docker Compose**
```yaml
# docker-compose.yml
services:
  cypress:
    image: cypress/included:latest
    depends_on:
      - frontend
      - api
    environment:
      - CYPRESS_baseUrl=http://frontend:3000
      - CYPRESS_API_BASE_URL=http://api:8000
    volumes:
      - ./frontend:/e2e
    working_dir: /e2e
```

### **Solution 3: Windows Environment Fix**

#### **Add Windows-Specific Cypress Config**
```javascript
// cypress.config.js
module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Windows-specific fixes
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
        }
        return launchOptions;
      });
    },
    baseUrl: 'http://localhost:3000',
    defaultCommandTimeout: 10000,
    requestTimeout: 10000
  }
});
```

---

## 🚀 **RECOMMENDED IMMEDIATE FIXES**

### **Quick Fix #1: Test Environment Variables**
```bash
# Run tests with correct environment
cd frontend
cross-env REACT_APP_API_BASE_URL=http://localhost:8000 npx cypress run --spec "cypress/e2e/advisor-onboarding-perfect.cy.js"
```

### **Quick Fix #2: Update Cypress Config**
```javascript
// cypress.config.js - Add environment consistency
module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    env: {
      API_BASE_URL: 'http://localhost:8000'
    },
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    setupNodeEvents(on, config) {
      // Windows Chrome fixes
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
        }
        return launchOptions;
      });
    }
  }
});
```

### **Quick Fix #3: Test Script Update**
```json
// package.json - Environment-aware test script
"scripts": {
  "e2e": "cross-env REACT_APP_API_BASE_URL=http://localhost:8000 cypress run --browser chrome --config defaultCommandTimeout=15000",
  "e2e:open": "cross-env REACT_APP_API_BASE_URL=http://localhost:8000 cypress open"
}
```

---

## 📋 **PRIORITY ACTIONS**

### **High Priority (Blocks Development)**
1. ✅ **Fix API URL consistency** - Environment variable propagation
2. ✅ **Update Cypress timeouts** - Increase timeout limits
3. ✅ **Windows Chrome flags** - Disable GPU, sandbox for stability

### **Medium Priority (Improves Reliability)**
4. 🔄 **Docker Cypress service** - Consistent test environment
5. 🔄 **Network configuration** - Proper Docker networking
6. 🔄 **Error handling** - Better test failure reporting

### **Low Priority (Nice to Have)**
7. ⏳ **Test parallelization** - Faster test execution
8. ⏳ **Browser compatibility** - Multi-browser testing
9. ⏳ **CI/CD integration** - Automated testing pipeline

---

## 🎯 **IMMEDIATE ACTION PLAN**

### **Step 1: Apply Quick Fixes (5 minutes)**
1. Update `cypress.config.js` with Windows Chrome fixes
2. Update `package.json` with environment-aware e2e script
3. Test with single advisor test to validate fix

### **Step 2: Validate Fix (10 minutes)**
1. Run: `npm run e2e:open` (interactive mode)
2. Run single test: `advisor-onboarding-perfect.cy.js`
3. Confirm test passes without timeout

### **Step 3: Full Test Suite (if Step 2 works)**
1. Run complete test suite
2. Document any remaining failures
3. Create test maintenance plan

---

## ✅ **EXPECTED OUTCOME**

After applying these fixes:
- ✅ **Cypress tests should run without timeouts**
- ✅ **API calls should work consistently**  
- ✅ **Windows environment issues resolved**
- ✅ **Test reliability improved to >90%**

---

**Diagnosis Complete - Ready to implement fixes! 🔧**