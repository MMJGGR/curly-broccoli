/// <reference types="cypress" />
import { seedScenario, assertExpectation } from './_journeyUtils';

describe('Timeline feature depth — 200 journeys', () => {
  let scenarios = [];
  before(() => { cy.fixture('scenarios/timeline.json').then((d) => { scenarios = d; }); });

  it('runs timeline scenarios', () => {
    const mode = (Cypress.env('API_MODE') || 'integration').toLowerCase();
    scenarios.forEach((s) => {
      cy.log(`Scenario #${s.id}: ${s.description}`);
      cy.window().then(() => seedScenario(s.seed, mode));
      cy.visit('/app/timeline-legacy');
      cy.window().then((win) => {
        (s.expect || []).forEach(exp => assertExpectation(win, exp));
      });
    });
  });
});

