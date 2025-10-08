describe('API Connectivity Verification', () => {
  const testUser = {
    email: 'richard.mmacharia@gmail.com',
    password: 'jaggerthee'
  };

  it('should verify Income and Goals APIs work through the application', () => {
    // Visit the application
    cy.visit('/');
    
    // Navigate to login or check if already logged in
    cy.get('body').then(($body) => {
      if ($body.text().includes('Login') || $body.text().includes('Sign In')) {
        // Need to login
        cy.contains('Login').click();
        cy.get('[data-testid="email"], [name="email"], input[type="email"]').type(testUser.email);
        cy.get('[data-testid="password"], [name="password"], input[type="password"]').type(testUser.password);
        cy.get('[data-testid="login-submit"], [type="submit"], button').contains(/login|sign in/i).click();
        cy.wait(2000);
      }
    });

    // Navigate to Tools tab
    cy.contains('Tools', { timeout: 15000 }).click();
    cy.wait(2000);

    // Test Income Management section
    cy.contains('Income Management', { timeout: 10000 }).click();
    cy.wait(3000);

    // Verify Income API loads without ERR_NAME_NOT_RESOLVED
    cy.get('body').should('not.contain', 'ERR_NAME_NOT_RESOLVED');
    cy.get('body').should('not.contain', 'Network Error');
    cy.get('body').should('not.contain', 'Failed to fetch');
    
    // Look for income-related content
    cy.get('body').should('contain.text', 'Income');

    // Test Goals Management section
    cy.contains('Goals Management').click();
    cy.wait(3000);

    // Verify Goals API loads without ERR_NAME_NOT_RESOLVED
    cy.get('body').should('not.contain', 'ERR_NAME_NOT_RESOLVED');
    cy.get('body').should('not.contain', 'Network Error');
    cy.get('body').should('not.contain', 'Failed to fetch');
    
    // Look for goals-related content
    cy.get('body').should('contain.text', 'Goal');
  });

  it('should directly test API endpoints', () => {
    // Get auth token first
    cy.request({
      method: 'POST',
      url: '/auth/login',
      form: true,
      body: {
        username: testUser.email,
        password: testUser.password
      }
    }).then((response) => {
      const token = response.body.access_token;
      
      // Test Income V2 API
      cy.request({
        method: 'GET',
        url: '/api/v1/income-v2/health',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('healthy');
        expect(response.body.service).to.equal('income-v2-clean');
      });

      cy.request({
        method: 'GET',
        url: '/api/v1/income-v2/overview',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('user_id');
        expect(response.body).to.have.property('total_monthly_income');
        expect(response.body).to.have.property('income_sources');
      });

      // Test Goals V2 API
      cy.request({
        method: 'GET',
        url: '/api/v1/goals-v2/health',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.status).to.equal('healthy');
        expect(response.body.service).to.equal('goals-v2-clean');
      });

      cy.request({
        method: 'GET',
        url: '/api/v1/goals-v2/overview',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('user_id');
        expect(response.body).to.have.property('total_target_amount');
        expect(response.body).to.have.property('goals');
      });
    });
  });
});