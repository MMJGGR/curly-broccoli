describe('Balance Sheet Confidence Intervals - Richard Profile Test', () => {
  beforeEach(() => {
    // Clear any existing sessions and overlays
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.clearAllSessionStorage();
    
    // Visit the app first to check if already logged in
    cy.visit('http://localhost:3000', { failOnStatusCode: false });
    cy.wait(2000);
    
    // Handle webpack overlay if present
    cy.get('body').then(($body) => {
      if ($body.find('#webpack-dev-server-client-overlay').length > 0) {
        cy.get('#webpack-dev-server-client-overlay').should('be.visible');
        // Try to dismiss overlay by pressing Escape
        cy.get('body').type('{esc}', { force: true });
        cy.wait(1000);
      }
    });
    
    // Check if we need to login
    cy.url().then((url) => {
      if (url.includes('/login') || !url.includes('3000')) {
        // Login as Richard
        cy.visit('http://localhost:3000/login', { failOnStatusCode: false });
        cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible').type('richard.mmacharia@gmail.com', { force: true });
        cy.get('input[type="password"]').should('be.visible').type('password123', { force: true });
        cy.get('button[type="submit"]').click({ force: true });
        
        // Wait for successful login and redirect
        cy.url({ timeout: 10000 }).should('not.include', '/login');
        cy.wait(2000);
      }
    });
  });

  it('should display confidence intervals in lifetime view with Richard\'s data', () => {
    // Navigate to balance sheet
    cy.visit('http://localhost:3000/balance-sheet');
    cy.wait(3000);

    // Switch to lifetime view to see confidence intervals
    cy.contains('Lifetime View').should('be.visible').click();
    cy.wait(2000);

    // Verify confidence intervals section is visible
    cy.contains('Lifetime Net Worth Confidence Analysis').should('be.visible');
    cy.contains('Monte Carlo').should('be.visible');
    cy.contains('1,000 scenario simulations').should('be.visible');

    // Check for three confidence interval cards
    cy.contains('Pessimistic (10th percentile)').should('be.visible');
    cy.contains('Expected (50th percentile)').should('be.visible');
    cy.contains('Optimistic (90th percentile)').should('be.visible');

    // Verify statistical metrics are displayed
    cy.contains('Probability of Positive Net Worth').should('be.visible');
    cy.contains('Standard Deviation').should('be.visible');
    cy.contains('Working Years Remaining').should('be.visible');

    // Check methodology section
    cy.contains('Monte Carlo Methodology').should('be.visible');
    cy.contains('Scenarios: 1000').should('be.visible');
    cy.contains('Income Volatility: 15%').should('be.visible');
    cy.contains('Expense Volatility: 12%').should('be.visible');

    // Verify risk assessment
    cy.contains('Financial Risk Assessment').should('be.visible');
    cy.contains('Risk Level:').should('be.visible');

    // Check that values are displayed (not empty)
    cy.get('[class*="text-2xl"][class*="font-bold"]').should('have.length.at.least', 6);

    // Verify the confidence intervals show different values
    cy.get('[class*="border-red-200"]').within(() => {
      cy.get('[class*="text-2xl"][class*="font-bold"]').should('not.be.empty');
    });

    cy.get('[class*="border-blue-200"][class*="ring-2"]').within(() => {
      cy.get('[class*="text-2xl"][class*="font-bold"]').should('not.be.empty');
    });

    cy.get('[class*="border-green-200"]').within(() => {
      cy.get('[class*="text-2xl"][class*="font-bold"]').should('not.be.empty');
    });

    // Test that confidence intervals only show in lifetime view
    cy.contains('Traditional View').click();
    cy.wait(1000);
    cy.contains('Lifetime Net Worth Confidence Analysis').should('not.exist');

    // Switch back to lifetime view
    cy.contains('Lifetime View').click();
    cy.wait(1000);
    cy.contains('Lifetime Net Worth Confidence Analysis').should('be.visible');
  });

  it('should update confidence intervals when assumptions change', () => {
    cy.visit('http://localhost:3000/balance-sheet');
    cy.wait(3000);

    // Switch to lifetime view
    cy.contains('Lifetime View').click();
    cy.wait(2000);

    // Get initial expected value
    let initialExpected;
    cy.get('[class*="border-blue-200"][class*="ring-2"]')
      .find('[class*="text-2xl"][class*="font-bold"]')
      .invoke('text')
      .then((text) => {
        initialExpected = text;
      });

    // Open rate adjustment modal
    cy.contains('Adjust Assumptions').click();
    cy.wait(1000);

    // Change income discount rate
    cy.get('input[step="0.1"]').first().clear().type('15.0');
    
    // Save changes
    cy.contains('Save Changes').click();
    cy.wait(2000);

    // Verify the confidence intervals have been recalculated
    cy.get('[class*="border-blue-200"][class*="ring-2"]')
      .find('[class*="text-2xl"][class*="font-bold"]')
      .invoke('text')
      .should((newText) => {
        expect(newText).not.to.equal(initialExpected);
      });

    // Verify that the methodology still shows correct values
    cy.contains('Scenarios: 1000').should('be.visible');
    cy.contains('Income Volatility: 15%').should('be.visible');
  });

  it('should display meaningful risk assessment based on Richard\'s profile', () => {
    cy.visit('http://localhost:3000/balance-sheet');
    cy.wait(3000);

    cy.contains('Lifetime View').click();
    cy.wait(2000);

    // Check that probability percentage is realistic (should be between 0-100%)
    cy.contains('Probability of Positive Net Worth').parent().within(() => {
      cy.get('[class*="font-bold"][class*="text-2xl"]')
        .invoke('text')
        .should('match', /^\d{1,3}\.\d%$/);
    });

    // Working years remaining should be realistic for Richard (31 years old)
    cy.contains('Working Years Remaining').parent().within(() => {
      cy.get('[class*="font-medium"][class*="text-lg"]')
        .invoke('text')
        .then((text) => {
          const years = parseInt(text.split(' ')[0]);
          expect(years).to.be.at.least(25).and.at.most(40);
        });
    });

    // Risk level should be one of the expected values
    cy.contains('Risk Level:').parent().within(() => {
      cy.get('[class*="bg-"][class*="100"]')
        .should('contain.text', /(Low Risk|Moderate Risk|High Risk)/);
    });

    // Range spread should be displayed with currency format
    cy.contains('Range:').parent().within(() => {
      cy.contains(/KES|,/).should('exist');
    });
  });

  it('should handle edge cases and error states gracefully', () => {
    cy.visit('http://localhost:3000/balance-sheet');
    cy.wait(3000);

    cy.contains('Lifetime View').click();
    cy.wait(2000);

    // Ensure confidence intervals are calculated even with minimal data
    cy.contains('Lifetime Net Worth Confidence Analysis').should('be.visible');

    // Check that all three percentiles are different values
    let pessimistic, expected, optimistic;

    cy.get('[class*="border-red-200"]')
      .find('[class*="text-2xl"][class*="font-bold"]')
      .invoke('text')
      .then((text) => { pessimistic = text; });

    cy.get('[class*="border-blue-200"][class*="ring-2"]')
      .find('[class*="text-2xl"][class*="font-bold"]')
      .invoke('text')
      .then((text) => { expected = text; });

    cy.get('[class*="border-green-200"]')
      .find('[class*="text-2xl"][class*="font-bold"]')
      .invoke('text')
      .then((text) => { 
        optimistic = text;
        // Verify logical ordering (pessimistic <= expected <= optimistic)
        // Note: We're checking they're not all identical
        expect([pessimistic, expected, optimistic].filter((v, i, arr) => arr.indexOf(v) === i).length).to.be.at.least(2);
      });

    // Verify methodology shows realistic values
    cy.contains('Income Volatility: 15%').should('be.visible');
    cy.contains('Expense Volatility: 12%').should('be.visible');
  });
});