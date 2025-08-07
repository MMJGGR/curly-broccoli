describe('Registration Flow Test', () => {
  beforeEach(() => {
    // Clear any existing storage
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Visit the auth page
    cy.visit('/auth');
  });

  it('should register individual user and navigate to onboarding', () => {
    const testEmail = `testuser${Date.now()}@example.com`;
    
    // Switch to registration mode
    cy.contains('Don\'t have an account?').click();
    
    // Fill registration form
    cy.get('#email').should('be.visible').type(testEmail);
    cy.get('#password').should('be.visible').type('testpass123');
    
    // Ensure individual user type is selected (should be default)
    cy.get('input[value="individual"]').should('be.checked');
    
    // Submit registration
    cy.get('button[type="submit"]').click();
    
    // Wait for success message
    cy.contains('Account created successfully!', { timeout: 10000 }).should('be.visible');
    
    // Check that JWT token is stored
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt')).to.not.be.null;
      expect(win.localStorage.getItem('userType')).to.equal('individual');
    });
    
    // Should navigate to onboarding wizard (not login page)
    cy.url({ timeout: 10000 }).should('include', '/onboarding');
    
    // Should not redirect back to login
    cy.url().should('not.include', '/auth');
    
    // Should see onboarding content (not login form)
    cy.contains('Personal Information', { timeout: 5000 }).should('be.visible');
  });

  it('should register advisor and navigate to advisor onboarding', () => {
    const testEmail = `testadvisor${Date.now()}@example.com`;
    
    // Switch to registration mode
    cy.contains('Don\'t have an account?').click();
    
    // Fill registration form
    cy.get('#email').should('be.visible').type(testEmail);
    cy.get('#password').should('be.visible').type('testpass123');
    
    // Select advisor user type
    cy.get('input[value="advisor"]').check();
    
    // Submit registration
    cy.get('button[type="submit"]').click();
    
    // Wait for success message
    cy.contains('Account created successfully!', { timeout: 10000 }).should('be.visible');
    
    // Check that JWT token is stored
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt')).to.not.be.null;
      expect(win.localStorage.getItem('userType')).to.equal('advisor');
    });
    
    // Should navigate to advisor onboarding
    cy.url({ timeout: 10000 }).should('include', '/onboarding/advisor');
    
    // Should not redirect back to login
    cy.url().should('not.include', '/auth');
    
    // Should see advisor onboarding content
    cy.contains('Professional Details', { timeout: 5000 }).should('be.visible');
  });

  it('should handle existing user login and dashboard routing', () => {
    // First register a user
    const testEmail = `logintest${Date.now()}@example.com`;
    
    cy.contains('Don\'t have an account?').click();
    cy.get('#email').type(testEmail);
    cy.get('#password').type('testpass123');
    cy.get('button[type="submit"]').click();
    
    // Wait for registration to complete and redirect
    cy.url({ timeout: 10000 }).should('include', '/onboarding');
    
    // Logout
    cy.clearLocalStorage();
    
    // Now test login
    cy.visit('/auth');
    
    // Login with the same credentials
    cy.get('#email').type(testEmail);
    cy.get('#password').type('testpass123');
    cy.get('button[type="submit"]').click();
    
    // Should navigate to dashboard (profile incomplete)
    cy.url({ timeout: 10000 }).should('include', '/app/dashboard');
    
    // Should see incomplete profile screen with "Complete Your Profile" button
    cy.contains('Complete Your Profile', { timeout: 5000 }).should('be.visible');
  });
});