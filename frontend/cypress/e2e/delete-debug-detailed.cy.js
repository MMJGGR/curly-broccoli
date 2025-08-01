/**
 * Detailed debugging of delete account functionality
 */

describe('🔍 Delete Account Debug', () => {
  const jamal = {
    email: 'jamal@example.com',
    password: 'jamal12345'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should debug delete account step by step', () => {
    // Login
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    // Scroll to delete button
    cy.scrollTo('bottom');
    cy.wait(2000);
    
    // Take screenshot of profile page
    cy.screenshot('profile-page-with-delete-button');
    
    // Click main delete button to open modal
    cy.get('button').contains('Delete Account').click();
    
    // Wait for modal to appear
    cy.wait(2000);
    cy.screenshot('delete-modal-opened');
    
    // Check initial state - both fields should be empty
    cy.get('input[id="deletePassword"]').should('have.value', '');
    cy.get('input[id="deleteConfirm"]').should('have.value', '');
    
    // Get all delete account buttons and their states
    cy.get('button').contains('Delete Account').then(($buttons) => {
      cy.log(`Found ${$buttons.length} Delete Account buttons`);
      
      $buttons.each((index, button) => {
        const isDisabled = button.disabled;
        const classes = button.className;
        cy.log(`Button ${index + 1}: disabled=${isDisabled}, classes="${classes}"`);
      });
    });
    
    // Step 1: Enter only password
    cy.log('🔑 Step 1: Entering password only');
    cy.get('input[id="deletePassword"]').type('jamal12345');
    cy.wait(1000);
    cy.screenshot('after-password-entered');
    
    // Check button state after password
    cy.get('button').contains('Delete Account').then(($buttons) => {
      const modalButton = $buttons.last()[0];
      cy.log(`After password - Button disabled: ${modalButton.disabled}`);
      cy.log(`After password - Button classes: "${modalButton.className}"`);
    });
    
    // Step 2: Enter confirmation text
    cy.log('✅ Step 2: Entering confirmation text');
    cy.get('input[id="deleteConfirm"]').type('DELETE MY ACCOUNT');
    cy.wait(1000);
    cy.screenshot('after-both-fields-entered');
    
    // Check final button state
    cy.get('button').contains('Delete Account').then(($buttons) => {
      const modalButton = $buttons.last()[0];
      cy.log(`After both fields - Button disabled: ${modalButton.disabled}`);
      cy.log(`After both fields - Button classes: "${modalButton.className}"`);
      
      // Check if button appears clickable
      if (!modalButton.disabled && !modalButton.className.includes('cursor-not-allowed')) {
        cy.log('✅ Button appears to be enabled and clickable');
      } else {
        cy.log('❌ Button still appears disabled');
      }
    });
    
    // Don't actually click delete - click cancel
    cy.get('button').contains('Cancel').click();
  });

  it('should check onboarding data persistence', () => {
    // Login
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    cy.log('📊 Checking what profile data is displayed');
    
    // Take screenshot of full profile
    cy.screenshot('full-profile-data');
    
    // Check what personal information is shown
    cy.get('body').then(($body) => {
      const text = $body.text();
      
      // Log what we find
      if (text.includes('Jamal')) {
        cy.log('✅ Found first name: Jamal');
      } else {
        cy.log('❌ First name not found');
      }
      
      if (text.includes('Mwangi')) {
        cy.log('✅ Found last name: Mwangi');
      } else {
        cy.log('❌ Last name not found');
      }
      
      // Check for annual income - could be in different formats
      if (text.includes('636,000') || text.includes('636000') || text.includes('600,000') || text.includes('600000')) {
        cy.log('✅ Found annual income data');
      } else {
        cy.log('❌ Annual income not found or in unexpected format');
        // Log a sample of what we do see
        const personalSection = text.substring(text.indexOf('Personal Information'), text.indexOf('Personal Information') + 500);
        cy.log(`Personal Information section: ${personalSection}`);
      }
    });
  });
});