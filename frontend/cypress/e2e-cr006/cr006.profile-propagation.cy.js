describe('CR006: Profile propagation to Dashboard and Balance Sheet', () => {
  it('updates surplus after profile income change', () => {
    cy.visit('/');
    cy.contains(/welcome back/i, { timeout: 15000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').clear().type('jaggerthee');
    cy.contains('button', /login/i).click();

    cy.url({ timeout: 20000 }).should('include', '/dashboard');

    // Capture current surplus
    cy.visit('/app/dashboard');
    cy.contains(/Monthly Surplus/i, { timeout: 15000 }).parent().then($el => {
      const text = $el.text().replace(/[\s,]/g, '');
      const match = text.match(/(\d+)/);
      const before = match ? parseInt(match[1], 10) : 0;

      // Bump monthly income by 10,000 via API
      cy.window().then(win => {
        const token = win.localStorage.getItem('jwt');
        expect(token, 'jwt token').to.be.a('string');
        cy.request({
          method: 'PUT',
          url: '/auth/profile',
          headers: { Authorization: `Bearer ${token}` },
          body: { monthly_income: 100000 },
        }).then(() => {
          // Return to dashboard and compare surplus increased
          cy.visit('/app/dashboard');
          cy.contains(/Monthly Surplus/i, { timeout: 10000 }).parent().then($el2 => {
            const text2 = $el2.text().replace(/[\s,]/g, '');
            const match2 = text2.match(/(\d+)/);
            const after = match2 ? parseInt(match2[1], 10) : 0;
            expect(after).to.be.greaterThan(before);
          });
        });
      });
    });
  });
});

