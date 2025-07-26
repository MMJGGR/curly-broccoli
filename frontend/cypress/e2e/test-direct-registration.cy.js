describe('Direct Registration Test', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
    cy.clearLocalStorage();
  });

  it('should directly test registration API from frontend', () => {
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Test registration API directly from browser console
    cy.window().then((win) => {
      return new Promise((resolve) => {
        const registrationData = {
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
          dob: '1990-01-01',
          nationalId: '12345678',
          kra_pin: 'A123456789B',
          annual_income: 50000,
          dependents: 0,
          goals: { targetAmount: 10000, timeHorizon: 12 },
          questionnaire: [1, 2, 3, 4, 5]
        };
        
        fetch('http://localhost:8000/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(registrationData),
        })
        .then(response => response.json())
        .then(data => {
          console.log('Registration response:', data);
          if (data.access_token) {
            win.localStorage.setItem('jwt', data.access_token);
            resolve(data);
          } else {
            throw new Error('No access token received');
          }
        })
        .catch(error => {
          console.error('Registration error:', error);
          throw error;
        });
      });
    });
    
    // Check that JWT token was stored
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt')).to.not.be.null;
    });
    
    // Navigate to dashboard
    cy.visit('/app/dashboard');
    cy.url().should('include', '/app/dashboard');
  });
});