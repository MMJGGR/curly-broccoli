describe('Budget Category Form CRUD', () => {
  it('adds, edits, and deletes a budget category (local state)', () => {
    cy.visit('/');

    // Login
    cy.contains(/welcome back/i, { timeout: 15000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').clear().type('jaggerthee');
    cy.get('button[type="submit"]').contains(/login/i).click();

    // Go to budget page
    cy.url({ timeout: 20000 }).should('include', '/dashboard');
    cy.visit('/app/budget');

    // Add a category
    cy.get('[data-testid="category-name-input"]').type('Test Category');
    cy.get('[data-testid="category-amount-input"]').type('5000');
    cy.get('[data-testid="save-category-button"]').click();

    // Verify it appears
    cy.get('[data-testid="category-list"]').within(() => {
      cy.contains('Test Category').should('exist');
      cy.contains('5,000').should('exist');
    });

    // Edit the category
    cy.get('[data-testid="category-item"]').contains('Test Category').parent().within(() => {
      cy.get('[data-testid="edit-category"]').click();
    });
    cy.get('[data-testid="category-amount-input"]').clear().type('6500');
    cy.get('[data-testid="save-category-button"]').click();

    // Verify updated amount
    cy.get('[data-testid="category-list"]').contains('Test Category').parent().within(() => {
      cy.contains('6,500').should('exist');
    });

    // Refresh page and verify persistence via API
    cy.visit('/app/budget');
    cy.get('[data-testid="category-list"]').contains('Test Category').parent().within(() => {
      cy.contains('6,500').should('exist');
    });

    // Delete the category
    cy.get('[data-testid="category-item"]').contains('Test Category').parent().within(() => {
      cy.get('[data-testid="delete-category"]').click();
    });
    cy.on('window:confirm', () => true);

    // Verify removal
    cy.get('[data-testid="category-list"]').should('not.contain.text', 'Test Category');
    // Refresh page and verify it is still removed
    cy.visit('/app/budget');
    cy.get('[data-testid="category-list"]').should('not.contain.text', 'Test Category');
  });
});
