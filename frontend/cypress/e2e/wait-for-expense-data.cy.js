describe('Wait for Expense Data to Load', () => {
  it('should wait for expense data and capture when loaded', () => {
    // Visit and login
    cy.visit('/');
    cy.contains('Welcome Back', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="email"]').type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').type('jaggerthee');
    cy.get('button[type="submit"]').contains('Login').click();
    
    // Wait for dashboard
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    
    // Go to budget page
    cy.visit('/app/budget');
    
    cy.log('💰 Waiting for expense data to load...');
    
    // Wait for expense data to load - check for non-zero total expenses
    cy.get('body', { timeout: 30000 }).should('contain.text', 'Total Expenses');
    
    // Wait specifically for expense amounts to appear
    cy.get('body').should(($body) => {
      const text = $body.text();
      // Look for any expense amounts (not just 0)
      expect(text).to.satisfy((text) => {
        return text.includes('84000') || 
               text.includes('84,000') || 
               text.includes('70000') || 
               text.includes('70,000') ||
               text.includes('30000') ||  // rent
               text.includes('8400') ||   // utilities
               text.includes('24000') ||  // groceries
               text.includes('12000') ||  // transport
               text.includes('9600');     // loan
      }, 'Expected to find expense amounts in the page');
    });
    
    cy.log('✅ Expense data loaded, taking screenshot...');
    cy.screenshot('budget-with-loaded-expenses');
    
    // Log what we actually see
    cy.get('body').then(($body) => {
      const text = $body.text();
      cy.log('📊 LOADED EXPENSE DATA:');
      
      // Check for each expected expense
      const expenses = ['30000', '8400', '24000', '12000', '9600'];
      expenses.forEach(amount => {
        if (text.includes(amount)) {
          cy.log(`✅ Found amount: ${amount}`);
        } else {
          cy.log(`❌ Missing amount: ${amount}`);
        }
      });
      
      // Check for totals
      if (text.includes('84000') || text.includes('84,000')) {
        cy.log('✅ Found total: 84,000');
      } else if (text.includes('70000') || text.includes('70,000')) {
        cy.log('✅ Found total: 70,000');
      } else {
        cy.log('❌ No expected total found');
      }
    });
  });
});