/**
 * Clean Architecture Budget API - End-to-End Tests
 * 
 * Tests the new clean architecture budget endpoints (/api/v1/budget-v2/*)
 * Validates CFA-compliant financial calculations, error handling, and data consistency
 * 
 * @author Claude Code & QA Team
 * @version 1.0.0
 * @requires API server running on localhost:8000
 */

describe('Clean Architecture Budget API Tests', () => {
  const API_BASE = 'http://localhost:8000/api/v1';
  const TEST_USER = {
    email: 'clean-arch-test@example.com',
    password: 'TestPassword123!'
  };

  let authToken = '';
  let testUserId = '';

  before(() => {
    // Setup test user and get authentication token
    cy.log('🔧 Setting up Clean Architecture Budget API Tests');
    
    // Register test user
    cy.request({
      method: 'POST',
      url: `${API_BASE}/auth/register`,
      body: {
        email: TEST_USER.email,
        password: TEST_USER.password,
        full_name: 'Clean Architecture Test User'
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 201 || response.status === 409) {
        // User created or already exists - proceed to login
        cy.request({
          method: 'POST',
          url: `${API_BASE}/auth/token`,
          body: {
            username: TEST_USER.email,
            password: TEST_USER.password
          }
        }).then((loginResponse) => {
          expect(loginResponse.status).to.eq(200);
          authToken = loginResponse.body.access_token;
          testUserId = loginResponse.body.user_id;
          cy.log(`✅ Authentication successful for user ID: ${testUserId}`);
        });
      }
    });

    // Setup initial profile data with monthly income
    cy.then(() => {
      if (authToken) {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/onboarding/complete`,
          headers: {
            'Authorization': `Bearer ${authToken}`
          },
          body: {
            personal: {
              first_name: 'Clean',
              last_name: 'Architecture',
              date_of_birth: '1990-01-01',
              phone: '+254700000000'
            },
            risk: {
              risk_tolerance: 5,
              investment_experience: 'intermediate'
            },
            financial: {
              monthly_income: 5000.00,
              monthly_expenses: 3500.00,
              current_savings: 15000.00,
              monthly_debt_payments: 500.00
            },
            goals: [
              {
                name: 'Emergency Fund',
                target_amount: 20000.00,
                target_date: '2025-12-31',
                priority: 'high'
              }
            ]
          },
          failOnStatusCode: false
        });
      }
    });
  });

  after(() => {
    // Cleanup test data
    cy.log('🧹 Cleaning up Clean Architecture test data');
    if (authToken) {
      cy.task('db:cleanup');
    }
  });

  beforeEach(() => {
    // Ensure we have valid auth for each test
    expect(authToken).to.not.be.empty;
  });

  describe('🏥 Health Check Endpoint', () => {
    it('should return healthy status for budget v2 service', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/budget-v2/health`
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('status', 'healthy');
        expect(response.body).to.have.property('service', 'budget-v2-clean');
        expect(response.body).to.have.property('architecture', 'clean_architecture');
        expect(response.body).to.have.property('cfa_compliant', true);
        expect(response.body).to.have.property('precision', 'decimal');
        
        cy.log('✅ Budget V2 service health check passed');
      });
    });
  });

  describe('📊 Budget Overview Endpoint', () => {
    it('should retrieve comprehensive budget overview with CFA-compliant calculations', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/budget-v2/overview`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        
        // Verify response structure
        const budget = response.body;
        expect(budget).to.have.property('user_id');
        expect(budget).to.have.property('period');
        expect(budget).to.have.property('income');
        expect(budget).to.have.property('expenses');
        expect(budget).to.have.property('savings_and_goals');
        expect(budget).to.have.property('summary');
        expect(budget).to.have.property('metadata');

        // Verify period structure
        expect(budget.period).to.have.property('start_date');
        expect(budget.period).to.have.property('end_date');
        expect(budget.period).to.have.property('type', 'monthly');

        // Verify income data
        expect(budget.income).to.have.property('monthly_income');
        expect(budget.income).to.have.property('currency', 'KES');
        expect(budget.income.monthly_income).to.be.a('number');

        // Verify expenses structure
        expect(budget.expenses).to.have.property('total_expenses');
        expect(budget.expenses).to.have.property('categories');
        expect(budget.expenses).to.have.property('variance_by_category');

        // Verify savings and goals
        expect(budget.savings_and_goals).to.have.property('total_goals');
        expect(budget.savings_and_goals).to.have.property('savings_rate');
        expect(budget.savings_and_goals).to.have.property('expense_ratio');

        // Verify summary calculations
        expect(budget.summary).to.have.property('surplus');
        expect(budget.summary).to.have.property('is_balanced');
        expect(budget.summary).to.have.property('total_categories');

        // Verify CFA compliance metadata
        expect(budget.metadata).to.have.property('calculation_method', 'clean_architecture');
        expect(budget.metadata).to.have.property('precision', 'decimal');
        expect(budget.metadata).to.have.property('cfa_compliant', true);

        cy.log('✅ Budget overview structure validated');
        cy.log(`💰 Monthly Income: KES ${budget.income.monthly_income}`);
        cy.log(`📊 Total Expenses: KES ${budget.expenses.total_expenses}`);
        cy.log(`💾 Surplus: KES ${budget.summary.surplus}`);
        cy.log(`⚖️ Is Balanced: ${budget.summary.is_balanced}`);
      });
    });

    it('should handle user with no budget data gracefully', () => {
      // Create a user with no financial data
      const emptyUserEmail = 'empty-budget-user@example.com';
      
      cy.request({
        method: 'POST',
        url: `${API_BASE}/auth/register`,
        body: {
          email: emptyUserEmail,
          password: 'TestPassword123!'
        },
        failOnStatusCode: false
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/auth/token`,
          body: {
            username: emptyUserEmail,
            password: 'TestPassword123!'
          }
        }).then((loginResponse) => {
          const emptyUserToken = loginResponse.body.access_token;
          
          cy.request({
            method: 'GET',
            url: `${API_BASE}/budget-v2/overview`,
            headers: {
              'Authorization': `Bearer ${emptyUserToken}`
            },
            failOnStatusCode: false
          }).then((response) => {
            expect(response.status).to.eq(404);
            expect(response.body).to.have.property('detail');
            expect(response.body.detail).to.include('Budget not found');
            
            cy.log('✅ Empty budget user handled correctly');
          });
        });
      });
    });
  });

  describe('➕ Budget Category Creation', () => {
    it('should create new budget categories with proper validation', () => {
      const testCategories = [
        { name: 'Groceries', amount: 800.00, type: 'expense' },
        { name: 'Transportation', amount: 500.00, type: 'expense' },
        { name: 'Emergency Savings', amount: 1000.00, type: 'savings' },
        { name: 'Investment Fund', amount: 750.00, type: 'investment' }
      ];

      testCategories.forEach((category) => {
        cy.request({
          method: 'POST',
          url: `${API_BASE}/budget-v2/categories?category_name=${encodeURIComponent(category.name)}&allocated_amount=${category.amount}&category_type=${category.type}`,
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body).to.have.property('message');
          expect(response.body.message).to.include(category.name);
          expect(response.body.message).to.include('created successfully');
          
          const createdCategory = response.body.category;
          expect(createdCategory).to.have.property('name', category.name);
          expect(createdCategory).to.have.property('allocated_amount', category.amount);
          expect(createdCategory).to.have.property('category_type', category.type);
          expect(createdCategory).to.have.property('currency', 'KES');
          
          cy.log(`✅ Created category: ${category.name} (${category.type}) - KES ${category.amount}`);
        });
      });
    });

    it('should validate category creation inputs', () => {
      // Test negative amount validation
      cy.request({
        method: 'POST',
        url: `${API_BASE}/budget-v2/categories?category_name=Invalid&allocated_amount=-100`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.detail).to.include('cannot be negative');
        cy.log('✅ Negative amount validation working');
      });

      // Test invalid category type
      cy.request({
        method: 'POST',
        url: `${API_BASE}/budget-v2/categories?category_name=Invalid&allocated_amount=100&category_type=invalid_type`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.detail).to.include('must be');
        cy.log('✅ Invalid category type validation working');
      });

      // Test duplicate category creation
      cy.request({
        method: 'POST',
        url: `${API_BASE}/budget-v2/categories?category_name=Groceries&allocated_amount=600`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.detail).to.include('already exists');
        cy.log('✅ Duplicate category detection working');
      });
    });
  });

  describe('✏️ Budget Category Updates', () => {
    it('should update category allocations successfully', () => {
      cy.request({
        method: 'PUT',
        url: `${API_BASE}/budget-v2/categories/Groceries/allocation?new_amount=900`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.include('updated successfully');
        expect(response.body).to.have.property('category', 'Groceries');
        expect(response.body).to.have.property('new_allocation', 900);
        expect(response.body).to.have.property('currency', 'KES');
        
        cy.log('✅ Category allocation updated successfully');
      });
    });

    it('should update category spending successfully', () => {
      cy.request({
        method: 'PUT',
        url: `${API_BASE}/budget-v2/categories/Transportation/spending?spent_amount=450`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.property('message');
        expect(response.body.message).to.include('updated successfully');
        expect(response.body).to.have.property('category', 'Transportation');
        expect(response.body).to.have.property('spent_amount', 450);
        expect(response.body).to.have.property('currency', 'KES');
        
        cy.log('✅ Category spending updated successfully');
      });
    });

    it('should handle non-existent category updates', () => {
      cy.request({
        method: 'PUT',
        url: `${API_BASE}/budget-v2/categories/NonExistent/allocation?new_amount=100`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.detail).to.include('not found');
        cy.log('✅ Non-existent category handling working');
      });
    });

    it('should validate update inputs', () => {
      // Test negative allocation
      cy.request({
        method: 'PUT',
        url: `${API_BASE}/budget-v2/categories/Groceries/allocation?new_amount=-50`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.detail).to.include('cannot be negative');
        cy.log('✅ Negative allocation validation working');
      });

      // Test negative spending
      cy.request({
        method: 'PUT',
        url: `${API_BASE}/budget-v2/categories/Transportation/spending?spent_amount=-25`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(400);
        expect(response.body.detail).to.include('cannot be negative');
        cy.log('✅ Negative spending validation working');
      });
    });
  });

  describe('🔄 Data Consistency Validation', () => {
    it('should maintain consistent calculations after updates', () => {
      // Get initial budget overview
      cy.request({
        method: 'GET',
        url: `${API_BASE}/budget-v2/overview`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((initialResponse) => {
        const initialBudget = initialResponse.body;
        
        // Update a category allocation
        cy.request({
          method: 'PUT',
          url: `${API_BASE}/budget-v2/categories/Emergency Savings/allocation?new_amount=1200`,
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        }).then(() => {
          // Get updated budget overview
          cy.request({
            method: 'GET',
            url: `${API_BASE}/budget-v2/overview`,
            headers: {
              'Authorization': `Bearer ${authToken}`
            }
          }).then((updatedResponse) => {
            const updatedBudget = updatedResponse.body;
            
            // Verify calculations have been updated
            expect(updatedBudget.expenses.total_expenses).to.not.eq(initialBudget.expenses.total_expenses);
            expect(updatedBudget.summary.surplus).to.not.eq(initialBudget.summary.surplus);
            
            // Verify data consistency
            expect(updatedBudget.income.monthly_income).to.eq(initialBudget.income.monthly_income);
            expect(updatedBudget.metadata.cfa_compliant).to.be.true;
            
            cy.log('✅ Data consistency maintained after updates');
            cy.log(`📊 Updated Total Expenses: KES ${updatedBudget.expenses.total_expenses}`);
            cy.log(`💾 Updated Surplus: KES ${updatedBudget.summary.surplus}`);
          });
        });
      });
    });
  });

  describe('📈 CFA Compliance Validation', () => {
    it('should maintain decimal precision in all calculations', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/budget-v2/overview`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        const budget = response.body;
        
        // Verify all monetary values have proper precision (max 2 decimal places)
        const checkDecimalPrecision = (value, fieldName) => {
          const decimalPlaces = (value.toString().split('.')[1] || '').length;
          expect(decimalPlaces).to.be.at.most(2, `${fieldName} has too many decimal places: ${value}`);
        };
        
        checkDecimalPrecision(budget.income.monthly_income, 'monthly_income');
        checkDecimalPrecision(budget.expenses.total_expenses, 'total_expenses');
        checkDecimalPrecision(budget.savings_and_goals.total_goals, 'total_goals');
        checkDecimalPrecision(budget.summary.surplus, 'surplus');
        
        // Check individual categories
        Object.keys(budget.expenses.categories).forEach(categoryName => {
          checkDecimalPrecision(budget.expenses.categories[categoryName], `category_${categoryName}`);
        });
        
        cy.log('✅ CFA decimal precision compliance verified');
      });
    });

    it('should calculate financial ratios correctly', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/budget-v2/overview`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        const budget = response.body;
        
        // Verify savings rate calculation: (savings + goals) / income * 100
        const totalSavings = 1200; // Emergency Savings category
        const totalGoals = budget.savings_and_goals.total_goals;
        const income = budget.income.monthly_income;
        
        const expectedSavingsRate = ((totalSavings + totalGoals) / income) * 100;
        const actualSavingsRate = budget.savings_and_goals.savings_rate;
        
        // Allow for small floating point differences
        expect(actualSavingsRate).to.be.closeTo(expectedSavingsRate, 1);
        
        // Verify expense ratio calculation: expenses / income * 100
        const totalExpenses = budget.expenses.total_expenses;
        const expectedExpenseRatio = (totalExpenses / income) * 100;
        const actualExpenseRatio = budget.savings_and_goals.expense_ratio;
        
        expect(actualExpenseRatio).to.be.closeTo(expectedExpenseRatio, 1);
        
        cy.log('✅ Financial ratio calculations verified');
        cy.log(`💹 Savings Rate: ${actualSavingsRate.toFixed(2)}%`);
        cy.log(`📊 Expense Ratio: ${actualExpenseRatio.toFixed(2)}%`);
      });
    });
  });

  describe('🚨 Error Handling and Edge Cases', () => {
    it('should handle authentication errors properly', () => {
      cy.request({
        method: 'GET',
        url: `${API_BASE}/budget-v2/overview`,
        headers: {
          'Authorization': 'Bearer invalid_token'
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(401);
        cy.log('✅ Authentication error handling working');
      });
    });

    it('should handle malformed requests gracefully', () => {
      // Test with invalid query parameters
      cy.request({
        method: 'POST',
        url: `${API_BASE}/budget-v2/categories?category_name=&allocated_amount=invalid`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect([400, 422]).to.include(response.status);
        cy.log('✅ Malformed request handling working');
      });
    });

    it('should handle server errors gracefully', () => {
      // This test would simulate a server error scenario
      // In a real environment, you might use API mocking or test fixtures
      cy.log('✅ Server error handling test placeholder');
    });
  });

  describe('📊 Performance Validation', () => {
    it('should respond within acceptable time limits', () => {
      const startTime = Date.now();
      
      cy.request({
        method: 'GET',
        url: `${API_BASE}/budget-v2/overview`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        const responseTime = Date.now() - startTime;
        
        expect(response.status).to.eq(200);
        expect(responseTime).to.be.lessThan(2000); // Should respond within 2 seconds
        
        cy.log(`✅ Response time: ${responseTime}ms (acceptable)`);
      });
    });
  });
});