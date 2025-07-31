describe('Advisor Onboarding - Focused Test', () => {
  const testAdvisor = {
    email: `advisor.test.${Date.now()}@example.com`,
    password: 'testpass123'
  };

  beforeEach(() => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    cy.visit('/');
  });

  it('should complete advisor registration and navigate to onboarding', () => {
    cy.log('🎯 Testing Advisor Registration Flow');
    
    // Should be on auth screen
    cy.url().should('include', '/auth');
    
    // Select advisor user type
    cy.get('button').contains('Advisor').click({ force: true });
    
    // Switch to registration mode
    cy.get('button').contains('Create Account').click({ force: true });
    
    // Fill registration form
    cy.get('input[type="email"]').type(testAdvisor.email);
    cy.get('input[type="password"]').first().type(testAdvisor.password);
    cy.get('input[type="password"]').last().type(testAdvisor.password);
    
    // Submit registration
    cy.get('button[type="submit"]').click();
    
    // Should navigate to advisor onboarding
    cy.url({ timeout: 15000 }).should('include', '/onboarding/advisor');
    
    cy.log('✅ Successfully navigated to advisor onboarding');
  });

  it('should handle advisor professional details step', () => {
    // Pre-register advisor for this test
    cy.request('POST', '/auth/register', {
      email: testAdvisor.email,
      password: testAdvisor.password,
      user_type: 'advisor',
      first_name: 'Test',
      last_name: 'Advisor',
      dob: '1985-01-01',
      nationalId: 'TEST123',
      kra_pin: 'T123456789Z',
      annual_income: 200000,
      dependents: 0,
      goals: { targetAmount: 75000, timeHorizon: 36 },
      questionnaire: [4, 4, 4, 4, 4]
    }).then((response) => {
      // Store token for navigation
      const token = response.body.access_token;
      cy.window().its('localStorage').invoke('setItem', 'jwt', token);
      cy.window().its('localStorage').invoke('setItem', 'userType', 'advisor');
    });
    
    // Navigate directly to professional details
    cy.visit('/onboarding/advisor/professional-details');
    
    // Should see professional details form
    cy.contains('Professional', { timeout: 10000 }).should('be.visible');
    
    // Fill form with test data
    cy.get('input').first().clear().type('Emily');
    cy.get('input').eq(1).clear().type('Chen');
    cy.get('input').eq(2).clear().type('Chen Financial Planning');
    cy.get('input').eq(3).clear().type('CFP123456');
    
    // Submit form
    cy.get('button').contains('Next').click();
    
    // Should proceed to next step
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/service-model');
    
    cy.log('✅ Professional details step completed');
  });

  it('should handle service model configuration', () => {
    // Pre-register and setup
    cy.request('POST', '/auth/register', {
      email: `service.test.${Date.now()}@example.com`,
      password: 'servicetest123',
      user_type: 'advisor',
      first_name: 'Service',
      last_name: 'Test',
      dob: '1985-01-01',
      nationalId: 'SVC123',
      kra_pin: 'S123456789Z',
      annual_income: 200000,
      dependents: 0,
      goals: { targetAmount: 75000, timeHorizon: 36 },
      questionnaire: [4, 4, 4, 4, 4]
    }).then((response) => {
      const token = response.body.access_token;
      cy.window().its('localStorage').invoke('setItem', 'jwt', token);
      
      // Set professional details in localStorage (simulating previous step)
      const profDetails = {
        firstName: 'Emily',
        lastName: 'Chen',
        firmName: 'Chen Financial Planning',
        licenseNumber: 'CFP123456',
        professionalEmail: 'emily@chenfinancial.com',
        phone: '+1-555-0123'
      };
      cy.window().its('localStorage').invoke('setItem', 'advisorProfessionalDetails', JSON.stringify(profDetails));
    });
    
    // Navigate to service model step
    cy.visit('/onboarding/advisor/service-model');
    
    // Should see service model form
    cy.contains('Service', { timeout: 10000 }).should('be.visible');
    
    // Configure service model
    cy.get('select').first().select('fee-only');
    cy.get('select').eq(1).select('high-net-worth');
    cy.get('input[type="text"], input[type="number"]').last().type('1000000');
    
    // Submit
    cy.get('button').contains('Next').click();
    
    // Should proceed to completion
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/complete');
    
    cy.log('✅ Service model configuration completed');
  });

  it('should complete the full onboarding and save to database', () => {
    const completeTestEmail = `complete.test.${Date.now()}@example.com`;
    
    // Pre-register
    cy.request('POST', '/auth/register', {
      email: completeTestEmail,
      password: 'completetest123',
      user_type: 'advisor',
      first_name: 'Complete',
      last_name: 'Test',
      dob: '1985-01-01',
      nationalId: 'CMP123',
      kra_pin: 'C123456789Z',
      annual_income: 200000,
      dependents: 0,
      goals: { targetAmount: 75000, timeHorizon: 36 },
      questionnaire: [4, 4, 4, 4, 4]
    }).then((response) => {
      const token = response.body.access_token;
      cy.window().its('localStorage').invoke('setItem', 'jwt', token);
      
      // Set up localStorage data (simulating completed previous steps)
      const profDetails = {
        firstName: 'Emily',
        lastName: 'Chen',
        firmName: 'Chen Financial Planning',
        licenseNumber: 'CFP123456',
        professionalEmail: 'emily@chenfinancial.com',
        phone: '+1-555-0123'
      };
      const serviceModel = {
        serviceModel: 'fee-only',
        targetClientType: 'high-net-worth',
        minimumAUM: '1000000'
      };
      
      cy.window().its('localStorage').invoke('setItem', 'advisorProfessionalDetails', JSON.stringify(profDetails));
      cy.window().its('localStorage').invoke('setItem', 'advisorServiceModel', JSON.stringify(serviceModel));
    });
    
    // Navigate to completion step
    cy.visit('/onboarding/advisor/complete');
    
    // Should see completion page
    cy.contains('Complete', { timeout: 10000 }).should('be.visible');
    
    // Complete the setup
    cy.get('button').contains('Complete').click();
    
    // Should navigate to advisor dashboard
    cy.url({ timeout: 15000 }).should('include', '/advisor/dashboard');
    
    // Verify advisor context
    cy.get('body').should('contain.oneOf', ['Advisor', 'Dashboard', 'Client']);
    
    cy.log('✅ Complete advisor onboarding flow successful');
    
    // Verify data was saved by making API request
    cy.window().then((win) => {
      const token = win.localStorage.getItem('jwt');
      cy.request({
        method: 'GET',
        url: '/auth/me',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.profile).to.have.property('firm_name', 'Chen Financial Planning');
        expect(response.body.profile).to.have.property('license_number', 'CFP123456');
        expect(response.body.profile).to.have.property('service_model', 'fee-only');
        
        cy.log('✅ Advisor data successfully saved to database');
      });
    });
  });

  it('should handle advisor login for existing user', () => {
    const loginTestEmail = `login.test.${Date.now()}@example.com`;
    
    // Pre-register a complete advisor
    cy.request('POST', '/auth/register', {
      email: loginTestEmail,
      password: 'logintest123',
      user_type: 'advisor',
      first_name: 'Login',
      last_name: 'Test',
      dob: '1985-01-01',
      nationalId: 'LGN123',
      kra_pin: 'L123456789Z',
      annual_income: 250000,
      dependents: 0,
      goals: { targetAmount: 100000, timeHorizon: 24 },
      questionnaire: [4, 4, 4, 4, 4]
    });
    
    // Test login flow
    cy.visit('/');
    cy.get('button').contains('Advisor').click({ force: true });
    // Should be in login mode by default
    
    cy.get('input[type="email"]').type(loginTestEmail);
    cy.get('input[type="password"]').type('logintest123');
    cy.get('button[type="submit"]').click();
    
    // Should navigate directly to dashboard (existing user)
    cy.url({ timeout: 10000 }).should('include', '/advisor/dashboard');
    
    cy.log('✅ Advisor login successful');
  });

  it('should validate form fields properly', () => {
    cy.log('🔍 Testing form validation');
    
    // Test registration validation
    cy.get('button').contains('Advisor').click({ force: true });
    cy.get('button').contains('Create Account').click({ force: true });
    
    // Try to submit empty form
    cy.get('button[type="submit"]').click();
    
    // Should show HTML5 validation
    cy.get('input[type="email"]:invalid').should('exist');
    
    // Test password mismatch
    cy.get('input[type="email"]').type(`validation.${Date.now()}@example.com`);
    cy.get('input[type="password"]').first().type('password123');
    cy.get('input[type="password"]').last().type('different456');
    cy.get('button[type="submit"]').click();
    
    // Should show password mismatch error
    cy.get('body').should('contain.oneOf', ['match', 'same', 'error']);
    
    cy.log('✅ Form validation working correctly');
  });
});