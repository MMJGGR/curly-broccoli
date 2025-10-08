/// <reference types="cypress" />
import { seedScenario, assertExpectation } from './_journeyUtils';

describe('Plan feature depth — 200 journeys', () => {
  let scenarios = [];
  const results = [];
  before(() => { cy.fixture('scenarios/plan.json').then((d) => { scenarios = d; }); });

  it('runs plan scenarios', () => {
    const mode = (Cypress.env('API_MODE') || 'integration').toLowerCase();
    scenarios.forEach((s) => {
      cy.log(`Scenario #${s.id}: ${s.description}`);
      cy.window().then(() => seedScenario(s.seed, mode));
      cy.visit('/app/plan');
      cy.window().then((win) => {
        if (s.steps) {
          s.steps.forEach(step => {
            if (step.action === 'setPlanningStart' && win.__UFC__) {
              const ctx = win.__UFC__;
              ctx.state && localStorage.setItem('planning_start_date', `${step.value}-01`);
            }
          });
        }
        let passed = true;
        try {
          (s.expect || []).forEach(exp => assertExpectation(win, exp));
        } catch (e) { passed = false; }
        results.push({ id: s.id, desc: s.description, passed });
      });
    });
  });

  after(() => {
    cy.writeFile('frontend/cypress/reports/feature-depth-plan.json', { generatedAt: new Date().toISOString(), results });
  });
});
