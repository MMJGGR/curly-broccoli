describe('Simple Login Test - Authentication Validation', () => {
  const testUser = {
    email: 'richard.macharia@testuser.com',
    password: 'TestPassword123!'
  };

  beforeEach(() => {
    // Clear any existing auth state
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Visit the login page
    cy.visit('/');
  });

  context('Basic Login Functionality', () => {
    it('should successfully log in with valid credentials', () => {
      // Verify we're on the login screen
      cy.contains('Welcome Back').should('be.visible');
      cy.get('input[type="email"]').should('be.visible');
      cy.get('input[type="password"]').should('be.visible');
      
      // Fill in login credentials
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);
      
      // Submit the login form
      cy.get('button[type="submit"]').contains('Login').click();
      
      // Wait for login to complete and redirect
      cy.url({ timeout: 15000 }).should('not.contain', '/login');
      cy.url().should('satisfy', (url) => {
        return url.includes('/dashboard') || url.includes('/app') || url.includes('/onboarding');
      });
      
      // Verify authentication token is stored
      cy.window().then((win) => {
        const token = win.localStorage.getItem('jwt');
        expect(token).to.exist;
        expect(token).to.not.be.empty;
      });
      
      cy.log('✅ Login successful - user authenticated');
    });

    it('should handle invalid credentials gracefully', () => {
      // Fill in invalid credentials
      cy.get('input[type="email"]').type('invalid@example.com');
      cy.get('input[type="password"]').type('wrongpassword');
      
      // Submit the form
      cy.get('button[type="submit"]').contains('Login').click();
      
      // Should show error message and remain on login page
      cy.contains('Invalid credentials').should('be.visible', { timeout: 10000 });
      cy.url().should('not.contain', '/dashboard');
      cy.url().should('not.contain', '/app');
      
      // Verify no token is stored
      cy.window().then((win) => {
        const token = win.localStorage.getItem('jwt');
        expect(token).to.be.null;
      });
      
      cy.log('✅ Invalid login handled correctly');
    });

    it('should validate required fields', () => {
      // Try to submit without filling fields
      cy.get('button[type="submit"]').click();
      
      // HTML5 validation should prevent submission
      cy.get('input[type="email"]:invalid').should('exist');
      
      // Fill email but leave password empty
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('button[type="submit"]').click();
      
      // Password field should be invalid
      cy.get('input[type="password"]:invalid').should('exist');
      
      cy.log('✅ Form validation working correctly');
    });
  });

  context('User Type Selection', () => {
    it('should allow switching between Individual and Advisor', () => {
      // Default should be Individual
      cy.contains('Individual').should('have.class', 'bg-gradient-to-r');
      
      // Click Advisor button
      cy.contains('Advisor').click();
      cy.contains('Advisor').should('have.class', 'bg-gradient-to-r');
      
      // Button text should update
      cy.get('button[type="submit"]').should('contain', 'Login as Advisor');
      
      // Switch back to Individual
      cy.contains('Individual').click();
      cy.contains('Individual').should('have.class', 'bg-gradient-to-r');
      cy.get('button[type="submit"]').should('contain', 'Login as User');
      
      cy.log('✅ User type selection working correctly');
    });
  });

  context('Navigation and State', () => {
    it('should toggle between Login and Registration modes', () => {
      // Should start in login mode
      cy.contains('Welcome Back').should('be.visible');
      cy.contains('New user? Create Account').should('be.visible');
      
      // Switch to registration mode
      cy.contains('New user? Create Account').click();
      
      // Should now be in registration mode
      cy.contains('Get Started').should('be.visible');
      cy.contains('Already have an account? Login').should('be.visible');
      cy.get('input[id="confirmPassword"]').should('be.visible');
      
      // Switch back to login mode
      cy.contains('Already have an account? Login').click();
      
      // Should be back to login mode
      cy.contains('Welcome Back').should('be.visible');
      cy.get('input[id="confirmPassword"]').should('not.exist');
      
      cy.log('✅ Login/Registration toggle working correctly');
    });
  });

  context('Authentication State Management', () => {
    it('should handle authentication token storage correctly', () => {
      // Login with valid credentials
      cy.get('input[type="email"]').type(testUser.email);
      cy.get('input[type="password"]').type(testUser.password);
      cy.get('button[type="submit"]').click();
      
      // Wait for successful login
      cy.url({ timeout: 15000 }).should('not.equal', Cypress.config().baseUrl + '/');
      
      // Verify localStorage contains required items
      cy.window().then((win) => {
        expect(win.localStorage.getItem('jwt')).to.exist;
        expect(win.localStorage.getItem('userType')).to.exist;
      });
      
      cy.log('✅ Authentication state properly stored');
    });
  });

  after(() => {
    // Clean up after tests
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.log('🧹 Test cleanup completed');
  });
});