describe('Complete User Flow', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
    cy.clearLocalStorage();
  });

  it('should complete full user journey from registration to account management', () => {
    const email = `fullflow${Date.now()}@example.com`;
    
    // 1. Start at home page - should redirect to auth
    cy.visit('/');
    cy.url().should('include', '/auth');
    cy.hideWebpackOverlay();
    
    // 2. Switch to registration mode
    cy.contains('New user? Get Started').click();
    cy.get('h1').should('contain', 'Get Started');
    
    // 3. Start onboarding process
    cy.get('button[type="submit"]').contains('Start Onboarding').click();
    cy.url().should('include', '/onboarding/personal-details');
    
    // 4. Complete personal details
    cy.get('input[id="firstName"]').type('Jane');
    cy.get('input[id="lastName"]').type('Smith');
    cy.get('input[id="dob"]').type('1985-05-15');
    cy.get('input[id="kraPin"]').type('A123456789B');
    cy.get('button[type="submit"]').click();
    
    // 5. Complete risk questionnaire
    cy.url().should('include', '/onboarding/risk-questionnaire');
    // Assume risk questionnaire has radio buttons or similar
    cy.get('button').contains('Submit').click();
    
    // 6. Skip data connection
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('button').contains('Continue').click();
    
    // 7. Complete cash flow setup
    cy.url().should('include', '/onboarding/cash-flow-setup');
    cy.get('button').contains('Complete Setup').click();
    
    // 8. Should be redirected to dashboard after successful registration
    cy.url().should('include', '/app/dashboard');
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt')).to.not.be.null;
    });
    
    // 9. Navigate to accounts/cashflows
    cy.visit('/app/cashflows');
    
    // 10. Create an account
    cy.get('[data-testid="add-account-button"]').click();
    cy.get('[data-testid="account-form-modal"]').should('be.visible');
    cy.get('[data-testid="account-name-input"]').type('My Savings Account');
    cy.get('[data-testid="account-balance-input"]').type('5000');
    cy.get('[data-testid="account-type-select"]').select('Savings');
    cy.get('[data-testid="institution-name-input"]').type('Main Bank');
    cy.get('[data-testid="submit-add-account"]').click();
    
    // 11. Verify account appears in list
    cy.contains('My Savings Account').should('be.visible');
    
    // 12. Navigate to profile and logout
    cy.visit('/app/profile');
    cy.contains('Logout').click();
    cy.contains('Logged out successfully').should('be.visible');
    cy.url().should('include', '/auth');
    
    // 13. Login again with same credentials
    cy.get('input[id="email"]').type(email);
    cy.get('input[id="password"]').type('password'); // This would need to be set during onboarding
    cy.get('button[type="submit"]').click();
    
    // 14. Should go directly to dashboard (no onboarding)
    cy.url().should('include', '/app/dashboard');
    
    // 15. Verify account still exists
    cy.visit('/app/cashflows');
    cy.contains('My Savings Account').should('be.visible');
  });
});