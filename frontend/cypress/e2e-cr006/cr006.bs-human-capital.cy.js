describe('CR006: Balance Sheet lifetime assets increase after income raise', () => {
  it('lifetime total assets increases when monthly income increases', () => {
    cy.visit('/');
    cy.contains(/welcome back/i, { timeout: 15000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').clear().type('jaggerthee');
    cy.contains('button', /login/i).click();

    cy.url({ timeout: 20000 }).should('include', '/dashboard');
    cy.visit('/app/balance-sheet');
    cy.get('[data-testid="toggle-lifetime"]').click();
    cy.get('[data-testid="lifetime-total-assets"]', { timeout: 20000 }).invoke('text').then(text => {
      const before = parseInt(text.replace(/[\D]/g, '')) || 0;
      cy.window().then(win => {
        const token = win.localStorage.getItem('jwt');
        cy.request({
          method: 'PUT',
          url: '/auth/profile',
          headers: { Authorization: `Bearer ${token}` },
          body: { monthly_income: 150000 },
        }).then(() => {
          cy.visit('/app/balance-sheet');
          cy.get('[data-testid="toggle-lifetime"]').click();
          cy.get('[data-testid="lifetime-total-assets"]').invoke('text').then(text2 => {
            const after = parseInt(text2.replace(/[\D]/g, '')) || 0;
            expect(after).to.be.greaterThan(before);
          });
        });
      });
    });
  });
});

