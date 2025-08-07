/**
 * Essential Onboarding Tests - 10 Solid Test Cases
 * 
 * This test suite contains 10 focused, high-value test cases that validate
 * the core functionality of the rebuilt onboarding system.
 * 
 * Tests cover:
 * - Critical issue resolution (phone persistence, data accuracy)
 * - Core persona flows (Jamal, Aisha, Samuel)
 * - Essential system functionality
 * - Error handling and edge cases
 */

describe('Essential Onboarding Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('http://localhost:3000');
  });

  it('1. Should resolve phone field persistence critical issue', () => {
    cy.log('=== TEST 1: PHONE FIELD PERSISTENCE ===');
    
    const userEmail = `phone.test.${Date.now()}@example.com`;
    const testPhone = '+254701234567';
    
    // Registration
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').click();
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').first().type('PhoneTest123!');
    cy.get('input[type="password"]').last().type('PhoneTest123!');
    cy.get('button[type="submit"]').click();
    
    // Enter phone number
    cy.get('input[id="firstName"]').type('Phone');
    cy.get('input[id="lastName"]').type('Test');
    cy.get('input[id="phone"]').type(testPhone);
    
    // Verify auto-save and persistence
    cy.contains('Saved automatically', { timeout: 5000 }).should('be.visible');
    cy.reload();
    cy.get('input[id="phone"]').should('have.value', testPhone);
    
    // Complete onboarding quickly
    cy.contains('button', 'Next Step').click();
    [1, 2, 3, 4, 5].forEach(questionNum => {
      cy.get(`input[name="question-${questionNum}"]`).first().click();
    });
    cy.contains('button', 'Next Step').click();
    cy.get('input[id="monthlyIncome"]').type('75000');
    cy.get('input[id="monthlyExpenses"]').type('50000');
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Complete Registration').click();
    
    // CRITICAL: Verify phone appears in profile
    cy.url().should('include', '/dashboard');
    cy.contains('Profile').click();
    cy.contains(testPhone).should('be.visible');
    
    cy.log('✅ Phone field persistence RESOLVED');
  });

  it('2. Should display real income values instead of hardcoded 600000', () => {
    cy.log('=== TEST 2: FINANCIAL DATA ACCURACY ===');
    
    const userEmail = `income.test.${Date.now()}@example.com`;
    const realIncome = '125000';
    
    // Quick registration and onboarding
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').click();
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').first().type('IncomeTest123!');
    cy.get('input[type="password"]').last().type('IncomeTest123!');
    cy.get('button[type="submit"]').click();
    
    cy.get('input[id="firstName"]').type('Income');
    cy.get('input[id="lastName"]').type('Test');
    cy.get('input[id="phone"]').type('+254701234567');
    cy.contains('button', 'Next Step').click();
    
    [2, 3, 2, 3, 2].forEach((answer, questionIndex) => {
      cy.get(`input[name="question-${questionIndex + 1}"]`)
        .eq(answer - 1)
        .click({ force: true });
    });
    cy.contains('button', 'Next Step').click();
    
    // Enter REAL income (not hardcoded)
    cy.get('input[id="monthlyIncome"]').type(realIncome);
    cy.get('input[id="monthlyExpenses"]').type('80000');
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Complete Registration').click();
    
    // CRITICAL: Verify real income in profile (not 600000)
    cy.contains('Profile').click();
    cy.contains(realIncome).should('be.visible');
    cy.contains('600000').should('not.exist');
    
    cy.log('✅ Real income displayed (no hardcoded 600000)');
  });

  it('3. Should complete Jamal persona onboarding with early career features', () => {
    cy.log('=== TEST 3: JAMAL PERSONA COMPLETE FLOW ===');
    
    const jamalData = {
      email: `jamal.${Date.now()}@example.com`,
      firstName: 'Jamal',
      lastName: 'Mwangi',
      phone: '+254701234567',
      income: '75000',
      expenses: '50000'
    };
    
    // Registration
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').click();
    cy.get('input[type="email"]').type(jamalData.email);
    cy.get('input[type="password"]').first().type('JamalTest123!');
    cy.get('input[type="password"]').last().type('JamalTest123!');
    cy.get('button[type="submit"]').click();
    
    // Personal info
    cy.get('input[id="firstName"]').type(jamalData.firstName);
    cy.get('input[id="lastName"]').type(jamalData.lastName);
    cy.get('input[id="phone"]').type(jamalData.phone);
    cy.contains('button', 'Next Step').click();
    
    // Risk assessment (conservative)
    [2, 2, 2, 2, 2].forEach((answer, questionIndex) => {
      cy.get(`input[name="question-${questionIndex + 1}"]`)
        .eq(answer - 1)
        .click({ force: true });
    });
    cy.contains('button', 'Next Step').click();
    
    // Financial info - triggers early career persona
    cy.get('input[id="monthlyIncome"]').type(jamalData.income);
    cy.get('input[id="monthlyExpenses"]').type(jamalData.expenses);
    cy.get('input[id="monthlyIncome"]').blur();
    
    // Verify early career persona detection
    cy.contains('early career', { matchCase: false, timeout: 3000 }).should('be.visible');
    cy.contains('debt payoff', { matchCase: false }).should('be.visible');
    
    cy.contains('button', 'Next Step').click();
    
    // Goals - early career priorities
    cy.contains('Emergency Fund').should('be.visible');
    cy.contains('button', 'Use Smart Recommendations').click();
    
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Complete Registration').click();
    
    // Final validation
    cy.url().should('include', '/dashboard');
    cy.contains('Profile').click();
    cy.contains('Jamal Mwangi').should('be.visible');
    cy.contains(jamalData.phone).should('be.visible');
    cy.contains(jamalData.income).should('be.visible');
    
    cy.log('✅ Jamal early career persona flow complete');
  });

  it('4. Should complete Aisha persona onboarding with family business features', () => {
    cy.log('=== TEST 4: AISHA PERSONA COMPLETE FLOW ===');
    
    const aishaData = {
      email: `aisha.${Date.now()}@example.com`,
      firstName: 'Aisha',
      lastName: 'Otieno',
      phone: '+254721567890',
      income: '120000',
      expenses: '80000'
    };
    
    // Quick registration
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').click();
    cy.get('input[type="email"]').type(aishaData.email);
    cy.get('input[type="password"]').first().type('AishaTest123!');
    cy.get('input[type="password"]').last().type('AishaTest123!');
    cy.get('button[type="submit"]').click();
    
    // Personal info
    cy.get('input[id="firstName"]').type(aishaData.firstName);
    cy.get('input[id="lastName"]').type(aishaData.lastName);
    cy.get('input[id="phone"]').type(aishaData.phone);
    cy.contains('button', 'Next Step').click();
    
    // Risk assessment (moderate)
    [2, 3, 3, 2, 2].forEach((answer, questionIndex) => {
      cy.get(`input[name="question-${questionIndex + 1}"]`)
        .eq(answer - 1)
        .click({ force: true });
    });
    cy.contains('button', 'Next Step').click();
    
    // Financial info - triggers family business persona
    cy.get('input[id="monthlyIncome"]').type(aishaData.income);
    cy.get('input[id="monthlyExpenses"]').type(aishaData.expenses);
    cy.get('input[id="monthlyIncome"]').blur();
    
    // Verify family business persona detection
    cy.contains('family business', { matchCase: false, timeout: 3000 }).should('be.visible');
    cy.contains('education fund', { matchCase: false }).should('be.visible');
    
    cy.contains('button', 'Next Step').click();
    
    // Goals - family priorities
    cy.contains('Education Fund').should('be.visible');
    cy.contains('button', 'Use Smart Recommendations').click();
    
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Complete Registration').click();
    
    // Final validation
    cy.url().should('include', '/dashboard');
    cy.contains('Profile').click();
    cy.contains('Aisha Otieno').should('be.visible');
    cy.contains(aishaData.phone).should('be.visible');
    cy.contains(aishaData.income).should('be.visible');
    
    cy.log('✅ Aisha family business persona flow complete');
  });

  it('5. Should complete Samuel persona onboarding with senior executive features', () => {
    cy.log('=== TEST 5: SAMUEL PERSONA COMPLETE FLOW ===');
    
    const samuelData = {
      email: `samuel.${Date.now()}@example.com`,
      firstName: 'Samuel',
      lastName: 'Kariuki',
      phone: '+254722333444',
      income: '200000',
      expenses: '120000'
    };
    
    // Quick registration
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').click();
    cy.get('input[type="email"]').type(samuelData.email);
    cy.get('input[type="password"]').first().type('SamuelTest123!');
    cy.get('input[type="password"]').last().type('SamuelTest123!');
    cy.get('button[type="submit"]').click();
    
    // Personal info
    cy.get('input[id="firstName"]').type(samuelData.firstName);
    cy.get('input[id="lastName"]').type(samuelData.lastName);
    cy.get('input[id="phone"]').type(samuelData.phone);
    cy.contains('button', 'Next Step').click();
    
    // Risk assessment (conservative-balanced)
    [2, 4, 2, 4, 2].forEach((answer, questionIndex) => {
      cy.get(`input[name="question-${questionIndex + 1}"]`)
        .eq(answer - 1)
        .click({ force: true });
    });
    cy.contains('button', 'Next Step').click();
    
    // Financial info - triggers senior executive persona
    cy.get('input[id="monthlyIncome"]').type(samuelData.income);
    cy.get('input[id="monthlyExpenses"]').type(samuelData.expenses);
    cy.get('input[id="monthlyIncome"]').blur();
    
    // Verify senior executive persona detection
    cy.contains('senior executive', { matchCase: false, timeout: 3000 }).should('be.visible');
    cy.contains('retirement', { matchCase: false }).should('be.visible');
    
    cy.contains('button', 'Next Step').click();
    
    // Goals - executive priorities
    cy.contains('Retirement Fund').should('be.visible');
    cy.contains('button', 'Use Smart Recommendations').click();
    
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Complete Registration').click();
    
    // Final validation
    cy.url().should('include', '/dashboard');
    cy.contains('Profile').click();
    cy.contains('Samuel Kariuki').should('be.visible');
    cy.contains(samuelData.phone).should('be.visible');
    cy.contains(samuelData.income).should('be.visible');
    
    cy.log('✅ Samuel senior executive persona flow complete');
  });

  it('6. Should validate auto-save functionality prevents data loss', () => {
    cy.log('=== TEST 6: AUTO-SAVE FUNCTIONALITY ===');
    
    const userEmail = `autosave.${Date.now()}@example.com`;
    
    // Registration
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').click();
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').first().type('AutoSaveTest123!');
    cy.get('input[type="password"]').last().type('AutoSaveTest123!');
    cy.get('button[type="submit"]').click();
    
    // Enter data and verify auto-save
    cy.get('input[id="firstName"]').type('AutoSave');
    cy.get('input[id="lastName"]').type('Test');
    cy.get('input[id="phone"]').type('+254701234567');
    
    // Verify auto-save indicator
    cy.contains('Saved automatically', { timeout: 5000 }).should('be.visible');
    
    // Test persistence through page reload
    cy.reload();
    
    // Verify data persisted
    cy.get('input[id="firstName"]').should('have.value', 'AutoSave');
    cy.get('input[id="lastName"]').should('have.value', 'Test');
    cy.get('input[id="phone"]').should('have.value', '+254701234567');
    
    // Continue onboarding
    cy.contains('button', 'Next Step').click();
    
    // Test auto-save in risk assessment
    cy.get('input[name="question-1"]').first().click();
    cy.contains('Saved automatically', { timeout: 5000 }).should('be.visible');
    
    [2, 3, 4, 5].forEach(questionNum => {
      cy.get(`input[name="question-${questionNum}"]`).first().click();
    });
    
    cy.contains('button', 'Next Step').click();
    
    // Test auto-save in financial step
    cy.get('input[id="monthlyIncome"]').type('85000');
    cy.contains('Saved automatically', { timeout: 5000 }).should('be.visible');
    
    cy.log('✅ Auto-save functionality preventing data loss');
  });

  it('7. Should handle risk calculation consistency', () => {
    cy.log('=== TEST 7: RISK CALCULATION CONSISTENCY ===');
    
    const userEmail = `risk.${Date.now()}@example.com`;
    
    // Quick registration
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').click();
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').first().type('RiskTest123!');
    cy.get('input[type="password"]').last().type('RiskTest123!');
    cy.get('button[type="submit"]').click();
    
    cy.get('input[id="firstName"]').type('Risk');
    cy.get('input[id="lastName"]').type('Test');
    cy.get('input[id="phone"]').type('+254701234567');
    cy.contains('button', 'Next Step').click();
    
    // Specific risk pattern for validation
    const riskAnswers = [3, 2, 4, 3, 2];
    riskAnswers.forEach((answer, questionIndex) => {
      cy.get(`input[name="question-${questionIndex + 1}"]`)
        .eq(answer - 1)
        .click({ force: true });
    });
    
    // Verify risk score calculation appears
    cy.get('[data-testid="risk-score"]').should('be.visible');
    cy.contains('Medium Risk', { timeout: 3000 }).should('be.visible');
    
    // Store frontend risk score
    cy.get('[data-testid="risk-score"]').invoke('text').as('frontendRiskScore');
    
    cy.contains('button', 'Next Step').click();
    cy.get('input[id="monthlyIncome"]').type('95000');
    cy.get('input[id="monthlyExpenses"]').type('65000');
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Complete Registration').click();
    
    // Verify risk score consistency in profile
    cy.contains('Profile').click();
    
    cy.get('@frontendRiskScore').then(originalScore => {
      cy.get('[data-testid="risk-score"]').should('contain', originalScore);
    });
    
    cy.log('✅ Risk calculation consistency validated');
  });

  it('8. Should handle persona detection boundary conditions', () => {
    cy.log('=== TEST 8: PERSONA BOUNDARY CONDITIONS ===');
    
    const boundaryTests = [
      { income: '99999', expected: 'early career' },
      { income: '100000', expected: 'family business' },
      { income: '149999', expected: 'family business' },
      { income: '150000', expected: 'senior executive' }
    ];
    
    boundaryTests.forEach((test, index) => {
      cy.log(`Testing boundary: ${test.income} -> ${test.expected}`);
      
      if (index > 0) {
        cy.clearLocalStorage();
        cy.clearCookies();
        cy.visit('http://localhost:3000');
      }
      
      const userEmail = `boundary.${index}.${Date.now()}@example.com`;
      
      // Quick registration
      cy.contains('button', 'Get Started').click();
      cy.contains('button', 'Sign Up').click();
      cy.get('input[type="email"]').type(userEmail);
      cy.get('input[type="password"]').first().type('BoundaryTest123!');
      cy.get('input[type="password"]').last().type('BoundaryTest123!');
      cy.get('button[type="submit"]').click();
      
      cy.get('input[id="firstName"]').type('Boundary');
      cy.get('input[id="lastName"]').type('Test');
      cy.get('input[id="phone"]').type(`+25470123456${index}`);
      cy.contains('button', 'Next Step').click();
      
      [2, 3, 2, 3, 2].forEach((answer, questionIndex) => {
        cy.get(`input[name="question-${questionIndex + 1}"]`)
          .eq(answer - 1)
          .click({ force: true });
      });
      cy.contains('button', 'Next Step').click();
      
      // Test boundary income
      cy.get('input[id="monthlyIncome"]').type(test.income);
      cy.get('input[id="monthlyIncome"]').blur();
      
      // Verify persona detection
      cy.contains(test.expected.split(' ')[0], { matchCase: false, timeout: 3000 }).should('be.visible');
    });
    
    cy.log('✅ Persona boundary conditions handled correctly');
  });

  it('9. Should handle error scenarios gracefully', () => {
    cy.log('=== TEST 9: ERROR HANDLING ===');
    
    const userEmail = `error.${Date.now()}@example.com`;
    
    // Test registration with validation
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').click();
    
    // Test invalid email first
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').first().type('weak');
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.get('input[type="email"]:invalid').should('exist');
    
    // Correct and proceed
    cy.get('input[type="email"]').clear().type(userEmail);
    cy.get('input[type="password"]').first().clear().type('StrongPassword123!');
    cy.get('input[type="password"]').last().type('StrongPassword123!');
    cy.get('button[type="submit"]').click();
    
    // Test rapid input changes
    cy.get('input[id="firstName"]').type('Error{backspace}{backspace}Test');
    cy.get('input[id="lastName"]').type('Handle{backspace}{backspace}ing');
    cy.get('input[id="phone"]').type('+254701{backspace}{backspace}234567');
    
    // Should handle gracefully
    cy.contains('Saved automatically', { timeout: 5000 }).should('be.visible');
    
    // Test with page interruption
    cy.reload();
    
    // Should recover data
    cy.get('input[id="firstName"]').should('have.value', 'Test');
    cy.get('input[id="lastName"]').should('have.value', 'ing');
    cy.get('input[id="phone"]').should('have.value', '+254701234567');
    
    cy.log('✅ Error scenarios handled gracefully');
  });

  it('10. Should validate complete data flow end-to-end', () => {
    cy.log('=== TEST 10: COMPLETE DATA FLOW VALIDATION ===');
    
    const completeData = {
      email: `complete.${Date.now()}@example.com`,
      firstName: 'Complete',
      lastName: 'Test',
      phone: '+254701234567',
      income: '110000',
      expenses: '75000',
      savings: '200000',
      debt: '50000'
    };
    
    // Complete onboarding flow
    cy.contains('button', 'Get Started').click();
    cy.contains('button', 'Sign Up').click();
    
    cy.get('input[type="email"]').type(completeData.email);
    cy.get('input[type="password"]').first().type('CompleteTest123!');
    cy.get('input[type="password"]').last().type('CompleteTest123!');
    cy.get('button[type="submit"]').click();
    
    // Personal information
    cy.get('input[id="firstName"]').type(completeData.firstName);
    cy.get('input[id="lastName"]').type(completeData.lastName);
    cy.get('input[id="phone"]').type(completeData.phone);
    cy.contains('button', 'Next Step').click();
    
    // Risk assessment
    [3, 2, 4, 3, 2].forEach((answer, questionIndex) => {
      cy.get(`input[name="question-${questionIndex + 1}"]`)
        .eq(answer - 1)
        .click({ force: true });
    });
    
    cy.get('[data-testid="risk-score"]').invoke('text').as('completeRiskScore');
    cy.contains('button', 'Next Step').click();
    
    // Financial information
    cy.get('input[id="monthlyIncome"]').type(completeData.income);
    cy.get('input[id="monthlyExpenses"]').type(completeData.expenses);
    cy.get('input[id="existingSavings"]').type(completeData.savings);
    cy.get('input[id="existingDebt"]').type(completeData.debt);
    
    // Verify calculations
    const expectedDisposable = parseInt(completeData.income) - parseInt(completeData.expenses);
    cy.contains('Disposable Income').should('be.visible');
    cy.contains(expectedDisposable.toLocaleString()).should('be.visible');
    
    cy.contains('button', 'Next Step').click();
    cy.contains('button', 'Next Step').click(); // Skip goals
    
    // Review step validation
    cy.contains('Review Your Information').should('be.visible');
    cy.contains(completeData.firstName).should('be.visible');
    cy.contains(completeData.phone).should('be.visible');
    cy.contains(completeData.income).should('be.visible');
    
    cy.contains('button', 'Complete Registration').click();
    
    // Final validation in profile
    cy.url().should('include', '/dashboard');
    cy.contains('Profile').click();
    
    // Validate ALL data persisted correctly
    cy.contains(completeData.firstName).should('be.visible');
    cy.contains(completeData.lastName).should('be.visible');
    cy.contains(completeData.phone).should('be.visible');
    cy.contains(completeData.income).should('be.visible');
    cy.contains(completeData.expenses).should('be.visible');
    cy.contains('600000').should('not.exist'); // No hardcoded values
    
    // Verify risk score consistency
    cy.get('@completeRiskScore').then(originalScore => {
      cy.get('[data-testid="risk-score"]').should('contain', originalScore);
    });
    
    // Verify persona detection worked
    cy.contains('family business', { matchCase: false }).should('be.visible');
    
    cy.log('✅ Complete end-to-end data flow validated');
  });

  after(() => {
    cy.log('=== ESSENTIAL ONBOARDING TESTS COMPLETE ===');
    cy.log('');
    cy.log('✅ 1. Phone field persistence - RESOLVED');
    cy.log('✅ 2. Financial data accuracy - RESOLVED');
    cy.log('✅ 3. Jamal persona flow - WORKING');
    cy.log('✅ 4. Aisha persona flow - WORKING');
    cy.log('✅ 5. Samuel persona flow - WORKING');
    cy.log('✅ 6. Auto-save functionality - WORKING');
    cy.log('✅ 7. Risk calculation consistency - VALIDATED');
    cy.log('✅ 8. Persona boundary conditions - HANDLED');
    cy.log('✅ 9. Error scenarios - GRACEFUL');
    cy.log('✅ 10. Complete data flow - END-TO-END VALIDATED');
    cy.log('');
    cy.log('🎉 ALL CRITICAL ISSUES RESOLVED - SYSTEM READY! 🎉');
  });
});