describe('Simple Debug', () => {
  it('should show existing user profile data', () => {
    cy.visit('/auth');
    cy.get('input[id="email"]').type('jamal@example.com');
    cy.get('input[id="password"]').type('jamal123');
    cy.get('button[type="submit"]').click();
    
    cy.url().should('include', '/app/dashboard');
    
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      
      cy.request({
        url: '/auth/me',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      }).then((response) => {
        const profile = response.body.profile;
        
        // Log each field clearly
        console.log('=== PROFILE DEBUG ===');
        console.log('first_name:', profile.first_name);
        console.log('last_name:', profile.last_name);
        console.log('dob:', profile.dob);
        console.log('nationalId:', profile.nationalId);
        console.log('=== END DEBUG ===');
        
        // Check default values
        const isDefault = {
          firstName: profile.first_name === 'New',
          lastName: profile.last_name === 'User', 
          dob: profile.dob === '1990-01-01',
          nationalId: profile.nationalId === '12345678'
        };
        
        console.log('Default value checks:', isDefault);
        
        // Force fail to see the logs
        expect(false).to.be.true;
      });
    });
  });
});