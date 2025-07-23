describe('Onboarding Flow', () => {
  const email = `user${Date.now()}@example.com`;
  const password = 'Passw0rd!';

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
      window.localStorage.setItem('jwt', resp.body.access_token);
    });
  });

  it('should allow a user to complete the onboarding wizard', () => {
    cy.visit('/app/onboarding');
    cy.get('input[placeholder="email"]').type(email);
    cy.get('input[placeholder="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // ... rest of the test
  });
});
