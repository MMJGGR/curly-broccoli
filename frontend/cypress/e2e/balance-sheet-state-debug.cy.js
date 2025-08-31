describe('Balance Sheet State Debug', () => {
  beforeEach(() => {
    window.localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo');
  });

  it('should check balance sheet mode state transitions', () => {
    cy.visit('http://localhost:3000');
    cy.wait(3000);
    
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    
    // Check initial state - should be Current Position
    cy.get('button').contains('Current Position').should('have.class', 'bg-white');
    cy.get('button').contains('Lifetime View').should('not.have.class', 'bg-white');
    
    // Should NOT see lifetime-specific elements
    cy.get('body').should('not.contain', 'Income Rate:');
    cy.get('body').should('not.contain', 'CFA Methodology Applied');
    
    cy.screenshot('before-lifetime-click');
    
    // Click lifetime view button
    cy.contains('Lifetime View').click();
    cy.wait(2000);
    
    // Check state after click
    cy.get('button').contains('Lifetime View').should('have.class', 'bg-white');
    cy.get('button').contains('Current Position').should('not.have.class', 'bg-white');
    
    // Now check if lifetime-specific elements appear
    cy.get('body').then(($body) => {
      const incomeRateExists = $body.find(':contains("Income Rate:")').length > 0;
      const cfaMethodologyExists = $body.find(':contains("CFA Methodology Applied")').length > 0;
      const adjustButtonExists = $body.find(':contains("Adjust Assumptions")').length > 0;
      
      cy.log(`Income Rate badge exists: ${incomeRateExists}`);
      cy.log(`CFA Methodology note exists: ${cfaMethodologyExists}`);
      cy.log(`Adjust Assumptions button exists: ${adjustButtonExists}`);
      
      if (!incomeRateExists && !cfaMethodologyExists && !adjustButtonExists) {
        cy.log('ERROR: No lifetime-specific elements found despite lifetime mode being active!');
      }
    });
    
    cy.screenshot('after-lifetime-click');
    
    // Wait a bit more and check again in case there's delayed rendering
    cy.wait(3000);
    cy.screenshot('after-longer-wait');
    
    // Check for any console errors
    cy.window().its('console').invoke('error').should('not.have.been.called');
  });
});