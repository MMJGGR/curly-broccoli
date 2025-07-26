describe('Debug Proxy Error', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should test registration and catch JSON parsing errors', () => {
    cy.visit('/onboarding/cash-flow-setup');
    cy.hideWebpackOverlay();
    
    // Override fetch to see raw responses
    cy.window().then((win) => {
      const originalFetch = win.fetch;
      win.fetch = async function(url, options) {
        console.log('🔍 FETCH REQUEST:', {
          url,
          method: options?.method,
          headers: options?.headers,
          body: options?.body
        });
        
        try {
          const response = await originalFetch.call(this, url, options);
          console.log('🔍 FETCH RESPONSE:', {
            url: response.url,
            status: response.status,
            statusText: response.statusText,
            headers: [...response.headers.entries()]
          });
          
          // Clone to read body without consuming
          const responseClone = response.clone();
          const responseText = await responseClone.text();
          console.log('🔍 RESPONSE BODY (raw):', responseText);
          
          // Try to parse as JSON
          try {
            const jsonData = JSON.parse(responseText);
            console.log('🔍 PARSED JSON:', jsonData);
          } catch (jsonError) {
            console.log('🔍 JSON PARSE ERROR:', jsonError.message);
            console.log('🔍 Raw text that failed:', responseText.substring(0, 200));
          }
          
          return response;
        } catch (fetchError) {
          console.log('🔍 FETCH ERROR:', {
            name: fetchError.name,
            message: fetchError.message,
            stack: fetchError.stack
          });
          throw fetchError;
        }
      };
    });
    
    // Click registration button
    cy.get('button').contains('Complete Registration').click();
    
    // Wait for the request to complete
    cy.wait(5000);
    
    // Check if we got redirected or stayed on same page
    cy.url().then((url) => {
      cy.log(`Final URL: ${url}`);
    });
  });

  it('should test the proxy directly', () => {
    cy.visit('/');
    cy.hideWebpackOverlay();
    
    cy.window().then(async (win) => {
      // Test 1: Health check
      try {
        console.log('🔍 Testing health endpoint...');
        const healthResponse = await win.fetch('/healthz');
        const healthText = await healthResponse.text();
        console.log('🔍 Health response:', healthText);
      } catch (error) {
        console.log('🔍 Health error:', error.message);
      }
      
      // Test 2: Registration endpoint
      try {
        console.log('🔍 Testing registration endpoint...');
        const regData = {
          email: `proxy-debug-${Date.now()}@example.com`,
          password: 'defaultPassword123',
          first_name: 'Proxy',
          last_name: 'Debug',
          dob: '1990-01-01',
          nationalId: '12345678',
          kra_pin: 'A123456789Z',
          annual_income: 50000,
          dependents: 0,
          goals: { targetAmount: 10000, timeHorizon: 12 },
          questionnaire: [1, 2, 3, 4, 5]
        };
        
        const regResponse = await win.fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(regData)
        });
        
        console.log('🔍 Registration response status:', regResponse.status);
        const regText = await regResponse.text();
        console.log('🔍 Registration response text:', regText);
        
        if (regResponse.ok) {
          try {
            const regJson = JSON.parse(regText);
            console.log('🔍 Registration JSON:', regJson);
          } catch (parseError) {
            console.log('🔍 Failed to parse registration response as JSON:', parseError.message);
          }
        }
      } catch (error) {
        console.log('🔍 Registration error:', error.message);
      }
    });
  });
});