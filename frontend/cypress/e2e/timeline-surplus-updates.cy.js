describe('Timeline Dashboard Surplus Updates via Unified Context', () => {
  it('reflects income/expense changes in Monthly Surplus', () => {
    cy.visit('/');

    // Login
    cy.contains(/welcome back/i, { timeout: 15000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').clear().type('jaggerthee');
    cy.get('button[type="submit"]').contains(/login/i).click();

    cy.url({ timeout: 20000 }).should('include', '/dashboard');

    // Go to Tools
    cy.visit('/app/tools');
    cy.contains(/Income Management/i, { timeout: 10000 }).click();

    // Add income 100,000 KES
    cy.contains('+ Add Income Source').click();
    cy.get('form').within(() => {
      cy.get('input[type="text"]').first().type('Test Salary');
      cy.get('input[type="number"]').first().clear().type('100000');
      cy.contains('button', /Add Source/i).click();
    });
    cy.contains(/added successfully/i, { timeout: 10000 }).should('exist');

    // Add expense 25,000 KES
    cy.contains(/← Back to Tools/i).click();
    cy.contains(/Expense Management/i).click();
    cy.get('[data-testid="add-expense-button"]').click();
    cy.get('input#description').type('Test Expense');
    cy.get('input#amount').type('25000');
    cy.get('[data-testid="submit-expense"]').click();

    // Navigate to Dashboard and validate surplus ≈ 75,000
    cy.visit('/app/dashboard');
    cy.contains(/Monthly Surplus/i, { timeout: 15000 }).parent().then($el => {
      const text = $el.text();
      const match = text.replace(/[,\sKES]/g, '').match(/(\d+)/);
      const value = match ? parseInt(match[1], 10) : 0;
      expect(value).to.be.greaterThan(70000);
      expect(value).to.be.lessThan(80000);
    });
  });
});
