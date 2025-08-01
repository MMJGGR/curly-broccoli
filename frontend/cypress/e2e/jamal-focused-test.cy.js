/**
 * Focused test for Jamal persona validation
 * Testing all functionality step by step
 */

describe('👤 Jamal Mwangi - Focused Validation', () => {
  
  const jamal = {
    email: 'jamal@example.com',
    password: 'jamal12345'
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should successfully login and navigate to profile', () => {
    cy.log('🔐 Testing Jamal login and profile navigation');
    
    // Login
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    
    // Should reach dashboard (user name might be hardcoded in dashboard)
    cy.url().should('include', '/app/dashboard');
    // Note: Dashboard may have hardcoded "Jamal Mwangi" text, not from API
    
    // Navigate to profile using bottom navigation
    cy.get('button').contains('Profile').click();
    cy.url().should('include', '/profile');
    cy.get('h1').should('contain', 'Your Profile');
    
    cy.log('✅ Login and profile navigation successful');
  });

  it('should display Jamal profile data correctly', () => {
    cy.log('📊 Testing Jamal profile data display');
    
    // Login and navigate to profile
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    // Check profile sections exist
    cy.get('body').should('contain', 'Personal Information');
    cy.get('body').should('contain', 'Financial Information');
    cy.get('body').should('contain', 'Risk Profile');
    
    // Verify specific data
    cy.get('body').should('contain', 'Jamal');
    cy.get('body').should('contain', 'Mwangi');
    cy.get('body').should('contain', '636,000'); // Annual income
    cy.get('body').should('contain', 'Risk Score');
    
    cy.log('✅ Profile data display validated');
  });

  it('should show goals and expenses sections with populated data', () => {
    cy.log('🎯 Testing goals and expenses sections with data');
    
    // Login and navigate to profile
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    // Check goals section with populated data
    cy.get('body').should('contain', 'Goals');
    cy.get('body').should('contain', 'Emergency Fund');
    cy.get('body').should('contain', 'Student Loan Payoff');
    cy.get('body').should('contain', 'First Investment');
    cy.get('button').contains('Add New Goal').should('be.visible');
    
    // Check expense categories section with populated data
    cy.get('body').should('contain', 'Monthly Expenses');
    cy.get('body').should('contain', 'Rent');
    cy.get('body').should('contain', 'Food & Groceries');
    cy.get('body').should('contain', 'Transportation');
    
    cy.log('✅ Goals and expenses sections with data validated');
  });

  it('should allow adding a new goal', () => {
    cy.log('➕ Testing goal addition functionality');
    
    // Login and navigate to profile
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    // Add a goal
    cy.get('button').contains('Add New Goal').click();
    
    // Fill goal form
    cy.get('input[placeholder*="Emergency Fund"]').type('Test Emergency Fund');
    cy.get('input[placeholder="100000"]').type('120000');
    cy.get('input[placeholder="25000"]').type('25000');
    cy.get('input[type="date"]').type('2025-12-31');
    
    cy.get('button').contains('Create Goal').click();
    
    // Verify goal was added
    cy.get('body').should('contain', 'Test Emergency Fund');
    cy.get('body').should('contain', '120,000');
    
    cy.log('✅ Goal addition successful');
  });

  it('should navigate to risk questionnaire correctly', () => {
    cy.log('📋 Testing risk questionnaire navigation');
    
    // Login and navigate to profile
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    // Find and click retake risk assessment button
    cy.get('button').contains('Retake Risk Assessment').should('be.visible');
    cy.get('button').contains('Retake Risk Assessment').click();
    
    // Should navigate to risk questionnaire
    cy.url().should('include', '/retake-risk-assessment');
    
    // Wait for page to load and check content with longer timeout
    cy.wait(3000);
    cy.contains('Risk Assessment Questionnaire', { timeout: 10000 }).should('be.visible');
    
    cy.log('✅ Risk questionnaire navigation working');
  });

  it('should maintain data across browser refresh', () => {
    cy.log('🔄 Testing data persistence');
    
    // Login and add a goal
    cy.visit('/auth');
    cy.get('input[id="email"]').type(jamal.email);
    cy.get('input[id="password"]').type(jamal.password);
    cy.get('button[type="submit"]').click();
    cy.get('button').contains('Profile').click();
    
    cy.get('button').contains('Add New Goal').click();
    cy.get('input[placeholder*="Emergency Fund"]').type('Persistence Test Goal');
    cy.get('input[placeholder="100000"]').type('50000');
    cy.get('input[placeholder="25000"]').type('0');
    cy.get('input[type="date"]').type('2026-06-30');
    cy.get('button').contains('Create Goal').click();
    
    // Refresh page
    cy.reload();
    
    // Navigate back to profile
    cy.get('button').contains('Profile').click();
    
    // Goal should still be there
    cy.get('body').should('contain', 'Persistence Test Goal');
    
    cy.log('✅ Data persistence validated');
  });
});