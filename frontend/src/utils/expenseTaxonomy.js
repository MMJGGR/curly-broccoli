// Shared expense taxonomy and helpers to unify categories across the app

export const EXPENSE_CATEGORY_BY_TYPE = {
  // Fixed/core expenses (align with backend ExpenseType and CFA rules)
  housing: 'fixed_expenses',
  utilities: 'fixed_expenses',
  insurance: 'fixed_expenses',
  home_insurance: 'fixed_expenses',
  health_insurance: 'fixed_expenses',
  vehicle_insurance: 'fixed_expenses',
  life_insurance: 'fixed_expenses',
  disability_insurance: 'fixed_expenses',
  taxes: 'fixed_expenses',
  property_tax: 'fixed_expenses',
  vehicle_payment: 'fixed_expenses',
  subscriptions: 'fixed_expenses',
  // Debt payments (accept both singular/plural keys)
  debt_payment: 'fixed_expenses',
  debt_payments: 'fixed_expenses',
  student_loan: 'fixed_expenses',
  personal_loan: 'fixed_expenses',

  // Variable expenses
  transportation: 'variable_expenses',
  public_transport: 'variable_expenses',
  fuel: 'variable_expenses',
  food_dining: 'variable_expenses',
  groceries: 'variable_expenses',
  restaurants: 'variable_expenses',
  healthcare: 'variable_expenses',
  medical_expenses: 'variable_expenses',
  dental: 'variable_expenses',
  vision: 'variable_expenses',
  pharmacy: 'variable_expenses',
  personal_care: 'variable_expenses',

  // Discretionary/other
  entertainment: 'discretionary_expenses',
  hobbies: 'discretionary_expenses',
  travel: 'discretionary_expenses',
  clothing: 'discretionary_expenses',
  charity_gifts: 'discretionary_expenses',
  business_expense: 'discretionary_expenses',
  business_operating: 'discretionary_expenses',
  education: 'discretionary_expenses',
  training: 'discretionary_expenses',
  books_supplies: 'discretionary_expenses',
  other: 'discretionary_expenses',
  miscellaneous: 'discretionary_expenses'
};

export const normalizeExpenseType = (type) => {
  if (!type) return 'other';
  return String(type).toLowerCase();
};

export const deriveExpenseCategory = (expenseType) => {
  const type = normalizeExpenseType(expenseType);
  return EXPENSE_CATEGORY_BY_TYPE[type] || 'discretionary_expenses';
};

export const monthlyEquivalent = (expense) => {
  if (!expense) return 0;

  // Prefer explicit monthly_amount if present
  if (typeof expense.monthly_amount === 'number') {
    return expense.monthly_amount;
  }

  const amount = typeof expense.amount === 'number' ? expense.amount : parseFloat(expense.amount) || 0;
  const frequency = (expense.frequency || '').toLowerCase();

  switch (frequency) {
    case 'daily':
      return amount * 30; // approx monthly
    case 'weekly':
      return amount * 4; // approx monthly
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'annually':
      return amount / 12;
    default:
      // If frequency missing, fallback to amount
      // or frequency_months if provided
      if (typeof expense.frequency_months === 'number' && expense.frequency_months > 0) {
        return amount / expense.frequency_months;
      }
      return amount;
  }
};
