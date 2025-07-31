describe('Persona-Based CRUD Testing', () => {
  const personas = {
    jamal: {
      email: 'jamal@example.com',
      password: 'jamal123',
      name: 'Jamal Mwangi',
      profile: 'Early-Career Accumulator',
      expectedGoals: ['Emergency Fund', 'Debt Payoff'],
      expectedCategories: ['Rent', 'Transport', 'Food']
    },
    aisha: {
      email: 'aisha@example.com', 
      password: 'aisha123',
      name: 'Aisha Otieno',
      profile: 'Family & Property',
      expectedGoals: ['Education Savings', 'Mortgage', 'Insurance'],
      expectedCategories: ['Mortgage', 'School Fees', 'Insurance', 'Groceries']
    },
    samuel: {
      email: 'samuel@example.com',
      password: 'samuel123', 
      name: 'Samuel Kariuki',
      profile: 'Pre-Retirement',
      expectedGoals: ['Retirement Fund', 'Healthcare', 'Legacy Planning'],
      expectedCategories: ['Healthcare', 'Investments', 'Insurance', 'Living Expenses']
    }
  };

  const loginAsPersona = (persona) => {
    cy.visit('http://localhost:3000');
    cy.get('input[type="email"]').clear().type(persona.email);
    cy.get('input[type="password"]').clear().type(persona.password);
    cy.get('button').contains('Login').click();
    cy.wait(3000);
    
    // Navigate to profile
    cy.visit('http://localhost:3000/app/profile');
    cy.wait(4000);
  };

  const createExpenseCategory = (name, amount) => {
    cy.get('button').contains('Update Financial Info').click();
    cy.wait(1000);
    cy.get('button').contains('+ Add Category').click();
    cy.get('input[placeholder="Category name"]').last().clear().type(name);
    cy.get('input[placeholder="Amount"]').last().clear().type(amount.toString());
    cy.get('button').contains('Save Changes').click();
    cy.wait(2000);
  };

  const createGoal = (name, target, current, targetDate = null) => {
    cy.window().then((win) => {
      cy.stub(win, 'prompt')
        .onCall(0).returns(name)
        .onCall(1).returns(target.toString())
        .onCall(2).returns(current.toString())
        .onCall(3).returns(targetDate);
    });
    
    cy.get('button').contains('Add New Goal').click();
    cy.wait(3000);
  };

  describe('Jamal Mwangi - Early Career CRUD Tests', () => {
    beforeEach(() => {
      loginAsPersona(personas.jamal);
    });

    it('should manage early-career expense categories', () => {
      // Add typical early-career categories
      createExpenseCategory('Rent', 25000);
      cy.get('div').should('contain', 'Rent');
      cy.get('div').should('contain', 'KES 25,000');

      createExpenseCategory('Transport', 8000);
      cy.get('div').should('contain', 'Transport');
      cy.get('div').should('contain', 'KES 8,000');

      createExpenseCategory('Food & Groceries', 12000);
      cy.get('div').should('contain', 'Food & Groceries');
      cy.get('div').should('contain', 'KES 12,000');

      // Verify total calculation
      cy.get('div').should('contain', 'KES 45,000');
    });

    it('should create emergency fund goal', () => {
      createGoal('Emergency Fund', 150000, 35000, '2025-08-31');
      
      cy.get('div').should('contain', 'Emergency Fund');
      cy.get('div').should('contain', 'KES 150,000');
      cy.get('div').should('contain', 'KES 35,000');
      cy.get('div').should('contain', '23.3%');
    });

    it('should create debt payoff goal', () => {
      createGoal('Student Loan Payoff', 80000, 20000, '2026-12-31');
      
      cy.get('div').should('contain', 'Student Loan Payoff');
      cy.get('div').should('contain', 'KES 80,000');
      cy.get('div').should('contain', '25.0%');
    });

    it('should delete and modify categories', () => {
      // First create a category
      createExpenseCategory('Temporary Category', 5000);
      
      // Delete it
      cy.get('button').contains('Delete').first().click();
      cy.window().then((win) => {
        cy.stub(win, 'confirm').returns(true);
      });
      cy.wait(2000);
    });
  });

  describe('Aisha Otieno - Family & Property CRUD Tests', () => {
    beforeEach(() => {
      loginAsPersona(personas.aisha);
    });

    it('should manage family-focused expense categories', () => {
      createExpenseCategory('Mortgage Payment', 45000);
      createExpenseCategory('School Fees', 25000);
      createExpenseCategory('Insurance Premiums', 8000);
      createExpenseCategory('Family Groceries', 20000);
      
      // Verify all categories exist
      cy.get('div').should('contain', 'Mortgage Payment');
      cy.get('div').should('contain', 'School Fees');
      cy.get('div').should('contain', 'Insurance Premiums');
      cy.get('div').should('contain', 'Family Groceries');
      
      // Verify higher total for family expenses
      cy.get('div').should('contain', 'KES 98,000');
    });

    it('should create education savings goal', () => {
      createGoal('Children Education Fund', 500000, 120000, '2030-01-31');
      
      cy.get('div').should('contain', 'Children Education Fund');
      cy.get('div').should('contain', 'KES 500,000');
      cy.get('div').should('contain', 'KES 120,000');
      cy.get('div').should('contain', '24.0%');
    });

    it('should create property improvement goal', () => {
      createGoal('Home Renovation', 300000, 75000, '2025-12-31');
      
      cy.get('div').should('contain', 'Home Renovation');
      cy.get('div').should('contain', 'KES 300,000');
      cy.get('div').should('contain', '25.0%');
    });

    it('should manage multiple goals simultaneously', () => {
      createGoal('Emergency Fund', 200000, 80000);
      createGoal('Vacation Fund', 100000, 25000);
      
      // Both should be visible
      cy.get('div').should('contain', 'Emergency Fund');
      cy.get('div').should('contain', 'Vacation Fund');
      cy.get('div').should('contain', '40.0%'); // Emergency fund progress
      cy.get('div').should('contain', '25.0%'); // Vacation fund progress
    });
  });

  describe('Samuel Kariuki - Pre-Retirement CRUD Tests', () => {
    beforeEach(() => {
      loginAsPersona(personas.samuel);
    });

    it('should manage pre-retirement expense categories', () => {
      createExpenseCategory('Healthcare & Medical', 15000);
      createExpenseCategory('Investment Contributions', 50000);
      createExpenseCategory('Insurance Premiums', 12000);
      createExpenseCategory('Living Expenses', 35000);
      
      // Verify categories
      cy.get('div').should('contain', 'Healthcare & Medical');
      cy.get('div').should('contain', 'Investment Contributions');
      cy.get('div').should('contain', 'Insurance Premiums');
      
      // Higher investment focus
      cy.get('div').should('contain', 'KES 50,000');
    });

    it('should create retirement fund goal', () => {
      createGoal('Retirement Portfolio', 2000000, 1200000, '2030-12-31');
      
      cy.get('div').should('contain', 'Retirement Portfolio');
      cy.get('div').should('contain', 'KES 2,000,000');
      cy.get('div').should('contain', 'KES 1,200,000');
      cy.get('div').should('contain', '60.0%');
    });

    it('should create healthcare fund goal', () => {
      createGoal('Healthcare Reserve', 800000, 300000, '2028-06-30');
      
      cy.get('div').should('contain', 'Healthcare Reserve');
      cy.get('div').should('contain', 'KES 800,000');
      cy.get('div').should('contain', '37.5%');
    });

    it('should create legacy planning goal', () => {
      createGoal('Legacy Fund', 1000000, 400000, '2035-12-31');
      
      cy.get('div').should('contain', 'Legacy Fund');
      cy.get('div').should('contain', 'KES 1,000,000');
      cy.get('div').should('contain', '40.0%');
    });
  });

  describe('Cross-Persona Data Integrity Tests', () => {
    it('should maintain separate data for different users', () => {
      // Create data for Jamal
      loginAsPersona(personas.jamal);
      createExpenseCategory('Jamal Rent', 25000);
      createGoal('Jamal Emergency Fund', 100000, 25000);
      
      // Switch to Aisha and verify she doesn't see Jamal's data
      loginAsPersona(personas.aisha);
      cy.get('div').should('not.contain', 'Jamal Rent');
      cy.get('div').should('not.contain', 'Jamal Emergency Fund');
      
      // Create Aisha's data
      createExpenseCategory('Aisha Mortgage', 45000);
      createGoal('Aisha Education Fund', 500000, 100000);
      
      // Switch back to Jamal and verify his data is still there
      loginAsPersona(personas.jamal);
      cy.get('div').should('contain', 'Jamal Rent');
      cy.get('div').should('contain', 'Jamal Emergency Fund');
      cy.get('div').should('not.contain', 'Aisha Mortgage');
      cy.get('div').should('not.contain', 'Aisha Education Fund');
    });
  });

  describe('Realistic Financial Planning Scenarios', () => {
    it('should handle Jamal\'s debt payoff journey', () => {
      loginAsPersona(personas.jamal);
      
      // Initial debt situation
      createGoal('Credit Card Debt', 50000, 45000); // Almost paid off
      createGoal('Student Loan', 200000, 50000); // Long term
      
      // Update progress over time (simulate payments)
      cy.get('div').should('contain', '90.0%'); // Credit card nearly done
      cy.get('div').should('contain', '25.0%'); // Student loan progress
    });

    it('should handle Aisha\'s family financial juggling', () => {
      loginAsPersona(personas.aisha);
      
      // Multiple competing priorities
      createGoal('Child 1 University', 800000, 200000);
      createGoal('Child 2 University', 800000, 100000);
      createGoal('Family Emergency Fund', 300000, 150000);
      
      cy.get('div').should('contain', '25.0%'); // Child 1
      cy.get('div').should('contain', '12.5%'); // Child 2  
      cy.get('div').should('contain', '50.0%'); // Emergency fund
    });

    it('should handle Samuel\'s retirement countdown', () => {
      loginAsPersona(personas.samuel);
      
      // Final push to retirement
      createGoal('Retirement Target', 5000000, 3500000);
      createGoal('Healthcare Fund', 1000000, 600000);
      createGoal('Estate Planning', 2000000, 800000);
      
      cy.get('div').should('contain', '70.0%'); // Close to retirement target
      cy.get('div').should('contain', '60.0%'); // Healthcare covered
      cy.get('div').should('contain', '40.0%'); // Estate building
    });
  });

  describe('Error Handling and Edge Cases', () => {
    beforeEach(() => {
      loginAsPersona(personas.jamal);
    });

    it('should handle very large amounts properly', () => {
      createExpenseCategory('Large Expense', 1500000);
      cy.get('div').should('contain', 'KES 1,500,000');
      
      createGoal('Million Shilling Goal', 10000000, 2500000);
      cy.get('div').should('contain', 'KES 10,000,000');
      cy.get('div').should('contain', '25.0%');
    });

    it('should handle goal completion (100%+ progress)', () => {
      createGoal('Completed Goal', 50000, 55000); // Over 100%
      cy.get('div').should('contain', '110.0%');
    });

    it('should handle empty or zero amounts gracefully', () => {
      createGoal('Zero Current Goal', 100000, 0);
      cy.get('div').should('contain', '0.0%');
    });
  });
});