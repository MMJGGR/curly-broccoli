describe('Balance Sheet Debug Test', () => {
  beforeEach(() => {
    window.localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo');
  });

  it('should debug balance sheet lifetime view controls', () => {
    cy.visit('http://localhost:3000');
    cy.wait(3000);
    
    // Navigate to Balance Sheet
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    
    // Check current position first
    cy.get('button').contains('Current Position').should('exist').and('be.visible');
    
    // Click Lifetime View
    cy.contains('Lifetime View').click();
    cy.wait(3000);
    
    // Debug: Check if lifetime view is active
    cy.get('button').contains('Lifetime View').should('have.class', 'bg-white');
    
    // Debug: Look for any elements containing "Rate"
    cy.get('body').then(($body) => {
      const rateElements = $body.find(':contains("Rate")').length;
      cy.log(`Found ${rateElements} elements containing "Rate"`);
      
      const adjustElements = $body.find(':contains("Adjust")').length;
      cy.log(`Found ${adjustElements} elements containing "Adjust"`);
      
      const assumptionElements = $body.find(':contains("Assumption")').length;
      cy.log(`Found ${assumptionElements} elements containing "Assumption"`);
    });
    
    // Check for any console errors
    cy.window().then((win) => {
      cy.wrap(win.console).invoke('log', 'Debug: Checking lifetime view state');
    });
    
    // Look for the specific rate badges that should be there
    cy.get('body').then(($body) => {
      if ($body.find('[class*="bg-blue-50"]').length > 0) {
        cy.log('Found blue badge elements');
        cy.get('[class*="bg-blue-50"]').should('be.visible');
      } else {
        cy.log('No blue badge elements found');
      }
      
      if ($body.find('[class*="bg-purple-50"]').length > 0) {
        cy.log('Found purple badge elements');  
        cy.get('[class*="bg-purple-50"]').should('be.visible');
      } else {
        cy.log('No purple badge elements found');
      }
    });
    
    cy.screenshot('debug-lifetime-view-controls');
  });
});