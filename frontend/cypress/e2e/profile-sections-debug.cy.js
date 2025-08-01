/**
 * Debug test to check all profile sections
 */

describe('🔍 Profile Sections Debug', () => {
  const jamal = {
    email: 'jamal@example.com',
    password: 'jamal12345'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should check what sections are visible on profile page', () => {
    cy.log('🔐 Logging in as Jamal');
    
    // Login
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    
    // Navigate to profile
    cy.url().should('include', '/app/dashboard');
    cy.get('button').contains('Profile').click();
    cy.url().should('include', '/profile');
    
    cy.log('📊 Checking all profile sections');
    
    // Check each expected section
    const expectedSections = [
      'Personal Information',
      'Financial Information',
      'Goals Management',
      'Risk Profile',
      'Account Settings'
    ];
    
    expectedSections.forEach(section => {
      cy.get('body').then(($body) => {
        if ($body.text().includes(section)) {
          cy.log(`✅ Found section: ${section}`);
        } else {
          cy.log(`❌ Missing section: ${section}`);
        }
      });
    });
    
    // Take a screenshot of the entire profile page
    cy.screenshot('full-profile-page');
    
    // Scroll down to see if Risk Profile is below the fold
    cy.scrollTo('bottom');
    cy.wait(1000);
    cy.screenshot('profile-page-bottom');
    
    // Check for Risk Profile specifically
    cy.get('body').should('contain', 'Risk Profile');
    
    // Check for the button specifically
    cy.get('body').should('contain', 'Retake Risk Assessment');
    
    // Try to find the button element
    cy.get('button').contains('Retake Risk Assessment').should('be.visible');
    
    cy.log('✅ Risk Profile section and button found');
  });
});