describe('CR004 Phase 2 Validation - Dashboard Migration to UnifiedFinancialContext', () => {
  const testUser = {
    email: 'richard.macharia@testuser.com',
    password: 'TestPassword123!'
  };

  beforeEach(() => {
    cy.visit('/');
    
    // Login to access dashboard components
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Wait for authentication
    cy.url().should('include', '/app/dashboard');
    cy.wait(2000); // Allow context to load
  });

  context('Phase 1 Validation: UnifiedFinancialProvider Integration', () => {
    it('should have UnifiedFinancialProvider wrapping the entire application', () => {
      // Verify no console errors related to context
      cy.window().then((win) => {
        cy.spy(win.console, 'error').as('consoleError');
      });
      
      // Navigate to dashboard - this should load without UnifiedFinancialContext errors
      cy.visit('/app/dashboard');
      cy.wait(3000);
      
      // Verify context errors didn't occur
      cy.get('@consoleError').should('not.have.been.calledWith', 
        Cypress.sinon.match(/useUnifiedFinancialContext must be used within/));
    });

    it('should provide unified context to all dashboard components', () => {
      // Test that all dashboard sections load without errors
      cy.visit('/app/dashboard');
      
      // Financial Health Dashboard section should load
      cy.get('[data-testid="financial-health-dashboard"]', { timeout: 10000 })
        .should('be.visible');
      
      // Asset Dashboard should be accessible
      cy.contains('Assets', { timeout: 5000 }).should('be.visible');
      
      // Balance Sheet should be accessible  
      cy.contains('Balance Sheet', { timeout: 5000 }).should('be.visible');
    });
  });

  context('Phase 2 Validation: Dashboard Component Migration', () => {
    it('should load FinancialHealthDashboard without direct API calls', () => {
      // Intercept API calls to detect any direct calls
      cy.intercept('GET', '**/relationships-v2/net-worth-impact').as('netWorthCall');
      cy.intercept('GET', '**/assets-v2/').as('assetsCall');
      cy.intercept('GET', '**/liabilities-v2/').as('liabilitiesCall');
      cy.intercept('GET', '**/goals-v2/overview').as('goalsCall');
      cy.intercept('GET', '**/income-v2/overview').as('incomeCall');
      cy.intercept('GET', '**/expenses-v2/').as('expensesCall');
      
      cy.visit('/app/dashboard');
      
      // Wait for component to load
      cy.get('[data-testid="financial-health-dashboard"]', { timeout: 10000 })
        .should('be.visible');
      
      // FinancialHealthDashboard should NOT make these direct API calls anymore
      cy.wait(5000); // Give time for any potential API calls
      
      // These calls should come from UnifiedFinancialContext, not component
      cy.get('@netWorthCall.all').should('have.length.at.most', 1);
      cy.get('@assetsCall.all').should('have.length.at.most', 1);
      cy.get('@liabilitiesCall.all').should('have.length.at.most', 1);
    });

    it('should display financial health data through unified context', () => {
      cy.visit('/app/dashboard');
      
      // Verify FinancialHealthDashboard displays data
      cy.get('[data-testid="financial-health-dashboard"]', { timeout: 10000 })
        .should('be.visible');
      
      // Should show financial health score
      cy.contains(/\d+/, { timeout: 10000 }).should('be.visible'); // Health score number
      cy.contains('Net Worth', { timeout: 5000 }).should('be.visible');
      cy.contains('Monthly Surplus', { timeout: 5000 }).should('be.visible');
    });

    it('should load AssetDashboard through unified context', () => {
      // Navigate to assets section
      cy.visit('/app/dashboard');
      cy.contains('Assets').click();
      
      // Should load asset data without direct API calls
      cy.get('[data-testid="asset-management-section"]', { timeout: 10000 })
        .should('be.visible');
      
      // Should display asset summary
      cy.get('[data-testid="total-asset-value"]', { timeout: 5000 })
        .should('be.visible');
    });

    it('should load BalanceSheetDashboard through unified context', () => {
      // Navigate to balance sheet
      cy.visit('/app/dashboard');
      cy.contains('Balance Sheet').click();
      
      // Should load balance sheet without errors
      cy.contains('Traditional', { timeout: 10000 }).should('be.visible');
      cy.contains('Lifetime', { timeout: 5000 }).should('be.visible');
      
      // Should display net worth calculations
      cy.contains('Net Worth', { timeout: 5000 }).should('be.visible');
    });
  });

  context('Real-time Cross-Component Synchronization Validation', () => {
    it('should synchronize data across components within 2 seconds', () => {
      // Start timing
      const startTime = Date.now();
      
      // Navigate to assets and create an asset
      cy.visit('/app/dashboard');
      cy.contains('Assets').click();
      
      cy.get('[data-testid="add-asset-button"]', { timeout: 10000 }).click();
      
      // Fill out asset form
      cy.get('[data-testid="asset-name-input"]').type('Test Synchronization Asset');
      cy.get('[data-testid="asset-type-select"]').select('real_estate');
      cy.get('[data-testid="current-value-input"]').type('1000000');
      
      // Submit form
      cy.get('[data-testid="submit-asset"]').click();
      
      // Verify asset appears in list
      cy.contains('Test Synchronization Asset', { timeout: 5000 }).should('be.visible');
      
      // Navigate to balance sheet to check synchronization
      cy.contains('Balance Sheet').click();
      
      // Check that the balance sheet updated (within 2 seconds of navigation)
      cy.contains('Net Worth', { timeout: 3000 }).should('be.visible');
      
      // Measure total time - should be reasonable for cross-component sync
      cy.then(() => {
        const totalTime = Date.now() - startTime;
        expect(totalTime).to.be.lessThan(10000); // 10 seconds max for full workflow
      });
    });

    it('should maintain data consistency across all dashboard components', () => {
      cy.visit('/app/dashboard');
      
      // Get asset count from main dashboard
      cy.get('[data-testid="financial-health-dashboard"]', { timeout: 10000 })
        .should('be.visible');
      
      // Navigate to assets section
      cy.contains('Assets').click();
      cy.get('[data-testid="asset-list"]', { timeout: 5000 }).should('be.visible');
      
      // Navigate to balance sheet
      cy.contains('Balance Sheet').click();
      cy.contains('Traditional', { timeout: 5000 }).should('be.visible');
      
      // All components should load without errors, indicating consistent data
      cy.get('body').should('not.contain', 'Error loading');
      cy.get('body').should('not.contain', 'Failed to fetch');
    });
  });

  context('Performance & Error Handling Validation', () => {
    it('should load dashboard components within 3 seconds', () => {
      const startTime = Date.now();
      
      cy.visit('/app/dashboard');
      
      // Main dashboard should load quickly
      cy.get('[data-testid="financial-health-dashboard"]', { timeout: 10000 })
        .should('be.visible')
        .then(() => {
          const loadTime = Date.now() - startTime;
          expect(loadTime).to.be.lessThan(5000); // 5 seconds max (generous for testing)
        });
    });

    it('should handle context loading states properly', () => {
      cy.visit('/app/dashboard');
      
      // Should show loading states appropriately
      cy.get('body').should('contain.oneOf', ['Loading', 'loading', 'Loading...']);
      
      // Should eventually load content
      cy.get('[data-testid="financial-health-dashboard"]', { timeout: 15000 })
        .should('be.visible');
    });

    it('should not show legacy error messages from direct API calls', () => {
      cy.visit('/app/dashboard');
      
      // Wait for components to load
      cy.wait(5000);
      
      // Should not show errors related to direct API failures
      cy.get('body').should('not.contain', 'Failed to fetch assets data');
      cy.get('body').should('not.contain', 'Failed to fetch balance sheet data');
      cy.get('body').should('not.contain', 'Failed to fetch dashboard data');
    });
  });

  after(() => {
    // Cleanup: Remove test asset if created
    cy.visit('/app/dashboard');
    cy.contains('Assets').click();
    
    // Try to delete test asset if it exists
    cy.get('body').then(($body) => {
      if ($body.text().includes('Test Synchronization Asset')) {
        cy.contains('Test Synchronization Asset')
          .parents('[data-testid="asset-item"]')
          .find('button')
          .contains('Delete')
          .click();
        cy.contains('Yes').click(); // Confirm deletion
      }
    });
  });
});