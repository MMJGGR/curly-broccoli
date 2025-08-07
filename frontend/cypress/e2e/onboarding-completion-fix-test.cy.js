/**
 * CRITICAL ONBOARDING COMPLETION FIX TEST
 * 
 * This test validates the systematic fixes for the onboarding system failure:
 * - Database transaction integrity for completed_steps array
 * - Network flooding prevention with proper throttling
 * - State synchronization between frontend and backend
 * - Complete onboarding flow functionality
 */

describe('Onboarding Completion System Fix Validation', () => {
  
  beforeEach(() => {
    // Clean state for each test
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Visit the application
    cy.visit('/');
    
    // Register a new user for each test
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    cy.registerUser(uniqueEmail, 'TestPassword123!');
  });

  it('should complete onboarding flow with all steps properly saved and marked complete', () => {
    // Navigate to onboarding
    cy.get('[data-testid="start-onboarding"]').click();
    
    // Step 1: Personal Information
    cy.log('📝 Completing Step 1: Personal Information');
    cy.get('[data-testid="firstName"]').type('Test');
    cy.get('[data-testid="lastName"]').type('User');
    cy.get('[data-testid="dateOfBirth"]').type('1990-01-01');
    cy.get('[data-testid="phone"]').type('+254712345678');
    cy.get('[data-testid="employmentStatus"]').select('Employed');
    
    // Save Step 1 explicitly
    cy.get('[data-testid="save-step-1"]').click();
    cy.wait(2000); // Allow save to complete
    
    // Verify Step 1 is marked as saved
    cy.get('[data-testid="step-1-status"]').should('contain', 'saved');
    
    // Proceed to Step 2
    cy.get('[data-testid="next-step"]').click();
    
    // Step 2: Risk Assessment
    cy.log('📝 Completing Step 2: Risk Assessment');
    
    // Answer all 5 questionnaire questions
    for (let i = 1; i <= 5; i++) {
      cy.get(`[data-testid="risk-question-${i}"]`).find('input[value="3"]').check();
    }
    
    // Save Step 2 explicitly
    cy.get('[data-testid="save-step-2"]').click();
    cy.wait(2000); // Allow save to complete
    
    // Verify Step 2 is marked as saved
    cy.get('[data-testid="step-2-status"]').should('contain', 'saved');
    
    // Proceed to Step 3
    cy.get('[data-testid="next-step"]').click();
    
    // Step 3: Financial Information
    cy.log('📝 Completing Step 3: Financial Information');
    cy.get('[data-testid="monthlyIncome"]').type('50000');
    cy.get('[data-testid="rent"]').type('15000');
    cy.get('[data-testid="utilities"]').type('3000');
    cy.get('[data-testid="groceries"]').type('8000');
    cy.get('[data-testid="transport"]').type('5000');
    
    // Save Step 3 explicitly
    cy.get('[data-testid="save-step-3"]').click();
    cy.wait(2000); // Allow save to complete
    
    // Verify Step 3 is marked as saved
    cy.get('[data-testid="step-3-status"]').should('contain', 'saved');
    
    // Proceed to Step 4
    cy.get('[data-testid="next-step"]').click();
    
    // Step 4: Goals (Optional but let's add some data)
    cy.log('📝 Completing Step 4: Goals');
    cy.get('[data-testid="emergencyFund"]').type('100000');
    cy.get('[data-testid="homeDownPayment"]').type('500000');
    
    // Save Step 4 explicitly
    cy.get('[data-testid="save-step-4"]').click();
    cy.wait(2000); // Allow save to complete
    
    // Now attempt to complete onboarding
    cy.log('🎯 Attempting to complete onboarding...');
    cy.get('[data-testid="complete-onboarding"]').click();
    
    // CRITICAL: Verify completion succeeds
    cy.get('[data-testid="onboarding-success"]', { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Onboarding completed successfully');
    
    // Verify we're redirected to dashboard
    cy.url().should('include', '/dashboard');
    
    // Verify profile data exists
    cy.get('[data-testid="profile-info"]').should('be.visible');
    cy.get('[data-testid="user-name"]').should('contain', 'Test User');
  });

  it('should handle network interruptions during save operations gracefully', () => {
    // Navigate to onboarding
    cy.get('[data-testid="start-onboarding"]').click();
    
    // Complete Step 1
    cy.get('[data-testid="firstName"]').type('Network');
    cy.get('[data-testid="lastName"]').type('Test');
    cy.get('[data-testid="dateOfBirth"]').type('1990-01-01');
    cy.get('[data-testid="phone"]').type('+254712345678');
    
    // Simulate network interruption by intercepting the save request
    cy.intercept('POST', '**/api/v1/onboarding/save-step', {
      statusCode: 500,
      body: { detail: 'Network error' }
    }).as('failedSave');
    
    // Attempt to save - should fail gracefully
    cy.get('[data-testid="save-step-1"]').click();
    cy.wait('@failedSave');
    
    // Verify error handling
    cy.get('[data-testid="step-1-status"]').should('contain', 'error');
    
    // Restore network and retry
    cy.intercept('POST', '**/api/v1/onboarding/save-step', {
      statusCode: 200,
      body: {
        success: true,
        current_step: 1,
        completed_steps: [1],
        is_complete: false
      }
    }).as('successfulSave');
    
    // Retry save - should succeed
    cy.get('[data-testid="save-step-1"]').click();
    cy.wait('@successfulSave');
    
    // Verify recovery
    cy.get('[data-testid="step-1-status"]').should('contain', 'saved');
  });

  it('should properly sync completed_steps array between frontend and backend', () => {
    // Navigate to onboarding
    cy.get('[data-testid="start-onboarding"]').click();
    
    // Mock backend responses to verify state synchronization
    cy.intercept('POST', '**/api/v1/onboarding/save-step', (req) => {
      const stepNumber = req.body.step_number;
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          current_step: stepNumber,
          completed_steps: [1, 2, 3].slice(0, stepNumber), // Progressive completion
          is_complete: stepNumber >= 4
        }
      });
    }).as('saveStep');
    
    // Complete and save steps sequentially
    const steps = [
      { step: 1, fields: [['firstName', 'Sync'], ['lastName', 'Test'], ['dateOfBirth', '1990-01-01'], ['phone', '+254712345678']] },
      { step: 2, action: () => {
        for (let i = 1; i <= 5; i++) {
          cy.get(`[data-testid="risk-question-${i}"]`).find('input[value="3"]').check();
        }
      }},
      { step: 3, fields: [['monthlyIncome', '50000']] }
    ];
    
    steps.forEach(({ step, fields, action }) => {
      cy.log(`📝 Testing Step ${step} state synchronization`);
      
      if (fields) {
        fields.forEach(([field, value]) => {
          cy.get(`[data-testid="${field}"]`).type(value);
        });
      }
      
      if (action) {
        action();
      }
      
      // Save the step
      cy.get(`[data-testid="save-step-${step}"]`).click();
      cy.wait('@saveStep');
      
      // Verify completed_steps state is synchronized
      cy.window().its('__onboardingState.completedSteps').should('include', step);
      
      if (step < 3) {
        cy.get('[data-testid="next-step"]').click();
      }
    });
    
    // Verify final state before completion
    cy.window().its('__onboardingState.completedSteps').should('deep.equal', [1, 2, 3]);
    
    // Complete onboarding
    cy.get('[data-testid="complete-onboarding"]').click();
    
    // Verify successful completion
    cy.get('[data-testid="onboarding-success"]', { timeout: 10000 }).should('be.visible');
  });

  it('should prevent auto-save network flooding with proper throttling', () => {
    // Track network requests
    let saveRequestCount = 0;
    
    cy.intercept('POST', '**/api/v1/onboarding/save-step', (req) => {
      saveRequestCount++;
      req.reply({
        statusCode: 200,
        body: {
          success: true,
          current_step: req.body.step_number,
          completed_steps: [req.body.step_number],
          is_complete: false
        }
      });
    }).as('autoSave');
    
    // Navigate to onboarding
    cy.get('[data-testid="start-onboarding"]').click();
    
    // Type rapidly to potentially trigger multiple auto-saves
    cy.get('[data-testid="firstName"]').type('AutoSave', { delay: 100 });
    cy.get('[data-testid="lastName"]').type('ThrottleTest', { delay: 100 });
    cy.get('[data-testid="phone"]').type('+254712345678', { delay: 100 });
    
    // Wait for potential auto-save window (30 seconds)
    cy.wait(35000);
    
    // Verify auto-save was throttled (should be at most 1 request due to 30-second minimum interval)
    cy.then(() => {
      expect(saveRequestCount).to.be.at.most(1);
    });
  });

  it('should maintain data persistence after page refresh', () => {
    // Navigate to onboarding and complete Step 1
    cy.get('[data-testid="start-onboarding"]').click();
    
    cy.get('[data-testid="firstName"]').type('Persistence');
    cy.get('[data-testid="lastName"]').type('Test');
    cy.get('[data-testid="dateOfBirth"]').type('1990-01-01');
    cy.get('[data-testid="phone"]').type('+254712345678');
    
    // Save Step 1
    cy.get('[data-testid="save-step-1"]').click();
    cy.wait(2000);
    
    // Refresh the page
    cy.reload();
    
    // Verify onboarding state is restored
    cy.get('[data-testid="firstName"]').should('have.value', 'Persistence');
    cy.get('[data-testid="lastName"]').should('have.value', 'Test');
    cy.get('[data-testid="dateOfBirth"]').should('have.value', '1990-01-01');
    cy.get('[data-testid="phone"]').should('have.value', '+254712345678');
    
    // Verify step completion status is maintained
    cy.get('[data-testid="step-1-status"]').should('contain', 'saved');
    
    // Verify we can continue from where we left off
    cy.get('[data-testid="next-step"]').should('be.enabled');
  });

});