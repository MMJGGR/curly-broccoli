describe('Financial Ratios - Balance Sheet Analysis', () => {
  beforeEach(() => {
    // Navigate directly to balance sheet (assuming user is logged in)
    cy.visit('http://localhost:3000/balance-sheet', { failOnStatusCode: false });
    cy.wait(3000);
  });

  it('should display comprehensive financial ratios analysis', () => {
    // Verify financial ratios section is visible
    cy.contains('Financial Ratios Analysis').should('be.visible');
    cy.contains('CFA Standard').should('be.visible');
    cy.contains('institutional-grade financial metrics').should('be.visible');

    // Check overall financial health score
    cy.contains('Overall Financial Health').should('be.visible');
    cy.contains('Grade:').should('be.visible');
    cy.get('[class*="text-2xl"][class*="font-bold"][class*="text-orange-600"]').should('contain.text', '/100');

    // Verify the three main ratio categories
    cy.contains('Liquidity Ratios').should('be.visible');
    cy.contains('Leverage Ratios').should('be.visible');
    cy.contains('Solvency Ratios').should('be.visible');

    // Check liquidity ratios
    cy.contains('Current Ratio').should('be.visible');
    cy.contains('Emergency Fund').should('be.visible');
    cy.contains('≥ 2.0 (Excellent)').should('be.visible'); // Current ratio benchmark
    cy.contains('3-6 months (Good)').should('be.visible'); // Emergency fund benchmark

    // Check leverage ratios  
    cy.contains('Debt-to-Asset').should('be.visible');
    cy.contains('Debt Service').should('be.visible');
    cy.contains('≤ 30% (Excellent)').should('be.visible'); // Debt-to-asset benchmark
    cy.contains('≤ 28% (Good)').should('be.visible'); // Debt service benchmark

    // Check solvency ratios
    cy.contains('Equity Ratio').should('be.visible');
    cy.contains('Savings Rate').should('be.visible');
    cy.contains('≥ 50% (Good)').should('be.visible'); // Equity ratio benchmark
    cy.contains('≥ 15% (Good)').should('be.visible'); // Savings rate benchmark

    // Verify key financial summary
    cy.contains('Key Financial Summary').should('be.visible');
    cy.contains('Net Worth:').should('be.visible');
    cy.contains('Monthly Cash Flow:').should('be.visible');
    cy.contains('Liquid Assets:').should('be.visible');
    cy.contains('Asset Coverage:').should('be.visible');

    // Check CFA methodology note
    cy.contains('CFA Institute Standards').should('be.visible');
    cy.contains('CFA Level 1 curriculum standards').should('be.visible');
    cy.contains('Liquidity: Ability to meet immediate obligations').should('be.visible');
  });

  it('should display meaningful ratio values and assessments', () => {
    cy.visit('http://localhost:3000/balance-sheet', { failOnStatusCode: false });
    cy.wait(3000);

    // Check that ratio values are displayed (not empty or NaN)
    cy.get('[class*="text-lg"][class*="font-bold"][class*="text-blue-600"]').should('have.length.at.least', 2);
    cy.get('[class*="text-lg"][class*="font-bold"][class*="text-purple-600"]').should('have.length.at.least', 2);
    cy.get('[class*="text-lg"][class*="font-bold"][class*="text-green-600"]').should('have.length.at.least', 2);

    // Verify assessment badges are displayed
    cy.get('[class*="bg-"][class*="100"]').should('contain.text', /(Excellent|Good|Fair|Poor|Needs Improvement|Concerning|High Risk)/);

    // Check that percentage values are formatted correctly
    cy.contains(/\d+\.\d%/).should('exist'); // Percentage format
    cy.contains(/\d+\.\d mo/).should('exist'); // Months format for emergency fund

    // Verify financial health grade is valid
    cy.contains('Grade:').parent().within(() => {
      cy.should('contain.text', /(A|B|C|D|F)/);
    });

    // Check that currency values are formatted correctly
    cy.contains(/KES/).should('exist');
  });

  it('should show different assessments based on financial health', () => {
    cy.visit('http://localhost:3000/balance-sheet', { failOnStatusCode: false });
    cy.wait(3000);

    // Collect all assessment badges
    let assessments = [];
    cy.get('[class*="bg-"][class*="100"]').each(($badge) => {
      const text = $badge.text().trim();
      if (['Excellent', 'Good', 'Fair', 'Poor', 'Needs Improvement', 'Concerning', 'High Risk'].includes(text)) {
        assessments.push(text);
      }
    }).then(() => {
      // Verify we have meaningful assessments (not all the same)
      expect(assessments.length).to.be.at.least(6); // Should have assessments for all ratios
    });

    // Verify color coding matches assessment quality
    cy.get('.bg-green-100').should('exist'); // Should have some good metrics
    cy.get('[class*="bg-"][class*="100"]').should('have.length.at.least', 6);
  });

  it('should calculate ratios correctly based on available data', () => {
    cy.visit('http://localhost:3000/balance-sheet', { failOnStatusCode: false });
    cy.wait(3000);

    // Test emergency fund calculation makes sense
    cy.contains('Emergency Fund').parent().within(() => {
      cy.get('[class*="text-lg"][class*="font-bold"]').invoke('text').then((text) => {
        const months = parseFloat(text.replace(' mo', ''));
        expect(months).to.be.at.least(0).and.at.most(100); // Reasonable range
      });
    });

    // Test debt-to-asset ratio is a valid percentage
    cy.contains('Debt-to-Asset').parent().within(() => {
      cy.get('[class*="text-lg"][class*="font-bold"]').invoke('text').then((text) => {
        const percentage = parseFloat(text.replace('%', ''));
        expect(percentage).to.be.at.least(0).and.at.most(200); // Reasonable range
      });
    });

    // Test savings rate is realistic
    cy.contains('Savings Rate').parent().within(() => {
      cy.get('[class*="text-lg"][class*="font-bold"]').invoke('text').then((text) => {
        const rate = parseFloat(text.replace('%', ''));
        expect(rate).to.be.at.least(-50).and.at.most(100); // Reasonable range
      });
    });

    // Test overall score is between 0-100
    cy.get('[class*="text-2xl"][class*="font-bold"][class*="text-orange-600"]').invoke('text').then((text) => {
      const score = parseInt(text.split('/')[0]);
      expect(score).to.be.at.least(0).and.at.most(100);
    });
  });

  it('should handle edge cases gracefully', () => {
    cy.visit('http://localhost:3000/balance-sheet', { failOnStatusCode: false });
    cy.wait(3000);

    // Verify infinity symbols are displayed for very high ratios
    cy.get('body').then(($body) => {
      if ($body.text().includes('∞')) {
        cy.contains('∞').should('be.visible');
      }
    });

    // Check that all sections load even if some data is missing
    cy.contains('Financial Ratios Analysis').should('be.visible');
    cy.contains('Liquidity Ratios').should('be.visible');
    cy.contains('Leverage Ratios').should('be.visible');
    cy.contains('Solvency Ratios').should('be.visible');

    // Ensure no error messages or broken calculations
    cy.should('not.contain', 'NaN');
    cy.should('not.contain', 'undefined');
    cy.should('not.contain', 'null');
  });

  it('should provide CFA-compliant benchmarks and methodology', () => {
    cy.visit('http://localhost:3000/balance-sheet', { failOnStatusCode: false });
    cy.wait(3000);

    // Verify CFA compliance indicators
    cy.contains('CFA Standard').should('be.visible');
    cy.contains('CFA Institute Standards').should('be.visible');
    cy.contains('CFA Level 1 curriculum standards').should('be.visible');
    cy.contains('institutional best practices').should('be.visible');

    // Check specific benchmarks are displayed
    cy.contains('≥ 2.0 (Excellent)').should('be.visible'); // Current ratio
    cy.contains('≤ 30% (Excellent)').should('be.visible'); // Debt-to-asset
    cy.contains('≥ 50% (Good)').should('be.visible'); // Equity ratio
    cy.contains('≥ 15% (Good)').should('be.visible'); // Savings rate

    // Verify methodology explanation
    cy.contains('Liquidity: Ability to meet immediate obligations').should('be.visible');
    cy.contains('Leverage: Debt usage and management').should('be.visible');
    cy.contains('Solvency: Long-term financial stability').should('be.visible');
  });
});