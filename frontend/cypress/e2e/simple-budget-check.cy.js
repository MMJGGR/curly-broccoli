describe('Simple Budget Check', () => {
  it('should login and check budget page for expense data', () => {
    // Visit the app
    cy.visit('/');
    
    // Login with the correct credentials
    cy.contains('Welcome Back', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="email"]').type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').type('jaggerthee');
    cy.get('button[type="submit"]').contains('Login').click();
    
    // Wait for dashboard to load
    cy.url({ timeout: 15000 }).should('include', '/dashboard');
    cy.log('✅ Successfully logged in and reached dashboard');
    
    // Go directly to budget page
    cy.visit('/app/budget');
    cy.wait(5000); // Allow data to load
    
    cy.log('💰 Checking budget page content...');
    cy.screenshot('budget-page-content');
    
    // Check the page content
    cy.get('body').then(($body) => {
      const pageText = $body.text().toLowerCase();
      
      // Log what we find
      cy.log('📊 EXPENSE ANALYSIS:');
      
      // Expected categories and amounts
      const expenses = {
        'rent': '30000',
        'utilities': '8400', 
        'groceries': '24000',
        'transport': '12000',
        'loan': '9600'
      };
      
      Object.entries(expenses).forEach(([category, amount]) => {
        const hasCategory = pageText.includes(category);
        const hasAmount = pageText.includes(amount);
        
        cy.log(`${category}: Category ${hasCategory ? '✅' : '❌'} | Amount ${hasAmount ? '✅' : '❌'}`);
      });
      
      // Check for total amounts
      const totals = ['84000', '84,000', '70000', '70,000'];
      const foundTotal = totals.find(total => pageText.includes(total.toLowerCase()));
      
      if (foundTotal) {
        cy.log(`✅ Found total: ${foundTotal}`);
      } else {
        cy.log('❌ No expected total found');
      }
      
      // Check for empty states
      if (pageText.includes('no expenses') || pageText.includes('empty')) {
        cy.log('❌ Page shows empty state');
      } else {
        cy.log('✅ Page has content (not empty)');
      }
      
      // Show first part of page content for debugging
      cy.log(`📝 Page preview: ${pageText.substring(0, 300)}...`);
    });
  });
});