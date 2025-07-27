describe('Risk Questionnaire Smoke Test', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.hideWebpackOverlay();
  });

  it('should calculate risk score without NaN error', () => {
    const testEmail = `smoketest${Date.now()}@example.com`;
    const testPassword = 'test123';
    
    // Create a new user to test full onboarding flow
    cy.visit('/auth');
    
    // Register new user
    cy.get('button').contains('Create Account').click();
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    // Should redirect to onboarding
    cy.url().should('include', '/onboarding/personal-details');
    
    // Fill personal details
    cy.get('input[id="firstName"]').type('Test');
    cy.get('input[id="lastName"]').type('User');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="nationalId"]').type('12345678');
    cy.get('button[type="submit"]').click();
    
    // Should navigate to risk questionnaire
    cy.url().should('include', '/risk-questionnaire');
    
    // Fill risk questionnaire - select moderate options (3rd option for each)
    cy.get('input[name="q1"][value="Capital appreciation"]').check();
    cy.get('input[name="q2"][value="3-5 years"]').check();
    cy.get('input[name="q3"][value="Hold investments"]').check();
    cy.get('input[name="q4"][value="Good"]').check();
    cy.get('input[name="q5"][value="10-25%"]').check();
    
    // Submit risk questionnaire
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    // Wait for risk score calculation
    cy.get('body', { timeout: 5000 }).should('contain', 'Calculating risk score');
    
    // Check that risk score is calculated without NaN
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const bodyText = $body.text();
      
      // Verify risk score is not NaN
      expect(bodyText).to.not.contain('NaN');
      
      // Verify risk score is a number
      if (bodyText.includes('Your risk score is')) {
        const scoreMatch = bodyText.match(/Your risk score is (\d+)/);
        if (scoreMatch) {
          const riskScore = parseInt(scoreMatch[1]);
          expect(riskScore).to.be.a('number');
          expect(riskScore).to.be.greaterThan(0);
          expect(riskScore).to.be.lessThan(101);
          cy.log(`✅ Risk score calculated successfully: ${riskScore}%`);
        }
      }
      
      // Verify risk level is assigned
      const hasRiskLevel = bodyText.includes('Low') || bodyText.includes('Medium') || bodyText.includes('High');
      expect(hasRiskLevel).to.be.true;
    });
    
    cy.log('✅ Risk questionnaire smoke test passed - no NaN errors');
  });

  it('should handle all risk questionnaire options correctly', () => {
    const testEmail = `risktest${Date.now()}@example.com`;
    const testPassword = 'test123';
    
    // Test with conservative options (1st option for each)
    cy.visit('/auth');
    
    cy.get('button').contains('Create Account').click();
    cy.get('input[id="email"]').type(testEmail);
    cy.get('input[id="password"]').type(testPassword);
    cy.get('input[id="confirmPassword"]').type(testPassword);
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/onboarding/personal-details');
    
    cy.get('input[id="firstName"]').type('Conservative');
    cy.get('input[id="lastName"]').type('Tester');
    cy.get('input[id="dob"]').type('1985-06-15');
    cy.get('input[id="nationalId"]').type('87654321');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/risk-questionnaire');
    
    // Select conservative options (1st option = index 0 = risk score closer to 0)
    cy.get('input[name="q1"][value="Capital preservation"]').check();
    cy.get('input[name="q2"][value="Less than 1 year"]').check();
    cy.get('input[name="q3"][value="Sell all investments"]').check();
    cy.get('input[name="q4"][value="None"]').check();
    cy.get('input[name="q5"][value="None"]').check();
    
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    // Should calculate low risk score
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const bodyText = $body.text();
      expect(bodyText).to.not.contain('NaN');
      
      // Conservative options should result in Low risk
      expect(bodyText).to.contain('Low');
      
      cy.log('✅ Conservative risk assessment working correctly');
    });
  });
});