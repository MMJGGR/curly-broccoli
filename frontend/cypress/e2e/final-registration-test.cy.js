describe('Final Registration Test', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
    cy.clearLocalStorage();
  });

  it('should complete full registration flow', () => {
    const email = `newuser${Date.now()}@example.com`;
    
    // Start at auth screen
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Click "Get Started" (registration mode)
    cy.contains('New user? Get Started').click();
    cy.get('h1').should('contain', 'Get Started');
    
    // Click "Start Onboarding" button
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Should navigate to personal details
    cy.url().should('include', '/onboarding/personal-details');
    
    // Fill personal details
    cy.get('input[id="firstName"]').type('John');
    cy.get('input[id="lastName"]').type('Doe');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('button[type="submit"]').click();
    
    // Should proceed to risk questionnaire
    cy.url().should('include', '/onboarding/risk-questionnaire');
    
    // Fill risk questionnaire
    cy.get('input[type="radio"]').first().check(); 
    cy.get('input[type="radio"]').eq(4).check(); 
    cy.get('input[type="radio"]').eq(8).check(); 
    cy.get('input[type="radio"]').eq(12).check(); 
    cy.get('input[type="radio"]').eq(16).check(); 
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    // Should proceed to data connection
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('button').contains('Manual Entry (Later)').click();
    
    // Should proceed to cash flow setup
    cy.url().should('include', '/onboarding/cash-flow-setup');
    cy.get('button').contains('Next: Set Your Goals').click();
    
    // After completing onboarding, should be redirected to dashboard
    cy.url().should('include', '/app/dashboard');
    
    // Should have JWT token in localStorage
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt')).to.not.be.null;
    });
  });
});