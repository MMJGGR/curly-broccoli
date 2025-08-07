/**
 * Quick Smoke Test
 * Simple test to verify the application is accessible and basic functionality works
 */

describe('Quick Smoke Test', () => {
  it('should load the application and basic navigation works', () => {
    cy.visit('http://localhost:3000', { timeout: 10000 });
    
    // Verify app loads
    cy.contains('Get Started', { timeout: 10000 }).should('be.visible');
    cy.log('✅ Application loads successfully');
    
    // Test basic navigation
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').should('be.visible');
    cy.log('✅ Basic navigation working');
    
    cy.log('🎉 Smoke test passed - system is operational');
  });
});