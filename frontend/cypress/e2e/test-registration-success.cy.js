describe('Test Registration Success Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should track the complete registration flow step by step', () => {
    let registrationResult = null;
    
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Start onboarding
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Personal details
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('input[id="firstName"]').type('Success');
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
    
    // Final step - monitor the registration
    cy.url().should('include', '/onboarding/cash-flow-setup');
    
    // Override submitOnboarding to capture the result
    cy.window().then((win) => {
      // Find the React component and intercept submitOnboarding
      const originalFetch = win.fetch;
      win.fetch = async function(url, options) {
        if (url.includes('/auth/register')) {
          console.log('🔍 REGISTRATION REQUEST:', options.body);
          
          const response = await originalFetch.call(this, url, options);
          const responseClone = response.clone();
          const responseText = await responseClone.text();
          
          console.log('🔍 REGISTRATION RESPONSE STATUS:', response.status);
          console.log('🔍 REGISTRATION RESPONSE TEXT:', responseText);
          
          if (response.ok) {
            try {
              const data = JSON.parse(responseText);
              console.log('🔍 PARSED REGISTRATION DATA:', data);
              registrationResult = data;
            } catch (e) {
              console.log('🔍 JSON PARSE ERROR:', e.message);
            }
          }
          
          return response;
        }
        return originalFetch.call(this, url, options);
      };
    });
    
    // Click registration button
    cy.get('button').contains('Complete Registration').click();
    
    // Wait for registration and navigation
    cy.wait(8000);
    
    // Check where we ended up
    cy.url().then((finalUrl) => {
      cy.log(`Final URL after registration: ${finalUrl}`);
      
      if (finalUrl.includes('/app/dashboard')) {
        cy.log('✅ Successfully redirected to dashboard');
      } else if (finalUrl.includes('/auth') || finalUrl.includes('/login')) {
        cy.log('⚠️ Redirected to login page - checking why');
      } else {
        cy.log(`🤔 Unexpected final URL: ${finalUrl}`);
      }
    });
    
    // Check if JWT token was stored
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      if (jwt) {
        cy.log(`✅ JWT token stored: ${jwt.substring(0, 50)}...`);
      } else {
        cy.log('❌ No JWT token found in localStorage');
      }
    });
    
    // Check for any visible error messages
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      if (bodyText.includes('failed') || bodyText.includes('error')) {
        cy.log(`⚠️ Found error text on page: ${bodyText}`);
      }
    });
  });

  it('should test direct navigation to dashboard with JWT', () => {
    // First, do a quick registration to get a JWT
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/register',
      body: {
        email: `direct-test-${Date.now()}@example.com`,
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
      const jwt = response.body.access_token;
      
      // Store JWT in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('jwt', jwt);
      });
      
      // Try to navigate directly to dashboard
      cy.visit('/app/dashboard');
      
      // Check if we stay on dashboard or get redirected
      cy.wait(3000);
      cy.url().then((url) => {
        cy.log(`Dashboard URL check: ${url}`);
        if (url.includes('/app/dashboard')) {
          cy.log('✅ Dashboard accessible with JWT');
        } else if (url.includes('/auth') || url.includes('/login')) {
          cy.log('❌ Redirected to auth - JWT might be invalid or route is protected');
        }
      });
    });
  });
});