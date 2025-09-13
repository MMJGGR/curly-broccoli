describe('Direct Navigation Test - One Tab at a Time', () => {
  const testUser = {
    email: 'richard.mmacharia@gmail.com',
    password: 'jaggerthee'
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('/');
    
    // Login
    cy.contains('Welcome Back', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button[type="submit"]').contains('Login').click();
    
    // Wait for successful login
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    cy.url().should('include', '/dashboard');
  });

  it('should test Budget tab - Check for expense categories and amounts', () => {
    cy.log('💰 TESTING BUDGET TAB DIRECTLY');
    
    // Navigate directly to budget URL
    cy.visit('/app/budget');
    cy.wait(5000); // Allow time for data loading
    
    cy.url().should('include', '/app/budget');
    cy.screenshot('budget-tab-loaded');
    
    // Check page content
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase();
      cy.log('📄 Budget page loaded');
      
      // Check for expense categories
      const expectedCategories = ['rent', 'utilities', 'groceries', 'transport', 'loan'];
      const foundCategories = expectedCategories.filter(cat => bodyText.includes(cat));
      
      cy.log(`✅ Found expense categories: ${foundCategories.join(', ')}`);
      cy.log(`❌ Missing expense categories: ${expectedCategories.filter(c => !foundCategories.includes(c)).join(', ')}`);
      
      // Check for expected amounts
      const expectedAmounts = ['30000', '8400', '24000', '12000', '9600'];
      const foundAmounts = expectedAmounts.filter(amt => bodyText.includes(amt));
      
      cy.log(`✅ Found expected amounts: ${foundAmounts.join(', ')}`);
      cy.log(`❌ Missing expected amounts: ${expectedAmounts.filter(a => !foundAmounts.includes(a)).join(', ')}`);
      
      // Check for total
      if (bodyText.includes('84000') || bodyText.includes('84,000')) {
        cy.log('✅ Total expense amount found');
      } else {
        cy.log('❌ Total expense amount NOT found');
      }
      
      // Check for empty states
      if (bodyText.includes('no expenses') || bodyText.includes('empty') || bodyText.includes('0.00')) {
        cy.log('❌ Budget shows empty state');
      } else {
        cy.log('✅ Budget shows data');
      }
    });
  });

  it('should test Balance Sheet tab - Check if it loads without errors', () => {
    cy.log('⚖️ TESTING BALANCE SHEET TAB DIRECTLY');
    
    // Navigate directly to balance sheet URL
    cy.visit('/app/balance-sheet');
    cy.wait(5000); // Allow time for data loading
    
    cy.url().should('include', '/app/balance-sheet');
    cy.screenshot('balance-sheet-tab-loaded');
    
    // Check page content
    cy.get('body').then(($body) => {
      const bodyText = $body.text().toLowerCase();
      cy.log('📄 Balance Sheet page loaded');
      
      // Check for balance sheet elements
      const expectedElements = ['assets', 'liabilities', 'net worth', 'equity', 'total'];
      const foundElements = expectedElements.filter(element => bodyText.includes(element));
      
      cy.log(`✅ Found balance sheet elements: ${foundElements.join(', ')}`);
      cy.log(`❌ Missing balance sheet elements: ${expectedElements.filter(e => !foundElements.includes(e)).join(', ')}`);
      
      // Check for loading indicators
      if (bodyText.includes('loading') || $body.find('.loading, .spinner').length > 0) {
        cy.log('⏳ Balance sheet still loading');
      } else {
        cy.log('✅ Balance sheet finished loading');
      }
      
      // Check for error states
      if (bodyText.includes('error') || bodyText.includes('failed') || $body.find('.error').length > 0) {
        cy.log('❌ Balance sheet shows error');
      } else {
        cy.log('✅ Balance sheet shows no errors');
      }
    });
  });

  it('should test Profile tab - Check user information', () => {
    cy.log('👤 TESTING PROFILE TAB DIRECTLY');
    
    // Navigate directly to profile URL
    cy.visit('/app/profile');
    cy.wait(3000);
    
    cy.url().should('include', '/app/profile');
    cy.screenshot('profile-tab-loaded');
    
    // Check page content
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      cy.log('📄 Profile page loaded');
      
      // Check for user information
      if (bodyText.includes('richard') || bodyText.includes('Richard')) {
        cy.log('✅ User name found in profile');
      } else {
        cy.log('❌ User name NOT found in profile');
      }
      
      if (bodyText.includes(testUser.email)) {
        cy.log('✅ User email found in profile');
      } else {
        cy.log('❌ User email NOT found in profile');
      }
      
      // Check for profile elements
      const profileElements = ['age', 'income', 'risk', 'goals', 'personal'];
      const foundElements = profileElements.filter(element => 
        bodyText.toLowerCase().includes(element)
      );
      
      cy.log(`✅ Found profile elements: ${foundElements.join(', ')}`);
    });
  });
});