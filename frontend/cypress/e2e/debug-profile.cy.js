describe('Debug Profile Issue', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.hideWebpackOverlay();
  });

  it('should check existing user profile data', () => {
    // Login with existing user
    cy.visit('/auth');
    cy.get('input[id="email"]').type('jamal@example.com');
    cy.get('input[id="password"]').type('jamal123');
    cy.get('button[type="submit"]').click();
    
    // Should go to dashboard
    cy.url().should('include', '/app/dashboard');
    
    // Check what profile data we get via API
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      expect(jwt).to.not.be.null;
      
      cy.request({
        url: '/auth/me',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      }).then((response) => {
        cy.log('API Response:', JSON.stringify(response.body, null, 2));
        
        const profile = response.body.profile;
        cy.log('Profile data:', JSON.stringify(profile, null, 2));
        
        // Check individual fields
        cy.log(`first_name: "${profile.first_name}"`);
        cy.log(`last_name: "${profile.last_name}"`);
        cy.log(`dob: "${profile.dob}"`);
        cy.log(`nationalId: "${profile.nationalId}"`);
        
        // Check if these are default values
        const hasDefaultFirstName = profile.first_name === 'New';
        const hasDefaultLastName = profile.last_name === 'User';
        const hasDefaultDob = profile.dob === '1990-01-01';
        const hasDefaultNationalId = profile.nationalId === '12345678';
        
        cy.log('Default value checks:', {
          hasDefaultFirstName,
          hasDefaultLastName, 
          hasDefaultDob,
          hasDefaultNationalId
        });
      });
    });
    
    // Check what the dashboard shows
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      
      if (bodyText.includes('Account Created Successfully!')) {
        cy.log('❌ Dashboard shows incomplete profile');
        cy.get('body').should('contain', '0% Complete');
      } else if (bodyText.includes('Profile Complete')) {
        cy.log('✅ Dashboard shows complete profile');
        cy.get('body').should('contain', 'Welcome back');
      }
    });
  });

  it('should test a fresh registration and onboarding', () => {
    const testEmail = `debug${Date.now()}@example.com`;
    const testPassword = 'test123';
    
    // Register
    cy.visit('/auth');
    cy.get('button').contains('Create Account').click();
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    // Should go to onboarding
    cy.url().should('include', '/onboarding/personal-details');
    
    // Fill personal details with NON-DEFAULT values
    cy.get('input[id="firstName"]').clear().type('TestUser');
    cy.get('input[id="lastName"]').clear().type('TestLastName'); 
    cy.get('input[id="dob"]').clear().type('1985-12-25');
    cy.get('input[id="nationalId"]').clear().type('99999999');
    cy.get('button[type="submit"]').click();
    
    // Skip risk questionnaire for now - just see if profile data saves
    cy.url().should('include', '/onboarding/risk-questionnaire');
    cy.get('input[name="q1"][value="Capital preservation"]').check();
    cy.get('input[name="q2"][value="Less than 1 year"]').check();
    cy.get('input[name="q3"][value="Sell all investments"]').check();
    cy.get('input[name="q4"][value="None"]').check();
    cy.get('input[name="q5"][value="None"]').check();
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    // Skip data connection
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('button').contains('Manual Entry (Later)').click();
    
    // Fill cash flow with some data
    cy.url().should('include', '/onboarding/cash-flow-setup');
    cy.get('input[id="monthlyIncome"]').type('50000');
    cy.get('input[id="rent"]').type('20000');
    
    // Complete registration
    cy.get('button').contains('Complete Registration').click();
    
    // Wait for success message
    cy.get('body', { timeout: 10000 }).should('contain', 'Profile updated successfully');
    
    // Check what gets saved
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      expect(jwt).to.not.be.null;
      
      cy.request({
        url: '/auth/me',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      }).then((response) => {
        cy.log('New user profile after onboarding:', JSON.stringify(response.body.profile, null, 2));
        
        const profile = response.body.profile;
        
        // Check if our data was saved
        expect(profile.first_name).to.equal('TestUser');
        expect(profile.last_name).to.equal('TestLastName');
        expect(profile.dob).to.equal('1985-12-25');
        expect(profile.nationalId).to.equal('99999999');
      });
    });
  });
});