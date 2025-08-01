/**
 * Debug test specifically for Retake Risk Assessment button
 */

describe('🔍 Retake Risk Assessment Debug', () => {
  const jamal = {
    email: 'jamal@example.com',
    password: 'jamal12345'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should debug what happens when clicking Retake Risk Assessment', () => {
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
    
    cy.log('📊 On profile page, looking for Risk Profile section');
    
    // Take screenshot of profile page
    cy.screenshot('profile-page-before-risk-click');
    
    // Check if Risk Profile section exists
    cy.get('body').then(($body) => {
      const bodyContent = $body.text();
      cy.log(`📝 Profile page content (first 500 chars): ${bodyContent.substring(0, 500)}...`);
      
      if (bodyContent.includes('Risk Profile')) {
        cy.log('✅ Found Risk Profile section');
      } else {
        cy.log('❌ No Risk Profile section found');
      }
      
      if (bodyContent.includes('Retake Risk Assessment')) {
        cy.log('✅ Found Retake Risk Assessment button text');
      } else {
        cy.log('❌ No Retake Risk Assessment button text found');
      }
    });
    
    // Try to find and click the button
    cy.get('body').then(($body) => {
      const riskButton = $body.find('button:contains("Retake Risk Assessment")');
      if (riskButton.length > 0) {
        cy.log('✅ Found Retake Risk Assessment button element');
        
        // Click the button
        cy.get('button').contains('Retake Risk Assessment').click();
        
        cy.log('🧭 Clicked Retake Risk Assessment button');
        
        // Wait a moment for navigation
        cy.wait(2000);
        
        // Check where we are now
        cy.url().then((currentUrl) => {
          cy.log(`📍 Current URL after click: ${currentUrl}`);
        });
        
        // Take screenshot after click
        cy.screenshot('after-risk-assessment-button-click');
        
        // Check what's on the page now
        cy.get('body').then(($newBody) => {
          const newContent = $newBody.text();
          cy.log(`📝 New page content (first 500 chars): ${newContent.substring(0, 500)}...`);
          
          if (newContent.includes('Risk Assessment Questionnaire')) {
            cy.log('✅ Found Risk Assessment Questionnaire content');
          } else {
            cy.log('❌ No Risk Assessment Questionnaire content - PAGE IS EMPTY OR BROKEN');
          }
          
          // Check for specific elements
          const hasH1 = $newBody.find('h1').length > 0;
          const hasForm = $newBody.find('form').length > 0;
          const hasRadio = $newBody.find('input[type="radio"]').length > 0;
          
          cy.log(`📊 Page elements: H1=${hasH1}, Form=${hasForm}, Radio=${hasRadio}`);
        });
        
      } else {
        cy.log('❌ Retake Risk Assessment button not found on page');
      }
    });
  });
});