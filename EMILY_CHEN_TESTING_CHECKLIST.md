# Emily Chen (Advisor) Testing Checklist

## Persona Context
**Emily Chen → Emily Njeri (PRD Target)**
- **Role**: Fee-only CFP® serving high net worth clients
- **Professional Context**: Fiduciary standard, complex financial planning
- **Key Needs**: Monte Carlo simulations, tax-efficient planning, audit trail
- **Quality Expectations**: Professional-grade interface, error-free operation
- **Current Account**: `emily@advisor.com` / `emily123`

## Pre-Testing Setup

### Environment Verification
- [ ] Backend API running on localhost:8000
- [ ] Frontend running on localhost:3000  
- [ ] Database contains Emily's test account
- [ ] Network connectivity stable
- [ ] Browser developer tools open for error monitoring

### Test Account Verification
```bash
# Verify Emily's account exists in database
docker exec curly-broccoli-db-1 psql -U user -d finance_app -c "
SELECT email, role, first_name, last_name, firm_name, license_number 
FROM users u 
LEFT JOIN profiles p ON u.id = p.user_id 
WHERE email = 'emily@advisor.com';"
```

Expected Result:
- [ ] Email: emily@advisor.com
- [ ] Role: advisor
- [ ] Profile data present

## 1. Registration & Authentication Testing

### 1.1 Advisor Registration (New Account)
**Test ID**: EC-REG-01
**Objective**: Verify new advisor can register with professional details

**Steps**:
1. Navigate to `/auth`
2. Click "Create Account"
3. Select "Advisor" role
4. Fill registration form:
   - Email: `emily.test@njerifinancial.com`
   - Password: `EmilyTest123!`
   - Confirm Password: `EmilyTest123!`
5. Submit registration

**Expected Results**:
- [ ] Registration successful (201 status)
- [ ] User role set to "advisor"
- [ ] Redirected to onboarding flow OR dashboard
- [ ] No JavaScript console errors
- [ ] Professional presentation maintained

**Time Benchmark**: < 5 seconds for registration process

### 1.2 Existing Account Login
**Test ID**: EC-AUTH-01
**Objective**: Verify Emily can login to existing account

**Steps**:
1. Navigate to `/auth`
2. Enter credentials: `emily@advisor.com` / `emily123`
3. Click login

**Expected Results**:
- [ ] Login successful (200 status)
- [ ] JWT token stored in localStorage
- [ ] Redirected to advisor dashboard
- [ ] Welcome message shows "Emily" or advisor name
- [ ] Advisor-specific features visible

**Time Benchmark**: < 3 seconds for login completion

### 1.3 Role-Based Access Control
**Test ID**: EC-AUTH-02
**Objective**: Verify advisor has proper access permissions

**Steps**:
1. Login as Emily
2. Attempt to access individual user routes:
   - `/onboarding/personal-details`
   - `/onboarding/risk-questionnaire`
3. Verify advisor route access:
   - `/advisor/dashboard` (if implemented)
   - `/app/dashboard` (generic dashboard)

**Expected Results**:
- [ ] Blocked from individual user onboarding
- [ ] Has access to advisor-appropriate routes
- [ ] Dashboard shows advisor features, not individual user features

## 2. Professional Details Collection

### 2.1 Professional Information Form
**Test ID**: EC-PROF-01
**Objective**: Validate professional details form for CFP specialization

**Pre-condition**: Emily logged in, onboarding routes integrated

**Test Data**:
```javascript
const emilyProfessionalDetails = {
  firstName: 'Emily',
  lastName: 'Njeri',
  firmName: 'Njeri Financial Advisors',
  licenseNumber: 'CFP2024001',
  professionalEmail: 'emily@njerifinancial.com',
  phone: '+254-700-123-456'
};
```

**Steps**:
1. Navigate to `/onboarding/advisor/professional-details`
2. Fill all required fields with test data
3. Submit form

**Expected Results**:
- [ ] All fields accept professional data
- [ ] CFP license number format accepted
- [ ] Professional email domain accepted  
- [ ] Kenyan phone number format accepted
- [ ] Form submits successfully
- [ ] Data saved to localStorage/database
- [ ] Navigation to next step (`/onboarding/advisor/service-model`)

**Validation Criteria**:
- [ ] Required field validation working
- [ ] Email format validation active
- [ ] License number pattern validation
- [ ] No special characters breaking form
- [ ] Professional presentation maintained

### 2.2 Form Validation Testing
**Test ID**: EC-PROF-02
**Objective**: Verify professional standards in form validation

**Test Cases**:

**Empty Required Fields**:
- [ ] Submit with empty firstName → Error message displayed
- [ ] Submit with empty lastName → Error message displayed  
- [ ] Submit with empty firmName → Error message displayed
- [ ] Submit with empty licenseNumber → Error message displayed

**Invalid Data Formats**:
- [ ] Invalid email format → Email validation error
- [ ] Special characters in name → Appropriate handling
- [ ] Invalid phone format → Phone validation (if implemented)

**Professional Standards**:
- [ ] License number 'CFP2024001' accepted
- [ ] Firm name with "Advisors" accepted
- [ ] Professional email domain accepted
- [ ] Long firm names handled gracefully

## 3. Service Model Configuration

### 3.1 Fee-Only Model Selection
**Test ID**: EC-SERVICE-01  
**Objective**: Configure Emily's fee-only CFP practice model

**Pre-condition**: Professional details completed

**Test Data**:
```javascript
const emilyServiceModel = {
  serviceModel: 'fee-only',
  targetClientType: 'high-net-worth',
  minimumAUM: '5m'
};
```

**Steps**:
1. Navigate to `/onboarding/advisor/service-model`
2. Select "Fee-Only" service model
3. Select "High Net Worth" client type
4. Select "KSh 5,000,000+" minimum AUM
5. Submit form

**Expected Results**:
- [ ] Fee-only radio button selectable
- [ ] HNW client type option available
- [ ] 5M+ AUM option available
- [ ] Form submission successful
- [ ] Navigation to completion step
- [ ] Service model data persisted

**Professional Validation**:
- [ ] Fee-only aligns with CFP fiduciary standard
- [ ] HNW selection appropriate for specialization
- [ ] AUM minimum reflects HNW practice
- [ ] No commission-based options accidentally selected

### 3.2 Service Model Validation
**Test ID**: EC-SERVICE-02
**Objective**: Verify service model form validation

**Test Cases**:
- [ ] Submit without service model → Validation error
- [ ] Submit without client type → Validation error
- [ ] All service model options selectable
- [ ] All client type options selectable
- [ ] AUM dropdown functional

## 4. Dashboard Functionality

### 4.1 Advisor Dashboard Access
**Test ID**: EC-DASH-01
**Objective**: Verify advisor dashboard appropriate for CFP practice

**Steps**:
1. Complete onboarding OR login directly
2. Access advisor dashboard
3. Review dashboard features

**Expected Dashboard Elements**:
- [ ] Welcome message with advisor name
- [ ] Client-focused metrics (Total Clients, etc.)
- [ ] Professional presentation (no casual language)
- [ ] Client management features
- [ ] Portfolio/planning tools access (if implemented)

**Professional Standards Verification**:
- [ ] No individual user features (personal finance tools)
- [ ] Language appropriate for professional use
- [ ] Features support fiduciary practice
- [ ] Clean, professional visual design

### 4.2 Dashboard Performance
**Test ID**: EC-DASH-02
**Objective**: Verify dashboard meets professional performance standards

**Performance Benchmarks**:
- [ ] Dashboard loads in < 3 seconds
- [ ] No JavaScript console errors
- [ ] Responsive design on tablet (advisor meetings)
- [ ] All interactive elements functional

**Professional User Experience**:
- [ ] Error messages clear and professional
- [ ] Loading states prevent confusion
- [ ] Navigation intuitive for advisor workflow
- [ ] Mobile usability for client meetings

## 5. Data Persistence & API Integration

### 5.1 Profile Data Storage
**Test ID**: EC-DATA-01
**Objective**: Verify Emily's professional data properly stored

**API Calls to Monitor**:
```javascript
// Expected API calls during onboarding
POST /auth/register → role: "advisor"
PUT /auth/profile → advisor fields saved
GET /auth/profile → complete advisor profile returned
```

**Database Verification**:
```sql
-- Verify Emily's profile data
SELECT first_name, last_name, firm_name, license_number, 
       professional_email, service_model, target_client_type
FROM profiles p 
JOIN users u ON p.user_id = u.id 
WHERE u.email = 'emily@advisor.com';
```

**Expected Data Structure**:
- [ ] first_name: "Emily"
- [ ] last_name: "Njeri" (if updated) or "Chen" (current)
- [ ] firm_name: "Njeri Financial Advisors"
- [ ] license_number: "CFP2024001"
- [ ] professional_email: "emily@njerifinancial.com"
- [ ] service_model: "fee-only"
- [ ] target_client_type: "high-net-worth"

### 5.2 Data Persistence Across Sessions
**Test ID**: EC-DATA-02
**Objective**: Verify professional data persists across login sessions

**Steps**:
1. Complete onboarding with professional data
2. Logout
3. Login again
4. Verify all professional data still present

**Expected Results**:
- [ ] Professional details maintained
- [ ] Service model settings preserved  
- [ ] Dashboard shows saved information
- [ ] No data loss during session changes

## 6. Professional Quality Assurance

### 6.1 User Experience Standards
**Test ID**: EC-UX-01
**Objective**: Verify interface meets professional advisor standards

**Visual Design Standards**:
- [ ] Professional color scheme
- [ ] Clear typography appropriate for business use
- [ ] No casual language ("Hey", "Awesome", etc.)
- [ ] Consistent professional terminology

**Functional Standards**:
- [ ] All buttons and links functional
- [ ] Form validation provides clear guidance
- [ ] Error messages helpful and professional
- [ ] Loading states don't cause confusion

### 6.2 Error Handling
**Test ID**: EC-ERROR-01
**Objective**: Verify graceful error handling for professional use

**Network Error Scenarios**:
- [ ] Network timeout during onboarding → Appropriate error message
- [ ] API server error → Professional error notification
- [ ] Session timeout → Smooth re-authentication

**Input Error Scenarios**:
- [ ] Invalid license number → Clear validation message
- [ ] Duplicate email registration → Helpful error message
- [ ] Form submission errors → Clear recovery guidance

## 7. Performance & Reliability

### 7.1 Performance Benchmarks
**Test ID**: EC-PERF-01
**Objective**: Verify performance meets professional expectations

**Time Benchmarks** (Emily's expectations):
- [ ] Registration: < 5 seconds
- [ ] Login: < 3 seconds  
- [ ] Dashboard load: < 3 seconds
- [ ] Form submission: < 2 seconds
- [ ] Complete onboarding: < 5 minutes total

**Reliability Standards**:
- [ ] No JavaScript errors in console
- [ ] All features work on first attempt
- [ ] Data saves successfully every time
- [ ] Navigation always functional

### 7.2 Mobile/Tablet Compatibility
**Test ID**: EC-MOBILE-01
**Objective**: Verify usability during client meetings

**Device Testing**:
- [ ] Tablet portrait: All elements accessible
- [ ] Tablet landscape: Professional presentation maintained
- [ ] Phone (if needed): Basic functionality works
- [ ] Touch interactions work smoothly

## 8. Integration Validation

### 8.1 Route Integration Status
**Test ID**: EC-ROUTES-01
**Objective**: Verify advisor onboarding routes properly integrated

**Current Status Check**:
- [ ] `/onboarding/advisor/professional-details` → accessible
- [ ] `/onboarding/advisor/service-model` → accessible  
- [ ] `/onboarding/advisor/complete` → accessible
- [ ] Route navigation between steps → functional
- [ ] Post-completion redirect → appropriate destination

**If Routes Not Integrated**:
- [ ] Document missing integration in App.js
- [ ] Test components individually for functionality
- [ ] Verify component export/import paths
- [ ] Confirm onboarding flow logic

### 8.2 API Endpoint Validation
**Test ID**: EC-API-01
**Objective**: Verify API supports advisor-specific data

**API Endpoint Tests**:
```bash
# Test API endpoints for advisor data
curl -H "Authorization: Bearer <token>" localhost:8000/auth/profile
curl -H "Authorization: Bearer <token>" localhost:8000/advisor/stats
```

**Expected API Support**:
- [ ] `/auth/profile` accepts advisor fields
- [ ] `/advisor/*` endpoints available (if implemented)
- [ ] Role-based access control working
- [ ] Advisor data schema supported in database

## Test Execution Checklist

### Before Testing
- [ ] Environment setup complete
- [ ] Test data prepared
- [ ] Emily's account verified
- [ ] Performance monitoring tools ready

### During Testing
- [ ] Document all test results
- [ ] Screenshot any errors or issues
- [ ] Time critical operations
- [ ] Monitor network requests
- [ ] Check browser console for errors

### After Testing
- [ ] Compile test results report
- [ ] Identify any gaps or issues
- [ ] Document integration requirements
- [ ] Provide recommendations for improvements

## Success Criteria

### Minimum Passing Requirements
- [ ] Emily can register/login as advisor
- [ ] Professional details can be collected and saved
- [ ] Service model can be configured appropriately
- [ ] Dashboard shows advisor-appropriate features
- [ ] No critical errors or data loss

### Professional Quality Standards
- [ ] Interface presentation meets business standards
- [ ] Performance meets professional expectations
- [ ] Error handling provides clear guidance
- [ ] Mobile compatibility supports client meetings
- [ ] Data persistence is reliable

### PRD Alignment
- [ ] Emily persona properly supported
- [ ] Fee-only CFP practice model configurable
- [ ] HNW client focus clearly captured
- [ ] Professional credentials properly validated

**Overall Test Status**: ☐ PASS / ☐ NEEDS WORK / ☐ FAIL

**Key Issues Identified**:
_Document any critical issues that prevent advisor onboarding from being production-ready_

**Recommendations**:
_List priority improvements needed for professional advisor use_