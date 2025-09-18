// Simple FX conversion utilities (stub with pass-through if no rates provided)

export function convertAmount(amount, from, to, rates = {}) {
  if (!from || !to || from === to) return amount;
  // rates structure: { 'USD': { 'KES': 128.0 }, 'KES': { 'USD': 0.0078 } }
  const r = rates?.[from]?.[to];
  if (typeof r === 'number' && isFinite(r)) return amount * r;
  return amount;
}

export function revalueFlows(flows, baseCurrency, getRate) {
  // getRate(from, to, t) returns rate
  return flows.map(f => {
    const cur = f.currency || baseCurrency;
    if (cur === baseCurrency) return f;
    const rate = (typeof getRate === 'function') ? getRate(cur, baseCurrency, f.t || 0) : null;
    const amt = rate ? (f.amount || 0) * rate : f.amount;
    return { ...f, amount: amt, currency: baseCurrency };
  });
}

export default { convertAmount, revalueFlows };

