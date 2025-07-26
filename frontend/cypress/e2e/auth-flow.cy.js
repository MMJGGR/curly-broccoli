describe('Authentication Flow', () => {
  beforeEach(() => {
    // Clear database and localStorage before each test
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
    cy.clearLocalStorage();
  });

  describe('Route Protection', () => {
    it('should redirect to auth when not logged in', () => {
      cy.visit('/');
      cy.url().should('include', '/auth');
    });

    it('should redirect to auth when accessing protected routes without token', () => {
      cy.visit('/app/dashboard');
      cy.url().should('include', '/auth');
      cy.hideWebpackOverlay();
    });
  });

  describe('Registration Flow', () => {
    it('should complete new user registration through onboarding', () => {
      const email = `newuser${Date.now()}@example.com`;
      
      // Start at auth screen
      cy.visit('/auth');
      cy.hideWebpackOverlay();
      
      // Click "Get Started" (registration mode) 
      cy.contains('New user? Get Started').click();
      cy.get('h1').should('contain', 'Get Started');
      
      // Click "Start Onboarding" button (no email/password needed for new users)
      cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
      
      // Should navigate to onboarding
      cy.url().should('include', '/onboarding/personal-details');
      
      // Fill personal details
      cy.get('input[id="firstName"]').type('John');
      cy.get('input[id="lastName"]').type('Doe');
      cy.get('input[id="dob"]').type('1990-01-01');
      cy.get('button[type="submit"]').click();
      
      // Should proceed to risk questionnaire
      cy.url().should('include', '/onboarding/risk-questionnaire');
      
      // Fill risk questionnaire (answer all required questions)
      cy.get('input[type="radio"]').first().check(); // First question
      cy.get('input[type="radio"]').eq(4).check(); // Second question  
      cy.get('input[type="radio"]').eq(8).check(); // Third question
      cy.get('input[type="radio"]').eq(12).check(); // Fourth question
      cy.get('input[type="radio"]').eq(16).check(); // Fifth question
      cy.get('button').contains('Calculate My Risk Profile').click();
      
      // Should proceed to data connection
      cy.url().should('include', '/onboarding/data-connection');
      cy.get('button').contains('Manual Entry (Later)').click();
      
      // Should proceed to cash flow setup
      cy.url().should('include', '/onboarding/cash-flow-setup');
      cy.get('button').contains('Complete Registration').click();
      
      // After completing onboarding, should be redirected to dashboard
      cy.url().should('include', '/app/dashboard');
      
      // Should have JWT token in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('jwt')).to.not.be.null;
      });
    });
  });

  describe('Login Flow', () => {
    it('should login existing user and redirect to dashboard', () => {
      const email = `existinguser${Date.now()}@example.com`;
      const password = 'password123';
      
      // First, register a user via API
      cy.request('POST', 'http://localhost:8000/auth/register', {
        email,
        password,
        first_name: 'Test',
        last_name: 'User',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: `A1B2C3${Date.now()}`,
        annual_income: 50000,
        dependents: 0,
        goals: { targetAmount: 10000, timeHorizon: 12 },
        questionnaire: [1, 2, 3],
      });
      
      // Now test login flow
      cy.visit('/auth');
      cy.hideWebpackOverlay();
      
      // Should be in login mode by default
      cy.get('h1').should('contain', 'Login');
      
      // Fill login form
      cy.get('input[id="email"]').type(email);
      cy.get('input[id="password"]').type(password);
      cy.get('button[type="submit"]').should('contain', 'Login').click();
      
      // Should redirect to dashboard after successful login
      cy.url().should('include', '/app/dashboard');
      
      // Should have JWT token in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('jwt')).to.not.be.null;
      });
    });

    it('should show error for invalid credentials', () => {
      cy.visit('/auth');
      cy.hideWebpackOverlay();
      
      // Try to login with invalid credentials
      cy.get('input[id="email"]').type('invalid@example.com');
      cy.get('input[id="password"]').type('wrongpassword');
      cy.get('button[type="submit"]').click();
      
      // Should show error message (check for generic authentication failed message)
      cy.contains('Authentication failed', { timeout: 10000 }).should('be.visible');
      
      // Should remain on auth page
      cy.url().should('include', '/auth');
    });
  });

  describe('Session Persistence', () => {
    it('should redirect logged-in user to dashboard from root', () => {
      const email = `sessionuser${Date.now()}@example.com`;
      const password = 'password123';
      
      // Register and login user
      cy.request('POST', 'http://localhost:8000/auth/register', {
        email,
        password,
        first_name: 'Test',
        last_name: 'User',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: `A1B2C3${Date.now()}`,
        annual_income: 50000,
        dependents: 0,
        goals: { targetAmount: 10000, timeHorizon: 12 },
        questionnaire: [1, 2, 3],
      }).then((resp) => {
        // Set token in localStorage
        window.localStorage.setItem('jwt', resp.body.access_token);
      });
      
      // Visit root - should redirect to dashboard
      cy.visit('/');
      cy.url().should('include', '/app/dashboard');
    });
  });

  describe('Logout Flow', () => {
    it('should logout user and redirect to auth', () => {
      const email = `logoutuser${Date.now()}@example.com`;
      const password = 'password123';
      
      // Register and login user
      cy.request('POST', 'http://localhost:8000/auth/register', {
        email,
        password,
        first_name: 'Test',
        last_name: 'User',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: `A1B2C3${Date.now()}`,
        annual_income: 50000,
        dependents: 0,
        goals: { targetAmount: 10000, timeHorizon: 12 },
        questionnaire: [1, 2, 3],
      }).then((resp) => {
        window.localStorage.setItem('jwt', resp.body.access_token);
      });
      
      // Visit dashboard
      cy.visit('/app/dashboard');
      cy.hideWebpackOverlay();
      
      // Navigate to profile page (use bottom nav)
      cy.contains('Profile').click();
      cy.url().should('include', '/app/profile');
      
      // Click logout button
      cy.contains('Logout').click();
      
      // Should show logout message and redirect to auth
      cy.contains('Logged out successfully').should('be.visible');
      cy.url().should('include', '/auth');
      
      // JWT token should be removed
      cy.window().then((win) => {
        expect(win.localStorage.getItem('jwt')).to.be.null;
      });
    });
  });

  describe('Email Validation', () => {
    it('should prevent registration with existing email', () => {
      const email = `duplicate${Date.now()}@example.com`;
      
      // First, register a user via API
      cy.request('POST', 'http://localhost:8000/auth/register', {
        email,
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
        dob: '1990-01-01',
        nationalId: '12345678',
        kra_pin: `A1B2C3${Date.now()}`,
        annual_income: 50000,
        dependents: 0,
        goals: { targetAmount: 10000, timeHorizon: 12 },
        questionnaire: [1, 2, 3],
      });
      
      // Try to register again with same email via API (simulating onboarding completion)
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/auth/register',
        body: {
          email,
          password: 'password123',
          first_name: 'Test',
          last_name: 'User2',
          dob: '1990-01-01',
          nationalId: '87654321',
          kra_pin: `Z9Y8X7${Date.now()}`,
          annual_income: 60000,
          dependents: 1,
          goals: { targetAmount: 15000, timeHorizon: 18 },
          questionnaire: [2, 3, 4],
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.detail).to.include('Email already registered');
      });
    });
  });
});