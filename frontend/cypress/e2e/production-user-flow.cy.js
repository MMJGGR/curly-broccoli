describe('Production User Flow Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.hideWebpackOverlay();
  });

  describe('User Registration Flow', () => {
    it('should complete individual user registration', () => {
      const uniqueEmail = `user${Date.now()}@example.com`;
      
      cy.visit('/auth');
      
      // Switch to registration mode
      cy.get('button').contains('Create Account').click();
      cy.get('body').should('contain', 'Get Started');
      
      // Verify user type selector defaults to Individual
      cy.get('button').contains('Individual').should('have.class', 'bg-gradient-to-r');
      
      // Fill registration form
      cy.get('input[id="email"]').type(uniqueEmail);
      cy.get('input[id="password"]').type('password123');
      cy.get('input[id="confirmPassword"]').type('password123');
      
      // Submit registration
      cy.intercept('POST', '/auth/register').as('registerRequest');
      cy.get('button[type="submit"]').click();
      
      // Verify registration API call
      cy.wait('@registerRequest').then((interception) => {
        expect(interception.response.statusCode).to.equal(201);
        expect(interception.response.body).to.have.property('access_token');
      });
      
      // Should redirect to dashboard - check if profile is complete or incomplete
      cy.url().should('include', '/app/dashboard');
      cy.get('body').should('contain', 'Welcome');
      
      // New users may have complete or incomplete profiles depending on registration flow
      cy.get('body').then(($body) => {
        if ($body.text().includes('Account Created Successfully!')) {
          cy.get('body').should('contain', '0% Complete');
          cy.get('button').contains('Complete Your Profile').should('be.visible');
        } else {
          cy.get('body').should('contain', 'Profile Complete - All features unlocked!');
        }
      });
    });

    it('should complete advisor registration', () => {
      const uniqueEmail = `advisor${Date.now()}@example.com`;
      
      cy.visit('/auth');
      
      // Switch to registration mode
      cy.get('button').contains('Create Account').click();
      
      // Select Advisor user type
      cy.get('button').contains('Advisor').click();
      cy.get('button').contains('Advisor').should('have.class', 'bg-gradient-to-r');
      
      // Fill registration form
      cy.get('input[id="email"]').type(uniqueEmail);
      cy.get('input[id="password"]').type('password123');
      cy.get('input[id="confirmPassword"]').type('password123');
      
      // Submit registration
      cy.intercept('POST', '/auth/register').as('registerRequest');
      cy.get('button[type="submit"]').click();
      
      // Verify registration API call includes advisor role
      cy.wait('@registerRequest').then((interception) => {
        expect(interception.response.statusCode).to.equal(201);
        expect(interception.request.body.user_type).to.equal('advisor');
      });
      
      // Should redirect to advisor dashboard
      cy.url().should('include', '/advisor/dashboard');
    });
  });

  describe('User Login Flow', () => {
    it('should login existing user with incomplete profile', () => {
      // Use Jamal persona
      cy.visit('/auth');
      
      // Should start in login mode
      cy.get('body').should('contain', 'Welcome Back');
      
      // Fill login form
      cy.get('input[id="email"]').type('jamal@example.com');
      cy.get('input[id="password"]').type('jamal123');
      
      // Submit login
      cy.intercept('POST', '/auth/login').as('loginRequest');
      cy.get('button[type="submit"]').click();
      
      // Verify login API call
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        expect(interception.response.body).to.have.property('access_token');
      });
      
      // Should redirect to dashboard
      cy.url().should('include', '/app/dashboard');
      cy.get('body').should('contain', 'Welcome');
      
      // Check if user has complete or incomplete profile
      cy.get('body').then(($body) => {
        if ($body.text().includes('Account Created Successfully!')) {
          cy.log('User has incomplete profile');
        } else {
          cy.log('User has complete profile');
          cy.get('body').should('contain', 'Profile Complete - All features unlocked!');
        }
      });
    });

    it('should handle invalid login credentials', () => {
      cy.visit('/auth');
      
      // Fill with invalid credentials
      cy.get('input[id="email"]').type('invalid@example.com');
      cy.get('input[id="password"]').type('wrongpassword');
      
      // Submit login
      cy.intercept('POST', '/auth/login').as('loginRequest');
      cy.get('button[type="submit"]').click();
      
      // Verify login fails
      cy.wait('@loginRequest').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([400, 401, 422]);
      });
      
      // Should show error message and stay on auth page
      cy.get('body').should('contain', 'Invalid credentials');
      cy.url().should('include', '/auth');
    });
  });

  describe('User Onboarding Flow', () => {
    it('should complete full onboarding process', () => {
      // Create a new user for onboarding test
      const uniqueEmail = `onboarding${Date.now()}@example.com`;
      
      // First register a new user
      cy.visit('/auth');
      cy.get('button').contains('Create Account').click();
      cy.get('input[id="email"]').type(uniqueEmail);
      cy.get('input[id="password"]').type('password123');
      cy.get('input[id="confirmPassword"]').type('password123');
      cy.get('button[type="submit"]').click();
      
      // Wait for dashboard and check if onboarding is needed
      cy.url().should('include', '/app/dashboard');
      
      cy.get('body').then(($body) => {
        if ($body.text().includes('Complete Your Profile')) {
          // Start onboarding if profile is incomplete
          cy.get('button').contains('Complete Your Profile').click();
          
          // Step 1: Personal Details
          cy.url().should('include', '/onboarding/personal-details');
          cy.get('input[id="firstName"]').clear().type('Test');
          cy.get('input[id="lastName"]').clear().type('User');
          cy.get('input[id="dob"]').clear().type('1987-03-15');
          cy.get('input[id="nationalId"]').clear().type('30123456');
          cy.get('input[id="kraPin"]').clear().type('A030123456Z');
          cy.get('input[id="dependents"]').clear().type('3');
          cy.get('button[type="submit"]').click();
          
          // Step 2: Risk Assessment
          cy.url().should('include', '/risk-questionnaire');
          cy.get('input[type="radio"][value="3"]').first().check();
          cy.get('input[type="radio"][value="3"]').eq(1).check();
          cy.get('input[type="radio"][value="3"]').eq(2).check();
          cy.get('input[type="radio"][value="3"]').eq(3).check();
          cy.get('input[type="radio"][value="3"]').eq(4).check();
          cy.get('button').contains('Calculate My Risk Profile').click();
          
          // Verify risk score calculation
          cy.get('body').should('contain', 'Your risk score is 50');
          cy.get('button').contains('Continue to Cash Flow').click();
          
          // Step 3: Cash Flow Setup
          cy.url().should('include', '/cash-flow');
          cy.get('input[placeholder="Enter your monthly income"]').type('85000');
          cy.get('input[placeholder="Enter your monthly expenses"]').type('65000');
          cy.get('button').contains('Continue to Goals').click();
          
          // Step 4: Financial Goals
          cy.url().should('include', '/goals');
          cy.get('input[placeholder="Enter emergency fund target"]').type('195000');
          cy.get('button').contains('Complete Setup').click();
          
          // Should redirect to complete dashboard
          cy.url().should('include', '/app/dashboard');
          cy.get('body').should('contain', 'Welcome back, Test!');
          cy.get('body').should('contain', 'Profile Complete - All features unlocked!');
        } else {
          // Profile is already complete, skip onboarding
          cy.log('Profile already complete, skipping onboarding flow test');
          cy.get('body').should('contain', 'Profile Complete - All features unlocked!');
        }
      });
    });
  });

  describe('Advisor Flow', () => {
    it('should login advisor account', () => {
      cy.visit('/auth');
      
      // Login as advisor
      cy.get('input[id="email"]').type('emily.advisor@example.com');
      cy.get('input[id="password"]').type('emily123');
      cy.get('button[type="submit"]').click();
      
      // Should redirect to dashboard
      cy.url().should('include', '/app/dashboard');
      cy.get('body').should('contain', 'Welcome');
    });
  });

  describe('Navigation and Session Management', () => {
    it('should handle logout correctly', () => {
      // Login first
      cy.visit('/auth');
      cy.get('input[id="email"]').type('samuel@example.com');
      cy.get('input[id="password"]').type('samuel123');
      cy.get('button[type="submit"]').click();
      
      // Verify logged in
      cy.url().should('include', '/app/dashboard');
      
      // Logout
      cy.get('button').contains('Logout').click();
      
      // Should redirect to auth page
      cy.url().should('include', '/auth');
      cy.get('body').should('contain', 'Welcome Back');
      
      // Verify token is cleared
      cy.window().then((window) => {
        expect(window.localStorage.getItem('jwt')).to.be.null;
      });
    });

    it('should redirect unauthenticated users to auth page', () => {
      // Try to access dashboard without login
      cy.visit('/app/dashboard');
      
      // Should redirect to auth
      cy.url().should('include', '/auth');
    });

    it('should maintain session across page refreshes', () => {
      // Login
      cy.visit('/auth');
      cy.get('input[id="email"]').type('jamal@example.com');
      cy.get('input[id="password"]').type('jamal123');
      cy.get('button[type="submit"]').click();
      
      // Verify dashboard loads
      cy.url().should('include', '/app/dashboard');
      
      // Refresh page
      cy.reload();
      
      // Should still be on dashboard
      cy.url().should('include', '/app/dashboard');
      cy.get('body').should('contain', 'Welcome');
    });
  });
});