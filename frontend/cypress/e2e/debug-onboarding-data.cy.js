describe('Debug Onboarding Data Collection', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
    cy.clearLocalStorage();
  });

  it('should debug onboarding data collection step by step', () => {
    // Start at auth screen
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Switch to registration mode
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Personal details
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('input[id="firstName"]').type('Jane');
    cy.get('input[id="lastName"]').type('Doe');  
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="kraPin"]').type('A123456789Z');
    cy.get('button[type="submit"]').click();
    
    // Check window object for context data after personal details
    cy.window().then((win) => {
      // Try to access React dev tools or context data
      cy.log('Checking for context data after personal details');
    });
    
    cy.wait(2000);
    
    // Risk questionnaire  
    cy.url().should('include', '/onboarding/risk-questionnaire');
    cy.get('input[type="radio"]').first().check();
    cy.get('input[type="radio"]').eq(4).check();
    cy.get('input[type="radio"]').eq(8).check();
    cy.get('input[type="radio"]').eq(12).check();
    cy.get('input[type="radio"]').eq(16).check();
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    cy.wait(4000); // Wait for risk calculation
    
    // Data connection
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('button').contains('Manual Entry (Later)').click();
    
    // Cash flow setup - but don't submit yet
    cy.url().should('include', '/onboarding/cash-flow-setup');
    
    // Instead of clicking Complete Registration, let's debug by opening console
    cy.window().then((win) => {
      // Check if onboarding context data is available
      console.log('Window object keys:', Object.keys(win));
      
      // Try to trigger the registration manually to see the actual data
      cy.get('button').contains('Complete Registration').click();
      
      // Wait a bit and then check for any console errors
      cy.wait(3000);
    });
    
    // Check if there were any network errors
    cy.window().its('console').then((console) => {
      cy.log('Console should show registration attempt');
    });
  });
});