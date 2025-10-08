describe('Manual Navigation Test - Step by Step', () => {
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
    cy.wait(3000); // Let data load
  });

  it('should navigate to profile tab and document info', () => {
    cy.log('📋 STEP 1: PROFILE TAB ANALYSIS');
    
    // Take initial dashboard screenshot
    cy.screenshot('step1-dashboard-initial');
    
    // Look for profile navigation - check bottom nav first
    cy.get('body').then(($body) => {
      // Try bottom navigation
      if ($body.find('[data-testid*="profile"], .profile, nav').length > 0) {
        cy.log('🔍 Looking for profile navigation in bottom nav...');
        cy.get('nav, .nav, [role="navigation"]').should('exist').then(($nav) => {
          cy.wrap($nav).find('*').each(($el) => {
            const text = $el.text().toLowerCase();
            const testId = $el.attr('data-testid') || '';
            if (text.includes('profile') || testId.includes('profile')) {
              cy.log(`✅ Found profile nav: "${text}" with testId: "${testId}"`);
              cy.wrap($el).click();
              return false; // Exit loop
            }
          });
        });
      } else {
        cy.log('❌ No profile navigation found');
      }
    });
    
    // Wait for navigation and take screenshot
    cy.wait(2000);
    cy.screenshot('step1-profile-page');
    
    // Document what's on the profile page
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      cy.log('📄 PROFILE PAGE CONTENT:');
      cy.log(`Full text length: ${bodyText.length} characters`);
      
      // Look for key profile elements
      const profileElements = ['name', 'email', 'age', 'income', 'risk', 'goals', 'personal'];
      profileElements.forEach(element => {
        if (bodyText.toLowerCase().includes(element)) {
          cy.log(`✅ Found profile element: ${element}`);
        }
      });
      
      // Look for specific user data
      if (bodyText.includes('richard') || bodyText.includes('Richard')) {
        cy.log('✅ User name found in profile');
      }
      if (bodyText.includes(testUser.email)) {
        cy.log('✅ User email found in profile');
      }
    });
  });

  it('should navigate to budget tab and document state', () => {
    cy.log('💰 STEP 2: BUDGET TAB ANALYSIS');
    
    // Look for budget navigation
    cy.get('body').then(($body) => {
      if ($body.find('nav, .nav, [role="navigation"]').length > 0) {
        cy.log('🔍 Looking for budget navigation...');
        cy.get('nav, .nav, [role="navigation"]').find('*').each(($el) => {
          const text = $el.text().toLowerCase();
          const testId = $el.attr('data-testid') || '';
          if (text.includes('budget') || testId.includes('budget')) {
            cy.log(`✅ Found budget nav: "${text}" with testId: "${testId}"`);
            cy.wrap($el).click();
            return false;
          }
        });
      }
    });
    
    cy.wait(3000); // Let budget data load
    cy.screenshot('step2-budget-page');
    
    // Document budget page content
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      cy.log('💰 BUDGET PAGE CONTENT:');
      
      // Look for expense categories
      const expenseCategories = ['rent', 'utilities', 'groceries', 'transport', 'loan', 'housing', 'food'];
      const foundCategories = expenseCategories.filter(cat => bodyText.toLowerCase().includes(cat));
      cy.log(`✅ Found expense categories: ${foundCategories.join(', ')}`);
      cy.log(`❌ Missing expense categories: ${expenseCategories.filter(c => !foundCategories.includes(c)).join(', ')}`);
      
      // Look for amounts
      const expectedAmounts = ['30000', '8400', '24000', '12000', '9600', '70000'];
      const foundAmounts = expectedAmounts.filter(amt => bodyText.includes(amt));
      cy.log(`✅ Found expected amounts: ${foundAmounts.join(', ')}`);
      cy.log(`❌ Missing expected amounts: ${expectedAmounts.filter(a => !foundAmounts.includes(a)).join(', ')}`);
      
      // Check for zero/empty states
      if (bodyText.includes('No expenses') || bodyText.includes('0.00') || bodyText.includes('Empty')) {
        cy.log('❌ Budget showing empty/zero state');
      } else {
        cy.log('✅ Budget showing data');
      }
    });
  });
});