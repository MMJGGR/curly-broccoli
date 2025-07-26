describe('UI account CRUD', () => {
  const email = `user${Date.now()}@example.com`;
  const password = 'Passw0rd!';

  beforeEach(() => {
    cy.request('POST', 'http://localhost:8000/dev/clear-db');

    cy.request('POST', 'http://localhost:8000/auth/register', {
      email,
      password,
      dob: '1990-01-01',
      nationalId: '12345678',
      kra_pin: `A1B2C3${Date.now()}`,
      annual_income: 50000,
      dependents: 0,
      goals: { targetAmount: 10000, timeHorizon: 12 },
      questionnaire: [1, 2, 3],
    });

    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/login',
      form: true,
      body: { username: email, password },
    }).then((resp) => {
      window.localStorage.setItem('jwt', resp.body.access_token);
    });
  });

  it('create, update and delete account with UI verification', () => {
    const testAccount = { 
      id: 'test-account-1', 
      name: 'Test Account', 
      balance: 100, 
      type: 'Checking', 
      institution_name: 'Test Bank' 
    };
    
    const updatedAccount = { 
      id: 'test-account-1', 
      name: 'Updated Account', 
      balance: 200, 
      type: 'Checking', 
      institution_name: 'Test Bank' 
    };
    
    // Step 1: Initially empty accounts
    cy.intercept('GET', '**/accounts/', { statusCode: 200, body: [] }).as('getAccountsEmpty');
    
    // Step 2: After creation - show the created account
    cy.intercept('POST', '**/accounts/', (req) => {
      // Override the GET to return the account after creation
      cy.intercept('GET', '**/accounts/', { statusCode: 200, body: [testAccount] }).as('getAccountsWithNew');
      req.reply({ statusCode: 200, body: testAccount });
    }).as('createAccount');
    
    // Step 3: After update - show the updated account  
    cy.intercept('PUT', '**/accounts/test-account-1', (req) => {
      // Override the GET to return the updated account
      cy.intercept('GET', '**/accounts/', { statusCode: 200, body: [updatedAccount] }).as('getAccountsWithUpdated');
      req.reply({ statusCode: 200, body: updatedAccount });
    }).as('updateAccount');
    
    // Step 4: After delete - show empty accounts
    cy.intercept('DELETE', '**/accounts/test-account-1', (req) => {
      // Override the GET to return empty accounts after deletion
      cy.intercept('GET', '**/accounts/', { statusCode: 200, body: [] }).as('getAccountsAfterDelete');
      req.reply({ statusCode: 200, body: {} });
    }).as('deleteAccount');

    cy.visit('/app/cashflows');
    cy.hideWebpackOverlay();
    cy.wait(1000); // Wait for the page to stabilize

    // 1. Create Account
    cy.log('Attempting to click Add New Account button...');
    cy.get('[data-testid="add-account-button"]').should('be.visible').and('be.enabled').and('not.be.disabled').trigger('click', { force: true });
    cy.log('Clicked Add New Account button.');

    cy.get('[data-testid="account-form-modal"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="account-name-input"]').should('be.visible').type('Test Account');
    cy.get('[data-testid="account-balance-input"]').type('100');
    cy.get('[data-testid="account-type-select"]').select('Checking');
    cy.get('[data-testid="institution-name-input"]').type('Test Bank');
    cy.get('[data-testid="submit-add-account"]').click();
    cy.get('[data-testid="account-form-modal"]').should('not.exist'); // Ensure modal closes
    cy.contains('Test Account').should('be.visible');

    // 2. Update Account
    cy.contains('tr', 'Test Account').within(() => {
        cy.get('[data-testid="edit-account-button"]').click();
    });
    cy.get('[data-testid="account-form-modal"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="account-name-input"]').clear().type('Updated Account');
    cy.get('[data-testid="account-balance-input"]').clear().type('200');
    cy.get('[data-testid="submit-edit-account"]').click();
    cy.get('[data-testid="account-form-modal"]').should('not.exist'); // Ensure modal closes
    cy.contains('Updated Account').should('be.visible');

    // 3. Delete Account
    cy.contains('tr', 'Updated Account').within(() => {
        cy.get('[data-testid="delete-account-button"]').click();
    });
    cy.get('[data-testid="confirmation-dialog"]').should('be.visible');
    cy.get('[data-testid="confirm-delete-button"]').click();
    cy.get('[data-testid="confirmation-dialog"]').should('not.exist'); // Ensure dialog closes
    cy.contains('Updated Account').should('not.exist');
  });
});