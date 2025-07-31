describe('Goals Management Debug Test', () => {
  beforeEach(() => {
    // Login as Jamal
    cy.visit('http://localhost:3000');
    cy.get('input[type="email"]').clear().type('jamal@example.com');
    cy.get('input[type="password"]').clear().type('jamal123');
    cy.get('button').contains('Login').click();
    cy.wait(3000);
    
    // Navigate to profile
    cy.visit('http://localhost:3000/app/profile');
    cy.wait(5000);
  });

  it('should debug profile page loading', () => {
    // Take screenshot of current state
    cy.screenshot('profile-page-loaded');
    
    // Check what we can actually see
    cy.get('body').then(($body) => {
      console.log('Page content:', $body.text());
    });
    
    // Look for any h2 elements
    cy.get('h2').then(($h2s) => {
      $h2s.each((index, element) => {
        console.log(`H2 ${index}:`, element.textContent);
      });
    });
    
    // Look for buttons
    cy.get('button').then(($buttons) => {
      $buttons.each((index, element) => {
        console.log(`Button ${index}:`, element.textContent);
      });
    });
    
    // Check if Goals Management section exists at all
    cy.get('body').should('exist');
    
    // Try to find any goals-related content
    cy.get('body').then(($body) => {
      if ($body.text().includes('Goals Management')) {
        cy.log('Found Goals Management text');
      } else {
        cy.log('Goals Management text not found');
      }
      
      if ($body.text().includes('Add New Goal')) {
        cy.log('Found Add New Goal text');
      } else {
        cy.log('Add New Goal text not found');
      }
    });
  });

  it('should check if Goals Management section renders', () => {
    // Wait for page to fully load
    cy.get('h1').should('contain', 'Your Profile');
    
    // Scroll down to see if Goals Management section exists
    cy.scrollTo('bottom');
    cy.wait(2000);
    
    // Look for the section by class or content
    cy.get('div').contains('Goals Management', { timeout: 10000 }).should('exist');
    
    // Look for Add New Goal button
    cy.get('button').contains('Add New Goal', { timeout: 10000 }).should('exist');
  });

  it('should test goals API directly', () => {
    // Check if we can call the goals API
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/goals/',
        headers: {
          'Authorization': `Bearer ${jwt}`
        }
      }).then((response) => {
        expect(response.status).to.eq(200);
        cy.log('Goals API response:', JSON.stringify(response.body));
      });
    });
  });

  it('should test creating a goal via API', () => {
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      
      cy.request({
        method: 'POST',
        url: 'http://localhost:8000/goals/',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: {
          name: 'Test Goal API',
          target: '100000',
          current: '25000',
          progress: 25.0,
          target_date: '2025-12-31'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        cy.log('Created goal:', JSON.stringify(response.body));
        
        // Refresh page and check if goal appears
        cy.reload();
        cy.wait(5000);
        cy.get('div').should('contain', 'Test Goal API');
      });
    });
  });

  it('should check browser console for errors', () => {
    cy.window().then((win) => {
      cy.stub(win.console, 'error').as('consoleError');
      cy.stub(win.console, 'warn').as('consoleWarn');
    });
    
    // Wait for page to load completely
    cy.wait(5000);
    
    // Check for console errors
    cy.get('@consoleError').should('not.have.been.called');
  });
});