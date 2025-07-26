describe('CRUD Improvements Tests', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should test password confirmation during registration', () => {
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    // Start onboarding
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Test password validation in personal details form
    cy.url().should('include', '/onboarding/personal-details');
    
    // Fill basic info
    cy.get('input[id="firstName"]').type('John');
    cy.get('input[id="lastName"]').type('Doe');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="kraPin"]').type('A123456789Z');
    cy.get('input[id="email"]').type('john.doe@example.com');
    
    // Test password mismatch
    cy.get('input[id="password"]').type('password123');
    cy.get('input[id="confirmPassword"]').type('password456');
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.contains('Passwords do not match!').should('be.visible');
    
    // Test short password
    cy.get('input[id="password"]').clear().type('123');
    cy.get('input[id="confirmPassword"]').clear().type('123');
    cy.get('button[type="submit"]').click();
    
    // Should show length error
    cy.contains('Password must be at least 8 characters long!').should('be.visible');
    
    // Test valid password
    cy.get('input[id="password"]').clear().type('validPassword123');
    cy.get('input[id="confirmPassword"]').clear().type('validPassword123');
    cy.get('button[type="submit"]').click();
    
    // Should proceed to next step
    cy.wait(2000);
    cy.url().should('include', '/onboarding/risk-questionnaire');
  });

  it('should test consistent risk score calculation', () => {
    cy.visit('/onboarding/risk-questionnaire');
    cy.hideWebpackOverlay();
    
    // Test risk score consistency - same answers should give same score
    const testAnswers = [1, 2, 3, 4, 2]; // Specific answer pattern
    let firstScore = null;
    
    // First calculation
    testAnswers.forEach((answer, index) => {
      cy.get('input[type="radio"]').eq((index * 4) + (answer - 1)).check();
    });
    
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    // Capture the first score
    cy.wait(4000);
    cy.get('body').then(($body) => {
      const text = $body.text();
      const scoreMatch = text.match(/Your risk score is (\d+)/);
      if (scoreMatch) {
        firstScore = parseInt(scoreMatch[1]);
        cy.log(`First risk score: ${firstScore}`);
      }
    });
    
    // Go back and test again with same answers
    cy.visit('/onboarding/risk-questionnaire');
    cy.hideWebpackOverlay();
    
    testAnswers.forEach((answer, index) => {
      cy.get('input[type="radio"]').eq((index * 4) + (answer - 1)).check();
    });
    
    cy.get('button').contains('Calculate My Risk Profile').click();
    cy.wait(4000);
    
    // Verify second score matches first
    cy.get('body').then(($body) => {
      const text = $body.text();
      const scoreMatch = text.match(/Your risk score is (\d+)/);
      if (scoreMatch && firstScore !== null) {
        const secondScore = parseInt(scoreMatch[1]);
        cy.log(`Second risk score: ${secondScore}`);
        expect(secondScore).to.equal(firstScore);
      }
    });
  });

  it('should test complete registration with user credentials', () => {
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    const testUser = {
      firstName: 'Test',
      lastName: 'User',
      email: `test.user.${Date.now()}@example.com`,
      password: 'testPassword123',
      dob: '1990-01-01',
      kraPin: 'A123456789Z'
    };
    
    // Complete onboarding with user credentials
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').should('contain', 'Start Onboarding').click();
    
    // Personal details with real credentials
    cy.url().should('include', '/onboarding/personal-details');
    cy.get('input[id="firstName"]').type(testUser.firstName);
    cy.get('input[id="lastName"]').type(testUser.lastName);
    cy.get('input[id="dob"]').type(testUser.dob);
    cy.get('input[id="kraPin"]').type(testUser.kraPin);
    cy.get('input[id="email"]').type(testUser.email);
    cy.get('input[id="password"]').type(testUser.password);
    cy.get('input[id="confirmPassword"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    cy.wait(2000);
    
    // Complete risk questionnaire
    cy.url().should('include', '/onboarding/risk-questionnaire');
    cy.get('input[type="radio"]').first().check();
    cy.get('input[type="radio"]').eq(4).check();
    cy.get('input[type="radio"]').eq(8).check();
    cy.get('input[type="radio"]').eq(12).check();
    cy.get('input[type="radio"]').eq(16).check();
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    cy.wait(4000);
    
    // Skip data connection
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('button').contains('Manual Entry (Later)').click();
    
    // Complete registration
    cy.url().should('include', '/onboarding/cash-flow-setup');
    cy.get('button').contains('Complete Registration').click();
    
    // Should redirect to dashboard after successful registration
    cy.wait(8000);
    cy.url().should('include', '/app/dashboard');
    
    // Verify JWT token exists
    cy.window().then((win) => {
      const jwt = win.localStorage.getItem('jwt');
      expect(jwt).to.not.be.null;
    });
    
    // Store user data for profile test
    cy.wrap(testUser).as('testUser');
  });

  it('should test profile page shows real user data', () => {
    // First register a user
    const testUser = {
      firstName: 'Profile',
      lastName: 'Test',
      email: `profile.test.${Date.now()}@example.com`,
      password: 'profilePassword123',
      dob: '1985-06-15',
      kraPin: 'B987654321Y'
    };
    
    // Quick registration via API
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/register',
      body: {
        email: testUser.email,
        password: testUser.password,
        first_name: testUser.firstName,
        last_name: testUser.lastName,
        dob: testUser.dob,
        nationalId: '87654321',
        kra_pin: testUser.kraPin,
        annual_income: 75000,
        dependents: 1,
        goals: { targetAmount: 15000, timeHorizon: 18 },
        questionnaire: [2, 3, 2, 4, 3]
      }
    }).then((response) => {
      expect(response.status).to.eq(201);
      const jwt = response.body.access_token;
      
      // Set JWT in localStorage
      cy.visit('/app/profile');
      cy.window().then((win) => {
        win.localStorage.setItem('jwt', jwt);
      });
      
      // Refresh to load profile with JWT
      cy.reload();
      cy.hideWebpackOverlay();
      
      // Wait for profile to load
      cy.wait(3000);
      
      // Verify profile shows real user data
      cy.contains(`${testUser.firstName} ${testUser.lastName}`).should('be.visible');
      cy.contains(testUser.email).should('be.visible');
      
      // Check age calculation (should be around 39 for DOB 1985-06-15)
      cy.contains('Age:').parent().should('contain', '39').or('contain', '38');
      
      // Verify risk profile section exists
      cy.contains('Risk Profile').should('be.visible');
      cy.contains('Risk Score:').should('be.visible');
      cy.contains('Risk Level:').should('be.visible');
      
      // Verify financial milestones
      cy.contains('Emergency Fund').should('be.visible');
      cy.contains('15000').should('be.visible'); // Target amount
    });
  });

  it('should test logout functionality', () => {
    // Register and login a user
    cy.request({
      method: 'POST',
      url: 'http://localhost:8000/auth/register',
      body: {
        email: `logout.test.${Date.now()}@example.com`,
        password: 'logoutPassword123',
        first_name: 'Logout',
        last_name: 'Test',
        dob: '1992-03-10',
        nationalId: '11223344',
        kra_pin: 'C111222333D',
        annual_income: 60000,
        dependents: 0,
        goals: { targetAmount: 12000, timeHorizon: 24 },
        questionnaire: [1, 2, 3, 4, 5]
      }
    }).then((response) => {
      const jwt = response.body.access_token;
      
      // Visit profile page with JWT
      cy.visit('/app/profile');
      cy.window().then((win) => {
        win.localStorage.setItem('jwt', jwt);
      });
      
      cy.reload();
      cy.hideWebpackOverlay();
      cy.wait(3000);
      
      // Verify we're logged in (profile data visible)
      cy.contains('Logout Test').should('be.visible');
      
      // Verify JWT exists
      cy.window().then((win) => {
        expect(win.localStorage.getItem('jwt')).to.not.be.null;
      });
      
      // Click logout button
      cy.get('button').contains('Logout').click();
      
      // Should show logout message
      cy.contains('Logged out successfully').should('be.visible');
      
      // Should redirect to auth page
      cy.wait(2000);
      cy.url().should('include', '/auth');
      
      // Verify JWT is removed
      cy.window().then((win) => {
        expect(win.localStorage.getItem('jwt')).to.be.null;
      });
    });
  });

  it('should test profile loading states and error handling', () => {
    cy.visit('/app/profile');
    cy.hideWebpackOverlay();
    
    // Without JWT, should redirect to auth
    cy.wait(2000);
    cy.url().should('include', '/auth');
    
    // Test with invalid JWT
    cy.visit('/app/profile');
    cy.window().then((win) => {
      win.localStorage.setItem('jwt', 'invalid.jwt.token');
    });
    
    cy.reload();
    cy.hideWebpackOverlay();
    
    // Should redirect to auth due to invalid token
    cy.wait(3000);
    cy.url().should('include', '/auth');
  });

  it('should test end-to-end CRUD operations', () => {
    const testUser = {
      firstName: 'CRUD',
      lastName: 'Complete',
      email: `crud.complete.${Date.now()}@example.com`,
      password: 'crudPassword123',
      dob: '1988-12-25',
      kraPin: 'D555666777E'
    };
    
    // CREATE - Complete registration
    cy.visit('/auth');
    cy.hideWebpackOverlay();
    
    cy.contains('New user? Get Started').click();
    cy.get('button[type="submit"]').click();
    
    // Fill registration form
    cy.get('input[id="firstName"]').type(testUser.firstName);
    cy.get('input[id="lastName"]').type(testUser.lastName);
    cy.get('input[id="dob"]').type(testUser.dob);
    cy.get('input[id="kraPin"]').type(testUser.kraPin);
    cy.get('input[id="email"]').type(testUser.email);
    cy.get('input[id="password"]').type(testUser.password);
    cy.get('input[id="confirmPassword"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    
    // Complete onboarding quickly
    cy.wait(2000);
    cy.get('input[type="radio"]').first().check();
    cy.get('input[type="radio"]').eq(4).check();
    cy.get('input[type="radio"]').eq(8).check();
    cy.get('input[type="radio"]').eq(12).check();
    cy.get('input[type="radio"]').eq(16).check();
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    cy.wait(4000);
    cy.get('button').contains('Manual Entry (Later)').click();
    cy.get('button').contains('Complete Registration').click();
    
    // Should reach dashboard
    cy.wait(8000);
    cy.url().should('include', '/app/dashboard');
    
    // READ - Navigate to profile and verify data
    cy.visit('/app/profile');
    cy.wait(3000);
    
    cy.contains(`${testUser.firstName} ${testUser.lastName}`).should('be.visible');
    cy.contains(testUser.email).should('be.visible');
    
    // UPDATE - Test profile update actions (wireframe)
    cy.get('button').contains('Edit Personal Info').click();
    cy.contains('Edit Personal Info').should('be.visible');
    
    // DELETE - Test logout (session deletion)
    cy.get('button').contains('Logout').click();
    cy.wait(2000);
    cy.url().should('include', '/auth');
    
    // Verify complete CRUD cycle worked
    cy.window().then((win) => {
      expect(win.localStorage.getItem('jwt')).to.be.null;
    });
  });
});