describe('Expense to Liability Linking and Finite Payment Classification', () => {
  it('creates a liability and links an expense with finite payments', () => {
    cy.visit('/');

    // Login
    cy.contains(/welcome back/i, { timeout: 15000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').clear().type('jaggerthee');
    cy.get('button[type="submit"]').contains(/login/i).click();

    cy.url({ timeout: 20000 }).should('include', '/dashboard');

    // Go to Tools
    cy.visit('/app/tools');
    cy.contains(/Liability Management/i, { timeout: 10000 }).click();

    // Add a liability
    cy.get('[data-testid="add-liability-button"]').click();
    cy.get('input#name').type('Test Loan');
    cy.get('[data-testid="liability-type-select"]').click();
    cy.contains('div[role="option"]', 'Personal Loan').click({ force: true });
    cy.get('input#current_balance').type('100000');
    cy.get('input#monthly_payment').type('10000');
    cy.get('[data-testid="submit-liability"]').click();

    // Verify it appears in list
    cy.get('[data-testid="liability-list"]').contains('Test Loan').should('exist');

    // Go to Expense Management and link the expense to the liability
    cy.contains(/← Back to Tools/i).click();
    cy.contains(/Expense Management/i).click();
    cy.get('[data-testid="add-expense-button"]').click();
    cy.get('input#description').type('Loan Payment');
    cy.get('input#amount').type('10000');

    // Select relationship type: Loan Payment
    cy.get('[data-testid="relationship-type-select"]').click();
    cy.get('[data-testid="relationship-options"]').contains(/Loan Payment/i).click({ force: true });

    // Select liability link
    cy.get('[data-testid="liability-link-select"]').click();
    cy.get('[data-testid="liability-options"]').contains('Test Loan').click({ force: true });

    // Mark finite and set end date
    cy.get('[data-testid="finite-payment-checkbox"]').check();
    cy.get('[data-testid="payment-end-date"]').type('2030-12-01');
    cy.get('[data-testid="submit-expense"]').click();

    // Verify badges on created expense item
    cy.get('[data-testid="expense-list"]').contains('Loan Payment').parents('[data-testid="expense-item"]').as('loanItem');
    cy.get('@loanItem').find('[data-testid="liability-linked-badge"]').should('contain.text', 'Test Loan');
    cy.get('@loanItem').should('contain.text', 'Finite');
  });
});
