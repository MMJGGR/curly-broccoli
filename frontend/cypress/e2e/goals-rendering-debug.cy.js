describe('Goals Rendering Debug', () => {
  beforeEach(() => {
    // Clear any existing goals first via API
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/login',
      form: true,
      body: {
        username: 'jamal@example.com',
        password: 'jamal123'
      }
    }).then((response) => {
      const token = response.body.access_token;
      
      // Get existing goals and delete them
      cy.request({
        method: 'GET',
        url: 'http://localhost:8000/goals/',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).then((goalsResponse) => {
        const goals = goalsResponse.body;
        goals.forEach(goal => {
          cy.request({
            method: 'DELETE',
            url: `http://localhost:8000/goals/${goal.id}`,
            headers: {
              'Authorization': `Bearer ${token}`
            },
            failOnStatusCode: false
          });
        });
      });
    });

    // Login to frontend
    cy.visit('http://localhost:3000');
    cy.get('input[type="email"]').clear().type('jamal@example.com');
    cy.get('input[type="password"]').clear().type('jamal123');
    cy.get('button').contains('Login').click();
    cy.wait(3000);
    
    // Navigate to profile
    cy.visit('http://localhost:3000/app/profile');
    cy.wait(5000);
  });

  it('should find Goals Management section in DOM', () => {
    // Take a screenshot first
    cy.screenshot('profile-page-debug');
    
    // Check if page loads at all
    cy.get('h1').should('contain', 'Your Profile');
    
    // Look for all h2 elements and log them
    cy.get('h2').then(($headings) => {
      const headings = Array.from($headings).map(h => h.textContent);
      cy.log('Found headings:', headings.join(', '));
      
      // Goals Management should be in there
      expect(headings).to.include('Goals Management');
    });
    
    // Scroll to the Goals Management section specifically
    cy.contains('h2', 'Goals Management').should('be.visible');
    
    // Look for the Add New Goal button
    cy.contains('button', 'Add New Goal').should('be.visible');
    
    // Check for empty state message
    cy.contains('No goals set yet').should('be.visible');
  });

  it('should verify Goals API integration', () => {
    // First verify we can see Goals Management section
    cy.contains('h2', 'Goals Management').should('be.visible');
    
    // Create a goal via API
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
          name: 'Debug Test Goal',
          target: '50000',
          current: '12500', 
          progress: 25.0,
          target_date: '2025-12-31'
        }
      }).then((response) => {
        expect(response.status).to.eq(201);
        
        // Refresh page and check if goal appears
        cy.reload();
        cy.wait(5000);
        
        // Goal should now appear
        cy.contains('Debug Test Goal').should('be.visible');
        cy.contains('KES 50,000').should('be.visible');
        cy.contains('25.0%').should('be.visible');
        
        // Test delete button
        cy.contains('Debug Test Goal').parent().parent().within(() => {
          cy.get('button').contains('Delete').should('be.visible');
        });
      });
    });
  });

  it('should test goal creation via UI', () => {
    // Verify Goals Management section exists
    cy.contains('h2', 'Goals Management').should('be.visible');
    cy.contains('button', 'Add New Goal').should('be.visible');
    
    // Mock the prompt dialogs
    cy.window().then((win) => {
      cy.stub(win, 'prompt')
        .onCall(0).returns('UI Test Goal')
        .onCall(1).returns('75000')
        .onCall(2).returns('18750')
        .onCall(3).returns('2025-09-30');
    });
    
    // Click Add New Goal
    cy.contains('button', 'Add New Goal').click();
    
    // Wait for API call
    cy.wait(3000);
    
    // Goal should appear
    cy.contains('UI Test Goal').should('be.visible');
    cy.contains('KES 75,000').should('be.visible');
    cy.contains('25.0%').should('be.visible');
  });

  it('should test goal deletion via UI', () => {
    // First create a goal to delete
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
          name: 'Goal to Delete',
          target: '30000',
          current: '9000',
          progress: 30.0
        }
      }).then(() => {
        cy.reload();
        cy.wait(5000);
        
        // Goal should be visible
        cy.contains('Goal to Delete').should('be.visible');
        
        // Mock confirm dialog
        cy.window().then((win) => {
          cy.stub(win, 'confirm').returns(true);
        });
        
        // Click delete button
        cy.contains('Goal to Delete').parent().parent().within(() => {
          cy.get('button').contains('Delete').click();
        });
        
        // Wait for deletion
        cy.wait(3000);
        
        // Goal should be gone
        cy.contains('Goal to Delete').should('not.exist');
      });
    });
  });
});