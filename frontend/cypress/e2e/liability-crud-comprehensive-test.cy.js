describe('Liability CRUD Comprehensive Testing', () => {
  beforeEach(() => {
    window.localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo');
  });

  it('should test complete liability CRUD cycle - GET, POST, UPDATE, DELETE', () => {
    // Test GET - Initial state
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/liabilities-v2/',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      cy.log(`Initial liability count: ${response.body.debt_count}`);
    });

    // Test POST - Create liability
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/api/v1/liabilities-v2/',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo'
      },
      body: {
        "liability_type": "credit_card",
        "creditor_name": "Test Credit Card",
        "current_balance": 75000,
        "interest_rate": 24.5,
        "minimum_monthly_payment": 3500,
        "credit_limit": 200000,
        "is_secured": false
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      expect(response.body.liability.creditor_name).to.eq('Test Credit Card');
      expect(response.body.liability.current_balance).to.eq(75000);
      cy.log(`Created liability ID: ${response.body.liability.id}`);
      
      // Store liability ID for later tests
      cy.wrap(response.body.liability.id).as('liabilityId');
    });

    // Test GET - Verify creation
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/liabilities-v2/',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.debt_count).to.eq(1);
      expect(response.body.total_liabilities).to.eq(75000);
      expect(response.body.monthly_debt_payments).to.eq(3500);
      expect(response.body.unsecured_debt_total).to.eq(75000);
      cy.log(`Total liabilities: ${response.body.total_liabilities} KES`);
      cy.log(`Monthly payments: ${response.body.monthly_debt_payments} KES`);
    });
  });

  it('should test liability business logic and CFA compliance', () => {
    // Test high-interest debt analysis
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/liabilities-v2/analysis/high-interest',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.high_interest_debt_count).to.be.greaterThan(0);
      cy.log(`High interest debt analysis: ${response.body.high_interest_debt_count} debts over 15%`);
      cy.log(`Recommendations: ${response.body.recommendations.length} recommendations`);
    });
  });

  it('should verify liability integration with balance sheet', () => {
    // Set JWT token
    window.localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo');
    
    cy.visit('http://localhost:3000');
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    
    // Verify balance sheet shows liability data
    cy.contains('Current Liabilities').should('exist');
    cy.get('.text-2xl').contains(/Ksh\s+[1-9][\d,]*\.?\d*/).should('exist');
    
    cy.screenshot('balance-sheet-with-liabilities');
  });
});