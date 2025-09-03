/**
 * Cross-Component Integration E2E Tests
 * Tests the complete workflow of cross-component relationships and financial dashboard
 * CFA-compliant testing for comprehensive financial management
 */

describe('Cross-Component Integration - Complete Financial Workflow', () => {
  beforeEach(() => {
    // Clear all data and set up fresh test environment
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Mock authentication
    cy.window().then((win) => {
      win.localStorage.setItem('jwt', 'mock-jwt-token');
      win.localStorage.setItem('accessToken', 'mock-access-token');
    });

    // Mock all API endpoints with realistic data
    mockAllAPIEndpoints();
  });

  describe('Asset-Income-Expense Relationship Workflow', () => {
    it('should create complete asset workflow with income generation and expenses', () => {
      // Step 1: Create a rental property asset
      cy.visit('/tools');
      cy.get('[data-testid="add-asset-button"]').click();
      
      // Fill asset form
      cy.get('[data-testid="asset-name-input"]').type('Kileleshwa Rental Property');
      cy.get('[data-testid="asset-type-select"]').click();
      cy.contains('Real Estate').click();
      cy.get('[data-testid="current-value-input"]').type('5000000');
      cy.get('[data-testid="purchase-price-input"]').type('3500000');
      cy.get('[data-testid="purchase-date-input"]').type('2023-01-01');
      cy.get('[data-testid="asset-description-input"]').type('3-bedroom apartment in Kileleshwa');
      
      // Submit asset
      cy.get('[data-testid="submit-asset"]').click();
      
      // Verify asset is created
      cy.get('[data-testid="asset-list"]').should('contain', 'Kileleshwa Rental Property');
      cy.get('[data-testid="total-asset-value"]').should('contain', 'KES 5,000,000');

      // Step 2: Create income source for the asset
      cy.intercept('POST', '/api/v1/income-v2/', {
        statusCode: 201,
        body: {
          id: 101,
          description: 'Rental Income - Kileleshwa Property',
          monthly_amount: 45000,
          income_type: 'rental',
          frequency: 'monthly'
        }
      }).as('createIncome');

      // Navigate to income management
      cy.get('[data-testid="income-tab"]').click();
      cy.get('[data-testid="add-income-button"]').click();
      
      // Fill income form
      cy.get('[data-testid="income-description-input"]').type('Rental Income - Kileleshwa Property');
      cy.get('[data-testid="income-amount-input"]').type('45000');
      cy.get('[data-testid="income-type-select"]').click();
      cy.contains('Rental Income').click();
      
      cy.get('[data-testid="submit-income"]').click();
      cy.wait('@createIncome');

      // Step 3: Create asset-income relationship
      cy.intercept('POST', '/api/v1/relationships-v2/', {
        statusCode: 200,
        body: {
          data: {
            success: true,
            relationship: {
              id: 201,
              relationship_type: 'asset_income',
              source_type: 'asset',
              source_id: 1,
              target_type: 'income',
              target_id: 101,
              amount: 45000,
              monthly_impact: 45000
            },
            impact_analysis: {
              monthly_impact: 45000,
              frequency: 'monthly'
            }
          }
        }
      }).as('createAssetIncomeRelationship');

      // Create relationship through UI (assuming relationship management UI exists)
      cy.get('[data-testid="create-relationship-button"]').click();
      cy.get('[data-testid="relationship-source-select"]').select('asset');
      cy.get('[data-testid="relationship-target-select"]').select('income');
      cy.get('[data-testid="relationship-amount-input"]').type('45000');
      cy.get('[data-testid="submit-relationship"]').click();
      cy.wait('@createAssetIncomeRelationship');

      // Step 4: Create expense for property maintenance
      cy.intercept('POST', '/api/v1/expenses-v2/', {
        statusCode: 201,
        body: {
          id: 301,
          description: 'Property Maintenance - Kileleshwa',
          monthly_equivalent: 8000,
          expense_category: 'property_maintenance',
          frequency: 'monthly'
        }
      }).as('createExpense');

      cy.get('[data-testid="expenses-tab"]').click();
      cy.get('[data-testid="add-expense-button"]').click();
      
      cy.get('[data-testid="expense-description-input"]').type('Property Maintenance - Kileleshwa');
      cy.get('[data-testid="expense-amount-input"]').type('8000');
      cy.get('[data-testid="expense-category-select"]').click();
      cy.contains('Property Maintenance').click();
      
      cy.get('[data-testid="submit-expense"]').click();
      cy.wait('@createExpense');

      // Step 5: Create asset-expense relationship
      cy.intercept('POST', '/api/v1/relationships-v2/', {
        statusCode: 200,
        body: {
          data: {
            success: true,
            relationship: {
              id: 202,
              relationship_type: 'asset_expense',
              source_type: 'asset',
              source_id: 1,
              target_type: 'expense',
              target_id: 301,
              amount: 8000,
              monthly_impact: 8000
            }
          }
        }
      }).as('createAssetExpenseRelationship');

      // Verify the complete asset analysis shows net income
      cy.get('[data-testid="asset-analysis-panel"]').should('contain', 'Net Monthly: KES 37,000');
    });

    it('should update asset relationships and reflect changes in dashboard', () => {
      // Create initial setup
      createInitialAssetSetup();
      
      // Update rental income amount
      cy.get('[data-testid="edit-income-button"]').first().click();
      cy.get('[data-testid="income-amount-input"]').clear().type('50000');
      cy.get('[data-testid="submit-income"]').click();

      // Verify relationship update is reflected
      cy.get('[data-testid="asset-analysis-panel"]').should('contain', 'Net Monthly: KES 42,000');
      
      // Check dashboard reflects the change
      cy.visit('/dashboard');
      cy.get('[data-testid="monthly-surplus"]').should('contain', 'KES 42,000');
    });
  });

  describe('Goal Funding Integration Workflow', () => {
    it('should create goal with multiple funding sources', () => {
      // Step 1: Create a financial goal
      cy.visit('/tools');
      cy.get('[data-testid="goals-tab"]').click();
      cy.get('[data-testid="add-goal-button"]').click();
      
      // Fill goal form
      cy.get('[data-testid="goal-name-input"]').type('Emergency Fund');
      cy.get('[data-testid="goal-type-select"]').click();
      cy.contains('Emergency Fund').click();
      cy.get('[data-testid="target-amount-input"]').type('300000');
      cy.get('[data-testid="target-date-input"]').type('2025-12-31');
      cy.get('[data-testid="current-amount-input"]').type('50000');
      
      cy.get('[data-testid="submit-goal"]').click();

      // Step 2: Set up funding from salary (income allocation)
      cy.intercept('POST', '/api/v1/relationships-v2/goal/1/funding', {
        statusCode: 200,
        body: {
          data: {
            success: true,
            goal_id: 1,
            funding_relationships: [
              {
                id: 301,
                relationship_type: 'goal_income',
                source_type: 'income',
                source_id: 1,
                target_type: 'goal',
                target_id: 1,
                amount: 15000,
                percentage: 20
              },
              {
                id: 302,
                relationship_type: 'goal_asset',
                source_type: 'asset',
                source_id: 2,
                target_type: 'goal',
                target_id: 1,
                amount: 5000
              }
            ],
            total_monthly_funding: 20000,
            funding_sources_count: 2
          }
        }
      }).as('createGoalFunding');

      // Create funding plan
      cy.get('[data-testid="setup-funding-button"]').click();
      
      // Add income allocation
      cy.get('[data-testid="add-funding-source"]').click();
      cy.get('[data-testid="funding-source-type"]').select('income');
      cy.get('[data-testid="funding-source-id"]').select('Salary');
      cy.get('[data-testid="funding-percentage"]').type('20');
      
      // Add asset allocation
      cy.get('[data-testid="add-funding-source"]').click();
      cy.get('[data-testid="funding-source-type"]').select('asset');
      cy.get('[data-testid="funding-source-id"]').select('SACCO Shares');
      cy.get('[data-testid="funding-amount"]').type('5000');
      
      cy.get('[data-testid="submit-funding-plan"]').click();
      cy.wait('@createGoalFunding');

      // Verify funding plan is created
      cy.get('[data-testid="goal-funding-summary"]').should('contain', 'Total Monthly: KES 20,000');
      cy.get('[data-testid="goal-funding-summary"]').should('contain', '2 funding sources');

      // Step 3: Verify goal timeline calculation
      cy.get('[data-testid="goal-timeline"]').should('contain', '12.5 months to completion');
    });

    it('should show goal achievement projection based on current funding', () => {
      createInitialGoalSetup();
      
      // Check goal projection in dashboard
      cy.visit('/dashboard');
      cy.get('[data-testid="goal-projections"]').should('be.visible');
      cy.get('[data-testid="emergency-fund-projection"]').should('contain', 'On track');
      
      // Verify projected completion date
      cy.get('[data-testid="goal-completion-date"]').should('contain', 'December 2025');
    });
  });

  describe('Comprehensive Financial Dashboard Integration', () => {
    it('should display complete financial health dashboard with all components', () => {
      // Set up complete financial profile
      setupCompleteFinancialProfile();
      
      // Navigate to financial health dashboard
      cy.visit('/dashboard');
      
      // Verify dashboard loads with all components
      cy.get('[data-testid="financial-health-dashboard"]').should('be.visible');
      
      // Check key metrics are displayed
      cy.get('[data-testid="net-worth"]').should('contain', 'KES 4,542,000');
      cy.get('[data-testid="monthly-surplus"]').should('contain', 'KES 37,000');
      cy.get('[data-testid="savings-rate"]').should('contain', '49.3%');
      cy.get('[data-testid="goal-progress"]').should('contain', '16.7%');
      
      // Check financial health score
      cy.get('[data-testid="health-score"]').should('contain', '85');
      cy.get('[data-testid="health-label"]').should('contain', 'Excellent');
      
      // Verify asset allocation chart
      cy.get('[data-testid="asset-allocation"]').should('be.visible');
      cy.get('[data-testid="real-estate-allocation"]').should('contain', '90.9%');
      cy.get('[data-testid="investment-allocation"]').should('contain', '9.1%');
    });

    it('should show projections and respond to projection period changes', () => {
      setupCompleteFinancialProfile();
      cy.visit('/dashboard');
      
      // Switch to projections tab
      cy.contains('projections').click();
      
      // Verify default 1-year projection
      cy.get('[data-testid="projected-net-worth"]').should('contain', 'KES 4,986,000');
      cy.get('[data-testid="total-savings"]').should('contain', 'KES 444,000');
      
      // Change projection period to 3 years
      cy.get('select').select('3years');
      
      // Verify updated projections
      cy.get('[data-testid="projected-net-worth"]').should('contain', 'KES 6,874,000');
      cy.get('[data-testid="compound-growth"]').should('contain', 'KES 7,234,567');
    });

    it('should display appropriate financial alerts', () => {
      // Set up profile with some financial issues
      setupFinancialProfileWithIssues();
      
      cy.visit('/dashboard');
      
      // Verify alerts are displayed
      cy.get('[data-testid="financial-alerts"]').should('be.visible');
      cy.get('[data-testid="low-emergency-fund-alert"]').should('contain', 'Insufficient emergency fund');
      cy.get('[data-testid="high-debt-alert"]').should('contain', 'High debt-to-income ratio');
      
      // Check alert priorities
      cy.get('[data-testid="alert-priority-high"]').should('have.length.at.least', 1);
    });

    it('should update dashboard when underlying data changes', () => {
      setupCompleteFinancialProfile();
      cy.visit('/dashboard');
      
      // Record initial values
      cy.get('[data-testid="net-worth"]').should('contain', 'KES 4,542,000');
      
      // Navigate to assets and update property value
      cy.visit('/tools');
      cy.get('[data-testid="edit-asset-button"]').first().click();
      cy.get('[data-testid="current-value-input"]').clear().type('5500000');
      cy.get('[data-testid="submit-asset"]').click();
      
      // Return to dashboard
      cy.visit('/dashboard');
      
      // Verify dashboard reflects the change
      cy.get('[data-testid="net-worth"]').should('contain', 'KES 6,042,000');
      cy.get('[data-testid="health-score"]').should('contain', '87'); // Should improve slightly
    });
  });

  describe('Cross-Component Relationship Management', () => {
    it('should show relationship impact when creating connections', () => {
      setupBasicAssetsAndIncome();
      
      // Visit relationship management page
      cy.visit('/relationships');
      
      // Create asset-income relationship
      cy.get('[data-testid="create-relationship-button"]').click();
      cy.get('[data-testid="relationship-type-select"]').select('asset_income');
      cy.get('[data-testid="source-component-select"]').select('Kileleshwa Property');
      cy.get('[data-testid="target-component-select"]').select('Rental Income');
      cy.get('[data-testid="relationship-amount-input"]').type('45000');
      
      // Verify impact preview
      cy.get('[data-testid="impact-preview"]').should('contain', 'Monthly Impact: +KES 45,000');
      cy.get('[data-testid="annual-impact-preview"]').should('contain', 'Annual Impact: +KES 540,000');
      
      cy.get('[data-testid="submit-relationship"]').click();
      
      // Verify relationship is created and listed
      cy.get('[data-testid="relationships-list"]').should('contain', 'Kileleshwa Property → Rental Income');
      cy.get('[data-testid="relationship-monthly-impact"]').should('contain', 'KES 45,000');
    });

    it('should cascade relationship updates across components', () => {
      setupCompleteFinancialProfile();
      
      // Update a relationship amount
      cy.visit('/relationships');
      cy.get('[data-testid="edit-relationship-button"]').first().click();
      cy.get('[data-testid="relationship-amount-input"]').clear().type('50000');
      cy.get('[data-testid="update-relationship"]').click();
      
      // Verify cascade effect in budget
      cy.visit('/budget');
      cy.get('[data-testid="rental-income"]').should('contain', 'KES 50,000');
      
      // Verify cascade effect in goals
      cy.get('[data-testid="goals-tab"]').click();
      cy.get('[data-testid="goal-funding-amount"]').should('contain', 'KES 50,000');
      
      // Verify cascade effect in dashboard
      cy.visit('/dashboard');
      cy.get('[data-testid="monthly-surplus"]').should('contain', 'KES 42,000'); // Updated surplus
    });

    it('should handle relationship deletion with confirmation', () => {
      setupCompleteFinancialProfile();
      
      cy.visit('/relationships');
      
      // Delete a relationship
      cy.get('[data-testid="delete-relationship-button"]').first().click();
      
      // Verify confirmation dialog
      cy.get('[data-testid="delete-confirmation"]').should('be.visible');
      cy.get('[data-testid="delete-confirmation"]').should('contain', 'This will affect your budget calculations');
      
      cy.get('[data-testid="confirm-delete"]').click();
      
      // Verify relationship is removed
      cy.get('[data-testid="relationships-list"]').should('not.contain', 'Asset Income Relationship');
      
      // Verify impact is reflected in dashboard
      cy.visit('/dashboard');
      cy.get('[data-testid="monthly-surplus"]').should('not.contain', 'KES 37,000');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle API errors gracefully', () => {
      // Mock API error
      cy.intercept('GET', '/api/v1/relationships-v2/net-worth-impact', {
        statusCode: 500,
        body: { detail: 'Internal server error' }
      }).as('dashboardError');
      
      cy.visit('/dashboard');
      cy.wait('@dashboardError');
      
      // Verify error handling
      cy.get('[data-testid="error-message"]').should('contain', 'Unable to load dashboard data');
      cy.get('[data-testid="retry-button"]').should('be.visible');
      
      // Test retry functionality
      cy.intercept('GET', '/api/v1/relationships-v2/net-worth-impact', {
        fixture: 'dashboard-data.json'
      }).as('dashboardRetry');
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@dashboardRetry');
      
      // Verify data loads successfully after retry
      cy.get('[data-testid="financial-health-dashboard"]').should('be.visible');
    });

    it('should validate relationship creation constraints', () => {
      cy.visit('/relationships');
      
      // Try to create circular relationship
      cy.get('[data-testid="create-relationship-button"]').click();
      cy.get('[data-testid="relationship-type-select"]').select('asset_income');
      cy.get('[data-testid="source-component-select"]').select('Rental Income');
      cy.get('[data-testid="target-component-select"]').select('Rental Income'); // Same source and target
      
      // Verify validation error
      cy.get('[data-testid="validation-error"]').should('contain', 'Cannot create relationship with itself');
      
      // Try to create duplicate relationship
      cy.get('[data-testid="target-component-select"]').select('Emergency Fund');
      cy.get('[data-testid="submit-relationship"]').click();
      
      // Mock duplicate relationship error
      cy.intercept('POST', '/api/v1/relationships-v2/', {
        statusCode: 400,
        body: { detail: 'Relationship already exists' }
      });
      
      cy.get('[data-testid="error-message"]').should('contain', 'Relationship already exists');
    });
  });

  // Helper functions to set up test data
  function mockAllAPIEndpoints() {
    // Mock assets endpoint
    cy.intercept('GET', '/api/v1/assets-v2/', {
      fixture: 'assets.json'
    }).as('getAssets');

    // Mock income endpoint
    cy.intercept('GET', '/api/v1/income-v2/overview', {
      fixture: 'income-overview.json'
    }).as('getIncome');

    // Mock expenses endpoint
    cy.intercept('GET', '/api/v1/expenses-v2/', {
      fixture: 'expenses.json'
    }).as('getExpenses');

    // Mock goals endpoint
    cy.intercept('GET', '/api/v1/goals-v2/overview', {
      fixture: 'goals-overview.json'
    }).as('getGoals');

    // Mock liabilities endpoint
    cy.intercept('GET', '/api/v1/liabilities-v2/', {
      fixture: 'liabilities.json'
    }).as('getLiabilities');

    // Mock relationships endpoint
    cy.intercept('GET', '/api/v1/relationships-v2/net-worth-impact', {
      fixture: 'net-worth-impact.json'
    }).as('getNetWorthImpact');
  }

  function createInitialAssetSetup() {
    // Mock the creation of assets, income, and expenses for testing
    cy.intercept('POST', '/api/v1/assets-v2/', { statusCode: 201, body: { id: 1 } });
    cy.intercept('POST', '/api/v1/income-v2/', { statusCode: 201, body: { id: 101 } });
    cy.intercept('POST', '/api/v1/expenses-v2/', { statusCode: 201, body: { id: 301 } });
  }

  function setupCompleteFinancialProfile() {
    // Mock complete financial profile with assets, income, expenses, goals, and relationships
    cy.intercept('GET', '/api/v1/assets-v2/', {
      body: [
        {
          id: 1,
          name: 'Kileleshwa Property',
          asset_type: 'real_estate',
          current_value: 5000000,
          purchase_price: 3500000
        },
        {
          id: 2,
          name: 'SACCO Shares',
          asset_type: 'investment_account',
          current_value: 500000,
          purchase_price: 400000
        }
      ]
    });

    cy.intercept('GET', '/api/v1/liabilities-v2/', {
      body: [
        {
          id: 1,
          name: 'Mortgage',
          liability_type: 'mortgage',
          balance: 958000,
          monthly_payment: 35000
        }
      ]
    });

    cy.intercept('GET', '/api/v1/income-v2/overview', {
      body: {
        total_monthly_income: 75000,
        sources: [
          { id: 1, description: 'Salary', monthly_amount: 75000, income_type: 'salary' }
        ]
      }
    });

    cy.intercept('GET', '/api/v1/expenses-v2/', {
      body: {
        expenses: [
          { id: 1, description: 'Living Expenses', monthly_equivalent: 38000, expense_category: 'living' }
        ]
      }
    });

    cy.intercept('GET', '/api/v1/goals-v2/overview', {
      body: {
        goals: [
          {
            id: 1,
            name: 'Emergency Fund',
            target_amount: 300000,
            current_amount: 50000,
            target_date: '2025-12-31',
            goal_type: 'emergency_fund'
          }
        ]
      }
    });

    cy.intercept('GET', '/api/v1/relationships-v2/net-worth-impact', {
      body: {
        data: {
          monthly_net_worth_impact: 37000,
          asset_impacts: { 1: 45000, 2: 0 },
          liability_impacts: { 1: -35000 },
          total_relationships: 3
        }
      }
    });
  }

  function setupFinancialProfileWithIssues() {
    // Mock financial profile with issues for alert testing
    cy.intercept('GET', '/api/v1/assets-v2/', {
      body: [{ id: 1, current_value: 50000 }]
    });

    cy.intercept('GET', '/api/v1/liabilities-v2/', {
      body: [{ id: 1, balance: 200000, monthly_payment: 25000 }]
    });

    cy.intercept('GET', '/api/v1/income-v2/overview', {
      body: { total_monthly_income: 40000 }
    });

    cy.intercept('GET', '/api/v1/expenses-v2/', {
      body: { expenses: [{ monthly_equivalent: 38000 }] }
    });
  }

  function createInitialGoalSetup() {
    // Setup for goal testing
    cy.intercept('POST', '/api/v1/goals-v2/', { statusCode: 201, body: { id: 1 } });
    cy.intercept('POST', '/api/v1/relationships-v2/goal/1/funding', {
      statusCode: 200,
      body: { data: { success: true, total_monthly_funding: 20000 } }
    });
  }

  function setupBasicAssetsAndIncome() {
    // Basic setup for relationship testing
    cy.intercept('GET', '/api/v1/assets-v2/', {
      body: [{ id: 1, name: 'Kileleshwa Property' }]
    });
    
    cy.intercept('GET', '/api/v1/income-v2/overview', {
      body: { sources: [{ id: 1, description: 'Rental Income' }] }
    });
  }
});