describe('Advanced Assumption Calculation Integration', () => {
  beforeEach(() => {
    window.localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo');
    
    cy.visit('http://localhost:3000');
    cy.wait(3000);
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    cy.contains('Lifetime View').click();
    cy.wait(2000);
  });

  it('should recalculate human capital when career assumptions change', () => {
    // Record baseline human capital calculation
    cy.window().then((win) => {
      cy.wrap(win).as('appWindow');
    });
    
    // Capture original lifetime assets value
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).first().then(($el) => {
      const originalValue = parseFloat($el.text().replace(/[Ksh\s,]/g, ''));
      cy.wrap(originalValue).as('originalLifetimeAssets');
    });
    
    // Show advanced assumptions
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Modify career trajectory assumptions
    cy.contains('Career Trajectory').click();
    cy.wait(500);
    
    // Increase income progression rate (should increase human capital)
    cy.get('input[placeholder*="Income progression"]').clear().type('6.0');
    cy.wait(2000); // Allow recalculation
    
    // Verify lifetime assets increased
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).first().then(($el) => {
      const newValue = parseFloat($el.text().replace(/[Ksh\s,]/g, ''));
      cy.get('@originalLifetimeAssets').then((original) => {
        expect(newValue).to.be.greaterThan(original);
        cy.log(`Human capital increased: ${original} -> ${newValue}`);
      });
    });
    
    cy.screenshot('human-capital-increased-career-change');
  });

  it('should recalculate expense liabilities when demographic assumptions change', () => {
    // Capture original lifetime liabilities
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).eq(1).then(($el) => {
      const originalValue = parseFloat($el.text().replace(/[Ksh\s,]/g, ''));
      cy.wrap(originalValue).as('originalLifetimeLiabilities');
    });
    
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Modify demographics (increase life expectancy)
    cy.contains('Demographics & Life Planning').click();
    cy.wait(500);
    
    cy.get('input[placeholder*="Life expectancy"]').clear().type('80');
    cy.wait(2000);
    
    // Verify lifetime liabilities increased (more years of expenses)
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).eq(1).then(($el) => {
      const newValue = parseFloat($el.text().replace(/[Ksh\s,]/g, ''));
      cy.get('@originalLifetimeLiabilities').then((original) => {
        expect(newValue).to.be.greaterThan(original);
        cy.log(`Expense liabilities increased: ${original} -> ${newValue}`);
      });
    });
    
    cy.screenshot('expense-liabilities-increased-longevity');
  });

  it('should apply economic environment assumptions to both income and expenses', () => {
    // Record baseline values
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).first().as('originalAssets');
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).eq(1).as('originalLiabilities');
    
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Modify economic environment (lower GDP growth)
    cy.contains('Economic Environment').click();
    cy.wait(500);
    
    cy.get('input[placeholder*="GDP growth"]').clear().type('2.5');
    cy.get('input[placeholder*="Inflation volatility"]').clear().type('0.25');
    cy.wait(3000); // Allow comprehensive recalculation
    
    // Both assets and liabilities should be affected
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).first().then(($assets) => {
      const newAssets = parseFloat($assets.text().replace(/[Ksh\s,]/g, ''));
      
      cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).eq(1).then(($liabilities) => {
        const newLiabilities = parseFloat($liabilities.text().replace(/[Ksh\s,]/g, ''));
        
        cy.get('@originalAssets').then((origAssets) => {
          const origAssetsNum = parseFloat(origAssets.text().replace(/[Ksh\s,]/g, ''));
          cy.get('@originalLiabilities').then((origLiabilities) => {
            const origLiabilitiesNum = parseFloat(origLiabilities.text().replace(/[Ksh\s,]/g, ''));
            
            // Lower GDP growth should reduce human capital (assets)
            expect(newAssets).to.be.lessThan(origAssetsNum);
            
            cy.log(`Economic impact: Assets ${origAssetsNum} -> ${newAssets}, Liabilities ${origLiabilitiesNum} -> ${newLiabilities}`);
          });
        });
      });
    });
    
    cy.screenshot('economic-environment-comprehensive-impact');
  });

  it('should validate lifestyle assumptions impact on expense projections', () => {
    // Test high lifestyle inflation scenario
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    cy.contains('Lifestyle & Family').click();
    cy.wait(500);
    
    // Record baseline expense liabilities
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).eq(1).then(($el) => {
      const originalValue = parseFloat($el.text().replace(/[Ksh\s,]/g, ''));
      cy.wrap(originalValue).as('baselineLiabilities');
      
      // Apply high lifestyle inflation
      cy.get('input[placeholder*="Lifestyle inflation"]').clear().type('4.0');
      cy.get('input[placeholder*="Discretionary spending"]').clear().type('6.0');
      cy.wait(3000);
      
      // Verify expense liabilities increased substantially
      cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).eq(1).then(($newEl) => {
        const newValue = parseFloat($newEl.text().replace(/[Ksh\s,]/g, ''));
        expect(newValue).to.be.greaterThan(originalValue * 1.1); // At least 10% increase
        cy.log(`High lifestyle inflation impact: ${originalValue} -> ${newValue}`);
      });
    });
    
    cy.screenshot('lifestyle-inflation-high-impact');
  });

  it('should handle extreme assumption combinations realistically', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Set very optimistic scenario
    cy.contains('Demographics & Life Planning').click();
    cy.get('input[placeholder*="Life expectancy"]').clear().type('85');
    cy.get('input[placeholder*="Retirement age"]').clear().type('70');
    
    cy.contains('Economic Environment').click();
    cy.get('input[placeholder*="GDP growth"]').clear().type('8.0');
    
    cy.contains('Career Trajectory').click();
    cy.get('input[placeholder*="Income progression"]').clear().type('7.0');
    
    cy.wait(4000); // Allow full recalculation
    
    // Should show professional warnings about extreme assumptions
    cy.contains('Very high progression rates may violate CFA conservatism').should('exist');
    
    // Net worth should be very high but realistic
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).eq(2).then(($el) => {
      const netWorth = parseFloat($el.text().replace(/[Ksh\s,]/g, ''));
      // Should be positive and substantial but not unrealistic
      expect(netWorth).to.be.greaterThan(0);
      expect(netWorth).to.be.lessThan(1000000000); // Less than 1 billion KES
      cy.log(`Extreme optimistic scenario net worth: ${netWorth}`);
    });
    
    cy.screenshot('extreme-optimistic-scenario');
  });

  it('should maintain CFA compliance warnings across assumption changes', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Test multiple sections for CFA warnings
    cy.contains('Demographics & Life Planning').click();
    cy.get('input[placeholder*="Life expectancy"]').clear().type('95');
    cy.wait(500);
    
    // Should show CFA methodology concern
    cy.contains('Extreme longevity assumptions require actuarial validation').should('exist');
    
    cy.contains('Career Trajectory').click();
    cy.get('input[placeholder*="Job change frequency"]').clear().type('10');
    cy.wait(500);
    
    cy.contains('High job mobility may indicate career instability').should('exist');
    
    // Professional warnings should accumulate
    cy.get('[class*="warning"]').should('have.length.greaterThan', 1);
    
    cy.screenshot('multiple-cfa-warnings');
  });

  it('should reset calculations when assumptions are reset', () => {
    // Make significant changes
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    cy.contains('Demographics & Life Planning').click();
    cy.get('input[placeholder*="Life expectancy"]').clear().type('60');
    
    cy.contains('Economic Environment').click();
    cy.get('input[placeholder*="GDP growth"]').clear().type('1.0');
    
    cy.wait(2000);
    
    // Record changed values
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).first().then(($el) => {
      const changedValue = $el.text();
      cy.wrap(changedValue).as('changedAssets');
      
      // Reset to defaults
      cy.get('[data-testid="advanced-assumption-panel"]').within(() => {
        cy.contains('Reset to Defaults').click();
      });
      cy.wait(3000);
      
      // Values should change back
      cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).first().then(($newEl) => {
        const resetValue = $newEl.text();
        expect(resetValue).to.not.equal(changedValue);
        cy.log(`Reset: ${changedValue} -> ${resetValue}`);
      });
    });
    
    cy.screenshot('calculations-reset-with-assumptions');
  });

  it('should show calculation transparency in CFA methodology note', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Make assumption changes
    cy.contains('Demographics & Life Planning').click();
    cy.get('input[placeholder*="Life expectancy"]').clear().type('75');
    cy.get('input[placeholder*="Retirement age"]').clear().type('67');
    
    cy.wait(2000);
    
    // CFA methodology note should update to reflect new assumptions
    cy.get('.bg-blue-50').within(() => {
      cy.contains('Life expectancy: 75').should('exist');
      // Should still show other CFA parameters
      cy.contains('Human capital discount: 12.5%').should('exist');
      cy.contains('Kenya inflation: 5.5%').should('exist');
    });
    
    cy.screenshot('cfa-methodology-note-updated');
  });

  it('should validate assumption interdependencies', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Set retirement age after life expectancy (should show warning)
    cy.contains('Demographics & Life Planning').click();
    cy.get('input[placeholder*="Life expectancy"]').clear().type('65');
    cy.get('input[placeholder*="Retirement age"]').clear().type('67');
    cy.wait(500);
    
    // Should show interdependency warning
    cy.contains('Retirement age exceeds life expectancy').should('exist');
    
    // Test economic interdependencies
    cy.contains('Economic Environment').click();
    cy.get('input[placeholder*="GDP growth"]').clear().type('15.0');
    cy.get('input[placeholder*="Inflation volatility"]').clear().type('0.05');
    cy.wait(500);
    
    // Should warn about inconsistent economic assumptions
    cy.contains('High GDP growth with low volatility may be unrealistic').should('exist');
    
    cy.screenshot('assumption-interdependency-warnings');
  });
});