/// <reference types="cypress" />

export function seedScenario(seed, mode = 'integration') {
  if (mode === 'live') {
    const base = Cypress.env('API_BASE_URL') || 'http://localhost:8000';
    const token = window.localStorage.getItem('jwt') || 'test';
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const post = (url, body) => cy.request({ method: 'POST', url: `${base}${url}`, headers, body, failOnStatusCode: false });
    // naive seeding — best effort
    const jobs = [];
    (seed.assets || []).forEach(a => jobs.push(post('/api/v1/assets-v2/', a)));
    (seed.liabilities || []).forEach(l => jobs.push(post('/api/v1/liabilities-v2/', l)));
    (seed.income || []).forEach(inc => jobs.push(post('/api/v1/income-v2/', inc)));
    (seed.expenses || []).forEach(e => jobs.push(post('/api/v1/expenses-v2/', e)));
    (seed.goals || []).forEach(g => jobs.push(post('/api/v1/goals-v2/', g)));
    return cy.wrap(Promise.allSettled(jobs));
  } else {
    // integration: hydrate local context through localStorage import
    window.localStorage.setItem('jwt', 'test');
    const merged = seed || {};
    window.localStorage.setItem('ufc_seed_data_v1', JSON.stringify(merged));
    return cy.wrap(null);
  }
}

export function readSelector(win, key) {
  const parts = key.split('.');
  const u = win.__UFC__;
  if (!u) return undefined;
  if (parts[0] === 'budgetSummary') {
    const v = u.selectors?.budgetSummary?.();
    return parts.slice(1).reduce((o, k) => (o ? o[k] : undefined), v);
  }
  if (parts[0] === 'debtPlan') {
    const v = u.selectors?.debtPlan?.({ strategy: 'snowball' }) || null;
    return parts[1] ? (v ? v[parts[1]] : undefined) : v;
  }
  if (parts[0] === 'trialBalance') {
    const v = u.selectors?.trialBalance?.(0) || null;
    if (!v) return undefined;
    if (parts[1] === 'totals') {
      return parts.slice(2).reduce((o, k) => (o ? o[k] : undefined), v.totals);
    }
    return v[parts[1]];
  }
  return undefined;
}

export function assertExpectation(win, exp) {
  const actual = readSelector(win, exp.key);
  const v = actual;
  const op = exp.op;
  if (op === '>=') expect(v).to.be.greaterThan(exp.value - 1);
  else if (op === '!=') expect(v).to.not.equal(exp.value);
  else if (op === 'exists') expect(v).to.not.be.undefined;
  else expect(v).to.equal(exp.value);
}

