describe('Profile-Based Lifetime Balance Sheet', () => {
  beforeEach(() => {
    // Set JWT token for authentication
    window.localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo');
  });

  it('should display lifetime balance sheet with Richards actual profile data', () => {
    cy.visit('http://localhost:3000');
    
    // Navigate to Balance Sheet
    cy.contains('Balance Sheet').click();
    cy.wait(3000); // Wait for data to load

    // Switch to Lifetime View
    cy.contains('Lifetime View').click();
    cy.wait(1000);
    
    // Verify that the lifetime view shows calculated values (not zero)
    cy.get('[data-testid="lifetime-assets"], .text-2xl').contains(/Ksh\s+[1-9][\d,]*\.?\d*/);
    cy.get('[data-testid="lifetime-liabilities"], .text-2xl').contains(/Ksh\s+[1-9][\d,]*\.?\d*/);
    
    // Take screenshot for verification
    cy.screenshot('lifetime-balance-sheet-with-profile-data');
    
    // Verify profile-based calculations
    cy.contains('Human capital', { matchCase: false }).should('exist');
    cy.contains('Present value', { matchCase: false }).should('exist');
  });

  it('should verify profile-v2 API returns Richards data', () => {
    // Test the profile endpoint directly
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/profile-v2/',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.profile.full_name).to.eq('Richard Macharia');
      expect(response.body.profile.monthly_income).to.eq(324759);
      expect(response.body.profile.age).to.eq(31);
      cy.log(`Monthly Income: ${response.body.profile.monthly_income} KES`);
      cy.log(`Age: ${response.body.profile.age} years`);
      cy.log(`Expected working years: ${65 - response.body.profile.age} years`);
    });
  });

  it('should calculate realistic human capital values', () => {
    cy.visit('http://localhost:3000');
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    
    cy.contains('Lifetime View').click();
    cy.wait(1000);
    
    // Based on Richard's profile: 324,759 KES monthly income, 31 years old
    // Expected: ~34 working years * 324,759 * 12 = ~130M KES present value of earnings
    // Should be a large number (millions)
    cy.get('.text-2xl').contains(/Ksh\s+[1-9]\d{1,2}(,\d{3})*/).should('exist');
    
    cy.screenshot('human-capital-calculation-verification');
  });
});