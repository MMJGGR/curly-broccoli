describe('API smoke tests', () => {
  beforeEach(() => {
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });
  it('healthz responds with status ok', () => {
    cy.request('/healthz').its('status').should('eq', 200);
  });

  it('register returns token', () => {
    cy.request('POST', '/auth/register', {
      email: 'cy@example.com',
      password: 'Passw0rd!',
      dob: '1990-01-01',
      nationalId: '12345678',
      kra_pin: 'A1B2C3',
      annual_income: 50000,
      dependents: 0,
      goals: { targetAmount: 10000, timeHorizon: 12 },
      questionnaire: [1, 2, 3],
    })
      .its('body')
      .should('have.property', 'access_token');
  });
});
