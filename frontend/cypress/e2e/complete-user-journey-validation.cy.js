/**
 * Complete User Journey Validation Test
 * Tests full user lifecycle from new user registration through ongoing financial management
 */

describe('Complete User Journey Validation', () => {
  const testUser = {
    email: 'journey.test@example.com',
    password: 'SecureTest123!',
    name: 'Journey Test User'
  };

  before(() => {
    // Clean up any existing test data
    cy.exec('cd api && python -c "from app.dev import cleanup_test_user; cleanup_test_user(\'journey.test@example.com\')"', {
      failOnNonZeroExit: false
    });
  });

  describe('New User Complete Journey', () => {
    it('validates complete new user onboarding and initial usage', () => {
      // Step 1: User Registration
      cy.visit('/auth/register');
      cy.get('[data-cy="register-email"]').type(testUser.email);
      cy.get('[data-cy="register-password"]').type(testUser.password);
      cy.get('[data-cy="register-name"]').type(testUser.name);
      cy.get('[data-cy="register-submit"]').click();

      // Verify successful registration
      cy.url().should('include', '/onboarding');
      cy.get('[data-cy="welcome-message"]').should('contain', testUser.name);

      // Step 2: Complete Comprehensive Onboarding
      // Personal Information Step
      cy.get('[data-cy="personal-age"]').type('32');
      cy.get('[data-cy="personal-occupation"]').type('Software Engineer');
      cy.get('[data-cy="personal-location"]').select('Nairobi');
      cy.get('[data-cy="personal-dependents"]').type('2');
      cy.get('[data-cy="next-step"]').click();

      // Financial Information Step
      cy.get('[data-cy="monthly-income"]').type('450000');
      cy.get('[data-cy="monthly-expenses"]').type('280000');
      cy.get('[data-cy="current-savings"]').type('150000');
      cy.get('[data-cy="current-investments"]').type('80000');
      cy.get('[data-cy="monthly-debt"]').type('25000');
      cy.get('[data-cy="next-step"]').click();

      // Risk Assessment Step
      cy.get('[data-cy="risk-q1-moderate"]').click();
      cy.get('[data-cy="risk-q2-balanced"]').click();
      cy.get('[data-cy="risk-q3-medium"]').click();
      cy.get('[data-cy="risk-q4-recover"]').click();
      cy.get('[data-cy="next-step"]').click();

      // Goals Setup Step
      cy.get('[data-cy="add-emergency-goal"]').click();
      cy.get('[data-cy="emergency-target"]').type('600000'); // 6 months expenses
      cy.get('[data-cy="emergency-timeframe"]').type('18');

      cy.get('[data-cy="add-retirement-goal"]').click();
      cy.get('[data-cy="retirement-target"]').type('8000000');
      cy.get('[data-cy="retirement-age"]').type('60');

      cy.get('[data-cy="add-education-goal"]').click();
      cy.get('[data-cy="education-target"]').type('500000');
      cy.get('[data-cy="education-timeframe"]').type('60');

      cy.get('[data-cy="next-step"]').click();

      // Preferences Step
      cy.get('[data-cy="notification-email"]').check();
      cy.get('[data-cy="notification-mobile"]').check();
      cy.get('[data-cy="report-frequency"]').select('monthly');
      cy.get('[data-cy="complete-onboarding"]').click();

      // Step 3: Verify Onboarding Success - Timeline Dashboard
      cy.url().should('include', '/timeline');
      
      // Verify persona detection worked
      cy.get('[data-cy="persona-badge"]').should('be.visible');
      cy.get('[data-cy="persona-badge"]').should('contain.text', 'Profile');

      // Verify alignment score calculation
      cy.get('[data-cy="alignment-score"]').should('exist');
      cy.get('[data-cy="alignment-score"]').then($score => {
        const score = parseInt($score.text());
        expect(score).to.be.greaterThan(0);
        expect(score).to.be.lessThan(101);
      });

      // Verify lifecycle phase detection
      cy.get('[data-cy="lifecycle-phase"]').should('contain', 'Accumulation');

      // Verify goals were created
      cy.get('[data-cy="milestone-list"]').should('contain', 'Emergency Fund');
      cy.get('[data-cy="milestone-list"]').should('contain', 'Retirement');
      cy.get('[data-cy="milestone-list"]').should('contain', 'Education');

      // Step 4: Set Up Financial Accounts
      cy.visit('/accounts');
      cy.get('[data-cy="add-account-btn"]').click();
      
      // Add primary checking account
      cy.get('[data-cy="account-type"]').select('checking');
      cy.get('[data-cy="account-name"]').type('Primary Checking');
      cy.get('[data-cy="institution-name"]').type('KCB Bank');
      cy.get('[data-cy="account-balance"]').type('180000');
      cy.get('[data-cy="save-account"]').click();

      // Add investment account
      cy.get('[data-cy="add-account-btn"]').click();
      cy.get('[data-cy="account-type"]').select('investment');
      cy.get('[data-cy="account-name"]').type('Investment Portfolio');
      cy.get('[data-cy="institution-name"]').type('CIC Asset Management');
      cy.get('[data-cy="account-balance"]').type('80000');
      cy.get('[data-cy="save-account"]').click();

      // Verify accounts appear with correct totals
      cy.get('[data-cy="total-assets"]').should('contain', 'KES 260,000');

      // Step 5: Set Up Budget Categories
      cy.visit('/budget');
      cy.get('[data-cy="setup-budget-btn"]').click();

      // Configure expense categories
      const budgetCategories = {
        housing: '120000',
        food: '45000',
        transportation: '30000',
        utilities: '25000',
        healthcare: '15000',
        entertainment: '20000',
        savings: '170000' // Surplus allocation
      };

      Object.entries(budgetCategories).forEach(([category, amount]) => {
        cy.get(`[data-cy="budget-${category}"]`).clear().type(amount);
      });

      cy.get('[data-cy="save-budget"]').click();

      // Verify budget calculations
      cy.get('[data-cy="total-budgeted"]').should('contain', 'KES 425,000');
      cy.get('[data-cy="monthly-surplus"]').should('contain', 'KES 25,000'); // 450k income - 425k budget

      // Step 6: Add Transaction History
      cy.visit('/transactions');
      
      // Add income transactions
      const transactions = [
        { description: 'Salary - January', amount: '450000', type: 'credit', category: 'Income' },
        { description: 'Rent Payment', amount: '-115000', type: 'debit', category: 'Housing' },
        { description: 'Grocery Shopping', amount: '-12000', type: 'debit', category: 'Food' },
        { description: 'Fuel', amount: '-8000', type: 'debit', category: 'Transportation' },
        { description: 'Electricity Bill', amount: '-6500', type: 'debit', category: 'Utilities' }
      ];

      transactions.forEach(transaction => {
        cy.get('[data-cy="add-transaction-btn"]').click();
        cy.get('[data-cy="transaction-description"]').type(transaction.description);
        cy.get('[data-cy="transaction-amount"]').type(transaction.amount);
        cy.get('[data-cy="transaction-category"]').select(transaction.category);
        cy.get('[data-cy="save-transaction"]').click();
        cy.wait(500); // Allow for processing
      });

      // Verify transaction list and calculations
      cy.get('[data-cy="transaction-list"]').should('contain', 'Salary - January');
      cy.get('[data-cy="net-cash-flow"]').should('contain', 'KES 308,500'); // 450k - 141.5k expenses

      // Step 7: Review Budget vs Actual
      cy.visit('/budget');
      cy.get('[data-cy="view-analysis"]').click();

      // Verify budget variance calculations
      cy.get('[data-cy="housing-variance"]').should('contain', 'KES 5,000'); // 120k budget - 115k actual
      cy.get('[data-cy="food-variance"]').should('contain', 'KES 33,000'); // 45k budget - 12k actual
      cy.get('[data-cy="overall-status"]').should('contain', 'Under Budget');

      // Step 8: Analytics and Predictions
      cy.visit('/analytics');
      cy.wait(3000); // Allow analytics to load

      // Verify goal analytics work with real data
      cy.get('[data-cy="goal-analytics-cards"]').should('have.length.greaterThan', 0);
      
      // Click on emergency fund goal
      cy.get('[data-cy="emergency-fund-analytics"]').click();
      
      // Verify Monte Carlo simulation results
      cy.get('[data-cy="success-probability"]').should('exist');
      cy.get('[data-cy="success-probability"]').should('not.contain', '0%');
      
      // Verify confidence intervals
      cy.get('[data-cy="confidence-intervals"]').should('be.visible');
      cy.get('[data-cy="percentile-10"]').should('exist');
      cy.get('[data-cy="percentile-90"]').should('exist');

      // Verify recommendations appear
      cy.get('[data-cy="recommendations"]').should('have.length.greaterThan', 0);

      // Step 9: Timeline Integration Validation
      cy.visit('/timeline');

      // Verify enhanced alignment score (should be higher with surplus)
      cy.get('[data-cy="alignment-score"]').then($score => {
        const score = parseInt($score.text());
        expect(score).to.be.greaterThan(60); // Should be good with surplus
      });

      // Verify budget integration in timeline
      cy.get('[data-cy="budget-boost"]').should('be.visible');
      cy.get('[data-cy="surplus-amount"]').should('contain', 'KES');

      // Verify contextual recommendations
      cy.get('[data-cy="smart-recommendations"]').should('exist');
      cy.get('[data-cy="surplus-allocation-rec"]').should('be.visible');

      // Step 10: Test Mobile Experience
      cy.viewport('iphone-x');
      
      // Test mobile navigation
      cy.get('[data-cy="mobile-nav-toggle"]').click();
      cy.get('[data-cy="mobile-menu"]').should('be.visible');
      
      // Navigate to budget on mobile
      cy.get('[data-cy="mobile-nav-budget"]').click();
      cy.get('[data-cy="mobile-budget-cards"]').should('be.visible');
      
      // Test mobile timeline indicators
      cy.get('[data-cy="mobile-nav-timeline"]').click();
      cy.get('[data-cy="mobile-timeline-status"]').should('be.visible');
      cy.get('[data-cy="mobile-phase-indicator"]').should('be.visible');

      // Restore desktop viewport
      cy.viewport(1280, 720);
    });

    it('validates ongoing user workflow and system updates', () => {
      // Login with existing test user
      cy.login(testUser.email, testUser.password);

      // Step 1: Add new income (bonus scenario)
      cy.visit('/transactions');
      cy.get('[data-cy="add-transaction-btn"]').click();
      cy.get('[data-cy="transaction-description"]').type('Annual Bonus');
      cy.get('[data-cy="transaction-amount"]').type('180000');
      cy.get('[data-cy="transaction-category"]').select('Income');
      cy.get('[data-cy="save-transaction"]').click();

      // Step 2: Verify real-time updates across systems
      // Check budget impact
      cy.visit('/budget');
      cy.get('[data-cy="monthly-surplus"]').should('contain', 'KES 205,000'); // Updated surplus

      // Check timeline reflection
      cy.visit('/timeline');
      cy.get('[data-cy="alignment-score"]').then($score => {
        const score = parseInt($score.text());
        expect(score).to.be.greaterThan(70); // Should improve with bonus
      });

      // Check analytics update
      cy.visit('/analytics');
      cy.wait(2000);
      cy.get('[data-cy="portfolio-health"]').should('contain', 'Excellent');

      // Step 3: Goal Progress Update Scenario
      // Add money to investment account (simulating growth)
      cy.visit('/accounts');
      cy.get('[data-cy="investment-account"]').click();
      cy.get('[data-cy="edit-balance"]').click();
      cy.get('[data-cy="balance-input"]').clear().type('95000'); // 15k growth
      cy.get('[data-cy="save-balance"]').click();

      // Verify goal progress updates
      cy.visit('/analytics');
      cy.wait(2000);
      cy.get('[data-cy="goal-progress-update"]').should('be.visible');
      
      // Step 4: Budget Adjustment Scenario
      cy.visit('/budget');
      
      // Increase housing budget (rent increase)
      cy.get('[data-cy="housing-budget-edit"]').click();
      cy.get('[data-cy="budget-amount"]').clear().type('135000'); // Rent increase
      cy.get('[data-cy="save-budget"]').click();

      // Verify impact calculations
      cy.get('[data-cy="monthly-surplus"]').should('contain', 'KES 190,000'); // Reduced surplus

      // Check timeline recommendations update
      cy.visit('/timeline');
      cy.get('[data-cy="budget-impact-alert"]').should('be.visible');

      // Step 5: Test Goal Achievement Simulation
      // Simulate achieving emergency fund goal
      cy.visit('/accounts');
      cy.get('[data-cy="primary-checking"]').click();
      cy.get('[data-cy="edit-balance"]').click();
      cy.get('[data-cy="balance-input"]').clear().type('600000'); // Emergency fund target
      cy.get('[data-cy="save-balance"]').click();

      // Verify goal completion recognition
      cy.visit('/timeline');
      cy.get('[data-cy="goal-completed-celebration"]').should('be.visible');
      cy.get('[data-cy="next-goal-focus"]').should('be.visible');

      // Step 6: Advanced Analytics Usage
      cy.visit('/analytics');
      
      // Test scenario analysis
      cy.get('[data-cy="scenario-analysis-btn"]').click();
      cy.get('[data-cy="market-crash-scenario"]').click();
      cy.wait(3000);
      
      // Verify stress test results
      cy.get('[data-cy="stress-test-results"]').should('be.visible');
      cy.get('[data-cy="risk-adjusted-probability"]').should('exist');

      // Test optimization recommendations
      cy.get('[data-cy="portfolio-optimization"]').click();
      cy.get('[data-cy="optimization-recommendations"]').should('have.length.greaterThan', 0);

      // Step 7: Profile Updates and Re-assessment
      cy.visit('/profile');
      
      // Update income (promotion scenario)
      cy.get('[data-cy="edit-financial-info"]').click();
      cy.get('[data-cy="monthly-income"]').clear().type('550000'); // 100k raise
      cy.get('[data-cy="save-changes"]').click();

      // Verify system-wide updates
      cy.visit('/timeline');
      cy.get('[data-cy="profile-update-impact"]').should('be.visible');
      
      // Check budget surplus recalculation
      cy.visit('/budget');
      cy.get('[data-cy="monthly-surplus"]').should('contain', 'KES 290,000'); // Higher surplus

      // Verify analytics reflect income change
      cy.visit('/analytics');
      cy.wait(2000);
      cy.get('[data-cy="updated-projections"]').should('be.visible');
    });

    it('validates error recovery and data consistency', () => {
      cy.login(testUser.email, testUser.password);

      // Test transaction rollback scenario
      cy.visit('/transactions');
      
      // Add transaction that exceeds account balance
      cy.get('[data-cy="add-transaction-btn"]').click();
      cy.get('[data-cy="transaction-description"]').type('Large Expense');
      cy.get('[data-cy="transaction-amount"]').type('-800000'); // More than available
      cy.get('[data-cy="transaction-category"]').select('Other');
      cy.get('[data-cy="save-transaction"]').click();

      // Verify warning appears
      cy.get('[data-cy="balance-warning"]').should('be.visible');
      cy.get('[data-cy="confirm-anyway"]').click();

      // Verify negative balance handling
      cy.visit('/accounts');
      cy.get('[data-cy="account-balance-negative"]').should('be.visible');

      // Test data consistency after correction
      cy.visit('/transactions');
      cy.get('[data-cy="transaction-list"]').first().click();
      cy.get('[data-cy="delete-transaction"]').click();
      cy.get('[data-cy="confirm-delete"]').click();

      // Verify balance corrected
      cy.visit('/accounts');
      cy.get('[data-cy="account-balance-positive"]').should('be.visible');

      // Test analytics recalculation
      cy.visit('/analytics');
      cy.wait(2000);
      cy.get('[data-cy="recalculation-complete"]').should('be.visible');
    });
  });

  describe('Returning User Experience', () => {
    it('validates returning user dashboard and insights', () => {
      // Simulate returning after time period
      cy.login(testUser.email, testUser.password);

      // Should land on timeline with historical context
      cy.url().should('include', '/timeline');
      
      // Verify historical data persisted
      cy.get('[data-cy="historical-progress"]').should('be.visible');
      cy.get('[data-cy="progress-since-last-visit"]').should('exist');

      // Check insights for returning user
      cy.get('[data-cy="insight-notifications"]').should('exist');
      cy.get('[data-cy="goal-progress-update"]').should('be.visible');

      // Verify quick actions for returning users
      cy.get('[data-cy="quick-update-transactions"]').should('be.visible');
      cy.get('[data-cy="review-goals"]').should('be.visible');
    });
  });

  after(() => {
    // Clean up test user data
    cy.exec('cd api && python -c "from app.dev import cleanup_test_user; cleanup_test_user(\'journey.test@example.com\')"', {
      failOnNonZeroExit: false
    });
  });
});

// Additional helper commands for journey testing
Cypress.Commands.add('verifySystemIntegration', () => {
  // Verify all major systems are connected and working
  
  // Check API health
  cy.request('/api/v1/health').then(response => {
    expect(response.status).to.equal(200);
  });

  // Check analytics health
  cy.request('/api/v1/analytics/health').then(response => {
    expect(response.status).to.equal(200);
  });

  // Verify database connections
  cy.request('/api/v1/transactions').then(response => {
    expect(response.status).to.equal(200);
  });
});

Cypress.Commands.add('simulateTimePassage', (days) => {
  // Mock time passage for testing timeline features
  cy.window().then(win => {
    const mockDate = new Date();
    mockDate.setDate(mockDate.getDate() + days);
    cy.clock(mockDate.getTime());
  });
});

Cypress.Commands.add('verifyDataConsistency', () => {
  // Check that data is consistent across all systems
  let transactionTotal, budgetTotal, accountTotal;

  // Get transaction totals
  cy.visit('/transactions');
  cy.get('[data-cy="net-cash-flow"]').then($el => {
    transactionTotal = parseFloat($el.text().replace(/[^\d.-]/g, ''));
  });

  // Get budget surplus
  cy.visit('/budget');
  cy.get('[data-cy="monthly-surplus"]').then($el => {
    budgetTotal = parseFloat($el.text().replace(/[^\d.-]/g, ''));
  });

  // Get account totals
  cy.visit('/accounts');
  cy.get('[data-cy="total-assets"]').then($el => {
    accountTotal = parseFloat($el.text().replace(/[^\d.-]/g, ''));
    
    // Verify consistency (within reasonable margin for rounding)
    expect(Math.abs(transactionTotal - accountTotal)).to.be.lessThan(1000);
  });
});