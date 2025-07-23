describe('UI account CRUD', () => {
  const email = `user${Date.now()}@example.com`;
  const password = 'Passw0rd!';
  let token;
  let accountId;

  beforeEach(() => {
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
      token = resp.body.access_token;
      window.localStorage.setItem('jwt', token);
    });
  });

  it('create, update and delete account with UI verification', () => {
    cy.visit('/app/cashflows');
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/accounts/',
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Test Account', balance: 100, type: 'checking', institution_name: 'Test Bank' },
    }).then((resp) => {
      accountId = resp.body.id;
    });
    cy.reload();
    cy.wait(1000);
    cy.contains('Test Account').should('exist');

    cy.request({
      method: 'PUT',
      url: `http://localhost:8000/accounts/${accountId}`,
      headers: { Authorization: `Bearer ${token}` },
      body: { name: 'Updated Account', balance: 200 },
    });
    cy.reload();
    cy.wait(1000);
    cy.contains('Updated Account').should('exist');

    cy.request({
      method: 'DELETE',
      url: `http://localhost:8000/accounts/${accountId}`,
      headers: { Authorization: `Bearer ${token}` },
    });
    cy.reload();
    cy.wait(1000);
    cy.contains('Updated Account').should('not.exist');
  });
});
