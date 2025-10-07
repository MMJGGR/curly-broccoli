// DEPRECATED: Temporary stub to prevent build errors
// All budget functionality now flows through UnifiedFinancialContext
// This file will be removed once all imports are updated

import React, { createContext } from 'react';
import { useUnifiedFinancialContext } from './TransactionContext';

const BudgetContext = createContext();

export const BudgetProvider = ({ children }) => {
  return (
    <BudgetContext.Provider value={{}}>
      {children}
    </BudgetContext.Provider>
  );
};

// Warn only once to avoid noisy console spam
let __budgetWarned = false;

export const useBudget = () => {
  if (!__budgetWarned) {
    // eslint-disable-next-line no-console
    console.warn('DEPRECATED: useBudget() - Switch to useUnifiedFinancialContext()');
    __budgetWarned = true;
  }

  const { expenses, incomes = [], loading } = useUnifiedFinancialContext();

  // Calculate derived values from unified context
  const totalIncome = Array.isArray(incomes)
    ? incomes.reduce((sum, inc) => sum + (inc.monthly_amount || inc.amount || 0), 0)
    : (incomes?.total_monthly_income || 0);
  const totalExpenses = expenses?.reduce((sum, expense) => sum + (expense.monthly_equivalent || 0), 0) || 0;
  const actualSurplus = totalIncome - totalExpenses;
  const formatAmount = (amount) => `KES ${Math.round(amount).toLocaleString()}`;
  const budgetHealth = actualSurplus >= 0 ? 'healthy' : 'deficit';

  // Mock budgetData structure for compatibility
  const budgetData = {
    monthlyIncome: totalIncome,
    expenses: expenses?.reduce((acc, expense) => {
      const category = expense.expense_category || 'miscellaneous';
      acc[category] = (acc[category] || 0) + (expense.monthly_equivalent || 0);
      return acc;
    }, {}) || {},
    goalAllocations: {
      emergencyFund: 0,
      retirement: 0,
      education: 0,
      investments: 0
    }
  };

  return {
    budgetData,
    totalExpenses,
    actualSurplus,
    budgetHealth,
    formatAmount,
    isBudgetReady: !loading?.global && Array.isArray(expenses) && (Array.isArray(incomes) ? incomes.length >= 0 : true),
    loading: !!(loading?.global || loading?.expenses),
    error: null,
    refreshBudgetData: () => console.warn('DEPRECATED: refreshBudgetData()'),
    // Add other mock methods as needed
    loadBudgetData: () => Promise.resolve(),
    saveBudgetData: () => Promise.resolve(),
    updateBudget: () => {},
    updateBudgetItem: () => {},
    setEditingMode: () => {},
    setBudgetPeriod: () => {},
    clearError: () => {},
    handleSaveAndExit: () => Promise.resolve()
  };
};

export default BudgetContext;
