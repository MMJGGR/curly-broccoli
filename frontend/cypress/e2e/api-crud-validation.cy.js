describe('API CRUD Validation Tests', () => {
  let authToken;
  
  before(() => {
    // Get auth token for API calls
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/login',
      form: true,
      body: {
        username: 'jamal@example.com',
        password: 'jamal123'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      authToken = response.body.access_token;
      cy.log('Auth token obtained');
    });
  });

  describe('Goals API CRUD Operations', () => {
    let createdGoalId;

    it('should create a goal via API', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/goals/',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'API Test Goal',
          target: '100000',
          current: '25000',
          progress: 25.0,
          target_date: '2025-12-31'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.name).to.eq('API Test Goal');
        expect(response.body.target).to.eq('100000');
        expect(response.body.current).to.eq('25000');
        expect(response.body.progress).to.eq(25.0);
        
        createdGoalId = response.body.id;
        cy.log(`Created goal with ID: ${createdGoalId}`);
      });
    });

    it('should list goals via API', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/goals/',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        // Should contain our created goal
        const createdGoal = response.body.find(goal => goal.id === createdGoalId);
        expect(createdGoal).to.exist;
        expect(createdGoal.name).to.eq('API Test Goal');
      });
    });

    it('should update a goal via API', () => {
      cy.request({
        method: 'PUT',
        url: `http://localhost:8000/goals/${createdGoalId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'Updated API Test Goal',
          target: '150000',
          current: '50000',
          progress: 33.33
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq('Updated API Test Goal');
        expect(response.body.target).to.eq('150000');
        expect(response.body.current).to.eq('50000');
      });
    });

    it('should delete a goal via API', () => {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:8000/goals/${createdGoalId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(204);
      });

      // Verify goal is deleted
      cy.request({
        method: 'GET',
        url: `http://localhost:8000/goals/${createdGoalId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        },
        failOnStatusCode: false
      }).then((response) => {
        expect(response.status).to.eq(404);
      });
    });
  });

  describe('Expense Categories API CRUD Operations', () => {
    let createdCategoryId;

    it('should create expense category via API', () => {
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/expense-categories/',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'API Test Category',
          budgeted_amount: 5000.0
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body).to.have.property('id');
        expect(response.body.name).to.eq('API Test Category');
        expect(response.body.budgeted_amount).to.eq(5000.0);
        
        createdCategoryId = response.body.id;
      });
    });

    it('should list expense categories via API', () => {
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/expense-categories/',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
        
        const createdCategory = response.body.find(cat => cat.id === createdCategoryId);
        expect(createdCategory).to.exist;
        expect(createdCategory.name).to.eq('API Test Category');
      });
    });

    it('should update expense category via API', () => {
      cy.request({
        method: 'PUT',
        url: `http://localhost:8000/expense-categories/${createdCategoryId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'Updated API Test Category',
          budgeted_amount: 7500.0
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq('Updated API Test Category');
        expect(response.body.budgeted_amount).to.eq(7500.0);
      });
    });

    it('should delete expense category via API', () => {
      cy.request({
        method: 'DELETE',
        url: `http://localhost:8000/expense-categories/${createdCategoryId}`,
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      }).then((response) => {
        expect(response.status).to.eq(204);
      });
    });
  });

  describe('Frontend Integration Test', () => {
    it('should verify frontend can access goals after API creation', () => {
      // Create goal via API
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/goals/',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'Frontend Integration Goal',
          target: '200000',
          current: '75000',
          progress: 37.5,
          target_date: '2025-09-30'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
      });

      // Now login via frontend and check if goal appears
      cy.visit('http://localhost:3000');
      cy.get('input[type="email"]').type('jamal@example.com');
      cy.get('input[type="password"]').type('jamal123');
      cy.get('button').contains('Login').click();
      cy.wait(3000);
      
      cy.visit('http://localhost:3000/app/profile');
      cy.wait(5000);
      
      // Look for the goal we created
      cy.get('body').should('contain', 'Frontend Integration Goal');
      cy.get('body').should('contain', 'KES 200,000');
      cy.get('body').should('contain', 'KES 75,000');
      cy.get('body').should('contain', '37.5%');
    });
  });

  describe('Persona-Specific CRUD Tests', () => {
    const personas = [
      { email: 'jamal@example.com', password: 'jamal123', name: 'Jamal' },
      { email: 'aisha@example.com', password: 'aisha123', name: 'Aisha' },
      { email: 'samuel@example.com', password: 'samuel123', name: 'Samuel' }
    ];

    personas.forEach((persona) => {
      it(`should perform CRUD operations for ${persona.name}`, () => {
        // Get auth token for this persona
        cy.request({
          method: 'POST',
          url: 'http://localhost:8000/auth/login',
          form: true,
          body: {
            username: persona.email,
            password: persona.password
          }
        }).then((loginResponse) => {
          const personaToken = loginResponse.body.access_token;
          
          // Create goal for this persona
          cy.request({
            method: 'POST',
            url: 'http://localhost:8000/goals/',
            headers: {
              'Authorization': `Bearer ${personaToken}`,
              'Content-Type': 'application/json'
            },
            body: {
              name: `${persona.name} Personal Goal`,
              target: '500000',
              current: '125000',
              progress: 25.0,
              target_date: '2025-12-31'
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.name).to.eq(`${persona.name} Personal Goal`);
          });

          // Create expense category for this persona
          cy.request({
            method: 'POST',
            url: 'http://localhost:8000/expense-categories/',
            headers: {
              'Authorization': `Bearer ${personaToken}`,
              'Content-Type': 'application/json'
            },
            body: {
              name: `${persona.name} Category`,
              budgeted_amount: 10000.0
            }
          }).then((response) => {
            expect(response.status).to.eq(201);
            expect(response.body.name).to.eq(`${persona.name} Category`);
          });
        });
      });
    });

    it('should verify data isolation between personas', () => {
      // Check that Jamal doesn't see Aisha's data
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/auth/login',
        form: true,
        body: {
          username: 'jamal@example.com',
          password: 'jamal123'
        }
      }).then((response) => {
        const jamalToken = response.body.access_token;
        
        cy.request({
          method: 'GET',
          url: 'http://localhost:8000/goals/',
          headers: {
            'Authorization': `Bearer ${jamalToken}`
          }
        }).then((response) => {
          const jamalGoals = response.body;
          
          // Should not contain Aisha's goals
          const aishaGoal = jamalGoals.find(goal => goal.name.includes('Aisha'));
          expect(aishaGoal).to.be.undefined;
          
          // Should contain Jamal's goals
          const jamalGoal = jamalGoals.find(goal => goal.name.includes('Jamal'));
          expect(jamalGoal).to.exist;
        });
      });
    });
  });
});