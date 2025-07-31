describe('Improved Profile UI Tests', () => {
  beforeEach(() => {
    // Login as Jamal
    cy.visit('http://localhost:3000');
    cy.get('input[type="email"]').clear().type('jamal@example.com');
    cy.get('input[type="password"]').clear().type('jamal123');
    cy.get('button').contains('Login').click();
    cy.wait(3000);
    
    // Navigate to profile
    cy.visit('http://localhost:3000/app/profile');
    cy.wait(5000);
  });

  describe('Consolidated Goals Management', () => {
    it('should have single Goals Management section (no duplicate Financial Goals)', () => {
      // Should only have one goals section
      cy.get('h2').contains('Goals Management').should('exist');
      
      // Should NOT have the old Financial Goals section
      cy.get('h2').contains('Financial Goals').should('not.exist');
      
      // Should have Add New Goal button
      cy.get('button').contains('Add New Goal').should('be.visible');
    });

    it('should open proper goal creation modal instead of browser prompts', () => {
      // Click Add New Goal
      cy.get('button').contains('Add New Goal').click();
      
      // Modal should appear
      cy.get('[class*="fixed inset-0"]').should('be.visible');
      cy.get('h3').contains('Create New Goal').should('be.visible');
      
      // Should have proper form fields
      cy.get('input[placeholder*="Emergency Fund"]').should('be.visible');
      cy.get('input[placeholder="100000"]').should('be.visible');
      cy.get('input[placeholder="25000"]').should('be.visible');
      cy.get('input[type="date"]').should('be.visible');
      
      // Should have progress preview
      cy.get('div').contains('Progress Preview').should('not.exist'); // Initially hidden
      
      // Fill out form
      cy.get('input[placeholder*="Emergency Fund"]').type('Emergency Fund Test');
      cy.get('input[placeholder="100000"]').type('150000');
      cy.get('input[placeholder="25000"]').type('37500');
      
      // Progress preview should now appear
      cy.get('div').contains('Progress Preview').should('be.visible');
      cy.get('div').contains('25.0%').should('be.visible');
      
      // Create button should be enabled
      cy.get('button').contains('Create Goal').should('not.be.disabled');
      
      // Cancel button should work
      cy.get('button').contains('Cancel').click();
      cy.get('[class*="fixed inset-0"]').should('not.exist');
    });

    it('should create goal via modal form', () => {
      // Open modal
      cy.get('button').contains('Add New Goal').click();
      
      // Fill form
      cy.get('input[placeholder*="Emergency Fund"]').type('Modal Test Goal');
      cy.get('input[placeholder="100000"]').type('200000');
      cy.get('input[placeholder="25000"]').type('50000');
      cy.get('input[type="date"]').type('2025-12-31');
      
      // Create goal
      cy.get('button').contains('Create Goal').click();
      
      // Modal should close
      cy.get('[class*="fixed inset-0"]').should('not.exist');
      
      // Goal should appear
      cy.wait(3000);
      cy.get('div').contains('Modal Test Goal').should('be.visible');
      cy.get('div').contains('KES 200,000').should('be.visible');
      cy.get('div').contains('25.0%').should('be.visible');
    });

    it('should edit existing goal via modal', () => {
      // First create a goal
      cy.get('button').contains('Add New Goal').click();
      cy.get('input[placeholder*="Emergency Fund"]').type('Goal to Edit');
      cy.get('input[placeholder="100000"]').type('100000');
      cy.get('input[placeholder="25000"]').type('25000');
      cy.get('button').contains('Create Goal').click();
      cy.wait(3000);
      
      // Click Edit button
      cy.contains('Goal to Edit').parent().parent().within(() => {
        cy.get('button').contains('Edit').click();
      });
      
      // Modal should open with existing data
      cy.get('h3').contains('Edit Goal').should('be.visible');
      cy.get('input[value="Goal to Edit"]').should('exist');
      cy.get('input[value="100000"]').should('exist');
      cy.get('input[value="25000"]').should('exist');
      
      // Edit the goal
      cy.get('input[value="Goal to Edit"]').clear().type('Edited Goal Name');
      cy.get('input[value="100000"]').clear().type('120000');
      
      // Update goal
      cy.get('button').contains('Update Goal').click();
      
      // Modal should close and changes should appear
      cy.wait(3000);
      cy.get('div').contains('Edited Goal Name').should('be.visible');
      cy.get('div').contains('KES 120,000').should('be.visible');
    });
  });

  describe('Improved Account Settings', () => {
    it('should have proper account settings instead of wireframe placeholders', () => {
      // Scroll to Account Settings
      cy.scrollTo('bottom');
      
      // Should have proper settings display
      cy.get('div').contains('Email Notifications').should('be.visible');
      cy.get('button').contains('Enabled ✓').should('be.visible');
      
      cy.get('div').contains('Data Privacy Level').should('be.visible');
      cy.get('button').contains('High Security ✓').should('be.visible');
      
      cy.get('div').contains('Linked Accounts').should('be.visible');
      cy.get('button').contains('Manage Accounts →').should('be.visible');
      
      // Should NOT have wireframe messages
      cy.get('div').should('not.contain', 'This is a wireframe action');
    });

    it('should handle account management navigation', () => {
      cy.scrollTo('bottom');
      
      // Click Manage Accounts should navigate
      cy.get('button').contains('Manage Accounts →').click();
      
      // Should navigate to accounts page (or show appropriate message)
      cy.url().should('include', '/app/accounts');
    });
  });

  describe('Risk Assessment Navigation', () => {
    it('should navigate to risk questionnaire instead of showing alert', () => {
      // Find Retake Risk Assessment button
      cy.get('button').contains('Retake Risk Assessment').should('be.visible');
      
      // Click should navigate, not show alert
      cy.get('button').contains('Retake Risk Assessment').click();
      
      // Should navigate to risk questionnaire
      cy.url().should('include', '/risk-questionnaire');
    });
  });

  describe('Overall UX Improvements', () => {
    it('should have no browser prompts or alerts when interacting with goals', () => {
      // Mock window.prompt to ensure it's not called
      cy.window().then((win) => {
        cy.stub(win, 'prompt').as('promptStub');
        cy.stub(win, 'alert').as('alertStub');
      });
      
      // Interact with goals
      cy.get('button').contains('Add New Goal').click();
      cy.get('button').contains('Cancel').click();
      
      // Ensure no browser prompts were used
      cy.get('@promptStub').should('not.have.been.called');
      cy.get('@alertStub').should('not.have.been.called');
    });

    it('should have consistent button styling and hover effects', () => {
      // Check various buttons have proper classes
      cy.get('button').contains('Add New Goal')
        .should('have.class', 'bg-green-500')
        .should('have.class', 'hover:bg-green-600');
      
      cy.get('button').contains('Update Financial Info')
        .should('have.class', 'text-blue-600')
        .should('have.class', 'hover:text-blue-800');
      
      cy.get('button').contains('Logout')
        .should('have.class', 'bg-red-500')
        .should('have.class', 'hover:bg-red-600');
    });

    it('should show proper loading and success states', () => {
      // Test goal creation success message
      cy.get('button').contains('Add New Goal').click();
      cy.get('input[placeholder*="Emergency Fund"]').type('Success Test Goal');
      cy.get('input[placeholder="100000"]').type('50000');
      cy.get('input[placeholder="25000"]').type('12500');
      cy.get('button').contains('Create Goal').click();
      
      // Should show success message
      cy.wait(2000);
      cy.get('div').contains('Goal created successfully').should('be.visible');
    });
  });

  describe('Form Validation and User Experience', () => {
    it('should validate goal form inputs', () => {
      cy.get('button').contains('Add New Goal').click();
      
      // Create Goal button should be disabled initially
      cy.get('button').contains('Create Goal').should('be.disabled');
      
      // Fill only name
      cy.get('input[placeholder*="Emergency Fund"]').type('Test Goal');
      cy.get('button').contains('Create Goal').should('be.disabled');
      
      // Fill target
      cy.get('input[placeholder="100000"]').type('100000');
      cy.get('button').contains('Create Goal').should('be.disabled');
      
      // Fill current - now should be enabled
      cy.get('input[placeholder="25000"]').type('25000');
      cy.get('button').contains('Create Goal').should('not.be.disabled');
    });

    it('should handle large amounts with proper formatting', () => {
      cy.get('button').contains('Add New Goal').click();
      
      cy.get('input[placeholder*="Emergency Fund"]').type('Large Goal');
      cy.get('input[placeholder="100000"]').type('5000000');
      cy.get('input[placeholder="25000"]').type('1250000');
      
      // Should show formatted amounts in preview
      cy.get('div').contains('KES 5,000,000').should('be.visible');
      cy.get('div').contains('KES 1,250,000').should('be.visible');
      cy.get('div').contains('25.0%').should('be.visible');
    });
  });
});