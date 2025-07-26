describe('Complete Registration Flow Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should complete registration flow with detailed monitoring', () => {
    let registrationRequests = [];
    let consoleMessages = [];
    
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Capture all console messages
    cy.window().then((win) => {
      const originalLog = win.console.log;
      const originalError = win.console.error;
      
      win.console.log = function(...args) {
        const message = args.join(' ');
        consoleMessages.push(`LOG: ${message}`);
        originalLog.apply(this, args);
      };
      
      win.console.error = function(...args) {
        const message = args.join(' ');
        consoleMessages.push(`ERROR: ${message}`);
        originalError.apply(this, args);
      };
      
      // Monitor fetch requests
      const originalFetch = win.fetch;
      win.fetch = function(url, options) {
        if (url.includes('/auth/register')) {
          registrationRequests.push({
            url,
            method: options?.method,
            timestamp: Date.now(),
            body: options?.body
          });
        }
        
        return originalFetch.call(this, url, options);
      };
    });
    
    // Start onboarding flow
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Personal details
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('input[id="firstName"]').type('Final');
    cy.get('input[id="lastName"]').type('Test');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="kraPin"]').type('A123456789Z');
    cy.get('button[type="submit"]').click();
    
    cy.wait(2000);
    
    // Risk questionnaire
    cy.url().should('include', '/onboarding/risk-questionnaire');
    cy.get('input[type="radio"]').first().check();
    cy.get('input[type="radio"]').eq(4).check();
    cy.get('input[type="radio"]').eq(8).check();
    cy.get('input[type="radio"]').eq(12).check();
    cy.get('input[type="radio"]').eq(16).check();
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    cy.wait(4000);
    
    // Data connection
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('button').contains('Manual Entry (Later)').click();
    
    // Final step - registration
    cy.url().should('include', '/onboarding/cash-flow-setup');
    
    // Check initial state
    cy.get('button').contains('Complete Registration').should('not.be.disabled');
    
    // Click registration button
    cy.get('button').contains('Complete Registration').click();
    
    // Wait for the registration process
    cy.wait(10000);
    
    // Check final state
    cy.then(() => {
      // Log all captured console messages
      consoleMessages.forEach(msg => {
        cy.log(msg);
      });
      
      // Log registration requests
      cy.log(`Registration requests made: ${registrationRequests.length}`);
      registrationRequests.forEach((req, index) => {
        cy.log(`Request ${index + 1}: ${req.method} ${req.url} at ${req.timestamp}`);
      });
    });
    
    // Check final URL
    cy.url().then((finalUrl) => {
      cy.log(`Final URL: ${finalUrl}`);
      
      if (finalUrl.includes('/app/dashboard')) {
        cy.log('✅ Successfully redirected to dashboard');
      } else if (finalUrl.includes('/onboarding/cash-flow-setup')) {
        cy.log('⚠️ Still on registration page - checking why');
        
        // Check for error messages on page
        cy.get('body').then(($body) => {
          const pageText = $body.text();
          if (pageText.includes('failed') || pageText.includes('error')) {
            cy.log(`Error found on page: ${pageText}`);
          }
        });
      } else {
        cy.log(`🤔 Unexpected final URL: ${finalUrl}`);
      }
    });
    
    // Check JWT storage
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      if (jwt) {
        cy.log(`✅ JWT stored: ${jwt.substring(0, 50)}...`);
      } else {
        cy.log('❌ No JWT token found');
      }
    });
  });

  it('should handle registration button states correctly', () => {
    cy.visit('/onboarding/cash-flow-setup');
    cy.hideWebpackOverlay();
    
    // Check initial button state
    cy.get('button').contains('Complete Registration').should('not.be.disabled');
    
    // Click button
    cy.get('button').contains('Complete Registration').click();
    
    // Check button becomes disabled and shows "Creating Account..."
    cy.get('button').should('contain', 'Creating Account...').and('be.disabled');
    
    // Wait for process to complete
    cy.wait(8000);
    
    // Check final button state
    cy.get('button').then(($button) => {
      const buttonText = $button.text();
      cy.log(`Final button text: ${buttonText}`);
      
      if (buttonText.includes('Creating Account')) {
        cy.log('⚠️ Button still shows "Creating Account" - process may be stuck');
      } else if (buttonText.includes('Complete Registration')) {
        cy.log('⚠️ Button reset to "Complete Registration" - likely failed');
      }
    });
  });

  it('should test registration API directly vs through onboarding context', () => {
    // Test 1: Direct API call
    cy.log('🔍 Testing direct API registration...');
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/register',
      body: {
        email: `direct-${Date.now()}@example.com`,
        password: 'defaultPassword123',
        first_name: 'Direct',
        last_name: 'Test',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: 'A123456789Z',
        annual_income: 50000,
        dependents: 0,
        goals: { targetAmount: 10000, timeHorizon: 12 },
        questionnaire: [1, 2, 3, 4, 5]
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body).to.have.property('access_token');
      cy.log('✅ Direct API registration works');
    });
    
    // Test 2: Through browser fetch (simulating onboarding context)
    cy.visit('/');
    cy.hideWebpackOverlay();
    
    cy.window().then(async (win) => {
      try {
        const response = await win.fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: `browser-${Date.now()}@example.com`,
            password: 'defaultPassword123',
            first_name: 'Browser',
            last_name: 'Test',
            dob: '1990-01-01',
            nationalId: '12345678',
            kra_pin: 'A123456789Z',
            annual_income: 50000,
            dependents: 0,
            goals: { targetAmount: 10000, timeHorizon: 12 },
            questionnaire: [1, 2, 3, 4, 5]
          })
        });
        
        cy.log(`Browser fetch status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.json();
          cy.log('✅ Browser fetch registration works');
          cy.log(`Token received: ${data.access_token?.substring(0, 20)}...`);
        } else {
          const errorText = await response.text();
          cy.log(`❌ Browser fetch failed: ${errorText}`);
        }
      } catch (error) {
        cy.log(`❌ Browser fetch error: ${error.message}`);
      }
    });
  });

  it('should verify dashboard route accessibility', () => {
    // First get a valid JWT
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/register',
      body: {
        email: `dashboard-test-${Date.now()}@example.com`,
        password: 'defaultPassword123',
        first_name: 'Dashboard',
        last_name: 'Test',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: 'A123456789Z',
        annual_income: 50000,
        dependents: 0,
        goals: { targetAmount: 10000, timeHorizon: 12 },
        questionnaire: [1, 2, 3, 4, 5]
      }
    }).then((response) => {
      const jwt = response.body.access_token;
      
      // Visit the app and set JWT
      cy.visit('/');
      cy.window().then((win) => {
        win.localStorage.setItem('jwt', jwt);
      });
      
      // Try to navigate to dashboard
      cy.visit('/app/dashboard');
      cy.wait(3000);
      
      // Check if we stay on dashboard or get redirected
      cy.url().then((url) => {
        if (url.includes('/app/dashboard')) {
          cy.log('✅ Dashboard accessible with valid JWT');
        } else if (url.includes('/auth') || url.includes('/login')) {
          cy.log('❌ Dashboard redirects to auth - route protection issue');
        } else {
          cy.log(`🤔 Dashboard redirects to: ${url}`);
        }
      });
    });
  });
});