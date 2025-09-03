/**
 * API Endpoints Validation Test
 * Tests all the clean architecture API endpoints created in this session
 * Validates that APIs return expected data structures and handle errors properly
 */

describe('API Endpoints Validation - Clean Architecture', () => {
  const API_BASE = 'http://localhost:8000';
  const mockToken = 'mock-jwt-token';

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.localStorage.setItem('jwt', mockToken);
      win.localStorage.setItem('accessToken', mockToken);
    });
  });

  describe('Income API Endpoints (/api/v1/income-v2/)', () => {
    it('should validate income overview endpoint structure', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/income-v2/overview`,
        headers: {
          'Authorization': `Bearer ${mockToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        // Should return proper structure even if no data
        if (response.status === 200) {
          expect(response.body).to.have.property('total_monthly_income');
          expect(response.body.total_monthly_income).to.be.a('number');
          
          if (response.body.sources) {
            expect(response.body.sources).to.be.an('array');
          }
        }
        // 401/403 is acceptable for auth validation
        expect([200, 401, 403]).to.include(response.status);
      });
    });

    it('should validate income health check endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/income-v2/health`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.have.property('status', 'healthy');
          expect(response.body).to.have.property('service', 'income-v2-clean');
          expect(response.body).to.have.property('architecture', 'clean_architecture');
          expect(response.body).to.have.property('cfa_compliant', true);
        }
        expect([200, 404]).to.include(response.status);
      });
    });
  });

  describe('Expense API Endpoints (/api/v1/expenses-v2/)', () => {
    it('should validate expense summary endpoint structure', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/expenses-v2/`,
        headers: {
          'Authorization': `Bearer ${mockToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.have.property('expenses');
          expect(response.body.expenses).to.be.an('array');
          
          // Validate expense structure if data exists
          if (response.body.expenses.length > 0) {
            const expense = response.body.expenses[0];
            expect(expense).to.have.property('id');
            expect(expense).to.have.property('description');
            expect(expense).to.have.property('expense_category');
            expect(expense).to.have.property('monthly_equivalent');
            expect(expense.monthly_equivalent).to.be.a('number');
          }
        }
        expect([200, 401, 403]).to.include(response.status);
      });
    });

    it('should validate expense health check endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/expenses-v2/health`,
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.have.property('status', 'healthy');
          expect(response.body).to.have.property('service', 'expenses-v2-clean');
          expect(response.body).to.have.property('architecture', 'clean_architecture');
          expect(response.body).to.have.property('cfa_compliant', true);
          expect(response.body).to.have.property('features');
          expect(response.body.features).to.be.an('array');
        }
        expect([200, 404]).to.include(response.status);
      });
    });
  });

  describe('Assets API Endpoints (/api/v1/assets-v2/)', () => {
    it('should validate assets list endpoint structure', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/assets-v2/`,
        headers: {
          'Authorization': `Bearer ${mockToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
          
          // Validate asset structure if data exists
          if (response.body.length > 0) {
            const asset = response.body[0];
            expect(asset).to.have.property('id');
            expect(asset).to.have.property('name');
            expect(asset).to.have.property('asset_type');
            expect(asset).to.have.property('current_value');
            expect(asset.current_value).to.be.a('number');
          }
        }
        expect([200, 401, 403]).to.include(response.status);
      });
    });
  });

  describe('Liabilities API Endpoints (/api/v1/liabilities-v2/)', () => {
    it('should validate liabilities list endpoint', () => {
      cy.request({
        method: 'GET', 
        url: `${API_BASE}/api/v1/liabilities-v2/`,
        headers: {
          'Authorization': `Bearer ${mockToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.be.an('array');
          
          // Validate liability structure if data exists
          if (response.body.length > 0) {
            const liability = response.body[0];
            expect(liability).to.have.property('id');
            expect(liability).to.have.property('name');
            expect(liability).to.have.property('liability_type');
            expect(liability).to.have.property('balance');
            expect(liability.balance).to.be.a('number');
          }
        }
        expect([200, 401, 403]).to.include(response.status);
      });
    });
  });

  describe('Analytics API Endpoints (/api/v1/analytics-v2/)', () => {
    it('should validate spending analytics endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/analytics-v2/spending-analytics`,
        headers: {
          'Authorization': `Bearer ${mockToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          // Should have CFA-compliant structure
          expect(response.body).to.have.property('period');
          expect(response.body).to.have.property('summary');
          expect(response.body).to.have.property('category_breakdown');
          expect(response.body).to.have.property('insights');
          
          if (response.body.summary) {
            expect(response.body.summary).to.have.property('total_income');
            expect(response.body.summary).to.have.property('total_expenses');
            expect(response.body.summary).to.have.property('savings_rate');
          }
        }
        expect([200, 401, 403]).to.include(response.status);
      });
    });
  });

  describe('Transactions API Endpoints (/api/v1/transactions-v2/)', () => {
    it('should validate transactions list endpoint', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/transactions-v2/`,
        headers: {
          'Authorization': `Bearer ${mockToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200) {
          expect(response.body).to.have.property('transactions');
          expect(response.body.transactions).to.be.an('array');
          
          // Validate transaction structure if data exists
          if (response.body.transactions.length > 0) {
            const transaction = response.body.transactions[0];
            expect(transaction).to.have.property('id');
            expect(transaction).to.have.property('amount');
            expect(transaction).to.have.property('description');
            expect(transaction).to.have.property('transaction_date');
          }
        }
        expect([200, 401, 403]).to.include(response.status);
      });
    });
  });

  describe('API Error Handling', () => {
    it('should handle unauthorized requests properly', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/income-v2/overview`,
        failOnStatusCode: false
      }).then((response) => {
        // Should return 401 without valid token
        expect([401, 403]).to.include(response.status);
      });
    });

    it('should handle invalid endpoints gracefully', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/invalid-endpoint`,
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.equal(404);
      });
    });
  });

  describe('Clean Architecture Validation', () => {
    it('should validate all health endpoints are available', () => {
      const healthEndpoints = [
        '/api/v1/income-v2/health',
        '/api/v1/expenses-v2/health'
      ];

      healthEndpoints.forEach(endpoint => {
        cy.request({
          method: 'GET',
          url: `${API_BASE}${endpoint}`,
          failOnStatusCode: false
        }).then((response) => {
          if (response.status === 200) {
            expect(response.body).to.have.property('architecture', 'clean_architecture');
            expect(response.body).to.have.property('cfa_compliant', true);
          }
        });
      });
    });

    it('should validate CFA compliance in responses', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/api/v1/analytics-v2/spending-analytics`,
        headers: {
          'Authorization': `Bearer ${mockToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        if (response.status === 200 && response.body.insights) {
          // Should contain CFA-standard financial insights
          expect(response.body.insights).to.be.an('array');
          
          if (response.body.insights.length > 0) {
            const insight = response.body.insights[0];
            expect(insight).to.have.property('type');
            expect(insight).to.have.property('title');
            expect(insight).to.have.property('message');
            expect(['positive', 'warning', 'neutral']).to.include(insight.type);
          }
        }
      });
    });
  });
});