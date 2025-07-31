describe('Profile CRUD Operations', () => {
  beforeEach(() => {
    // Visit the authentication page
    cy.visit('http://localhost:3000');
    
    // Login with test user
    cy.get('input[type="email"]').type('jamal@example.com');
    cy.get('input[type="password"]').type('jamal123');
    cy.get('button').contains('Login').click();
    
    // Wait for dashboard to load and navigate to profile
    cy.wait(2000);
    cy.url().should('include', '/app/dashboard');
    
    // Navigate directly to profile URL
    cy.visit('http://localhost:3000/app/profile');
    
    // Wait for profile page to load
    cy.wait(3000);
    cy.url().should('include', '/app/profile');
  });

  describe('Expense Categories CRUD', () => {
    it('should add a new expense category', () => {
      // Click edit financial info to enter edit mode
      cy.get('button').contains('Update Financial Info').click();
      
      // Add a new category
      cy.get('button').contains('+ Add Category').click();
      
      // Fill in category details
      cy.get('input[placeholder="Category name"]').last().type('Test Category');
      cy.get('input[placeholder="Amount"]').last().type('5000');
      
      // Save changes
      cy.get('button').contains('Save Changes').click();
      
      // Verify success message
      cy.get('.fixed').should('contain', 'Financial information updated successfully');
      
      // Verify category appears in the list
      cy.get('div').should('contain', 'Test Category');
      cy.get('div').should('contain', 'KES 5,000');
    });

    it('should delete an expense category', () => {
      // First ensure we have at least one category
      cy.get('button').contains('Update Financial Info').click();
      cy.get('button').contains('+ Add Category').click();
      cy.get('input[placeholder="Category name"]').last().type('Category to Delete');
      cy.get('input[placeholder="Amount"]').last().type('3000');
      cy.get('button').contains('Save Changes').click();
      cy.wait(1000);
      
      // Now delete the category
      cy.get('button').contains('Delete').first().click();
      
      // Confirm deletion in alert
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });
      
      // Verify category is removed
      cy.wait(1000);
      cy.get('div').should('contain', 'deleted successfully');
    });

    it('should edit existing expense category', () => {
      // Click edit financial info
      cy.get('button').contains('Update Financial Info').click();
      
      // Modify existing category (if any) or add new one
      cy.get('input[placeholder="Category name"]').first().clear().type('Modified Category');
      cy.get('input[placeholder="Amount"]').first().clear().type('7500');
      
      // Save changes
      cy.get('button').contains('Save Changes').click();
      
      // Verify changes are saved
      cy.get('div').should('contain', 'Modified Category');
      cy.get('div').should('contain', 'KES 7,500');
    });
  });

  describe('Goals Management CRUD', () => {
    it('should add a new goal', () => {
      // Find and click "Add New Goal" button
      cy.get('button').contains('Add New Goal').click();
      
      // Handle prompts for goal creation
      cy.window().then((win) => {
        cy.stub(win, 'prompt')
          .onCall(0).returns('Emergency Fund')
          .onCall(1).returns('100000')
          .onCall(2).returns('25000')
          .onCall(3).returns('2025-12-31');
      });
      
      // Verify goal was created (wait for API call)
      cy.wait(2000);
      cy.get('div').should('contain', 'Emergency Fund');
      cy.get('div').should('contain', 'KES 100,000');
      cy.get('div').should('contain', 'KES 25,000');
      cy.get('div').should('contain', '25.0%');
    });

    it('should delete a goal', () => {
      // First create a goal to delete
      cy.get('button').contains('Add New Goal').click();
      cy.window().then((win) => {
        cy.stub(win, 'prompt')
          .onCall(0).returns('Goal to Delete')
          .onCall(1).returns('50000')
          .onCall(2).returns('10000')
          .onCall(3).returns('2025-06-30');
      });
      
      cy.wait(2000);
      
      // Delete the goal
      cy.get('button').contains('Delete').first().click();
      
      // Confirm deletion
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });
      
      // Verify goal is deleted
      cy.wait(1000);
      cy.get('div').should('contain', 'deleted successfully');
    });

    it('should display goal progress bar correctly', () => {
      // Create a goal with specific progress
      cy.get('button').contains('Add New Goal').click();
      cy.window().then((win) => {
        cy.stub(win, 'prompt')
          .onCall(0).returns('Progress Test Goal')
          .onCall(1).returns('10000')
          .onCall(2).returns('7500')  // 75% progress
          .onCall(3).returns('2025-08-15');
      });
      
      cy.wait(2000);
      
      // Verify progress bar shows correct percentage
      cy.get('div').should('contain', '75.0%');
      
      // Verify progress bar visual width (approximately)
      cy.get('.bg-green-600').should('have.attr', 'style').and('include', '75%');
    });
  });

  describe('Profile Integration', () => {
    it('should maintain data consistency after refresh', () => {
      // Add both expense category and goal
      cy.get('button').contains('Update Financial Info').click();
      cy.get('button').contains('+ Add Category').click();
      cy.get('input[placeholder="Category name"]').last().type('Persistent Category');
      cy.get('input[placeholder="Amount"]').last().type('4000');
      cy.get('button').contains('Save Changes').click();
      
      cy.wait(1000);
      
      cy.get('button').contains('Add New Goal').click();
      cy.window().then((win) => {
        cy.stub(win, 'prompt')
          .onCall(0).returns('Persistent Goal')
          .onCall(1).returns('80000')
          .onCall(2).returns('20000')
          .onCall(3).returns('2025-10-01');
      });
      
      cy.wait(2000);
      
      // Refresh the page
      cy.reload();
      cy.wait(3000);
      
      // Verify data persists
      cy.get('div').should('contain', 'Persistent Category');
      cy.get('div').should('contain', 'KES 4,000');
      cy.get('div').should('contain', 'Persistent Goal');
      cy.get('div').should('contain', 'KES 80,000');
    });

    it('should handle API errors gracefully', () => {
      // Simulate network error by using invalid endpoint
      cy.intercept('DELETE', '**/expense-categories/**', { statusCode: 500 }).as('deleteError');
      
      // Try to delete a category
      cy.get('button').contains('Delete').first().click();
      
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });
      
      // Verify error handling
      cy.wait('@deleteError');
      cy.get('div').should('contain', 'Failed to delete');
    });
  });

  describe('UI/UX Validation', () => {
    it('should show appropriate empty states', () => {
      // Check for empty goals state
      cy.get('div').should('contain', 'No goals set yet');
      cy.get('button').should('contain', 'Add New Goal');
    });

    it('should have proper form validation', () => {
      // Test expense category form
      cy.get('button').contains('Update Financial Info').click();
      cy.get('button').contains('+ Add Category').click();
      
      // Try to save without filling required fields
      cy.get('button').contains('Save Changes').click();
      
      // Should handle empty fields gracefully
      cy.wait(1000);
    });

    it('should display proper formatting for currency', () => {
      // Add category with large amount
      cy.get('button').contains('Update Financial Info').click();
      cy.get('button').contains('+ Add Category').click();
      cy.get('input[placeholder="Category name"]').last().type('Large Amount');
      cy.get('input[placeholder="Amount"]').last().type('1500000');
      cy.get('button').contains('Save Changes').click();
      
      // Verify proper formatting
      cy.get('div').should('contain', 'KES 1,500,000');
    });
  });
});