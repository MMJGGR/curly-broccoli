import { 
  PERSONAS, 
  PRD_TARGETS,
  fillLoginForm, 
  assertDashboardWelcome, 
  assertOnAuthPage,
  completePersonaOnboarding
} from '../support/test-data.js';

describe('Complete Persona Testing Suite', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.hideWebpackOverlay();
  });

  describe('Persona Login Validation', () => {
    it('should login all user personas successfully', () => {
      const userPersonas = [
        { persona: PERSONAS.users.jamal, name: 'Jamal Mwangi (Early Career)' },
        { persona: PERSONAS.users.aisha, name: 'Aisha Kimani (Family & Property)' },
        { persona: PERSONAS.users.samuel, name: 'Samuel Ochieng (Pre-Retirement)' }
      ];

      userPersonas.forEach(({ persona, name }) => {
        cy.visit('/auth');
        
        fillLoginForm(persona.email, persona.password).then((interception) => {
          expect(interception.response.statusCode).to.equal(200);
          expect(interception.response.body).to.have.property('access_token');
        });
        
        assertDashboardWelcome();
        cy.log(`✅ ${name} login successful`);
        
        // Logout for next iteration
        cy.get('button').contains('Logout').click();
        assertOnAuthPage();
        cy.clearLocalStorage();
      });
    });

    it('should login advisor personas successfully', () => {
      const advisorPersonas = [
        { persona: PERSONAS.advisors.emily, name: 'Emily Chen (Fee-only CFP)' }
      ];

      advisorPersonas.forEach(({ persona, name }) => {
        cy.visit('/auth');
        
        fillLoginForm(persona.email, persona.password).then((interception) => {
          expect(interception.response.statusCode).to.equal(200);
          expect(interception.response.body).to.have.property('access_token');
          
          // Verify advisor role if available in response
          if (interception.response.body.user) {
            expect(interception.response.body.user.role).to.equal('advisor');
          }
        });
        
        assertDashboardWelcome();
        cy.log(`✅ ${name} advisor login successful`);
        
        cy.get('button').contains('Logout').click();
        assertOnAuthPage();
        cy.clearLocalStorage();
      });
    });
  });

  describe('PRD Alignment Assessment', () => {
    it('should assess current personas against PRD specifications', () => {
      const assessmentResults = [];

      const personas = [
        { key: 'jamal', persona: PERSONAS.users.jamal, target: PRD_TARGETS.users.jamal },
        { key: 'aisha', persona: PERSONAS.users.aisha, target: PRD_TARGETS.users.aisha },
        { key: 'samuel', persona: PERSONAS.users.samuel, target: PRD_TARGETS.users.samuel },
        { key: 'emily', persona: PERSONAS.advisors.emily, target: PRD_TARGETS.advisors.emily }
      ];

      personas.forEach(({ key, persona, target }) => {
        cy.visit('/auth');
        fillLoginForm(persona.email, persona.password);
        assertDashboardWelcome();

        cy.get('body').then(($body) => {
          const bodyText = $body.text();
          
          const assessment = {
            persona: key,
            current: persona.profile,
            target: target,
            gaps: {
              lastName: persona.profile.last_name !== target.last_name,
              description: persona.profile.description !== target.description
            },
            ui: {
              profileVisible: bodyText.includes(persona.profile.first_name),
              editAvailable: bodyText.includes('Edit Profile') || bodyText.includes('Settings')
            }
          };

          assessmentResults.push(assessment);
          
          cy.log(`=== ${key.toUpperCase()} PRD ALIGNMENT ===`);
          cy.log(`Current: ${persona.profile.first_name} ${persona.profile.last_name}`);
          cy.log(`Target:  ${target.first_name} ${target.last_name}`);
          cy.log(`Last Name Gap: ${assessment.gaps.lastName ? 'YES' : 'NO'}`);
          cy.log(`Description Gap: ${assessment.gaps.description ? 'YES' : 'NO'}`);
          cy.log(`Profile Editing Available: ${assessment.ui.editAvailable ? 'YES' : 'NO'}`);
        });

        cy.get('button').contains('Logout').click();
        cy.clearLocalStorage();
      });

      cy.then(() => {
        const report = {
          timestamp: new Date().toISOString(),
          totalPersonas: assessmentResults.length,
          personasWithGaps: assessmentResults.filter(p => p.gaps.lastName || p.gaps.description).length,
          profileEditingAvailable: assessmentResults.filter(p => p.ui.editAvailable).length,
          results: assessmentResults
        };
        
        cy.writeFile('cypress/reports/prd-alignment-assessment.json', report);
        
        cy.log('=== PRD ALIGNMENT SUMMARY ===');
        cy.log(`Total Personas: ${report.totalPersonas}`);
        cy.log(`Personas with PRD Gaps: ${report.personasWithGaps}`);
        cy.log(`Profile Editing Available: ${report.profileEditingAvailable}`);
      });
    });
  });

  describe('Profile CRUD Testing', () => {
    it('should test profile editing capabilities', () => {
      cy.visit('/auth');
      fillLoginForm(PERSONAS.users.aisha.email, PERSONAS.users.aisha.password);
      assertDashboardWelcome();

      cy.get('body').then(($body) => {
        const bodyText = $body.text();
        
        if (bodyText.includes('Edit Profile') || bodyText.includes('Settings')) {
          cy.log('✅ Profile editing functionality detected');
          
          // Try to access profile edit
          cy.get('button, a').contains(/Edit Profile|Settings/i).first().click();
          
          // Test basic field updates
          cy.get('body').then(($formBody) => {
            // Look for form fields
            const formText = $formBody.text();
            
            if (formText.includes('Last Name') || formText.includes('lastName')) {
              cy.get('input[id*="lastName"], input[name*="lastName"]').then(($lastName) => {
                if ($lastName.length > 0) {
                  const currentValue = $lastName.val();
                  const targetValue = PRD_TARGETS.users.aisha.last_name;
                  
                  cy.wrap($lastName).clear().type(targetValue);
                  cy.log(`✅ Updated last name: ${currentValue} → ${targetValue}`);
                  
                  // Try to save
                  cy.get('button[type="submit"], button').contains(/Save|Update|Submit/i).then(($saveBtn) => {
                    if ($saveBtn.length > 0) {
                      cy.wrap($saveBtn).click();
                      cy.log('✅ Profile update submitted');
                      
                      // Verify update (wait for potential redirect)
                      cy.wait(2000);
                      cy.get('body').then(($updatedBody) => {
                        if ($updatedBody.text().includes(targetValue)) {
                          cy.log('✅ Profile update successful and verified');
                        } else {
                          cy.log('ℹ️  Profile update submitted but not visible in UI');
                        }
                      });
                    } else {
                      cy.log('ℹ️  Save button not found');
                    }
                  });
                } else {
                  cy.log('ℹ️  Last name field not found');
                }
              });
            } else {
              cy.log('ℹ️  Profile form fields not detected');
            }
          });
        } else {
          cy.log('ℹ️  Profile editing not available - testing read-only view');
          cy.get('body').should('contain', PERSONAS.users.aisha.profile.first_name);
        }
      });
    });

    it('should test profile field validation', () => {
      cy.visit('/auth');
      fillLoginForm(PERSONAS.users.jamal.email, PERSONAS.users.jamal.password);
      assertDashboardWelcome();

      cy.get('body').then(($body) => {
        if ($body.text().includes('Edit Profile') || $body.text().includes('Settings')) {
          cy.get('button, a').contains(/Edit Profile|Settings/i).first().click();
          
          // Test empty field validation
          cy.get('input[id*="firstName"], input[name*="firstName"]').then(($firstName) => {
            if ($firstName.length > 0) {
              cy.wrap($firstName).clear();
              cy.get('button[type="submit"], button').contains(/Save|Update|Submit/i).click();
              
              cy.get('body').then(($validationBody) => {
                const validationText = $validationBody.text();
                if (validationText.includes('required') || validationText.includes('error')) {
                  cy.log('✅ Field validation working - empty first name rejected');
                } else {
                  cy.log('ℹ️  No validation messages detected for empty fields');
                }
              });
              
              // Restore valid data
              cy.wrap($firstName).type(PERSONAS.users.jamal.profile.first_name);
            }
          });
        }
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid login credentials', () => {
      const invalidAttempts = [
        { email: 'jamal@example.com', password: 'wrongpassword' },
        { email: 'nonexistent@example.com', password: 'anypassword' },
        { email: 'emily.advisor@example.com', password: 'wrongpass' }
      ];
      
      invalidAttempts.forEach(({ email, password }) => {
        cy.visit('/auth');
        
        fillLoginForm(email, password).then((interception) => {
          expect(interception.response.statusCode).to.be.oneOf([400, 401, 422]);
        });
        
        cy.get('body').should('contain', 'Invalid credentials');
        assertOnAuthPage();
        cy.log(`✅ Invalid credentials handled: ${email}`);
      });
    });

    it('should handle session management', () => {
      // Test session persistence
      cy.visit('/auth');
      fillLoginForm(PERSONAS.users.jamal.email, PERSONAS.users.jamal.password);
      assertDashboardWelcome();
      
      // Refresh page
      cy.reload();
      cy.url().should('include', '/dashboard');
      cy.get('body').should('contain', 'Welcome');
      cy.log('✅ Session persistence verified');
      
      // Test logout
      cy.get('button').contains('Logout').click();
      assertOnAuthPage();
      
      // Verify token cleared
      cy.window().then((window) => {
        expect(window.localStorage.getItem('jwt')).to.be.null;
      });
      cy.log('✅ Logout and token cleanup verified');
    });
  });

  describe('Performance Testing', () => {
    it('should complete persona operations within performance limits', () => {
      const startTime = Date.now();
      
      cy.visit('/auth');
      fillLoginForm(PERSONAS.users.aisha.email, PERSONAS.users.aisha.password);
      assertDashboardWelcome();
      
      const loginTime = Date.now() - startTime;
      expect(loginTime).to.be.lessThan(10000); // 10 second max
      cy.log(`✅ Login completed in ${loginTime}ms`);
      
      // Test profile access speed if available
      cy.get('body').then(($body) => {
        if ($body.text().includes('Edit Profile')) {
          const profileStartTime = Date.now();
          cy.get('button, a').contains('Edit Profile').first().click();
          
          cy.get('input, textarea').first().then(() => {
            const profileLoadTime = Date.now() - profileStartTime;
            expect(profileLoadTime).to.be.lessThan(5000); // 5 second max
            cy.log(`✅ Profile form loaded in ${profileLoadTime}ms`);
          });
        }
      });
    });
  });
});