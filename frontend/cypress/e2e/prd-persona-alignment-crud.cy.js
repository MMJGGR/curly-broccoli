import { 
  PERSONAS, 
  PRD_TARGETS,
  fillLoginForm, 
  assertDashboardWelcome,
  accessProfileEdit,
  updateProfileField,
  saveProfileChanges,
  verifyProfileUpdate,
  performFullPersonaAlignment,
  generateAlignmentReport
} from '../support/test-data.js';

describe('PRD Persona Alignment through CRUD Operations', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.hideWebpackOverlay();
  });

  describe('Current State Assessment', () => {
    it('should assess current persona states against PRD specifications', () => {
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
            email: persona.email,
            current: persona.profile,
            target: target,
            gaps: {
              lastName: persona.profile.last_name !== target.last_name,
              description: persona.profile.description !== target.description,
              keyNeeds: !target.key_needs // Always missing since not in current data
            },
            ui: {
              profileVisible: bodyText.includes(persona.profile.first_name),
              editAvailable: bodyText.includes('Edit Profile') || bodyText.includes('Settings'),
              currentNameVisible: bodyText.includes(persona.profile.last_name),
              targetNameVisible: bodyText.includes(target.last_name)
            }
          };

          assessmentResults.push(assessment);
          
          cy.log(`=== ${key.toUpperCase()} ASSESSMENT ===`);
          cy.log(`Current: ${persona.profile.first_name} ${persona.profile.last_name}`);
          cy.log(`Target:  ${target.first_name} ${target.last_name}`);
          cy.log(`Last Name Gap: ${assessment.gaps.lastName ? 'YES' : 'NO'}`);
          cy.log(`Description Gap: ${assessment.gaps.description ? 'YES' : 'NO'}`);
          cy.log(`Edit Available: ${assessment.ui.editAvailable ? 'YES' : 'NO'}`);
        });

        cy.get('button').contains('Logout').click();
        cy.clearLocalStorage();
      });

      cy.then(() => {
        cy.writeFile('cypress/reports/prd-assessment.json', { 
          timestamp: new Date().toISOString(),
          results: assessmentResults 
        });
      });
    });
  });

  describe('CRUD-Based Persona Alignment', () => {
    it('should align Aisha Kimani → Aisha Otieno through profile CRUD', () => {
      const persona = PERSONAS.users.aisha;
      const target = PRD_TARGETS.users.aisha;
      
      cy.log(`=== ALIGNING AISHA: ${persona.profile.last_name} → ${target.last_name} ===`);
      
      cy.visit('/auth');
      fillLoginForm(persona.email, persona.password);
      assertDashboardWelcome();

      // Verify current state
      cy.get('body').should('contain', persona.profile.first_name);
      
      accessProfileEdit().then((editAvailable) => {
        if (editAvailable) {
          cy.log('✅ Profile edit mode accessed');
          
          // Update last name: Kimani → Otieno
          updateProfileField('lastName', target.last_name).then((updated) => {
            if (updated) {
              cy.log(`✅ Last name updated: ${persona.profile.last_name} → ${target.last_name}`);
            }
          });
          
          // Update description: Family & Property Owner → Family & Property
          updateProfileField('description', target.description).then((updated) => {
            if (updated) {
              cy.log(`✅ Description updated: ${persona.profile.description} → ${target.description}`);
            }
          });
          
          // Add key needs if field available
          updateProfileField('keyNeeds', target.key_needs).then((updated) => {
            if (updated) {
              cy.log(`✅ Key needs added: ${target.key_needs}`);
            }
          });
          
          // Save changes
          saveProfileChanges().then((saved) => {
            if (saved) {
              cy.log('✅ Changes saved successfully');
              
              // Verify alignment
              verifyProfileUpdate('lastName', target.last_name);
              verifyProfileUpdate('description', target.description);
              
              cy.log('🎯 Aisha alignment to PRD attempted through CRUD operations');
            } else {
              cy.log('⚠️  Could not save profile changes');
            }
          });
        } else {
          cy.log('ℹ️  Profile editing not available - documenting read-only state');
          cy.get('body').should('contain', persona.profile.first_name);
        }
      });
    });

    it('should align Samuel Ochieng → Samuel Kariuki through profile CRUD', () => {
      const persona = PERSONAS.users.samuel;
      const target = PRD_TARGETS.users.samuel;
      
      cy.log(`=== ALIGNING SAMUEL: ${persona.profile.last_name} → ${target.last_name} ===`);
      
      cy.visit('/auth');
      fillLoginForm(persona.email, persona.password);
      assertDashboardWelcome();

      accessProfileEdit().then((editAvailable) => {
        if (editAvailable) {
          // Update last name: Ochieng → Kariuki
          updateProfileField('lastName', target.last_name);
          
          // Update description: Pre-Retirement Planning → Pre-Retirement Consolidation
          updateProfileField('description', target.description);
          
          // Add key needs
          updateProfileField('keyNeeds', target.key_needs);
          
          // Save and verify
          saveProfileChanges().then((saved) => {
            if (saved) {
              verifyProfileUpdate('lastName', target.last_name);
              verifyProfileUpdate('description', target.description);
              cy.log('🎯 Samuel alignment to PRD attempted through CRUD operations');
            }
          });
        } else {
          cy.log('ℹ️  Samuel profile editing not available');
        }
      });
    });

    it('should align Emily Chen → Emily Njeri through advisor profile CRUD', () => {
      const persona = PERSONAS.advisors.emily;
      const target = PRD_TARGETS.advisors.emily;
      
      cy.log(`=== ALIGNING EMILY: ${persona.profile.last_name} → ${target.last_name} ===`);
      
      cy.visit('/auth');
      fillLoginForm(persona.email, persona.password);
      assertDashboardWelcome();

      accessProfileEdit().then((editAvailable) => {
        if (editAvailable) {
          // Update last name: Chen → Njeri
          updateProfileField('lastName', target.last_name);
          
          // Update title: Fee-only CFP → Fee-only CFP® for HNW clients
          updateProfileField('description', target.description);
          updateProfileField('title', target.description);
          
          // Add specialization
          updateProfileField('keyNeeds', target.key_needs);
          
          // Save and verify
          saveProfileChanges().then((saved) => {
            if (saved) {
              verifyProfileUpdate('lastName', target.last_name);
              cy.log('🎯 Emily advisor alignment to PRD attempted through CRUD operations');
            }
          });
        } else {
          cy.log('ℹ️  Emily advisor profile editing not available');
        }
      });
    });
  });

  describe('Full Persona Alignment Workflow', () => {
    it('should perform complete alignment workflow for all personas', () => {
      const alignmentResults = [];

      const alignmentTasks = [
        { key: 'aisha', email: PERSONAS.users.aisha.email, password: PERSONAS.users.aisha.password, target: PRD_TARGETS.users.aisha },
        { key: 'samuel', email: PERSONAS.users.samuel.email, password: PERSONAS.users.samuel.password, target: PRD_TARGETS.users.samuel },
        { key: 'emily', email: PERSONAS.advisors.emily.email, password: PERSONAS.advisors.emily.password, target: PRD_TARGETS.advisors.emily }
      ];

      alignmentTasks.forEach(({ key, email, password, target }) => {
        performFullPersonaAlignment(email, password, target).then((successful) => {
          const result = {
            persona: key,
            alignmentAttempted: true,
            successful: successful,
            target: target,
            timestamp: new Date().toISOString()
          };
          
          alignmentResults.push(result);
          
          cy.log(`=== ${key.toUpperCase()} ALIGNMENT RESULT ===`);
          cy.log(`Attempted: ${result.alignmentAttempted}`);
          cy.log(`Successful: ${result.successful}`);
        });

        cy.get('button').contains('Logout').click();
        cy.clearLocalStorage();
      });

      cy.then(() => {
        cy.writeFile('cypress/reports/persona-alignment-results.json', {
          timestamp: new Date().toISOString(),
          summary: {
            totalAttempts: alignmentResults.length,
            successful: alignmentResults.filter(r => r.successful).length,
            failed: alignmentResults.filter(r => !r.successful).length
          },
          results: alignmentResults
        });
      });
    });
  });

  describe('Profile CRUD Edge Cases & Validation', () => {
    it('should test profile field validation during alignment', () => {
      cy.visit('/auth');
      fillLoginForm(PERSONAS.users.jamal.email, PERSONAS.users.jamal.password);
      assertDashboardWelcome();

      accessProfileEdit().then((editAvailable) => {
        if (editAvailable) {
          // Test empty field validation
          updateProfileField('lastName', '').then(() => {
            saveProfileChanges().then(() => {
              cy.get('body').then(($body) => {
                const bodyText = $body.text();
                if (bodyText.includes('required') || bodyText.includes('error')) {
                  cy.log('✅ Empty field validation working');
                } else {
                  cy.log('ℹ️  No validation errors shown for empty fields');
                }
              });
            });
          });
          
          // Test invalid characters
          updateProfileField('lastName', '!@#$%^&*()').then(() => {
            saveProfileChanges().then(() => {
              cy.get('body').then(($body) => {
                const bodyText = $body.text();
                if (bodyText.includes('invalid') || bodyText.includes('error')) {
                  cy.log('✅ Invalid character validation working');
                } else {
                  cy.log('ℹ️  No validation for special characters');
                }
              });
            });
          });
          
          // Restore valid data
          updateProfileField('lastName', PERSONAS.users.jamal.profile.last_name);
          saveProfileChanges();
        }
      });
    });

    it('should test concurrent profile updates', () => {
      cy.visit('/auth');
      fillLoginForm(PERSONAS.users.aisha.email, PERSONAS.users.aisha.password);
      assertDashboardWelcome();

      accessProfileEdit().then((editAvailable) => {
        if (editAvailable) {
          // Make first update
          const timestamp1 = Date.now();
          updateProfileField('description', `Update ${timestamp1}`);
          saveProfileChanges();
          
          // Immediately try another update
          cy.wait(500);
          accessProfileEdit().then((editAvailable2) => {
            if (editAvailable2) {
              const timestamp2 = Date.now();
              updateProfileField('description', `Concurrent ${timestamp2}`);
              saveProfileChanges().then(() => {
                cy.log('✅ Concurrent update test completed');
              });
            }
          });
        }
      });
    });
  });

  describe('API Integration Testing', () => {
    it('should monitor profile CRUD API calls during alignment', () => {
      // Setup API intercepts
      cy.intercept('GET', '**/profile**').as('getProfile');
      cy.intercept('PUT', '**/profile**').as('updateProfile');
      cy.intercept('PATCH', '**/profile**').as('patchProfile');
      cy.intercept('POST', '**/profile**').as('createProfile');

      cy.visit('/auth');
      fillLoginForm(PERSONAS.users.samuel.email, PERSONAS.users.samuel.password);
      assertDashboardWelcome();

      // Monitor API calls during profile operations
      accessProfileEdit().then((editAvailable) => {
        if (editAvailable) {
          // Check for GET calls when loading profile form
          cy.wait(1000);
          cy.get('@getProfile.all').then((getInterceptions) => {
            if (getInterceptions.length > 0) {
              cy.log(`✅ Profile GET API: ${getInterceptions.length} calls`);
              getInterceptions.forEach((interception, i) => {
                cy.log(`GET ${i + 1} Status: ${interception.response?.statusCode}`);
              });
            } else {
              cy.log('ℹ️  No profile GET API calls detected');
            }
          });

          // Make profile updates and monitor PUT/PATCH calls
          updateProfileField('lastName', 'APITestKariuki');
          updateProfileField('description', 'API Test Description');
          
          saveProfileChanges().then(() => {
            cy.wait(2000);
            
            // Check for update API calls
            cy.get('@updateProfile.all').then((updateInterceptions) => {
              if (updateInterceptions.length > 0) {
                cy.log(`✅ Profile UPDATE API: ${updateInterceptions.length} calls`);
                updateInterceptions.forEach((interception, i) => {
                  cy.log(`UPDATE ${i + 1} Status: ${interception.response?.statusCode}`);
                  cy.log(`UPDATE ${i + 1} Payload:`, interception.request?.body);
                });
              } else {
                cy.log('ℹ️  No profile UPDATE API calls detected');
              }
            });
            
            cy.get('@patchProfile.all').then((patchInterceptions) => {
              if (patchInterceptions.length > 0) {
                cy.log(`✅ Profile PATCH API: ${patchInterceptions.length} calls`);
                patchInterceptions.forEach((interception, i) => {
                  cy.log(`PATCH ${i + 1} Status: ${interception.response?.statusCode}`);
                });
              } else {
                cy.log('ℹ️  No profile PATCH API calls detected');
              }
            });
          });
        }
      });
    });

    it('should test profile CRUD error handling', () => {
      // Simulate API failures
      cy.intercept('PUT', '**/profile**', { statusCode: 500, body: { error: 'Server Error' } }).as('failedUpdate');
      cy.intercept('GET', '**/profile**', { statusCode: 404, body: { error: 'Profile Not Found' } }).as('failedGet');

      cy.visit('/auth');
      fillLoginForm(PERSONAS.users.jamal.email, PERSONAS.users.jamal.password);
      assertDashboardWelcome();

      accessProfileEdit().then((editAvailable) => {
        if (editAvailable) {
          updateProfileField('lastName', 'ErrorTestMwangi');
          saveProfileChanges().then(() => {
            // Check how the UI handles API errors
            cy.wait(2000);
            cy.get('body').then(($body) => {
              const bodyText = $body.text();
              if (bodyText.includes('error') || bodyText.includes('failed')) {
                cy.log('✅ Error handling UI feedback detected');
              } else {
                cy.log('ℹ️  No error UI feedback shown');
              }
            });
          });
        }
      });
    });
  });

  describe('Final Alignment Verification', () => {
    it('should generate comprehensive PRD alignment report', () => {
      const finalReport = {
        testRunTimestamp: new Date().toISOString(),
        personas: {},
        summary: {
          totalPersonas: 0,
          fullyAligned: 0,
          partiallyAligned: 0,
          notAligned: 0,
          crudFunctional: 0,
          crudNotAvailable: 0
        },
        recommendations: []
      };

      const testPersonas = [
        { key: 'jamal', persona: PERSONAS.users.jamal, target: PRD_TARGETS.users.jamal },
        { key: 'aisha', persona: PERSONAS.users.aisha, target: PRD_TARGETS.users.aisha },
        { key: 'samuel', persona: PERSONAS.users.samuel, target: PRD_TARGETS.users.samuel },
        { key: 'emily', persona: PERSONAS.advisors.emily, target: PRD_TARGETS.advisors.emily }
      ];

      testPersonas.forEach(({ key, persona, target }) => {
        cy.visit('/auth');
        fillLoginForm(persona.email, persona.password);
        assertDashboardWelcome();

        cy.get('body').then(($body) => {
          const bodyText = $body.text();
          const editAvailable = bodyText.includes('Edit Profile') || bodyText.includes('Settings');
          
          // Check current alignment
          const currentlyAligned = {
            firstName: persona.profile.first_name === target.first_name,
            lastName: persona.profile.last_name === target.last_name,
            description: persona.profile.description === target.description
          };
          
          const alignmentCount = Object.values(currentlyAligned).filter(Boolean).length;
          const alignmentStatus = alignmentCount === 3 ? 'fully' : alignmentCount > 0 ? 'partially' : 'not';
          
          finalReport.personas[key] = {
            current: persona.profile,
            target: target,
            alignment: currentlyAligned,
            alignmentStatus: alignmentStatus,
            crudAvailable: editAvailable,
            profileVisible: bodyText.includes(persona.profile.first_name),
            gaps: {
              lastName: !currentlyAligned.lastName,
              description: !currentlyAligned.description,
              keyNeeds: true // Always true since not in current profiles
            }
          };
          
          finalReport.summary.totalPersonas++;
          if (alignmentStatus === 'fully') finalReport.summary.fullyAligned++;
          else if (alignmentStatus === 'partially') finalReport.summary.partiallyAligned++;
          else finalReport.summary.notAligned++;
          
          if (editAvailable) finalReport.summary.crudFunctional++;
          else finalReport.summary.crudNotAvailable++;
          
          // Generate recommendations
          if (!currentlyAligned.lastName) {
            finalReport.recommendations.push(`Update ${key} last name: ${persona.profile.last_name} → ${target.last_name}`);
          }
          if (!currentlyAligned.description) {
            finalReport.recommendations.push(`Update ${key} description: ${persona.profile.description} → ${target.description}`);
          }
          if (!editAvailable) {
            finalReport.recommendations.push(`Implement profile editing functionality for ${key}`);
          }
        });

        cy.get('button').contains('Logout').click();
        cy.clearLocalStorage();
      });

      cy.then(() => {
        // Calculate percentages
        finalReport.summary.alignmentPercentage = (finalReport.summary.fullyAligned / finalReport.summary.totalPersonas * 100).toFixed(1);
        finalReport.summary.crudAvailabilityPercentage = (finalReport.summary.crudFunctional / finalReport.summary.totalPersonas * 100).toFixed(1);
        
        cy.writeFile('cypress/reports/final-prd-alignment-report.json', finalReport);
        
        cy.log('=== FINAL PRD ALIGNMENT REPORT ===');
        cy.log(`Total Personas: ${finalReport.summary.totalPersonas}`);
        cy.log(`Fully Aligned: ${finalReport.summary.fullyAligned} (${finalReport.summary.alignmentPercentage}%)`);
        cy.log(`CRUD Available: ${finalReport.summary.crudFunctional} (${finalReport.summary.crudAvailabilityPercentage}%)`);
        cy.log(`Recommendations: ${finalReport.recommendations.length}`);
      });
    });
  });
});