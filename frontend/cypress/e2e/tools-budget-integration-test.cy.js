/**
 * Tools-Budget Integration Test
 * Validates that Budget component fetches real data from Tools APIs (NO HARDCODED VALUES)
 * Tests the integration work completed in this session
 */

describe('Tools-Budget Integration - Zero Hardcoded Values Policy', () => {
  beforeEach(() => {
    // Clear localStorage to ensure clean test state
    cy.clearLocalStorage();
    
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('jwt', 'mock-jwt-token');
      win.localStorage.setItem('accessToken', 'mock-access-token');
    });
  });

  describe('API Integration - Real Data Flow', () => {
    it('should fetch real income data from Tools API endpoint', () => {
      // Mock the income API call
      cy.intercept('GET', '/api/v1/income-v2/overview', {
        statusCode: 200,
        body: {
          total_monthly_income: 75000,
          sources: [
            {
              id: 1,
              description: 'Primary Salary',
              monthly_amount: 50000,
              income_type: 'salary'
            },
            {
              id: 2, 
              description: 'Freelance Work',
              monthly_amount: 25000,
              income_type: 'freelance'
            }
          ]
        }
      }).as('getIncomeData');

      // Visit budget page
      cy.visit('/budget');
      
      // Verify income API was called (no hardcoded values)
      cy.wait('@getIncomeData');
      
      // Verify dynamic income is displayed
      cy.contains('KES 75,000').should('be.visible');
    });

    it('should fetch real expense data from Tools API endpoint', () => {
      // Mock the expense API call
      cy.intercept('GET', '/api/v1/expenses-v2/', {
        statusCode: 200,
        body: {
          expenses: [
            {
              id: 1,
              description: 'Rent Payment',
              expense_category: 'housing',
              monthly_equivalent: 15000
            },
            {
              id: 2,
              description: 'Grocery Shopping',
              expense_category: 'food',
              monthly_equivalent: 8000
            },
            {
              id: 3,
              description: 'Transport Costs',
              expense_category: 'transport', 
              monthly_equivalent: 5000
            }
          ]
        }
      }).as('getExpenseData');

      cy.visit('/budget');
      
      // Verify expense API was called (no hardcoded values)
      cy.wait('@getExpenseData');
      
      // Verify dynamic expense categories are created
      cy.contains('housing').should('be.visible');
      cy.contains('food').should('be.visible');
      cy.contains('transport').should('be.visible');
    });

    it('should calculate budget surplus dynamically from API data', () => {
      // Mock both income and expense APIs
      cy.intercept('GET', '/api/v1/income-v2/overview', {
        body: { total_monthly_income: 80000 }
      }).as('getIncome');

      cy.intercept('GET', '/api/v1/expenses-v2/', {
        body: {
          expenses: [
            { expense_category: 'rent', monthly_equivalent: 20000 },
            { expense_category: 'food', monthly_equivalent: 10000 }
          ]
        }
      }).as('getExpenses');

      cy.visit('/budget');
      
      cy.wait(['@getIncome', '@getExpenses']);
      
      // Verify dynamic surplus calculation (80000 - 30000 = 50000)
      cy.contains('KES 50,000').should('be.visible');
      cy.contains('positive cash flow').should('be.visible');
    });
  });

  describe('Zero Hardcoded Values Validation', () => {
    it('should show empty state when no API data available', () => {
      // Mock empty API responses
      cy.intercept('GET', '/api/v1/income-v2/overview', {
        body: { total_monthly_income: 0, sources: [] }
      });

      cy.intercept('GET', '/api/v1/expenses-v2/', {
        body: { expenses: [] }
      });

      cy.visit('/budget');
      
      // Should show zero values, not hardcoded defaults
      cy.contains('KES 0').should('be.visible');
      cy.should('not.contain', 'KES 50,000'); // No hardcoded sample data
    });

    it('should generate dynamic recommendations based on actual data', () => {
      // Test high savings rate scenario
      cy.intercept('GET', '/api/v1/income-v2/overview', {
        body: { total_monthly_income: 100000 }
      });

      cy.intercept('GET', '/api/v1/expenses-v2/', {
        body: {
          expenses: [
            { expense_category: 'essentials', monthly_equivalent: 30000 }
          ]
        }
      });

      cy.visit('/budget');
      
      // Should show dynamic recommendation based on 70% savings rate
      cy.contains('Excellent savings rate').should('be.visible');
      cy.contains('70.0%').should('be.visible');
      cy.should('not.contain', 'Jamal'); // No hardcoded persona names
      cy.should('not.contain', 'Aisha');
      cy.should('not.contain', 'Samuel');
    });

    it('should handle API errors gracefully without showing hardcoded fallbacks', () => {
      // Mock API failures
      cy.intercept('GET', '/api/v1/income-v2/overview', {
        statusCode: 500
      });

      cy.intercept('GET', '/api/v1/expenses-v2/', {
        statusCode: 500  
      });

      cy.visit('/budget');
      
      // Should show error state or empty data, not hardcoded values
      cy.contains('Failed to fetch').should('be.visible');
      cy.should('not.contain', 'Sample Income'); // No hardcoded fallbacks
    });
  });

  describe('Dynamic Category Management', () => {
    it('should create expense categories dynamically from API data', () => {
      cy.intercept('GET', '/api/v1/expenses-v2/', {
        body: {
          expenses: [
            { expense_category: 'custom_category_1', monthly_equivalent: 1000 },
            { expense_category: 'unique_user_category', monthly_equivalent: 2000 },
            { expense_category: 'dynamic_expense_type', monthly_equivalent: 1500 }
          ]
        }
      });

      cy.visit('/budget');
      
      // Should display user's actual categories, not predefined ones
      cy.contains('custom_category_1').should('be.visible');
      cy.contains('unique_user_category').should('be.visible');
      cy.contains('dynamic_expense_type').should('be.visible');
      
      // Should NOT show hardcoded categories
      cy.should('not.contain', 'rent'); // Only if user doesn't have it
      cy.should('not.contain', 'groceries'); // Only if user doesn't have it
    });
  });

  describe('Tools Integration Validation', () => {
    it('should connect Tools income management with Budget display', () => {
      // Navigate to Tools first to add income
      cy.visit('/tools');
      
      // Mock the income API with new data
      cy.intercept('POST', '/api/v1/income-v2/', {
        statusCode: 201,
        body: { id: 123, monthly_amount: 60000 }
      });

      cy.intercept('GET', '/api/v1/income-v2/overview', {
        body: { total_monthly_income: 60000 }
      });

      // Add income through Tools
      cy.contains('Income Management').click();
      cy.contains('Add Income').click();
      cy.get('[data-testid="income-amount"]').type('60000');
      cy.contains('Save').click();

      // Navigate to Budget
      cy.visit('/budget');
      
      // Verify Budget shows the income added through Tools
      cy.contains('KES 60,000').should('be.visible');
    });

    it('should connect Tools expense management with Budget calculations', () => {
      // Mock expense creation
      cy.intercept('POST', '/api/v1/expenses-v2/', {
        statusCode: 201,
        body: { id: 456, monthly_equivalent: 12000 }
      });

      cy.intercept('GET', '/api/v1/expenses-v2/', {
        body: {
          expenses: [
            { expense_category: 'new_expense', monthly_equivalent: 12000 }
          ]
        }
      });

      cy.visit('/tools');
      cy.contains('Expense Management').click();
      cy.contains('Add Expense').click();
      cy.get('[data-testid="expense-amount"]').type('12000');
      cy.contains('Save').click();

      // Check Budget reflects the new expense
      cy.visit('/budget');
      cy.contains('KES 12,000').should('be.visible');
      cy.contains('new_expense').should('be.visible');
    });
  });
});