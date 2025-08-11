/**
 * Focused Jamal Persona Test
 * Testing the Budget Integration with Jamal persona specifically
 */

describe('Jamal Persona Testing', () => {
  const richardTestData = {
    monthlyIncome: '324759',
    expenses: {
      rent: '41000',
      utilities: '9000', 
      groceries: '20000',
      transport: '12000',
      loanRepayments: '33247',
      blackTax: '32000'
    },
    calculatedSurplus: '177512'
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('http://localhost:3000');
  });

  it('should create Jamal persona user and test budget recommendations', () => {
    cy.log('=== JAMAL PERSONA TEST ===');
    
    // Step 1: Create Jamal persona user
    const userEmail = `jamal.test.${Date.now()}@example.com`;
    
    cy.log('Step 1: User Registration');
    cy.contains('New user? Create Account').click();
    cy.wait(500);
    
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').first().type('JamalTest123!');
    cy.get('input[type="password"]').last().type('JamalTest123!');
    cy.get('button[type="submit"]').click();
    
    cy.log('Step 2: Personal Information');
    // Wait for onboarding to load
    cy.url().should('include', '/onboarding', { timeout: 10000 });
    
    // Wait for the form to be fully loaded and enabled
    cy.get('input[id="firstName"]').should('be.visible').should('not.be.disabled');
    cy.get('input[id="lastName"]').should('be.visible').should('not.be.disabled');
    cy.get('input[id="phone"]').should('be.visible').should('not.be.disabled');
    
    // Fill in the form
    cy.get('input[id="firstName"]').clear().type('Jamal');
    cy.get('input[id="lastName"]').clear().type('TestUser');
    cy.get('input[id="phone"]').clear().type('+254701234567');
    cy.contains('button', 'Next Step').click();
    
    cy.log('Step 3: Risk Assessment (High Risk for Jamal)');
    // Answer questions to get Jamal persona (high risk)
    const jamalAnswers = [4, 5, 4, 5, 4]; // High risk answers
    jamalAnswers.forEach((answer, index) => {
      cy.get(`input[name="question-${index + 1}"]`).eq(answer - 1).click({ force: true });
    });
    cy.contains('button', 'Next Step').click();
    
    cy.log('Step 4: Financial Information');
    cy.get('input[id="monthlyIncome"]').type(richardTestData.monthlyIncome);
    const totalExpenses = Object.values(richardTestData.expenses)
      .reduce((sum, expense) => sum + parseInt(expense), 0);
    cy.get('input[id="monthlyExpenses"]').type(totalExpenses.toString());
    
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Complete Registration').click();
    
    cy.log('Step 5: Verify Dashboard Load and Persona');
    cy.url().should('include', '/dashboard', { timeout: 15000 });
    
    // Verify Jamal persona is active
    cy.get('[data-cy=persona-badge]', { timeout: 10000 })
      .should('contain', 'Jamal Profile')
      .should('be.visible');
    
    cy.log('Step 6: Navigate to Budget and Test Features');
    cy.contains('Budget').click();
    cy.url().should('include', '/budget');
    
    // Verify budget header with persona theming
    cy.get('[data-cy=budget-header]').should('be.visible');
    
    // Verify Jamal-specific recommendations
    cy.get('[data-cy=persona-recommendations]', { timeout: 5000 }).should('be.visible');
    cy.contains('Jamal Recommendations').should('be.visible');
    cy.contains('investment allocation').should('be.visible');
    
    // Verify surplus calculation
    cy.get('[data-cy=actual-surplus]').should('contain', '177,512');
    cy.get('[data-cy=surplus-message]').should('contain', 'Available for additional goals');
    
    cy.log('Step 7: Test Budget Editing');
    cy.contains('Edit Budget').click();
    
    // Test investment goal allocation (Jamal should prefer investments)
    cy.get('[data-cy=goal-investments]').should('be.visible').clear().type('50000');
    
    cy.contains('Save Budget').click();
    cy.contains('Saved').should('be.visible', { timeout: 5000 });
    
    cy.log('✅ Jamal persona test completed successfully');
  });
});