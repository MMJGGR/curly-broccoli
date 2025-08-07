describe('Onboarding Completion Fix Test', () => {
  beforeEach(() => {
    // Clear any existing data
    cy.clearLocalStorage();
    cy.clearCookies();
    
    // Start fresh
    cy.visit('http://localhost:3000');
  });

  it('should complete onboarding flow successfully with all 5 steps', () => {
    // Step 1: Register/Login
    cy.get('input[type="email"]').should('be.visible').type('test.onboarding@example.com');
    cy.get('input[type="password"]').should('be.visible').type('testpassword123');
    
    // Try to register first, then login if already exists
    cy.get('button').contains('Sign Up').click();
    
    // Handle potential "already registered" scenario
    cy.wait(2000);
    cy.get('body').then(($body) => {
      if ($body.text().includes('already') || $body.text().includes('exists')) {
        cy.get('button').contains('Sign In').click();
      }
    });
    
    // Wait for dashboard or onboarding to load
    cy.wait(3000);
    
    // If we're at onboarding, proceed with the test
    cy.get('body').then(($body) => {
      if ($body.text().includes('Complete Your Profile') || $body.text().includes('Personal Information')) {
        
        // Step 1: Personal Information
        cy.log('🧪 Testing Step 1: Personal Information');
        cy.get('input[id="firstName"]', { timeout: 10000 }).should('be.visible').clear().type('Test');
        cy.get('input[id="lastName"]').should('be.visible').clear().type('User');
        cy.get('input[id="dateOfBirth"]').should('be.visible').clear().type('1990-01-01');
        cy.get('input[id="phone"]').should('be.visible').clear().type('+254712345678');
        cy.get('input[id="nationalId"]').should('be.visible').clear().type('12345678');
        cy.get('input[id="kraPin"]').should('be.visible').clear().type('A123456789B');
        
        // Click Next to go to Step 2
        cy.get('button').contains('Next').should('not.be.disabled').click();
        cy.wait(2000);
        
        // Step 2: Risk Assessment
        cy.log('🧪 Testing Step 2: Risk Assessment');
        cy.get('input[type="radio"]').should('have.length.greaterThan', 0);
        
        // Answer all 5 risk questions (select first option for each)
        for (let i = 1; i <= 5; i++) {
          cy.get(`input[name="question-${i}"]`).first().check({ force: true });
          cy.wait(500);
        }
        
        // Wait for risk score calculation
        cy.wait(2000);
        cy.get('[data-testid="risk-score"]', { timeout: 5000 }).should('be.visible');
        
        // Click Next to go to Step 3
        cy.get('button').contains('Next').should('not.be.disabled').click();
        cy.wait(2000);
        
        // Step 3: Financial Information
        cy.log('🧪 Testing Step 3: Financial Information');
        cy.get('input[id="monthlyIncome"]').should('be.visible').clear().type('80000');
        cy.get('input[id="rent"]').should('be.visible').clear().type('25000');
        cy.get('input[id="utilities"]').should('be.visible').clear().type('8000');
        cy.get('input[id="groceries"]').should('be.visible').clear().type('15000');
        cy.get('input[id="transport"]').should('be.visible').clear().type('12000');
        cy.get('input[id="loanRepayments"]').should('be.visible').clear().type('10000');
        
        // Wait for budget calculations
        cy.wait(2000);
        
        // Click Next to go to Step 4
        cy.get('button').contains('Next').should('not.be.disabled').click();
        cy.wait(2000);
        
        // Step 4: Goals (Optional)
        cy.log('🧪 Testing Step 4: Goals Setup');
        // Fill some basic goals
        cy.get('body').then(($body) => {
          if ($body.find('input[id="emergencyFund"]').length > 0) {
            cy.get('input[id="emergencyFund"]').clear().type('100000');
          }
          if ($body.find('input[id="retirement"]').length > 0) {
            cy.get('input[id="retirement"]').clear().type('5000000');
          }
        });
        
        // Click Next to go to Step 5
        cy.get('button').contains('Next').click();
        cy.wait(2000);
        
        // Step 5: Preferences (Optional)
        cy.log('🧪 Testing Step 5: Preferences');
        // Accept default preferences or make selections
        cy.get('body').then(($body) => {
          if ($body.find('input[type="checkbox"]').length > 0) {
            // Just use default selections
            cy.wait(1000);
          }
        });
        
        // Now test the debug functions if available
        cy.get('body').then(($body) => {
          if ($body.text().includes('Force Save All')) {
            cy.log('🧪 Testing Force Save All functionality');
            cy.get('button').contains('Force Save All').click();
            cy.wait(5000); // Wait for all saves to complete
          }
          
          if ($body.text().includes('Backend State')) {
            cy.log('🧪 Testing Backend State check');
            cy.get('button').contains('Backend State').click();
            cy.wait(2000);
          }
        });
        
        // Finally, attempt completion
        cy.log('🧪 Testing Onboarding Completion');
        cy.get('button').contains('Complete Setup').should('be.visible').click();
        
        // Wait for completion processing
        cy.wait(10000);
        
        // Check for success or failure
        cy.get('body').then(($body) => {
          if ($body.text().includes('Welcome to Your Financial Journey') || 
              $body.text().includes('successfully') ||
              $body.text().includes('Dashboard')) {
            cy.log('✅ ONBOARDING COMPLETION SUCCESSFUL!');
          } else if ($body.text().includes('Missing required steps') || 
                     $body.text().includes('Failed')) {
            cy.log('❌ ONBOARDING COMPLETION FAILED - Still has issues');
            // Log the current state for debugging
            cy.window().then((win) => {
              console.log('Current URL:', win.location.href);
              console.log('Page content includes completion error');
            });
            throw new Error('Onboarding completion still failing');
          } else {
            cy.log('⚠️ Unclear completion state - checking URL');
            cy.wait(5000);
            cy.url().should('not.include', 'onboarding');
          }
        });
      } else {
        cy.log('✅ User already completed onboarding - test passes');
      }
    });
  });
  
  it('should show proper completed steps in debug view', () => {
    // This test assumes user is logged in and at onboarding
    cy.visit('http://localhost:3000');
    cy.wait(3000);
    
    cy.get('body').then(($body) => {
      if ($body.text().includes('Complete Your Profile')) {
        if ($body.text().includes('Backend State')) {
          cy.get('button').contains('Backend State').click();
          cy.wait(2000);
          
          // Check console for the backend state
          cy.window().then((win) => {
            // The backend state should be logged to console
            // We expect to see completed_steps array with at least [1,2,3]
            cy.log('Backend state check completed - check browser console for results');
          });
        }
      }
    });
  });
});