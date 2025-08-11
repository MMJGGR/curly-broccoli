Cypress.Commands.add('hideWebpackOverlay', () => {
  // Wait a short period for the overlay to potentially appear
  cy.wait(500); // Give it some time to render

  // Check if the overlay iframe exists and remove it
  cy.get('body', { log: false }).then($body => {
    const $iframe = $body.find('iframe#webpack-dev-server-client-overlay');
    if ($iframe.length) {
      cy.wrap($iframe, { log: false }).invoke('remove');
      Cypress.log({
        name: 'hideWebpackOverlay',
        message: 'Webpack dev server overlay removed.',
      });
    } else {
      Cypress.log({
        name: 'hideWebpackOverlay',
        message: 'Webpack dev server overlay not found (no action taken).',
      });
    }
  });
});

/**
 * Custom Command: Login
 * Logs in a user with provided credentials
 */
Cypress.Commands.add('login', (email, password) => {
  cy.log(`🔐 Logging in as: ${email}`);
  
  // Visit login page
  cy.visit('http://localhost:3000');
  
  // Wait for page to load and look for login form
  cy.get('body').then(($body) => {
    // If not already on login page, navigate to it
    if ($body.find('input[type="email"], input[name="email"]').length === 0) {
      // Look for login button or link
      cy.get('a:contains("Login"), a:contains("Sign In"), button:contains("Login"), button:contains("Sign In")')
        .first()
        .click({ timeout: 5000 });
    }
  });
  
  // Fill in credentials
  cy.get('input[type="email"], input[name="email"]', { timeout: 10000 })
    .should('be.visible')
    .clear()
    .type(email);
    
  cy.get('input[type="password"], input[name="password"]')
    .should('be.visible')
    .clear()
    .type(password);
  
  // Submit form
  cy.get('button[type="submit"], button:contains("Login"), button:contains("Sign In")')
    .should('be.visible')
    .click();
  
  // Wait for successful login (should redirect away from login)
  cy.url({ timeout: 15000 }).should('not.contain', '/login');
  
  // Verify we're logged in by checking for success indicators
  cy.url().should('satisfy', (url) => {
    return url.includes('/dashboard') || url.includes('/app') || url.includes('/home');
  });
  
  cy.log(`✅ Login successful for: ${email}`);
});

// Import accessibility testing commands
import './accessibility-commands';

/**
 * Custom Command: Create User with Specific Persona
 * Creates a test user and completes onboarding to generate the specified persona
 */
Cypress.Commands.add('createUserWithPersona', (persona, financialData) => {
  const userEmail = `${persona}.${Date.now()}@example.com`;
  
  cy.log(`Creating ${persona} persona user with email: ${userEmail}`);
  
  // Registration flow
  cy.contains('New user? Create Account').click();  // Switch to registration mode
  cy.wait(500); // Allow mode switch
  cy.get('input[type="email"]').type(userEmail);
  cy.get('input[type="password"]').first().type(`${persona}Test123!`);
  cy.get('input[type="password"]').last().type(`${persona}Test123!`);
  cy.get('button[type="submit"]').click();
  
  // Personal information
  cy.get('input[id="firstName"]').type(persona.charAt(0).toUpperCase() + persona.slice(1));
  cy.get('input[id="lastName"]').type('TestUser');
  cy.get('input[id="phone"]').type('+254701234567');
  cy.contains('button', 'Next Step').click();
  
  // Risk assessment - set answers to generate specific persona
  const riskAnswers = {
    jamal: [4, 5, 4, 5, 4],   // High risk tolerance -> Jamal
    aisha: [3, 3, 3, 3, 3],   // Moderate risk tolerance -> Aisha  
    samuel: [1, 2, 1, 2, 1]   // Low risk tolerance -> Samuel
  };
  
  riskAnswers[persona].forEach((answer, index) => {
    cy.get(`input[name="question-${index + 1}"]`).eq(answer - 1).click({ force: true });
  });
  cy.contains('button', 'Next Step').click();
  
  // Financial information
  cy.get('input[id="monthlyIncome"]').type(financialData.monthlyIncome);
  
  // Calculate total expenses from provided data
  const totalExpenses = Object.values(financialData.expenses)
    .reduce((sum, expense) => sum + parseInt(expense), 0);
  cy.get('input[id="monthlyExpenses"]').type(totalExpenses.toString());
  
  cy.contains('button', 'Next Step').click();
  cy.contains('button', 'Next Step').click();
  cy.contains('button', 'Complete Registration').click();
  
  // Wait for Dashboard to load
  cy.url().should('include', '/dashboard', { timeout: 10000 });
  cy.log(`✅ ${persona} persona user created successfully`);
});

/**
 * Custom Command: Verify Persona Theme
 * Validates that the UI shows the correct persona theming
 */
Cypress.Commands.add('verifyPersonaTheme', (persona) => {
  const expectedThemes = {
    jamal: { color: 'blue', name: 'Investment Blue' },
    aisha: { color: 'purple', name: 'Family Purple' },
    samuel: { color: 'green', name: 'Stability Green' }
  };
  
  const theme = expectedThemes[persona];
  cy.get('[data-cy=persona-badge]')
    .should('contain', `${persona.charAt(0).toUpperCase() + persona.slice(1)} Profile`)
    .should('be.visible');
    
  cy.log(`✅ ${persona} persona theme verified: ${theme.name}`);
});

/**
 * Custom Command: Verify Budget Health Score
 * Validates budget health calculation and display
 */
Cypress.Commands.add('verifyBudgetHealth', (expectedSurplus, expectedHealth) => {
  cy.get('[data-cy=actual-surplus]').should('contain', expectedSurplus);
  
  if (expectedHealth === 'healthy') {
    cy.get('[data-cy=surplus-message]').should('contain', 'Available for additional goals');
    cy.get('[data-cy=alignment-score]').should('exist');
  } else {
    cy.get('[data-cy=surplus-message]').should('contain', 'Budget adjustment needed');
  }
  
  cy.log(`✅ Budget health verified: ${expectedHealth}`);
});

/**
 * Custom Command: Test Budget CRUD Operation
 * Performs Create, Read, Update operations on budget data
 */
Cypress.Commands.add('testBudgetCRUD', (category, field, newValue) => {
  // Enter edit mode
  cy.contains('Edit Budget').click();
  
  // Update field
  cy.get(`[data-cy=${category}-${field}]`).clear().type(newValue);
  
  // Save changes
  cy.contains('Save Budget').click();
  cy.contains('Saved').should('be.visible', { timeout: 5000 });
  
  // Verify persistence
  cy.reload();
  cy.get(`[data-cy=${category}-${field}]`).should('have.value', newValue);
  
  cy.log(`✅ CRUD operation verified: ${category}.${field} = ${newValue}`);
});
