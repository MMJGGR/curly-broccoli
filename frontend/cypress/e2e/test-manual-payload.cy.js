describe('Test Manual Registration Payload', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should test exact registration payload that would come from manual onboarding', () => {
    cy.visit('/onboarding/personal-details');
    cy.hideWebpackOverlay();
    
    // Go through the actual onboarding flow to build context state
    cy.get('input[id="firstName"]').type('Manual');
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
    
    // Now at the final step - intercept the actual request
    cy.url().should('include', '/onboarding/cash-flow-setup');
    
    // Intercept and log the exact registration request
    cy.intercept('POST', '/auth/register', (req) => {
      cy.log('🔍 INTERCEPTED REGISTRATION REQUEST:');
      cy.log(`URL: ${req.url}`);
      cy.log(`Method: ${req.method}`);
      cy.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
      cy.log(`Body: ${JSON.stringify(req.body, null, 2)}`);
      
      // Let the request continue but monitor response
      req.continue((res) => {
        cy.log('🔍 INTERCEPTED REGISTRATION RESPONSE:');
        cy.log(`Status: ${res.statusCode}`);
        cy.log(`Headers: ${JSON.stringify(res.headers, null, 2)}`);
        
        if (res.body) {
          try {
            const bodyStr = typeof res.body === 'string' ? res.body : JSON.stringify(res.body);
            cy.log(`Body: ${bodyStr}`);
          } catch (e) {
            cy.log(`Body (raw): ${res.body}`);
          }
        }
      });
    }).as('registration');
    
    // Click the registration button
    cy.get('button').contains('Complete Registration').click();
    
    // Wait for the request to be made
    cy.wait('@registration').then((interception) => {
      cy.log('Registration request intercepted successfully');
    });
    
    // Wait additional time to see final result
    cy.wait(5000);
    
    // Check final state
    cy.url().then(url => cy.log(`Final URL: ${url}`));
    cy.window().then(win => {
      const jwt = win.localStorage.getItem('jwt');
      cy.log(`JWT: ${jwt ? 'Present' : 'Missing'}`);
    });
  });

  it('should test different registration scenarios to identify 500 error cause', () => {
    cy.visit('/');
    cy.hideWebpackOverlay();
    
    // Test different payloads to see which one causes 500 error
    const testCases = [
      {
        name: 'Minimal payload',
        data: {
          email: `minimal-${Date.now()}@example.com`,
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
      },
      {
        name: 'Empty context payload (simulating missing onboarding data)',
        data: {
          email: `empty-${Date.now()}@example.com`,
          password: 'defaultPassword123',
          first_name: undefined,
          last_name: undefined,
          dob: undefined,
          nationalId: '12345678',
          kra_pin: undefined,
          annual_income: 50000,
          dependents: 0,
          goals: { targetAmount: 10000, timeHorizon: 12 },
          questionnaire: []
        }
      },
      {
        name: 'Invalid data types',
        data: {
          email: `invalid-${Date.now()}@example.com`,
          password: 'defaultPassword123',
          first_name: 'Test',
          last_name: 'User', 
          dob: '1990-01-01',
          nationalId: '12345678',
          kra_pin: 'A123456789Z',
          annual_income: 'not_a_number',
          dependents: 'not_a_number',
          goals: { targetAmount: 'not_a_number', timeHorizon: 12 },
          questionnaire: ['not', 'numbers']
        }
      }
    ];
    
    cy.window().then(async (win) => {
      for (const testCase of testCases) {
        try {
          cy.log(`🔍 Testing: ${testCase.name}`);
          
          const response = await win.fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testCase.data)
          });
          
          cy.log(`Status: ${response.status}`);
          
          if (response.status === 500) {
            cy.log(`⚠️ Found 500 error with: ${testCase.name}`);
            const errorText = await response.text();
            cy.log(`Error response: ${errorText.substring(0, 200)}`);
          } else if (response.ok) {
            cy.log(`✅ Success with: ${testCase.name}`);
          } else {
            const errorText = await response.text();
            cy.log(`❌ Error ${response.status} with: ${testCase.name} - ${errorText.substring(0, 100)}`);
          }
        } catch (error) {
          cy.log(`❌ Network error with ${testCase.name}: ${error.message}`);
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    });
  });
});