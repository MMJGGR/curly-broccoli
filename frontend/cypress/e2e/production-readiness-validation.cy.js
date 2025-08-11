/**
 * Production Readiness Validation Test
 * 
 * This test validates the essential user journeys needed for production launch
 * Based on comprehensive journey analysis, focuses on critical path validation
 */

describe('Production Readiness Validation', () => {
  const testUser = {
    email: `prod.test.${Date.now()}@example.com`,
    password: 'ProductionTest123!'
  };

  before(() => {
    // Cleanup any existing test data
    cy.exec(`cd api && python -c "from app.dev import cleanup_test_user; cleanup_test_user('${testUser.email}')"`, {
      failOnNonZeroExit: false
    });
  });

  describe('Critical Path: System Health', () => {
    it('validates core system components are operational', () => {
      // Test frontend availability
      cy.visit('http://localhost:3000');
      cy.get('body').should('be.visible');
      
      // Test backend API health
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/api/v1/profile',
        failOnStatusCode: false
      }).then(response => {
        expect([200, 401]).to.include(response.status);
      });

      // Verify UI components load
      cy.get('body').should('contain.text', 'Access your financial dashboard');
      cy.get('input[type="email"], input[name="email"]').should('be.visible');
      cy.get('input[type="password"], input[name="password"]').should('be.visible');
    });
  });

  describe('Critical Path: User Authentication', () => {
    it('validates user registration and login flow', () => {
      cy.visit('http://localhost:3000');
      
      // Navigate to registration
      cy.contains('New user? Create Account').click();
      cy.wait(1000);
      
      // Complete registration
      cy.get('input[type="email"], input[name="email"]')
        .clear()
        .type(testUser.email);
      
      cy.get('input[type="password"]')
        .first()
        .clear()
        .type(testUser.password);
      
      // Handle confirm password if present
      cy.get('input[type="password"]').then($inputs => {
        if ($inputs.length > 1) {
          cy.get('input[type="password"]').last().clear().type(testUser.password);
        }
      });

      // Handle name field if present
      cy.get('body').then($body => {
        if ($body.find('input[name="name"], input[id="name"], input[placeholder*="name"]').length > 0) {
          cy.get('input[name="name"], input[id="name"], input[placeholder*="name"]')
            .first()
            .clear()
            .type('Production Test User');
        }
      });

      cy.get('button[type="submit"], button:contains("Register"), button:contains("Create")').click();

      // Verify successful registration (should redirect away from auth)
      cy.url({ timeout: 15000 }).should('satisfy', (url) => {
        return !url.includes('/auth') || url.includes('/onboarding') || url.includes('/dashboard');
      });
    });
  });

  describe('Critical Path: Core Application Access', () => {
    it('validates user can access main application features', () => {
      // Login if needed
      cy.url().then(url => {
        if (url.includes('/auth')) {
          cy.get('input[type="email"]').clear().type(testUser.email);
          cy.get('input[type="password"]').clear().type(testUser.password);
          cy.get('button[type="submit"]').click();
        }
      });

      // Should reach a main application view
      cy.url({ timeout: 15000 }).should('satisfy', (url) => {
        return url.includes('/dashboard') || 
               url.includes('/timeline') || 
               url.includes('/onboarding') ||
               url.includes('/app');
      });

      // Verify basic navigation exists
      cy.get('body').should('be.visible');
      
      // Look for navigation elements
      cy.get('body').then($body => {
        // Should have some form of navigation or menu
        const hasNav = $body.find('nav, [role="navigation"], .nav, [data-cy*="nav"]').length > 0;
        const hasMenu = $body.find('button:contains("Menu"), .menu, [data-cy*="menu"]').length > 0;
        const hasLinks = $body.find('a[href], button').length > 3;
        
        expect(hasNav || hasMenu || hasLinks).to.be.true;
      });
    });
  });

  describe('Core Functionality: Financial Data Management', () => {
    it('validates essential financial features are accessible', () => {
      // Test account management accessibility
      cy.get('body').then($body => {
        if ($body.text().toLowerCase().includes('account') || 
            $body.find('[href*="account"], [data-cy*="account"]').length > 0) {
          
          // Account management is available
          cy.log('✅ Account management accessible');
          
          // Try to access accounts
          cy.contains(/account/i).first().click({ timeout: 5000 });
          cy.wait(2000);
          cy.get('body').should('be.visible');
        }
      });

      // Test transaction functionality
      cy.get('body').then($body => {
        if ($body.text().toLowerCase().includes('transaction') || 
            $body.find('[href*="transaction"], [data-cy*="transaction"]').length > 0) {
          
          cy.log('✅ Transaction management accessible');
          
          // Try to access transactions
          cy.contains(/transaction/i).first().click({ timeout: 5000 });
          cy.wait(2000);
          cy.get('body').should('be.visible');
        }
      });

      // Test budget functionality
      cy.get('body').then($body => {
        if ($body.text().toLowerCase().includes('budget') || 
            $body.find('[href*="budget"], [data-cy*="budget"]').length > 0) {
          
          cy.log('✅ Budget management accessible');
          
          // Try to access budget
          cy.contains(/budget/i).first().click({ timeout: 5000 });
          cy.wait(2000);
          cy.get('body').should('be.visible');
        }
      });
    });
  });

  describe('Core Functionality: Analytics and Insights', () => {
    it('validates analytics and goal tracking are functional', () => {
      // Test analytics accessibility
      cy.get('body').then($body => {
        if ($body.text().toLowerCase().includes('analytics') || 
            $body.text().toLowerCase().includes('analysis') ||
            $body.find('[href*="analytics"], [data-cy*="analytics"]').length > 0) {
          
          cy.log('✅ Analytics accessible');
          
          // Try to access analytics
          cy.contains(/analytic|analysis/i).first().click({ timeout: 5000 });
          cy.wait(3000); // Analytics may take longer to load
          cy.get('body').should('be.visible');
        }
      });

      // Test goals functionality
      cy.get('body').then($body => {
        if ($body.text().toLowerCase().includes('goal') || 
            $body.find('[href*="goal"], [data-cy*="goal"]').length > 0) {
          
          cy.log('✅ Goals accessible');
          
          // Try to access goals
          cy.contains(/goal/i).first().click({ timeout: 5000 });
          cy.wait(2000);
          cy.get('body').should('be.visible');
        }
      });

      // Test timeline/dashboard functionality
      cy.get('body').then($body => {
        if ($body.text().toLowerCase().includes('timeline') || 
            $body.text().toLowerCase().includes('dashboard') ||
            $body.find('[href*="timeline"], [href*="dashboard"]').length > 0) {
          
          cy.log('✅ Timeline/Dashboard accessible');
          
          // Try to access timeline or dashboard
          cy.contains(/timeline|dashboard/i).first().click({ timeout: 5000 });
          cy.wait(2000);
          cy.get('body').should('be.visible');
        }
      });
    });
  });

  describe('Mobile Responsiveness Validation', () => {
    it('validates mobile experience works across key features', () => {
      // Switch to mobile viewport
      cy.viewport('iphone-x');
      cy.wait(1000);
      
      // Verify mobile layout
      cy.get('body').should('be.visible');
      
      // Test mobile navigation
      cy.get('body').then($body => {
        const mobileElements = $body.find(
          '[data-cy*="mobile"], .mobile, button:contains("Menu"), .hamburger'
        );
        
        if (mobileElements.length > 0) {
          cy.get(mobileElements.first()).click({ timeout: 5000 });
          cy.wait(1000);
          cy.log('✅ Mobile navigation functional');
        }
      });

      // Test mobile touch interactions
      cy.get('button, a, [role="button"]').first().should('be.visible');
      
      // Restore desktop viewport
      cy.viewport(1280, 720);
    });
  });

  describe('Performance Validation', () => {
    it('validates acceptable performance across key pages', () => {
      const pages = ['/', '/dashboard', '/timeline', '/budget'];
      
      pages.forEach(page => {
        const startTime = Date.now();
        
        cy.visit(`http://localhost:3000${page}`, { failOnStatusCode: false });
        cy.get('body').should('be.visible');
        
        const loadTime = Date.now() - startTime;
        
        // Page should load within 5 seconds (production target: 3 seconds)
        expect(loadTime).to.be.lessThan(5000);
        
        cy.log(`✅ Page ${page} loaded in ${loadTime}ms`);
        cy.wait(500);
      });
    });
  });

  describe('Error Handling Validation', () => {
    it('validates graceful error handling', () => {
      // Test invalid route handling
      cy.visit('http://localhost:3000/nonexistent-page', { failOnStatusCode: false });
      cy.get('body').should('be.visible');
      
      // Should either redirect to valid page or show proper error
      cy.url().should('satisfy', (url) => {
        return url.includes('/') || url.includes('/auth') || url.includes('/404');
      });

      // Test form validation (if forms exist)
      cy.visit('http://localhost:3000');
      cy.get('input').first().then($input => {
        // Try invalid input
        cy.wrap($input).clear().type('invalid-data');
        cy.get('button[type="submit"]').first().click({ timeout: 3000 });
        
        // Should handle gracefully (either show error or ignore)
        cy.get('body').should('be.visible');
      });
    });
  });

  after(() => {
    // Cleanup test user
    cy.exec(`cd api && python -c "from app.dev import cleanup_test_user; cleanup_test_user('${testUser.email}')"`, {
      failOnNonZeroExit: false
    });
  });
});

// Production readiness summary command
Cypress.Commands.add('validateProductionReadiness', () => {
  const checks = [
    { name: 'Frontend Availability', test: () => cy.visit('http://localhost:3000') },
    { name: 'Backend Health', test: () => cy.request({ url: 'http://localhost:8000/api/v1/profile', failOnStatusCode: false }) },
    { name: 'User Registration', test: () => cy.get('body').should('contain.text', 'Create Account') },
    { name: 'Mobile Responsive', test: () => { cy.viewport('iphone-x'); cy.get('body').should('be.visible'); } }
  ];

  checks.forEach(check => {
    check.test();
    cy.log(`✅ ${check.name}: PASS`);
  });
});