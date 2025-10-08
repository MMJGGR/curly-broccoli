/**
 * Cypress E2E Tests for Expense Management - KISS Asset/Liability Linking
 * Tests Richard's specific expense flows with real UI interactions
 */

describe('Expense Management - KISS Asset/Liability Linking', () => {
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

  describe('Expense Dashboard Display', () => {
    it('should display expense analysis summary cards', () => {
      // Navigate to Expense Management
      cy.get('[data-testid="expense-management-section"]').click();
      
      // Check analysis cards are displayed
      cy.get('[data-testid="monthly-expenses-card"]').should('be.visible');
      cy.get('[data-testid="asset-related-card"]').should('be.visible');
      cy.get('[data-testid="liability-related-card"]').should('be.visible');
      cy.get('[data-testid="finite-expenses-card"]').should('be.visible');
      
      // Verify expense list is displayed
      cy.get('[data-testid="expense-list"]').should('be.visible');
    });

    it('should show existing expense sources with proper formatting', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      
      // Check if expense sources are displayed with badges
      cy.get('[data-testid="expense-item"]').then(($items) => {
        if ($items.length > 0) {
          // Verify expense item structure
          cy.get($items.first()).within(() => {
            cy.get('[data-testid="expense-description"]').should('be.visible');
            cy.get('[data-testid="expense-type-badge"]').should('be.visible');
            cy.get('[data-testid="monthly-amount"]').should('contain', 'KES');
            cy.get('[data-testid="annual-amount"]').should('contain', 'KES');
          });
        }
      });
    });
  });

  describe('Add Expense - KISS Flow', () => {
    it('should add Richard\'s car loan payment with liability linking', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      // Fill basic expense information
      cy.get('[data-testid="expense-description"]').type('Car Loan Payment - Toyota Prado');
      cy.get('[data-testid="expense-amount"]').type('33253');
      
      // Select debt payment type
      cy.get('[data-testid="expense-type-select"]').click();
      cy.get('[data-value="debt_payments"]').click();
      
      // Keep frequency as monthly (default)
      cy.get('[data-testid="frequency-select"]').should('contain', 'Monthly');
      
      // KISS Liability Linking Flow
      cy.get('[data-testid="liability-link-section"]').should('be.visible');
      
      // Check if liabilities are available for linking
      cy.get('[data-testid="liability-link-select"]').click();
      cy.get('[data-testid="liability-options"]').then(($options) => {
        if ($options.find('[data-value]').length > 1) {
          // Liabilities available - select first car loan
          cy.get('[data-value]').contains('loan').first().click();
          
          // Select relationship type
          cy.get('[data-testid="relationship-type-select"]').click();
          cy.get('[data-value="loan_payment"]').click();
        } else {
          // No liabilities available - user needs to create one first
          cy.get('[data-testid="no-liabilities-warning"]').should('be.visible');
          cy.get('[data-testid="create-liability-link"]').should('be.visible');
        }
      });
      
      // Mark as finite payment
      cy.get('[data-testid="finite-payment-checkbox"]').check();
      cy.get('[data-testid="payments-remaining"]').type('24');
      
      // Submit form
      cy.get('[data-testid="submit-expense"]').click();
      
      // Verify success
      cy.get('[data-testid="expense-list"]').should('contain', 'Car Loan Payment');
      cy.get('[data-testid="liability-related-card"]').should('contain', '33,253');
    });

    it('should add salon business operating expenses with asset linking', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      // Fill business expense details
      cy.get('[data-testid="expense-description"]').type('Mama Lucy\'s Salon - Operating Expenses');
      cy.get('[data-testid="expense-amount"]').type('220000');
      
      // Select business operating type
      cy.get('[data-testid="expense-type-select"]').click();
      cy.get('[data-value="business_operating"]').click();
      
      // KISS Asset Linking for Business Operations
      cy.get('[data-testid="asset-link-select"]').click();
      
      // Look for business asset or create note
      cy.get('body').then(($body) => {
        if ($body.find('[data-value*="business"]').length > 0) {
          cy.get('[data-value*="business"]').first().click();
          cy.get('[data-testid="relationship-type-select"]').click();
          cy.get('[data-value="business_operating"]').click();
        }
      });
      
      // Add notes about business operations
      cy.get('[data-testid="expense-notes"]').type('Monthly operational expenses for hair salon business');
      
      // Submit
      cy.get('[data-testid="submit-expense"]').click();
      
      // Verify
      cy.get('[data-testid="expense-list"]').should('contain', 'Salon - Operating');
      cy.get('[data-testid="asset-related-card"]').should('not.contain', '0');
    });

    it('should add property maintenance expense with asset linking', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      // Fill property maintenance details
      cy.get('[data-testid="expense-description"]').type('Kileleshwa Property - Maintenance & Repairs');
      cy.get('[data-testid="expense-amount"]').type('8000');
      
      // Select housing type
      cy.get('[data-testid="expense-type-select"]').click();
      cy.get('[data-value="housing"]').click();
      
      // KISS Asset Linking for Property
      cy.get('[data-testid="asset-link-section"]').should('be.visible');
      cy.get('[data-testid="asset-link-select"]').click();
      
      // Look for real estate asset
      cy.get('body').then(($body) => {
        if ($body.find('[data-value]').contains('real_estate').length > 0) {
          cy.get('[data-value]').contains('real_estate').first().click();
          cy.get('[data-testid="relationship-type-select"]').click();
          cy.get('[data-value="asset_maintenance"]').click();
        }
      });
      
      // Submit
      cy.get('[data-testid="submit-expense"]').click();
      
      // Verify
      cy.get('[data-testid="expense-list"]').should('contain', 'Property - Maintenance');
      cy.get('[data-testid="asset-linked-badge"]').should('be.visible');
    });

    it('should add personal living expenses without linking', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      // Fill personal expense details
      cy.get('[data-testid="expense-description"]').type('Personal Living Expenses');
      cy.get('[data-testid="expense-amount"]').type('80000');
      
      // Select other type
      cy.get('[data-testid="expense-type-select"]').click();
      cy.get('[data-value="other"]').click();
      
      // No asset/liability linking
      cy.get('[data-testid="asset-link-select"]').should('contain', 'No asset link');
      cy.get('[data-testid="liability-link-select"]').should('contain', 'No debt link');
      
      // Submit
      cy.get('[data-testid="submit-expense"]').click();
      
      // Verify
      cy.get('[data-testid="expense-list"]').should('contain', 'Personal Living');
      cy.get('[data-testid="monthly-expenses-card"]').should('not.contain', '0');
    });
  });

  describe('Edit Expense with Asset/Liability Linking', () => {
    it('should edit existing expense and add asset/liability link', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      
      // Find first expense item and edit
      cy.get('[data-testid="expense-item"]').first().within(() => {
        cy.get('[data-testid="edit-expense-button"]').click();
      });
      
      // Modify description
      cy.get('[data-testid="expense-description"]').clear().type('Updated Expense Description');
      
      // Add or change asset/liability link
      cy.get('[data-testid="asset-link-select"]').click();
      cy.get('[data-testid="asset-options"] [data-value]').then(($options) => {
        if ($options.length > 1) {
          // Select an asset
          cy.get($options[1]).click();
          
          // Set relationship type
          cy.get('[data-testid="relationship-type-select"]').click();
          cy.get('[data-value="asset_maintenance"]').click();
        }
      });
      
      // Update
      cy.get('[data-testid="submit-expense"]').click();
      
      // Verify update
      cy.get('[data-testid="expense-list"]').should('contain', 'Updated Expense Description');
    });
  });

  describe('Expense Analysis Validation', () => {
    it('should show accurate expense analysis after adding multiple expenses', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      
      // Add multiple expense sources to test analysis
      const expenses = [
        { desc: 'Monthly Rent', amount: '50000', type: 'housing' },
        { desc: 'Car Payment', amount: '33253', type: 'debt_payments', finite: true, payments: '24' },
        { desc: 'Groceries', amount: '25000', type: 'food_dining' }
      ];
      
      expenses.forEach((expense, index) => {
        cy.get('[data-testid="add-expense-button"]').click();
        cy.get('[data-testid="expense-description"]').type(expense.desc);
        cy.get('[data-testid="expense-amount"]').type(expense.amount);
        cy.get('[data-testid="expense-type-select"]').click();
        cy.get(`[data-value="${expense.type}"]`).click();
        
        if (expense.finite) {
          cy.get('[data-testid="finite-payment-checkbox"]').check();
          cy.get('[data-testid="payments-remaining"]').type(expense.payments);
        }
        
        cy.get('[data-testid="submit-expense"]').click();
        cy.wait(1000); // Allow for processing
      });
      
      // Check analysis cards update
      cy.get('[data-testid="monthly-expenses-card"]').should('contain', '108,253');
      
      // Check finite expenses
      cy.get('[data-testid="finite-expenses-card"]').should('contain', '33,253');
    });

    it('should show asset/liability breakdown correctly', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      
      // Check that asset/liability breakdowns are displayed correctly
      cy.get('[data-testid="expense-item"]').each(($item) => {
        cy.wrap($item).within(() => {
          // Check for asset/liability linking badges
          cy.get('body').then(($body) => {
            if ($body.find('[data-testid="asset-linked-badge"]').length > 0) {
              cy.get('[data-testid="asset-linked-badge"]').should('be.visible');
            }
            if ($body.find('[data-testid="liability-linked-badge"]').length > 0) {
              cy.get('[data-testid="liability-linked-badge"]').should('be.visible');
            }
          });
        });
      });
    });
  });

  describe('Asset/Liability Options Integration', () => {
    it('should display available assets and liabilities for linking', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      // Check asset options dropdown
      cy.get('[data-testid="asset-link-select"]').click();
      cy.get('[data-testid="asset-options"]').should('be.visible');
      
      // Should always have "No asset link" option
      cy.get('[data-value=""]').should('contain', 'No asset link');
      
      // Check liability options dropdown
      cy.get('[data-testid="liability-link-select"]').click();
      cy.get('[data-testid="liability-options"]').should('be.visible');
      
      // Should always have "No debt link" option
      cy.get('[data-value=""]').should('contain', 'No debt link');
      
      // Check for creation links if no assets/liabilities
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="no-assets-warning"]').length > 0) {
          cy.get('[data-testid="create-asset-link"]').should('be.visible');
          cy.get('[data-testid="create-asset-link"]').should('have.attr', 'href').and('include', 'balance-sheet');
        }
        if ($body.find('[data-testid="no-liabilities-warning"]').length > 0) {
          cy.get('[data-testid="create-liability-link"]').should('be.visible');
          cy.get('[data-testid="create-liability-link"]').should('have.attr', 'href').and('include', 'balance-sheet');
        }
      });
    });
  });

  describe('Finite vs Infinite Payment Classification', () => {
    it('should handle finite payment classification correctly', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      // Fill expense details
      cy.get('[data-testid="expense-description"]').type('Personal Loan Payment');
      cy.get('[data-testid="expense-amount"]').type('25000');
      cy.get('[data-testid="expense-type-select"]').click();
      cy.get('[data-value="debt_payments"]').click();
      
      // Mark as finite
      cy.get('[data-testid="finite-payment-checkbox"]').check();
      cy.get('[data-testid="payments-remaining"]').should('be.visible');
      cy.get('[data-testid="payment-end-date"]').should('be.visible');
      
      // Fill finite payment details
      cy.get('[data-testid="payments-remaining"]').type('12');
      cy.get('[data-testid="payment-end-date"]').type('2025-12-31');
      
      // Submit
      cy.get('[data-testid="submit-expense"]').click();
      
      // Verify finite classification is shown
      cy.get('[data-testid="expense-list"]').should('contain', 'Personal Loan');
      cy.get('[data-testid="expense-item"]').last().should('contain', 'Finite');
      cy.get('[data-testid="finite-expenses-card"]').should('not.contain', '0');
    });

    it('should handle infinite payment classification (default)', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      // Fill recurring expense details
      cy.get('[data-testid="expense-description"]').type('Monthly Internet');
      cy.get('[data-testid="expense-amount"]').type('4000');
      cy.get('[data-testid="expense-type-select"]').click();
      cy.get('[data-value="utilities"]').click();
      
      // Don't check finite payment (should default to infinite)
      cy.get('[data-testid="finite-payment-checkbox"]').should('not.be.checked');
      
      // Submit
      cy.get('[data-testid="submit-expense"]').click();
      
      // Verify infinite classification (no finite badge)
      cy.get('[data-testid="expense-list"]').should('contain', 'Monthly Internet');
      cy.get('[data-testid="expense-item"]').last().should('not.contain', 'Finite');
    });
  });

  describe('Error Handling', () => {
    it('should handle form validation errors', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      // Try to submit empty form
      cy.get('[data-testid="submit-expense"]').click();
      
      // Should show validation errors
      cy.get('[data-testid="expense-description"]').should('have.attr', 'required');
      cy.get('[data-testid="expense-amount"]').should('have.attr', 'required');
    });

    it('should handle API errors gracefully', () => {
      // Intercept API call and return error
      cy.intercept('POST', '/api/v1/expenses-v2/', {
        statusCode: 400,
        body: { detail: 'Invalid expense data' }
      }).as('createExpenseError');
      
      cy.get('[data-testid="expense-management-section"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      // Fill form and submit
      cy.get('[data-testid="expense-description"]').type('Test Expense');
      cy.get('[data-testid="expense-amount"]').type('10000');
      cy.get('[data-testid="expense-type-select"]').click();
      cy.get('[data-value="other"]').click();
      cy.get('[data-testid="submit-expense"]').click();
      
      // Wait for API call
      cy.wait('@createExpenseError');
      
      // Should handle error gracefully (form should remain visible)
      cy.get('[data-testid="expense-form"]').should('be.visible');
    });
  });

  describe('Richard Specific Test Flows', () => {
    it('should handle Richard\'s complete expense profile setup', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      
      // Test Richard's main expense categories
      const richardsExpenses = [
        {
          desc: 'Car Loan Payment - Toyota Prado',
          amount: '33253',
          type: 'debt_payments',
          finite: true,
          payments: '24',
          notes: 'Remaining 24 payments on car loan'
        },
        {
          desc: 'Mama Lucy\'s Salon - Operating Expenses',
          amount: '220000',
          type: 'business_operating',
          notes: 'Monthly operational costs for hair salon'
        },
        {
          desc: 'Kileleshwa Property - Maintenance',
          amount: '8000',
          type: 'housing',
          notes: 'Monthly maintenance for rental property'
        },
        {
          desc: 'Personal Living Expenses',
          amount: '80000',
          type: 'other',
          notes: 'Food, utilities, personal care, entertainment'
        }
      ];
      
      richardsExpenses.forEach((expense) => {
        cy.get('[data-testid="add-expense-button"]').click();
        cy.get('[data-testid="expense-description"]').type(expense.desc);
        cy.get('[data-testid="expense-amount"]').type(expense.amount);
        cy.get('[data-testid="expense-type-select"]').click();
        cy.get(`[data-value="${expense.type}"]`).click();
        
        if (expense.finite) {
          cy.get('[data-testid="finite-payment-checkbox"]').check();
          cy.get('[data-testid="payments-remaining"]').type(expense.payments);
        }
        
        if (expense.notes) {
          cy.get('[data-testid="expense-notes"]').type(expense.notes);
        }
        
        cy.get('[data-testid="submit-expense"]').click();
        cy.wait(1500); // Allow for processing
      });
      
      // Verify Richard's complete expense profile
      cy.get('[data-testid="monthly-expenses-card"]').should('contain', '341,253'); // Total monthly
      cy.get('[data-testid="expense-list"] [data-testid="expense-item"]').should('have.length', 4);
      
      // Check finite expenses
      cy.get('[data-testid="finite-expenses-card"]').should('contain', '33,253'); // Only car loan
      
      // Verify expense categories are properly distributed
      cy.get('[data-testid="expense-list"]').within(() => {
        cy.should('contain', 'Car Loan Payment');
        cy.should('contain', 'Salon - Operating');
        cy.should('contain', 'Property - Maintenance');
        cy.should('contain', 'Personal Living');
      });
    });
  });

  describe('Cross-Component Integration Preview', () => {
    it('should show expense data that will flow to other components', () => {
      cy.get('[data-testid="expense-management-section"]').click();
      
      // Verify expense analysis provides data for other components
      cy.get('[data-testid="monthly-expenses-card"]').invoke('text').then((monthlyText) => {
        const monthlyAmount = monthlyText.match(/([\\d,]+)/)[1];
        
        // This monthly expense should flow to Budget component
        cy.log(`Monthly expenses ${monthlyAmount} will flow to Budget component`);
        
        // This should also update Balance Sheet cash flow
        cy.log('Expense data will update Balance Sheet P&L calculations');
      });
      
      // Check asset-related expenses for Balance Sheet integration
      cy.get('[data-testid="asset-related-card"]').invoke('text').then((assetText) => {
        if (assetText.includes('KES') && !assetText.includes('0')) {
          cy.log('Asset-related expenses will appear in Balance Sheet P&L');
        }
      });
      
      // Check liability-related expenses for debt tracking
      cy.get('[data-testid="liability-related-card"]').invoke('text').then((liabilityText) => {
        if (liabilityText.includes('KES') && !liabilityText.includes('0')) {
          cy.log('Liability-related expenses will update debt payment tracking');
        }
      });
    });
  });
});