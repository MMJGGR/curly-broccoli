describe('Proxy Test', () => {
  it('should test proxy to backend', () => {
    cy.visit('/');
    cy.hideWebpackOverlay();
    
    // Test the proxy by making a relative API call
    cy.window().then(async (win) => {
      try {
        // Test health endpoint through proxy
        const healthResponse = await win.fetch('/healthz');
        cy.log(`Health check status: ${healthResponse.status}`);
        
        if (healthResponse.ok) {
          const healthData = await healthResponse.text();
          cy.log(`✅ Proxy works - health response: ${healthData}`);
          
          // Test registration through proxy
          const registrationData = {
            email: `proxy-test-${Date.now()}@example.com`,
            password: 'defaultPassword123',
            first_name: 'Proxy',
            last_name: 'Test',
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
            body: JSON.stringify(registrationData)
          });
          
          cy.log(`Registration status: ${regResponse.status}`);
          
          if (regResponse.ok) {
            const regData = await regResponse.json();
            cy.log(`✅ Registration through proxy works! Token: ${regData.access_token?.substring(0, 20)}...`);
          } else {
            const errorText = await regResponse.text();
            cy.log(`❌ Registration failed: ${errorText}`);
          }
        } else {
          cy.log(`❌ Proxy health check failed: ${healthResponse.status}`);
        }
      } catch (error) {
        cy.log(`❌ Proxy test error: ${error.message}`);
      }
    });
  });
});