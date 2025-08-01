/**
 * New User Onboarding Test
 * 
 * Tests complete onboarding flow for NEW users (not existing personas)
 * Tests all profile features including goals and expense categories
 * 
 * Purpose: Validate onboarding process with comprehensive data entry
 */

describe('🚀 New User Onboarding - Complete Flow', () => {
  
  // Generate unique test users to avoid conflicts
  const generateTestUser = (type = 'user') => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    return {
      email: `test.${type}.${timestamp}.${random}@example.com`,
      password: 'testpassword123',
      userType: type,
      profile: {
        firstName: `Test${type.charAt(0).toUpperCase() + type.slice(1)}`,
        lastName: `User${random}`,
        dateOfBirth: '1990-05-15',
        annualIncome: 750000,
        employmentStatus: 'Employed',
        dependents: 1,
        kraPin: `A${timestamp.toString().slice(-9)}Z`,
        nationalId: `${timestamp.toString().slice(-8)}`,
        phoneNumber: `+25471${random.toString().padStart(4, '0')}123`,
        address: 'Test Address, Nairobi',
        maritalStatus: 'Single',
        education: 'Bachelor',
        occupation: 'Test Professional'
      },
      advisorProfile: type === 'advisor' ? {
        firmName: `Test Advisory Firm ${random}`,
        licenseNumber: `TEST${timestamp.toString().slice(-6)}`,
        professionalEmail: `advisor.test.${timestamp}@example.com`,
        serviceModel: 'fee-only',
        targetClientType: 'middle-income',
        minimumAum: '500000'
      } : null,
      goals: [
        { name: 'Emergency Fund', targetAmount: 150000, currentAmount: 30000, targetDate: '2025-12-31' },
        { name: 'Investment Start', targetAmount: 100000, currentAmount: 0, targetDate: '2026-06-30' }
      ],
      expenseCategories: [
        { name: 'Rent', budgetedAmount: 20000 },
        { name: 'Food', budgetedAmount: 12000 },
        { name: 'Transport', budgetedAmount: 8000 },
        { name: 'Utilities', budgetedAmount: 5000 }
      ],
      accounts: [
        { name: 'Test Checking Account', type: 'checking', balance: 75000 },
        { name: 'Test Savings Account', type: 'savings', balance: 50000 }
      ]
    };
  };

  beforeEach(() => {
    cy.visit('/');
  });

  it('should complete full onboarding flow for a new regular user', () => {
    const testUser = generateTestUser('user');
    cy.log(`🧪 Testing new user onboarding: ${testUser.email}`);
    
    // Step 1: Navigate to registration
    cy.get('button').contains('Get Started').click();
    cy.get('button').contains('Sign Up').click();
    
    // Step 2: Register user
    cy.get('input[id="email"]').type(testUser.email);
    cy.get('input[id="password"]').type(testUser.password);
    cy.get('input[id="confirmPassword"]').type(testUser.password);
    cy.get('input[value="user"]').check();
    cy.get('button[type="submit"]').click();
    
    // Step 3: Verify successful registration and onboarding start
    cy.url().should('include', '/onboarding', { timeout: 15000 });
    
    // Step 4: Complete personal details
    cy.get('input[name="firstName"]').type(testUser.profile.firstName);
    cy.get('input[name="lastName"]').type(testUser.profile.lastName);
    cy.get('input[name="dateOfBirth"]').type(testUser.profile.dateOfBirth);
    cy.get('input[name="phoneNumber"]').type(testUser.profile.phoneNumber);
    cy.get('input[name="address"]').type(testUser.profile.address);
    
    // Step 5: Complete financial details
    cy.get('input[name="annualIncome"]').type(testUser.profile.annualIncome.toString());
    cy.get('select[name="employmentStatus"]').select(testUser.profile.employmentStatus);
    cy.get('input[name="dependents"]').type(testUser.profile.dependents.toString());
    cy.get('input[name="kraPin"]').type(testUser.profile.kraPin);
    cy.get('input[name="nationalId"]').type(testUser.profile.nationalId);
    
    // Step 6: Complete demographic details
    cy.get('select[name="maritalStatus"]').select(testUser.profile.maritalStatus);
    cy.get('select[name="education"]').select(testUser.profile.education);
    cy.get('input[name="occupation"]').type(testUser.profile.occupation);
    
    cy.get('button').contains('Continue').click();
    
    // Step 7: Complete risk questionnaire
    cy.url().should('include', '/risk', { timeout: 10000 });
    
    // Answer risk questions (moderate risk profile)
    const riskAnswers = [3, 3, 3, 3, 3, 3, 3, 3, 3, 3]; // Moderate answers
    riskAnswers.forEach((answer, index) => {
      cy.get(`input[name="q${index + 1}"][value="${answer}"]`).check();
    });
    
    cy.get('button[type="submit"]').click();
    
    // Step 8: Set financial goals
    cy.get('button').contains('Set Goals').click();
    
    testUser.goals.forEach((goal, index) => {
      if (index > 0) {
        cy.get('button').contains('Add Goal').click();
      }
      cy.get(`input[name="goalName${index}"]`).type(goal.name);
      cy.get(`input[name="targetAmount${index}"]`).type(goal.targetAmount.toString());
      cy.get(`input[name="currentAmount${index}"]`).type(goal.currentAmount.toString());
      cy.get(`input[name="targetDate${index}"]`).type(goal.targetDate);
    });
    
    cy.get('button[type="submit"]').click();
    
    // Step 9: Add expense categories
    cy.get('button').contains('Set Budget').click();
    
    testUser.expenseCategories.forEach((category, index) => {
      if (index > 0) {
        cy.get('button').contains('Add Category').click();
      }
      cy.get(`input[name="categoryName${index}"]`).type(category.name);
      cy.get(`input[name="budgetedAmount${index}"]`).type(category.budgetedAmount.toString());
    });
    
    cy.get('button[type="submit"]').click();
    
    // Step 10: Add accounts
    cy.get('button').contains('Add Accounts').click();
    
    testUser.accounts.forEach((account, index) => {
      if (index > 0) {
        cy.get('button').contains('Add Account').click();
      }
      cy.get(`input[name="accountName${index}"]`).type(account.name);
      cy.get(`select[name="accountType${index}"]`).select(account.type);
      cy.get(`input[name="balance${index}"]`).type(account.balance.toString());
    });
    
    cy.get('button[type="submit"]').click();
    
    // Step 11: Verify onboarding completion
    cy.url().should('include', '/dashboard', { timeout: 15000 });
    cy.get('h1').should('contain', `Hello, ${testUser.profile.firstName}`);
    
    // Step 12: Verify all data was saved by navigating to profile
    cy.get('[data-testid="profile-link"]').click();
    cy.url().should('include', '/profile');
    
    // Verify profile data
    cy.get('input[name="firstName"]').should('have.value', testUser.profile.firstName);
    cy.get('input[name="lastName"]').should('have.value', testUser.profile.lastName);
    cy.get('input[name="annualIncome"]').should('have.value', testUser.profile.annualIncome.toString());
    
    // Verify goals were created
    cy.get('[data-testid="goals-section"]').click();
    testUser.goals.forEach((goal) => {
      cy.get('[data-testid="goals-list"]').should('contain', goal.name);
    });
    
    // Verify expense categories were created
    cy.get('[data-testid="expenses-section"]').click();
    testUser.expenseCategories.forEach((category) => {
      cy.get('[data-testid="expenses-list"]').should('contain', category.name);
    });
    
    cy.log(`✅ Complete onboarding successful for ${testUser.profile.firstName}`);
  });

  it('should complete full onboarding flow for a new advisor user', () => {
    const testAdvisor = generateTestUser('advisor');
    cy.log(`🧪 Testing new advisor onboarding: ${testAdvisor.email}`);
    
    // Step 1: Navigate to registration
    cy.get('button').contains('Get Started').click();
    cy.get('button').contains('Sign Up').click();
    
    // Step 2: Register advisor
    cy.get('input[id="email"]').type(testAdvisor.email);
    cy.get('input[id="password"]').type(testAdvisor.password);
    cy.get('input[id="confirmPassword"]').type(testAdvisor.password);
    cy.get('input[value="advisor"]').check();
    cy.get('button[type="submit"]').click();
    
    // Step 3: Complete advisor onboarding
    cy.url().should('include', '/onboarding/advisor', { timeout: 15000 });
    
    // Personal details
    cy.get('input[name="firstName"]').type(testAdvisor.profile.firstName);
    cy.get('input[name="lastName"]').type(testAdvisor.profile.lastName);
    cy.get('input[name="dateOfBirth"]').type(testAdvisor.profile.dateOfBirth);
    
    // Advisor-specific fields
    cy.get('input[name="firmName"]').type(testAdvisor.advisorProfile.firmName);
    cy.get('input[name="licenseNumber"]').type(testAdvisor.advisorProfile.licenseNumber);
    cy.get('input[name="professionalEmail"]').type(testAdvisor.advisorProfile.professionalEmail);
    cy.get('select[name="serviceModel"]').select(testAdvisor.advisorProfile.serviceModel);
    cy.get('select[name="targetClientType"]').select(testAdvisor.advisorProfile.targetClientType);
    cy.get('input[name="minimumAum"]').type(testAdvisor.advisorProfile.minimumAum);
    
    cy.get('button').contains('Complete Setup').click();
    
    // Step 4: Verify advisor dashboard
    cy.url().should('include', '/advisor/dashboard', { timeout: 15000 });
    cy.get('h1').should('contain', `Welcome, ${testAdvisor.profile.firstName}`);
    
    // Step 5: Verify advisor profile
    cy.get('[data-testid="profile-link"]').click();
    cy.url().should('include', '/profile');
    
    // Verify advisor-specific data
    cy.get('body').should('contain', testAdvisor.advisorProfile.firmName);
    cy.get('body').should('contain', testAdvisor.advisorProfile.licenseNumber);
    
    cy.log(`✅ Complete advisor onboarding successful for ${testAdvisor.profile.firstName}`);
  });

  it('should handle onboarding errors gracefully', () => {
    const testUser = generateTestUser('user');
    
    // Test duplicate email registration
    cy.get('button').contains('Get Started').click();
    cy.get('button').contains('Sign Up').click();
    
    // Use existing email (Jamal's)
    cy.get('input[id="email"]').type('jamal@example.com');
    cy.get('input[id="password"]').type(testUser.password);
    cy.get('input[id="confirmPassword"]').type(testUser.password);
    cy.get('input[value="user"]').check();
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.get('[data-testid="error-message"]').should('be.visible');
    cy.get('body').should('contain', 'email already exists');
    
    cy.log('✅ Onboarding error handling validated');
  });

  it('should validate required fields during onboarding', () => {
    const testUser = generateTestUser('user');
    
    // Start registration
    cy.get('button').contains('Get Started').click();
    cy.get('button').contains('Sign Up').click();
    
    // Try to submit without required fields
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.get('input[id="email"]:invalid').should('exist');
    cy.get('input[id="password"]:invalid').should('exist');
    
    // Fill in valid data
    cy.get('input[id="email"]').type(testUser.email);
    cy.get('input[id="password"]').type(testUser.password);
    cy.get('input[id="confirmPassword"]').type(testUser.password);
    cy.get('input[value="user"]').check();
    cy.get('button[type="submit"]').click();
    
    // Should proceed to onboarding
    cy.url().should('include', '/onboarding', { timeout: 15000 });
    
    // Try to continue without required onboarding fields
    cy.get('button').contains('Continue').click();
    
    // Should show validation for required fields
    cy.get('input[name="firstName"]:invalid').should('exist');
    cy.get('input[name="lastName"]:invalid').should('exist');
    
    cy.log('✅ Required field validation working correctly');
  });

  it('should persist data across onboarding steps', () => {
    const testUser = generateTestUser('user');
    
    // Complete registration
    cy.get('button').contains('Get Started').click();
    cy.get('button').contains('Sign Up').click();
    cy.get('input[id="email"]').type(testUser.email);
    cy.get('input[id="password"]').type(testUser.password);
    cy.get('input[id="confirmPassword"]').type(testUser.password);
    cy.get('input[value="user"]').check();
    cy.get('button[type="submit"]').click();
    
    // Fill some onboarding data
    cy.get('input[name="firstName"]').type(testUser.profile.firstName);
    cy.get('input[name="lastName"]').type(testUser.profile.lastName);
    cy.get('input[name="annualIncome"]').type(testUser.profile.annualIncome.toString());
    
    // Navigate away and back (simulating browser refresh or navigation)
    cy.visit('/profile');
    cy.visit('/onboarding');
    
    // Verify data persistence
    cy.get('input[name="firstName"]').should('have.value', testUser.profile.firstName);
    cy.get('input[name="lastName"]').should('have.value', testUser.profile.lastName);
    cy.get('input[name="annualIncome"]').should('have.value', testUser.profile.annualIncome.toString());
    
    cy.log('✅ Data persistence across onboarding steps validated');
  });
});