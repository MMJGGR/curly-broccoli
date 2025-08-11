/**
 * Comprehensive Integration Validation Test
 * Tests all three priority systems working together as complete functional application
 */

describe('Comprehensive System Integration', () => {
  beforeEach(() => {
    // Reset database state and login
    cy.exec('cd api && python -c "from app.dev import reset_test_data; reset_test_data()"');
    cy.login('test@example.com', 'password123');
  });

  describe('End-to-End Data Flow Integration', () => {
    it('validates complete data pipeline from onboarding to analytics', () => {
      // Step 1: Complete onboarding creates user profile
      cy.visit('/onboarding');
      cy.completeOnboardingFlow({
        personalInfo: {
          name: 'Integration Test User',
          age: 35,
          income: 500000
        },
        financialInfo: {
          monthlyExpenses: 150000,
          currentSavings: 100000
        },
        goals: [
          { name: 'Emergency Fund', target: 300000, timeframe: 12 },
          { name: 'Retirement', target: 5000000, timeframe: 360 }
        ]
      });

      // Verify onboarding data persisted
      cy.url().should('include', '/timeline');
      cy.get('[data-cy="persona-badge"]').should('contain', 'Profile');
      cy.get('[data-cy="alignment-score"]').should('exist');

      // Step 2: Add real account data (feeds into analytics)
      cy.visit('/accounts');
      cy.get('[data-cy="add-account-btn"]').click();
      cy.get('[data-cy="account-type-select"]').select('checking');
      cy.get('[data-cy="account-name-input"]').type('Primary Checking');
      cy.get('[data-cy="account-balance-input"]').type('250000');
      cy.get('[data-cy="save-account-btn"]').click();

      // Verify account appears in system
      cy.get('[data-cy="account-item"]').should('contain', 'Primary Checking');
      cy.get('[data-cy="account-balance"]').should('contain', 'KES 250,000');

      // Step 3: Create transactions (feeds into budget vs actual)
      cy.visit('/transactions');
      cy.get('[data-cy="add-transaction-btn"]').click();
      cy.get('[data-cy="transaction-description"]').type('Salary Payment');
      cy.get('[data-cy="transaction-amount"]').type('150000');
      cy.get('[data-cy="transaction-type"]').select('credit');
      cy.get('[data-cy="transaction-category"]').select('Income');
      cy.get('[data-cy="save-transaction-btn"]').click();

      // Add expense transaction
      cy.get('[data-cy="add-transaction-btn"]').click();
      cy.get('[data-cy="transaction-description"]').type('Rent Payment');
      cy.get('[data-cy="transaction-amount"]').type('-50000');
      cy.get('[data-cy="transaction-category"]').select('Housing');
      cy.get('[data-cy="save-transaction-btn"]').click();

      // Verify transactions appear and affect account balance
      cy.get('[data-cy="transaction-list"]').should('contain', 'Salary Payment');
      cy.get('[data-cy="transaction-list"]').should('contain', 'Rent Payment');

      // Step 4: Set up budget (integrates with transaction data)
      cy.visit('/budget');
      cy.get('[data-cy="setup-budget-btn"]').click();
      cy.get('[data-cy="housing-budget"]').clear().type('60000');
      cy.get('[data-cy="food-budget"]').clear().type('30000');
      cy.get('[data-cy="transportation-budget"]').clear().type('20000');
      cy.get('[data-cy="save-budget-btn"]').click();

      // Verify budget vs actual calculations work
      cy.get('[data-cy="budget-vs-actual"]').should('exist');
      cy.get('[data-cy="housing-actual"]').should('contain', '50,000');
      cy.get('[data-cy="housing-variance"]').should('contain', '10,000'); // 60k budget - 50k actual

      // Step 5: Verify analytics engine processes real data
      cy.visit('/analytics');
      cy.wait(2000); // Allow analytics to process

      // Check Monte Carlo simulations work with real account data
      cy.get('[data-cy="goal-analytics"]').first().click();
      cy.get('[data-cy="success-probability"]').should('exist');
      cy.get('[data-cy="success-probability"]').should('not.contain', '0%'); // Should have calculated value

      // Verify confidence intervals are displayed
      cy.get('[data-cy="confidence-intervals"]').should('exist');
      cy.get('[data-cy="percentile-10"]').should('exist');
      cy.get('[data-cy="percentile-90"]').should('exist');

      // Step 6: Timeline integrates all data sources
      cy.visit('/timeline');

      // Verify alignment score reflects integrated data
      cy.get('[data-cy="alignment-score"]').then($score => {
        const score = parseInt($score.text());
        expect(score).to.be.greaterThan(0);
        expect(score).to.be.lessThan(101);
      });

      // Verify contextual guidance appears based on surplus
      cy.get('[data-cy="surplus-amount"]').should('exist');
      cy.get('[data-cy="budget-recommendations"]').should('exist');

      // Step 7: Mobile experience works across all features
      cy.viewport('iphone-x');
      
      // Check mobile navigation works
      cy.get('[data-cy="mobile-nav"]').should('be.visible');
      cy.get('[data-cy="nav-budget"]').click();
      cy.url().should('include', '/budget');
      
      // Verify mobile budget interface
      cy.get('[data-cy="mobile-budget-summary"]').should('be.visible');
      cy.get('[data-cy="surplus-indicator"]').should('be.visible');

      cy.get('[data-cy="nav-timeline"]').click();
      cy.get('[data-cy="mobile-timeline-status"]').should('be.visible');
    });

    it('validates real-time data synchronization across systems', () => {
      // Login and setup initial state
      cy.login('test@example.com', 'password123');
      cy.setupTestData();

      // Test 1: Transaction change reflects in budget and analytics
      cy.visit('/transactions');
      
      // Add significant income transaction
      cy.addTransaction({
        description: 'Bonus Payment',
        amount: 100000,
        category: 'Income'
      });

      // Verify immediate budget impact
      cy.visit('/budget');
      cy.get('[data-cy="monthly-surplus"]').should('contain', '100,000');

      // Verify timeline reflects the change
      cy.visit('/timeline');
      cy.get('[data-cy="budget-boost"]').should('be.visible');

      // Test 2: Account balance change reflects in goal progress
      cy.visit('/accounts');
      cy.updateAccountBalance('Primary Checking', 500000);

      cy.visit('/analytics');
      cy.wait(2000);
      
      // Verify goal progress updated with new balance
      cy.get('[data-cy="goal-progress"]').first().should('not.contain', '0%');

      // Test 3: Budget change affects timeline recommendations
      cy.visit('/budget');
      cy.updateBudgetCategory('Housing', 80000); // Increase housing budget

      cy.visit('/timeline');
      cy.get('[data-cy="budget-recommendations"]').should('contain', 'housing');
    });

    it('validates error handling and graceful degradation', () => {
      cy.login('test@example.com', 'password123');

      // Test API failure scenarios
      cy.intercept('GET', '/api/v1/analytics/**', { statusCode: 500 }).as('analyticsFailure');
      
      cy.visit('/timeline');
      cy.wait('@analyticsFailure');

      // Verify system continues to work without analytics
      cy.get('[data-cy="alignment-score"]').should('exist'); // Should fall back to basic calculation
      cy.get('[data-cy="error-message"]').should('not.exist'); // Should not show error to user

      // Test transaction system with network issues
      cy.intercept('POST', '/api/v1/transactions/', { statusCode: 500 }).as('transactionFailure');
      
      cy.visit('/transactions');
      cy.get('[data-cy="add-transaction-btn"]').click();
      cy.fillTransactionForm({
        description: 'Test Transaction',
        amount: 1000,
        category: 'Food'
      });
      cy.get('[data-cy="save-transaction-btn"]').click();
      
      cy.wait('@transactionFailure');
      
      // Verify error handling
      cy.get('[data-cy="error-toast"]').should('be.visible');
      cy.get('[data-cy="retry-btn"]').should('be.visible');

      // Test offline behavior
      cy.window().then(win => {
        win.navigator.onLine = false;
      });

      cy.get('[data-cy="offline-indicator"]').should('be.visible');
      cy.get('[data-cy="cached-data-notice"]').should('be.visible');
    });
  });

  describe('Performance and Scalability', () => {
    it('handles large datasets efficiently', () => {
      cy.login('test@example.com', 'password123');
      
      // Create large number of transactions
      cy.exec('cd api && python -c "from tests.populate_test_data import create_large_dataset; create_large_dataset()"');

      // Test transaction list performance
      cy.visit('/transactions');
      cy.get('[data-cy="transaction-list"]').should('be.visible');
      
      // Verify pagination works
      cy.get('[data-cy="page-indicator"]').should('contain', '1 of');
      cy.get('[data-cy="next-page-btn"]').click();
      cy.get('[data-cy="page-indicator"]').should('contain', '2 of');

      // Test search/filter performance
      cy.get('[data-cy="search-input"]').type('salary');
      cy.get('[data-cy="filter-results"]').should('be.visible');

      // Test analytics with large dataset
      cy.visit('/analytics');
      
      // Verify Monte Carlo simulation completes in reasonable time
      cy.get('[data-cy="analytics-loading"]').should('be.visible');
      cy.get('[data-cy="simulation-results"]', { timeout: 30000 }).should('be.visible');

      // Test timeline rendering performance
      cy.visit('/timeline');
      cy.get('[data-cy="timeline-visualization"]').should('be.visible');
    });

    it('validates mobile performance across all features', () => {
      cy.viewport('iphone-x');
      cy.login('test@example.com', 'password123');

      // Test mobile timeline performance
      cy.visit('/timeline');
      cy.get('[data-cy="mobile-timeline"]').should('be.visible');
      
      // Verify touch interactions work
      cy.get('[data-cy="mobile-nav-toggle"]').click();
      cy.get('[data-cy="mobile-menu"]').should('be.visible');

      // Test mobile budget interactions
      cy.get('[data-cy="nav-budget"]').click();
      cy.get('[data-cy="mobile-budget-cards"]').should('be.visible');
      
      // Test swipe gestures (if implemented)
      cy.get('[data-cy="budget-card"]').first().swipe('left');
      cy.get('[data-cy="budget-actions"]').should('be.visible');

      // Test mobile transaction management
      cy.visit('/transactions');
      cy.get('[data-cy="mobile-transaction-list"]').should('be.visible');
      
      // Verify infinite scroll or pagination on mobile
      cy.scrollTo('bottom');
      cy.get('[data-cy="load-more"]').should('be.visible');
    });
  });

  describe('Security and Data Integrity', () => {
    it('validates data security and user isolation', () => {
      // Create two test users
      cy.createUser('user1@test.com', 'password1');
      cy.createUser('user2@test.com', 'password2');

      // Login as user1 and create data
      cy.login('user1@test.com', 'password1');
      cy.addTransaction({ description: 'User1 Transaction', amount: 1000 });
      cy.addAccount({ name: 'User1 Account', balance: 5000 });

      // Login as user2
      cy.login('user2@test.com', 'password2');
      
      // Verify user2 cannot see user1's data
      cy.visit('/transactions');
      cy.get('[data-cy="transaction-list"]').should('not.contain', 'User1 Transaction');
      
      cy.visit('/accounts');
      cy.get('[data-cy="account-list"]').should('not.contain', 'User1 Account');

      // Verify API security
      cy.request({
        method: 'GET',
        url: '/api/v1/transactions',
        failOnStatusCode: false
      }).then(response => {
        expect(response.status).to.not.equal(200); // Should require authentication
      });
    });

    it('validates data consistency across systems', () => {
      cy.login('test@example.com', 'password123');
      
      // Create transaction
      const transactionData = {
        description: 'Consistency Test',
        amount: -2000,
        category: 'Food'
      };
      
      cy.addTransaction(transactionData);
      
      // Verify transaction appears in all relevant places
      cy.visit('/transactions');
      cy.get('[data-cy="transaction-list"]').should('contain', 'Consistency Test');
      
      cy.visit('/budget');
      cy.get('[data-cy="food-actual"]').should('contain', '2,000');
      
      cy.visit('/analytics');
      cy.get('[data-cy="spending-breakdown"]').should('contain', 'Food');
      
      // Update transaction
      cy.visit('/transactions');
      cy.get('[data-cy="transaction-item"]').first().click();
      cy.get('[data-cy="edit-transaction"]').click();
      cy.get('[data-cy="transaction-amount"]').clear().type('-3000');
      cy.get('[data-cy="save-changes"]').click();
      
      // Verify update propagated
      cy.visit('/budget');
      cy.get('[data-cy="food-actual"]').should('contain', '3,000');
      
      // Delete transaction
      cy.visit('/transactions');
      cy.get('[data-cy="transaction-item"]').first().click();
      cy.get('[data-cy="delete-transaction"]').click();
      cy.get('[data-cy="confirm-delete"]').click();
      
      // Verify deletion propagated
      cy.visit('/budget');
      cy.get('[data-cy="food-actual"]').should('contain', '0');
    });
  });
});

// Custom commands for integration testing
Cypress.Commands.add('completeOnboardingFlow', (data) => {
  // Step 1: Personal Info
  cy.get('[data-cy="personal-name"]').type(data.personalInfo.name);
  cy.get('[data-cy="personal-age"]').type(data.personalInfo.age.toString());
  cy.get('[data-cy="personal-income"]').type(data.personalInfo.income.toString());
  cy.get('[data-cy="next-step"]').click();

  // Step 2: Financial Info
  cy.get('[data-cy="monthly-expenses"]').type(data.financialInfo.monthlyExpenses.toString());
  cy.get('[data-cy="current-savings"]').type(data.financialInfo.currentSavings.toString());
  cy.get('[data-cy="next-step"]').click();

  // Step 3: Goals
  data.goals.forEach((goal, index) => {
    cy.get('[data-cy="add-goal"]').click();
    cy.get(`[data-cy="goal-name-${index}"]`).type(goal.name);
    cy.get(`[data-cy="goal-target-${index}"]`).type(goal.target.toString());
    cy.get(`[data-cy="goal-timeframe-${index}"]`).type(goal.timeframe.toString());
  });
  cy.get('[data-cy="complete-onboarding"]').click();
});

Cypress.Commands.add('addTransaction', (data) => {
  cy.get('[data-cy="add-transaction-btn"]').click();
  cy.get('[data-cy="transaction-description"]').type(data.description);
  cy.get('[data-cy="transaction-amount"]').type(data.amount.toString());
  if (data.category) {
    cy.get('[data-cy="transaction-category"]').select(data.category);
  }
  cy.get('[data-cy="save-transaction-btn"]').click();
});

Cypress.Commands.add('addAccount', (data) => {
  cy.get('[data-cy="add-account-btn"]').click();
  cy.get('[data-cy="account-name-input"]').type(data.name);
  cy.get('[data-cy="account-balance-input"]').type(data.balance.toString());
  cy.get('[data-cy="save-account-btn"]').click();
});

Cypress.Commands.add('updateAccountBalance', (accountName, newBalance) => {
  cy.get('[data-cy="account-list"]').contains(accountName).click();
  cy.get('[data-cy="edit-balance"]').click();
  cy.get('[data-cy="balance-input"]').clear().type(newBalance.toString());
  cy.get('[data-cy="save-balance"]').click();
});

Cypress.Commands.add('updateBudgetCategory', (categoryName, newAmount) => {
  cy.get('[data-cy="budget-categories"]').contains(categoryName).within(() => {
    cy.get('[data-cy="edit-budget"]').click();
    cy.get('[data-cy="budget-amount"]').clear().type(newAmount.toString());
    cy.get('[data-cy="save-budget"]').click();
  });
});

Cypress.Commands.add('fillTransactionForm', (data) => {
  cy.get('[data-cy="transaction-description"]').type(data.description);
  cy.get('[data-cy="transaction-amount"]').type(data.amount.toString());
  cy.get('[data-cy="transaction-category"]').select(data.category);
});

Cypress.Commands.add('setupTestData', () => {
  cy.exec('cd api && python -c "from tests.setup_integration_data import setup; setup()"');
});

Cypress.Commands.add('createUser', (email, password) => {
  cy.request('POST', '/api/v1/auth/register', {
    email,
    password,
    name: 'Test User'
  });
});

// Swipe command for mobile testing
Cypress.Commands.add('swipe', { prevSubject: 'element' }, (subject, direction) => {
  const touchStartEvent = new TouchEvent('touchstart', {
    touches: [new Touch({ identifier: 0, target: subject[0], clientX: 100, clientY: 100 })]
  });
  
  const touchEndEvent = new TouchEvent('touchend', {
    touches: []
  });

  subject[0].dispatchEvent(touchStartEvent);
  
  setTimeout(() => {
    subject[0].dispatchEvent(touchEndEvent);
  }, 100);
});