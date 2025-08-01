/**
 * Debug test for risk questionnaire navigation
 */

describe('🐛 Risk Questionnaire Debug', () => {
  const jamal = {
    email: 'jamal@example.com',
    password: 'jamal12345'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should test direct navigation to risk questionnaire', () => {
    cy.log('🔍 Testing direct navigation to risk questionnaire');
    
    // Login first
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    
    // Wait for dashboard
    cy.url().should('include', '/app/dashboard');
    
    // Try direct navigation to risk questionnaire
    cy.log('🧭 Navigating directly to /onboarding/risk-questionnaire');
    cy.visit('/onboarding/risk-questionnaire');
    
    // Check what we get
    cy.url().should('include', '/onboarding/risk-questionnaire');
    
    // Take screenshot for debugging
    cy.screenshot('risk-questionnaire-direct');
    
    // Wait a bit for any async loading
    cy.wait(2000);
    
    // Check if page content exists
    cy.get('body').then(($body) => {
      if ($body.find('h1').length) {
        cy.log('✅ Found h1 element');
        cy.get('h1').then(($h1) => {
          cy.log(`📝 H1 text: ${$h1.text()}`);
        });
      } else {
        cy.log('❌ No h1 element found');
      }
      
      if ($body.text().includes('Risk Assessment')) {
        cy.log('✅ Found "Risk Assessment" text');
      } else {
        cy.log('❌ No "Risk Assessment" text found');
        cy.log(`📝 Body text: ${$body.text().substring(0, 200)}...`);
      }
    });
  });

  it('should test navigation from profile button', () => {
    cy.log('🔍 Testing navigation from profile button');
    
    // Login and navigate to profile
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    // Take screenshot before clicking
    cy.screenshot('profile-before-risk-nav');
    
    // Check if the risk assessment button exists
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Retake Risk Assessment")').length) {
        cy.log('✅ Found "Retake Risk Assessment" button');
        
        // Click the button
        cy.get('button').contains('Retake Risk Assessment').click();
        
        // Wait for navigation
        cy.wait(2000);
        
        // Check where we ended up
        cy.url().then((url) => {
          cy.log(`📍 Current URL: ${url}`);
        });
        
        // Take screenshot after clicking
        cy.screenshot('after-risk-assessment-click');
        
        // Check page content
        cy.get('body').then(($newBody) => {
          cy.log(`📝 Page content after navigation: ${$newBody.text().substring(0, 300)}...`);
        });
        
      } else {
        cy.log('❌ No "Retake Risk Assessment" button found');
        cy.screenshot('no-risk-button-found');
      }
    });
  });
});