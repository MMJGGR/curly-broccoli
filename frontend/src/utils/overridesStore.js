// Simple per-item overrides store in localStorage
// Supports income growth rate and expense inflation rate overrides by ID

const KEY = 'per_item_overrides_v1';

function readStore() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : { income: {}, expense: {} };
  } catch {
    return { income: {}, expense: {} };
  }
}

function writeStore(store) {
  try { localStorage.setItem(KEY, JSON.stringify(store)); } catch {}
}

export function setIncomeGrowthOverride(id, growthRatePct) {
  const store = readStore();
  if (!store.income) store.income = {};
  store.income[id] = { ...(store.income[id] || {}), growth_rate: Number(growthRatePct) };
  writeStore(store);
}

export function getIncomeGrowthOverride(id) {
  const store = readStore();
  return store.income?.[id]?.growth_rate ?? null;
}

export function setExpenseInflationOverride(id, inflRatePct) {
  const store = readStore();
  if (!store.expense) store.expense = {};
  store.expense[id] = { ...(store.expense[id] || {}), inflation_rate: Number(inflRatePct) };
  writeStore(store);
}

export function getExpenseInflationOverride(id) {
  const store = readStore();
  return store.expense?.[id]?.inflation_rate ?? null;
}

export function getOverrides() { return readStore(); }
export function clearOverrides() { writeStore({ income: {}, expense: {} }); }

export default {
  setIncomeGrowthOverride,
  getIncomeGrowthOverride,
  setExpenseInflationOverride,
  getExpenseInflationOverride,
  getOverrides,
  clearOverrides
};

