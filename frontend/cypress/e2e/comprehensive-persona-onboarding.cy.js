/**
 * Comprehensive Persona Onboarding & Profile Management Test Suite
 * 
 * Tests all personas with complete data profiles for:
 * - User registration and authentication
 * - Complete onboarding flows
 * - Profile CRUD operations
 * - Risk assessment
 * - Goal setting
 * - Data validation and persistence
 * 
 * Based on: PERSONAS_SOURCE_OF_TRUTH.md
 */

describe('🧑‍💼 Comprehensive Persona Testing Suite', () => {
  // Test data from PERSONAS_SOURCE_OF_TRUTH.md
  const PERSONAS = {
    jamal: {
      // Early-Career Accumulator (Age 27)
      email: 'jamal@example.com',
      password: 'jamal12345',
      userType: 'user',
      profile: {
        firstName: 'Jamal',
        lastName: 'Mwangi',
        dateOfBirth: '1997-06-10',
        annualIncome: 636000,
        employmentStatus: 'Employed',
        dependents: 0,
        kraPin: 'A123456789B',
        nationalId: '34567890',
        phoneNumber: '+254712345678',
        address: 'Kileleshwa, Nairobi',
        maritalStatus: 'Single',
        education: 'Bachelor',
        occupation: 'Software Developer'
      },
      accounts: [
        { name: 'Equity Bank Checking', type: 'checking', balance: 45000 },
        { name: 'KCB Savings', type: 'savings', balance: 25000 },
        { name: 'M-Pesa', type: 'mobile_money', balance: 8000 }
      ],
      goals: [
        { name: 'Emergency Fund', targetAmount: 120000, currentAmount: 25000, targetDate: '2026-02-01' },
        { name: 'Student Loan Payoff', targetAmount: 180000, currentAmount: 0, targetDate: '2027-08-01' },
        { name: 'First Investment', targetAmount: 50000, currentAmount: 0, targetDate: '2025-02-01' }
      ],
      expenseCategories: [
        { name: 'Rent', budgetedAmount: 18000 },
        { name: 'Food & Groceries', budgetedAmount: 8000 },
        { name: 'Transportation', budgetedAmount: 6000 },
        { name: 'Entertainment', budgetedAmount: 2000 },
        { name: 'Student Loan Payment', budgetedAmount: 4500 }
      ],
      riskTolerance: 'moderate',
      expectedRiskScore: 42,
      expectedRiskLevel: 3
    },
    
    aisha: {
      // Mid-Career Parent (Age 37)
      email: 'aisha@example.com', 
      password: 'aisha12345',
      userType: 'user',
      profile: {
        firstName: 'Aisha',
        lastName: 'Otieno',
        dateOfBirth: '1987-03-15',
        annualIncome: 1448000,
        employmentStatus: 'Employed',
        dependents: 2,
        kraPin: 'A987654321C',
        nationalId: '23456789',
        phoneNumber: '+254787654321',
        address: 'Kisumu',
        maritalStatus: 'Married',
        education: 'Masters',
        occupation: 'Banking Manager'
      },
      accounts: [
        { name: 'Cooperative Bank Checking', type: 'checking', balance: 125000 },
        { name: 'Family Bank Savings', type: 'savings', balance: 180000 },
        { name: 'Children Education Fund', type: 'education', balance: 350000 },
        { name: 'SACCO Shares', type: 'investment', balance: 240000 }
      ],
      goals: [
        { name: 'Children University Fund', targetAmount: 4000000, currentAmount: 350000, targetDate: '2030-01-01' },
        { name: 'Mortgage Payoff', targetAmount: 2400000, currentAmount: 0, targetDate: '2034-01-01' },
        { name: 'Retirement Fund', targetAmount: 10000000, currentAmount: 240000, targetDate: '2049-01-01' }
      ],
      expenseCategories: [
        { name: 'Mortgage Payment', budgetedAmount: 28000 },
        { name: 'School Fees', budgetedAmount: 24000 },
        { name: 'Food & Groceries', budgetedAmount: 15000 },
        { name: 'Car Loan Payment', budgetedAmount: 8500 },
        { name: 'Insurance Premiums', budgetedAmount: 8500 },
        { name: 'Utilities', budgetedAmount: 6200 }
      ],
      riskTolerance: 'conservative',
      expectedRiskScore: 28,
      expectedRiskLevel: 2
    },
    
    samuel: {
      // Pre-Retirement Executive (Age 54)
      email: 'samuel@example.com',
      password: 'samuel12345', 
      userType: 'user',
      profile: {
        firstName: 'Samuel',
        lastName: 'Kariuki',
        dateOfBirth: '1970-08-22',
        annualIncome: 1920000,
        employmentStatus: 'Executive',
        dependents: 0,
        kraPin: 'A456789123D',
        nationalId: '12345678',
        phoneNumber: '+254722333444',
        address: 'Nairobi',
        maritalStatus: 'Married',
        education: 'Masters',
        occupation: 'CEO'
      },
      accounts: [
        { name: 'Standard Chartered Premium', type: 'checking', balance: 450000 },
        { name: 'Fixed Deposits', type: 'fixed_deposit', balance: 800000 },
        { name: 'NSE Stocks', type: 'investment', balance: 2400000 },
        { name: 'Government Securities', type: 'bonds', balance: 1800000 },
        { name: 'Pension Fund', type: 'retirement', balance: 3200000 }
      ],
      goals: [
        { name: 'Retirement Fund', targetAmount: 20000000, currentAmount: 3200000, targetDate: '2035-08-22' },
        { name: 'Debt Freedom', targetAmount: 1800000, currentAmount: 0, targetDate: '2029-08-22' },
        { name: 'Legacy Planning', targetAmount: 5000000, currentAmount: 2400000, targetDate: '2035-08-22' }
      ],
      expenseCategories: [
        { name: 'Mortgage (Rental Property)', budgetedAmount: 12000 },
        { name: 'Insurance Premiums', budgetedAmount: 15000 },
        { name: 'Food & Entertainment', budgetedAmount: 25000 },
        { name: 'Transportation', budgetedAmount: 12000 },
        { name: 'Property Management', budgetedAmount: 8000 },
        { name: 'Club Memberships', budgetedAmount: 8000 }
      ],
      riskTolerance: 'moderate_conservative',
      expectedRiskScore: 35,
      expectedRiskLevel: 2
    },
    
    emily: {
      // Financial Advisor (Age 42)
      email: 'emily@advisor.com',
      password: 'emily12345',
      userType: 'advisor',
      profile: {
        firstName: 'Emily',
        lastName: 'Njeri',
        dateOfBirth: '1982-11-28',
        annualIncome: 2820000,
        employmentStatus: 'Self-employed',
        dependents: 1,
        kraPin: 'A789123456E',
        nationalId: '45678901',
        phoneNumber: '+254733444555',
        address: 'Nairobi',
        maritalStatus: 'Divorced',
        education: 'PhD',
        occupation: 'Financial Advisor'
      },
      advisorProfile: {
        firmName: 'Njeri Financial Advisors',
        licenseNumber: 'CFP2024001',
        professionalEmail: 'emily@advisor.com',
        serviceModel: 'fee-only',
        targetClientType: 'high-net-worth',
        minimumAum: '2000000',
        yearsExperience: 15,
        specializations: ['retirement-planning', 'investment-management', 'tax-optimization']
      },
      goals: [
        { name: 'Practice Growth', targetAmount: 450000000, currentAmount: 450000000, targetDate: '2027-11-28' },
        { name: 'Technology Investment', targetAmount: 500000, currentAmount: 0, targetDate: '2025-11-28' },
        { name: 'Team Expansion', targetAmount: 2400000, currentAmount: 0, targetDate: '2026-11-28' }
      ],
      expenseCategories: [
        { name: 'Business Mortgage', budgetedAmount: 18000 },
        { name: 'Office Expenses', budgetedAmount: 12000 },
        { name: 'Marketing & Development', budgetedAmount: 15000 },
        { name: 'Professional Insurance', budgetedAmount: 8000 },
        { name: 'Technology & Software', budgetedAmount: 6000 },
        { name: 'Personal Living Expenses', budgetedAmount: 25000 }
      ],
      riskTolerance: 'moderate_aggressive',
      expectedRiskScore: 55,
      expectedRiskLevel: 4
    }
  };

  beforeEach(() => {
    cy.visit('/');
  });

  // Test each persona's complete onboarding flow
  Object.entries(PERSONAS).forEach(([key, persona]) => {
    describe(`👤 ${persona.profile.firstName} ${persona.profile.lastName} - Complete Flow`, () => {
      
      it(`should complete registration and onboarding for ${persona.profile.firstName}`, () => {
        cy.log(`🧪 Testing ${persona.profile.firstName} ${persona.profile.lastName} (${persona.userType})`);
        
        // Step 1: Navigate to registration
        cy.get('button').contains('Get Started').click();
        cy.get('button').contains('Sign Up').click();
        
        // Step 2: Register user
        cy.get('input[id="email"]').type(persona.email);
        cy.get('input[id="password"]').type(persona.password);
        cy.get('input[id="confirmPassword"]').type(persona.password);
        
        // Select user type
        if (persona.userType === 'advisor') {
          cy.get('input[value="advisor"]').check();
        } else {
          cy.get('input[value="user"]').check();
        }
        
        cy.get('button[type="submit"]').click();
        
        // Step 3: Complete profile onboarding
        cy.url().should('include', '/onboarding', { timeout: 10000 });
        
        // Fill personal details
        cy.get('input[name="firstName"]').type(persona.profile.firstName);
        cy.get('input[name="lastName"]').type(persona.profile.lastName);
        cy.get('input[name="dateOfBirth"]').type(persona.profile.dateOfBirth);
        cy.get('input[name="phoneNumber"]').type(persona.profile.phoneNumber);
        cy.get('input[name="address"]').type(persona.profile.address);
        
        // Fill financial details
        cy.get('input[name="annualIncome"]').type(persona.profile.annualIncome.toString());
        cy.get('select[name="employmentStatus"]').select(persona.profile.employmentStatus);
        cy.get('input[name="dependents"]').type(persona.profile.dependents.toString());
        cy.get('input[name="kraPin"]').type(persona.profile.kraPin);
        cy.get('input[name="nationalId"]').type(persona.profile.nationalId);
        
        // Select demographic details
        cy.get('select[name="maritalStatus"]').select(persona.profile.maritalStatus);
        cy.get('select[name="education"]').select(persona.profile.education);
        cy.get('input[name="occupation"]').type(persona.profile.occupation);
        
        // Step 4: Advisor-specific fields
        if (persona.userType === 'advisor' && persona.advisorProfile) {
          cy.get('input[name="firmName"]').type(persona.advisorProfile.firmName);
          cy.get('input[name="licenseNumber"]').type(persona.advisorProfile.licenseNumber);
          cy.get('input[name="professionalEmail"]').type(persona.advisorProfile.professionalEmail);
          cy.get('select[name="serviceModel"]').select(persona.advisorProfile.serviceModel);
          cy.get('select[name="targetClientType"]').select(persona.advisorProfile.targetClientType);
          cy.get('input[name="minimumAum"]').type(persona.advisorProfile.minimumAum);
        }
        
        // Step 5: Complete risk questionnaire
        cy.get('button').contains('Continue').click();
        cy.url().should('include', '/risk-questionnaire');
        
        // Answer risk questions based on persona risk tolerance
        const riskAnswers = getRiskAnswers(persona.riskTolerance);
        riskAnswers.forEach((answer, index) => {
          cy.get(`input[name="q${index + 1}"][value="${answer}"]`).check();
        });
        
        cy.get('button[type="submit"]').click();
        
        // Step 6: Verify risk calculation
        cy.get('[data-testid="risk-score"]').should('contain', persona.expectedRiskScore);
        cy.get('[data-testid="risk-level"]').should('contain', persona.expectedRiskLevel);
        
        // Step 7: Set financial goals
        cy.get('button').contains('Set Goals').click();
        
        persona.goals.forEach((goal, index) => {
          if (index > 0) {
            cy.get('button').contains('Add Goal').click();
          }
          cy.get(`input[name="goalName${index}"]`).type(goal.name);
          cy.get(`input[name="targetAmount${index}"]`).type(goal.targetAmount.toString());
          cy.get(`input[name="currentAmount${index}"]`).type(goal.currentAmount.toString());
          cy.get(`input[name="targetDate${index}"]`).type(goal.targetDate);
        });
        
        cy.get('button[type="submit"]').click();
        
        // Step 8: Add accounts
        cy.get('button').contains('Add Accounts').click();
        
        persona.accounts.forEach((account, index) => {
          if (index > 0) {
            cy.get('button').contains('Add Account').click();
          }
          cy.get(`input[name="accountName${index}"]`).type(account.name);
          cy.get(`select[name="accountType${index}"]`).select(account.type);
          cy.get(`input[name="balance${index}"]`).type(account.balance.toString());
        });
        
        cy.get('button[type="submit"]').click();
        
        // Step 9: Add expense categories
        cy.get('button').contains('Manage Expenses').click();
        
        persona.expenseCategories.forEach((category, index) => {
          if (index > 0) {
            cy.get('button').contains('Add Category').click();
          }
          cy.get(`input[name="categoryName${index}"]`).type(category.name);
          cy.get(`input[name="budgetedAmount${index}"]`).type(category.budgetedAmount.toString());
        });
        
        cy.get('button[type="submit"]').click();
        
        // Step 10: Verify goals and expense categories are saved
        cy.get('[data-testid="goals-section"]').should('be.visible');
        persona.goals.forEach((goal) => {
          cy.get('[data-testid="goals-list"]').should('contain', goal.name);
        });
        
        cy.get('[data-testid="expenses-section"]').should('be.visible');
        persona.expenseCategories.forEach((category) => {
          cy.get('[data-testid="expenses-list"]').should('contain', category.name);
        });
        
        // Step 11: Verify completion
        if (persona.userType === 'advisor') {
          cy.url().should('include', '/advisor/dashboard');
          cy.get('h1').should('contain', `Welcome, ${persona.profile.firstName}`);
        } else {
          cy.url().should('include', '/dashboard');
          cy.get('h1').should('contain', `Hello, ${persona.profile.firstName}`);
        }
        
        cy.log(`✅ ${persona.profile.firstName} ${persona.profile.lastName} onboarding completed successfully`);
      });
      
      it(`should allow ${persona.profile.firstName} to update their profile`, () => {
        // Login first
        cy.visit('/auth');
        cy.get('input[id="email"]').type(persona.email);
        cy.get('input[id="password"]').type(persona.password);
        cy.get('button[type="submit"]').click();
        
        // Navigate to profile
        cy.get('[data-testid="profile-link"]').click();
        cy.url().should('include', '/profile');
        
        // Test profile updates
        const updatedIncome = persona.profile.annualIncome + 50000;
        cy.get('input[name="annualIncome"]').clear().type(updatedIncome.toString());
        
        cy.get('button').contains('Update Profile').click();
        cy.get('[data-testid="success-message"]').should('be.visible');
        
        // Verify update persisted
        cy.reload();
        cy.get('input[name="annualIncome"]').should('have.value', updatedIncome.toString());
        
        // Test expense category management
        cy.get('[data-testid="expenses-section"]').click();
        
        // Add a new expense category
        cy.get('button').contains('Add Category').click();
        cy.get('input[name="newCategoryName"]').type('Test Category');
        cy.get('input[name="newCategoryAmount"]').type('5000');
        cy.get('button').contains('Save Category').click();
        
        // Verify new category appears
        cy.get('[data-testid="expenses-list"]').should('contain', 'Test Category');
        
        // Test goal management
        cy.get('[data-testid="goals-section"]').click();
        
        // Add a new goal
        cy.get('button').contains('Add Goal').click();
        cy.get('input[name="newGoalName"]').type('Test Goal');
        cy.get('input[name="newGoalAmount"]').type('100000');
        cy.get('input[name="newGoalDate"]').type('2026-12-31');
        cy.get('button').contains('Save Goal').click();
        
        // Verify new goal appears
        cy.get('[data-testid="goals-list"]').should('contain', 'Test Goal');
        
        cy.log(`✅ ${persona.profile.firstName} profile and financial data update successful`);
      });
      
      it(`should persist ${persona.profile.firstName}'s data across sessions`, () => {
        // Login
        cy.visit('/auth');
        cy.get('input[id="email"]').type(persona.email);
        cy.get('input[id="password"]').type(persona.password);
        cy.get('button[type="submit"]').click();
        
        // Verify profile data
        cy.get('[data-testid="profile-link"]').click();
        cy.get('input[name="firstName"]').should('have.value', persona.profile.firstName);
        cy.get('input[name="lastName"]').should('have.value', persona.profile.lastName);
        cy.get('input[name="annualIncome"]').should('have.value');
        
        // Verify goals
        cy.get('[data-testid="goals-section"]').click();
        persona.goals.forEach((goal) => {
          cy.get('[data-testid="goals-list"]').should('contain', goal.name);
        });
        
        // Verify accounts
        cy.get('[data-testid="accounts-section"]').click();
        persona.accounts.forEach((account) => {
          cy.get('[data-testid="accounts-list"]').should('contain', account.name);
        });
        
        // Verify expense categories
        cy.get('[data-testid="expenses-section"]').click();
        persona.expenseCategories.forEach((category) => {
          cy.get('[data-testid="expenses-list"]').should('contain', category.name);
        });
        
        // Verify goals persistence
        cy.get('[data-testid="goals-section"]').click();
        persona.goals.forEach((goal) => {
          cy.get('[data-testid="goals-list"]').should('contain', goal.name);
        });
        
        cy.log(`✅ ${persona.profile.firstName} complete data persistence verified`);
      });
    });
  });
  
  // Cross-persona data isolation test
  it('should maintain data isolation between personas', () => {
    // Login as Jamal
    cy.visit('/auth');
    cy.get('input[id="email"]').type(PERSONAS.jamal.email);
    cy.get('input[id="password"]').type(PERSONAS.jamal.password);
    cy.get('button[type="submit"]').click();
    
    // Verify Jamal sees only his data
    cy.get('[data-testid="goals-section"]').click();
    cy.get('[data-testid="goals-list"]').should('contain', 'Emergency Fund');
    cy.get('[data-testid="goals-list"]').should('not.contain', 'Children University Fund');
    
    // Logout and login as Aisha
    cy.get('[data-testid="logout-button"]').click();
    cy.get('input[id="email"]').type(PERSONAS.aisha.email);
    cy.get('input[id="password"]').type(PERSONAS.aisha.password);
    cy.get('button[type="submit"]').click();
    
    // Verify Aisha sees only her data
    cy.get('[data-testid="goals-section"]').click();
    cy.get('[data-testid="goals-list"]').should('contain', 'Children University Fund');
    cy.get('[data-testid="goals-list"]').should('not.contain', 'Emergency Fund');
    
    cy.log('✅ Data isolation between personas verified');
  });
  
  // Performance and stress testing
  it('should handle rapid profile updates without data loss', () => {
    cy.visit('/auth');
    cy.get('input[id="email"]').type(PERSONAS.samuel.email);
    cy.get('input[id="password"]').type(PERSONAS.samuel.password);
    cy.get('button[type="submit"]').click();
    
    cy.get('[data-testid="profile-link"]').click();
    
    // Perform rapid updates
    for (let i = 0; i < 5; i++) {
      const testIncome = PERSONAS.samuel.profile.annualIncome + (i * 10000);
      cy.get('input[name="annualIncome"]').clear().type(testIncome.toString());
      cy.get('button').contains('Update Profile').click();
      cy.get('[data-testid="success-message"]').should('be.visible');
      cy.wait(500);
    }
    
    // Verify final state
    const finalIncome = PERSONAS.samuel.profile.annualIncome + 40000;
    cy.get('input[name="annualIncome"]').should('have.value', finalIncome.toString());
    
    cy.log('✅ Rapid updates handled successfully');
  });
});

// Helper function to generate risk questionnaire answers based on risk tolerance
function getRiskAnswers(riskTolerance) {
  const answerMappings = {
    'conservative': [1, 1, 2, 1, 2, 1, 1, 2, 1, 2],
    'moderate_conservative': [2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    'moderate': [3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    'moderate_aggressive': [4, 4, 3, 4, 3, 4, 4, 3, 4, 3],
    'aggressive': [5, 5, 4, 5, 4, 5, 5, 4, 5, 4]
  };
  
  return answerMappings[riskTolerance] || answerMappings['moderate'];
}