// Schedule Engine: builds monthly schedules for incomes, expenses, liabilities, and goals
// Uses relationshipEngine to determine temporal behavior

import { computeIncomeTimeline, computeExpenseTimeline } from './relationshipEngine';
import { getIncomeGrowthOverride, getExpenseInflationOverride } from './overridesStore';

const toNumber = (v, def = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

export function monthlyFromFrequency(amount, frequency) {
  const amt = toNumber(amount, 0);
  switch ((frequency || 'monthly').toLowerCase()) {
    case 'daily': return amt * 30;
    case 'weekly': return amt * 4.33;
    case 'monthly': return amt;
    case 'quarterly': return amt / 3;
    case 'annually': return amt / 12;
    default: return amt;
  }
}

function monthsUntil(dateStr) {
  try {
    if (!dateStr) return null;
    const now = new Date();
    const tgt = new Date(dateStr);
    const months = Math.round(((tgt - now) / (1000 * 60 * 60 * 24)) / 30);
    return Math.max(0, months);
  } catch {
    return null;
  }
}

export function generateIncomeSchedule(income, ctx, horizonMonths = 360, growthRate = 0) {
  const baseMonthly = monthlyFromFrequency(income.monthly_amount ?? income.amount, income.frequency);
  const { months } = computeIncomeTimeline(income, ctx);
  const end = months == null ? horizonMonths : Math.min(horizonMonths, months);
  // per-item override (percentage)
  const perItemGrowth = income.growth_rate ?? getIncomeGrowthOverride(income.id);
  const g = typeof perItemGrowth === 'number' && !Number.isNaN(perItemGrowth) ? perItemGrowth / 100 : growthRate;
  const out = [];
  for (let t = 0; t < end; t++) {
    const amt = baseMonthly * Math.pow(1 + g, t / 12);
    out.push({ t, amount: amt, type: 'income', id: income.id, name: income.source_name || income.description || 'Income' });
  }
  return out;
}

export function generateExpenseSchedule(expense, ctx, horizonMonths = 360, inflationRate = 0) {
  // Priority: explicit end date or finite payments
  const baseMonthly = monthlyFromFrequency(expense.amount, expense.frequency || 'monthly');
  const { months } = computeExpenseTimeline(expense, ctx);
  const end = months == null ? horizonMonths : Math.min(horizonMonths, months);
  // per-item override (percentage)
  const perItemInfl = expense.inflation_rate ?? getExpenseInflationOverride(expense.id);
  const infl = typeof perItemInfl === 'number' && !Number.isNaN(perItemInfl) ? perItemInfl / 100 : inflationRate;
  const out = [];
  for (let t = 0; t < end; t++) {
    const amt = baseMonthly * Math.pow(1 + infl, t / 12);
    out.push({ t, amount: -amt, type: 'expense', id: expense.id, name: expense.description || 'Expense' });
  }
  return out;
}

export function generateLiabilitySchedule(liability, ctx, horizonMonths = 360) {
  // Simple amortization if monthly_payment and interest_rate are present
  const rateAnnual = toNumber(liability.interest_rate, 0) / 100;
  const r = rateAnnual / 12;
  let balance = toNumber(liability.current_balance, 0);
  const P = toNumber(liability.monthly_payment, 0);
  const outInterest = [];
  const outPrincipal = [];
  if (P <= 0) return { interest: outInterest, principal: outPrincipal };
  for (let t = 0; t < horizonMonths && balance > 0.01; t++) {
    const interest = r > 0 ? balance * r : 0;
    const principal = Math.max(0, Math.min(P - interest, balance));
    balance = Math.max(0, balance - principal);
    outInterest.push({ t, amount: -interest, type: 'expense', id: liability.id, name: `${liability.name || 'Liability'} Interest` });
    outPrincipal.push({ t, amount: -principal, type: 'principal', id: liability.id, name: `${liability.name || 'Liability'} Principal` });
  }
  return { interest: outInterest, principal: outPrincipal };
}

export function generateGoalFundingSchedule(goal, ctx, horizonMonths = 360) {
  const target = toNumber(goal.target_amount ?? goal.target, 0);
  const current = toNumber(goal.current_amount ?? goal.current, 0);
  const remaining = Math.max(0, target - current);
  let months = monthsUntil(goal.target_date) ?? 0;
  if (months <= 0) months = 0;
  const out = [];
  if (months > 0 && remaining > 0) {
    const monthly = remaining / months;
    for (let t = 0; t < Math.min(horizonMonths, months); t++) {
      out.push({ t, amount: -monthly, type: 'goal_contribution', id: goal.id, name: `Goal: ${goal.name}` });
    }
  }
  return out;
}

export function generateAllSchedules(state, horizonMonths = 360, rates = {}) {
  const ctx = {
    assets: state.assets || [],
    liabilities: state.liabilities || [],
    profile: state.userProfile || state.profile || null,
  };
  const incomeGrowth = toNumber(rates.incomeGrowthRate ?? 0) / 100;
  const expenseInfl = toNumber(rates.expenseInflationRate ?? 0) / 100;
  const essentialInfl = toNumber(rates.essentialInflationRate ?? rates.expenseInflationRate ?? 0) / 100;
  const discretionaryInfl = toNumber(rates.discretionaryInflationRate ?? rates.expenseInflationRate ?? 0) / 100;
  const all = [];
  // Incomes
  (state.incomeSource || state.incomes || []).forEach(inc => {
    all.push(...generateIncomeSchedule(inc, ctx, horizonMonths, incomeGrowth));
  });
  // Expenses
  (state.expenses || []).forEach(exp => {
    const infl = (exp.is_essential === true) ? essentialInfl : discretionaryInfl;
    all.push(...generateExpenseSchedule(exp, ctx, horizonMonths, infl));
  });
  // Liabilities (interest as expense; principal for info)
  (state.liabilities || []).forEach(l => {
    const { interest, principal } = generateLiabilitySchedule(l, ctx, horizonMonths);
    all.push(...interest);
    // Include principal as financing flow
    principal.forEach(p => all.push({ ...p, type: 'principal' }));
  });
  // Goals funding
  (state.goals || []).forEach(g => {
    all.push(...generateGoalFundingSchedule(g, ctx, horizonMonths));
  });
  // Kenya PAYE Tax (simplified): compute on aggregate monthly income
  try {
    const monthlyIncome = (state.incomeSource || state.incomes || []).reduce((s, inc) => s + (toNumber(inc.monthly_amount ?? inc.amount) || 0), 0);
    if (monthlyIncome > 0) {
      const tax = computeKenyaPAYE(monthlyIncome);
      for (let t = 0; t < horizonMonths; t++) {
        all.push({ t, amount: -tax, type: 'expense', id: `tax_${t}`, name: 'PAYE Tax' });
      }
    }
  } catch {}
  return all;
}

// KRA PAYE (simplified 2023 bands) — monthly
export function computeKenyaPAYE(monthlyIncome) {
  // Example bands (KES): 0-24,000 @ 10%; 24,001-32,333 @ 25%; >32,333 @ 30%
  const bands = [
    { upTo: 24000, rate: 0.10 },
    { upTo: 32333, rate: 0.25 },
    { upTo: Infinity, rate: 0.30 }
  ];
  let remaining = monthlyIncome;
  let lastCap = 0;
  let tax = 0;
  for (const b of bands) {
    const cap = Math.min(remaining, Math.max(0, b.upTo - lastCap));
    if (cap > 0) tax += cap * b.rate;
    remaining -= cap;
    lastCap = b.upTo;
    if (remaining <= 0) break;
  }
  // Personal relief (fixed, simplified): KES 2,400
  tax = Math.max(0, tax - 2400);
  return tax;
}

export default {
  monthlyFromFrequency,
  generateIncomeSchedule,
  generateExpenseSchedule,
  generateLiabilitySchedule,
  generateGoalFundingSchedule,
  generateAllSchedules
};
