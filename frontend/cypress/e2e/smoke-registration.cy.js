describe('Registration API Smoke Tests', () => {
  beforeEach(() => {
    // Clear any existing state
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should test backend registration API directly', () => {
    // Test 1: Direct API call from Cypress (this should work)
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/register',
      body: {
        email: `cypress-test-${Date.now()}@example.com`,
        password: 'defaultPassword123',
        first_name: 'Test',
        last_name: 'User',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: 'A123456789Z',
        annual_income: 50000,
        dependents: 0,
        goals: { targetAmount: 10000, timeHorizon: 12 },
        questionnaire: [1, 2, 3, 4, 5]
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('access_token');
      cy.log('✅ Direct API registration works');
    });
  });

  it('should test frontend API call from browser context', () => {
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Test 2: Make API call from browser context to simulate frontend
    cy.window().then((win) => {
      const testData = {
        email: `frontend-test-${Date.now()}@example.com`,
        password: 'defaultPassword123',
        first_name: 'Frontend',
        last_name: 'Test',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: 'A123456789Z',
        annual_income: 50000,
        dependents: 0,
        goals: { targetAmount: 10000, timeHorizon: 12 },
        questionnaire: [1, 2, 3, 4, 5]
      };

      // Test different API URLs
      const apiUrls = [
        'http://api:8000',
        'http://localhost:8000',
        '/api'  // using proxy
      ];

      apiUrls.forEach((apiBase, index) => {
        cy.log(`Testing API URL: ${apiBase}`);
        
        cy.window().then(async (win) => {
          try {
            const response = await win.fetch(`${apiBase}/auth/register`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                ...testData,
                email: `test-${index}-${Date.now()}@example.com`
              })
            });
            
            if (response.ok) {
              const data = await response.json();
              cy.log(`✅ ${apiBase} works - got token: ${data.access_token?.substring(0, 20)}...`);
            } else {
              cy.log(`❌ ${apiBase} failed with status: ${response.status}`);
            }
          } catch (error) {
            cy.log(`❌ ${apiBase} failed with error: ${error.message}`);
          }
        });
      });
    });
  });

  it('should test network connectivity from frontend container', () => {
    cy.visit('/');
    cy.hideWebpackOverlay();
    
    // Test 3: Check what happens when we call our OnboardingContext
    cy.window().then((win) => {
      // Simulate the exact call our OnboardingContext makes
      const API_BASE = 'http://api:8000';
      const registrationData = {
        email: `context-test-${Date.now()}@example.com`,
        password: 'defaultPassword123',
        first_name: 'Context',
        last_name: 'Test',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: 'A123456789Z',
        annual_income: 50000,
        dependents: 0,
        goals: { targetAmount: 10000, timeHorizon: 12 },
        questionnaire: [1, 2, 3, 4, 5]
      };

      cy.log('Testing exact OnboardingContext API call...');
      cy.log(`API_BASE: ${API_BASE}`);
      cy.log(`Full URL: ${API_BASE}/auth/register`);
      
      cy.window().then(async (win) => {
        try {
          const response = await win.fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
          });

          cy.log(`Response status: ${response.status}`);
          cy.log(`Response ok: ${response.ok}`);
          
          if (response.ok) {
            const data = await response.json();
            cy.log(`✅ Registration successful: ${JSON.stringify(data)}`);
          } else {
            const errorText = await response.text();
            cy.log(`❌ Registration failed: ${errorText}`);
          }
        } catch (error) {
          cy.log(`❌ Network error: ${error.message}`);
          cy.log(`❌ Error stack: ${error.stack}`);
        }
      });
    });
  });

  it('should check browser network tab and console logs', () => {
    cy.visit('/auth');
    cy.hideWebpackOverlay();

    // Navigate to onboarding completion
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Go through onboarding quickly
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('input[id="firstName"]').type('Debug');
    cy.get('input[id="lastName"]').type('Test');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="kraPin"]').type('A123456789Z');
    cy.get('button[type="submit"]').click();
    
    cy.wait(2000);
    
    // Skip through risk questionnaire
    cy.url().should('include', '/onboarding/risk-questionnaire');
    cy.get('input[type="radio"]').first().check();
    cy.get('input[type="radio"]').eq(4).check();
    cy.get('input[type="radio"]').eq(8).check();
    cy.get('input[type="radio"]').eq(12).check();
    cy.get('input[type="radio"]').eq(16).check();
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    cy.wait(4000);
    
    // Skip data connection
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('button').contains('Manual Entry (Later)').click();
    
    // Final step - monitor network calls
    cy.url().should('include', '/onboarding/cash-flow-setup');
    
    // Set up network monitoring
    cy.window().then((win) => {
      // Capture console logs
      win.console.log('🔍 About to click Complete Registration button');
      
      // Monitor fetch calls
      const originalFetch = win.fetch;
      win.fetch = function(...args) {
        win.console.log('🌐 Fetch called with:', args);
        return originalFetch.apply(this, args)
          .then(response => {
            win.console.log('🌐 Fetch response:', response.status, response.url);
            return response;
          })
          .catch(error => {
            win.console.log('🌐 Fetch error:', error.message);
            throw error;
          });
      };
    });
    
    // Click the registration button
    cy.get('button').contains('Complete Registration').click();
    
    // Wait and check what happened
    cy.wait(5000);
    
    // Check if we're still on the same page (indicating failure)
    cy.url().then((url) => {
      if (url.includes('/onboarding/cash-flow-setup')) {
        cy.log('❌ Still on cash-flow-setup page - registration failed');
      } else if (url.includes('/app/dashboard')) {
        cy.log('✅ Redirected to dashboard - registration succeeded');
      } else {
        cy.log(`🤔 Unexpected URL: ${url}`);
      }
    });
  });
});