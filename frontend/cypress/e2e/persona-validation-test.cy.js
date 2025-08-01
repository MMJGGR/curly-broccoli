/**
 * Persona Validation Test - Existing Users
 * 
 * Validates existing personas against PERSONAS_SOURCE_OF_TRUTH.md
 * Tests profile data consistency and available features
 * 
 * Purpose: Ensure existing personas match expected data patterns
 */

describe('👤 Persona Validation - Existing Users', () => {
  
  // Expected data from PERSONAS_SOURCE_OF_TRUTH.md
  const PERSONAS_EXPECTED = {
    jamal: {
      email: 'jamal@example.com',
      password: 'jamal12345',
      expectedProfile: {
        first_name: 'Jamal',
        last_name: 'Mwangi',
        annual_income: 636000,
        employment_status: 'Employed',
        dependents: 0,
        kra_pin: 'A123456789B',
        nationalId: '34567890',
        phone: null, // Actually missing in API
        investment_experience: 'Beginner'
      },
      expectedRisk: {
        risk_score: 60,
        risk_level: 4
      },
      expectedGoalsCount: 0, // Currently empty
      expectedExpenseCategoriesCount: 0, // Currently empty
      hasIncompleteProfile: true // Some fields are missing
    },
    
    aisha: {
      email: 'aisha@example.com',
      password: 'aisha12345',
      expectedProfile: {
        first_name: 'Aisha',
        last_name: 'Otieno',
        annual_income: 1448000,
        employment_status: 'Employed',
        dependents: 2,
        kra_pin: 'A987654321C',
        marital_status: 'Married',
        education: 'Masters',
        occupation: 'Banking Manager'
      },
      expectedFinancials: {
        monthly_income: 120667,
        debt_total: 2705000,
        emergency_fund: 180000,
        investment_experience: 'Intermediate'
      },
      expectedGoalsCount: 0,
      expectedExpenseCategoriesCount: 0
    },
    
    samuel: {
      email: 'samuel@example.com',
      password: 'samuel12345',
      expectedProfile: {
        first_name: 'Samuel',
        last_name: 'Kariuki',
        annual_income: 1920000,
        employment_status: 'Executive',
        dependents: 0,
        kra_pin: 'A456789123D',
        marital_status: 'Married',
        education: 'Masters',
        occupation: 'CEO'
      },
      expectedFinancials: {
        monthly_income: 160000,
        debt_total: 1800000,
        emergency_fund: 450000,
        investment_experience: 'Advanced'
      },
      expectedGoalsCount: 0,
      expectedExpenseCategoriesCount: 0
    },
    
    emily: {
      email: 'emily@advisor.com',
      password: 'emily12345',
      expectedProfile: {
        first_name: 'Emily',
        last_name: 'Njeri',
        annual_income: 2820000,
        employment_status: 'Self-employed',
        dependents: 1,
        firm_name: 'Njeri Financial Advisors',
        license_number: 'CFP2024001',
        professional_email: 'emily@advisor.com',
        service_model: 'fee-only',
        target_client_type: 'high-net-worth',
        minimum_aum: '2000000'
      },
      expectedFinancials: {
        monthly_income: 235000,
        debt_total: 2200000,
        emergency_fund: 600000,
        investment_experience: 'Expert'
      },
      expectedGoalsCount: 0,
      expectedExpenseCategoriesCount: 0,
      isAdvisor: true
    }
  };

  beforeEach(() => {
    cy.visit('/');
  });

  // Test each existing persona
  Object.entries(PERSONAS_EXPECTED).forEach(([key, persona]) => {
    describe(`${persona.expectedProfile.first_name} ${persona.expectedProfile.last_name} Validation`, () => {
      
      it(`should validate ${persona.expectedProfile.first_name}'s profile data matches PERSONAS_SOURCE_OF_TRUTH.md`, () => {
        cy.log(`🔍 Validating ${persona.expectedProfile.first_name} ${persona.expectedProfile.last_name}`);
        
        // Login
        cy.visit('/auth');
        cy.get('input[id="email"]').type(persona.email);
        cy.get('input[id="password"]').type(persona.password);
        cy.get('button[type="submit"]').click();
        
        // Navigate to profile using bottom navigation
        if (persona.isAdvisor) {
          cy.url().should('include', '/advisor');
        } else {
          cy.url().should('include', '/app/dashboard');
        }
        
        // Click Profile tab in bottom navigation
        cy.get('button').contains('Profile').click();
        cy.url().should('include', '/profile');
        
        // Validate profile data availability
        cy.get('h1').should('contain', 'Profile');
        
        // Check that profile sections exist
        cy.get('body').should('contain', 'Personal Information');
        cy.get('body').should('contain', 'Financial Information');
        
        // Validate specific profile fields are displayed (not necessarily editable)
        if (persona.expectedProfile.first_name) {
          cy.get('body').should('contain', persona.expectedProfile.first_name);
        }
        if (persona.expectedProfile.last_name) {
          cy.get('body').should('contain', persona.expectedProfile.last_name);
        }
        if (persona.expectedProfile.annual_income) {
          cy.get('body').should('contain', persona.expectedProfile.annual_income.toLocaleString());
        }
        
        // For advisors, check advisor-specific fields
        if (persona.isAdvisor) {
          if (persona.expectedProfile.firm_name) {
            cy.get('body').should('contain', persona.expectedProfile.firm_name);
          }
          if (persona.expectedProfile.license_number) {
            cy.get('body').should('contain', persona.expectedProfile.license_number);
          }
        }
        
        cy.log(`✅ ${persona.expectedProfile.first_name} profile data validation completed`);
      });
      
      it(`should validate ${persona.expectedProfile.first_name}'s goals and expenses functionality`, () => {
        // Login
        cy.visit('/auth');
        cy.get('input[id="email"]').type(persona.email);
        cy.get('input[id="password"]').type(persona.password);
        cy.get('button[type="submit"]').click();
        
        // Navigate to profile
        cy.get('button').contains('Profile').click();
        cy.url().should('include', '/profile');
        
        // Check goals section exists
        cy.get('body').should('contain', 'Goals');
        
        if (persona.expectedGoalsCount === 0) {
          // Should show empty state message for goals
          cy.get('body').should('contain', 'No goals set');
        }
        
        // Check expense categories section exists
        cy.get('body').should('contain', 'Expense Categories');
        
        if (persona.expectedExpenseCategoriesCount === 0) {
          // Should show empty state message for expenses
          cy.get('body').should('contain', 'No expense categories set');
        }
        
        // Test that goal functionality exists (modal trigger button)
        cy.get('button').contains('Add New Goal').should('be.visible');
        
        cy.log(`✅ ${persona.expectedProfile.first_name} goals and expenses functionality validated`);
      });
      
      it(`should allow ${persona.expectedProfile.first_name} to add a new goal`, () => {
        // Login
        cy.visit('/auth');
        cy.get('input[id="email"]').type(persona.email);
        cy.get('input[id="password"]').type(persona.password);
        cy.get('button[type="submit"]').click();
        
        // Navigate to profile
        cy.get('button').contains('Profile').click();
        cy.url().should('include', '/profile');
        
        // Add a test goal
        cy.get('button').contains('Add New Goal').click();
        
        // Fill goal form in modal
        cy.get('input[placeholder*="Emergency Fund"]').type(`${persona.expectedProfile.first_name} Test Goal`);
        cy.get('input[placeholder="100000"]').type('50000');
        cy.get('input[placeholder="25000"]').type('10000');  
        cy.get('input[type="date"]').type('2025-12-31');
        
        cy.get('button').contains('Create Goal').click();
        
        // Verify goal was added
        cy.get('body').should('contain', `${persona.expectedProfile.first_name} Test Goal`);
        
        cy.log(`✅ ${persona.expectedProfile.first_name} can add goals successfully`);
      });
      
      it(`should test ${persona.expectedProfile.first_name} retake risk questionnaire button`, () => {
        // Login
        cy.visit('/auth');
        cy.get('input[id="email"]').type(persona.email);
        cy.get('input[id="password"]').type(persona.password);
        cy.get('button[type="submit"]').click();
        
        // Navigate to profile
        cy.get('button').contains('Profile').click();
        cy.url().should('include', '/profile');
        
        // Test risk questionnaire retake button
        cy.get('button').contains('Retake Risk Assessment').should('be.visible');
        cy.get('button').contains('Retake Risk Assessment').click();
        
        // Should navigate to risk questionnaire
        cy.url().should('include', '/retake-risk-assessment');
        cy.get('body').should('contain', 'Risk Assessment Questionnaire');
        
        cy.log(`✅ ${persona.expectedProfile.first_name} risk questionnaire navigation working`);
      });
    });
  });
  
  // Cross-persona data isolation test
  it('should maintain data isolation between personas', () => {
    // Add goal for Jamal
    cy.visit('/auth');
    cy.get('input[id="email"]').type(PERSONAS_EXPECTED.jamal.email);
    cy.get('input[id="password"]').type(PERSONAS_EXPECTED.jamal.password);
    cy.get('button[type="submit"]').click();
    
    // Navigate to profile
    cy.get('button').contains('Profile').click();
    cy.get('button').contains('Add New Goal').click();
    cy.get('input[placeholder*="Emergency Fund"]').type('Jamal Isolation Test Goal');
    cy.get('input[placeholder="100000"]').type('25000');
    cy.get('input[placeholder="25000"]').type('5000');
    cy.get('input[type="date"]').type('2025-06-30');
    cy.get('button').contains('Create Goal').click();
    
    // Verify Jamal can see his goal
    cy.get('body').should('contain', 'Jamal Isolation Test Goal');
    
    // Logout by visiting auth again
    cy.visit('/auth');
    cy.get('input[id="email"]').type(PERSONAS_EXPECTED.aisha.email);
    cy.get('input[id="password"]').type(PERSONAS_EXPECTED.aisha.password);
    cy.get('button[type="submit"]').click();
    
    // Navigate to Aisha's profile
    cy.get('button').contains('Profile').click();
    
    // Verify Aisha cannot see Jamal's goal
    cy.get('body').should('not.contain', 'Jamal Isolation Test Goal');
    
    cy.log('✅ Data isolation between personas verified');
  });
  
  // Profile completeness test for Jamal (our main test persona)
  it('should validate Jamal profile shows his actual data completeness', () => {
    cy.visit('/auth');
    cy.get('input[id="email"]').type(PERSONAS_EXPECTED.jamal.email);
    cy.get('input[id="password"]').type(PERSONAS_EXPECTED.jamal.password);
    cy.get('button[type="submit"]').click();
    
    // Navigate to profile
    cy.get('button').contains('Profile').click();
    
    // Verify Jamal's actual profile data
    cy.get('body').should('contain', 'Jamal');
    cy.get('body').should('contain', 'Mwangi');
    cy.get('body').should('contain', '636,000'); // Annual income
    cy.get('body').should('contain', 'Risk Score'); // Risk assessment completed
    cy.get('body').should('contain', 'No goals set'); // No goals currently
    cy.get('body').should('contain', 'No expense categories set'); // No expenses currently
    
    cy.log('✅ Profile completeness validation for Jamal completed');
  });
});