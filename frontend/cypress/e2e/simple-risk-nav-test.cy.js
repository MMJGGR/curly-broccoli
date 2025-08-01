/**
 * Simple test for risk questionnaire navigation and content
 */

describe('🎯 Simple Risk Navigation Test', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to risk questionnaire and check content', () => {
    // Login first
    cy.visit('/auth');
    cy.get('input[id="email"]').type('jamal@example.com');
    cy.get('input[id="password"]').type('jamal12345');
    cy.get('button[type="submit"]').click();
    
    // Wait for login
    cy.url().should('include', '/app/dashboard');
    
    // Go directly to risk questionnaire
    cy.visit('/onboarding/risk-questionnaire');
    
    // Wait for page to load
    cy.wait(3000);
    
    // Check for any text content at all
    cy.get('body').should('not.be.empty');
    
    // Try to find the title with a longer timeout
    cy.contains('Risk Assessment Questionnaire', { timeout: 10000 }).should('be.visible');
    
    // Also check for any part of the expected text
    cy.get('body').should('contain', 'Risk Assessment');
    
    // Check for form elements (questions)
    cy.get('form').should('exist');
    
    // Check for radio buttons (which are part of the questions)
    cy.get('input[type="radio"]').should('exist');
    
    cy.log('✅ Risk questionnaire page loaded successfully');
  });
});