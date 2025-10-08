describe('CR006: Income → Asset linking', () => {
  it('creates asset and links income to it', () => {
    cy.visit('/');
    cy.contains(/welcome back/i, { timeout: 15000 }).should('be.visible');
    cy.get('input[type="email"]').clear().type('richard.mmacharia@gmail.com');
    cy.get('input[type="password"]').clear().type('jaggerthee');
    cy.contains('button', /login/i).click();

    cy.url({ timeout: 20000 }).should('include', '/dashboard');

    // Create an asset via API for linking convenience
    cy.window().then(win => {
      const token = win.localStorage.getItem('jwt');
      cy.request({
        method: 'POST',
        url: '/api/v1/assets-v2/',
        headers: { Authorization: `Bearer ${token}` },
        body: {
          name: 'Test Rental Property',
          asset_type: 'real_estate',
          current_value: 5000000,
          acquisition_cost: 3000000,
          acquisition_date: new Date().toISOString(),
        },
      }).then(res => {
        const assetId = res.body?.asset?.id || res.body?.id;
        expect(assetId, 'asset id').to.be.ok;

        // Open Tools → Income and add income linked to asset
        cy.visit('/app/tools');
        cy.contains(/Income Management/i, { timeout: 10000 }).click();
        cy.get('[data-testid="add-income-button"]').click();
        cy.get('input[placeholder="e.g., Software Developer Salary"]').clear().type('Test Rental Income');
        cy.get('input[placeholder="324759"]').clear().type('25000');
        cy.get('[data-testid="income-asset-select"]').click();
        cy.contains('div[role="option"]', 'Test Rental Property').click({ force: true });
        cy.get('[data-testid="income-asset-rel-select"]').click();
        cy.contains('div[role="option"]', /Rental Income/i).click({ force: true });
        cy.contains('button', /Add Income|Save Income/i).click();

        // Validate relationship via API
        cy.request({
          method: 'GET',
          url: `/api/v1/relationships-v2/component/asset/${assetId}`,
          headers: { Authorization: `Bearer ${token}` },
        }).then(r => {
          expect(r.status).to.eq(200);
          expect(r.body?.data?.total_relationships).to.be.greaterThan(0);
        });
      });
    });
  });
});

