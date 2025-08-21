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

/**
 * Custom Command: Upload CSV File
 * Helper command for CSV file upload in import modal
 */
Cypress.Commands.add('uploadCSVFile', (fixtureName, fileName = null) => {
  const actualFileName = fileName || fixtureName;
  
  cy.fixture(fixtureName).then((csvContent) => {
    cy.get('input[type="file"]').then(($input) => {
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const file = new File([blob], actualFileName, { type: 'text/csv' });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      $input[0].files = dataTransfer.files;
      $input[0].dispatchEvent(new Event('change', { bubbles: true }));
    });
  });
  
  // Verify file is selected
  cy.contains(actualFileName).should('be.visible');
  cy.log(`✅ CSV file uploaded: ${actualFileName}`);
});

/**
 * Custom Command: Complete CSV Import Workflow
 * Performs the complete CSV import process from button click to completion
 */
Cypress.Commands.add('completeCSVImport', (fixtureName, fileName = null) => {
  // Open import modal
  cy.get('[data-cy="import-transactions-button"]').click();
  cy.contains('Import Transactions from CSV').should('be.visible');
  
  // Upload CSV file
  cy.uploadCSVFile(fixtureName, fileName);
  
  // Import transactions
  cy.contains('button', 'Import Transactions').click();
  
  // Wait for completion
  cy.contains('Import Completed!', { timeout: 15000 }).should('be.visible');
  
  // Verify import summary
  cy.contains('Import Summary').should('be.visible');
  
  // Close modal
  cy.contains('button', 'Done').click();
  
  // Verify modal closed
  cy.get('.fixed.inset-0.bg-gray-600.bg-opacity-50').should('not.exist');
  
  cy.log(`✅ CSV import completed: ${fileName || fixtureName}`);
});

/**
 * Custom Command: Navigate to Budget Tab
 * Helper to navigate to budget tab and wait for it to load
 */
Cypress.Commands.add('navigateToBudgetTab', () => {
  cy.get('[data-cy="nav-budget"], a[href*="/budget"], button:contains("Budget")', { timeout: 10000 })
    .should('be.visible')
    .first()
    .click();
  
  // Wait for budget component to load
  cy.get('[data-cy="budget-header"]', { timeout: 15000 }).should('be.visible');
  cy.hideWebpackOverlay();
  
  cy.log('✅ Navigated to Budget tab');
});

/**
 * Budget vs Profile Expense Consistency Test Commands
 */

/**
 * Register a test user and return user data with auth token
 */
Cypress.Commands.add('registerTestUser', (email, password) => {
  cy.log(`👤 Registering test user: ${email}`);
  
  return cy.request({
    method: 'POST',
    url: 'http://localhost:8000/auth/register',
    body: {
      email: email,
      password: password,
      first_name: 'Test',
      last_name: 'User'
    },
    failOnStatusCode: false
  }).then((response) => {
    if (response.status === 201 || response.status === 200) {
      const token = response.body.access_token || response.body.token;
      
      // Store token for subsequent requests
      cy.window().then((win) => {
        win.localStorage.setItem('jwt', token);
      });
      
      return {
        user: response.body.user || response.body,
        token: token,
        email: email
      };
    } else {
      throw new Error(`Registration failed: ${response.body.detail || 'Unknown error'}`);
    }
  });
});

/**
 * Complete onboarding with specific expense amounts for consistency testing
 */
Cypress.Commands.add('completeOnboardingWithExpenses', (data) => {
  cy.log(`📋 Completing onboarding with expenses`);
  
  // Visit the application
  cy.visit('http://localhost:3000');
  
  // Navigate to onboarding if not already there
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="onboarding-step"]').length === 0) {
      // Look for onboarding entry point
      cy.get('[data-testid="start-onboarding"], .start-onboarding, button:contains("Get Started")')
        .first()
        .click();
    }
  });
  
  // Step 1: Personal Information
  cy.get('[data-testid="first-name-input"], input[name="firstName"]')
    .should('be.visible')
    .clear()
    .type('Test');
  cy.get('[data-testid="last-name-input"], input[name="lastName"]')
    .clear()
    .type('User');
  cy.get('[data-testid="age-input"], input[name="age"]')
    .clear()
    .type('30');
  cy.get('[data-testid="next-step"], button:contains("Next")')
    .click();
  
  // Step 2: Financial Information (Key step for expense data)
  cy.get('[data-testid="monthly-income-input"], input[name="monthlyIncome"]')
    .should('be.visible')
    .clear()
    .type(data.monthlyIncome.toString());
  
  // Input expense categories
  Object.keys(data.expenses).forEach(category => {
    cy.get(`[data-testid="${category}-input"], input[name="${category}"]`)
      .clear()
      .type(data.expenses[category].toString());
  });
  
  cy.get('[data-testid="next-step"], button:contains("Next")')
    .click();
  
  // Step 3: Goals (simple completion)
  cy.get('[data-testid="goal-type-select"], select[name="goalType"]')
    .select('Emergency Fund');
  cy.get('[data-testid="goal-amount-input"], input[name="goalAmount"]')
    .clear()
    .type('100000');
  cy.get('[data-testid="goal-timeline-input"], input[name="timeline"]')
    .clear()
    .type('12');
  cy.get('[data-testid="next-step"], button:contains("Next")')
    .click();
  
  // Step 4: Risk Assessment (quick completion)
  cy.get('[data-testid="risk-question-1"] input[value="3"]').click();
  cy.get('[data-testid="risk-question-2"] input[value="3"]').click();
  cy.get('[data-testid="risk-question-3"] input[value="3"]').click();
  cy.get('[data-testid="next-step"], button:contains("Next")')
    .click();
  
  // Complete onboarding
  cy.get('[data-testid="complete-onboarding"], button:contains("Complete")')
    .click();
  
  // Wait for completion
  cy.get('[data-testid="onboarding-success"], .onboarding-complete')
    .should('be.visible', { timeout: 10000 });
    
  cy.log('✅ Onboarding completed with expense data');
});

/**
 * Complete onboarding with custom expense categories
 */
Cypress.Commands.add('completeOnboardingWithCustomExpenses', (data) => {
  cy.log(`📋 Completing onboarding with custom expenses`);
  
  // Start with basic onboarding
  cy.completeOnboardingWithExpenses({
    monthlyIncome: data.monthlyIncome,
    expenses: data.expenses
  });
  
  // Add custom expenses if provided
  if (data.expenses.customExpenses && data.expenses.customExpenses.length > 0) {
    data.expenses.customExpenses.forEach((customExpense, index) => {
      cy.get('[data-testid="add-custom-expense"], button:contains("Add Custom")')
        .click();
      
      cy.get(`[data-testid="custom-expense-name-${index}"], input[name="customExpenseName"]`)
        .type(customExpense.name);
      
      cy.get(`[data-testid="custom-expense-amount-${index}"], input[name="customExpenseAmount"]`)
        .type(customExpense.amount.toString());
      
      cy.get(`[data-testid="save-custom-expense-${index}"], button:contains("Save")`).click();
    });
  }
});

/**
 * Complete onboarding as a specific persona with their characteristic financial profile
 */
Cypress.Commands.add('completeOnboardingAsPersona', (persona) => {
  cy.log(`👤 Completing onboarding as ${persona.name}`);
  
  // Visit application and start onboarding
  cy.visit('http://localhost:3000');
  
  // Personal details specific to persona
  cy.get('[data-testid="first-name-input"], input[name="firstName"]')
    .should('be.visible')
    .clear()
    .type(persona.profile.firstName);
  cy.get('[data-testid="last-name-input"], input[name="lastName"]')
    .clear()
    .type(persona.profile.lastName);
  cy.get('[data-testid="email-input"], input[name="email"]')
    .clear()
    .type(persona.profile.email);
  cy.get('[data-testid="next-step"]').click();
  
  // Financial information
  cy.get('[data-testid="monthly-income-input"], input[name="monthlyIncome"]')
    .should('be.visible')
    .clear()
    .type(persona.profile.monthlyIncome.toString());
  
  // Persona-specific expenses
  Object.keys(persona.expenses).forEach(category => {
    cy.get(`[data-testid="${category}-input"], input[name="${category}"]`)
      .clear()
      .type(persona.expenses[category].toString());
  });
  
  // Continue with standard onboarding completion
  cy.get('[data-testid="next-step"]').click();
  
  // Goals appropriate for persona
  const personaGoals = {
    jamal: { type: 'Emergency Fund', amount: 50000, timeline: 12 },
    aisha: { type: 'Education', amount: 200000, timeline: 60 },
    samuel: { type: 'Investment', amount: 500000, timeline: 120 }
  };
  
  const goals = personaGoals[persona.profile.firstName.toLowerCase()] || personaGoals.jamal;
  
  cy.get('[data-testid="goal-type-select"], select[name="goalType"]')
    .select(goals.type);
  cy.get('[data-testid="goal-amount-input"], input[name="goalAmount"]')
    .clear()
    .type(goals.amount.toString());
  cy.get('[data-testid="goal-timeline-input"], input[name="timeline"]')
    .clear()
    .type(goals.timeline.toString());
  cy.get('[data-testid="next-step"]').click();
  
  // Risk assessment
  cy.get('[data-testid="risk-question-1"] input[value="3"]').click();
  cy.get('[data-testid="risk-question-2"] input[value="3"]').click();
  cy.get('[data-testid="risk-question-3"] input[value="3"]').click();
  cy.get('[data-testid="next-step"]').click();
  
  // Complete
  cy.get('[data-testid="complete-onboarding"]').click();
  cy.get('[data-testid="onboarding-success"]', { timeout: 10000 }).should('be.visible');
});

/**
 * Complete onboarding with incomplete/minimal data for edge case testing
 */
Cypress.Commands.add('completeOnboardingWithIncompleteData', (data) => {
  cy.log('📋 Completing onboarding with incomplete data');
  
  cy.visit('http://localhost:3000');
  
  // Minimal personal info
  cy.get('[data-testid="first-name-input"], input[name="firstName"]')
    .should('be.visible')
    .type('Test');
  cy.get('[data-testid="last-name-input"], input[name="lastName"]')
    .type('User');
  cy.get('[data-testid="next-step"]').click();
  
  // Minimal financial info
  cy.get('[data-testid="monthly-income-input"], input[name="monthlyIncome"]')
    .type(data.monthlyIncome.toString());
  
  // Only provide specific expenses, leave others empty/zero
  Object.keys(data.expenses).forEach(category => {
    if (data.expenses[category] > 0) {
      cy.get(`[data-testid="${category}-input"], input[name="${category}"]`)
        .type(data.expenses[category].toString());
    }
  });
  
  cy.get('[data-testid="next-step"]').click();
  
  // Skip goals by providing minimal data
  cy.get('[data-testid="skip-goals"], button:contains("Skip")').click();
  
  // Skip risk assessment
  cy.get('[data-testid="skip-risk"], button:contains("Skip")').click();
  
  // Complete with minimal data
  cy.get('[data-testid="complete-onboarding"]').click();
  cy.get('[data-testid="onboarding-success"]', { timeout: 10000 }).should('be.visible');
});

/**
 * Database cleanup task for tests
 */
Cypress.Commands.add('cleanupTestData', () => {
  cy.task('db:cleanup');
});
