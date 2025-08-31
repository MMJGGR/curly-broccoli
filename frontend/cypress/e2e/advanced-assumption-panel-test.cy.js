describe('Advanced Assumption Panel Tests', () => {
  beforeEach(() => {
    // Set JWT token for authenticated requests
    window.localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo');
    
    // Navigate to balance sheet lifetime view
    cy.visit('http://localhost:3000');
    cy.wait(3000);
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    cy.contains('Lifetime View').click();
    cy.wait(2000);
  });

  it('should hide advanced assumptions panel by default', () => {
    // Verify advanced panel is not visible initially
    cy.get('[data-testid="advanced-assumption-panel"]').should('not.exist');
    
    // But the "Show Advanced" button should be present
    cy.contains('Show Advanced').should('exist');
    
    cy.screenshot('advanced-panel-hidden-by-default');
  });

  it('should toggle advanced assumptions panel visibility', () => {
    // Show advanced panel
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Verify panel is now visible
    cy.get('[data-testid="advanced-assumption-panel"]').should('be.visible');
    cy.contains('Advanced Financial Planning Assumptions').should('exist');
    
    // Button text should change
    cy.contains('Hide Advanced').should('exist');
    
    cy.screenshot('advanced-panel-shown');
    
    // Hide panel again
    cy.contains('Hide Advanced').click();
    cy.wait(500);
    
    // Verify panel is hidden
    cy.get('[data-testid="advanced-assumption-panel"]').should('not.exist');
    cy.contains('Show Advanced').should('exist');
    
    cy.screenshot('advanced-panel-hidden-again');
  });

  it('should display all four assumption categories', () => {
    // Show advanced panel
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Verify all four sections are present
    cy.contains('Demographics & Life Planning').should('exist');
    cy.contains('Economic Environment').should('exist');
    cy.contains('Career Trajectory').should('exist');
    cy.contains('Lifestyle & Family').should('exist');
    
    cy.screenshot('all-assumption-categories-visible');
  });

  it('should expand and collapse assumption sections', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Test Demographics section
    cy.contains('Demographics & Life Planning').click();
    cy.wait(500);
    
    // Should show demographics inputs
    cy.get('input[placeholder*="Life expectancy"]').should('be.visible');
    cy.get('input[placeholder*="Retirement age"]').should('be.visible');
    cy.get('input[placeholder*="Health adjustment"]').should('be.visible');
    
    cy.screenshot('demographics-section-expanded');
    
    // Collapse section
    cy.contains('Demographics & Life Planning').click();
    cy.wait(500);
    
    // Demographics inputs should not be visible
    cy.get('input[placeholder*="Life expectancy"]').should('not.exist');
    
    cy.screenshot('demographics-section-collapsed');
  });

  it('should validate assumption inputs with professional warnings', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Expand Demographics section
    cy.contains('Demographics & Life Planning').click();
    cy.wait(500);
    
    // Test invalid life expectancy (too low)
    cy.get('input[placeholder*="Life expectancy"]').clear().type('50');
    cy.wait(500);
    
    // Should show professional warning
    cy.contains('Life expectancy below 60 may be overly pessimistic').should('exist');
    
    // Test invalid retirement age (too early)
    cy.get('input[placeholder*="Retirement age"]').clear().type('40');
    cy.wait(500);
    
    cy.contains('Early retirement before 50 requires careful validation').should('exist');
    
    cy.screenshot('professional-warnings-displayed');
  });

  it('should update balance sheet calculations when assumptions change', () => {
    // Record original lifetime net worth
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).first().then(($el) => {
      const originalValue = $el.text();
      cy.wrap(originalValue).as('originalNetWorth');
    });
    
    // Show advanced panel and make changes
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Expand Economic Environment section
    cy.contains('Economic Environment').click();
    cy.wait(500);
    
    // Increase GDP growth rate significantly
    cy.get('input[placeholder*="GDP growth"]').clear().type('8.0');
    cy.wait(2000); // Allow time for recalculation
    
    // Verify balance sheet values changed
    cy.get('.text-2xl').contains(/Ksh\s+[\d,.-]+/).first().then(($el) => {
      const newValue = $el.text();
      cy.get('@originalNetWorth').then((original) => {
        expect(newValue).to.not.equal(original);
        cy.log(`Original: ${original}, New: ${newValue}`);
      });
    });
    
    cy.screenshot('balance-sheet-updated-after-assumption-change');
  });

  it('should apply CFA methodology warnings for extreme assumptions', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Test Career Trajectory section
    cy.contains('Career Trajectory').click();
    cy.wait(500);
    
    // Set very high income progression rate
    cy.get('input[placeholder*="Income progression"]').clear().type('15.0');
    cy.wait(500);
    
    // Should show CFA methodology warning
    cy.contains('Very high progression rates may violate CFA conservatism').should('exist');
    
    // Test very low industry stability
    cy.get('input[placeholder*="Industry stability"]').clear().type('0.3');
    cy.wait(500);
    
    cy.contains('Low stability score requires sector-specific justification').should('exist');
    
    cy.screenshot('cfa-methodology-warnings');
  });

  it('should reset assumptions to defaults', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Make changes to multiple sections
    cy.contains('Demographics & Life Planning').click();
    cy.get('input[placeholder*="Life expectancy"]').clear().type('80');
    
    cy.contains('Economic Environment').click();
    cy.get('input[placeholder*="GDP growth"]').clear().type('7.0');
    
    // Look for reset button (should be in the panel)
    cy.get('[data-testid="advanced-assumption-panel"]').within(() => {
      cy.contains('Reset to CFA Kenya Defaults').click();
    });
    cy.wait(1000);
    
    // Verify values are reset
    cy.get('input[placeholder*="Life expectancy"]').should('have.value', '71');
    cy.get('input[placeholder*="GDP growth"]').should('have.value', '5.2');
    
    cy.screenshot('assumptions-reset-to-defaults');
  });

  it('should show comprehensive lifestyle assumptions', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Expand Lifestyle & Family section
    cy.contains('Lifestyle & Family').click();
    cy.wait(500);
    
    // Verify all lifestyle controls are present
    cy.get('input[placeholder*="Lifestyle inflation"]').should('exist');
    cy.get('input[placeholder*="Discretionary spending"]').should('exist');
    cy.get('input[placeholder*="Family size growth"]').should('exist');
    
    // Test lifestyle inflation impact
    cy.get('input[placeholder*="Lifestyle inflation"]').clear().type('5.0');
    cy.wait(1000);
    
    // Should show warning about high lifestyle inflation
    cy.contains('High lifestyle inflation may erode long-term wealth').should('exist');
    
    cy.screenshot('lifestyle-assumptions-comprehensive');
  });

  it('should integrate with discount rate override modal', () => {
    // First test basic discount rate controls still work
    cy.contains('Adjust Assumptions').click();
    cy.wait(1000);
    
    // Verify modal opened
    cy.contains('Discount Rate Override').should('exist');
    
    // Make a rate change
    cy.get('input[id="incomeRate"]').clear().type('10.0');
    cy.contains('Apply Rate Changes').click();
    cy.wait(2000);
    
    // Verify rate updated in UI
    cy.contains('Income Rate: 10%').should('exist');
    
    // Now test advanced assumptions still work
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    cy.get('[data-testid="advanced-assumption-panel"]').should('be.visible');
    
    cy.screenshot('advanced-panel-with-updated-rates');
  });

  it('should maintain assumption state during navigation', () => {
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // Make assumption changes
    cy.contains('Demographics & Life Planning').click();
    cy.get('input[placeholder*="Retirement age"]').clear().type('67');
    
    // Navigate away and back
    cy.contains('Assets').click();
    cy.wait(2000);
    cy.contains('Overview').click();
    cy.wait(2000);
    cy.contains('Lifetime View').click();
    cy.wait(2000);
    
    // Advanced panel should be hidden (state reset)
    cy.get('[data-testid="advanced-assumption-panel"]').should('not.exist');
    
    // But show advanced should still work
    cy.contains('Show Advanced').click();
    cy.wait(1000);
    
    // And changes should persist in session
    cy.contains('Demographics & Life Planning').click();
    cy.get('input[placeholder*="Retirement age"]').should('have.value', '67');
    
    cy.screenshot('assumption-state-maintained');
  });
});