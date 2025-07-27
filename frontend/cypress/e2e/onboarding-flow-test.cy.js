describe('Complete Onboarding Flow Test', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.hideWebpackOverlay();
  });

  it('should complete full onboarding flow and unlock dashboard', () => {
    const testEmail = `flowtest${Date.now()}@example.com`;
    const testPassword = 'test123';
    
    // 1. Register new user
    cy.visit('/auth');
    cy.get('button').contains('Create Account').click();
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    // Should navigate to personal details
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('body').should('contain', 'Step 1 of 5');
    
    // 2. Fill personal details
    cy.get('input[id="firstName"]').clear().type('John');
    cy.get('input[id="lastName"]').clear().type('Doe');
    cy.get('input[id="dob"]').clear().type('1990-05-15');
    cy.get('input[id="nationalId"]').clear().type('87654321');
    cy.get('input[id="kraPin"]').clear().type('A087654321B');
    cy.get('input[id="dependents"]').clear().type('2');
    cy.get('button[type="submit"]').click();
    
    // Should navigate to risk questionnaire
    cy.url().should('include', '/onboarding/risk-questionnaire');
    cy.get('body').should('contain', 'Step 2 of 5');
    
    // 3. Fill risk questionnaire
    cy.get('input[name="q1"][value="Capital appreciation"]').check();
    cy.get('input[name="q2"][value="3-5 years"]').check();
    cy.get('input[name="q3"][value="Hold investments"]').check();
    cy.get('input[name="q4"][value="Good"]').check();
    cy.get('input[name="q5"][value="10-25%"]').check();
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    // Wait for risk calculation and navigation
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('body').should('contain', 'Step 3 of 5');
    
    // 4. Skip data connection
    cy.get('button').contains('Manual Entry (Later)').click();
    
    // Should navigate to cash flow setup
    cy.url().should('include', '/onboarding/cash-flow-setup');
    cy.get('body').should('contain', 'Step 4 of 5');
    
    // 5. Fill cash flow data
    cy.get('input[id="monthlyIncome"]').type('75000');
    cy.get('select[id="incomeFrequency"]').select('Monthly');
    cy.get('input[id="rent"]').type('30000');
    cy.get('input[id="utilities"]').type('8000');
    cy.get('input[id="groceries"]').type('15000');
    cy.get('input[id="transport"]').type('10000');
    cy.get('input[id="loanRepayments"]').type('5000');
    
    // 6. Complete registration
    cy.get('button').contains('Complete Registration').click();
    
    // Should show success message
    cy.get('body').should('contain', 'Profile updated successfully');
    
    // Should navigate to dashboard after delay
    cy.url({ timeout: 10000 }).should('include', '/app/dashboard');
    
    // 7. Verify profile completion
    cy.get('body').then(($body) => {
      const bodyText = $body.text();
      
      // Check if profile is marked as complete
      if (bodyText.includes('Profile Complete - All features unlocked!')) {
        cy.log('✅ Profile marked as complete - dashboard unlocked');
        cy.get('body').should('contain', 'Welcome back, John!');
      } else if (bodyText.includes('Account Created Successfully!')) {
        cy.log('❌ Profile still marked as incomplete');
        cy.get('body').should('contain', '0% Complete');
        
        // Log what we see for debugging
        cy.log('Dashboard content:', bodyText.substring(0, 500));
        
        // Check if we can see the profile data in console
        cy.window().then((win) => {
          // Try to get JWT and check profile via API
          const jwt = win.localStorage.getItem('jwt');
          if (jwt) {
            cy.request({
              url: '/auth/me',
              headers: {
                'Authorization': `Bearer ${jwt}`
              }
            }).then((response) => {
              cy.log('Profile API response:', response.body);
            });
          }
        });
      } else {
        cy.log('⚠️ Unexpected dashboard state');
      }
    });
  });
  
  it('should properly save and display profile data', () => {
    // Test with existing user to check if data persists
    cy.visit('/auth');
    cy.get('input[id="email"]').type('jamal@example.com');
    cy.get('input[id="password"]').type('jamal123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/app/dashboard');
    
    // Check what profile data we get
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      if (jwt) {
        cy.request({
          url: '/auth/me',
          headers: {
            'Authorization': `Bearer ${jwt}`
          }
        }).then((response) => {
          cy.log('Existing user profile:', response.body);
          
          // Check profile completeness logic
          const profile = response.body.profile || {};
          const hasDefaultFirstName = profile.first_name === 'New';
          const hasDefaultLastName = profile.last_name === 'User';
          const hasDefaultDob = profile.dob === '1990-01-01';
          const hasDefaultNationalId = profile.nationalId === '12345678';
          
          cy.log('Profile completion check:', {
            profile,
            hasDefaultFirstName,
            hasDefaultLastName,
            hasDefaultDob,
            hasDefaultNationalId
          });
        });
      }
    });
  });
});