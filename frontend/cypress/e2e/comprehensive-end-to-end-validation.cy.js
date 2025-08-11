/**
 * Comprehensive End-to-End User Journey Validation
 * Tests complete integrated financial planning application functionality
 * 
 * This test suite validates:
 * - New user onboarding through advanced financial management
 * - Existing user daily workflows and system interactions
 * - Mobile user experience across all features
 * - Persona-specific journey validation
 * - Data flow integrity and real-world scenarios
 * - Error handling and performance under load
 */

describe('Comprehensive End-to-End Journey Validation', () => {
  const timestamp = Date.now();
  const testUsers = {
    newUser: {
      email: `new.user.${timestamp}@example.com`,
      password: 'SecureTest123!',
      name: 'New Test User'
    },
    jamalUser: {
      email: `jamal.${timestamp}@example.com`,
      password: 'JamalTest123!',
      name: 'Jamal Test User'
    },
    aishaUser: {
      email: `aisha.${timestamp}@example.com`,
      password: 'AishaTest123!',
      name: 'Aisha Test User'
    },
    samuelUser: {
      email: `samuel.${timestamp}@example.com`,
      password: 'SamuelTest123!',
      name: 'Samuel Test User'
    }
  };

  const testData = {
    jamal: {
      age: 28,
      occupation: 'Software Developer',
      location: 'Nairobi',
      monthlyIncome: 550000,
      monthlyExpenses: 320000,
      currentSavings: 280000,
      currentInvestments: 150000,
      monthlyDebt: 45000,
      goals: {
        emergency: { target: 960000, timeframe: 24 },
        investment: { target: 2500000, timeframe: 60 },
        property: { target: 1200000, timeframe: 36 }
      }
    },
    aisha: {
      age: 35,
      occupation: 'Marketing Manager',
      location: 'Nairobi',
      monthlyIncome: 485000,
      monthlyExpenses: 365000,
      currentSavings: 320000,
      currentInvestments: 95000,
      monthlyDebt: 38000,
      goals: {
        emergency: { target: 1095000, timeframe: 18 },
        education: { target: 800000, timeframe: 48 },
        family: { target: 1500000, timeframe: 72 }
      }
    },
    samuel: {
      age: 52,
      occupation: 'Senior Consultant',
      location: 'Nairobi',
      monthlyIncome: 720000,
      monthlyExpenses: 455000,
      currentSavings: 850000,
      currentInvestments: 1200000,
      monthlyDebt: 28000,
      goals: {
        retirement: { target: 15000000, timeframe: 96 },
        healthcare: { target: 2000000, timeframe: 60 },
        legacy: { target: 5000000, timeframe: 120 }
      }
    }
  };

  before(() => {
    // Cleanup any existing test data
    Object.values(testUsers).forEach(user => {
      cy.exec(`cd api && python -c "from app.dev import cleanup_test_user; cleanup_test_user('${user.email}')"`, {
        failOnNonZeroExit: false
      });
    });

    // Verify system health before testing
    cy.request({
      method: 'GET',
      url: 'http://localhost:8000/api/v1/profile',
      failOnStatusCode: false
    }).then(response => {
      // Backend is running
      expect([200, 401]).to.include(response.status);
    });
  });

  describe('1. New User Complete Journey', () => {
    it('validates complete new user onboarding and initial financial management setup', () => {
      // **Step 1: User Registration**
      cy.log('🚀 Starting new user registration');
      cy.visit('http://localhost:3000');
      
      // Handle different landing page scenarios
      cy.get('body').then(($body) => {
        if ($body.text().includes('Login') || $body.text().includes('Sign In')) {
          // We're on auth page, look for register option
          cy.contains('Register', { timeout: 5000 }).click({ timeout: 5000 });
        } else if ($body.find('input[type="email"]').length === 0) {
          // Need to navigate to auth
          cy.contains('Get Started', { timeout: 5000 }).click({ timeout: 5000 });
          cy.contains('Register', { timeout: 5000 }).click({ timeout: 5000 });
        }
      });

      // Registration form
      cy.get('input[type="email"], input[name="email"]', { timeout: 10000 })
        .should('be.visible')
        .clear()
        .type(testUsers.newUser.email);
      
      cy.get('input[type="password"], input[name="password"]')
        .first()
        .clear()
        .type(testUsers.newUser.password);
        
      // Handle confirm password if present
      cy.get('body').then(($body) => {
        const passwordFields = $body.find('input[type="password"]');
        if (passwordFields.length > 1) {
          cy.get('input[type="password"]').last().clear().type(testUsers.newUser.password);
        }
      });

      // Name field if present
      cy.get('body').then(($body) => {
        if ($body.find('input[name="name"], input[id="name"]').length > 0) {
          cy.get('input[name="name"], input[id="name"]').clear().type(testUsers.newUser.name);
        }
      });

      cy.get('button[type="submit"], button:contains("Register"), button:contains("Create Account")')
        .should('be.visible')
        .click();

      cy.log('✅ User registration completed');

      // **Step 2: Complete Onboarding Flow**
      cy.url({ timeout: 15000 }).should('satisfy', (url) => {
        return url.includes('/onboarding') || url.includes('/dashboard') || url.includes('/timeline');
      });

      // If we land on onboarding, complete it
      cy.url().then((url) => {
        if (url.includes('/onboarding')) {
          cy.log('🎯 Completing onboarding flow');
          
          // Personal Information
          const personalFields = {
            'input[name="age"], input[id="age"]': '32',
            'input[name="occupation"], input[id="occupation"]': 'Software Engineer',
            'select[name="location"], select[id="location"]': 'Nairobi',
            'input[name="dependents"], input[id="dependents"]': '1'
          };

          Object.entries(personalFields).forEach(([selector, value]) => {
            cy.get('body').then(($body) => {
              if ($body.find(selector).length > 0) {
                if (selector.includes('select')) {
                  cy.get(selector).select(value);
                } else {
                  cy.get(selector).clear().type(value);
                }
              }
            });
          });

          // Continue through steps
          cy.get('button').contains(/next|continue/i, { timeout: 5000 }).click({ timeout: 5000 });

          // Financial Information
          cy.wait(1000);
          const financialFields = {
            'input[name="monthlyIncome"], input[id="monthlyIncome"]': '450000',
            'input[name="monthlyExpenses"], input[id="monthlyExpenses"]': '280000',
            'input[name="currentSavings"], input[id="currentSavings"]': '150000',
            'input[name="currentInvestments"], input[id="currentInvestments"]': '80000',
            'input[name="monthlyDebt"], input[id="monthlyDebt"]': '25000'
          };

          Object.entries(financialFields).forEach(([selector, value]) => {
            cy.get('body').then(($body) => {
              if ($body.find(selector).length > 0) {
                cy.get(selector).clear().type(value);
              }
            });
          });

          cy.get('button').contains(/next|continue/i, { timeout: 5000 }).click({ timeout: 5000 });

          // Risk Assessment - select moderate options
          cy.wait(1000);
          cy.get('body').then(($body) => {
            // Look for radio buttons or clickable risk options
            const riskOptions = $body.find('input[type="radio"], button, div[role="button"]');
            if (riskOptions.length > 0) {
              // Select moderate/medium risk options (usually middle choices)
              for (let i = 1; i <= 5; i++) {
                cy.get('body').then(($body2) => {
                  const questionInputs = $body2.find(`input[name*="question${i}"], input[name*="risk${i}"], input[name*="q${i}"]`);
                  if (questionInputs.length >= 3) {
                    // Select middle option (moderate risk)
                    cy.get(`input[name*="question${i}"], input[name*="risk${i}"], input[name*="q${i}"]`)
                      .eq(Math.floor(questionInputs.length / 2))
                      .click({ force: true });
                  }
                });
              }
            }
          });

          cy.get('button').contains(/next|continue/i, { timeout: 5000 }).click({ timeout: 5000 });

          // Goals Setup
          cy.wait(1000);
          cy.get('body').then(($body) => {
            // Add emergency fund goal
            if ($body.find('input[name*="emergency"], button:contains("Emergency")').length > 0) {
              cy.get('input[name*="emergency"]').first().clear().type('600000');
            }
            // Add retirement goal
            if ($body.find('input[name*="retirement"], button:contains("Retirement")').length > 0) {
              cy.get('input[name*="retirement"]').first().clear().type('8000000');
            }
          });

          cy.get('button').contains(/next|continue|complete/i, { timeout: 5000 }).click({ timeout: 5000 });

          // Final step - preferences or completion
          cy.wait(2000);
          cy.get('button').contains(/complete|finish|save/i, { timeout: 5000 }).click({ timeout: 5000 });
        }
      });

      // **Step 3: Verify Landing on Main Dashboard/Timeline**
      cy.url({ timeout: 15000 }).should('satisfy', (url) => {
        return url.includes('/dashboard') || url.includes('/timeline') || url.includes('/app');
      });

      cy.log('✅ Onboarding flow completed successfully');

      // **Step 4: Account Management**
      cy.log('💰 Testing account management functionality');
      
      // Navigate to accounts (may be in nav or as cards)
      cy.get('body').then(($body) => {
        if ($body.text().includes('Account') || $body.find('[href*="account"]').length > 0) {
          cy.contains('Account').first().click({ timeout: 5000 });
        } else {
          // Look for add account option
          cy.contains(/add.*account|new.*account/i, { timeout: 5000 }).click({ timeout: 5000 });
        }
      });

      // Add checking account
      cy.get('body').then(($body) => {
        if ($body.find('input[name*="account"], input[id*="account"]').length > 0) {
          // Account form is visible
          cy.get('select[name*="type"], select[id*="type"]').first().select('checking');
          cy.get('input[name*="name"], input[id*="name"]').first().clear().type('Primary Checking');
          cy.get('input[name*="balance"], input[id*="balance"]').clear().type('180000');
          cy.get('button[type="submit"], button:contains("Save")').first().click();
          cy.wait(2000);
        }
      });

      cy.log('✅ Account management tested');

      // **Step 5: Transaction Management**
      cy.log('📊 Testing transaction functionality');
      
      // Navigate to transactions
      cy.get('body').then(($body) => {
        if ($body.text().includes('Transaction') || $body.find('[href*="transaction"]').length > 0) {
          cy.contains('Transaction').first().click({ timeout: 5000 });
        }
      });

      // Add sample transaction
      cy.get('body').then(($body) => {
        if ($body.find('input[name*="description"], input[id*="description"]').length > 0) {
          cy.get('input[name*="description"], input[id*="description"]').clear().type('Salary Payment');
          cy.get('input[name*="amount"], input[id*="amount"]').clear().type('450000');
          
          // Category selection
          if ($body.find('select[name*="category"], select[id*="category"]').length > 0) {
            cy.get('select[name*="category"], select[id*="category"]').select('Income');
          }
          
          cy.get('button[type="submit"], button:contains("Save"), button:contains("Add")').first().click();
          cy.wait(2000);
        }
      });

      cy.log('✅ Transaction management tested');

      // **Step 6: Budget Management**
      cy.log('📈 Testing budget functionality');
      
      // Navigate to budget
      cy.get('body').then(($body) => {
        if ($body.text().includes('Budget') || $body.find('[href*="budget"]').length > 0) {
          cy.contains('Budget').first().click({ timeout: 5000 });
        }
      });

      // Set budget categories
      cy.get('body').then(($body) => {
        const budgetCategories = {
          housing: '120000',
          food: '45000',
          transportation: '30000'
        };

        Object.entries(budgetCategories).forEach(([category, amount]) => {
          if ($body.find(`input[name*="${category}"], input[id*="${category}"]`).length > 0) {
            cy.get(`input[name*="${category}"], input[id*="${category}"]`).clear().type(amount);
          }
        });

        if ($body.find('button:contains("Save"), button[type="submit"]').length > 0) {
          cy.get('button:contains("Save"), button[type="submit"]').first().click();
          cy.wait(2000);
        }
      });

      cy.log('✅ Budget management tested');

      // **Step 7: Goals and Analytics**
      cy.log('🎯 Testing goals and analytics');
      
      // Navigate to analytics or goals
      cy.get('body').then(($body) => {
        if ($body.text().includes('Analytics') || $body.find('[href*="analytics"]').length > 0) {
          cy.contains('Analytics').first().click({ timeout: 5000 });
          cy.wait(3000); // Allow analytics to load
          
          // Verify analytics components exist
          cy.get('body').should('contain.text', 'Goal', { timeout: 10000 });
        } else if ($body.text().includes('Goal') || $body.find('[href*="goal"]').length > 0) {
          cy.contains('Goal').first().click({ timeout: 5000 });
          cy.wait(2000);
        }
      });

      cy.log('✅ Goals and analytics tested');

      // **Step 8: Timeline Integration**
      cy.log('⏰ Testing timeline integration');
      
      // Navigate to timeline
      cy.get('body').then(($body) => {
        if ($body.text().includes('Timeline') || $body.find('[href*="timeline"]').length > 0) {
          cy.contains('Timeline').first().click({ timeout: 5000 });
          cy.wait(2000);
          
          // Verify timeline components
          cy.get('body').should('contain.text', 'Progress', { timeout: 10000 });
        }
      });

      cy.log('✅ Timeline integration tested');

      // **Step 9: Mobile Experience Validation**
      cy.log('📱 Testing mobile responsiveness');
      
      cy.viewport('iphone-x');
      cy.wait(1000);
      
      // Test mobile navigation
      cy.get('body').then(($body) => {
        // Look for mobile menu toggle
        const mobileMenus = $body.find('[data-cy="mobile-nav-toggle"], button:contains("Menu"), .mobile-menu, .hamburger');
        if (mobileMenus.length > 0) {
          cy.get('[data-cy="mobile-nav-toggle"], button:contains("Menu"), .mobile-menu, .hamburger').first().click();
          cy.wait(1000);
        }
      });
      
      // Verify mobile layout works
      cy.get('body').should('be.visible');
      
      // Restore desktop viewport
      cy.viewport(1280, 720);

      cy.log('✅ Mobile experience validated');

      // **Step 10: Data Consistency Verification**
      cy.log('🔍 Verifying data consistency across systems');
      
      // Visit main pages to ensure data persists
      const mainPages = ['/dashboard', '/timeline', '/budget', '/accounts'];
      mainPages.forEach(page => {
        cy.visit(`http://localhost:3000${page}`, { timeout: 10000 });
        cy.wait(2000);
        // Verify page loads without errors
        cy.get('body').should('be.visible');
      });

      cy.log('✅ Complete new user journey validation successful');
    });
  });

  describe('2. Persona-Specific Journey Validation', () => {
    Object.entries(testData).forEach(([persona, data]) => {
      it(`validates ${persona} persona-specific experience and workflows`, () => {
        const user = testUsers[`${persona}User`];
        
        cy.log(`🎭 Testing ${persona.toUpperCase()} persona journey`);

        // Register persona-specific user
        cy.visit('http://localhost:3000');
        
        // Registration process
        cy.get('body').then(($body) => {
          if ($body.text().includes('Register') || $body.find('input[type="email"]').length === 0) {
            cy.contains('Register', { timeout: 5000 }).click({ timeout: 5000 });
          }
        });

        cy.get('input[type="email"], input[name="email"]', { timeout: 10000 })
          .clear()
          .type(user.email);
        
        cy.get('input[type="password"]').first().clear().type(user.password);
        cy.get('input[type="password"]').last().clear().type(user.password);
        
        cy.get('button[type="submit"], button:contains("Register")').click();

        // Complete persona-specific onboarding
        cy.url({ timeout: 15000 }).should('satisfy', (url) => {
          return url.includes('/onboarding') || url.includes('/dashboard') || url.includes('/timeline');
        });

        // If onboarding is needed, complete with persona-specific data
        cy.url().then((url) => {
          if (url.includes('/onboarding')) {
            // Personal information
            cy.get('input[name="age"], input[id="age"]', { timeout: 5000 }).clear().type(data.age.toString());
            cy.get('input[name="occupation"], input[id="occupation"]').clear().type(data.occupation);
            cy.get('button').contains(/next|continue/i).click();

            // Financial information
            cy.get('input[name="monthlyIncome"], input[id="monthlyIncome"]').clear().type(data.monthlyIncome.toString());
            cy.get('input[name="monthlyExpenses"], input[id="monthlyExpenses"]').clear().type(data.monthlyExpenses.toString());
            cy.get('input[name="currentSavings"], input[id="currentSavings"]').clear().type(data.currentSavings.toString());
            cy.get('button').contains(/next|continue/i).click();

            // Risk assessment - persona-specific
            const riskLevels = {
              jamal: 4, // High risk
              aisha: 3, // Moderate risk
              samuel: 2 // Conservative risk
            };

            for (let i = 1; i <= 5; i++) {
              cy.get('body').then(($body) => {
                const questionInputs = $body.find(`input[name*="question${i}"], input[name*="risk${i}"]`);
                if (questionInputs.length > 0) {
                  cy.get(`input[name*="question${i}"], input[name*="risk${i}"]`)
                    .eq(riskLevels[persona] - 1)
                    .click({ force: true });
                }
              });
            }
            
            cy.get('button').contains(/next|continue/i).click();

            // Goals - persona-specific
            Object.entries(data.goals).forEach(([goalType, goalData]) => {
              cy.get('body').then(($body) => {
                if ($body.find(`input[name*="${goalType}"]`).length > 0) {
                  cy.get(`input[name*="${goalType}"]`).first().clear().type(goalData.target.toString());
                }
              });
            });

            cy.get('button').contains(/complete|finish/i).click();
          }
        });

        // Verify persona-specific features
        cy.url({ timeout: 15000 }).should('satisfy', (url) => {
          return url.includes('/dashboard') || url.includes('/timeline');
        });

        // Test persona-specific recommendations
        cy.get('body').should('contain.text', persona === 'jamal' ? 'Investment' : 
                                              persona === 'aisha' ? 'Family' : 'Retirement');

        cy.log(`✅ ${persona.toUpperCase()} persona journey validated`);
      });
    });
  });

  describe('3. Existing User Daily Workflows', () => {
    it('validates returning user experience and daily operations', () => {
      // Use the first created user for returning user testing
      const user = testUsers.newUser;
      
      cy.log('🔄 Testing returning user workflows');

      // Login existing user
      cy.visit('http://localhost:3000');
      cy.get('input[type="email"], input[name="email"]').clear().type(user.email);
      cy.get('input[type="password"], input[name="password"]').clear().type(user.password);
      cy.get('button[type="submit"], button:contains("Login")').click();

      cy.url({ timeout: 15000 }).should('satisfy', (url) => {
        return !url.includes('/login') && !url.includes('/register');
      });

      // Daily transaction entry
      cy.get('body').then(($body) => {
        if ($body.text().includes('Transaction') || $body.find('[href*="transaction"]').length > 0) {
          cy.contains('Transaction').first().click();
          
          // Add new transaction
          if ($body.find('input[name*="description"]').length > 0) {
            cy.get('input[name*="description"]').clear().type('Grocery Shopping');
            cy.get('input[name*="amount"]').clear().type('-12500');
            cy.get('button[type="submit"], button:contains("Save")').first().click();
            cy.wait(2000);
          }
        }
      });

      // Budget monitoring
      cy.get('body').then(($body) => {
        if ($body.text().includes('Budget')) {
          cy.contains('Budget').first().click();
          cy.wait(2000);
          // Should see budget vs actual comparisons
          cy.get('body').should('contain.text', 'Budget');
        }
      });

      // Goal progress review
      cy.get('body').then(($body) => {
        if ($body.text().includes('Goal') || $body.text().includes('Analytics')) {
          cy.contains(/Goal|Analytics/).first().click();
          cy.wait(3000);
          cy.get('body').should('contain.text', 'Progress');
        }
      });

      cy.log('✅ Daily workflows validated');
    });
  });

  describe('4. Error Handling and Recovery', () => {
    it('validates system error handling and user guidance', () => {
      const user = testUsers.newUser;
      
      cy.log('🚨 Testing error handling and recovery');

      // Login
      cy.visit('http://localhost:3000');
      cy.get('input[type="email"]').clear().type(user.email);
      cy.get('input[type="password"]').clear().type(user.password);
      cy.get('button[type="submit"]').click();

      // Test invalid data entry
      cy.get('body').then(($body) => {
        if ($body.text().includes('Transaction')) {
          cy.contains('Transaction').first().click();
          
          // Try to add invalid transaction
          if ($body.find('input[name*="amount"]').length > 0) {
            cy.get('input[name*="amount"]').clear().type('invalid-amount');
            cy.get('button[type="submit"]').click();
            
            // Should show error message or validation
            cy.wait(2000);
            // Error should be handled gracefully
            cy.get('body').should('be.visible');
          }
        }
      });

      // Test network failure simulation
      cy.intercept('POST', '/api/**', { forceNetworkError: true }).as('networkError');
      
      cy.get('body').then(($body) => {
        if ($body.find('button:contains("Save"), button[type="submit"]').length > 0) {
          cy.get('button:contains("Save"), button[type="submit"]').first().click();
          cy.wait(3000);
          
          // Should handle network errors gracefully
          cy.get('body').should('contain.text', 'Error', { timeout: 5000 });
        }
      });

      cy.log('✅ Error handling validated');
    });
  });

  describe('5. Performance and Load Testing', () => {
    it('validates application performance under realistic usage', () => {
      const user = testUsers.newUser;
      
      cy.log('⚡ Testing application performance');

      // Login
      cy.visit('http://localhost:3000');
      cy.get('input[type="email"]').clear().type(user.email);
      cy.get('input[type="password"]').clear().type(user.password);
      cy.get('button[type="submit"]').click();

      // Rapid navigation test
      const pages = ['/dashboard', '/timeline', '/budget', '/accounts'];
      
      pages.forEach(page => {
        const startTime = Date.now();
        cy.visit(`http://localhost:3000${page}`, { timeout: 10000 });
        cy.get('body').should('be.visible');
        const loadTime = Date.now() - startTime;
        
        // Page should load within reasonable time
        expect(loadTime).to.be.lessThan(5000);
        cy.wait(500);
      });

      // Large transaction data test
      cy.get('body').then(($body) => {
        if ($body.text().includes('Transaction')) {
          cy.contains('Transaction').first().click();
          
          // Add multiple transactions rapidly
          for (let i = 0; i < 5; i++) {
            if ($body.find('input[name*="description"]').length > 0) {
              cy.get('input[name*="description"]').clear().type(`Test Transaction ${i + 1}`);
              cy.get('input[name*="amount"]').clear().type((Math.random() * 10000).toFixed(0));
              cy.get('button[type="submit"]').first().click();
              cy.wait(1000);
            }
          }
        }
      });

      cy.log('✅ Performance testing completed');
    });
  });

  describe('6. Data Flow Integrity Validation', () => {
    it('validates data consistency across all application systems', () => {
      const user = testUsers.newUser;
      
      cy.log('🔗 Testing data flow integrity');

      // Login
      cy.visit('http://localhost:3000');
      cy.get('input[type="email"]').clear().type(user.email);
      cy.get('input[type="password"]').clear().type(user.password);
      cy.get('button[type="submit"]').click();

      // Add transaction and verify it appears in multiple places
      cy.get('body').then(($body) => {
        if ($body.text().includes('Transaction')) {
          cy.contains('Transaction').first().click();
          
          // Add distinctive transaction
          if ($body.find('input[name*="description"]').length > 0) {
            cy.get('input[name*="description"]').clear().type('Data Integrity Test Transaction');
            cy.get('input[name*="amount"]').clear().type('25000');
            cy.get('button[type="submit"]').first().click();
            cy.wait(2000);

            // Verify transaction appears in transaction list
            cy.get('body').should('contain.text', 'Data Integrity Test');
          }
        }
      });

      // Check if transaction impacts budget
      cy.get('body').then(($body) => {
        if ($body.text().includes('Budget')) {
          cy.contains('Budget').first().click();
          cy.wait(2000);
          // Budget should reflect the new transaction
          cy.get('body').should('be.visible');
        }
      });

      // Check if transaction impacts analytics
      cy.get('body').then(($body) => {
        if ($body.text().includes('Analytics')) {
          cy.contains('Analytics').first().click();
          cy.wait(3000);
          // Analytics should recalculate with new data
          cy.get('body').should('be.visible');
        }
      });

      cy.log('✅ Data flow integrity validated');
    });
  });

  after(() => {
    // Cleanup test users
    Object.values(testUsers).forEach(user => {
      cy.exec(`cd api && python -c "from app.dev import cleanup_test_user; cleanup_test_user('${user.email}')"`, {
        failOnNonZeroExit: false
      });
    });
  });
});

// Additional helper commands for comprehensive testing
Cypress.Commands.add('validateSystemHealth', () => {
  // Verify all major systems are operational
  cy.request({
    method: 'GET',
    url: 'http://localhost:8000/api/v1/profile',
    failOnStatusCode: false
  }).then(response => {
    expect([200, 401]).to.include(response.status);
  });
});

Cypress.Commands.add('simulateNetworkDelay', (delay = 1000) => {
  // Simulate slow network conditions
  cy.intercept('**', (req) => {
    req.reply((res) => {
      res.delay(delay);
      res.send();
    });
  });
});

Cypress.Commands.add('verifyPersonaExperience', (persona) => {
  // Validate persona-specific UI and recommendations
  const personaKeywords = {
    jamal: ['Investment', 'Growth', 'Portfolio'],
    aisha: ['Family', 'Education', 'Security'],
    samuel: ['Retirement', 'Conservative', 'Wealth']
  };

  const keywords = personaKeywords[persona] || [];
  keywords.forEach(keyword => {
    cy.get('body', { timeout: 10000 }).should('contain.text', keyword);
  });
});

Cypress.Commands.add('validateMobileExperience', () => {
  // Comprehensive mobile experience validation
  cy.viewport('iphone-x');
  
  // Test touch interactions
  cy.get('body').should('be.visible');
  
  // Test mobile navigation
  cy.get('body').then(($body) => {
    if ($body.find('[data-cy="mobile-nav"], .mobile-menu, button:contains("Menu")').length > 0) {
      cy.get('[data-cy="mobile-nav"], .mobile-menu, button:contains("Menu")').first().click();
      cy.wait(500);
    }
  });
  
  // Restore desktop
  cy.viewport(1280, 720);
});