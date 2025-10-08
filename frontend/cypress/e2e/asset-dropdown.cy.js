describe('Asset Dropdown Functionality', () => {
  it('should load the application', () => {
    cy.visit('http://localhost:3000', { timeout: 15000 });
    cy.get('body').should('be.visible');
  });

  it('should allow asset type selection from dropdown', () => {
    cy.visit('http://localhost:3000', { timeout: 15000 });
    
    // Try to find login form
    cy.get('input[type="email"], input[name="email"], input[placeholder*="email"], input[id="email"]', { timeout: 10000 })
      .type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"], input[name="password"], input[placeholder*="password"], input[id="password"]')
      .type('jaggerthee');
    cy.get('button[type="submit"], button').contains(/login|sign|enter/i).click();
    
    // Wait for login - be more flexible about the URL
    cy.wait(3000);
    cy.url().should('not.contain', 'login');
    
    // Try to navigate to tools/assets
    // Navigate to Tools/Assets page
    cy.contains('Tools').click();
    cy.wait(1000);
    
    // Find and click Add Asset button
    cy.get('[data-testid="add-asset-button"]').should('be.visible').click();
    
    // Check if the asset form is visible
    cy.get('[data-testid="asset-form"]').should('be.visible');
    
    // Test the asset type dropdown
    cy.get('[data-testid="asset-type-select"]').should('be.visible');
    
    // For native HTML select, we can directly select by value
    cy.get('[data-testid="asset-type-select"]').select('real_estate');
    
    // Verify the selection was made
    cy.get('[data-testid="asset-type-select"]').should('have.value', 'real_estate');
    
    // Fill in other required fields to test complete form
    cy.get('[data-testid="asset-name-input"]').type('Test Property');
    cy.get('[data-testid="current-value-input"]').type('1000000');
    
    // The form should now be submittable (no validation errors)
    cy.get('[data-testid="submit-asset"]').should('not.be.disabled');
  });

  it('should show all asset type options', () => {
    // Navigate to add asset form
    cy.contains('Tools').click();
    cy.get('[data-testid="add-asset-button"]').click();
    
    // Check that all expected asset types are available
    const expectedTypes = [
      'real_estate',
      'vehicle', 
      'business',
      'investment_account',
      'savings_account',
      'equipment',
      'collectibles',
      'other'
    ];
    
    // For each expected type, verify the option exists
    expectedTypes.forEach(type => {
      cy.get('[data-testid="asset-type-select"]').should('contain.html', `value="${type}"`);
    });
  });

  it('should create an asset successfully', () => {
    // Navigate to add asset form
    cy.contains('Tools').click();
    cy.get('[data-testid="add-asset-button"]').click();
    
    // Fill out the complete form
    cy.get('[data-testid="asset-name-input"]').type('Cypress Test Asset');
    cy.get('[data-testid="asset-type-select"]').select('real_estate');
    cy.get('[data-testid="current-value-input"]').type('2000000');
    
    // Submit the form
    cy.get('[data-testid="submit-asset"]').click();
    
    // Verify success (form should close and asset should appear in list)
    cy.get('[data-testid="asset-form"]').should('not.exist');
    cy.contains('Cypress Test Asset').should('be.visible');
  });
});