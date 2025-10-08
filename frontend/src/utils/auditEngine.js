// Audit Engine: generate domain audits and suggested milestones/actions
// Inputs: unified context-like snapshot (incomes, expenses, assets, liabilities, goals)

export function generateAudits(state = {}) {
  const audits = [];
  const incomes = state.incomes || state.incomeSource || [];
  const expenses = state.expenses || [];
  const liabilities = state.liabilities || [];
  const goals = state.goals || [];

  const monthlyIncome = incomes.reduce((s, i) => s + (parseFloat(i.monthly_amount || i.amount || 0) || 0), 0);
  const monthlyExpenses = expenses.reduce((s, e) => s + (parseFloat(e.monthly_equivalent || e.amount || 0) || 0), 0);
  const net = monthlyIncome - monthlyExpenses;

  // Budget audit
  if (net < 0) {
    audits.push({
      domain: 'budget',
      severity: 'high',
      message: 'Monthly deficit detected',
      action: 'Reduce discretionary spending by 10% and/or increase income',
      suggestion: { type: 'optimize_budget', target: 'discretionary', pct: 10 }
    });
  }

  // Liability audit: missing loan payments
  for (const l of liabilities) {
    const mp = parseFloat(l.monthly_payment || 0) || 0;
    if (mp > 0) {
      const hasPayment = expenses.some(e => (e.description || '').toLowerCase().includes((l.name || '').toLowerCase()) || (e.expense_type || '').toLowerCase().includes('debt'));
      if (!hasPayment) {
        audits.push({
          domain: 'liability',
          severity: 'medium',
          message: `No expense for loan payment: ${l.name || 'Loan'}`,
          action: 'Create a monthly loan payment expense aligned to liability',
          suggestion: { type: 'create_expense_loan_payment', liabilityId: l.id, name: l.name, amount: Math.round(mp), is_finite_payment: true }
        });
      }
    }
  }

  // Asset audits: maintenance/insurance for real estate and vehicles
  for (const a of (state.assets || [])) {
    const t = (a.asset_type || '').toLowerCase();
    if (t.includes('real') || t.includes('property')) {
      const hasMaint = expenses.some(e => (e.description || '').toLowerCase().includes('maintenance') && (e.linked_asset_id === a.id));
      const hasIns = expenses.some(e => (e.description || '').toLowerCase().includes('insurance') && (e.linked_asset_id === a.id));
      if (!hasMaint) audits.push({ domain: 'asset', severity: 'low', message: `Add maintenance for ${a.name || 'property'}`, action: 'Create monthly maintenance expense (~1% p.a.)', suggestion: { type: 'create_expense_asset_maintenance', assetId: a.id, name: a.name, estimate: Math.round((parseFloat(a.current_value||0)||0) * 0.01 / 12) } });
      if (!hasIns) audits.push({ domain: 'asset', severity: 'low', message: `Add insurance for ${a.name || 'property'}`, action: 'Create monthly insurance premium', suggestion: { type: 'create_expense_insurance_premium', assetId: a.id, name: a.name, estimate: 3000 } });
    }
  }

  // Goals audit: underfunded goals
  for (const g of goals) {
    const target = parseFloat(g.target_amount || g.target || 0) || 0;
    const current = parseFloat(g.current_amount || g.current || 0) || 0;
    const remaining = Math.max(0, target - current);
    let months = 0;
    try { const d = new Date(g.target_date); months = Math.max(0, Math.round((d - new Date())/(1000*60*60*24*30))); } catch {}
    const req = months > 0 ? remaining / months : 0;
    // Find budgeted allocation through budget categories if present in state
    const cats = state.budgetCategories || [];
    const budgeted = cats.filter(c => typeof c.name === 'string' && c.name.toLowerCase() === `goal: ${String(g.name||'').toLowerCase()}`)
                         .reduce((s,c)=> s + (parseFloat(c.budgeted_amount||0)||0), 0);
    if (req > 0 && budgeted < req) {
      audits.push({
        domain: 'goals', severity: 'medium', message: `Underfunded goal: ${g.name}`,
        action: `Allocate KES ${Math.round(req - budgeted).toLocaleString()} more per month`,
        suggestion: { type: 'set_goal_contribution', name: g.name, monthly_amount: Math.round(req) }
      });
    }
  }

  return audits;
}

export function auditsToMilestones(audits = []) {
  // Map audit suggestions into milestone stubs users can accept
  return audits.map((a, idx) => ({
    id: `audit_ms_${idx}`,
    title: a.message,
    age: null, // will be set by UI using currentAge + 0.5 yrs
    category: a.domain === 'goals' ? 'investment' : a.domain,
    target_amount: null,
    progress: 0,
    timeline_impact: a.action
  }));
}

export default { generateAudits, auditsToMilestones };

