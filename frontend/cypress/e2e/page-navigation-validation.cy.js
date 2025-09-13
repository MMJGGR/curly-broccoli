describe('Page Navigation Validation - Balance Sheet & Expense Category Issues', () => {
  const testUser = {
    email: 'richard.mmacharia@gmail.com',
    password: 'jaggerthee'
  };

  beforeEach(() => {
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Visit the login page
    cy.visit('/');
    
    // Login with the provided credentials
    cy.contains('Welcome Back', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').contains('Login').click();
    
    // Wait for successful login and redirect
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    cy.url().should('include', '/dashboard');
  });

  context('Dashboard Page Analysis', () => {
    it('should capture dashboard state and identify balance sheet issues', () => {
      cy.log('📊 TESTING DASHBOARD PAGE');
      
      // Take screenshot of dashboard
      cy.screenshot('01-dashboard-overview');
      
      // Check for balance sheet section
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="balance-sheet"]').length > 0) {
          cy.get('[data-testid="balance-sheet"]').screenshot('01-balance-sheet-section');
          cy.log('✅ Balance sheet section found');
        } else {
          cy.log('❌ Balance sheet section NOT found');
        }
      });
      
      // Check for expense summary
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid="expense-summary"]').length > 0) {
          cy.get('[data-testid="expense-summary"]').screenshot('01-expense-summary-section');
          cy.log('✅ Expense summary section found');
        } else {
          cy.log('❌ Expense summary section NOT found');
        }
      });
      
      // Look for any loading indicators or error messages
      cy.get('body').should('be.visible');
      cy.wait(3000); // Allow time for data loading
      cy.screenshot('01-dashboard-after-loading');
    });
  });

  context('Balance Sheet Page Analysis', () => {
    it('should navigate to balance sheet and capture current state', () => {
      cy.log('⚖️ TESTING BALANCE SHEET PAGE');
      
      // Navigate to balance sheet (check multiple possible paths)
      cy.get('body').then(($body) => {
        if ($body.find('[href*="balance"]').length > 0) {
          cy.get('[href*="balance"]').first().click();
        } else if ($body.find('nav a').length > 0) {
          // Look for navigation links containing balance-related terms
          cy.get('nav a').each(($el) => {
            const text = $el.text().toLowerCase();
            if (text.includes('balance') || text.includes('sheet') || text.includes('net worth')) {
              cy.wrap($el).click();
              return false; // Exit the loop
            }
          });
        } else {
          cy.log('❌ No balance sheet navigation found');
        }
      });
      
      // Wait for page to load
      cy.wait(3000);
      cy.screenshot('02-balance-sheet-page');
      
      // Check for specific balance sheet elements
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        
        // Expected elements in balance sheet
        const expectedElements = ['assets', 'liabilities', 'net worth', 'equity'];
        const foundElements = expectedElements.filter(element => 
          bodyText.includes(element)
        );
        
        cy.log(`✅ Found balance sheet elements: ${foundElements.join(', ')}`);
        cy.log(`❌ Missing balance sheet elements: ${expectedElements.filter(e => !foundElements.includes(e)).join(', ')}`);
      });
      
      // Check for loading or error states
      cy.get('body').then(($body) => {
        if ($body.find('.loading, .spinner, [data-testid="loading"]').length > 0) {
          cy.log('⏳ Loading indicator found - balance sheet may still be loading');
          cy.screenshot('02-balance-sheet-loading');
        }
        
        if ($body.find('.error, .alert-error, [data-testid="error"]').length > 0) {
          cy.log('❌ Error indicator found on balance sheet');
          cy.screenshot('02-balance-sheet-error');
        }
      });
    });
  });

  context('Expenses Page Analysis', () => {
    it('should navigate to expenses and capture expense category state', () => {
      cy.log('💰 TESTING EXPENSES PAGE');
      
      // Navigate to expenses page
      cy.get('body').then(($body) => {
        if ($body.find('[href*="expense"]').length > 0) {
          cy.get('[href*="expense"]').first().click();
        } else if ($body.find('nav a').length > 0) {
          cy.get('nav a').each(($el) => {
            const text = $el.text().toLowerCase();
            if (text.includes('expense') || text.includes('spending') || text.includes('budget')) {
              cy.wrap($el).click();
              return false;
            }
          });
        } else {
          cy.log('❌ No expenses navigation found');
        }
      });
      
      cy.wait(3000);
      cy.screenshot('03-expenses-page');
      
      // Check for expense categories that should be visible
      const expectedCategories = [
        'rent', 'utilities', 'groceries', 'transport', 'loan', 'housing', 'food', 'transportation'
      ];
      
      cy.get('body').then(($body) => {
        const bodyText = $body.text().toLowerCase();
        const foundCategories = expectedCategories.filter(category => 
          bodyText.includes(category)
        );
        
        cy.log(`✅ Found expense categories: ${foundCategories.join(', ')}`);
        cy.log(`❌ Missing expense categories: ${expectedCategories.filter(c => !foundCategories.includes(c)).join(', ')}`);
      });
      
      // Check for expense amounts - should see values like 30000, 8400, 24000, etc.
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        const amounts = ['30000', '8400', '24000', '12000', '9600', '70000'];
        const foundAmounts = amounts.filter(amount => bodyText.includes(amount));
        
        cy.log(`✅ Found expected amounts: ${foundAmounts.join(', ')}`);
        cy.log(`❌ Missing expected amounts: ${amounts.filter(a => !foundAmounts.includes(a)).join(', ')}`);
      });
      
      // Check for zero or empty states
      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        if (bodyText.includes('No expenses') || bodyText.includes('0.00') || bodyText.includes('Empty')) {
          cy.log('❌ Expenses page showing empty/zero state');
          cy.screenshot('03-expenses-empty-state');
        }
      });
    });
  });

  context('Tools/Management Pages Analysis', () => {
    it('should navigate to financial management tools', () => {
      cy.log('🔧 TESTING TOOLS/MANAGEMENT PAGES');
      
      // Try to find tools or management navigation
      cy.get('body').then(($body) => {
        if ($body.find('[href*="tools"], [href*="manage"], [href*="settings"]').length > 0) {
          cy.get('[href*="tools"], [href*="manage"], [href*="settings"]').first().click();
          cy.wait(3000);
          cy.screenshot('04-tools-management-page');
        } else {
          cy.log('❌ No tools/management navigation found');
        }
      });
    });
  });

  context('API Response Analysis', () => {
    it('should intercept API calls and validate data structure', () => {
      cy.log('🔍 TESTING API RESPONSES');
      
      // Intercept expense API calls
      cy.intercept('GET', '**/api/v1/expenses**').as('expensesAPI');
      cy.intercept('GET', '**/api/v1/income**').as('incomeAPI');
      cy.intercept('GET', '**/api/v1/assets**').as('assetsAPI');
      cy.intercept('GET', '**/api/v1/liabilities**').as('liabilitiesAPI');
      
      // Reload page to trigger API calls
      cy.reload();
      
      // Wait for and validate expense API response
      cy.wait('@expensesAPI', { timeout: 10000 }).then((interception) => {
        const response = interception.response.body;
        cy.log('📡 Expense API Response:', JSON.stringify(response, null, 2));
        
        // Validate expected structure
        if (response.expenses && Array.isArray(response.expenses)) {
          cy.log(`✅ Expenses array found with ${response.expenses.length} items`);
          if (response.expenses.length > 0) {
            cy.log('✅ First expense:', JSON.stringify(response.expenses[0], null, 2));
          } else {
            cy.log('❌ Expenses array is empty');
          }
        } else {
          cy.log('❌ No expenses array in response or wrong format');
        }
        
        if (response.summary) {
          cy.log('✅ Summary found:', JSON.stringify(response.summary, null, 2));
        } else {
          cy.log('❌ No summary in response');
        }
      });
      
      cy.screenshot('05-api-response-validation');
    });
  });

  after(() => {
    cy.log('📋 TEST SUMMARY:');
    cy.log('🔍 Check the screenshots in cypress/screenshots/ for visual evidence');
    cy.log('📊 Review the console logs above for detailed findings');
    cy.log('⚠️  Expected: Balance sheet with assets/liabilities, Expenses showing 5 categories (rent, utilities, groceries, transport, loans)');
  });
});