describe('Debug Logs Only', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should capture and display all console logs during registration', () => {
    const logs = [];
    
    cy.visit('/onboarding/cash-flow-setup');
    cy.hideWebpackOverlay();
    
    // Capture ALL console output
    cy.window().then((win) => {
      const originalConsole = {
        log: win.console.log,
        error: win.console.error,
        warn: win.console.warn,
        info: win.console.info
      };
      
      ['log', 'error', 'warn', 'info'].forEach(method => {
        win.console[method] = function(...args) {
          const message = args.map(arg => {
            if (typeof arg === 'object') {
              try {
                return JSON.stringify(arg, null, 2);
              } catch (e) {
                return String(arg);
              }
            }
            return String(arg);
          }).join(' ');
          
          logs.push(`${method.toUpperCase()}: ${message}`);
          originalConsole[method].apply(this, args);
        };
      });
    });
    
    // Click the registration button
    cy.get('button').contains('Complete Registration').click();
    
    // Wait for completion
    cy.wait(8000);
    
    // Output all captured logs
    cy.then(() => {
      cy.log('=== ALL CONSOLE LOGS ===');
      logs.forEach((log, index) => {
        cy.log(`${index + 1}: ${log}`);
      });
      cy.log('=== END CONSOLE LOGS ===');
    });
    
    // Check final URL and JWT
    cy.url().then(url => cy.log(`Final URL: ${url}`));
    cy.window().then(win => {
      const jwt = win.localStorage.getItem('jwt');
      cy.log(`JWT: ${jwt ? 'Present' : 'Not found'}`);
    });
  });

  it('should test if onboarding context exists and has data', () => {
    cy.visit('/onboarding/personal-details');
    cy.hideWebpackOverlay();
    
    // Fill some data
    cy.get('input[id="firstName"]').type('Context');
    cy.get('input[id="lastName"]').type('Test');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="kraPin"]').type('A123456789Z');
    cy.get('button[type="submit"]').click();
    
    cy.wait(2000);
    
    // Skip to final step quickly
    cy.visit('/onboarding/cash-flow-setup');
    cy.hideWebpackOverlay();
    
    // Check if context data is available
    cy.window().then((win) => {
      // Try to access React context data through window
      cy.log('Checking for React context data...');
      
      // Check localStorage for any onboarding data
      Object.keys(win.localStorage).forEach(key => {
        if (key.includes('onboarding') || key.includes('personal') || key.includes('jwt')) {
          cy.log(`LocalStorage ${key}: ${win.localStorage.getItem(key)}`);
        }
      });
    });
  });
});