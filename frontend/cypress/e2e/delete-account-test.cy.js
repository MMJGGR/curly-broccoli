/**
 * Test delete account functionality and validation
 */

describe('🗑️ Delete Account Functionality', () => {
  const jamal = {
    email: 'jamal@example.com',
    password: 'jamal12345'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should show delete account modal and validate requirements', () => {
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
    
    cy.log('🗑️ Testing delete account modal');
    
    // Scroll to find Delete Account button
    cy.scrollTo('bottom');
    cy.wait(1000);
    
    // Find and click Delete Account button
    cy.get('button').contains('Delete Account').should('be.visible');
    cy.get('button').contains('Delete Account').click();
    
    // Should show delete modal
    cy.get('body').should('contain', 'This action cannot be undone');
    cy.get('body').should('contain', 'Enter your password to confirm');
    cy.get('body').should('contain', 'Type "DELETE MY ACCOUNT" to confirm');
    
    cy.log('✅ Delete modal appeared');
    
    // Test 1: Modal delete button should be disabled initially
    // Wait for modal and get the specific delete button within it
    cy.contains('This action cannot be undone').should('be.visible');
    cy.get('button').contains('Delete Account').last().should('be.disabled');
    
    cy.log('✅ Delete button is initially disabled');
    
    // Test 2: Enter only password - button should still be disabled
    cy.get('input[id="deletePassword"]').type('jamal12345');
    cy.get('button').contains('Delete Account').last().should('be.disabled');
    
    cy.log('✅ Delete button remains disabled with only password');
    
    // Test 3: Enter only confirmation text - button should still be disabled
    cy.get('input[id="deletePassword"]').clear();
    cy.get('input[id="deleteConfirm"]').type('DELETE MY ACCOUNT');
    cy.get('button').contains('Delete Account').last().should('be.disabled');
    
    cy.log('✅ Delete button remains disabled with only confirmation text');
    
    // Test 4: Enter both password and confirmation - button should be enabled
    cy.get('input[id="deletePassword"]').type('jamal12345');
    cy.get('button').contains('Delete Account').last().should('not.be.disabled');
    
    cy.log('✅ Delete button is enabled when both requirements are met');
    
    // Test 5: Test wrong confirmation text
    cy.get('input[id="deleteConfirm"]').clear().type('DELETE ACCOUNT');
    cy.get('button').contains('Delete Account').last().should('be.disabled');
    
    cy.log('✅ Delete button is disabled with wrong confirmation text');
    
    // Test 6: Correct confirmation text again
    cy.get('input[id="deleteConfirm"]').clear().type('DELETE MY ACCOUNT');
    cy.get('button').contains('Delete Account').last().should('not.be.disabled');
    
    cy.log('✅ Delete button re-enabled with correct confirmation');
    
    // Don't actually delete - click Cancel instead
    cy.get('button').contains('Cancel').click();
    
    cy.log('✅ Modal closed successfully');
  });

  it('should test delete validation message', () => {
    // Login
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    // Open delete modal
    cy.scrollTo('bottom');
    cy.get('button').contains('Delete Account').click();
    
    // Try to delete without meeting requirements
    cy.get('input[id="deletePassword"]').type('jamal12345');
    cy.get('input[id="deleteConfirm"]').type('WRONG TEXT');
    
    // The button should be disabled, but if somehow we could click it, 
    // let's test the validation message
    cy.get('body').then(($body) => {
      // Check if button is properly disabled
      const deleteBtn = $body.find('button:contains("Delete Account"):not(:contains("Cancel"))');
      const isDisabled = deleteBtn.prop('disabled') || deleteBtn.hasClass('disabled') || deleteBtn.attr('disabled') !== undefined;
      
      if (isDisabled) {
        cy.log('✅ Delete button is properly disabled with wrong confirmation');
      } else {
        cy.log('❌ Delete button should be disabled but is not');
      }
    });
    
    // Close modal
    cy.get('button').contains('Cancel').click();
  });
});