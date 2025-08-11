/**
 * Data Alignment Validation Test
 * Tests that Profile, Budget, and Dashboard components display onboarding data correctly
 */

describe('Data Alignment Validation', () => {
  let testUser = {
    email: 'test@testapi.com',
    password: 'testpass123'
  };

  beforeEach(() => {
    // Clear any existing sessions
    cy.clearAllLocalStorage();
    cy.clearAllCookies();
  });

  it('should login and verify profile displays onboarding data correctly', () => {
    cy.visit('/auth');
    
    // Login with test user
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button').contains('Login').click();

    // Should navigate to dashboard after successful login
    cy.url().should('include', '/app/dashboard');
    
    // Navigate to profile
    cy.get('[data-testid="nav-profile"]', { timeout: 10000 }).click();
    cy.url().should('include', '/app/profile');

    // Verify ProfileDynamic displays onboarding data correctly
    cy.contains('Personal Information', { timeout: 10000 }).should('be.visible');
    
    // Check personal data from onboarding
    cy.contains('Test User').should('be.visible'); // firstName + lastName
    cy.contains('1990-01-01').should('be.visible'); // dateOfBirth
    cy.contains('+254123456789').should('be.visible'); // phone
    cy.contains('12345678').should('be.visible'); // nationalId
    cy.contains('A123456789Z').should('be.visible'); // kraPin
    cy.contains('Employed').should('be.visible'); // employmentStatus
    cy.contains('2').should('be.visible'); // dependents

    // Check financial data
    cy.contains('Financial Information').should('be.visible');
    cy.contains('KES 50,000').should('be.visible'); // monthlyIncome
    cy.contains('KES 15,000').should('be.visible'); // rent
    cy.contains('KES 3,000').should('be.visible'); // utilities
    cy.contains('KES 8,000').should('be.visible'); // groceries
    cy.contains('KES 5,000').should('be.visible'); // transport
    cy.contains('KES 12,000').should('be.visible'); // loanRepayments
    cy.contains('KES 43,000').should('be.visible'); // total expenses
    cy.contains('KES 7,000').should('be.visible'); // net income (50000 - 43000)

    // Check risk profile
    cy.contains('Risk Profile').should('be.visible');
    cy.contains('80%').should('be.visible'); // risk score
    cy.contains('Aggressive').should('be.visible'); // risk level
    cy.contains('Completed').should('be.visible'); // questionnaire status

    // Check onboarding completion status
    cy.contains('Onboarding Status').should('be.visible');
    cy.contains('1, 2, 3').should('be.visible'); // completed steps
  });

  it('should verify budget context loads financial data from onboarding', () => {
    // Login first
    cy.visit('/auth');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button').contains('Login').click();

    // Navigate to budget page
    cy.get('[data-testid="nav-budget"]', { timeout: 10000 }).click();
    cy.url().should('include', '/app/budget');

    // Verify budget displays onboarding financial data
    cy.contains('Budget', { timeout: 10000 }).should('be.visible');
    
    // Should show monthly income from onboarding
    cy.contains('50,000', { timeout: 5000 }).should('be.visible');
    
    // Should show expense categories from onboarding
    cy.contains('15,000').should('be.visible'); // rent
    cy.contains('3,000').should('be.visible'); // utilities
    cy.contains('8,000').should('be.visible'); // groceries
    cy.contains('5,000').should('be.visible'); // transport
    cy.contains('12,000').should('be.visible'); // loan repayments
  });

  it('should verify dashboard shows consistent data from onboarding', () => {
    // Login first
    cy.visit('/auth');
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button').contains('Login').click();

    // Should be on dashboard
    cy.url().should('include', '/app/dashboard');
    cy.contains('Timeline', { timeout: 10000 }).should('be.visible');

    // Verify dashboard shows user data
    cy.contains('Test User', { timeout: 5000 }).should('be.visible');
    
    // Check if financial summary shows onboarding data
    cy.contains('50,000').should('be.visible'); // monthly income
    cy.contains('43,000').should('be.visible'); // total expenses
    cy.contains('7,000').should('be.visible'); // net income
  });

  it('should verify no runtime errors occur when loading onboarding data', () => {
    // Monitor console errors
    cy.visit('/auth');
    
    // Login
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button').contains('Login').click();

    // Navigate to each major component and check for errors
    cy.get('[data-testid="nav-profile"]', { timeout: 10000 }).click();
    cy.wait(2000); // Allow time for data loading
    
    cy.get('[data-testid="nav-budget"]').click();
    cy.wait(2000); // Allow time for data loading
    
    cy.get('[data-testid="nav-dashboard"]').click();
    cy.wait(2000); // Allow time for data loading

    // Check that pages loaded without major errors
    cy.get('body').should('be.visible');
    
    // Verify no major error messages are displayed
    cy.get('body').should('not.contain', 'Failed to load');
    cy.get('body').should('not.contain', 'Error:');
    cy.get('body').should('not.contain', '500');
    cy.get('body').should('not.contain', '404');
  });

  it('should verify auth screen works with compatibility endpoint', () => {
    // Test login flow with compatibility endpoint
    cy.visit('/auth');
    
    cy.get('input[type="email"]').type(testUser.email);
    cy.get('input[type="password"]').type(testUser.password);
    cy.get('button').contains('Login').click();

    // Should successfully login and redirect to dashboard
    cy.url({ timeout: 10000 }).should('include', '/app/dashboard');
    
    // Should not show "Profile not found" or similar errors
    cy.get('body').should('not.contain', 'Profile not found');
    cy.get('body').should('not.contain', 'Failed to fetch profile');
    
    // Should display user data indicating successful profile load
    cy.contains('Test', { timeout: 5000 }).should('be.visible');
  });
});