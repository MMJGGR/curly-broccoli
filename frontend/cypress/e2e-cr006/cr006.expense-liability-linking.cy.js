describe('CR006: Expense → Liability linking with finite payments', () => {
  it('creates liability and links an expense as finite payment', () => {
    cy.visit('/');
    cy.contains(/welcome back/i, { timeout: 15000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').clear().type('jaggerthee');
    cy.contains('button', /login/i).click();

    cy.url({ timeout: 20000 }).should('include', '/dashboard');
    cy.visit('/app/tools');
    cy.contains(/Liability Management/i, { timeout: 10000 }).click();
    cy.get('[data-testid="add-liability-button"]').click();
    cy.get('#name').type('Test Loan X');
    cy.get('[data-testid="liability-type-select"]').click();
    cy.contains('div[role="option"]', /Personal Loan/i).click({ force: true });
    cy.get('#current_balance').type('100000');
    cy.get('#monthly_payment').type('10000');
    cy.get('[data-testid="submit-liability"]').click();

    // Link an expense
    cy.contains(/← Back to Tools/i).click();
    cy.contains(/Expense Management/i).click();
    cy.get('[data-testid="add-expense-button"]').click();
    cy.get('#description').type('Loan Payment X');
    cy.get('#amount').type('10000');
    cy.get('[data-testid="liability-link-select"]').click();
    cy.get('[data-testid="liability-options"]').contains('Test Loan X').click({ force: true });
    cy.get('[data-testid="relationship-type-select"]').click();
    cy.get('[data-testid="relationship-options"]').contains(/Loan Payment/i).click({ force: true });
    cy.get('[data-testid="finite-payment-checkbox"]').check();
    cy.get('[data-testid="payment-end-date"]').type('2031-06-01');
    cy.get('[data-testid="submit-expense"]').click();

    cy.get('[data-testid="expense-list"]').contains('Loan Payment X').parents('[data-testid="expense-item"]').as('exp');
    cy.get('@exp').find('[data-testid="liability-linked-badge"]').should('contain.text', 'Test Loan X');
    cy.get('@exp').should('contain.text', 'Finite');
  });
});

