describe('Capture Real Manual Request', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should capture the exact request made during full onboarding flow', () => {
    let capturedRequests = [];
    
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Intercept ALL requests to see what's happening
    cy.intercept('**', (req) => {
      if (req.url.includes('/auth/register')) {
        capturedRequests.push({
          url: req.url,
          method: req.method,
          headers: req.headers,
          body: req.body,
          timestamp: Date.now()
        });
        
        cy.log('🔍 CAPTURED REGISTRATION REQUEST:');
        cy.log(`URL: ${req.url}`);
        cy.log(`Method: ${req.method}`);
        cy.log(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
        cy.log(`Body: ${JSON.stringify(req.body, null, 2)}`);
        
        // Don't modify the request, just observe
        req.continue();
      }
    }).as('allRequests');
    
    // Go through COMPLETE onboarding flow exactly as you would manually
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Personal details - entering the same data you would enter
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('input[id="firstName"]').type('John');
    cy.get('input[id="lastName"]').type('Doe');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="kraPin"]').type('A123456789Z');
    cy.get('button[type="submit"]').click();
    
    cy.wait(2000);
    
    // Risk questionnaire - complete all questions
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
    
    // Final step - this is where the 500 error occurs in manual testing
    cy.url().should('include', '/onboarding/cash-flow-setup');
    
    // Before clicking, let's see what the current context state is
    cy.window().then((win) => {
      // Try to access React context state
      cy.log('About to submit registration...');
    });
    
    // Click registration button - this should trigger the 500 error if it's going to happen
    cy.get('button').contains('Complete Registration').click();
    
    // Wait for request to be made
    cy.wait(10000);
    
    // Analyze captured requests
    cy.then(() => {
      cy.log(`Total registration requests captured: ${capturedRequests.length}`);
      
      capturedRequests.forEach((req, index) => {
        cy.log(`=== REQUEST ${index + 1} ===`);
        cy.log(`Timestamp: ${new Date(req.timestamp).toISOString()}`);
        cy.log(`URL: ${req.url}`);
        cy.log(`Method: ${req.method}`);
        cy.log(`Content-Type: ${req.headers['content-type']}`);
        cy.log(`User-Agent: ${req.headers['user-agent']?.substring(0, 50)}...`);
        cy.log(`Body length: ${JSON.stringify(req.body).length} characters`);
        cy.log(`Body: ${JSON.stringify(req.body, null, 2)}`);
      });
    });
    
    // Check what happened after the registration attempt
    cy.url().then((finalUrl) => {
      cy.log(`Final URL: ${finalUrl}`);
    });
    
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      cy.log(`JWT after registration: ${jwt ? 'Present' : 'Missing'}`);
    });
  });

  it('should test if the issue is related to browser vs headless mode', () => {
    // Test the exact same payload in different contexts
    cy.visit('/');
    cy.hideWebpackOverlay();
    
    const testPayload = {
      email: `browser-test-${Date.now()}@example.com`,
      password: 'defaultPassword123',
      first_name: 'John',
      last_name: 'Doe',
      dob: '1990-01-01',
      nationalId: '12345678',
      kra_pin: 'A123456789Z',
      annual_income: 50000,
      dependents: 0,
      goals: { targetAmount: 10000, timeHorizon: 12 },
      questionnaire: [1, 2, 3, 4, 5]
    };
    
    cy.window().then(async (win) => {
      try {
        cy.log('🔍 Testing registration with browser fetch...');
        cy.log(`Payload: ${JSON.stringify(testPayload, null, 2)}`);
        
        const response = await win.fetch('/auth/register', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(testPayload)
        });
        
        cy.log(`Response status: ${response.status}`);
        cy.log(`Response headers: ${JSON.stringify([...response.headers.entries()], null, 2)}`);
        
        if (response.status === 500) {
          cy.log('⚠️ Got 500 error - reading response body...');
          const responseText = await response.text();
          cy.log(`500 Error body: ${responseText}`);
          
          // Check if it's HTML error page or JSON
          if (responseText.startsWith('<')) {
            cy.log('❌ 500 error returned HTML page instead of JSON');
          } else {
            cy.log('❌ 500 error returned non-HTML response');
          }
        } else if (response.ok) {
          const data = await response.json();
          cy.log('✅ Registration successful');
          cy.log(`Token: ${data.access_token?.substring(0, 20)}...`);
        } else {
          const errorText = await response.text();
          cy.log(`❌ Error ${response.status}: ${errorText}`);
        }
      } catch (error) {
        cy.log(`❌ Fetch error: ${error.message}`);
      }
    });
  });
});