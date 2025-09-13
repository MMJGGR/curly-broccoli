describe('Budget Tab Only Test', () => {
  const testUser = {
    email: 'richard.mmacharia@gmail.com',
    password: 'jaggerthee'
  };

  it('should test Budget tab - Check for expense categories and amounts', () => {
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
    
    cy.log('💰 TESTING BUDGET TAB DIRECTLY');
    
    // Navigate directly to budget URL
    cy.visit('/app/budget');
    cy.wait(5000); // Allow time for data loading
    
    cy.url().should('include', '/app/budget');
    cy.screenshot('budget-tab-final-test');
    
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
      if (bodyText.includes('84000') || bodyText.includes('84,000') || bodyText.includes('70000') || bodyText.includes('70,000')) {
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
      
      // Log first 500 characters for debugging
      cy.log(`📝 Page content preview: ${bodyText.substring(0, 500)}...`);
    });
  });
});