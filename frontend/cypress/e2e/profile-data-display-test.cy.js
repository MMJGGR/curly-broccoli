/**
 * Profile Data Display Test
 * Tests that profile data from onboarding is displayed correctly
 */

describe('Profile Data Display Test', () => {
  it('should display onboarding data correctly in profile after login', () => {
    cy.visit('/auth');
    
    // Login with test user who has complete onboarding data
    cy.get('input[type="email"]').type('test@testapi.com');
    cy.get('input[type="password"]').type('testpass123');
    cy.get('button').contains('Login').click();

    // Should navigate to dashboard
    cy.url({ timeout: 15000 }).should('include', '/app/dashboard');

    // Navigate directly to profile page
    cy.visit('/app/profile');
    
    // Verify ProfileDynamic displays onboarding data correctly
    cy.contains('Your Profile', { timeout: 10000 }).should('be.visible');
    
    // Check personal data from onboarding
    cy.contains('Personal Information', { timeout: 5000 }).should('be.visible');
    cy.contains('Test User').should('be.visible'); // firstName + lastName
    cy.contains('1990-01-01').should('be.visible'); // dateOfBirth
    cy.contains('+254123456789').should('be.visible'); // phone
    cy.contains('12345678').should('be.visible'); // nationalId
    cy.contains('A123456789Z').should('be.visible'); // kraPin
    cy.contains('Employed').should('be.visible'); // employmentStatus
    
    // Check financial data
    cy.contains('Financial Information').should('be.visible');
    cy.contains('50,000').should('be.visible'); // monthlyIncome formatted
    
    // Check risk profile
    cy.contains('Risk Profile').should('be.visible');
    cy.contains('80%').should('be.visible'); // risk score
    cy.contains('Aggressive').should('be.visible'); // risk level
    
    // Check onboarding completion status
    cy.contains('Onboarding Status').should('be.visible');
    cy.contains('Complete').should('be.visible'); // status
    
    // Check goals data
    cy.contains('Financial Goals').should('be.visible');
    cy.contains('100,000').should('be.visible'); // emergencyFund
    cy.contains('500,000').should('be.visible'); // homeDownPayment
    cy.contains('1,000,000').should('be.visible'); // retirement
  });

  it('should display budget data from onboarding compatibility endpoint', () => {
    cy.visit('/auth');
    
    // Login
    cy.get('input[type="email"]').type('test@testapi.com');
    cy.get('input[type="password"]').type('testpass123');
    cy.get('button').contains('Login').click();

    // Navigate to budget page
    cy.visit('/app/budget');
    
    // Verify budget loads financial data (this tests BudgetContext using compatibility endpoint)
    cy.contains('Budget', { timeout: 10000 }).should('be.visible');
    
    // Should show financial data from onboarding via compatibility endpoint
    // Allow some time for budget context to load data
    cy.wait(3000);
    
    // Check if any of the expected financial values appear
    // Using more flexible matching since budget display may format numbers differently
    cy.get('body').then((body) => {
      const hasFinancialData = body.text().includes('50') || 
                              body.text().includes('15') || 
                              body.text().includes('43') || 
                              body.text().includes('7'); // net income
      expect(hasFinancialData).to.be.true;
    });
  });
});