/// <reference types="cypress" />
import { seedScenario, assertExpectation } from './_journeyUtils';

describe('Cash Flow (Budget) feature depth — 200 journeys', () => {
  let scenarios = [];
  before(() => { cy.fixture('scenarios/cash-flow.json').then((d) => { scenarios = d; }); });

  it('runs cash flow scenarios', () => {
    const mode = (Cypress.env('API_MODE') || 'integration').toLowerCase();
    scenarios.forEach((s) => {
      cy.log(`Scenario #${s.id}: ${s.description}`);
      cy.window().then(() => seedScenario(s.seed, mode));
      cy.visit('/app/budget');
      cy.window().then((win) => {
        (s.expect || []).forEach(exp => assertExpectation(win, exp));
      });
    });
  });
});

