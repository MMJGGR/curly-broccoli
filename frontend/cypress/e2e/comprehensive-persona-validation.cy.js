/**
 * Comprehensive Persona Validation Test Suite
 * 
 * This test suite validates the complete user journey for all three personas:
 * - Jamal Mwangi (Goal-Oriented Professional) 
 * - Aisha Otieno (Family-Focused Business Owner)
 * - Samuel Kariuki (Pre-retirement Executive)
 * 
 * Test Coverage:
 * 1. Onboarding journey with persona-specific inputs
 * 2. Timeline dashboard persona adaptations
 * 3. Budget feature persona-specific recommendations
 * 4. Profile management with persona considerations
 * 5. Cross-platform compatibility and performance
 */

describe('Comprehensive Persona Validation Testing', () => {
  const TEST_DATA = {
    // Base Richard's financial data
    financials: {
      monthlyIncome: 324759,
      expenses: {
        rent: 41000,
        utilities: 9000, 
        groceries: 20000,
        transport: 12000,
        loanRepayments: 33247,
        blackTax: 32000,
        total: 147247
      },
      calculatedSurplus: 177512
    },

    // Persona-specific configurations
    personas: {
      jamal: {
        name: 'Jamal Mwangi',
        age: 28,
        riskProfile: 'High Risk',
        riskAnswers: [4, 5, 4, 5, 4], // High risk tolerance answers
        goals: ['Investment Portfolio', 'Emergency Fund', 'Property Investment'],
        primaryFocus: 'investment_growth',
        expectedRecommendations: [
          'Increase investment allocation by 10%',
          'Consider tax-advantaged retirement accounts',
          'Build emergency fund to 6 months'
        ],
        themeColor: 'blue',
        keyMetrics: ['roi', 'growth_rate', 'portfolio_value']
      },
      aisha: {
        name: 'Aisha Otieno',
        age: 35,
        riskProfile: 'Moderate Risk',
        riskAnswers: [3, 3, 3, 3, 3], // Moderate risk tolerance answers
        goals: ['Children Education', 'Family Emergency Fund', 'Family Insurance'],
        primaryFocus: 'family_security',
        expectedRecommendations: [
          'Prioritize education fund for children',
          'Ensure adequate family insurance coverage',
          'Balance family needs with retirement savings'
        ],
        themeColor: 'purple',
        keyMetrics: ['savings_rate', 'emergency_fund', 'education_fund'],
        additionalExpenses: {
          insurance: 15000,
          healthcare: 8000,
          education: 25000
        }
      },
      samuel: {
        name: 'Samuel Kariuki',
        age: 52,
        riskProfile: 'Conservative',
        riskAnswers: [1, 2, 1, 2, 1], // Low risk tolerance answers
        goals: ['Retirement Fund', 'Debt Reduction', 'Healthcare Fund'],
        primaryFocus: 'wealth_preservation',
        expectedRecommendations: [
          'Focus on wealth preservation strategies',
          'Consider healthcare cost inflation',
          'Optimize tax-efficient withdrawal strategies'
        ],
        themeColor: 'green',
        keyMetrics: ['debt_reduction', 'monthly_surplus', 'credit_score'],
        additionalExpenses: {
          healthcare: 12000,
          insurance: 18000
        }
      }
    }
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.visit('http://localhost:3000');
  });

  // Helper function to create user with specific persona
  const createUserWithPersona = (personaKey, customData = {}) => {
    const persona = TEST_DATA.personas[personaKey];
    const userEmail = `${personaKey}.validation.${Date.now()}@test.com`;
    
    cy.log(`=== Creating ${persona.name} Persona User ===`);
    
    // Step 1: Registration
    cy.contains('New user? Create Account').click();
    cy.wait(500);
    
    cy.get('input[type="email"]').type(userEmail);
    cy.get('input[type="password"]').first().type(`${personaKey}Test123!`);
    cy.get('input[type="password"]').last().type(`${personaKey}Test123!`);
    cy.get('button[type="submit"]').click();
    
    // Step 2: Personal Information
    cy.url().should('include', '/onboarding', { timeout: 10000 });
    cy.get('input[id="firstName"]').should('be.visible').should('not.be.disabled');
    
    cy.get('input[id="firstName"]').clear().type(persona.name.split(' ')[0]);
    cy.get('input[id="lastName"]').clear().type(persona.name.split(' ')[1]);
    cy.get('input[id="phone"]').clear().type('+254701234567');
    cy.contains('button', 'Next Step').click();
    
    // Step 3: Risk Assessment
    cy.log(`Answering risk questions for ${persona.riskProfile}`);
    persona.riskAnswers.forEach((answer, index) => {
      cy.get(`input[name="question-${index + 1}"]`).eq(answer - 1).click({ force: true });
    });
    cy.contains('button', 'Next Step').click();
    
    // Step 4: Financial Information
    const totalExpenses = TEST_DATA.financials.expenses.total + 
      (persona.additionalExpenses ? Object.values(persona.additionalExpenses).reduce((a, b) => a + b, 0) : 0);
    
    cy.get('input[id="monthlyIncome"]').type(TEST_DATA.financials.monthlyIncome.toString());
    cy.get('input[id="monthlyExpenses"]').type(totalExpenses.toString());
    
    // Step 5: Goals Selection
    cy.contains('button', 'Next Step').click();
    // Add persona-specific goal selection if implemented
    cy.contains('button', 'Next Step').click();
    
    // Step 6: Preferences
    cy.contains('button', 'Complete Registration').click();
    
    // Verify successful registration
    cy.url().should('include', '/dashboard', { timeout: 15000 });
    
    return { userEmail, persona };
  };

  // Test Suite 1: Jamal Mwangi (Goal-Oriented Professional) Testing
  describe('Jamal Mwangi - Goal-Oriented Professional Persona', () => {
    let userContext;

    beforeEach(() => {
      userContext = createUserWithPersona('jamal');
    });

    it('should complete onboarding with investment-focused persona detection', () => {
      cy.log('=== JAMAL: Onboarding Journey Validation ===');
      
      // Verify persona detection worked
      cy.get('[data-cy=persona-badge]', { timeout: 10000 })
        .should('contain', 'Jamal')
        .should('be.visible');
      
      // Verify high-risk tolerance was detected
      cy.get('[data-cy=risk-indicator]', { timeout: 5000 })
        .should('contain', 'High');
    });

    it('should display investment-focused dashboard adaptations', () => {
      cy.log('=== JAMAL: Dashboard Persona Adaptations ===');
      
      // Verify Jamal-specific theming and content
      cy.get('.persona-jamal').should('exist');
      
      // Check for investment-focused metrics
      cy.contains('Portfolio Value').should('be.visible');
      cy.contains('ROI').should('be.visible');
      cy.contains('Growth Rate').should('be.visible');
      
      // Verify motivational messaging matches analytical personality
      cy.contains('optimize').should('be.visible');
      cy.contains('data').should('be.visible').or(cy.contains('analysis').should('be.visible'));
      
      // Check alignment score is displayed
      cy.get('[data-cy=alignment-score]').should('exist');
    });

    it('should provide investment-focused budget recommendations', () => {
      cy.log('=== JAMAL: Budget Feature Validation ===');
      
      // Navigate to Budget
      cy.contains('Budget').click();
      cy.url().should('include', '/budget');
      
      // Verify Jamal-specific budget theming
      cy.get('[data-cy=budget-header]').should('have.css', 'background-color').and('include', 'rgb');
      
      // Check for investment-focused recommendations
      TEST_DATA.personas.jamal.expectedRecommendations.forEach(recommendation => {
        cy.contains(recommendation, { timeout: 5000 }).should('be.visible');
      });
      
      // Verify high surplus shows investment opportunities
      cy.get('[data-cy=actual-surplus]').should('contain', '177,512');
      cy.contains('investment').should('be.visible');
      
      // Test budget editing with investment priority
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=goal-investments]').should('be.visible').clear().type('60000');
      cy.contains('Save Budget').click();
      cy.contains('Saved').should('be.visible', { timeout: 5000 });
    });

    it('should show goal acceleration with surplus allocation', () => {
      cy.log('=== JAMAL: Goal Acceleration Integration ===');
      
      // Verify Timeline integration
      cy.contains('Dashboard').click();
      cy.get('[data-cy=timeline-visualization]').should('be.visible', { timeout: 10000 });
      
      // Check for milestone acceleration messages
      cy.contains('+Budget Boost').should('be.visible').or(cy.contains('accelerate').should('be.visible'));
      
      // Verify investment milestones are prioritized
      cy.contains('Investment').should('be.visible').or(cy.contains('Portfolio').should('be.visible'));
    });
  });

  // Test Suite 2: Aisha Otieno (Family-Focused Business Owner) Testing
  describe('Aisha Otieno - Family-Focused Business Owner Persona', () => {
    let userContext;

    beforeEach(() => {
      userContext = createUserWithPersona('aisha');
    });

    it('should complete onboarding with family-focused persona detection', () => {
      cy.log('=== AISHA: Onboarding Journey Validation ===');
      
      // Verify persona detection
      cy.get('[data-cy=persona-badge]', { timeout: 10000 })
        .should('contain', 'Aisha')
        .should('be.visible');
      
      // Verify moderate risk tolerance
      cy.get('[data-cy=risk-indicator]', { timeout: 5000 })
        .should('contain', 'Moderate');
    });

    it('should display family-focused dashboard adaptations', () => {
      cy.log('=== AISHA: Dashboard Persona Adaptations ===');
      
      // Verify Aisha-specific theming
      cy.get('.persona-aisha').should('exist');
      
      // Check for family-focused metrics
      cy.contains('Savings Rate').should('be.visible').or(cy.contains('Emergency Fund').should('be.visible'));
      cy.contains('Education Fund').should('be.visible').or(cy.contains('Family').should('be.visible'));
      
      // Verify supportive messaging tone
      cy.contains('family').should('be.visible');
      cy.contains('Great job').should('be.visible').or(cy.contains('inspiring').should('be.visible'));
    });

    it('should provide family-focused budget recommendations', () => {
      cy.log('=== AISHA: Budget Feature Validation ===');
      
      // Navigate to Budget
      cy.contains('Budget').click();
      cy.url().should('include', '/budget');
      
      // Check for family-specific recommendations
      TEST_DATA.personas.aisha.expectedRecommendations.forEach(recommendation => {
        cy.contains(recommendation, { timeout: 5000 }).should('be.visible');
      });
      
      // Verify family expense categories
      cy.contains('Family Support').should('be.visible').or(cy.contains('Insurance').should('be.visible'));
      cy.contains('Healthcare').should('be.visible').or(cy.contains('Education').should('be.visible'));
      
      // Test education fund allocation
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=goal-education]').should('be.visible').clear().type('40000');
      cy.contains('Save Budget').click();
      cy.contains('Saved').should('be.visible', { timeout: 5000 });
    });

    it('should prioritize family milestones in timeline', () => {
      cy.log('=== AISHA: Family Timeline Integration ===');
      
      cy.contains('Dashboard').click();
      cy.get('[data-cy=timeline-visualization]').should('be.visible', { timeout: 10000 });
      
      // Check for education-related milestones
      cy.contains('Education').should('be.visible').or(cy.contains('Family').should('be.visible'));
      
      // Verify milestone celebration style
      cy.contains('achievement').should('be.visible').or(cy.contains('milestone').should('be.visible'));
    });
  });

  // Test Suite 3: Samuel Kariuki (Pre-retirement Executive) Testing
  describe('Samuel Kariuki - Pre-retirement Executive Persona', () => {
    let userContext;

    beforeEach(() => {
      userContext = createUserWithPersona('samuel');
    });

    it('should complete onboarding with conservative persona detection', () => {
      cy.log('=== SAMUEL: Onboarding Journey Validation ===');
      
      // Verify persona detection
      cy.get('[data-cy=persona-badge]', { timeout: 10000 })
        .should('contain', 'Samuel')
        .should('be.visible');
      
      // Verify conservative risk tolerance
      cy.get('[data-cy=risk-indicator]', { timeout: 5000 })
        .should('contain', 'Conservative').or(cy.contains('Low').should('be.visible'));
    });

    it('should display wealth preservation dashboard adaptations', () => {
      cy.log('=== SAMUEL: Dashboard Persona Adaptations ===');
      
      // Verify Samuel-specific theming
      cy.get('.persona-samuel').should('exist');
      
      // Check for stability-focused metrics
      cy.contains('Debt Reduction').should('be.visible').or(cy.contains('Monthly Surplus').should('be.visible'));
      cy.contains('Credit Score').should('be.visible').or(cy.contains('Stability').should('be.visible'));
      
      // Verify encouraging messaging tone
      cy.contains('Steady').should('be.visible').or(cy.contains('foundation').should('be.visible'));
    });

    it('should provide conservative budget recommendations', () => {
      cy.log('=== SAMUEL: Budget Feature Validation ===');
      
      // Navigate to Budget
      cy.contains('Budget').click();
      cy.url().should('include', '/budget');
      
      // Check for conservative recommendations
      TEST_DATA.personas.samuel.expectedRecommendations.forEach(recommendation => {
        cy.contains(recommendation, { timeout: 5000 }).should('be.visible');
      });
      
      // Verify healthcare and retirement emphasis
      cy.contains('Healthcare').should('be.visible').or(cy.contains('Retirement').should('be.visible'));
      cy.contains('preservation').should('be.visible').or(cy.contains('stability').should('be.visible'));
      
      // Test retirement fund allocation priority
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=goal-retirement]').should('be.visible').clear().type('70000');
      cy.contains('Save Budget').click();
      cy.contains('Saved').should('be.visible', { timeout: 5000 });
    });

    it('should emphasize wealth preservation in timeline', () => {
      cy.log('=== SAMUEL: Wealth Preservation Timeline ===');
      
      cy.contains('Dashboard').click();
      cy.get('[data-cy=timeline-visualization]').should('be.visible', { timeout: 10000 });
      
      // Check for retirement-focused milestones
      cy.contains('Retirement').should('be.visible').or(cy.contains('Healthcare').should('be.visible'));
      
      // Verify step-by-step progress approach
      cy.contains('progress').should('be.visible').or(cy.contains('step').should('be.visible'));
    });
  });

  // Cross-Persona Integration Testing
  describe('Cross-Persona System Integration', () => {
    it('should handle persona switching and data persistence', () => {
      cy.log('=== CROSS-PERSONA: Data Persistence Testing ===');
      
      // Create Jamal user and set budget
      const jamalUser = createUserWithPersona('jamal');
      cy.contains('Budget').click();
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=goal-investments]').clear().type('50000');
      cy.contains('Save Budget').click();
      
      // Verify data persists across page reloads
      cy.reload();
      cy.get('[data-cy=goal-investments]').should('have.value', '50000');
      
      // Navigate to profile and back to dashboard
      cy.contains('Profile').click();
      cy.url().should('include', '/profile');
      cy.contains('Dashboard').click();
      
      // Verify persona badge and data integrity
      cy.get('[data-cy=persona-badge]').should('contain', 'Jamal');
    });

    it('should maintain consistent API integration across all personas', () => {
      cy.log('=== CROSS-PERSONA: API Integration Testing ===');
      
      // Test each persona's API interactions
      const personas = ['jamal', 'aisha', 'samuel'];
      
      personas.forEach(personaKey => {
        createUserWithPersona(personaKey);
        
        // Test profile API
        cy.contains('Profile').click();
        cy.get('[data-cy=profile-form]').should('be.visible', { timeout: 10000 });
        
        // Test budget API
        cy.contains('Budget').click();
        cy.get('[data-cy=budget-form]').should('be.visible', { timeout: 10000 });
        
        // Test dashboard API
        cy.contains('Dashboard').click();
        cy.get('[data-cy=timeline-visualization]').should('be.visible', { timeout: 10000 });
        
        cy.log(`✅ ${personaKey.toUpperCase()} persona API integration verified`);
      });
    });

    it('should handle error conditions gracefully across all personas', () => {
      cy.log('=== CROSS-PERSONA: Error Handling Testing ===');
      
      createUserWithPersona('jamal');
      
      // Test network error simulation
      cy.intercept('POST', '/api/v1/onboarding/save-step', { forceNetworkError: true }).as('networkError');
      
      cy.contains('Budget').click();
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=expense-rent]').clear().type('45000');
      cy.contains('Save Budget').click();
      
      // Should handle error gracefully without breaking the UI
      cy.get('body').should('not.contain', 'undefined');
      cy.get('body').should('not.contain', 'Error: Network');
      
      // Should show user-friendly error message
      cy.contains('Unable to save').should('be.visible').or(cy.contains('Try again').should('be.visible'));
    });

    it('should maintain responsive design across all personas and devices', () => {
      cy.log('=== CROSS-PERSONA: Responsive Design Testing ===');
      
      // Test mobile viewport for each persona
      const viewports = [
        { name: 'Mobile', width: 375, height: 667 },
        { name: 'Tablet', width: 768, height: 1024 },
        { name: 'Desktop', width: 1280, height: 720 }
      ];
      
      viewports.forEach(viewport => {
        cy.viewport(viewport.width, viewport.height);
        
        createUserWithPersona('aisha');
        
        // Test dashboard responsiveness
        cy.get('[data-cy=timeline-visualization]').should('be.visible', { timeout: 10000 });
        
        // Test budget responsiveness
        cy.contains('Budget').click();
        cy.get('[data-cy=budget-header]').should('be.visible');
        
        if (viewport.name === 'Mobile') {
          // Test mobile-specific functionality
          cy.get('[data-cy=mobile-panel-toggle]').should('be.visible').click();
          cy.get('[data-cy=budget-sidebar]').should('be.visible');
        }
        
        cy.log(`✅ ${viewport.name} responsiveness verified for Aisha persona`);
      });
    });
  });

  // Performance and Edge Case Testing
  describe('Performance and Edge Case Validation', () => {
    it('should handle large financial numbers across all personas', () => {
      cy.log('=== PERFORMANCE: Large Number Handling ===');
      
      createUserWithPersona('jamal');
      cy.contains('Budget').click();
      cy.contains('Edit Budget').click();
      
      // Test extremely large numbers
      cy.get('[data-cy=goal-investments]').clear().type('9999999');
      cy.contains('Save Budget').click();
      
      // Should handle gracefully without breaking
      cy.get('body').should('not.contain', 'NaN');
      cy.get('body').should('not.contain', 'Infinity');
      
      // Verify formatting is applied correctly
      cy.get('[data-cy=goal-investments]').should('have.value', '9999999');
    });

    it('should maintain performance with complex persona calculations', () => {
      cy.log('=== PERFORMANCE: Calculation Performance ===');
      
      createUserWithPersona('samuel');
      
      // Time the dashboard load
      const startTime = Date.now();
      cy.contains('Dashboard').click();
      cy.get('[data-cy=timeline-visualization]').should('be.visible', { timeout: 10000 });
      
      cy.then(() => {
        const loadTime = Date.now() - startTime;
        expect(loadTime).to.be.lessThan(10000); // Should load within 10 seconds
      });
      
      // Test rapid navigation performance
      cy.contains('Budget').click();
      cy.contains('Profile').click();
      cy.contains('Dashboard').click();
      
      // Should remain responsive
      cy.get('[data-cy=persona-badge]').should('be.visible', { timeout: 5000 });
    });

    it('should validate data consistency across all persona contexts', () => {
      cy.log('=== VALIDATION: Data Consistency ===');
      
      createUserWithPersona('aisha');
      
      // Set budget values
      cy.contains('Budget').click();
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=goal-education]').clear().type('45000');
      cy.get('[data-cy=goal-emergency]').clear().type('30000');
      cy.contains('Save Budget').click();
      
      // Navigate to dashboard and verify consistency
      cy.contains('Dashboard').click();
      cy.get('[data-cy=alignment-score]').should('exist');
      
      // Navigate back to budget and verify persistence
      cy.contains('Budget').click();
      cy.get('[data-cy=goal-education]').should('have.value', '45000');
      cy.get('[data-cy=goal-emergency]').should('have.value', '30000');
      
      // Verify timeline reflects budget changes
      cy.contains('Dashboard').click();
      cy.contains('Education').should('be.visible').or(cy.contains('Emergency').should('be.visible'));
    });
  });
});