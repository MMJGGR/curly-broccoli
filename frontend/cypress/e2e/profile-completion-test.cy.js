import { PERSONAS, fillLoginForm } from '../support/test-data.js';

describe('Profile Completion Detection', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.hideWebpackOverlay();
  });

  it('should show Complete Your Profile button for personas with default data', () => {
    cy.visit('/auth');
    
    const jamal = PERSONAS.users.jamal;
    fillLoginForm(jamal.email, jamal.password).then((interception) => {
      expect(interception.response.statusCode).to.equal(200);
    });
    
    // Should redirect to dashboard
    cy.url().should('include', '/app/dashboard');
    
    // Should show incomplete profile state since Jamal has default values
    cy.get('body').should('contain', 'Welcome');
    
    // Most importantly - should show the Complete Your Profile button
    cy.get('body').should('contain', 'Account Created Successfully!');
    cy.get('body').should('contain', '0% Complete');
    cy.get('button').contains('Complete Your Profile').should('be.visible');
    
    // Should show the setup cards
    cy.get('body').should('contain', 'Personal Details');
    cy.get('body').should('contain', 'Risk Assessment');
    cy.get('body').should('contain', 'Income & Expenses');
    cy.get('body').should('contain', 'Financial Goals');
    
    cy.log('✅ Profile completion detection working correctly for incomplete profiles');
  });

  it('should test profile completion flow', () => {
    cy.visit('/auth');
    
    const aisha = PERSONAS.users.aisha;
    fillLoginForm(aisha.email, aisha.password);
    
    cy.url().should('include', '/app/dashboard');
    
    // Check if Complete Your Profile button exists and click it
    cy.get('body').then(($body) => {
      if ($body.text().includes('Complete Your Profile')) {
        cy.get('button').contains('Complete Your Profile').click();
        
        // Should navigate to onboarding
        cy.url().should('include', '/onboarding/personal-details');
        
        // Verify we're on the personal details form
        cy.get('body').should('contain', 'Personal Details');
        cy.get('input[id="firstName"]').should('be.visible');
        
        cy.log('✅ Onboarding navigation working correctly');
      } else {
        cy.log('ℹ️ Profile already complete - expected behavior');
        cy.get('body').should('contain', 'Profile Complete - All features unlocked!');
      }
    });
  });
});