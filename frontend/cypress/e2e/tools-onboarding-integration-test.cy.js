describe('Tools Tab - Onboarding Data Integration Test', () => {
  const testUser = {
    email: 'richard.mmacharia@gmail.com',
    password: 'jaggerthee'
  };

  beforeEach(() => {
    cy.visit('/');
    
    // Login with test user
    cy.get('body').then(($body) => {
      if ($body.text().includes('Login') || $body.text().includes('Sign In')) {
        cy.contains('Login').click();
        cy.get('[data-testid="email"], [name="email"], input[type="email"]', { timeout: 10000 }).type(testUser.email);
        cy.get('[data-testid="password"], [name="password"], input[type="password"]').type(testUser.password);
        cy.get('[data-testid="login-submit"], [type="submit"], button').contains(/login|sign in/i).click();
        cy.wait(3000);
      }
    });
  });

  it('should display onboarding income data correctly', () => {
    // Navigate to Tools tab
    cy.contains('Tools', { timeout: 15000 }).click();
    cy.wait(2000);

    // Go to Income Management
    cy.contains('Income Management').click();
    cy.wait(3000);

    // Verify onboarding income appears
    cy.get('body').should('contain', '324,759');  // Primary income amount
    cy.get('body').should('contain', 'Primary Income');
    cy.get('body').should('contain', 'onboarding');

    // Verify total income calculation
    cy.get('body').should('contain', '324,759');
    
    // Check for no network errors
    cy.get('body').should('not.contain', 'ERR_NAME_NOT_RESOLVED');
    cy.get('body').should('not.contain', 'Network Error');
    cy.get('body').should('not.contain', 'Not authenticated');
  });

  it('should display onboarding goals data with proper dates', () => {
    // Navigate to Tools tab
    cy.contains('Tools', { timeout: 15000 }).click();
    cy.wait(2000);

    // Go to Goals Management
    cy.contains('Goals Management').click();
    cy.wait(3000);

    // Verify onboarding goals appear with proper amounts
    cy.get('body').should('contain', '3,897,108');  // Emergency Fund
    cy.get('body').should('contain', '58,456,620'); // Retirement
    cy.get('body').should('contain', '389,711');    // Education
    cy.get('body').should('contain', '1,169,132');  // Investment

    // Verify goal names
    cy.get('body').should('contain', 'Emergency Fund');
    cy.get('body').should('contain', 'Retirement');
    cy.get('body').should('contain', 'Education');
    cy.get('body').should('contain', 'Investment');

    // Verify dates are in YYYY-MM-DD format (not text like "1-year")
    // Emergency Fund should have a date ~1 year from now
    const currentYear = new Date().getFullYear();
    cy.get('body').should('contain', `${currentYear + 1}`);
    
    // Retirement should have a date ~30 years from now
    cy.get('body').should('contain', `${currentYear + 30}`);
    
    // Check for proper date format (contains dashes)
    cy.get('body').should('contain', '-');
    
    // Should NOT contain text timeframes
    cy.get('body').should('not.contain', '1-year');
    cy.get('body').should('not.contain', '10-years');
    cy.get('body').should('not.contain', '30-years');

    // Check for no network errors
    cy.get('body').should('not.contain', 'ERR_NAME_NOT_RESOLVED');
    cy.get('body').should('not.contain', 'Network Error');
  });

  it('should show expense management with onboarding data', () => {
    // Navigate to Tools tab
    cy.contains('Tools', { timeout: 15000 }).click();
    cy.wait(2000);

    // Go to Expense Management
    cy.contains('Expense Management').click();
    cy.wait(3000);

    // Verify onboarding expense data appears
    cy.get('body').should('contain', '41,000');     // Rent
    cy.get('body').should('contain', '20,000');     // Groceries
    cy.get('body').should('contain', '12,000');     // Transport
    cy.get('body').should('contain', '33,253');     // Loan repayments

    // Verify custom expenses from onboarding
    cy.get('body').should('contain', 'Dad Rent');
    cy.get('body').should('contain', 'Salon');
    cy.get('body').should('contain', 'Subscriptions');

    // Verify expense calculations
    cy.get('body').should('contain', 'Monthly Expenses');
    cy.get('body').should('contain', 'Expense Ratio');
    cy.get('body').should('contain', '%');

    // Check for no network errors
    cy.get('body').should('not.contain', 'ERR_NAME_NOT_RESOLVED');
  });

  it('should allow adding new income without authentication errors', () => {
    // Navigate to Tools tab
    cy.contains('Tools', { timeout: 15000 }).click();
    cy.wait(2000);

    // Go to Income Management
    cy.contains('Income Management').click();
    cy.wait(3000);

    // Try to add new income source
    cy.contains('Add Income Source', { timeout: 10000 }).click();
    cy.wait(1000);

    // Fill in form
    cy.get('input[placeholder*="Source"], input[placeholder*="source"]').first().type('Test Income');
    cy.get('input[type="number"], input[placeholder*="amount"]').first().type('50000');
    
    // Submit form
    cy.get('button').contains(/add|create|submit/i).click();
    cy.wait(2000);

    // Should NOT see authentication error
    cy.get('body').should('not.contain', 'Not authenticated');
    cy.get('body').should('not.contain', '401');
    cy.get('body').should('not.contain', 'Unauthorized');

    // Should see success message or updated data
    cy.get('body').should('contain.text', /success|added|created/i);
  });

  it('should verify API endpoints return correct data structure', () => {
    // Test Income API directly
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
        url: '/api/v1/income-v2/overview',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('user_id');
        expect(response.body).to.have.property('total_monthly_income');
        expect(response.body).to.have.property('income_sources');
        expect(response.body.total_monthly_income).to.equal(324759);
        expect(response.body.income_sources).to.have.length.greaterThan(0);
        
        // Verify onboarding income source exists
        const onboardingIncome = response.body.income_sources.find(s => s.id === 'onboarding-primary');
        expect(onboardingIncome).to.exist;
        expect(onboardingIncome.monthly_amount).to.equal(324759);
      });

      // Test Goals V2 API
      cy.request({
        method: 'GET',
        url: '/api/v1/goals-v2/overview',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body).to.have.property('goals');
        expect(response.body.goals).to.have.length.greaterThan(0);
        
        // Verify onboarding goals exist
        const onboardingGoals = response.body.goals.filter(g => g.source === 'onboarding');
        expect(onboardingGoals).to.have.length.greaterThan(0);
        
        // Verify dates are proper format (YYYY-MM-DD)
        onboardingGoals.forEach(goal => {
          expect(goal.target_date).to.match(/^\d{4}-\d{2}-\d{2}$/);
          expect(goal.target_date).to.not.contain('year');
          expect(goal.target_amount).to.be.greaterThan(0);
        });
      });
    });
  });
});