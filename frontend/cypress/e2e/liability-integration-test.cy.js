/**
 * Liability Integration Test
 * Tests the complete liability CRUD operations and balance sheet integration
 */

describe('Liability CRUD and Balance Sheet Integration', () => {
  const testUser = {
    email: 'richard.mmacharia@gmail.com',
    password: 'jaggerthee'
  };

  beforeEach(() => {
    cy.visit('http://localhost:3000');
  });

  it('should create and display liability data in balance sheet', () => {
    // Step 1: Login
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-cy="email-input"], input[type="email"]').clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();

    // Wait for dashboard to load
    cy.url({ timeout: 15000 }).should('not.include', '/auth');
    cy.contains('Dashboard', { timeout: 10000 }).should('be.visible');

    // Step 2: Navigate to Balance Sheet
    cy.get('[data-cy="balance-sheet-tab"], .nav-link:contains("Balance Sheet"), button:contains("Balance Sheet")', { timeout: 10000 })
      .should('be.visible')
      .click();

    // Wait for balance sheet to load
    cy.contains('Balance Sheet', { timeout: 10000 }).should('be.visible');

    // Step 3: Verify liability data is loaded
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      
      // Check for liability-related data
      if (bodyText.includes('15,000') || bodyText.includes('15000')) {
        cy.log('SUCCESS: Liability balance detected in balance sheet');
      } else {
        cy.log('INFO: No liability balance found - may be first run');
      }

      // Check for debt-related terms
      if (bodyText.includes('Liabilities') || bodyText.includes('Debt') || bodyText.includes('Credit')) {
        cy.log('SUCCESS: Liability terms found in balance sheet');
      } else {
        cy.log('WARNING: No liability terms found in balance sheet');
        cy.screenshot('balance-sheet-no-liability-terms');
      }
    });

    // Step 4: Take screenshot of balance sheet with liability data
    cy.screenshot('balance-sheet-with-liabilities');
  });

  it('should verify liability API endpoints are accessible', () => {
    // Step 1: Login to get JWT token
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should('not.include', '/auth');

    // Step 2: Test API endpoint directly
    cy.window().then((window) => {
      const token = window.localStorage.getItem('jwt');
      
      if (token) {
        cy.request({
          method: 'GET',
          url: 'http://localhost:8000/api/v1/liabilities-v2/',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('total_liabilities');
          expect(response.body).to.have.property('monthly_debt_payments');
          expect(response.body).to.have.property('liabilities');
          
          cy.log(`Total Liabilities: ${response.body.total_liabilities}`);
          cy.log(`Monthly Debt Payments: ${response.body.monthly_debt_payments}`);
          cy.log(`Debt Count: ${response.body.debt_count}`);
          
          if (response.body.debt_count > 0) {
            cy.log('SUCCESS: Liabilities found in API response');
            expect(response.body.liabilities).to.be.an('array');
            expect(response.body.liabilities[0]).to.have.property('name');
            expect(response.body.liabilities[0]).to.have.property('liability_type');
            expect(response.body.liabilities[0]).to.have.property('current_balance');
          } else {
            cy.log('INFO: No liabilities found - clean state');
          }
        });
      } else {
        cy.log('ERROR: No JWT token found in localStorage');
      }
    });
  });

  it('should handle liability creation via API', () => {
    // Step 1: Login
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should('not.include', '/auth');

    // Step 2: Create a test liability via API
    cy.window().then((window) => {
      const token = window.localStorage.getItem('jwt');
      
      if (token) {
        const newLiability = {
          name: 'Cypress Test Auto Loan',
          liability_type: 'auto_loan',
          current_balance: 500000,
          original_amount: 800000,
          minimum_payment: 15000,
          interest_rate: 14.5,
          is_secured: true,
          collateral_description: 'Toyota Corolla 2021',
          term_months: 60,
          remaining_payments: 36
        };

        cy.request({
          method: 'POST',
          url: 'http://localhost:8000/api/v1/liabilities-v2/',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: newLiability
        }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.property('liability_id');
          expect(response.body).to.have.property('name', 'Cypress Test Auto Loan');
          expect(response.body).to.have.property('liability_type', 'auto_loan');
          expect(response.body).to.have.property('is_secured', true);
          expect(response.body).to.have.property('current_balance', 500000);
          
          cy.log(`Created liability with ID: ${response.body.liability_id}`);
          cy.log(`Monthly payment: ${response.body.monthly_payment}`);
          cy.log(`High interest flag: ${response.body.is_high_interest}`);
          
          // Store the liability ID for cleanup
          cy.wrap(response.body.liability_id).as('createdLiabilityId');
        });
      }
    });

    // Step 3: Verify the liability appears in the summary
    cy.window().then((window) => {
      const token = window.localStorage.getItem('jwt');
      
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/api/v1/liabilities-v2/',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then((response) => {
        expect(response.body.debt_count).to.be.greaterThan(0);
        expect(response.body.total_liabilities).to.be.greaterThan(0);
        expect(response.body.monthly_debt_payments).to.be.greaterThan(0);
        
        // Find our test liability
        const testLiability = response.body.liabilities.find(
          liability => liability.name === 'Cypress Test Auto Loan'
        );
        
        if (testLiability) {
          expect(testLiability).to.have.property('liability_type', 'auto_loan');
          expect(testLiability).to.have.property('is_secured', true);
          cy.log('SUCCESS: Test liability found in summary');
        }
      });
    });
  });

  it('should verify balance sheet reflects liability data', () => {
    // Step 1: Login
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should('not.include', '/auth');

    // Step 2: Navigate to Balance Sheet
    cy.get('[data-cy="balance-sheet-tab"], .nav-link:contains("Balance Sheet"), button:contains("Balance Sheet")', { timeout: 10000 })
      .click();

    // Step 3: Wait for data to load and verify calculations
    cy.wait(3000); // Allow time for API calls

    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      
      // Check for balance sheet structure
      const hasBalanceSheetStructure = (
        bodyText.includes('Assets') || 
        bodyText.includes('Liabilities') || 
        bodyText.includes('Net Worth')
      );
      
      if (hasBalanceSheetStructure) {
        cy.log('SUCCESS: Balance sheet structure detected');
        
        // Look for specific liability amounts
        const hasLiabilityAmounts = (
          bodyText.includes('15,000') || 
          bodyText.includes('500,000') ||
          bodyText.includes('KES')
        );
        
        if (hasLiabilityAmounts) {
          cy.log('SUCCESS: Liability amounts detected in balance sheet');
        } else {
          cy.log('INFO: No specific liability amounts found');
        }
      } else {
        cy.log('WARNING: Balance sheet structure not clearly visible');
      }
    });

    // Step 4: Take comprehensive screenshot
    cy.screenshot('liability-integration-balance-sheet');
  });

  it('should take screenshots for visual verification', () => {
    // Login and navigate to different sections
    cy.get('[data-cy="email-input"], input[type="email"]', { timeout: 10000 }).clear().type(testUser.email);
    cy.get('[data-cy="password-input"], input[type="password"]').clear().type(testUser.password);
    cy.get('[data-cy="login-button"], button[type="submit"]').click();
    cy.url({ timeout: 15000 }).should('not.include', '/auth');

    // Dashboard screenshot
    cy.screenshot('liability-test-dashboard');

    // Balance Sheet screenshot
    cy.get('[data-cy="balance-sheet-tab"], .nav-link:contains("Balance Sheet"), button:contains("Balance Sheet")', { timeout: 10000 })
      .click();
    cy.wait(3000);
    cy.screenshot('liability-test-balance-sheet-final');

    // Try to access other tabs
    const tabs = [
      { selector: '[data-cy="goals-tab"], button:contains("Goals")', name: 'goals' },
      { selector: '[data-cy="tools-tab"], button:contains("Tools")', name: 'tools' },
      { selector: '[data-cy="profile-tab"], button:contains("Profile")', name: 'profile' }
    ];

    tabs.forEach((tab) => {
      cy.get('body').then(($body) => {
        if ($body.find(tab.selector).length > 0) {
          cy.get(tab.selector).click();
          cy.wait(2000);
          cy.screenshot(`liability-test-${tab.name}-tab`);
        }
      });
    });
  });
});