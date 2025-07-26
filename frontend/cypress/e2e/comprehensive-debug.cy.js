describe('Comprehensive Debug', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.request('POST', 'http://localhost:8000/dev/clear-db');
  });

  it('should test all API connection methods step by step', () => {
    cy.visit('/');
    cy.hideWebpackOverlay();
    
    // Test 1: Direct backend connection from test runner
    cy.log('🔍 TEST 1: Direct backend connection');
    cy.request('GET', 'http://localhost:8000/healthz').then((response) => {
      cy.log(`✅ Direct backend health check: ${response.status}`);
    });
    
    // Test 2: Proxy connection from browser
    cy.log('🔍 TEST 2: Proxy connection from browser');
    cy.window().then(async (win) => {
      try {
        const response = await win.fetch('/healthz');
        cy.log(`✅ Proxy health check: ${response.status}`);
        const data = await response.text();
        cy.log(`✅ Proxy response: ${data}`);
      } catch (error) {
        cy.log(`❌ Proxy error: ${error.message}`);
      }
    });
    
    // Test 3: Check network environment
    cy.log('🔍 TEST 3: Network environment check');
    cy.window().then((win) => {
      cy.log(`Current URL: ${win.location.href}`);
      cy.log(`Host: ${win.location.host}`);
      cy.log(`Origin: ${win.location.origin}`);
      cy.log(`User Agent: ${win.navigator.userAgent}`);
    });
    
    // Test 4: Try different API base URLs
    cy.log('🔍 TEST 4: Testing different API URLs');
    cy.window().then(async (win) => {
      const testUrls = [
        '/healthz',                    // Proxy
        'http://localhost:8000/healthz', // Direct
        'http://api:8000/healthz'      // Container
      ];
      
      for (const url of testUrls) {
        try {
          cy.log(`Testing URL: ${url}`);
          const response = await win.fetch(url);
          cy.log(`✅ ${url} works: ${response.status}`);
        } catch (error) {
          cy.log(`❌ ${url} failed: ${error.message}`);
        }
      }
    });
    
    // Test 5: Registration with detailed logging
    cy.log('🔍 TEST 5: Registration test with logging');
    cy.window().then(async (win) => {
      // Override fetch to log all details
      const originalFetch = win.fetch;
      win.fetch = function(url, options) {
        cy.log(`🌐 FETCH: ${options?.method || 'GET'} ${url}`);
        if (options?.body) {
          cy.log(`🌐 BODY: ${options.body}`);
        }
        
        return originalFetch.call(this, url, options)
          .then(response => {
            cy.log(`🌐 RESPONSE: ${response.status} ${response.url}`);
            return response;
          })
          .catch(error => {
            cy.log(`🌐 ERROR: ${error.message}`);
            throw error;
          });
      };
      
      // Test registration
      try {
        const registrationData = {
          email: `debug-${Date.now()}@example.com`,
          password: 'defaultPassword123',
          first_name: 'Debug',
          last_name: 'Test',
          dob: '1990-01-01',
          nationalId: '12345678',
          kra_pin: 'A123456789Z',
          annual_income: 50000,
          dependents: 0,
          goals: { targetAmount: 10000, timeHorizon: 12 },
          questionnaire: [1, 2, 3, 4, 5]
        };
        
        cy.log('🔍 Attempting registration...');
        const response = await win.fetch('/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData)
        });
        
        if (response.ok) {
          const data = await response.json();
          cy.log(`✅ Registration successful! Token: ${data.access_token?.substring(0, 20)}...`);
        } else {
          const errorText = await response.text();
          cy.log(`❌ Registration failed: Status ${response.status}, Body: ${errorText}`);
        }
      } catch (error) {
        cy.log(`❌ Registration error: ${error.message}`);
        cy.log(`❌ Error details: ${JSON.stringify(error, Object.getOwnPropertyNames(error))}`);
      }
    });
  });

  it('should test the onboarding context directly', () => {
    cy.visit('/onboarding/personal-details');
    cy.hideWebpackOverlay();
    
    // Fill out personal details
    cy.get('input[id="firstName"]').type('Context');
    cy.get('input[id="lastName"]').type('Test');
    cy.get('input[id="dob"]').type('1990-01-01');
    cy.get('input[id="kraPin"]').type('A123456789Z');
    cy.get('button[type="submit"]').click();
    
    cy.wait(2000);
    
    // Skip through quickly to final step
    cy.url().should('include', '/onboarding/risk-questionnaire');
    cy.get('input[type="radio"]').first().check();
    cy.get('input[type="radio"]').eq(4).check();
    cy.get('input[type="radio"]').eq(8).check();
    cy.get('input[type="radio"]').eq(12).check();
    cy.get('input[type="radio"]').eq(16).check();
    cy.get('button').contains('Calculate My Risk Profile').click();
    
    cy.wait(4000);
    
    cy.url().should('include', '/onboarding/data-connection');
    cy.get('button').contains('Manual Entry (Later)').click();
    
    // Now test the actual context submission
    cy.url().should('include', '/onboarding/cash-flow-setup');
    
    // Check browser console for our debug logs
    cy.window().then((win) => {
      // Capture console logs
      const logs = [];
      const originalLog = win.console.log;
      win.console.log = function(...args) {
        logs.push(args.join(' '));
        originalLog.apply(this, args);
      };
      
      // Click the button
      cy.get('button').contains('Complete Registration').click();
      
      // Wait and check logs
      cy.wait(8000).then(() => {
        logs.forEach(log => {
          if (log.includes('🔍')) {
            cy.log(`Console: ${log}`);
          }
        });
      });
    });
  });

  it('should check docker container connectivity', () => {
    cy.visit('/');
    cy.hideWebpackOverlay();
    
    // Check if we can reach the backend through different methods
    cy.window().then(async (win) => {
      cy.log('🔍 Testing container connectivity...');
      
      // Method 1: Check if we're running inside Docker
      try {
        const response = await win.fetch('/healthz', {
          headers: { 'X-Debug': 'container-test' }
        });
        const data = await response.text();
        cy.log(`✅ Proxy to backend works: ${data}`);
      } catch (error) {
        cy.log(`❌ Proxy failed: ${error.message}`);
      }
      
      // Method 2: Check browser environment
      const isLocalhost = win.location.hostname === 'localhost';
      const isDocker = win.location.hostname !== 'localhost';
      cy.log(`Running on: ${win.location.hostname} (Docker: ${isDocker}, Localhost: ${isLocalhost})`);
      
      // Method 3: Check if CORS is an issue
      try {
        const corsTest = await win.fetch('http://localhost:8000/healthz', {
          mode: 'cors'
        });
        cy.log(`✅ Direct CORS works: ${corsTest.status}`);
      } catch (error) {
        cy.log(`❌ Direct CORS failed: ${error.message}`);
      }
    });
  });
});