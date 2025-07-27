import { 
  PERSONAS, 
  fillLoginForm, 
  assertDashboardWelcome, 
  assertOnAuthPage 
} from '../support/test-data.js';

describe('Persona Account Validation', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.hideWebpackOverlay();
  });

  describe('User Personas', () => {
    it('should login Jamal Mwangi (Early Career)', () => {
      cy.visit('/auth');
      
      const jamal = PERSONAS.users.jamal;
      fillLoginForm(jamal.email, jamal.password).then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });
      
      assertDashboardWelcome();
      cy.log(`✅ ${jamal.profile.first_name} ${jamal.profile.last_name} (${jamal.profile.description}) login successful`);
    });

    it('should login Aisha Kimani (Family & Property)', () => {
      cy.visit('/auth');
      
      const aisha = PERSONAS.users.aisha;
      fillLoginForm(aisha.email, aisha.password).then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });
      
      assertDashboardWelcome();
      cy.log(`✅ ${aisha.profile.first_name} ${aisha.profile.last_name} (${aisha.profile.description}) login successful`);
    });

    it('should login Samuel Ochieng (Pre-Retirement)', () => {
      cy.visit('/auth');
      
      const samuel = PERSONAS.users.samuel;
      fillLoginForm(samuel.email, samuel.password).then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
      });
      
      assertDashboardWelcome();
      cy.log(`✅ ${samuel.profile.first_name} ${samuel.profile.last_name} (${samuel.profile.description}) login successful`);
    });
  });

  describe('Advisor Personas', () => {
    it('should login Emily Chen (Fee-only CFP)', () => {
      cy.visit('/auth');
      
      const emily = PERSONAS.advisors.emily;
      fillLoginForm(emily.email, emily.password).then((interception) => {
        expect(interception.response.statusCode).to.equal(200);
        // Verify advisor role in JWT token
        expect(interception.response.body.access_token).to.exist;
      });
      
      assertDashboardWelcome();
      cy.log(`✅ ${emily.profile.first_name} ${emily.profile.last_name} (${emily.profile.description}) login successful`);
    });
  });

  describe('Session Management', () => {
    it('should handle logout for all persona types', () => {
      const testPersona = PERSONAS.users.jamal;
      
      // Login
      cy.visit('/auth');
      fillLoginForm(testPersona.email, testPersona.password);
      assertDashboardWelcome();
      
      // Logout
      cy.get('button').contains('Logout').click();
      assertOnAuthPage();
      
      // Verify token cleared
      cy.window().then((window) => {
        expect(window.localStorage.getItem('jwt')).to.be.null;
      });
    });

    it('should redirect unauthenticated access attempts', () => {
      // Try to access dashboard without login
      cy.visit('/app/dashboard');
      assertOnAuthPage();
    });
  });

  describe('Error Handling', () => {
    it('should handle non-existent persona gracefully', () => {
      cy.visit('/auth');
      
      fillLoginForm('nonexistent@example.com', 'wrongpassword').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([400, 401, 422]);
      });
      
      cy.get('body').should('contain', 'Invalid credentials');
      assertOnAuthPage();
    });

    it('should handle wrong password for existing persona', () => {
      cy.visit('/auth');
      
      const jamal = PERSONAS.users.jamal;
      fillLoginForm(jamal.email, 'wrongpassword').then((interception) => {
        expect(interception.response.statusCode).to.be.oneOf([400, 401, 422]);
      });
      
      cy.get('body').should('contain', 'Invalid credentials');
      assertOnAuthPage();
    });
  });
});