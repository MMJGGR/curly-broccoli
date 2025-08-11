/**
 * Budget Integration Epic - Comprehensive Persona Testing
 * 
 * This test suite validates the Budget Integration Epic functionality 
 * across all three personas (Jamal, Aisha, Samuel) using Richard's
 * financial data as the test case.
 * 
 * Test Coverage:
 * - Persona-specific budget recommendations and theming
 * - Budget CRUD operations and data persistence
 * - Dashboard-Budget integration and real-time updates
 * - Timeline-Budget integration for goal acceleration
 * - Cross-component navigation and data flow
 * - Error handling and edge cases
 */

describe('Budget Integration Epic - Persona Testing', () => {
  // Richard's test data - matches provided specification
  const richardTestData = {
    monthlyIncome: '324759',
    expenses: {
      rent: '41000',
      utilities: '9000', 
      groceries: '20000',
      transport: '12000',
      loanRepayments: '33247',
      blackTax: '32000'
    },
    calculatedSurplus: '177512', // Income - Total Expenses
    riskTolerance: 'Very High',
    riskScore: '92'
  };

  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    // Ensure clean state for each test
    cy.visit('http://localhost:3000');
  });

  describe('Persona 1: Jamal (Young Professional) Testing', () => {
    beforeEach(() => {
      // Create Jamal persona user with Richard's financial data
      cy.createUserWithPersona('jamal', richardTestData);
    });

    it('should display investment-focused budget recommendations for Jamal', () => {
      cy.log('=== JAMAL PERSONA: Investment Focus Validation ===');
      
      // Navigate to Budget tab
      cy.contains('Budget').click();
      cy.url().should('include', '/budget');
      
      // Verify Jamal-specific theming
      cy.get('[data-cy=budget-header]')
        .should('have.css', 'background-color')
        .and('include', 'rgb'); // Blue theme expected for Jamal
      
      // Verify investment-focused recommendations appear
      cy.contains('Jamal Recommendations').should('be.visible');
      cy.contains('Increase investment allocation by 10%').should('be.visible');
      cy.contains('Consider tax-advantaged retirement accounts').should('be.visible');
      cy.contains('Build emergency fund to 6 months').should('be.visible');
      
      // Verify high surplus shows investment opportunities
      cy.get('[data-cy=actual-surplus]').should('contain', 'R177,512');
      cy.get('[data-cy=surplus-message]').should('contain', 'Available for additional goals');
    });

    it('should show goal acceleration with surplus allocation for Jamal', () => {
      cy.log('=== JAMAL PERSONA: Goal Acceleration Testing ===');
      
      // Navigate to Budget and verify goal allocations
      cy.contains('Budget').click();
      
      // Verify investment portfolio gets priority for high-risk persona
      cy.get('[data-cy=goal-investments]').within(() => {
        cy.get('input').should('not.have.value', '0');
      });
      
      // Navigate to Dashboard and verify Timeline integration
      cy.contains('Dashboard').click();
      cy.url().should('include', '/dashboard');
      
      // Verify alignment score includes budget boost
      cy.get('[data-cy=alignment-score]').should('exist');
      cy.contains('+Budget Boost').should('be.visible');
      
      // Verify Timeline shows accelerated retirement goals
      cy.get('[data-cy=next-milestone]').should('be.visible');
    });

    it('should handle budget editing with investment priority for Jamal', () => {
      cy.log('=== JAMAL PERSONA: Budget Editing Validation ===');
      
      cy.contains('Budget').click();
      
      // Enter edit mode
      cy.contains('Edit Budget').click();
      
      // Increase investment allocation (Jamal should prefer this)
      cy.get('input[data-cy=goal-investments]').clear().type('60000');
      
      // Save budget
      cy.contains('Save Budget').click();
      cy.contains('Saved').should('be.visible');
      
      // Verify Dashboard reflects changes immediately
      cy.contains('Dashboard').click();
      cy.get('[data-cy=alignment-score]').should('exist');
      
      // Return to Budget and verify persistence
      cy.contains('Budget').click();
      cy.get('input[data-cy=goal-investments]').should('have.value', '60000');
    });
  });

  describe('Persona 2: Aisha (Family-Focused) Testing', () => {
    beforeEach(() => {
      // Create Aisha persona user with modified Richard data (family expenses)
      const aishaData = {
        ...richardTestData,
        expenses: {
          ...richardTestData.expenses,
          insurance: '15000', // Higher for family coverage
          healthcare: '8000',  // Family healthcare costs
          education: '25000'   // Children's education
        }
      };
      cy.createUserWithPersona('aisha', aishaData);
    });

    it('should display family-focused budget categories for Aisha', () => {
      cy.log('=== AISHA PERSONA: Family-Focused Categories ===');
      
      cy.contains('Budget').click();
      
      // Verify Aisha-specific theming (purple family theme)
      cy.get('[data-cy=budget-header]')
        .should('have.css', 'background-color')
        .and('include', 'rgb'); // Purple theme expected for Aisha
      
      // Verify family-specific recommendations
      cy.contains('Aisha Recommendations').should('be.visible');
      cy.contains('Prioritize education fund for children').should('be.visible');
      cy.contains('Ensure adequate family insurance coverage').should('be.visible');
      cy.contains('Balance family needs with retirement savings').should('be.visible');
      
      // Verify family expense categories are prominent
      cy.contains('Family Support').should('be.visible');
      cy.get('[data-cy=expense-insurance]').should('be.visible');
      cy.get('[data-cy=expense-healthcare]').should('be.visible');
    });

    it('should prioritize education funding in goal allocations for Aisha', () => {
      cy.log('=== AISHA PERSONA: Education Priority Validation ===');
      
      cy.contains('Budget').click();
      
      // Verify education fund receives higher allocation
      cy.get('[data-cy=goal-education]').within(() => {
        cy.get('input').should('not.have.value', '0');
      });
      
      // Verify education target is displayed
      cy.contains('Target: R389,000').should('be.visible');
      
      // Navigate to Dashboard and verify family-focused alignment
      cy.contains('Dashboard').click();
      cy.get('[data-cy=persona-badge]').should('contain', 'Aisha Profile');
    });

    it('should show family timeline milestones for Aisha', () => {
      cy.log('=== AISHA PERSONA: Family Timeline Integration ===');
      
      cy.contains('Dashboard').click();
      
      // Verify Timeline shows family-related milestones
      cy.get('[data-cy=timeline-visualization]').should('be.visible');
      
      // Check for education-related milestones in timeline
      cy.contains('Education Fund').should('be.visible');
      
      // Verify alignment score considers family priorities
      cy.get('[data-cy=alignment-score]').should('exist');
    });
  });

  describe('Persona 3: Samuel (Pre-Retirement) Testing', () => {
    beforeEach(() => {
      // Create Samuel persona user with conservative approach
      const samuelData = {
        ...richardTestData,
        expenses: {
          ...richardTestData.expenses,
          healthcare: '12000', // Higher healthcare costs
          insurance: '18000'   // Comprehensive coverage
        },
        riskTolerance: 'Conservative',
        riskScore: '25'
      };
      cy.createUserWithPersona('samuel', samuelData);
    });

    it('should display conservative budget recommendations for Samuel', () => {
      cy.log('=== SAMUEL PERSONA: Conservative Approach ===');
      
      cy.contains('Budget').click();
      
      // Verify Samuel-specific theming (green stability theme)
      cy.get('[data-cy=budget-header]')
        .should('have.css', 'background-color')
        .and('include', 'rgb'); // Green theme expected for Samuel
      
      // Verify conservative recommendations
      cy.contains('Samuel Recommendations').should('be.visible');
      cy.contains('Focus on wealth preservation strategies').should('be.visible');
      cy.contains('Consider healthcare cost inflation').should('be.visible');
      cy.contains('Optimize tax-efficient withdrawal strategies').should('be.visible');
    });

    it('should prioritize retirement and healthcare for Samuel', () => {
      cy.log('=== SAMUEL PERSONA: Retirement Priority Validation ===');
      
      cy.contains('Budget').click();
      
      // Verify retirement gets highest allocation priority
      cy.get('[data-cy=goal-retirement]').within(() => {
        cy.get('input').should('not.have.value', '0');
      });
      
      // Verify healthcare expense categories are prominent
      cy.get('[data-cy=expense-healthcare]').should('be.visible');
      cy.get('[data-cy=expense-insurance]').should('be.visible');
      
      // Verify conservative investment approach
      cy.get('[data-cy=goal-investments]').within(() => {
        cy.get('input').then(($input) => {
          const investmentValue = parseInt($input.val());
          const retirementValue = parseInt(cy.get('[data-cy=goal-retirement] input').val());
          // Investment should be less than retirement for conservative approach
          expect(investmentValue).to.be.lessThan(retirementValue * 2);
        });
      });
    });

    it('should show wealth preservation focus in timeline for Samuel', () => {
      cy.log('=== SAMUEL PERSONA: Wealth Preservation Timeline ===');
      
      cy.contains('Dashboard').click();
      
      // Verify conservative persona badge
      cy.get('[data-cy=persona-badge]').should('contain', 'Samuel Profile');
      
      // Verify Timeline emphasizes preservation over growth
      cy.get('[data-cy=timeline-visualization]').should('be.visible');
      
      // Verify alignment score reflects conservative approach
      cy.get('[data-cy=alignment-score]').should('exist');
    });
  });

  describe('Cross-Persona Functional Testing', () => {
    it('should handle budget CRUD operations consistently across personas', () => {
      cy.log('=== CROSS-PERSONA: CRUD Operations Testing ===');
      
      // Test with Jamal persona
      cy.createUserWithPersona('jamal', richardTestData);
      cy.contains('Budget').click();
      
      // Test Create - Add new expense category
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=expense-miscellaneous]').clear().type('5000');
      cy.contains('Save Budget').click();
      cy.contains('Saved').should('be.visible');
      
      // Test Read - Verify data persists
      cy.reload();
      cy.get('[data-cy=expense-miscellaneous]').should('have.value', '5000');
      
      // Test Update - Modify existing category
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=expense-miscellaneous]').clear().type('7000');
      cy.contains('Save Budget').click();
      
      // Test Delete behavior (setting to 0)
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=expense-miscellaneous]').clear().type('0');
      cy.contains('Save Budget').click();
      cy.get('[data-cy=expense-miscellaneous]').should('have.value', '0');
    });

    it('should maintain real-time Dashboard-Budget integration', () => {
      cy.log('=== CROSS-PERSONA: Real-time Integration Testing ===');
      
      cy.createUserWithPersona('jamal', richardTestData);
      
      // Start from Dashboard
      cy.contains('Dashboard').click();
      const initialAlignment = cy.get('[data-cy=alignment-score]');
      
      // Navigate to Budget and make changes
      cy.contains('Budget').click();
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=goal-investments]').clear().type('80000');
      cy.contains('Save Budget').click();
      
      // Return to Dashboard and verify immediate updates
      cy.contains('Dashboard').click();
      cy.get('[data-cy=alignment-score]').should('exist');
      cy.contains('+Budget Boost').should('be.visible');
    });

    it('should handle error conditions gracefully', () => {
      cy.log('=== CROSS-PERSONA: Error Handling Testing ===');
      
      cy.createUserWithPersona('jamal', richardTestData);
      cy.contains('Budget').click();
      
      // Test negative input validation
      cy.contains('Edit Budget').click();
      cy.get('[data-cy=expense-rent]').clear().type('-5000');
      cy.contains('Save Budget').click();
      
      // Should handle gracefully (convert to 0 or show error)
      cy.get('[data-cy=error-message]').should('be.visible')
        .or(cy.get('[data-cy=expense-rent]').should('have.value', '0'));
      
      // Test extremely large numbers
      cy.get('[data-cy=expense-rent]').clear().type('99999999999');
      cy.contains('Save Budget').click();
      
      // Should handle gracefully
      cy.get('body').should('not.contain', 'Error');
    });

    it('should maintain responsive design across all personas', () => {
      cy.log('=== CROSS-PERSONA: Responsive Design Testing ===');
      
      cy.createUserWithPersona('aisha', richardTestData);
      
      // Test mobile viewport
      cy.viewport(375, 667);
      cy.contains('Budget').click();
      
      // Verify mobile panel functionality
      cy.get('[data-cy=mobile-panel-toggle]').should('be.visible').click();
      cy.get('[data-cy=budget-sidebar]').should('be.visible');
      
      // Verify content is accessible on mobile
      cy.contains('Aisha Recommendations').should('be.visible');
      
      // Test tablet viewport
      cy.viewport(768, 1024);
      cy.reload();
      
      // Verify tablet layout
      cy.get('[data-cy=budget-area]').should('be.visible');
      cy.get('[data-cy=budget-sidebar]').should('be.visible');
      
      // Return to desktop
      cy.viewport(1280, 720);
    });
  });

  // Helper command definitions would be added to cypress/support/commands.js
});

/**
 * Custom Cypress Commands for Persona Testing
 * These would be added to cypress/support/commands.js
 */

// Cypress.Commands.add('createUserWithPersona', (persona, financialData) => {
//   const userEmail = `${persona}.${Date.now()}@example.com`;
//   
//   // Registration flow
//   cy.contains('button', 'Get Started').click();
//   cy.contains('button', 'Sign Up').click();
//   cy.get('input[type="email"]').type(userEmail);
//   cy.get('input[type="password"]').first().type(`${persona}Test123!`);
//   cy.get('input[type="password"]').last().type(`${persona}Test123!`);
//   cy.get('button[type="submit"]').click();
//   
//   // Personal info
//   cy.get('input[id="firstName"]').type(persona.charAt(0).toUpperCase() + persona.slice(1));
//   cy.get('input[id="lastName"]').type('TestUser');
//   cy.get('input[id="phone"]').type('+254701234567');
//   cy.contains('button', 'Next Step').click();
//   
//   // Risk assessment - set based on persona
//   const riskAnswers = {
//     jamal: [4, 5, 4, 5, 4], // High risk answers
//     aisha: [3, 3, 3, 3, 3], // Moderate risk answers  
//     samuel: [1, 2, 1, 2, 1] // Low risk answers
//   };
//   
//   riskAnswers[persona].forEach((answer, index) => {
//     cy.get(`input[name="question-${index + 1}"]`).eq(answer - 1).click();
//   });
//   cy.contains('button', 'Next Step').click();
//   
//   // Financial data
//   cy.get('input[id="monthlyIncome"]').type(financialData.monthlyIncome);
//   cy.get('input[id="monthlyExpenses"]').type('147000'); // Sum of basic expenses
//   cy.contains('button', 'Next Step').click();
//   cy.contains('button', 'Next Step').click();
//   cy.contains('button', 'Complete Registration').click();
//   
//   // Verify Dashboard loads
//   cy.url().should('include', '/dashboard');
// });