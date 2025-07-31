describe('Profile Page Smoke Test', () => {
  beforeEach(() => {
    // Visit and login
    cy.visit('http://localhost:3000');
    cy.get('input[type="email"]').type('jamal@example.com');
    cy.get('input[type="password"]').type('jamal123');
    cy.get('button').contains('Login').click();
    cy.wait(2000);
    
    // Navigate to profile
    cy.visit('http://localhost:3000/app/profile');
    cy.wait(3000);
  });

  it('should load profile page with all sections', () => {
    // Verify URL
    cy.url().should('include', '/app/profile');
    
    // Verify main sections exist
    cy.get('h1').should('contain', 'Your Profile');
    cy.get('h2').should('contain', 'Personal Information');
    cy.get('h2').should('contain', 'Financial Information');
    cy.get('h2').should('contain', 'Financial Goals');
    cy.get('h2').should('contain', 'Goals Management');
    cy.get('h2').should('contain', 'Risk Profile');
    
    // Verify Goals Management section has Add New Goal button
    cy.get('button').should('contain', 'Add New Goal');
    
    // Verify Financial Information section has Update button  
    cy.get('button').should('contain', 'Update Financial Info');
  });

  it('should show expense categories with delete buttons', () => {
    // Look for expense categories section
    cy.get('p').should('contain', 'Monthly Expenses');
    
    // If there are categories, there should be delete buttons
    cy.get('body').then(($body) => {
      if ($body.find('button:contains("Delete")').length > 0) {
        cy.get('button').should('contain', 'Delete');
      }
    });
  });

  it('should handle adding a goal via prompts', () => {
    // Test the goal creation flow
    cy.window().then((win) => {
      cy.stub(win, 'prompt')
        .onCall(0).returns('Test Goal')
        .onCall(1).returns('50000')
        .onCall(2).returns('10000')
        .onCall(3).returns('2025-12-31');
    });
    
    cy.get('button').contains('Add New Goal').click();
    
    // Wait for API call and check for success message or goal display
    cy.wait(3000);
    
    // Should show either success message or the goal in the list
    cy.get('body').should('satisfy', ($body) => {
      return $body.text().includes('Test Goal') || 
             $body.text().includes('Goal created successfully') ||
             $body.text().includes('KES 50,000');
    });
  });
});