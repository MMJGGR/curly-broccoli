import React, { createContext, useContext, useReducer, useCallback, useRef } from 'react';
import { api } from '../api';

// UnifiedFinancialContext for managing all financial data - Single Source of Truth
const UnifiedFinancialContext = createContext();

// Unified Financial Action Types - Complete CRUD Support
const UNIFIED_FINANCIAL_ACTIONS = {
  // Loading States
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  
  // Assets CRUD
  SET_ASSETS: 'SET_ASSETS',
  CREATE_ASSET: 'CREATE_ASSET',
  UPDATE_ASSET: 'UPDATE_ASSET',
  DELETE_ASSET: 'DELETE_ASSET',
  
  // Liabilities CRUD
  SET_LIABILITIES: 'SET_LIABILITIES',
  CREATE_LIABILITY: 'CREATE_LIABILITY',
  UPDATE_LIABILITY: 'UPDATE_LIABILITY',
  DELETE_LIABILITY: 'DELETE_LIABILITY',
  
  // Income CRUD
  SET_INCOME_SOURCES: 'SET_INCOME_SOURCES',
  CREATE_INCOME_SOURCE: 'CREATE_INCOME_SOURCE',
  UPDATE_INCOME_SOURCE: 'UPDATE_INCOME_SOURCE',
  DELETE_INCOME_SOURCE: 'DELETE_INCOME_SOURCE',
  
  // Expenses CRUD
  SET_EXPENSES: 'SET_EXPENSES',
  CREATE_EXPENSE: 'CREATE_EXPENSE',
  UPDATE_EXPENSE: 'UPDATE_EXPENSE',
  DELETE_EXPENSE: 'DELETE_EXPENSE',
  
  // Goals CRUD
  SET_GOALS: 'SET_GOALS',
  CREATE_GOAL: 'CREATE_GOAL',
  UPDATE_GOAL: 'UPDATE_GOAL',
  DELETE_GOAL: 'DELETE_GOAL',
  
  // Transactions CRUD (Keep existing for compatibility)
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  CREATE_TRANSACTION: 'CREATE_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  
  // Budget Categories CRUD
  SET_BUDGET_CATEGORIES: 'SET_BUDGET_CATEGORIES',
  CREATE_BUDGET_CATEGORY: 'CREATE_BUDGET_CATEGORY',
  UPDATE_BUDGET_CATEGORY: 'UPDATE_BUDGET_CATEGORY',
  DELETE_BUDGET_CATEGORY: 'DELETE_BUDGET_CATEGORY',
  
  // Calculated Financial Metrics
  SET_NET_WORTH: 'SET_NET_WORTH',
  SET_CASH_FLOW: 'SET_CASH_FLOW',
  SET_GOAL_PROGRESS: 'SET_GOAL_PROGRESS',
  SET_BUDGET_OVERVIEW: 'SET_BUDGET_OVERVIEW',
  
  // Cross-Component Synchronization
  REFRESH_ALL_DATA: 'REFRESH_ALL_DATA',
  LINK_ASSET_INCOME: 'LINK_ASSET_INCOME'
};

// Unified Financial State - Single Source of Truth with Complete CRUD Support
const initialUnifiedState = {
  // Loading States
  loading: {
    assets: false,
    liabilities: false,
    income: false,
    expenses: false,
    transactions: false,
    goals: false,
    budget: false,
    calculations: false,
    global: false
  },
  
  // Error States
  errors: {
    assets: null,
    liabilities: null,
    income: null,
    expenses: null,
    transactions: null,
    goals: null,
    budget: null,
    calculations: null,
    global: null
  },
  
  // Core Financial Entities
  assets: [],
  liabilities: [],
  incomeSource: [],
  expenses: [],
  transactions: [],
  goals: [],
  budgetCategories: [],
  
  // User Profile (merged from OnboardingContext)
  userProfile: null,
  onboardingStep: 0,
  
  // Calculated Financial Metrics (CFA Compliant)
  netWorth: null,
  cashFlow: null,
  goalProgress: null,
  budgetOverview: null,
  
  // Cross-Component Relationships
  assetIncomeRelationships: [],
  goalFundingSources: [],
  
  // Legacy fields for backward compatibility
  totalTransactions: 0,
  currentPage: 0,
  accountSummary: {
    totalAccounts: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0
  },
  
  // Real-time synchronization timestamp
  lastUpdated: null
};

// Unified Financial Reducer with Complete CRUD Support
const unifiedFinancialReducer = (state, action) => {
  switch (action.type) {
    // Loading States
    case UNIFIED_FINANCIAL_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: {
          ...state.loading,
          ...action.payload
        }
      };
    
    // Error States  
    case UNIFIED_FINANCIAL_ACTIONS.SET_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          ...action.payload
        }
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        errors: {
          ...state.errors,
          [action.payload]: null
        }
      };
    
    // Assets CRUD
    case UNIFIED_FINANCIAL_ACTIONS.SET_ASSETS:
      return {
        ...state,
        assets: action.payload,
        loading: { ...state.loading, assets: false },
        errors: { ...state.errors, assets: null },
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.CREATE_ASSET:
      return {
        ...state,
        assets: [...state.assets, action.payload],
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.UPDATE_ASSET:
      return {
        ...state,
        assets: state.assets.map(asset => 
          asset.id === action.payload.id ? { ...asset, ...action.payload } : asset
        ),
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.DELETE_ASSET:
      return {
        ...state,
        assets: state.assets.filter(asset => asset.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };
    
    // Liabilities CRUD
    case UNIFIED_FINANCIAL_ACTIONS.SET_LIABILITIES:
      return {
        ...state,
        liabilities: action.payload,
        loading: { ...state.loading, liabilities: false },
        errors: { ...state.errors, liabilities: null },
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.CREATE_LIABILITY:
      return {
        ...state,
        liabilities: [...state.liabilities, action.payload],
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.UPDATE_LIABILITY:
      return {
        ...state,
        liabilities: state.liabilities.map(liability => 
          liability.id === action.payload.id ? { ...liability, ...action.payload } : liability
        ),
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.DELETE_LIABILITY:
      return {
        ...state,
        liabilities: state.liabilities.filter(liability => liability.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };
    
    // Income Sources CRUD
    case UNIFIED_FINANCIAL_ACTIONS.SET_INCOME_SOURCES:
      return {
        ...state,
        incomeSource: action.payload,
        loading: { ...state.loading, income: false },
        errors: { ...state.errors, income: null },
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.CREATE_INCOME_SOURCE:
      return {
        ...state,
        incomeSource: [...state.incomeSource, action.payload],
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.UPDATE_INCOME_SOURCE:
      return {
        ...state,
        incomeSource: state.incomeSource.map(income => 
          income.id === action.payload.id ? { ...income, ...action.payload } : income
        ),
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.DELETE_INCOME_SOURCE:
      return {
        ...state,
        incomeSource: state.incomeSource.filter(income => income.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };
    
    // Expenses CRUD
    case UNIFIED_FINANCIAL_ACTIONS.SET_EXPENSES:
      return {
        ...state,
        expenses: action.payload,
        loading: { ...state.loading, expenses: false },
        errors: { ...state.errors, expenses: null },
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.CREATE_EXPENSE:
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.UPDATE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.map(expense => 
          expense.id === action.payload.id ? { ...expense, ...action.payload } : expense
        ),
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };
    
    // Goals CRUD
    case UNIFIED_FINANCIAL_ACTIONS.SET_GOALS:
      return {
        ...state,
        goals: action.payload,
        loading: { ...state.loading, goals: false },
        errors: { ...state.errors, goals: null },
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.CREATE_GOAL:
      return {
        ...state,
        goals: [...state.goals, action.payload],
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.UPDATE_GOAL:
      return {
        ...state,
        goals: state.goals.map(goal => 
          goal.id === action.payload.id ? { ...goal, ...action.payload } : goal
        ),
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.DELETE_GOAL:
      return {
        ...state,
        goals: state.goals.filter(goal => goal.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };
    
    // Calculated Metrics
    case UNIFIED_FINANCIAL_ACTIONS.SET_NET_WORTH:
      return {
        ...state,
        netWorth: action.payload,
        accountSummary: {
          ...state.accountSummary,
          netWorth: action.payload?.netWorth || 0
        }
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.SET_CASH_FLOW:
      return {
        ...state,
        cashFlow: action.payload
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.SET_GOAL_PROGRESS:
      return {
        ...state,
        goalProgress: action.payload
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.SET_BUDGET_OVERVIEW:
      return {
        ...state,
        budgetOverview: action.payload
      };
    
    default:
      return state;
  }
};
  budgetOverview: {
    totalBudgeted: 0,
    totalSpent: 0,
    remainingBudget: 0,
    categoriesCount: 0,
    overBudgetCount: 0
  },
  
  // Analytics
  spendingAnalytics: {
    categoryBreakdown: [],
    monthlyTrends: [],
    summary: {}
  },
  
  // Import status
  importStatus: {
    isImporting: false,
    lastImport: null,
    importResults: null
  },
  
  // Filters
  filters: {
    accountId: null,
    category: null,
    startDate: null,
    endDate: null,
    searchTerm: ''
  }
};

// Reducer function
const transactionReducer = (state, action) => {
  switch (action.type) {
    case TRANSACTION_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload, error: null };
    
    case TRANSACTION_ACTIONS.SET_ERROR:
      return { 
        ...state, 
        error: action.payload, 
        isLoading: false, 
        isSubmitting: false 
      };
    
    case TRANSACTION_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    
    case TRANSACTION_ACTIONS.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload.transactions,
        totalTransactions: action.payload.total_count,
        currentPage: action.payload.offset / action.payload.limit,
        isLoading: false
      };
    
    case TRANSACTION_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
        totalTransactions: state.totalTransactions + 1,
        isSubmitting: false
      };
    
    case TRANSACTION_ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(t => 
          t.id === action.payload.id ? action.payload : t
        ),
        isSubmitting: false
      };
    
    case TRANSACTION_ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(t => t.id !== action.payload),
        totalTransactions: Math.max(0, state.totalTransactions - 1),
        isSubmitting: false
      };
    
    case TRANSACTION_ACTIONS.SET_ACCOUNTS:
      return {
        ...state,
        accounts: action.payload.accounts,
        accountSummary: action.payload.summary,
        isLoading: false
      };
    
    case TRANSACTION_ACTIONS.ADD_ACCOUNT:
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        accountSummary: {
          ...state.accountSummary,
          totalAccounts: state.accountSummary.totalAccounts + 1
        },
        isSubmitting: false
      };
    
    case TRANSACTION_ACTIONS.UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map(a => 
          a.id === action.payload.id ? action.payload : a
        ),
        isSubmitting: false
      };
    
    case TRANSACTION_ACTIONS.DELETE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.filter(a => a.id !== action.payload),
        accountSummary: {
          ...state.accountSummary,
          totalAccounts: Math.max(0, state.accountSummary.totalAccounts - 1)
        },
        isSubmitting: false
      };
    
    case TRANSACTION_ACTIONS.SET_BUDGET_CATEGORIES:
      return {
        ...state,
        budgetCategories: action.payload.categories,
        isLoading: false
      };
    
    case TRANSACTION_ACTIONS.ADD_BUDGET_CATEGORY:
      return {
        ...state,
        budgetCategories: [...state.budgetCategories, action.payload],
        isSubmitting: false
      };
    
    case TRANSACTION_ACTIONS.UPDATE_BUDGET_CATEGORY:
      return {
        ...state,
        budgetCategories: state.budgetCategories.map(c => 
          c.id === action.payload.id ? action.payload : c
        ),
        isSubmitting: false
      };
    
    case TRANSACTION_ACTIONS.DELETE_BUDGET_CATEGORY:
      return {
        ...state,
        budgetCategories: state.budgetCategories.filter(c => c.id !== action.payload),
        isSubmitting: false
      };
    
    case TRANSACTION_ACTIONS.SET_ANALYTICS:
      return {
        ...state,
        spendingAnalytics: action.payload,
        isLoading: false
      };
    
    case TRANSACTION_ACTIONS.SET_BUDGET_OVERVIEW:
      return {
        ...state,
        budgetOverview: action.payload.summary,
        budgetCategories: action.payload.categories,
        isLoading: false
      };
    
    default:
      return state;
  }
};

// Provider component
export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  // Error handling utility
  const handleError = useCallback((error) => {
    console.error('Transaction Context Error:', error);
    const errorMessage = error.response?.data?.detail || error.message || 'An unexpected error occurred';
    dispatch({ type: TRANSACTION_ACTIONS.SET_ERROR, payload: errorMessage });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: TRANSACTION_ACTIONS.CLEAR_ERROR });
  }, []);

  // Transaction operations
  const fetchTransactions = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const params = new URLSearchParams();
      if (filters.accountId) params.append('account_id', filters.accountId);
      if (filters.category) params.append('category', filters.category);
      if (filters.startDate) params.append('start_date', filters.startDate);
      if (filters.endDate) params.append('end_date', filters.endDate);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await api.get(`/transactions?${params.toString()}`);
      dispatch({ type: TRANSACTION_ACTIONS.SET_TRANSACTIONS, payload: response.data });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const createTransaction = useCallback(async (transactionData) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.post('/transactions/', transactionData);
      dispatch({ 
        type: TRANSACTION_ACTIONS.ADD_TRANSACTION, 
        payload: response.data.transaction 
      });
      
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const updateTransaction = useCallback(async (transactionId, transactionData) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.put(`/transactions/${transactionId}`, transactionData);
      dispatch({ 
        type: TRANSACTION_ACTIONS.UPDATE_TRANSACTION, 
        payload: response.data.transaction 
      });
      
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      await api.delete(`/transactions/${transactionId}`);
      dispatch({ 
        type: TRANSACTION_ACTIONS.DELETE_TRANSACTION, 
        payload: transactionId 
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const importTransactionsCSV = useCallback(async (file, accountId = null) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const formData = new FormData();
      formData.append('file', file);
      if (accountId) formData.append('account_id', accountId);

      const response = await api.post('/transactions/import/csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      // Refresh transactions after import
      await fetchTransactions();
      
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError, fetchTransactions]);

  // Account operations
  const fetchAccounts = useCallback(async () => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.get('/accounts/');
      dispatch({ type: TRANSACTION_ACTIONS.SET_ACCOUNTS, payload: response.data });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const createAccount = useCallback(async (accountData) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.post('/accounts/', accountData);
      dispatch({ 
        type: TRANSACTION_ACTIONS.ADD_ACCOUNT, 
        payload: response.data.account 
      });
      
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const updateAccount = useCallback(async (accountId, accountData) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.put(`/accounts/${accountId}`, accountData);
      dispatch({ 
        type: TRANSACTION_ACTIONS.UPDATE_ACCOUNT, 
        payload: response.data.account 
      });
      
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const deleteAccount = useCallback(async (accountId, force = false) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      await api.delete(`/accounts/${accountId}?force=${force}`);
      dispatch({ 
        type: TRANSACTION_ACTIONS.DELETE_ACCOUNT, 
        payload: accountId 
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  // Budget operations
  const fetchBudgetOverview = useCallback(async (period = 'month') => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.get(`/budget/overview?period=${period}`);
      dispatch({ type: TRANSACTION_ACTIONS.SET_BUDGET_OVERVIEW, payload: response.data });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const fetchBudgetCategories = useCallback(async () => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.get('/budget/categories');
      dispatch({ type: TRANSACTION_ACTIONS.SET_BUDGET_CATEGORIES, payload: response.data });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const createBudgetCategory = useCallback(async (categoryData) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.post('/budget/categories', categoryData);
      dispatch({ 
        type: TRANSACTION_ACTIONS.ADD_BUDGET_CATEGORY, 
        payload: response.data.category 
      });
      
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const updateBudgetCategory = useCallback(async (categoryId, categoryData) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.put(`/budget/categories/${categoryId}`, categoryData);
      dispatch({ 
        type: TRANSACTION_ACTIONS.UPDATE_BUDGET_CATEGORY, 
        payload: response.data.category 
      });
      
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  const deleteBudgetCategory = useCallback(async (categoryId) => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      await api.delete(`/budget/categories/${categoryId}`);
      dispatch({ 
        type: TRANSACTION_ACTIONS.DELETE_BUDGET_CATEGORY, 
        payload: categoryId 
      });
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  // Analytics operations
  const fetchSpendingAnalytics = useCallback(async (period = 'month') => {
    try {
      dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
      
      const response = await api.get(`/transactions/analytics/spending?period=${period}`);
      dispatch({ type: TRANSACTION_ACTIONS.SET_ANALYTICS, payload: response.data });
    } catch (error) {
      handleError(error);
    }
  }, [handleError]);

  const getBudgetComparison = useCallback(async (period = 'month') => {
    try {
      const response = await api.get(`/transactions/budget-comparison?period=${period}`);
      return response.data;
    } catch (error) {
      handleError(error);
      throw error;
    }
  }, [handleError]);

  // Utility functions
  const getAccountBalance = useCallback((accountId) => {
    const account = state.accounts.find(a => a.id === accountId);
    return account ? account.balance : 0;
  }, [state.accounts]);

  const getCategoryBudget = useCallback((categoryName) => {
    const category = state.budgetCategories.find(c => c.name === categoryName);
    return category ? category.budgeted_amount : 0;
  }, [state.budgetCategories]);

  const getCategoryActual = useCallback((categoryName) => {
    const category = state.budgetCategories.find(c => c.name === categoryName);
    return category ? category.actual_amount : 0;
  }, [state.budgetCategories]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Transaction operations
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    importTransactionsCSV,
    
    // Account operations
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    
    // Budget operations
    fetchBudgetOverview,
    fetchBudgetCategories,
    createBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    
    // Analytics
    fetchSpendingAnalytics,
    getBudgetComparison,
    
    // Utilities
    getAccountBalance,
    getCategoryBudget,
    getCategoryActual,
    clearError
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use the context
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};

export default TransactionContext;