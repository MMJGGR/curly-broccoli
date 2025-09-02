/**
 * Cypress E2E Tests for Income Management - KISS Asset Linking
 * Tests Richard's specific user flows with real UI interactions
 */

describe('Income Management - KISS Asset Linking', () => {
  beforeEach(() => {
    // Login as Richard
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('richard.mmacharia@gmail.com');
    cy.get('[data-testid="password-input"]').type('password123');
    cy.get('[data-testid="login-button"]').click();
    
    // Wait for authentication
    cy.url().should('include', '/app');
    
    // Navigate to Tools section
    cy.visit('/app/tools');
    cy.wait(2000); // Allow for component loading
  });

  describe('Income Dashboard Display', () => {
    it('should display income analysis summary cards', () => {
      // Navigate to Income Management
      cy.get('[data-testid="income-management-section"]').click();
      
      // Check analysis cards are displayed
      cy.get('[data-testid="monthly-income-card"]').should('be.visible');
      cy.get('[data-testid="stability-score-card"]').should('be.visible');
      cy.get('[data-testid="asset-linked-card"]').should('be.visible');
      cy.get('[data-testid="diversification-card"]').should('be.visible');
      
      // Verify Richard's salary is displayed if it exists
      cy.get('[data-testid="income-list"]').should('be.visible');
    });

    it('should show existing income sources with proper formatting', () => {
      cy.get('[data-testid="income-management-section"]').click();
      
      // Check if income sources are displayed with badges
      cy.get('[data-testid="income-item"]').then(($items) => {
        if ($items.length > 0) {
          // Verify income item structure
          cy.get($items.first()).within(() => {
            cy.get('[data-testid="income-description"]').should('be.visible');
            cy.get('[data-testid="income-type-badge"]').should('be.visible');
            cy.get('[data-testid="monthly-amount"]').should('contain', 'KES');
            cy.get('[data-testid="annual-amount"]').should('contain', 'KES');
          });
        }
      });
    });
  });

  describe('Add Income - KISS Flow', () => {
    it('should add Richard\'s tech salary without asset linking', () => {
      cy.get('[data-testid="income-management-section"]').click();
      cy.get('[data-testid="add-income-button"]').click();
      
      // Fill basic income information
      cy.get('[data-testid="income-description"]').type('Software Developer Salary - Tech Startup');
      cy.get('[data-testid="income-amount"]').type('324759');
      
      // Select salary type
      cy.get('[data-testid="income-type-select"]').click();
      cy.get('[data-value="salary"]').click();
      
      // Keep frequency as monthly (default)
      cy.get('[data-testid="frequency-select"]').should('contain', 'Monthly');
      
      // No asset linking for salary
      cy.get('[data-testid="asset-link-section"]').should('be.visible');
      cy.get('[data-testid="asset-link-select"]').should('contain', 'No asset link');
      
      // Submit form
      cy.get('[data-testid="submit-income"]').click();
      
      // Verify success
      cy.get('[data-testid="income-list"]').should('contain', 'Software Developer Salary');
      cy.get('[data-testid="monthly-income-card"]').should('contain', '324,759');
    });

    it('should add rental income with asset linking', () => {
      cy.get('[data-testid="income-management-section"]').click();
      cy.get('[data-testid="add-income-button"]').click();
      
      // Fill rental income details
      cy.get('[data-testid="income-description"]').type('Rental Income - Kileleshwa Property');
      cy.get('[data-testid="income-amount"]').type('45000');
      
      // Select rental income type
      cy.get('[data-testid="income-type-select"]').click();
      cy.get('[data-value="rental_income"]').click();
      
      // KISS Asset Linking Flow
      cy.get('[data-testid="asset-link-section"]').should('be.visible');
      
      // Check if assets are available for linking
      cy.get('[data-testid="asset-link-select"]').click();
      cy.get('[data-testid="asset-options"]').then(($options) => {
        if ($options.find('[data-value]').length > 1) {
          // Assets available - select first real estate asset
          cy.get('[data-value]').contains('real_estate').first().click();
          
          // Select relationship type
          cy.get('[data-testid="relationship-type-select"]').click();
          cy.get('[data-value="rental"]').click();
        } else {
          // No assets available - user needs to create one first
          cy.get('[data-testid="no-assets-warning"]').should('be.visible');
          cy.get('[data-testid="create-asset-link"]').should('be.visible');
        }
      });
      
      // Submit form
      cy.get('[data-testid="submit-income"]').click();
      
      // Verify success
      cy.get('[data-testid="income-list"]').should('contain', 'Rental Income');
      cy.get('[data-testid="asset-linked-badge"]').should('be.visible');
    });

    it('should add salon business income with asset linking', () => {
      cy.get('[data-testid="income-management-section"]').click();
      cy.get('[data-testid="add-income-button"]').click();
      
      // Fill business income details
      cy.get('[data-testid="income-description"]').type('Mama Lucy\'s Hair Salon Revenue');
      cy.get('[data-testid="income-amount"]').type('180000');
      
      // Select business income type
      cy.get('[data-testid="income-type-select"]').click();
      cy.get('[data-value="business_income"]').click();
      
      // KISS Asset Linking for Business
      cy.get('[data-testid="asset-link-select"]').click();
      
      // Look for business asset or create note
      cy.get('body').then(($body) => {
        if ($body.find('[data-value*="business"]').length > 0) {
          cy.get('[data-value*="business"]').first().click();
          cy.get('[data-testid="relationship-type-select"]').click();
          cy.get('[data-value="business_operations"]').click();
        }
      });
      
      // Add notes about business phase
      cy.get('[data-testid="income-notes"]').type('Currently in growth phase, funding operational deficit');
      
      // Submit
      cy.get('[data-testid="submit-income"]').click();
      
      // Verify
      cy.get('[data-testid="income-list"]').should('contain', 'Salon Revenue');
    });
  });

  describe('Edit Income with Asset Linking', () => {
    it('should edit existing income and add asset link', () => {
      cy.get('[data-testid="income-management-section"]').click();
      
      // Find first income item and edit
      cy.get('[data-testid="income-item"]').first().within(() => {
        cy.get('[data-testid="edit-income-button"]').click();
      });
      
      // Modify description
      cy.get('[data-testid="income-description"]').clear().type('Updated Income Description');
      
      // Add or change asset link
      cy.get('[data-testid="asset-link-select"]').click();
      cy.get('[data-testid="asset-options"] [data-value]').then(($options) => {
        if ($options.length > 1) {
          // Select an asset
          cy.get($options[1]).click();
          
          // Set relationship type
          cy.get('[data-testid="relationship-type-select"]').click();
          cy.get('[data-value="investment_return"]').click();
        }
      });
      
      // Update
      cy.get('[data-testid="submit-income"]').click();
      
      // Verify update
      cy.get('[data-testid="income-list"]').should('contain', 'Updated Income Description');
    });
  });

  describe('Income Analysis Validation', () => {
    it('should show accurate income analysis after adding multiple sources', () => {
      cy.get('[data-testid="income-management-section"]').click();
      
      // Add multiple income sources to test analysis
      const incomes = [
        { desc: 'Salary', amount: '300000', type: 'salary' },
        { desc: 'Rental', amount: '45000', type: 'rental_income' },
        { desc: 'Consulting', amount: '50000', type: 'consulting' }
      ];
      
      incomes.forEach((income, index) => {
        cy.get('[data-testid="add-income-button"]').click();
        cy.get('[data-testid="income-description"]').type(income.desc);
        cy.get('[data-testid="income-amount"]').type(income.amount);
        cy.get('[data-testid="income-type-select"]').click();
        cy.get(`[data-value="${income.type}"]`).click();
        cy.get('[data-testid="submit-income"]').click();
        cy.wait(1000); // Allow for processing
      });
      
      // Check analysis cards update
      cy.get('[data-testid="monthly-income-card"]').should('contain', '395,000');
      cy.get('[data-testid="diversification-card"]').should('not.contain', '0.0');
      
      // Verify income breakdown
      cy.get('[data-testid="employment-income"]').should('contain', '300,000');
      cy.get('[data-testid="investment-income"]').should('contain', '45,000');
    });

    it('should show stability scores for different income types', () => {
      cy.get('[data-testid="income-management-section"]').click();
      
      // Check that stability scores are displayed and make sense
      cy.get('[data-testid="income-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          cy.get('[data-testid="stability-score"]').should('be.visible');
          cy.get('[data-testid="stability-score"]').should('match', /\\d+(\\.\\d+)?/);
        });
      });
      
      // Overall stability score should be reasonable
      cy.get('[data-testid="stability-score-card"]').should('not.contain', '0.0');
    });
  });

  describe('Asset Options Integration', () => {
    it('should display available assets for linking', () => {
      cy.get('[data-testid="income-management-section"]').click();
      cy.get('[data-testid="add-income-button"]').click();
      
      // Check asset options dropdown
      cy.get('[data-testid="asset-link-select"]').click();
      cy.get('[data-testid="asset-options"]').should('be.visible');
      
      // Should always have "No asset link" option
      cy.get('[data-value=""]').should('contain', 'No asset link');
      
      // Check for asset creation link if no assets
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="no-assets-warning"]').length > 0) {
          cy.get('[data-testid="create-asset-link"]').should('be.visible');
          cy.get('[data-testid="create-asset-link"]').should('have.attr', 'href').and('include', 'balance-sheet');
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle form validation errors', () => {
      cy.get('[data-testid="income-management-section"]').click();
      cy.get('[data-testid="add-income-button"]').click();
      
      // Try to submit empty form
      cy.get('[data-testid="submit-income"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="income-description"]').should('have.attr', 'required');
      cy.get('[data-testid="income-amount"]').should('have.attr', 'required');
    });

    it('should handle API errors gracefully', () => {
      // Intercept API call and return error
      cy.intercept('POST', '/api/v1/income-v2/', {
        statusCode: 400,
        body: { detail: 'Invalid income data' }
      }).as('createIncomeError');
      
      cy.get('[data-testid="income-management-section"]').click();
      cy.get('[data-testid="add-income-button"]').click();
      
      // Fill form and submit
      cy.get('[data-testid="income-description"]').type('Test Income');
      cy.get('[data-testid="income-amount"]').type('100000');
      cy.get('[data-testid="submit-income"]').click();
      
      // Wait for API call
      cy.wait('@createIncomeError');
      
      // Should handle error gracefully (form should remain visible)
      cy.get('[data-testid="income-form"]').should('be.visible');
    });
  });

  describe('Richard Specific Test Flows', () => {
    it('should handle Richard\'s complete financial profile setup', () => {
      cy.get('[data-testid="income-management-section"]').click();
      
      // Test Richard's three main income sources
      const richardsIncomes = [
        {
          desc: 'Software Developer Salary - Tech Startup',
          amount: '324759',
          type: 'salary',
          notes: 'Primary employment income'
        },
        {
          desc: 'Rental Income - Kileleshwa Property',
          amount: '45000',
          type: 'rental_income',
          notes: 'Monthly rental from 4.5M property'
        },
        {
          desc: 'Mama Lucy Hair Salon Revenue',
          amount: '180000',
          type: 'business_income',
          notes: 'Business revenue (operational deficit currently)'
        }
      ];
      
      richardsIncomes.forEach((income) => {
        cy.get('[data-testid="add-income-button"]').click();
        cy.get('[data-testid="income-description"]').type(income.desc);
        cy.get('[data-testid="income-amount"]').type(income.amount);
        cy.get('[data-testid="income-type-select"]').click();
        cy.get(`[data-value="${income.type}"]`).click();
        
        if (income.notes) {
          cy.get('[data-testid="income-notes"]').type(income.notes);
        }
        
        cy.get('[data-testid="submit-income"]').click();
        cy.wait(1500); // Allow for processing
      });
      
      // Verify Richard's complete income profile
      cy.get('[data-testid="monthly-income-card"]').should('contain', '549,759'); // Total monthly
      cy.get('[data-testid="income-list"] [data-testid="income-item"]').should('have.length', 3);
      
      // Check diversification improved
      cy.get('[data-testid="diversification-card"]').should('not.contain', '0.0');
      
      // Verify stability score is reasonable mix
      cy.get('[data-testid="stability-score-card"]').invoke('text').then((text) => {
        const score = parseFloat(text.match(/([\\d.]+)/)[1]);
        expect(score).to.be.within(5.0, 8.0); // Mixed stability
      });
    });
  });

  describe('Cross-Component Integration Preview', () => {
    it('should show income data that will flow to other components', () => {
      cy.get('[data-testid="income-management-section"]').click();
      
      // Verify income analysis provides data for other components
      cy.get('[data-testid="monthly-income-card"]').invoke('text').then((monthlyText) => {
        const monthlyAmount = monthlyText.match(/([\\d,]+)/)[1];
        
        // This monthly income should flow to Budget component
        cy.log(`Monthly income ${monthlyAmount} will flow to Budget component`);
        
        // This should also update Balance Sheet human capital
        cy.log('Income data will update Balance Sheet human capital calculations');
      });
      
      // Check asset-linked income for Balance Sheet P&L integration
      cy.get('[data-testid="asset-linked-card"]').invoke('text').then((assetText) => {
        if (assetText.includes('KES') && !assetText.includes('0')) {
          cy.log('Asset-linked income will appear in Balance Sheet P&L');
        }
      });
    });
  });
});