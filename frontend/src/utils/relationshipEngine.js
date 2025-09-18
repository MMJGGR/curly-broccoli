// Relationship Engine
// Generic, data-driven helpers to derive temporal logic for income/expense/goal links.

// Helper: parse date and compute months from now
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

// Registry of generic relationship semantics
const RELATION_RULES = {
  // Income lifetimes
  income: {
    salary: ({ profile }) => ({ months: profile ? Math.max(0, (profile.retirement_age || profile.target_retirement_age || 65) - (profile.age || 30)) * 12 : null, reason: 'until retirement' }),
    rental_income: ({ assets, income }) => ({ activeWhileAsset: !!assets?.find(a => a.id === income.linked_asset_id), reason: 'while property owned' }),
    dividends: ({ assets, income }) => ({ activeWhileAsset: !!assets?.find(a => a.id === income.linked_asset_id), reason: 'while holdings exist' }),
    business_income: ({ assets, income }) => ({ activeWhileAsset: !!assets?.find(a => a.id === income.linked_asset_id), reason: 'while business active' })
  },
  // Expense lifetimes
  expense: {
    loan_payment: ({ liabilities, expense }) => {
      const liab = liabilities?.find(l => l.id === expense.related_liability_id);
      if (!liab) return { months: null, reason: 'loan payoff unknown' };
      if (liab.monthly_payment && liab.current_balance != null) {
        const months = Math.max(0, Math.ceil(Number(liab.current_balance) / Math.max(1, Number(liab.monthly_payment))));
        return { months, reason: 'until loan payoff' };
      }
      if (liab.due_date) return { months: monthsUntil(liab.due_date), reason: 'until due date' };
      return { months: null, reason: 'loan payoff unknown' };
    },
    asset_maintenance: ({ assets, expense }) => ({ activeWhileAsset: !!assets?.find(a => a.id === expense.related_asset_id), reason: 'while asset owned' }),
    property_tax: ({ assets, expense }) => ({ activeWhileAsset: !!assets?.find(a => a.id === expense.related_asset_id), reason: 'while property owned' }),
    insurance_premium: ({ assets, expense }) => ({ activeWhileAsset: !!assets?.find(a => a.id === expense.related_asset_id), reason: 'while insured asset owned' })
  },
  // Mutual exclusivity: expense types that generally cease when certain asset types are present
  exclusivity: [
    { expense_type: 'rent', asset_types: ['real_estate'], reason: 'replaced by home ownership' }
  ]
};

// Normalize strings
const norm = (s) => (s || '').toString().trim().toLowerCase();

export function computeIncomeTimeline(income, ctx) {
  const type = norm(income.source_type || income.income_type);
  const base = RELATION_RULES.income[type];
  if (base) {
    const res = base({ ...ctx, income });
    if (res.months != null) return { months: res.months, reason: res.reason };
    if (res.activeWhileAsset != null) {
      return { months: res.activeWhileAsset ? null : 0, reason: res.reason, activeWhileAsset: res.activeWhileAsset };
    }
  }
  // Fallback to frequency and finite hints not typical for income
  return { months: null, reason: 'ongoing' };
}

export function computeExpenseTimeline(expense, ctx) {
  // Explicit finite controls take precedence
  if (expense.payment_end_date) {
    return { months: monthsUntil(expense.payment_end_date), reason: 'until end date' };
  }
  if (expense.is_finite_payment && expense.total_payments_remaining && expense.frequency === 'monthly') {
    const months = Number(expense.total_payments_remaining) || 0;
    return { months, reason: 'finite payments remaining' };
  }

  // Relationship-type based rules
  const relType = norm(expense.relationship_type || '');
  const relRule = RELATION_RULES.expense[relType];
  if (relRule) {
    const res = relRule({ ...ctx, expense });
    if (res.months != null) return { months: res.months, reason: res.reason };
    if (res.activeWhileAsset != null) {
      return { months: res.activeWhileAsset ? null : 0, reason: res.reason, activeWhileAsset: res.activeWhileAsset };
    }
  }

  // Exclusivity (e.g., rent vs real_estate ownership)
  const expType = norm(expense.expense_type || expense.type);
  const exclusive = RELATION_RULES.exclusivity.find(x => norm(x.expense_type) === expType);
  if (exclusive && Array.isArray(ctx.assets)) {
    if (ctx.assets.some(a => exclusive.asset_types.includes(norm(a.asset_type)))) {
      return { months: 0, reason: exclusive.reason };
    }
  }

  return { months: null, reason: 'ongoing' };
}

// Generic helper to convert months to a width percentage relative to a horizon
export function widthPctFromMonths(months, horizonMonths) {
  if (months == null) return 100;
  const h = Math.max(1, horizonMonths || 12);
  return Math.max(5, Math.min(100, (months / h) * 100));
}

export function buildContextFromState(state) {
  return {
    assets: state?.assets || [],
    liabilities: state?.liabilities || [],
    incomes: state?.incomeSource || state?.incomes || [],
    expenses: state?.expenses || [],
    goals: state?.goals || [],
    profile: state?.userProfile || state?.profile || null,
  };
}

export default {
  computeIncomeTimeline,
  computeExpenseTimeline,
  widthPctFromMonths,
  buildContextFromState
};

