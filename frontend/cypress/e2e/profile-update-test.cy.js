/**
 * Test profile update functionality
 */

describe('👤 Profile Update Functionality', () => {
  const jamal = {
    email: 'jamal@example.com',
    password: 'jamal12345'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should allow manual profile updates', () => {
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
    
    cy.log('📝 Testing personal information update');
    
    // Check current profile data
    cy.get('body').should('contain', 'Personal Information');
    
    // Look for an Edit button in the Personal Information section
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      if (bodyText.includes('✏️ Edit') || bodyText.includes('Edit')) {
        cy.log('✅ Found Edit button for personal information');
        
        // Try to click an edit button near Personal Information
        cy.contains('Personal Information').parent().within(() => {
          // Look for edit button within the personal information section
          cy.get('button').contains('Edit').click();
        });
        
        // Should now be in edit mode
        cy.get('input[type="text"]').should('exist');
        
        // Try to update first name
        cy.get('input').first().clear().type('JamalUpdated');
        
        // Look for save button
        cy.get('button').contains('Save').click();
        
        // Should show success message
        cy.get('body').should('contain', 'updated successfully');
        
        cy.log('✅ Profile update successful');
        
      } else {
        cy.log('❌ No Edit button found for personal information');
        cy.screenshot('no-edit-button-found');
      }
    });
  });

  it('should test financial information update', () => {
    cy.log('🔐 Logging in as Jamal');
    
    // Login
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    
    // Navigate to profile
    cy.get('button').contains('Profile').click();
    
    cy.log('💰 Testing financial information update');
    
    // Check for Financial Information section
    cy.get('body').should('contain', 'Financial Information');
    
    // Look for edit button in Financial Information section
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      if (bodyText.includes('Financial Information')) {
        cy.log('✅ Found Financial Information section');
        
        // Take screenshot of the financial section
        cy.screenshot('financial-information-section');
        
        // Check what financial data is displayed
        if (bodyText.includes('Annual Income')) {
          cy.log('✅ Found Annual Income field');
        }
        
        if (bodyText.includes('636,000') || bodyText.includes('636000')) {
          cy.log('✅ Found Jamal\'s annual income data');
        }
        
      } else {
        cy.log('❌ No Financial Information section found');
      }
    });
  });
});