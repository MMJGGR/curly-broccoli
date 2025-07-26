describe('Debug Registration Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should debug the exact registration flow with detailed logging', () => {
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Monitor all network requests
    cy.intercept('**', (req) => {
      cy.log(`🌐 Request: ${req.method} ${req.url}`);
    }).as('allRequests');
    
    // Navigate through onboarding
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Personal details
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('input[id="firstName"]').type('Debug');
    cy.get('input[id="lastName"]').type('User');
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
    
    // Final step - detailed monitoring
    cy.url().should('include', '/onboarding/cash-flow-setup');
    
    // Override fetch to capture detailed info
    cy.window().then((win) => {
      const originalFetch = win.fetch;
      win.fetch = async function(url, options) {
        console.log('🔍 FETCH CALLED:');
        console.log('URL:', url);
        console.log('Options:', JSON.stringify(options, null, 2));
        console.log('Full URL:', new URL(url, win.location.origin).href);
        
        try {
          const response = await originalFetch.call(this, url, options);
          console.log('🔍 FETCH RESPONSE:');
          console.log('Status:', response.status);
          console.log('Headers:', [...response.headers.entries()]);
          console.log('OK:', response.ok);
          
          // Clone response to read body without consuming it
          const responseClone = response.clone();
          try {
            const responseText = await responseClone.text();
            console.log('Response body:', responseText);
          } catch (e) {
            console.log('Could not read response body:', e.message);
          }
          
          return response;
        } catch (error) {
          console.log('🔍 FETCH ERROR:');
          console.log('Error type:', error.constructor.name);
          console.log('Error message:', error.message);
          console.log('Error stack:', error.stack);
          console.log('Network error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
          });
          throw error;
        }
      };
    });
    
    // Click registration button and monitor
    cy.get('button').contains('Complete Registration').click();
    
    // Wait and check the result
    cy.wait(8000);
    
    // Check current URL and local storage
    cy.url().then((url) => {
      cy.log(`Current URL after registration attempt: ${url}`);
    });
    
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      cy.log(`JWT token in localStorage: ${jwt ? 'Present' : 'Not found'}`);
    });
  });

  it('should test the exact submitOnboarding function', () => {
    cy.visit('/onboarding/cash-flow-setup');
    cy.hideWebpackOverlay();
    
    cy.window().then(async (win) => {
      // Simulate the exact function call
      const mockState = {
        personalDetails: {
          firstName: 'Test',
          lastName: 'User',
          dob: '1990-01-01',
          kraPin: 'A123456789Z'
        },
        riskQuestionnaire: [1, 2, 3, 4, 5],
        cashFlowData: {
          income: 50000
        },
        goals: {
          emergencyFund: 10000
        }
      };
      
      // Test the exact API call our context makes
      const API_BASE = '';
      const registrationData = {
        email: `user${Date.now()}@example.com`,
        password: 'defaultPassword123',
        first_name: mockState.personalDetails.firstName,
        last_name: mockState.personalDetails.lastName,
        dob: mockState.personalDetails.dob,
        nationalId: mockState.personalDetails.nationalId || '12345678',
        kra_pin: mockState.personalDetails.kraPin,
        annual_income: Number(mockState.cashFlowData.income) || 50000,
        dependents: Number(mockState.personalDetails.dependents) || 0,
        goals: {
          targetAmount: Number(mockState.goals.emergencyFund) || 10000,
          timeHorizon: 12
        },
        questionnaire: mockState.riskQuestionnaire.length > 0 ? mockState.riskQuestionnaire.map(q => Number(q)) : [1, 2, 3, 4, 5]
      };

      cy.log('Testing exact registration data:', JSON.stringify(registrationData, null, 2));
      cy.log('API_BASE:', API_BASE);
      cy.log('Full registration URL:', `${API_BASE}/auth/register`);

      try {
        const response = await win.fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        });

        cy.log(`Response status: ${response.status}`);
        cy.log(`Response ok: ${response.ok}`);

        if (!response.ok) {
          const errorData = await response.json();
          cy.log(`Error response: ${JSON.stringify(errorData)}`);
        } else {
          const data = await response.json();
          cy.log(`Success response: ${JSON.stringify(data)}`);
        }
      } catch (error) {
        cy.log(`Fetch error: ${error.message}`);
        cy.log(`Error stack: ${error.stack}`);
      }
    });
  });
});