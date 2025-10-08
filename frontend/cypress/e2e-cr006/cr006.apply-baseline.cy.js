describe('CR006: Apply Baseline to Budget', () => {
  it('applies baseline and updates budget totals', () => {
    cy.visit('/');
    cy.contains(/welcome back/i, { timeout: 15000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').clear().type('jaggerthee');
    cy.contains('button', /login/i).click();

    cy.url({ timeout: 20000 }).should('include', '/dashboard');
    cy.visit('/app/profile');
    cy.contains('Apply Baseline to Budget', { timeout: 15000 }).click();

    // Navigate to budget and check totals not empty
    cy.visit('/app/budget');
    cy.contains(/Budget Categories/i, { timeout: 15000 }).should('be.visible');
    cy.contains(/Monthly Income/i).should('exist');
    cy.contains(/Total Expenses/i).should('exist');
  });
});

