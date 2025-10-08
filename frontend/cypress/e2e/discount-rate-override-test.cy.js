describe('Guided Discount Rate Override UI', () => {
  beforeEach(() => {
    window.localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo');
  });

  it('should display discount rate override UI in lifetime view', () => {
    cy.visit('http://localhost:3000');
    
    // Navigate to Balance Sheet
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    
    // Switch to Lifetime View
    cy.contains('Lifetime View').click();
    cy.wait(2000);
    
    // Verify discount rate badges are visible
    cy.contains('Income Rate: 12.5%').should('exist');
    cy.contains('Expense Rate: 10.5%').should('exist');
    
    // Verify "Adjust Assumptions" button is visible
    cy.contains('Adjust Assumptions').should('exist');
    
    cy.screenshot('lifetime-view-with-rate-controls');
  });

  it('should open discount rate override modal with CFA warnings', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    cy.contains('Lifetime View').click();
    cy.wait(2000);
    
    // Click "Adjust Assumptions" button
    cy.contains('Adjust Assumptions').click();
    cy.wait(1000);
    
    // Verify modal opened
    cy.contains('Discount Rate Override').should('exist');
    cy.contains('CFA Institute Kenya Standards').should('exist');
    
    // Verify default values are shown
    cy.get('input[id="incomeRate"]').should('have.value', '12.5');
    cy.get('input[id="expenseRate"]').should('have.value', '10.5');
    
    // Verify CFA standards information
    cy.contains('Kenya Risk-Free Rate: 11.5%').should('exist');
    cy.contains('Career Risk Premium: 1-3%').should('exist');
    
    cy.screenshot('discount-rate-modal-opened');
  });

  it('should show professional warnings when rates are adjusted', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    cy.contains('Lifetime View').click();
    cy.wait(2000);
    
    cy.contains('Adjust Assumptions').click();
    cy.wait(1000);
    
    // Test low income rate (should trigger warning)
    cy.get('input[id="incomeRate"]').clear().type('5.0');
    cy.wait(500);
    
    // Should show warning
    cy.contains('Income discount rate below 8%').should('exist');
    cy.contains('may underestimate career risk').should('exist');
    
    // Test very high rate
    cy.get('input[id="incomeRate"]').clear().type('25.0');
    cy.wait(500);
    
    cy.contains('Very high discount rate may be overly conservative').should('exist');
    
    cy.screenshot('professional-warnings-displayed');
  });

  it('should recalculate balance sheet with custom rates', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    cy.contains('Lifetime View').click();
    cy.wait(2000);
    
    // Record original values
    cy.get('.text-2xl').contains(/Ksh\s+[\d,]+/).first().then(($el) => {
      const originalValue = $el.text();
      cy.wrap(originalValue).as('originalLifetimeAssets');
    });
    
    // Open modal and adjust rates
    cy.contains('Adjust Assumptions').click();
    cy.wait(1000);
    
    // Lower income discount rate (should increase human capital)
    cy.get('input[id="incomeRate"]').clear().type('8.0');
    
    // Apply changes
    cy.contains('Apply Rate Changes').click();
    cy.wait(2000);
    
    // Verify rates updated in UI
    cy.contains('Income Rate: 8%').should('exist');
    
    // Verify balance sheet values changed
    cy.get('.text-2xl').contains(/Ksh\s+[\d,]+/).first().then(($el) => {
      const newValue = $el.text();
      cy.get('@originalLifetimeAssets').then((original) => {
        expect(newValue).to.not.equal(original);
        cy.log(`Original: ${original}, New: ${newValue}`);
      });
    });
    
    cy.screenshot('balance-sheet-recalculated');
  });

  it('should reset to CFA defaults', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    cy.contains('Lifetime View').click();
    cy.wait(2000);
    
    cy.contains('Adjust Assumptions').click();
    cy.wait(1000);
    
    // Change values
    cy.get('input[id="incomeRate"]').clear().type('20.0');
    cy.get('input[id="expenseRate"]').clear().type('15.0');
    
    // Reset to defaults
    cy.contains('Reset to CFA Defaults').click();
    cy.wait(500);
    
    // Verify values reset
    cy.get('input[id="incomeRate"]').should('have.value', '12.5');
    cy.get('input[id="expenseRate"]').should('have.value', '10.5');
    
    cy.screenshot('rates-reset-to-defaults');
  });

  it('should show audit trail for rate changes', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    cy.contains('Lifetime View').click();
    cy.wait(2000);
    
    cy.contains('Adjust Assumptions').click();
    cy.wait(1000);
    
    // Make a change to trigger audit trail
    cy.get('input[id="incomeRate"]').clear().type('10.0');
    cy.wait(500);
    
    // Show advanced options
    cy.contains('Show Advanced Options').click();
    cy.wait(500);
    
    // Verify audit trail exists
    cy.contains('Change Audit Trail').should('exist');
    cy.contains('incomeDiscountRate').should('exist');
    
    cy.screenshot('audit-trail-visible');
  });
});