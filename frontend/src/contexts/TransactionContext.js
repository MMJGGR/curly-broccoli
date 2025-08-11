import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { api } from '../api';

// Transaction Context for managing real financial data
const TransactionContext = createContext();

// Action types
const TRANSACTION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  SET_ACCOUNTS: 'SET_ACCOUNTS',
  ADD_ACCOUNT: 'ADD_ACCOUNT',
  UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  SET_BUDGET_CATEGORIES: 'SET_BUDGET_CATEGORIES',
  ADD_BUDGET_CATEGORY: 'ADD_BUDGET_CATEGORY',
  UPDATE_BUDGET_CATEGORY: 'UPDATE_BUDGET_CATEGORY',
  DELETE_BUDGET_CATEGORY: 'DELETE_BUDGET_CATEGORY',
  SET_ANALYTICS: 'SET_ANALYTICS',
  SET_BUDGET_OVERVIEW: 'SET_BUDGET_OVERVIEW',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Initial state
const initialState = {
  // Loading states
  isLoading: false,
  isSubmitting: false,
  error: null,
  
  // Transaction data
  transactions: [],
  totalTransactions: 0,
  currentPage: 0,
  
  // Account data
  accounts: [],
  accountSummary: {
    totalAccounts: 0,
    totalAssets: 0,
    totalLiabilities: 0,
    netWorth: 0
  },
  
  // Budget data
  budgetCategories: [],
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