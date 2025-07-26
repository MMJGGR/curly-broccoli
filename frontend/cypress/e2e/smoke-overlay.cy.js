describe('Overlay Smoke Test', () => {
  it('should hide webpack overlay without error', () => {
    cy.visit('/');
    cy.hideWebpackOverlay();
    // No explicit assertion needed here, as the test passes if hideWebpackOverlay doesn't throw an error
    // We can add a simple assertion to ensure the page loads
    cy.url().should('include', '/');
  });
});
