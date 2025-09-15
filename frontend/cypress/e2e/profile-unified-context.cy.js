describe('Profile Unified Context Integration', () => {
  it('logs in and verifies Profile shows unified data and budget metrics', () => {
    cy.visit('/');

    // Login
    cy.contains(/welcome back/i, { timeout: 15000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').clear().type('jaggerthee');
    cy.get('button[type="submit"]').contains(/login/i).click();

    // Navigate to Profile
    cy.url({ timeout: 20000 }).should('include', '/dashboard');
    cy.visit('/app/profile');

    // Validate Profile summary & sections render
    cy.contains(/Profile Summary/i, { timeout: 15000 }).should('be.visible');
    cy.contains(/Risk Profile/i).should('be.visible');
    cy.contains(/Financial Information/i).should('be.visible');

    // Validate budget totals presence (values depend on data, so check labels)
    cy.contains(/Total Expenses/i).should('exist');
    cy.contains(/Remaining/i).should('exist');
    cy.contains(/Net Cash Flow/i).should('exist');
  });
});

