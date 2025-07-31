describe('Complete Advisor Onboarding & CRUD Operations', () => {
  // Test data for different advisor personas
  const advisorPersonas = {
    emily: {
      email: `emily.chen.${Date.now()}@chenfinancial.com`,
      password: 'securepass123',
      professionalDetails: {
        firstName: 'Emily',
        lastName: 'Chen',
        firmName: 'Chen Financial Planning',
        licenseNumber: 'CFP123456',
        professionalEmail: 'emily@chenfinancial.com',
        phone: '+1-555-0123'
      },
      serviceModel: {
        serviceModel: 'fee-only',
        targetClientType: 'high-net-worth',
        minimumAUM: '1000000'
      }
    },
    daniel: {
      email: `daniel.mwangi.${Date.now()}@bankadvisor.com`,
      password: 'bankpass123',
      professionalDetails: {
        firstName: 'Daniel',
        lastName: 'Mwangi',
        firmName: 'Premier Bank Advisory',
        licenseNumber: 'CFA789012',
        professionalEmail: 'daniel@premierbank.com',
        phone: '+254-700-123456'
      },
      serviceModel: {
        serviceModel: 'commission',
        targetClientType: 'mass-affluent',
        minimumAUM: '250000'
      }
    }
  };

  beforeEach(() => {
    // Clear localStorage and session storage
    cy.window().then((win) => {
      win.localStorage.clear();
      win.sessionStorage.clear();
    });
    
    // Clear cookies
    cy.clearCookies();
    
    // Visit the application
    cy.visit('/');
  });

  // Test 1: Complete Advisor Registration & Onboarding Flow
  it('should complete full advisor onboarding flow for Emily Chen persona', () => {
    const emily = advisorPersonas.emily;
    
    cy.log('🎯 Testing Emily Chen (Fee-Only CFP) Onboarding Flow');
    
    // Step 1: Navigate to auth and select advisor
    cy.url().should('include', '/auth');
    cy.get('[data-testid="user-type-advisor"], button').contains('Advisor').click();
    cy.get('[data-testid="auth-mode-register"], button').contains('Create Account').click();
    
    // Step 2: Complete registration
    cy.log('📝 Completing advisor registration');
    cy.get('input[type="email"]').type(emily.email);
    cy.get('input[type="password"]').first().type(emily.password);
    cy.get('input[type="password"]').last().type(emily.password);
    cy.get('button[type="submit"]').click();
    
    // Step 3: Should navigate to professional details
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/professional-details');
    cy.contains('Professional Details', { timeout: 10000 }).should('be.visible');
    
    // Step 4: Fill professional details
    cy.log('👔 Filling professional details');
    cy.get('input').first().clear().type(emily.professionalDetails.firstName);
    cy.get('input').eq(1).clear().type(emily.professionalDetails.lastName);
    cy.get('input').eq(2).clear().type(emily.professionalDetails.firmName);
    cy.get('input').eq(3).clear().type(emily.professionalDetails.licenseNumber);
    cy.get('input').eq(4).clear().type(emily.professionalDetails.professionalEmail);
    cy.get('input').eq(5).clear().type(emily.professionalDetails.phone);
    
    // Submit professional details
    cy.get('button[type="submit"], button').contains('Next').click();
    
    // Step 5: Should navigate to service model
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/service-model');
    cy.contains('Service Model', { timeout: 10000 }).should('be.visible');
    
    // Step 6: Configure service model
    cy.log('🎯 Configuring service model');
    
    // Select fee-only model
    cy.get('select, input[type="radio"]').first().then(($el) => {
      if ($el.is('select')) {
        cy.wrap($el).select('fee-only');
      } else {
        cy.get('input[value="fee-only"], label').contains('Fee-Only').click();
      }
    });
    
    // Select high-net-worth clients
    cy.get('select, input[type="radio"]').eq(1).then(($el) => {
      if ($el.is('select')) {
        cy.wrap($el).select('high-net-worth');
      } else {
        cy.get('input[value="high-net-worth"], label').contains('High Net Worth').click();
      }
    });
    
    // Enter minimum AUM
    cy.get('input[type="text"], input[type="number"]').last().clear().type(emily.serviceModel.minimumAUM);
    
    // Submit service model
    cy.get('button[type="submit"], button').contains('Next').click();
    
    // Step 7: Should navigate to completion
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/complete');
    cy.contains('Complete', { timeout: 10000 }).should('be.visible');
    
    // Step 8: Complete setup
    cy.log('🏁 Completing advisor setup');
    cy.get('button').contains('Complete').click();
    
    // Step 9: Should navigate to advisor dashboard
    cy.url({ timeout: 15000 }).should('include', '/advisor/dashboard');
    cy.contains('Advisor', { timeout: 10000 }).should('be.visible');
    
    // Step 10: Verify advisor-specific features
    cy.log('✅ Verifying advisor dashboard features');
    cy.get('body').should('not.contain', 'Personal Finance'); // Should not show personal finance tools
    cy.get('body').should('contain.oneOf', ['Client', 'Portfolio', 'Advisory']); // Should show advisor tools
  });

  // Test 2: Complete Advisor Registration & Onboarding Flow for Different Persona
  it('should complete full advisor onboarding flow for Daniel Mwangi persona', () => {
    const daniel = advisorPersonas.daniel;
    
    cy.log('🎯 Testing Daniel Mwangi (Commission-Based) Onboarding Flow');
    
    // Follow same flow but with different data
    cy.get('button').contains('Advisor').click();
    cy.get('button').contains('Create Account').click();
    
    cy.get('input[type="email"]').type(daniel.email);
    cy.get('input[type="password"]').first().type(daniel.password);
    cy.get('input[type="password"]').last().type(daniel.password);
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/professional-details');
    
    // Fill Daniel's details
    cy.get('input').first().clear().type(daniel.professionalDetails.firstName);
    cy.get('input').eq(1).clear().type(daniel.professionalDetails.lastName);
    cy.get('input').eq(2).clear().type(daniel.professionalDetails.firmName);
    cy.get('input').eq(3).clear().type(daniel.professionalDetails.licenseNumber);
    cy.get('input').eq(4).clear().type(daniel.professionalDetails.professionalEmail);
    cy.get('input').eq(5).clear().type(daniel.professionalDetails.phone);
    
    cy.get('button').contains('Next').click();
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/service-model');
    
    // Configure commission-based model
    cy.get('select, input[type="radio"]').first().then(($el) => {
      if ($el.is('select')) {
        cy.wrap($el).select('commission');
      } else {
        cy.get('input[value="commission"], label').contains('Commission').click();
      }
    });
    
    cy.get('select, input[type="radio"]').eq(1).then(($el) => {
      if ($el.is('select')) {
        cy.wrap($el).select('mass-affluent');
      } else {
        cy.get('input[value="mass-affluent"], label').contains('Mass Affluent').click();
      }
    });
    
    cy.get('input[type="text"], input[type="number"]').last().clear().type(daniel.serviceModel.minimumAUM);
    
    cy.get('button').contains('Next').click();
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/complete');
    
    cy.get('button').contains('Complete').click();
    cy.url({ timeout: 15000 }).should('include', '/advisor/dashboard');
  });

  // Test 3: Advisor Login Flow
  it('should handle advisor login correctly', () => {
    const testEmail = `existing.advisor.${Date.now()}@example.com`;
    
    // First register an advisor
    cy.log('📝 Pre-registering advisor for login test');
    cy.request('POST', '/auth/register', {
      email: testEmail,
      password: 'logintest123',
      user_type: 'advisor',
      first_name: 'Login',
      last_name: 'Test',
      dob: '1985-01-01',
      nationalId: 'LOGIN123',
      kra_pin: 'L123456789Z',
      annual_income: 200000,
      dependents: 0,
      goals: { targetAmount: 75000, timeHorizon: 36 },
      questionnaire: [4, 4, 4, 4, 4]
    });
    
    // Now test login
    cy.log('🔐 Testing advisor login');
    cy.get('button').contains('Advisor').click();
    // Should be in login mode by default
    
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type('logintest123');
    cy.get('button[type="submit"]').click();
    
    // Should navigate to advisor dashboard (existing user)
    cy.url({ timeout: 10000 }).should('include', '/advisor/dashboard');
  });

  // Test 4: Form Validation Tests
  it('should validate advisor onboarding forms properly', () => {
    cy.log('🔍 Testing form validation');
    
    // Start onboarding process
    cy.get('button').contains('Advisor').click();
    cy.get('button').contains('Create Account').click();
    
    // Test registration validation
    cy.get('button[type="submit"]').click();
    cy.get('input[type="email"]:invalid').should('exist');
    
    // Fill minimal registration
    cy.get('input[type="email"]').type(`validation.test.${Date.now()}@example.com`);
    cy.get('input[type="password"]').first().type('testpass123');
    cy.get('input[type="password"]').last().type('testpass123');
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/professional-details');
    
    // Test professional details validation
    cy.get('button[type="submit"], button').contains('Next').click();
    cy.get('body').should('contain', 'required'); // Should show required field message
    
    // Fill required fields
    cy.get('input').first().type('Validation');
    cy.get('input').eq(1).type('Test');
    cy.get('input').eq(2).type('Test Firm');
    cy.get('input').eq(3).type('TEST123');
    
    cy.get('button').contains('Next').click();
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/service-model');
    
    // Test service model validation
    cy.get('button[type="submit"], button').contains('Next').click();
    cy.get('body').should('contain.oneOf', ['required', 'select', 'choose']); // Should show validation message
  });

  // Test 5: Data Persistence Between Steps
  it('should persist data between onboarding steps', () => {
    const email = `persistence.test.${Date.now()}@example.com`;
    
    cy.log('💾 Testing data persistence between steps');
    
    // Start onboarding
    cy.get('button').contains('Advisor').click();
    cy.get('button').contains('Create Account').click();
    
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').first().type('persist123');
    cy.get('input[type="password"]').last().type('persist123');
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/professional-details');
    
    // Fill professional details
    const testData = {
      firstName: 'Persistence',
      lastName: 'Test',
      firmName: 'Persistence Firm'
    };
    
    cy.get('input').first().type(testData.firstName);
    cy.get('input').eq(1).type(testData.lastName);
    cy.get('input').eq(2).type(testData.firmName);
    cy.get('input').eq(3).type('PERSIST123');
    
    // Navigate to next step
    cy.get('button').contains('Next').click();
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/service-model');
    
    // Navigate back to professional details
    cy.go('back');
    cy.url({ timeout: 5000 }).should('include', '/onboarding/advisor/professional-details');
    
    // Verify data is still there (localStorage persistence)
    cy.get('input').first().should('have.value', testData.firstName);
    cy.get('input').eq(1).should('have.value', testData.lastName);
    cy.get('input').eq(2).should('have.value', testData.firmName);
  });

  // Test 6: Profile CRUD Operations (if profile management is implemented)
  it('should allow advisor profile management and updates', () => {
    const advisor = advisorPersonas.emily;
    
    cy.log('🔧 Testing advisor profile CRUD operations');
    
    // Register and complete onboarding first
    cy.get('button').contains('Advisor').click();
    cy.get('button').contains('Create Account').click();
    
    cy.get('input[type="email"]').type(advisor.email);
    cy.get('input[type="password"]').first().type(advisor.password);
    cy.get('input[type="password"]').last().type(advisor.password);
    cy.get('button[type="submit"]').click();
    
    // Complete quick onboarding
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/professional-details');
    cy.get('input').first().type(advisor.professionalDetails.firstName);
    cy.get('input').eq(1).type(advisor.professionalDetails.lastName);
    cy.get('input').eq(2).type(advisor.professionalDetails.firmName);
    cy.get('input').eq(3).type(advisor.professionalDetails.licenseNumber);
    cy.get('button').contains('Next').click();
    
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/service-model');
    cy.get('select, input[type="radio"]').first().then(($el) => {
      if ($el.is('select')) {
        cy.wrap($el).select('fee-only');
      } else {
        cy.get('input[value="fee-only"], label').contains('Fee').click();
      }
    });
    cy.get('button').contains('Next').click();
    
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/complete');
    cy.get('button').contains('Complete').click();
    
    // Should be at dashboard
    cy.url({ timeout: 15000 }).should('include', '/advisor/dashboard');
    
    // Test profile access (if implemented)
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="profile-link"], a[href*="profile"], button').length > 0) {
        // Navigate to profile
        cy.get('[data-testid="profile-link"], a[href*="profile"], button').contains('Profile').click();
        
        // Test profile updates
        cy.url().should('include', 'profile');
        
        // Update firm name if editable
        cy.get('body').then(($profileBody) => {
          if ($profileBody.find('input[value*="Chen"], input').length > 0) {
            cy.get('input').contains('Chen').clear().type('Updated Chen Financial');
            cy.get('button').contains('Save', 'Update').click();
            
            // Verify update
            cy.get('body').should('contain', 'Updated Chen Financial');
          }
        });
      } else {
        cy.log('⚠️ Profile management not yet implemented - skipping CRUD tests');
      }
    });
  });

  // Test 7: Error Handling and Edge Cases
  it('should handle errors gracefully during onboarding', () => {
    cy.log('⚠️ Testing error handling');
    
    // Test invalid email registration
    cy.get('button').contains('Advisor').click();
    cy.get('button').contains('Create Account').click();
    
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').first().type('test');
    cy.get('input[type="password"]').last().type('different'); // Password mismatch
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.get('body').should('contain.oneOf', ['match', 'valid', 'error']);
    
    // Test network error simulation (if possible)
    cy.intercept('POST', '/auth/register', { statusCode: 500 }).as('registerError');
    
    cy.get('input[type="email"]').clear().type(`error.test.${Date.now()}@example.com`);
    cy.get('input[type="password"]').first().clear().type('password123');
    cy.get('input[type="password"]').last().clear().type('password123');
    cy.get('button[type="submit"]').click();
    
    cy.wait('@registerError');
    cy.get('body').should('contain.oneOf', ['error', 'failed', 'try again']);
  });

  // Test 8: Mobile Responsiveness (if applicable)
  it('should work on mobile devices', () => {
    cy.log('📱 Testing mobile responsiveness');
    
    // Test on mobile viewport
    cy.viewport('iphone-6');
    
    cy.get('button').contains('Advisor').click();
    cy.get('button').contains('Create Account').click();
    
    // Verify mobile layout
    cy.get('input[type="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    
    // Complete quick flow on mobile
    cy.get('input[type="email"]').type(`mobile.test.${Date.now()}@example.com`);
    cy.get('input[type="password"]').first().type('mobile123');
    cy.get('input[type="password"]').last().type('mobile123');
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/professional-details');
    
    // Verify mobile form layout
    cy.get('input').should('be.visible');
    cy.get('button').contains('Next').should('be.visible');
  });

  // Test 9: Accessibility Testing
  it('should be accessible to users with disabilities', () => {
    cy.log('♿ Testing accessibility');
    
    // Check for basic accessibility features
    cy.get('button').contains('Advisor').should('have.attr', 'type');
    cy.get('input[type="email"]').should('have.attr', 'type', 'email');
    
    // Test keyboard navigation
    cy.get('body').type('{tab}'); // Should focus first interactive element
    cy.focused().should('exist');
    
    // Test ARIA labels (if implemented)
    cy.get('input').first().then(($input) => {
      cy.wrap($input).should('satisfy', ($el) => {
        return $el.attr('aria-label') || $el.attr('placeholder') || $el.prev('label').length > 0;
      });
    });
  });

  // Test 10: Performance and Load Testing
  it('should perform well during onboarding', () => {
    cy.log('⚡ Testing performance');
    
    // Measure page load times
    const start = Date.now();
    
    cy.get('button').contains('Advisor').click();
    cy.get('button').contains('Create Account').click();
    
    cy.get('input[type="email"]').type(`perf.test.${Date.now()}@example.com`);
    cy.get('input[type="password"]').first().type('perf123');
    cy.get('input[type="password"]').last().type('perf123');
    cy.get('button[type="submit"]').click();
    
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/professional-details').then(() => {
      const loadTime = Date.now() - start;
      cy.log(`Page load time: ${loadTime}ms`);
      
      // Should load within reasonable time (adjust threshold as needed)
      expect(loadTime).to.be.lessThan(10000); // 10 seconds max
    });
    
    // Test form responsiveness
    cy.get('input').first().type('Performance Test', { delay: 0 });
    cy.get('input').first().should('have.value', 'Performance Test');
  });
});