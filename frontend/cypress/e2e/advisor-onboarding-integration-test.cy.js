describe('Advisor Onboarding Integration Test', () => {
  // Test data
  const testAdvisor = {
    email: `test_advisor_${Date.now()}@example.com`,
    password: 'testpass123'
  };

  const professionalDetails = {
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
    minimumAUM: '500000'
  };

  beforeEach(() => {
    // Clear localStorage before each test
    cy.window().then((win) => {
      win.localStorage.clear();
    });
  });

  it('Should complete full advisor onboarding flow', () => {
    // Step 1: Navigate to auth screen
    cy.visit('/');
    cy.url().should('include', '/auth');

    // Step 2: Switch to advisor registration
    cy.get('button').contains('Advisor').click();
    cy.get('button').contains('Create Account').click();

    // Step 3: Fill registration form
    cy.get('input[type="email"]').type(testAdvisor.email);
    cy.get('input[type="password"]').first().type(testAdvisor.password);
    cy.get('input[type="password"]').last().type(testAdvisor.password);

    // Step 4: Submit registration
    cy.get('button[type="submit"]').click();

    // Step 5: Should navigate to advisor onboarding professional details
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/professional-details');

    // Step 6: Fill professional details
    cy.get('input[placeholder*="First"], input[name="firstName"], input').first().type(professionalDetails.firstName);
    cy.get('input[placeholder*="Last"], input[name="lastName"]').type(professionalDetails.lastName);
    cy.get('input[placeholder*="Firm"], input[name="firmName"]').type(professionalDetails.firmName);
    cy.get('input[placeholder*="License"], input[name="licenseNumber"]').type(professionalDetails.licenseNumber);
    cy.get('input[placeholder*="Email"], input[name="professionalEmail"]').type(professionalDetails.professionalEmail);
    cy.get('input[placeholder*="Phone"], input[name="phone"]').type(professionalDetails.phone);

    // Step 7: Submit professional details
    cy.get('button[type="submit"], button').contains('Next').click();

    // Step 8: Should navigate to service model step
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/service-model');

    // Step 9: Fill service model
    cy.get('select, input[type="radio"]').first().click();
    cy.get('option[value="fee-only"], input[value="fee-only"]').click();
    
    cy.get('select, input[type="radio"]').eq(1).click();
    cy.get('option[value="high-net-worth"], input[value="high-net-worth"]').click();
    
    cy.get('input[placeholder*="AUM"], input[name="minimumAUM"]').type(serviceModel.minimumAUM);

    // Step 10: Submit service model
    cy.get('button[type="submit"], button').contains('Next').click();

    // Step 11: Should navigate to completion step
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor/complete');

    // Step 12: Complete setup
    cy.get('button').contains('Complete').click();

    // Step 13: Should eventually navigate to advisor dashboard
    cy.url({ timeout: 15000 }).should('include', '/advisor/dashboard');

    // Step 14: Verify advisor dashboard loads
    cy.get('body').should('contain', 'Advisor'); // Should contain advisor-specific content
  });

  it('Should handle advisor login flow correctly', () => {
    // First register an advisor (reusing previous test data)
    cy.visit('/');
    cy.get('button').contains('Advisor').click();
    cy.get('button').contains('Create Account').click();
    cy.get('input[type="email"]').type(testAdvisor.email);
    cy.get('input[type="password"]').first().type(testAdvisor.password);
    cy.get('input[type="password"]').last().type(testAdvisor.password);
    cy.get('button[type="submit"]').click();

    // Wait for onboarding to start
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor');

    // Now test login flow
    cy.visit('/');
    cy.get('button').contains('Advisor').click();
    
    // Should be on login mode by default
    cy.get('input[type="email"]').type(testAdvisor.email);
    cy.get('input[type="password"]').type(testAdvisor.password);
    cy.get('button[type="submit"]').click();

    // Should navigate to advisor dashboard (existing user)
    cy.url({ timeout: 10000 }).should('include', '/advisor/dashboard');
  });

  it('Should validate form inputs in professional details', () => {
    // Navigate to professional details directly (simulating post-registration)
    cy.visit('/onboarding/advisor/professional-details');

    // Try to submit without required fields
    cy.get('button[type="submit"], button').contains('Next').click();

    // Should show validation message
    cy.get('body').should('contain', 'required');
  });

  it('Should validate form inputs in service model', () => {
    // Navigate to service model directly
    cy.visit('/onboarding/advisor/service-model');

    // Try to submit without required fields
    cy.get('button[type="submit"], button').contains('Next').click();

    // Should show validation message
    cy.get('body').should('contain', 'select');
  });

  it('Should persist data between steps', () => {
    // Navigate to professional details
    cy.visit('/onboarding/advisor/professional-details');

    // Fill some data
    cy.get('input').first().type(professionalDetails.firstName);
    cy.get('input').eq(1).type(professionalDetails.lastName);

    // Navigate away and back
    cy.visit('/onboarding/advisor/service-model');
    cy.visit('/onboarding/advisor/professional-details');

    // Data should be persisted in localStorage
    cy.window().then((win) => {
      const data = JSON.parse(win.localStorage.getItem('advisorProfessionalDetails') || '{}');
      expect(data.firstName).to.equal(professionalDetails.firstName);
    });
  });
});