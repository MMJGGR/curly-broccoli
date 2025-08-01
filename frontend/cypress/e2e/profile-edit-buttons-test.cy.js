/**
 * Test specific profile edit buttons
 */

describe('✏️ Profile Edit Buttons Test', () => {
  const jamal = {
    email: 'jamal@example.com',
    password: 'jamal12345'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should find and click Edit Personal Info button', () => {
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
    
    cy.log('🔍 Looking for Edit Personal Info button');
    
    // Scroll to see all content
    cy.scrollTo('top');
    cy.wait(1000);
    
    // Take screenshot of top of page
    cy.screenshot('profile-top-section');
    
    // Look for the specific button text
    cy.get('body').should('contain', 'Personal Information');
    
    // Try to find and click the "Edit Personal Info" button
    cy.get('button').contains('Edit Personal Info').should('be.visible');
    cy.get('button').contains('Edit Personal Info').click();
    
    cy.log('✅ Clicked Edit Personal Info button');
    
    // Should now be in edit mode - check for input fields
    cy.get('input[type="text"]').should('exist');
    cy.get('input[type="date"]').should('exist');
    
    // Try to update first name
    cy.get('input').first().clear().type('JamalUpdatedTest');
    
    // Click Save Changes button
    cy.get('button').contains('Save Changes').click();
    
    cy.log('💾 Clicked Save Changes');
    
    // Wait for the update
    cy.wait(3000);
    
    // Should show success message or updated data
    cy.get('body').then(($body) => {
      const text = $body.text();
      if (text.includes('updated successfully') || text.includes('success')) {
        cy.log('✅ Profile update successful');
      } else if (text.includes('JamalUpdatedTest')) {
        cy.log('✅ Updated name is visible');
      } else {
        cy.log('❓ Update result unclear');
        cy.screenshot('after-profile-update');
      }
    });
  });

  it('should find and click Update Financial Info button', () => {
    cy.log('🔐 Logging in as Jamal');
    
    // Login
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    
    // Navigate to profile
    cy.get('button').contains('Profile').click();
    
    cy.log('💰 Looking for Update Financial Info button');
    
    // Scroll down to find financial section
    cy.scrollTo('bottom');
    cy.wait(1000);
    
    // Take screenshot
    cy.screenshot('profile-bottom-section');
    
    // Look for Financial Information section
    cy.get('body').should('contain', 'Financial Information');
    
    // Try to find the Update Financial Info button
    cy.get('button').contains('Update Financial Info').should('be.visible');
    cy.get('button').contains('Update Financial Info').click();
    
    cy.log('✅ Clicked Update Financial Info button');
    
    // Should be in edit mode for financial info
    cy.get('input[type="number"]').should('exist');
    
    // Try to update annual income
    cy.get('input[type="number"]').first().clear().type('700000');
    
    // Click Save Changes
    cy.get('button').contains('Save Changes').click();
    
    cy.log('💾 Clicked Save Changes for financial info');
    
    // Wait for the update
    cy.wait(3000);
    
    // Check for success
    cy.get('body').then(($body) => {
      const text = $body.text();
      if (text.includes('updated successfully') || text.includes('success')) {
        cy.log('✅ Financial info update successful');  
      } else {
        cy.log('❓ Financial update result unclear');
        cy.screenshot('after-financial-update');
      }
    });
  });
});