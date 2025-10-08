// Valuation utilities: discounting and present value calculations

const toNumber = (v, def = 0) => {
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : def;
};

export function discountFlows(flows, annualRate = 0.12, inflation = 0.0, mode = 'nominal') {
  // flows: [{ t: monthIndex, amount }]
  const rNom = toNumber(annualRate, 0);
  const pi = toNumber(inflation, 0);
  let r = rNom / 12;
  if (mode === 'real') {
    // Fisher approximation: (1+r)/(1+pi) - 1
    const rReal = ((1 + rNom) / (1 + pi)) - 1;
    r = rReal / 12;
  }
  let pv = 0;
  for (const f of flows) {
    const t = toNumber(f.t, 0);
    const amt = toNumber(f.amount, 0);
    const df = Math.pow(1 + r, t);
    pv += amt / df;
  }
  return pv;
}

// Human capital as growing annuity PV until retirement
export function pvHumanCapital({ monthlyIncome = 0, age = 30, retirementAge = 65 }, incomeGrowth = 0.03, discount = 0.125) {
  const years = Math.max(0, retirementAge - age);
  if (years === 0 || discount <= incomeGrowth) return 0;
  const annualIncome = monthlyIncome * 12;
  const P1 = annualIncome * (1 + incomeGrowth);
  const factor = 1 - Math.pow((1 + incomeGrowth) / (1 + discount), years);
  return Math.max(0, P1 * factor / (discount - incomeGrowth));
}

export function pvOfExpenses(expenseFlows, annualRate = 0.105, inflation = 0.055, mode = 'nominal') {
  return -discountFlows(expenseFlows, annualRate, inflation, mode);
}

export function pvOfIncomes(incomeFlows, annualRate = 0.12, inflation = 0.0, mode = 'nominal') {
  return discountFlows(incomeFlows, annualRate, inflation, mode);
}

export default {
  discountFlows,
  pvHumanCapital,
  pvOfExpenses,
  pvOfIncomes
};

