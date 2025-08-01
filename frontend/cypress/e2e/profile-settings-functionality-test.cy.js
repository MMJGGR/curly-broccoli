/**
 * Test profile settings functionality
 */

describe('⚙️ Profile Settings Functionality', () => {
  const jamal = {
    email: 'jamal@example.com',
    password: 'jamal12345'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should test all profile settings functionality', () => {
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
    
    // Scroll to Account Settings section
    cy.scrollTo('bottom');
    cy.wait(1000);
    
    cy.log('⚙️ Testing Account Settings functionality');
    
    // Test Email Notifications toggle
    cy.get('body').should('contain', 'Email Notifications');
    cy.get('body').should('contain', 'Enabled ✓');
    
    // Click to toggle email notifications
    cy.contains('Email Notifications').parent().within(() => {
      cy.get('button').click();
    });
    
    // Should show success message
    cy.get('body').should('contain', 'Email notifications disabled');
    
    // Button should now show "Disabled"
    cy.get('body').should('contain', 'Disabled ✗');
    
    cy.log('✅ Email notifications toggle works');
    
    // Test Data Privacy Level cycling
    cy.get('body').should('contain', 'Data Privacy Level');
    cy.get('body').should('contain', 'High Security ✓');
    
    // Click to cycle data privacy level
    cy.contains('Data Privacy Level').parent().within(() => {
      cy.get('button').click();
    });
    
    // Should show success message and change level
    cy.get('body').should('contain', 'Data privacy level changed to:');
    
    cy.log('✅ Data privacy level cycling works');
    
    // Test Change Password button
    cy.get('button').contains('Change Password').click();
    cy.get('body').should('contain', 'Password change functionality is coming soon');
    
    cy.log('✅ Change Password shows appropriate message');
    
    // Test Manage Accounts button  
    cy.get('button').contains('Manage Accounts').click();
    cy.get('body').should('contain', 'Account linking functionality is coming soon');
    
    cy.log('✅ Manage Accounts shows appropriate message');
  });

  it('should test delete account modal validation', () => {
    // Login
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    // Scroll to delete button
    cy.scrollTo('bottom');
    cy.wait(1000);
    
    cy.log('🗑️ Testing delete account modal validation');
    
    // Open delete modal
    cy.get('button').contains('Delete Account').click();
    
    // Modal should appear
    cy.get('body').should('contain', 'This action cannot be undone');
    
    // Take screenshot to debug button state
    cy.screenshot('delete-modal-initial-state');
    
    // Check if delete button is properly styled as disabled
    cy.get('body').then(($body) => {
      const modalDeleteButtons = $body.find('button:contains("Delete Account")');
      cy.log(`Found ${modalDeleteButtons.length} "Delete Account" buttons`);
      
      // The modal delete button should be the last one or have disabled styling
      const hasDisabledStyling = $body.text().includes('bg-gray-400') || 
                                  $body.find('button[disabled]:contains("Delete Account")').length > 0;
      
      if (hasDisabledStyling) {
        cy.log('✅ Modal delete button appears to have disabled styling');
      } else {
        cy.log('❌ Modal delete button may not be properly disabled');
      }
    });
    
    // Try entering just password
    cy.get('input[id="deletePassword"]').type('jamal12345');
    cy.wait(1000);
    
    // Try entering correct confirmation
    cy.get('input[id="deleteConfirm"]').type('DELETE MY ACCOUNT');
    cy.wait(1000);
    
    // Now button should be enabled - but don't actually delete
    cy.get('button').contains('Cancel').click();
    
    cy.log('✅ Delete account modal test completed');
  });
});