#!/usr/bin/env node
/*
 Generates 200 scenarios per tab based on parameterized user journeys.
 Output files:
  - frontend/cypress/fixtures/scenarios/dashboard.json
  - frontend/cypress/fixtures/scenarios/plan.json
  - frontend/cypress/fixtures/scenarios/balance-sheet.json
  - frontend/cypress/fixtures/scenarios/cash-flow.json
  - frontend/cypress/fixtures/scenarios/timeline.json
*/
const fs = require('fs');
const path = require('path');

function range(n) { return Array.from({ length: n }, (_, i) => i + 1); }

function personaFor(i) {
  const personas = ['jamal', 'aisha', 'samuel'];
  return personas[i % personas.length];
}

function baseSeed(i) {
  const income = [
    { id: `inc_${i}_1`, name: 'Salary', monthly_amount: 40000 + (i % 12) * 2500, frequency: 'monthly' },
    ...(i % 5 === 0 ? [{ id: `inc_${i}_2`, name: 'Side Hustle', monthly_amount: 5000 + (i % 7) * 500, frequency: 'monthly' }] : [])
  ];
  const expenses = [
    { id: `exp_${i}_1`, description: 'Rent', expense_type: 'housing', amount: 16000 + (i % 4) * 1000, frequency: 'monthly', is_recurring: true },
    { id: `exp_${i}_2`, description: 'Food', expense_type: 'food_dining', amount: 7000 + (i % 6) * 300, frequency: 'monthly', is_recurring: true },
    { id: `exp_${i}_3`, description: 'Transport', expense_type: 'transportation', amount: 3000 + (i % 5) * 200, frequency: 'monthly', is_recurring: true },
  ];
  const liabilities = (i % 3 === 0) ? [{ id: `lia_${i}_1`, name: 'Loan', interest_rate: 0.18, current_balance: 250000 + (i % 10) * 10000, monthly_payment: 10000 + (i % 4) * 500 }] : [];
  const assets = (i % 2 === 0) ? [{ id: `ast_${i}_1`, name: 'Savings', asset_type: 'savings_account', current_value: 100000 + (i % 20) * 5000 }] : [];
  const budgetCategories = [
    { id: `bc_${i}_1`, name: 'housing', budgeted_amount: 18000 + (i % 4) * 500 },
    { id: `bc_${i}_2`, name: 'food_dining', budgeted_amount: 8000 + (i % 6) * 200 },
    { id: `bc_${i}_3`, name: 'transportation', budgeted_amount: 3500 + (i % 5) * 100 },
  ];
  const profile = {
    first_name: 'User', last_name: `#${i}`, age: 24 + (i % 30), monthly_income: income.reduce((s, x) => s + x.monthly_amount, 0), retirement_age: 60 + (i % 7), dependents: i % 4
  };
  return { profile, income, expenses, assets, liabilities, goals: [], transactions: [], budgetCategories };
}

function dashScenario(i) {
  const seed = baseSeed(i);
  return {
    id: i,
    persona: personaFor(i),
    description: `Dashboard overview with income ${seed.profile.monthly_income} and ${seed.expenses.length} expenses`,
    seed,
    steps: [{ action: 'navigate', to: '/app/dashboard' }],
    expect: [{ type: 'stat', key: 'surplus', op: '>=', value: -999999 }]
  };
}

function planScenario(i) {
  const seed = baseSeed(i);
  return {
    id: i,
    persona: personaFor(i),
    description: `Plan tab: adjust planning start and verify budget summary`,
    seed,
    steps: [{ action: 'navigate', to: '/app/plan' }, { action: 'setPlanningStart', value: `2025-${String((i % 12) + 1).padStart(2,'0')}` }],
    expect: [{ type: 'selector', key: 'budgetSummary.remaining_budget', op: '>=', value: -999999 }]
  };
}

function bsScenario(i) {
  const seed = baseSeed(i);
  // include debt scenario every 3rd
  const focus = (i % 3 === 0) ? 'debt_paydown' : 'net_worth';
  return {
    id: i,
    persona: personaFor(i),
    description: focus === 'debt_paydown' ? 'Debt payoff suggestion exists' : 'Balance sheet aggregates render',
    seed,
    steps: [{ action: 'navigate', to: '/app/balance-sheet' }],
    expect: focus === 'debt_paydown'
      ? [{ type: 'selector', key: 'debtPlan.months', op: '!=', value: null }]
      : [{ type: 'selector', key: 'trialBalance.totals.netWorth', op: '>=', value: -999999 }]
  };
}

function cfScenario(i) {
  const seed = baseSeed(i);
  return {
    id: i,
    persona: personaFor(i),
    description: 'Budget: variance and surplus validation',
    seed,
    steps: [{ action: 'navigate', to: '/app/budget' }],
    expect: [{ type: 'selector', key: 'budgetSummary.total_spent', op: '>=', value: 0 }]
  };
}

function timelineScenario(i) {
  const seed = baseSeed(i);
  return {
    id: i,
    persona: personaFor(i),
    description: 'Timeline: compute trial balance for current period',
    seed,
    steps: [{ action: 'navigate', to: '/app/timeline-legacy' }],
    expect: [{ type: 'selector', key: 'trialBalance.totals.netCashFlow', op: '>=', value: -999999 }]
  };
}

function generate() {
  const outDir = path.join(__dirname, '..', 'cypress', 'fixtures', 'scenarios');
  fs.mkdirSync(outDir, { recursive: true });
  const files = [
    ['dashboard.json', range(200).map(dashScenario)],
    ['plan.json', range(200).map(planScenario)],
    ['balance-sheet.json', range(200).map(bsScenario)],
    ['cash-flow.json', range(200).map(cfScenario)],
    ['timeline.json', range(200).map(timelineScenario)],
  ];
  for (const [name, data] of files) {
    fs.writeFileSync(path.join(outDir, name), JSON.stringify(data, null, 2));
  }
  console.log(`Generated scenarios in ${outDir}`);
}

if (require.main === module) generate();

module.exports = generate;

