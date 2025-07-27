describe('Simple Risk Score Test', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.hideWebpackOverlay();
  });

  it('should test risk score calculation directly without NaN', () => {
    // Visit the risk questionnaire page directly to test calculation
    cy.visit('/risk-questionnaire');
    
    // If redirected to auth, login with existing persona
    cy.url().then((url) => {
      if (url.includes('/auth')) {
        cy.log('Redirected to auth - logging in with Jamal');
        cy.get('input[id="email"]').type('jamal@example.com');
        cy.get('input[id="password"]').type('jamal123');
        cy.get('button[type="submit"]').click();
        
        // Navigate through onboarding to risk questionnaire if needed
        cy.url().then((newUrl) => {
          if (newUrl.includes('/onboarding/personal-details')) {
            cy.log('Completing personal details to reach risk questionnaire');
            cy.get('input[id="firstName"]').type('Jamal');
            cy.get('input[id="lastName"]').type('Mwangi');
            cy.get('input[id="dob"]').type('1997-03-15');
            cy.get('input[id="nationalId"]').type('32456789');
            cy.get('button[type="submit"]').click();
          }
        });
      }
    });
    
    // Should now be on risk questionnaire page
    cy.url().should('include', '/risk-questionnaire');
    
    // Fill risk questionnaire with test values
    cy.get('input[name="q1"][value="Capital appreciation"]').check();
    cy.get('input[name="q2"][value="3-5 years"]').check();
    cy.get('input[name="q3"][value="Hold investments"]').check();
    cy.get('input[name="q4"][value="Good"]').check();
    cy.get('input[name="q5"][value="10-25%"]').check();
    
    // Submit and verify no NaN errors
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    // Wait for calculation
    cy.get('body', { timeout: 5000 }).should('contain', 'Calculating risk score');
    
    // Check for NaN errors
    cy.get('body', { timeout: 10000 }).then(($body) => {
      const bodyText = $body.text();
      
      // Verify no NaN errors
      expect(bodyText).to.not.contain('NaN');
      cy.log('✅ No NaN errors found in risk calculation');
      
      // Check if risk score is visible
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
      
      // Verify risk level assignment
      const hasRiskLevel = bodyText.includes('Low') || bodyText.includes('Medium') || bodyText.includes('High');
      expect(hasRiskLevel).to.be.true;
      cy.log('✅ Risk level assigned correctly');
    });
  });
});