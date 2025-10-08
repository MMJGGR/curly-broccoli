describe('Debug Navigation Issues', () => {
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
    
    // Wait for dashboard
    cy.url({ timeout: 15000 }).should('not.include', '/login');
    cy.url().should('include', '/dashboard');
    cy.wait(3000);
  });

  it('should debug navigation step by step', () => {
    cy.log('🔍 DEBUGGING NAVIGATION');
    
    // Check current URL
    cy.url().then((url) => {
      cy.log(`📍 Current URL: ${url}`);
    });
    
    // Check for navigation elements
    cy.get('[data-testid="bottom-nav"]').should('exist');
    cy.get('[data-cy="nav-budget"]').should('exist').and('be.visible');
    
    // Log before clicking
    cy.log('👆 About to click Budget tab...');
    
    // Click budget tab and check URL change
    cy.get('[data-cy="nav-budget"]').click();
    cy.wait(1000);
    
    cy.url().then((url) => {
      cy.log(`📍 URL after clicking Budget: ${url}`);
    });
    
    // Check page title or header
    cy.get('body').then(($body) => {
      const title = $body.find('h1, h2, .title, [data-testid*="title"]').first().text();
      cy.log(`📄 Page title/header: ${title}`);
    });
    
    // Try direct URL navigation
    cy.log('🔗 Trying direct URL navigation...');
    cy.visit('/app/budget');
    cy.wait(2000);
    
    cy.url().then((url) => {
      cy.log(`📍 URL after direct navigation to /app/budget: ${url}`);
    });
    
    cy.get('body').then(($body) => {
      const title = $body.find('h1, h2, .title, [data-testid*="title"]').first().text();
      cy.log(`📄 Page title after direct nav: ${title}`);
    });
    
    cy.screenshot('debug-budget-direct-nav');
    
    // Try balance sheet
    cy.log('⚖️ Testing Balance Sheet navigation...');
    cy.visit('/app/balance-sheet');
    cy.wait(2000);
    
    cy.url().then((url) => {
      cy.log(`📍 URL after direct navigation to /app/balance-sheet: ${url}`);
    });
    
    cy.screenshot('debug-balance-sheet-direct-nav');
    
    // Try profile
    cy.log('👤 Testing Profile navigation...');
    cy.visit('/app/profile');
    cy.wait(2000);
    
    cy.url().then((url) => {
      cy.log(`📍 URL after direct navigation to /app/profile: ${url}`);
    });
    
    cy.screenshot('debug-profile-direct-nav');
  });
});