describe('New Registration Flow', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
    cy.clearLocalStorage();
  });

  it('should complete new registration with backend integration', () => {
    // Start at auth screen
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Switch to registration mode
    cy.contains('New user? Get Started').click();
    cy.get('h1').should('contain', 'Get Started');
    
    // Start onboarding
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Personal details
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('input[id="firstName"]').type('Jane');
    cy.get('input[id="lastName"]').type('Doe');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="kraPin"]').type('A123456789Z');
    cy.get('button[type="submit"]').click();
    
    // Wait for personal details to save and navigate
    cy.wait(2000);
    
    // Risk questionnaire  
    cy.url().should('include', '/onboarding/risk-questionnaire');
    // Fill out all questions
    cy.get('input[type="radio"]').first().check();
    cy.get('input[type="radio"]').eq(4).check();
    cy.get('input[type="radio"]').eq(8).check();
    cy.get('input[type="radio"]').eq(12).check();
    cy.get('input[type="radio"]').eq(16).check();
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    // Wait for risk calculation
    cy.wait(4000);
    
    // Data connection
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('button').contains('Manual Entry (Later)').click();
    
    // Final step - cash flow setup and registration
    cy.url().should('include', '/onboarding/cash-flow-setup');
    cy.get('button').contains('Complete Registration').click();
    
    // Wait for backend registration (may take time)
    cy.wait(10000);
    
    // Should be redirected to dashboard after successful registration
    cy.url().should('include', '/app/dashboard');
    
    // Should have JWT token
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt')).to.not.be.null;
    });
  });
});