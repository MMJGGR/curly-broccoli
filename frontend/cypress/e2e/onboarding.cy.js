describe('Onboarding Flow', () => {
  it('should allow a user to complete the onboarding wizard', () => {
    cy.visit('/');

    // Step 1: Account
    cy.get('input[placeholder="email"]').type('test@example.com');
    cy.get('input[placeholder="Password"]').type('password123');
    cy.get('input[placeholder="Confirm Password"]').type('password123');
    cy.contains('Next').click();

    // Step 2: Personal
    cy.get('input[placeholder="First Name"]').type('John');
    cy.get('input[placeholder="Last Name"]').type('Doe');
    cy.get('input[placeholder="Date of Birth"]').type('1990-01-01');
    cy.get('input[placeholder="National ID"]').type('12345678');
    cy.get('input[placeholder="KRA PIN"]').type('A001234567B');
    cy.contains('Next').click();

    // Step 3: Financial
    cy.get('input[placeholder="Annual Income"]').type('100000');
    cy.get('select').select('Employed');
    cy.get('input[placeholder="Dependents"]').type('2');
    cy.contains('Next').click();

    // Step 4: Goals
    cy.get('select').select('Retirement');
    cy.get('input[placeholder="Target Amount"]').type('500000');
    cy.get('input[placeholder="Time Horizon"]').type('20');
    cy.contains('Next').click();

    // Step 5: Questionnaire
    cy.get('input[type="radio"][value="3"]').check({ force: true });
    cy.contains('Next').click();

    // Step 6: Summary
    cy.contains('Finish & Create Account').click();

    // Assert that the user is redirected to the dashboard
    cy.url().should('include', '/dashboard');
  });
});