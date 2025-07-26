describe('Account Modal Smoke Test', () => {
  beforeEach(() => {
    const email = `testuser${Date.now()}@example.com`; // Define email once
    const password = 'password';

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
      body: { username: email, password }, // Use the defined email
    }).then((resp) => {
      window.localStorage.setItem('jwt', resp.body.access_token);
    });
  });

  it('should open the add account modal, fill form, submit, and close', () => {
    let accountCreated = false;
    
    // Mock the accounts list - returns empty initially, then includes new account after creation
    cy.intercept('GET', '**/accounts/', (req) => {
      if (accountCreated) {
        req.reply({ statusCode: 200, body: [{ id: 'mock-id', name: 'Test Account', balance: 100, type: 'Checking', institution_name: 'Test Bank' }] });
      } else {
        req.reply({ statusCode: 200, body: [] });
      }
    }).as('getAccounts');
    
    // Mock the account creation
    cy.intercept('POST', '**/accounts/', (req) => {
      accountCreated = true;
      req.reply({ statusCode: 200, body: { id: 'mock-id', name: 'Test Account', balance: 100, type: 'Checking', institution_name: 'Test Bank' } });
    }).as('createAccount');

    cy.visit('/app/cashflows');
    cy.hideWebpackOverlay();
    cy.wait(1000); // Wait for the page to stabilize

    cy.log('Attempting to click Add New Account button programmatically...');
    cy.screenshot('before-add-account-click');

    cy.get('[data-testid="add-account-button"]').should('be.visible').and('be.enabled').and('not.be.disabled').click();

    cy.log('Clicked Add New Account button programmatically.');
    cy.screenshot('after-add-account-click');

    cy.get('[data-testid="account-form-modal"]', { timeout: 10000 }).should('be.visible');
    cy.get('[data-testid="account-name-input"]').should('be.visible').type('Test Account');
    cy.get('[data-testid="account-balance-input"]').type('100');
    cy.get('[data-testid="account-type-select"]').select('Checking');
    cy.get('[data-testid="institution-name-input"]').type('Test Bank');
    cy.get('[data-testid="submit-add-account"]').click();
    cy.wait('@createAccount'); // Wait for the mocked API call to complete
    cy.wait(1000); // Give API call and re-render time to complete
    cy.get('[data-testid="account-form-modal"]').should('not.exist'); // Ensure modal closes
    cy.contains('Test Account').should('be.visible');
  });
});