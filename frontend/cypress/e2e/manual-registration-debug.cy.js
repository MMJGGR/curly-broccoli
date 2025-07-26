describe('Manual Registration Debug', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should manually go through registration and check console logs', () => {
    // Capture all console logs
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
      cy.stub(win.console, 'error').as('consoleError');
    });

    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Start onboarding
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Personal details
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('input[id="firstName"]').type('Test');
    cy.get('input[id="lastName"]').type('User');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="kraPin"]').type('A123456789Z');
    cy.get('button[type="submit"]').click();
    
    cy.wait(2000);
    
    // Risk questionnaire
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
    
    // Final step
    cy.url().should('include', '/onboarding/cash-flow-setup');
    
    // Before clicking registration, let's check what's in the context
    cy.window().then((win) => {
      // Try to access the onboarding context data
      const contextData = win.localStorage.getItem('onboardingData');
      cy.log('Onboarding data in localStorage:', contextData);
    });
    
    // Click registration button
    cy.get('button').contains('Complete Registration').click();
    
    // Wait for logs and check
    cy.wait(10000);
    
    // Check all console logs
    cy.get('@consoleLog').then((logs) => {
      logs.getCalls().forEach((call) => {
        cy.log(`Console Log: ${call.args.join(' ')}`);
      });
    });
    
    cy.get('@consoleError').then((errors) => {
      errors.getCalls().forEach((call) => {
        cy.log(`Console Error: ${call.args.join(' ')}`);
      });
    });
    
    // Check final state
    cy.url().then((url) => {
      cy.log(`Final URL: ${url}`);
    });
    
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      cy.log(`JWT token: ${jwt ? 'Present' : 'Not found'}`);
    });
  });

  it('should test just the registration button click in isolation', () => {
    // Go directly to the final step
    cy.visit('/onboarding/cash-flow-setup');
    cy.hideWebpackOverlay();
    
    // Capture console logs
    cy.window().then((win) => {
      cy.stub(win.console, 'log').as('consoleLog');
      cy.stub(win.console, 'error').as('consoleError');
    });
    
    // Click the button immediately
    cy.get('button').contains('Complete Registration').click();
    
    // Wait and check logs
    cy.wait(5000);
    
    cy.get('@consoleLog').then((logs) => {
      logs.getCalls().forEach((call) => {
        cy.log(`Console Log: ${call.args.join(' ')}`);
      });
    });
    
    cy.get('@consoleError').then((errors) => {
      errors.getCalls().forEach((call) => {
        cy.log(`Console Error: ${call.args.join(' ')}`);
      });
    });
  });
});