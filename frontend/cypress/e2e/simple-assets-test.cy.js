describe('Simple Assets Test', () => {
  it('should check if assets endpoint is accessible', () => {
    // Test the assets-v2 endpoint directly  
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/assets-v2/',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo'
      }
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.user_id).to.eq(1);
      expect(response.body.summary.total_current_value).to.be.greaterThan(0);
      cy.log(`Assets API working: ${response.body.summary.total_assets} assets, ${response.body.summary.total_current_value} KES total value`);
    });
  });

  it('should verify frontend can access assets without error', () => {
    // Set JWT token
    window.localStorage.setItem('jwt', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiaWF0IjoxNzU1OTcxNDE2LjcyMTQxMSwiZXhwIjoxNzg3NTA3NDE2LjcyMTQxMSwic2NvcGUiOiJ1c2VyIiwicm9sZSI6InVzZXIifQ.wnGYbUsoWlqq3Qf2nSMxbV-03eBbEhTxATl5Pp5kSyo');
    
    cy.visit('http://localhost:3000');
    cy.wait(2000);
    
    // Navigate to Balance Sheet 
    cy.contains('Balance Sheet').click();
    cy.wait(3000);
    
    // Check for no error messages
    cy.contains('Failed to fetch', { timeout: 5000 }).should('not.exist');
    cy.contains('Error loading', { timeout: 5000 }).should('not.exist');
    
    cy.screenshot('balance-sheet-no-errors');
  });
});