/// <reference types="cypress" />
import { seedScenario, assertExpectation } from './_journeyUtils';

describe('Dashboard feature depth — 200 journeys', () => {
  let scenarios = [];
  const results = [];
  before(() => {
    cy.fixture('scenarios/dashboard.json').then((data) => { scenarios = data; });
  });

  it('runs dashboard scenarios', () => {
    const mode = (Cypress.env('API_MODE') || 'integration').toLowerCase();
    scenarios.forEach((s) => {
      cy.log(`Scenario #${s.id}: ${s.description}`);
      cy.window().then(() => seedScenario(s.seed, mode));
      cy.visit('/app/dashboard');
      cy.window().then((win) => {
        let passed = true;
        try {
          (s.expect || []).forEach(exp => assertExpectation(win, exp));
        } catch (e) { passed = false; }
        results.push({ id: s.id, desc: s.description, passed });
      });
    });
  });

  after(() => {
    cy.writeFile('frontend/cypress/reports/feature-depth-dashboard.json', { generatedAt: new Date().toISOString(), results });
  });
});
