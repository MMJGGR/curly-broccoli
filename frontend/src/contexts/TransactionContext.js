import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { authFetch, getAuthToken } from '../utils/authFetch';
import { generateAllSchedules } from '../utils/scheduleEngine';
import { deriveExpenseCategory, monthlyEquivalent, normalizeExpenseType } from '../utils/expenseTaxonomy';

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
  SET_EXPENSE_TYPES: 'SET_EXPENSE_TYPES',
  
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

  // Accounts CRUD
  SET_ACCOUNTS: 'SET_ACCOUNTS',
  CREATE_ACCOUNT: 'CREATE_ACCOUNT',
  UPDATE_ACCOUNT: 'UPDATE_ACCOUNT',
  DELETE_ACCOUNT: 'DELETE_ACCOUNT',
  
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
  SET_PROFILE: 'SET_PROFILE',
  
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
    accounts: false,
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
    accounts: null,
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
  accounts: [],
  incomeSource: [],
  expenses: [],
  expenseTypes: [],
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
  lastUpdated: null,

  // Planning settings
  planningStartDate: null
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

    // Accounts CRUD
    case UNIFIED_FINANCIAL_ACTIONS.SET_ACCOUNTS: {
      const accounts = Array.isArray(action.payload?.accounts) ? action.payload.accounts : [];
      return {
        ...state,
        accounts,
        accountSummary: action.payload?.summary || state.accountSummary,
        loading: { ...state.loading, accounts: false },
        errors: { ...state.errors, accounts: null },
        lastUpdated: new Date().toISOString()
      };
    }
    case UNIFIED_FINANCIAL_ACTIONS.CREATE_ACCOUNT:
      return {
        ...state,
        accounts: [...state.accounts, action.payload],
        lastUpdated: new Date().toISOString()
      };
    case UNIFIED_FINANCIAL_ACTIONS.UPDATE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.map(acc => acc.id === action.payload.id ? { ...acc, ...action.payload } : acc),
        lastUpdated: new Date().toISOString()
      };
    case UNIFIED_FINANCIAL_ACTIONS.DELETE_ACCOUNT:
      return {
        ...state,
        accounts: state.accounts.filter(acc => acc.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };

    // Profile state
    case UNIFIED_FINANCIAL_ACTIONS.SET_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
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
    case UNIFIED_FINANCIAL_ACTIONS.SET_EXPENSES: {
      const normalized = Array.isArray(action.payload)
        ? action.payload.map(exp => ({
            ...exp,
            expense_type: normalizeExpenseType(exp.expense_type || exp.type),
            expense_category: exp.expense_category || deriveExpenseCategory(exp.expense_type || exp.type),
            monthly_equivalent: typeof exp.monthly_equivalent === 'number' ? exp.monthly_equivalent : monthlyEquivalent(exp),
            // Normalize temporal fields for compatibility
            end_date: exp.end_date || exp.payment_end_date || null
          }))
        : [];
      return {
        ...state,
        expenses: normalized,
        loading: { ...state.loading, expenses: false },
        errors: { ...state.errors, expenses: null },
        lastUpdated: new Date().toISOString()
      };
    }
      
    case UNIFIED_FINANCIAL_ACTIONS.CREATE_EXPENSE: {
      const exp = action.payload;
      const normalized = {
        ...exp,
        expense_type: normalizeExpenseType(exp.expense_type || exp.type),
        expense_category: exp.expense_category || deriveExpenseCategory(exp.expense_type || exp.type),
        monthly_equivalent: typeof exp.monthly_equivalent === 'number' ? exp.monthly_equivalent : monthlyEquivalent(exp),
        end_date: exp.end_date || exp.payment_end_date || null
      };
      return {
        ...state,
        expenses: [...state.expenses, normalized],
        lastUpdated: new Date().toISOString()
      };
    }
      
    case UNIFIED_FINANCIAL_ACTIONS.UPDATE_EXPENSE: {
      const upd = action.payload;
      const normalizedUpd = {
        ...upd,
        expense_type: normalizeExpenseType(upd.expense_type || upd.type),
        expense_category: upd.expense_category || deriveExpenseCategory(upd.expense_type || upd.type),
        monthly_equivalent: typeof upd.monthly_equivalent === 'number' ? upd.monthly_equivalent : monthlyEquivalent(upd),
        end_date: upd.end_date || upd.payment_end_date || null
      };
      return {
        ...state,
        expenses: state.expenses.map(expense => 
          expense.id === normalizedUpd.id ? { ...expense, ...normalizedUpd } : expense
        ),
        lastUpdated: new Date().toISOString()
      };
    }
      
    case UNIFIED_FINANCIAL_ACTIONS.DELETE_EXPENSE:
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };
      
    case UNIFIED_FINANCIAL_ACTIONS.SET_EXPENSE_TYPES:
      return {
        ...state,
        expenseTypes: action.payload,
        loading: { ...state.loading, expenses: false },
        errors: { ...state.errors, expenses: null }
      };

    // Transactions CRUD
    case UNIFIED_FINANCIAL_ACTIONS.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: Array.isArray(action.payload) ? action.payload : [],
        loading: { ...state.loading, transactions: false },
        errors: { ...state.errors, transactions: null },
        lastUpdated: new Date().toISOString()
      };
    case UNIFIED_FINANCIAL_ACTIONS.CREATE_TRANSACTION:
      return {
        ...state,
        transactions: [...state.transactions, action.payload],
        lastUpdated: new Date().toISOString()
      };
    case UNIFIED_FINANCIAL_ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(tx => tx.id === action.payload.id ? { ...tx, ...action.payload } : tx),
        lastUpdated: new Date().toISOString()
      };
    case UNIFIED_FINANCIAL_ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(tx => tx.id !== action.payload),
        lastUpdated: new Date().toISOString()
      };

    // Budget Categories (local CRUD; endpoints may not exist yet)
    case UNIFIED_FINANCIAL_ACTIONS.SET_BUDGET_CATEGORIES:
      return {
        ...state,
        budgetCategories: Array.isArray(action.payload) ? action.payload : [],
        lastUpdated: new Date().toISOString()
      };
    case UNIFIED_FINANCIAL_ACTIONS.CREATE_BUDGET_CATEGORY:
      return {
        ...state,
        budgetCategories: [...state.budgetCategories, action.payload],
        lastUpdated: new Date().toISOString()
      };
    case UNIFIED_FINANCIAL_ACTIONS.UPDATE_BUDGET_CATEGORY:
      return {
        ...state,
        budgetCategories: state.budgetCategories.map(cat =>
          cat.id === action.payload.id ? { ...cat, ...action.payload } : cat
        ),
        lastUpdated: new Date().toISOString()
      };
    case UNIFIED_FINANCIAL_ACTIONS.DELETE_BUDGET_CATEGORY:
      return {
        ...state,
        budgetCategories: state.budgetCategories.filter(cat => cat.id !== action.payload),
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

// UnifiedFinancialProvider Component
export const UnifiedFinancialProvider = ({ children }) => {
  const [state, dispatch] = useReducer(unifiedFinancialReducer, initialUnifiedState);

  // Local refs

  // --- Utility: API Base ---
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // --- Auth/me coalescing to prevent request stampedes ---
  const meInFlightRef = React.useRef(null);
  const meLastTsRef = React.useRef(0);
  const ME_MIN_INTERVAL_MS = 2000; // coalesce calls within 2s

  // Initialize planning start date from localStorage or default to next month
  React.useEffect(() => {
    try {
      let iso = localStorage.getItem('planning_start_date');
      if (!iso) {
        const now = new Date();
        const firstNext = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
        const ym = firstNext.toISOString().slice(0, 10); // YYYY-MM-01
        iso = `${ym.slice(0,10)}`;
        localStorage.setItem('planning_start_date', iso);
      }
      if (state.planningStartDate !== iso) {
        dispatch({ type: 'SET_PLANNING_START_DATE', payload: iso });
      }
    } catch {
      // ignore
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // API Service Methods
  // Accounts CRUD
  const fetchAccounts = useCallback(async () => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { accounts: true } });
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_BASE}/api/v1/accounts-v2/`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load accounts');
      const data = await res.json();
      const accounts = Array.isArray(data) ? data : (data.accounts || []);
      const summary = Array.isArray(data) ? null : (data.summary || null);
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ACCOUNTS, payload: { accounts, summary } });
      return accounts;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { accounts: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { accounts: false } });
    }
  }, [API_BASE]);

  const createAccount = useCallback(async (accountData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { accounts: true } });
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_BASE}/api/v1/accounts-v2/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });
      if (!res.ok) throw new Error('Failed to create account');
      const body = await res.json();
      const acc = body?.account || body;
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CREATE_ACCOUNT, payload: acc });
      return acc;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { accounts: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { accounts: false } });
    }
  }, [API_BASE]);

  const updateAccount = useCallback(async (accountId, accountData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { accounts: true } });
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_BASE}/api/v1/accounts-v2/${accountId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData)
      });
      if (!res.ok) throw new Error('Failed to update account');
      const body = await res.json();
      const acc = body?.account || body;
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.UPDATE_ACCOUNT, payload: acc });
      return acc;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { accounts: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { accounts: false } });
    }
  }, [API_BASE]);

  const deleteAccount = useCallback(async (accountId, force = false) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { accounts: true } });
      const token = localStorage.getItem('jwt');
      const url = `${API_BASE}/api/v1/accounts-v2/${accountId}${force ? '?force=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to delete account');
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.DELETE_ACCOUNT, payload: accountId });
      return accountId;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { accounts: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { accounts: false } });
    }
  }, [API_BASE]);

  // --- Transactions CRUD ---
  const fetchTransactions = useCallback(async (filters = {}) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { transactions: true } });
      const token = localStorage.getItem('jwt');
      const params = new URLSearchParams();
      if (filters.accountId) params.set('account_id', filters.accountId);
      if (filters.category) params.set('category', filters.category);
      if (filters.startDate) params.set('start_date', filters.startDate);
      if (filters.endDate) params.set('end_date', filters.endDate);
      params.set('limit', String(filters.limit || 100));
      params.set('offset', String(filters.offset || 0));
      const res = await fetch(`${API_BASE}/api/v1/transactions-v2/?${params.toString()}`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to load transactions');
      const data = await res.json();
      const txs = Array.isArray(data) ? data : (data.transactions || []);
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_TRANSACTIONS, payload: txs });
      return txs;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { transactions: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { transactions: false } });
    }
  }, [API_BASE]);

  const createTransaction = useCallback(async (transactionData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { transactions: true } });
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_BASE}/api/v1/transactions-v2/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      if (!res.ok) throw new Error('Failed to create transaction');
      const body = await res.json();
      const created = body?.transaction || body;
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CREATE_TRANSACTION, payload: created });
      return created;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { transactions: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { transactions: false } });
    }
  }, [API_BASE]);

  const updateTransaction = useCallback(async (transactionId, transactionData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { transactions: true } });
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_BASE}/api/v1/transactions-v2/${transactionId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });
      if (!res.ok) throw new Error('Failed to update transaction');
      const body = await res.json();
      const updated = body?.transaction || body;
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.UPDATE_TRANSACTION, payload: updated });
      return updated;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { transactions: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { transactions: false } });
    }
  }, [API_BASE]);

  const deleteTransaction = useCallback(async (transactionId) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { transactions: true } });
      const token = localStorage.getItem('jwt');
      const res = await fetch(`${API_BASE}/api/v1/transactions-v2/${transactionId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete transaction');
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.DELETE_TRANSACTION, payload: transactionId });
      return transactionId;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { transactions: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { transactions: false } });
    }
  }, [API_BASE]);
  const createAsset = useCallback(async (assetData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { assets: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/assets-v2/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assetData)
      });

      if (!response.ok) throw new Error('Failed to create asset');
      
      const apiResponse = await response.json();
      // Assets API wraps created asset under `asset`
      const newAsset = apiResponse?.asset || apiResponse;
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CREATE_ASSET, payload: newAsset });
      return newAsset;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { assets: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { assets: false } });
    }
  }, []);

  const updateAsset = useCallback(async (assetId, assetData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { assets: true } });

      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/assets-v2/${assetId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(assetData)
      });

      if (!response.ok) throw new Error('Failed to update asset');

      const apiResponse = await response.json();
      const updatedAsset = apiResponse?.asset || apiResponse;
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.UPDATE_ASSET, payload: updatedAsset });
      return updatedAsset;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { assets: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { assets: false } });
    }
  }, []);

  const deleteAsset = useCallback(async (assetId) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { assets: true } });

      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/assets-v2/${assetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete asset');

      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.DELETE_ASSET, payload: assetId });
      return assetId;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { assets: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { assets: false } });
    }
  }, []);

  // Liability CRUD Methods
  const createLiability = useCallback(async (liabilityData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { liabilities: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/liabilities-v2/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(liabilityData)
      });

      if (!response.ok) throw new Error('Failed to create liability');
      
      const newLiability = await response.json();
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CREATE_LIABILITY, payload: newLiability });
      return newLiability;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { liabilities: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { liabilities: false } });
    }
  }, []);

  const updateLiability = useCallback(async (liabilityId, liabilityData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { liabilities: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/liabilities-v2/${liabilityId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(liabilityData)
      });

      if (!response.ok) throw new Error('Failed to update liability');
      
      const updatedLiability = await response.json();
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.UPDATE_LIABILITY, payload: updatedLiability });
      return updatedLiability;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { liabilities: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { liabilities: false } });
    }
  }, []);

  const deleteLiability = useCallback(async (liabilityId) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { liabilities: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/liabilities-v2/${liabilityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete liability');
      
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.DELETE_LIABILITY, payload: liabilityId });
      return liabilityId;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { liabilities: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { liabilities: false } });
    }
  }, []);

  // Goal CRUD Methods
  const createGoal = useCallback(async (goalData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { goals: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/goals-v2/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      });

      if (!response.ok) throw new Error('Failed to create goal');
      
      const newGoal = await response.json();
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CREATE_GOAL, payload: newGoal });
      return newGoal;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { goals: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { goals: false } });
    }
  }, []);

  const updateGoal = useCallback(async (goalId, goalData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { goals: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/goals-v2/${goalId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(goalData)
      });

      if (!response.ok) throw new Error('Failed to update goal');
      
      const updatedGoal = await response.json();
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.UPDATE_GOAL, payload: updatedGoal });
      return updatedGoal;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { goals: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { goals: false } });
    }
  }, []);

  const deleteGoal = useCallback(async (goalId) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { goals: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/goals-v2/${goalId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete goal');
      
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.DELETE_GOAL, payload: goalId });
      return goalId;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { goals: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { goals: false } });
    }
  }, []);

  // Expense CRUD Methods
  const createExpense = useCallback(async (expenseData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { expenses: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/expenses-v2/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) throw new Error('Failed to create expense');
      
      const newExpense = await response.json();
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CREATE_EXPENSE, payload: newExpense });
      return newExpense;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { expenses: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { expenses: false } });
    }
  }, []);

  const updateExpense = useCallback(async (expenseId, expenseData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { expenses: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/expenses-v2/${expenseId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expenseData)
      });

      if (!response.ok) throw new Error('Failed to update expense');
      
      const updatedExpense = await response.json();
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.UPDATE_EXPENSE, payload: updatedExpense });
      return updatedExpense;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { expenses: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { expenses: false } });
    }
  }, []);

  const deleteExpense = useCallback(async (expenseId) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { expenses: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/expenses-v2/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete expense');
      
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.DELETE_EXPENSE, payload: expenseId });
      return expenseId;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { expenses: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { expenses: false } });
    }
  }, []);

  const fetchExpenseTypes = useCallback(async () => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { expenses: true } });
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/expenses-v2/types/available`);
      
      if (!response.ok) throw new Error('Failed to fetch expense types');
      
      const data = await response.json();
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_EXPENSE_TYPES, payload: data.expense_types || [] });
      return data.expense_types || [];
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { expenses: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { expenses: false } });
    }
  }, []);

  // Income CRUD Methods
  const createIncome = useCallback(async (incomeData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { income: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/income-v2/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incomeData)
      });

      if (!response.ok) throw new Error('Failed to create income');
      
      const newIncome = await response.json();
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CREATE_INCOME_SOURCE, payload: newIncome });

      // Optional: create asset→income relationship if requested
      if (incomeData.linked_asset_id) {
        try {
          const relBody = {
            relationship_type: 'asset_income',
            source_type: 'asset',
            source_id: incomeData.linked_asset_id,
            target_type: 'income',
            target_id: newIncome.id,
            amount: incomeData.monthly_amount,
            frequency: incomeData.frequency || 'monthly',
            description: incomeData.asset_relationship_type || 'Linked via IncomeManagement'
          };
          await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/relationships-v2/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(relBody)
          });
        } catch (e) {
          console.warn('Failed to create asset→income relationship:', e.message);
        }
      }
      return newIncome;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { income: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { income: false } });
    }
  }, []);

  const updateIncome = useCallback(async (incomeId, incomeData) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { income: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/income-v2/${incomeId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(incomeData)
      });

      if (!response.ok) throw new Error('Failed to update income');
      
      const updatedIncome = await response.json();
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.UPDATE_INCOME_SOURCE, payload: updatedIncome });
      // Update relationship if linked_asset_id provided
      if (incomeData.linked_asset_id) {
        try {
          const relBody = {
            relationship_type: 'asset_income',
            source_type: 'asset',
            source_id: incomeData.linked_asset_id,
            target_type: 'income',
            target_id: incomeId,
            amount: incomeData.monthly_amount,
            frequency: incomeData.frequency || 'monthly',
            description: incomeData.asset_relationship_type || 'Linked via IncomeManagement'
          };
          await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/relationships-v2/`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(relBody)
          });
        } catch (e) {
          console.warn('Failed to update asset→income relationship:', e.message);
        }
      }
      return updatedIncome;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { income: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { income: false } });
    }
  }, []);

  const deleteIncome = useCallback(async (incomeId) => {
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { income: true } });
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/income-v2/${incomeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete income');
      
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.DELETE_INCOME_SOURCE, payload: incomeId });
      return incomeId;
    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { income: error.message } });
      throw error;
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { income: false } });
    }
  }, []);

  // Helper function for timeout-enabled fetch
  const fetchWithTimeout = useCallback(async (url, options, timeout = 10000) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      const response = await authFetch(url, {
        ...options,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        console.warn(`Request timed out: ${url}`);
        // Return a mock "ok: false" response for timeout
        return { ok: false, status: 408, statusText: 'Request Timeout' };
      }
      throw error;
    }
  }, []);

  // Add a ref to track the last fetch timestamp
  const lastFetchRef = React.useRef(0);
  const MINIMUM_FETCH_INTERVAL = 3000; // 3 seconds minimum between fetches
  
  const fetchAllFinancialData = useCallback(async () => {
    // Prevent rapid successive calls with timing check
    const now = Date.now();
    if (state.loading.global || (now - lastFetchRef.current) < MINIMUM_FETCH_INTERVAL) {
      return;
    }
    
    lastFetchRef.current = now;
    
    try {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { global: true } });
      
      const token = getAuthToken();
      if (!token) {
        // Not authenticated yet; skip background fetch to avoid 401 noise
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { global: false } });
        return;
      }
      
      // Fetch all financial data in parallel - using onboarding-integrated endpoints with timeout
      const [assetsRes, liabilitiesRes, incomesRes, expensesRes, goalsRes, accountsRes] = await Promise.all([
        fetchWithTimeout(`${API_BASE}/api/v1/assets-v2/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout(`${API_BASE}/api/v1/liabilities-v2/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout(`${API_BASE}/api/v1/income-v2/overview`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout(`${API_BASE}/api/v1/expenses-v2/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout(`${API_BASE}/api/v1/goals-v2/overview`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout(`${API_BASE}/api/v1/accounts-v2/`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (assetsRes.ok) {
        const assetsResponse = await assetsRes.json();
        // API returns an object with `assets` array and summary; extract array
        const assetArray = Array.isArray(assetsResponse)
          ? assetsResponse
          : (assetsResponse?.assets || []);
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ASSETS, payload: assetArray });
      }

      if (liabilitiesRes.ok) {
        const liabilitiesResponse = await liabilitiesRes.json();
        // API returns an object with `liabilities` array and summary; extract array
        const liabilityArray = Array.isArray(liabilitiesResponse)
          ? liabilitiesResponse
          : (liabilitiesResponse?.liabilities || []);
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LIABILITIES, payload: liabilityArray });
      }

      if (incomesRes.ok) {
        const incomesData = await incomesRes.json();
        // Extract the income_sources array from the API response structure
        const incomes = incomesData.income_sources || [];
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_INCOME_SOURCES, payload: incomes });
      } else {
        console.warn('Income API failed or timed out, using empty fallback data');
        // Set empty income array to prevent downstream shape errors
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_INCOME_SOURCES, payload: [] });
      }

      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        // Extract the expenses array from the API response structure
        const expenses = expensesData.expenses || [];
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_EXPENSES, payload: expenses });
      }

      if (goalsRes.ok) {
        const goalsResponse = await goalsRes.json();
        const goalsArray = Array.isArray(goalsResponse)
          ? goalsResponse
          : (goalsResponse?.goals || []);
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_GOALS, payload: goalsArray });
      } else {
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_GOALS, payload: [] });
      }

      if (accountsRes.ok) {
        const accountsResponse = await accountsRes.json();
        const accountsArr = Array.isArray(accountsResponse) ? accountsResponse : (accountsResponse?.accounts || []);
        const summary = Array.isArray(accountsResponse) ? null : (accountsResponse?.summary || null);
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ACCOUNTS, payload: { accounts: accountsArr, summary } });
      }

    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { global: error.message } });
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { global: false } });
    }
  }, [API_BASE, fetchWithTimeout, state.loading.global]);

  // Stable fetchProfile with in-flight coalescing and fallback
  const fetchProfile = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return null;

    const now = Date.now();
    if (meInFlightRef.current && (now - meLastTsRef.current) < ME_MIN_INTERVAL_MS) {
      // Reuse in-flight promise within window
      return meInFlightRef.current;
    }

    const runner = (async () => {
      try {
        // Clean-arch profile insights (profile-v2)
        let insights = null;
        try {
          const v2 = await fetchWithTimeout(`${API_BASE}/api/v1/profile-v2/`, { headers: { 'Authorization': `Bearer ${token}` } }, 8000);
          if (v2.ok) {
            const data = await v2.json();
            insights = {
              age_category: data?.financial_planning?.age_category,
              emergency_fund_target: data?.financial_planning?.emergency_fund_target,
              expected_return_rate: data?.risk_profile?.expected_return_rate ?? data?.financial_planning?.expected_return_rate,
              recommended_asset_allocation: data?.risk_profile?.recommended_asset_allocation || null,
            };
          }
        } catch (e) {
          // Insights endpoint optional; ignore failures
          console.debug('profile-v2 insights unavailable');
        }

        // Use auth/me for comprehensive profile fields
        let res = await fetchWithTimeout(`${API_BASE}/auth/me`, { headers: { 'Authorization': `Bearer ${token}` } }, 10000);
        let profilePayload = null;
        let hasProfile = false;
        if (res.ok) {
          const me = await res.json();
          const p = me?.profile;
          if (p && (p.first_name || p.annual_income || p.monthly_income || p.dependents !== null)) {
            profilePayload = {
              // normalized profile model for consumers
              id: p.id,
              first_name: p.first_name,
              last_name: p.last_name,
              email: me?.email,
              date_of_birth: p.date_of_birth || p.dob,
              age: p.age || (p.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth)) / (365.25 * 24 * 3600 * 1000)) : null),
              employment_status: p.employment_status,
              dependents: p.dependents ?? null,
              monthly_income: p.monthly_income || (p.annual_income ? p.annual_income / 12 : null),
              monthly_expenses: p.monthly_expenses ?? null,
              monthly_debt_payments: p.monthly_debt_payments ?? null,
              current_savings: p.current_savings ?? null,
              retirement_age: p.retirement_age || p.target_retirement_age || 65,
              questionnaire: p.questionnaire || null,
              risk_tolerance: p.risk_tolerance || null,
              // Preferences mapping
              preferences: p.preferences || p.investment_preferences || null,
              investment_preferences: p.investment_preferences || null,
              // Planning insights from clean-arch
              age_category: insights?.age_category,
              emergency_fund_target: insights?.emergency_fund_target,
              expected_return_rate: insights?.expected_return_rate,
              recommended_asset_allocation: insights?.recommended_asset_allocation
            };
            hasProfile = true;
          }
        }

        // Fallback to onboarding state
        if (!hasProfile) {
          res = await fetchWithTimeout(`${API_BASE}/api/v1/onboarding-v2-clean/state`, { headers: { 'Authorization': `Bearer ${token}` } }, 10000);
          if (res.ok) {
            const onboarding = await res.json();
            const personal = onboarding?.personal_data || {};
            const financial = onboarding?.financial_data || {};
            const risk = onboarding?.risk_data || {};
            profilePayload = {
              first_name: personal.firstName || '',
              last_name: personal.lastName || '',
              email: onboarding?.email || null,
              date_of_birth: personal.dateOfBirth || null,
              age: personal.dateOfBirth ? Math.floor((Date.now() - new Date(personal.dateOfBirth)) / (365.25 * 24 * 3600 * 1000)) : null,
              employment_status: personal.employmentStatus || null,
              dependents: personal.dependents ?? null,
              monthly_income: financial.monthlyIncome ?? null,
              monthly_expenses: [
                financial.rent,
                financial.utilities,
                financial.groceries,
                financial.transport,
                financial.loanRepayments
              ].map(v => parseFloat(v) || 0).reduce((a, b) => a + b, 0),
              current_savings: financial.currentSavings ?? null,
              retirement_age: onboarding?.goals_data?.retirement || 65,
              questionnaire: Array.isArray(risk.questionnaire) ? risk.questionnaire : null,
              risk_tolerance: null,
              age_category: insights?.age_category,
              emergency_fund_target: insights?.emergency_fund_target,
              expected_return_rate: insights?.expected_return_rate,
              recommended_asset_allocation: insights?.recommended_asset_allocation
            };
          }
        }

        if (profilePayload) {
          dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_PROFILE, payload: profilePayload });
          return profilePayload;
        }
        return null;
      } catch (e) {
        // Non-fatal for UI
        return null;
      }
    })();

    meLastTsRef.current = now;
    meInFlightRef.current = runner.finally(() => {
      // clear after completion so next call can proceed
      meInFlightRef.current = null;
    });
    return meInFlightRef.current;
  }, [API_BASE, fetchWithTimeout]);

  // Stable updateProfile using useCallback
  const updateProfile = useCallback(async (updates) => {
    const token = localStorage.getItem('jwt');
    if (!token) throw new Error('Not authenticated');
    // Try clean-arch endpoint first
    let ok = false;
    try {
      const v2 = await fetch(`${API_BASE}/api/v1/profile-v2/`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      ok = v2.ok;
    } catch (_) {
      ok = false;
    }
    if (!ok) {
      // Fallback to legacy auth endpoint
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update profile');
    }
    // refresh
    await fetchProfile();
    return true;
  }, [API_BASE, fetchProfile]);

  // --- Budget categories fetcher (stable, inside provider scope) ---
  const fetchBudgetCategories = useCallback(async () => {
    const token = localStorage.getItem('jwt');
    // Try dedicated Budget V2 endpoint first
    try {
      const res = await fetch(`${API_BASE}/api/v1/budget-v2/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.categories || []).map((c, idx) => ({
          id: `bc_${idx}_${c.name}`,
          name: c.name,
          budgeted_amount: typeof c.allocated_amount === 'number' ? c.allocated_amount : (typeof c.budgeted_amount === 'number' ? c.budgeted_amount : 0),
          actual_amount: typeof c.actual_amount === 'number' ? c.actual_amount : 0,
          category_type: c.category_type || 'expense',
          is_active: !!c.is_active
        }));
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_BUDGET_CATEGORIES, payload: mapped });
        return mapped;
      }
    } catch (e) {
      // fall through to comparison
    }
    console.warn('Budget categories API unavailable; using local state only.');
    return state.budgetCategories;
  }, [API_BASE, state.budgetCategories]);

  // Load data on mount only once
  React.useEffect(() => {
    fetchAllFinancialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  const value = {
    // State
    ...state,
    // Planning base date (start of the schedule/calendar)
    planningStartDate: state.planningStartDate,
    // Backward-compatibility aliases for legacy consumers
    incomes: state.incomeSource || [],
    profile: state.userProfile || null,

    // Actions
    // fetchProfile injected from useCallback (stable identity)
    fetchProfile,

    // updateProfile injected from useCallback (stable identity)
    updateProfile,
    
    // Accounts
    accounts: state.accounts,
    accountSummary: state.accountSummary,
    fetchAccounts,
    createAccount,
    updateAccount,
    deleteAccount,

    // Transactions
    transactions: state.transactions,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    
    // Error helpers
    isLoading: state.loading.global,
    error: state.errors.global || null,
    clearError: (key = 'global') => dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CLEAR_ERROR, payload: key }),
    updatePreferences: async (prefs) => {
      return await value.updateProfile({ investment_preferences: prefs });
    },

    // Selectors (memoized)
    selectHumanCapital: () => computeHumanCapital(state.userProfile),
    selectNetCashFlow: () => computeNetCashFlow(state.incomeSource, state.expenses),
    selectGoalAllocationsTotal: () => {
      try {
        const cats = state.budgetCategories || [];
        return cats
          .filter(c => typeof c.name === 'string' && c.name.toLowerCase().startsWith('goal:'))
          .reduce((s, c) => s + (parseFloat(c.budgeted_amount || 0) || 0), 0);
      } catch { return 0; }
    },
    selectSurplusAfterGoals: () => {
      const base = computeNetCashFlow(state.incomeSource, state.expenses);
      const ga = (state.budgetCategories || []).filter(c => typeof c.name === 'string' && c.name.toLowerCase().startsWith('goal:'))
        .reduce((s, c) => s + (parseFloat(c.budgeted_amount || 0) || 0), 0);
      return base - ga;
    },
    selectBudgetSummary: () => {
      const base = computeBudgetSummary(state.incomeSource, state.expenses);
      const goalAlloc = (state.budgetCategories || [])
        .filter(c => typeof c.name === 'string' && c.name.toLowerCase().startsWith('goal:'))
        .reduce((s, c) => s + (parseFloat(c.budgeted_amount || 0) || 0), 0);
      return {
        ...base,
        goal_allocations_total: goalAlloc,
        surplus_after_goals: base.remaining_budget - goalAlloc
      };
    },
    selectRiskProfile: () => computeRiskProfile(state.userProfile),
    selectBudgetCategories: () => state.budgetCategories,
    // Mutators
    setPlanningStartDate: async (isoOrMonth) => {
      try {
        // Accept YYYY-MM (from input type="month") or ISO YYYY-MM-DD
        let iso = isoOrMonth;
        if (/^\d{4}-\d{2}$/.test(isoOrMonth)) iso = `${isoOrMonth}-01`;
        // Persist locally for stability even if backend ignores
        localStorage.setItem('planning_start_date', iso);
        // Attempt to update profile (non-breaking if backend ignores extra field)
        try { await updateProfile({ planning_start_date: iso }); } catch {}
        // Update state via reducer
        dispatch({ type: 'SET_PLANNING_START_DATE', payload: iso });
        return iso;
      } catch { return null; }
    },
    // Budget overview and analytics helpers
    budgetOverview: state.budgetOverview,
    fetchBudgetOverview: async () => {
      const overview = computeBudgetSummary(state.incomeSource, state.expenses);
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_BUDGET_OVERVIEW, payload: overview });
      return overview;
    },
    spendingAnalytics: {
      categoryBreakdown: Array.from(
        (state.expenses || []).reduce((map, exp) => {
          const cat = exp.expense_category || 'miscellaneous';
          const amt = Math.abs(parseFloat(exp.monthly_equivalent || exp.amount || 0) || 0);
          map.set(cat, (map.get(cat) || 0) + amt);
          return map;
        }, new Map())
      ).map(([category, amount]) => ({ category, amount }))
    },
    fetchSpendingAnalytics: async () => {
      // Use local computation for now
      const breakdown = Array.from(
        (state.expenses || []).reduce((map, exp) => {
          const cat = exp.expense_category || 'miscellaneous';
          const amt = Math.abs(parseFloat(exp.monthly_equivalent || exp.amount || 0) || 0);
          map.set(cat, (map.get(cat) || 0) + amt);
          return map;
        }, new Map())
      ).map(([category, amount]) => ({ category, amount }));
      return { categoryBreakdown: breakdown };
    },
    getBudgetComparison: async (_period = 'month') => {
      // Deprecated endpoint removed — compute locally from state
      const breakdown = Array.from(
        (state.expenses || []).reduce((map, exp) => {
          const cat = exp.expense_category || 'miscellaneous';
          const amt = Math.abs(parseFloat(exp.monthly_equivalent || exp.amount || 0) || 0);
          map.set(cat, (map.get(cat) || 0) + amt);
          return map;
        }, new Map())
      ).map(([category, amount]) => ({ category, amount }));
      return { budget_comparison: breakdown };
    },

    // Budget categories (API-backed where available with fallback)
    fetchBudgetCategories: fetchBudgetCategories,
    createBudgetCategory: async ({ name, budgeted_amount }) => {
      const token = localStorage.getItem('jwt');
      try {
        const url = `${API_BASE}/api/v1/budget-v2/categories?category_name=${encodeURIComponent(name)}&allocated_amount=${encodeURIComponent(budgeted_amount)}`;
        const res = await fetch(url, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
        if (!res.ok) throw new Error('Failed to create budget category');
        // Update local state
        const payload = { id: `bc_${Date.now()}`, name, budgeted_amount: Number(budgeted_amount) || 0, actual_amount: 0 };
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CREATE_BUDGET_CATEGORY, payload });
        return payload;
      } catch (e) {
        // Fallback to local if API not available
        const payload = { id: `bc_${Date.now()}`, name, budgeted_amount: Number(budgeted_amount) || 0, actual_amount: 0 };
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.CREATE_BUDGET_CATEGORY, payload });
        return payload;
      }
    },
    updateBudgetCategory: async (id, updates) => {
      const token = localStorage.getItem('jwt');
      const cat = state.budgetCategories.find(c => c.id === id);
      if (!cat) {
        // Just update local if not found
        const payload = { id, ...updates };
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.UPDATE_BUDGET_CATEGORY, payload });
        return payload;
      }
      // If name provided in updates, prefer that for API path
      const name = (updates && updates.name) || cat.name;
      const newAmount = updates && updates.budgeted_amount;
      try {
        if (typeof newAmount === 'number') {
          const url = `${API_BASE}/api/v1/budget-v2/categories/${encodeURIComponent(name)}/allocation?new_amount=${encodeURIComponent(newAmount)}`;
          const res = await fetch(url, { method: 'PUT', headers: { 'Authorization': `Bearer ${token}` } });
          if (!res.ok) throw new Error('Failed to update category allocation');
        }
      } catch (e) {
        console.warn('Budget category update via API failed, applying local update:', e.message);
      }
      const payload = { id, ...updates };
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.UPDATE_BUDGET_CATEGORY, payload });
      return payload;
    },
    deleteBudgetCategory: async (idOrName, { hard = false } = {}) => {
      const token = localStorage.getItem('jwt');
      // Resolve category name
      let name = idOrName;
      const cat = state.budgetCategories.find(c => c.id === idOrName);
      if (cat) name = cat.name;
      try {
        const res = await fetch(`${API_BASE}/api/v1/budget-v2/categories/${encodeURIComponent(name)}?hard=${hard ? 'true' : 'false'}` , {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to delete budget category');
      } catch (e) {
        console.warn('Budget category delete via API failed, applying local delete:', e.message);
      }
      const id = cat ? cat.id : idOrName;
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.DELETE_BUDGET_CATEGORY, payload: id });
      return id;
    },

    // Apply baseline onboarding financials into Budget (idempotent upsert by description)
    applyBaselineToBudget: async () => {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('Not authenticated');
      try {
        const res = await fetchWithTimeout(`${API_BASE}/api/v1/onboarding-v2-clean/state`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }, 10000);
        if (!res.ok) throw new Error('Failed to fetch onboarding state');

        const onboardingState = await res.json();
        const fin = onboardingState?.financial_data || {};

        const baselineItems = [];
        const pushItem = (description, amount, expense_type) => {
          const amt = parseFloat(amount) || 0;
          if (amt > 0) baselineItems.push({ description, amount: amt, expense_type, frequency: 'monthly', is_recurring: true });
        };

        pushItem('Rent', fin.rent, 'housing');
        pushItem('Utilities', fin.utilities, 'utilities');
        pushItem('Groceries', fin.groceries, 'food_dining');
        pushItem('Transport', fin.transport, 'transportation');
        pushItem('Loan Repayments', fin.loanRepayments, 'debt_payments');
        if (Array.isArray(fin.customExpenses)) {
          fin.customExpenses.forEach((ce) => pushItem(ce?.name || 'Custom Expense', ce?.amount, 'other'));
        }

        // Idempotent upsert by description if exists
        for (const item of baselineItems) {
          const existing = (state.expenses || []).find(e => e.description === item.description);
          if (existing && existing.id) {
            await updateExpense(existing.id, { ...existing, amount: item.amount, expense_type: item.expense_type, frequency: 'monthly', is_recurring: true });
          } else {
            await createExpense(item);
          }
        }
        await fetchAllFinancialData();
        return { created: baselineItems.length };
      } catch (e) {
        console.warn('applyBaselineToBudget failed:', e.message);
        throw e;
      }
    },

    createAsset,
    updateAsset,
    deleteAsset,
    createLiability,
    updateLiability,
    deleteLiability,
    createGoal,
    updateGoal,
    deleteGoal,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchExpenseTypes,
    createIncome,
    updateIncome,
    deleteIncome,
    fetchAllFinancialData,

    // Schedules & Trial Balance selectors (derived/suggestive)
    selectSchedules: (horizonMonths = null, rates = {}) => {
      const profile = state.userProfile || {};
      const age = profile.age || 30;
      const retirementAge = profile.retirement_age || profile.target_retirement_age || 65;
      const defaultHorizon = Math.max(12, Math.min(480, (retirementAge - age) * 12));
      const horizon = horizonMonths || defaultHorizon;
      return generateAllSchedules(state, horizon, rates);
    },
    selectTrialBalance: (periodIndex = 0, rates = {}) => {
      const profile = state.userProfile || {};
      const age = profile.age || 30;
      const retirementAge = profile.retirement_age || profile.target_retirement_age || 65;
      const horizon = Math.max(12, Math.min(480, (retirementAge - age) * 12));
      const schedules = generateAllSchedules(state, horizon, rates);
      const monthFlows = schedules.filter(s => s.t === periodIndex);
      const income = monthFlows.filter(f => f.type === 'income').reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
      const totalExpenses = monthFlows.filter(f => f.type === 'expense' || f.type === 'goal_contribution').reduce((s, f) => s + (parseFloat(f.amount) || 0), 0);
      const netCashFlow = income + totalExpenses; // expenses are negative
      const totalAssets = (state.assets || []).reduce((s, a) => s + (parseFloat(a.current_value || 0) || 0), 0);
      const totalLiabilities = (state.liabilities || []).reduce((s, l) => s + (parseFloat(l.current_balance || 0) || 0), 0);
      const netWorth = totalAssets - totalLiabilities;

      const suggestions = [];
      const ownsHome = (state.assets || []).some(a => (a.asset_type || '').toLowerCase() === 'real_estate');
      const rentExpense = (state.expenses || []).find(e => {
        const et = (e.expense_type || '').toLowerCase();
        const desc = (e.description || '').toLowerCase();
        return et === 'rent' || (et === 'housing' && desc.includes('rent'));
      });
      if (ownsHome && rentExpense && !rentExpense.payment_end_date) {
        suggestions.push({ type: 'end_expense', id: rentExpense.id, reason: 'Home ownership replaces rent' });
      }
      const goals = state.goals || [];
      const underfunded = goals.filter(g => (parseFloat(g.current_amount || g.current || 0) || 0) < (parseFloat(g.target_amount || g.target || 0) || 0));
      if (netCashFlow > 0 && underfunded.length > 0) {
        const per = netCashFlow / underfunded.length;
        underfunded.forEach(g => {
          suggestions.push({ type: 'set_goal_contribution', goalId: g.id, name: g.name, monthly_amount: Math.round(per) });
        });
      }

      // Asset-linked maintenance/insurance suggestions
      const expenses = state.expenses || [];
      (state.assets || []).forEach(asset => {
        const at = (asset.asset_type || '').toLowerCase();
        const hasMaint = expenses.some(e => e.related_asset_id === asset.id && (e.relationship_type || '') === 'asset_maintenance');
        const hasIns = expenses.some(e => e.related_asset_id === asset.id && (e.relationship_type || '') === 'insurance_premium');
        if (at === 'vehicle') {
          if (!hasMaint) suggestions.push({ type: 'create_expense_asset_maintenance', assetId: asset.id, name: asset.name, estimate: Math.round((parseFloat(asset.current_value||0) || 0) * 0.01 / 12) || 0 });
          if (!hasIns) suggestions.push({ type: 'create_expense_insurance_premium', assetId: asset.id, name: asset.name, estimate: 5000 });
        }
        if (at === 'real_estate') {
          const hasTax = expenses.some(e => e.related_asset_id === asset.id && (e.relationship_type || '') === 'property_tax');
          if (!hasMaint) suggestions.push({ type: 'create_expense_asset_maintenance', assetId: asset.id, name: asset.name, estimate: Math.round((parseFloat(asset.current_value||0) || 0) * 0.005 / 12) || 0 });
          if (!hasIns) suggestions.push({ type: 'create_expense_insurance_premium', assetId: asset.id, name: asset.name, estimate: 3000 });
          if (!hasTax) suggestions.push({ type: 'create_expense_property_tax', assetId: asset.id, name: asset.name, estimate: 2000 });
        }
      });

      // Liability loan payment check
      (state.liabilities || []).forEach(l => {
        const mp = parseFloat(l.monthly_payment || 0) || 0;
        const exists = expenses.find(e => e.related_liability_id === l.id && (e.relationship_type || '') === 'loan_payment');
        if (mp > 0 && !exists) {
          suggestions.push({ type: 'create_expense_loan_payment', liabilityId: l.id, name: l.name, amount: Math.round(mp), is_finite_payment: true, due_date: l.due_date || null });
        } else if (mp > 0 && exists && Math.abs((parseFloat(exists.amount||0) || 0) - mp) > 1) {
          suggestions.push({ type: 'update_expense_amount', id: exists.id, amount: Math.round(mp), reason: 'Align loan payment with liability' });
        }
      });

      return {
        periodIndex,
        totals: {
          income,
          expenses,
          netCashFlow,
          assets: totalAssets,
          liabilities: totalLiabilities,
          netWorth
        },
        suggestions,
        flows: monthFlows
      };
    },
    applySuggestions: async (suggestions = []) => {
      const token = localStorage.getItem('jwt');
      const API = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      for (const s of suggestions) {
        try {
          if (s.type === 'end_expense' && s.id) {
            await fetch(`${API}/api/v1/expenses-v2/${s.id}`, {
              method: 'PUT',
              headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
              body: JSON.stringify({ payment_end_date: s.payment_end_date || new Date().toISOString().slice(0,10) })
            });
          }
          if (s.type === 'set_goal_contribution' && s.monthly_amount) {
            const name = `Goal: ${s.name || s.goalId}`;
            await value.createBudgetCategory({ name, budgeted_amount: s.monthly_amount });
          }
          if (s.type === 'create_expense_asset_maintenance') {
            await value.createExpense({ description: `Maintenance: ${s.name}`, amount: s.estimate || 0, expense_type: 'maintenance', frequency: 'monthly', is_recurring: true, related_asset_id: s.assetId, relationship_type: 'asset_maintenance' });
          }
          if (s.type === 'create_expense_insurance_premium') {
            await value.createExpense({ description: `Insurance: ${s.name}`, amount: s.estimate || 0, expense_type: 'insurance', frequency: 'monthly', is_recurring: true, related_asset_id: s.assetId, relationship_type: 'insurance_premium' });
          }
          if (s.type === 'create_expense_property_tax') {
            await value.createExpense({ description: `Property Tax: ${s.name}`, amount: s.estimate || 0, expense_type: 'property_tax', frequency: 'monthly', is_recurring: true, related_asset_id: s.assetId, relationship_type: 'property_tax' });
          }
          if (s.type === 'create_expense_loan_payment') {
            await value.createExpense({ description: `Loan Payment: ${s.name}`, amount: s.amount || 0, expense_type: 'debt_payments', frequency: 'monthly', is_recurring: true, related_liability_id: s.liabilityId, relationship_type: 'loan_payment', is_finite_payment: !!s.is_finite_payment, payment_end_date: s.due_date || null });
          }
          if (s.type === 'update_expense_amount' && s.id) {
            await value.updateExpense(s.id, { amount: s.amount });
          }
        } catch (e) {
          console.warn('applySuggestions failed for', s, e.message);
        }
      }
      // Audit log entry
      try {
        const { addAuditEntry, postAuditToServer } = await import('../utils/tbAuditLog');
        const entry = { timestamp: new Date().toISOString(), suggestions };
        await addAuditEntry(entry);
        await postAuditToServer(entry);
      } catch {}
      // Post journal entries representing these changes (COA-friendly simple mappings)
      try {
        const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
        const token = localStorage.getItem('jwt');
        const entries = suggestions.map(s => {
          const amt = Math.round(s.monthly_amount || s.amount || 0);
          if (!amt) return null;
          let lines;
          if (s.type === 'set_goal_contribution') {
            // Transfer: Dr Goal Fund (asset), Cr Cash (asset)
            lines = [
              { account_type: 'asset', debit: amt, credit: 0, entity_type: 'goal_fund', entity_id: s.goalId || null, memo: s.name || '' },
              { account_type: 'asset', debit: 0, credit: amt, entity_type: 'cash', entity_id: null, memo: 'Goal contribution' }
            ];
          } else if (s.type?.startsWith('create_expense_') || s.type === 'update_expense_amount') {
            // Expense payment: Dr Expense, Cr Cash
            lines = [
              { account_type: 'expense', debit: amt, credit: 0, entity_type: s.type, entity_id: s.id || s.liabilityId || s.assetId || null, memo: s.reason || '' },
              { account_type: 'asset', debit: 0, credit: amt, entity_type: 'cash', entity_id: null, memo: 'Expense created/updated' }
            ];
          } else {
            // Default: Dr Expense, Cr Equity (fallback)
            lines = [
              { account_type: 'expense', debit: amt, credit: 0, entity_type: s.type, entity_id: s.id || s.goalId, memo: s.reason || '' },
              { account_type: 'equity', debit: 0, credit: amt, entity_type: 'system', entity_id: null, memo: 'Suggestion applied' }
            ];
          }
          return {
            timestamp: new Date().toISOString(),
            description: `${s.type}${s.name ? ': ' + s.name : ''}`,
            lines,
            meta: s
          };
        }).filter(Boolean);
        for (const entry of entries) {
          await fetch(`${base}/api/v1/ledger/journal`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }, body: JSON.stringify(entry) });
        }
      } catch {}
      await fetchAllFinancialData();
      return true;
    }
  };

  // --- Recalc pipeline and helpers ---
  function computeHumanCapital(profile) {
    if (!profile) return 0;
    const age = profile.age || 25;
    const retirementAge = profile.retirement_age || 65;
    const years = Math.max(0, retirementAge - age);
    const annualIncome = (profile.monthly_income || 0) * 12;
    const g = 0.03; // income growth 3%
    const r = 0.125; // discount 12.5%
    // Growing annuity PV: PV = P1 * (1 - ((1+g)/(1+r))^n) / (r - g)
    if (r <= g || years === 0) return 0;
    const P1 = annualIncome * (1 + g);
    const factor = 1 - Math.pow((1 + g) / (1 + r), years);
    return Math.max(0, P1 * factor / (r - g));
  }

  function sumMonthlyIncome(incomeSource) {
    if (!Array.isArray(incomeSource)) return 0;
    return incomeSource.reduce((sum, inc) => sum + (parseFloat(inc.monthly_amount || inc.amount || 0) || 0), 0);
  }

  function sumMonthlyExpenses(expenses) {
    if (!Array.isArray(expenses)) return 0;
    return expenses.reduce((sum, exp) => sum + (parseFloat(exp.monthly_equivalent) || parseFloat(exp.amount) || 0), 0);
  }

  function computeNetCashFlow(incomeSource, expenses) {
    const inc = sumMonthlyIncome(incomeSource);
    const exp = sumMonthlyExpenses(expenses);
    return inc - exp;
  }

  function computeBudgetSummary(incomeSource, expenses) {
    const monthlyIncome = sumMonthlyIncome(incomeSource);
    const monthlyExpenses = sumMonthlyExpenses(expenses);
    const remaining = monthlyIncome - monthlyExpenses;
    const utilization = monthlyIncome > 0 ? (monthlyExpenses / monthlyIncome) * 100 : 0;
    return {
      total_budgeted: monthlyIncome,
      total_spent: monthlyExpenses,
      remaining_budget: remaining,
      budget_utilization: utilization
    };
  }

  function computeRiskProfile(profile) {
    if (!profile) return { score: null, level: 'Not assessed' };
    const q = profile.questionnaire;
    if (!Array.isArray(q) || q.length === 0) return { score: null, level: 'Not assessed' };
    const score = Math.round((q.reduce((s, a) => s + a, 0) / (q.length * 4)) * 100);
    let level = 'Balanced';
    if (score <= 25) level = 'Conservative';
    else if (score <= 50) level = 'Moderate';
    else if (score <= 75) level = 'Balanced';
    else level = 'Aggressive';
    return { score, level };
  }

  const recalc = useCallback(() => {
    // cash flow
    const cashFlow = computeNetCashFlow(state.incomeSource, state.expenses);
    dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_CASH_FLOW, payload: cashFlow });
    // budget
    const budget = computeBudgetSummary(state.incomeSource, state.expenses);
    dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_BUDGET_OVERVIEW, payload: budget });
    // Net worth is already handled elsewhere; human capital selector available
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.incomeSource, state.expenses]);

  // Keep a ref snapshot for idempotent operations
  const stateRef = React.useRef(state);
  React.useEffect(() => { stateRef.current = state; }, [state]);

  // Trigger recalc when incomes or expenses change
  React.useEffect(() => {
    recalc();
  }, [state.incomeSource, state.expenses, recalc]);

  return (
    <UnifiedFinancialContext.Provider value={value}>
      {children}
    </UnifiedFinancialContext.Provider>
  );
};

// Custom hook to use the unified context
export const useUnifiedFinancialContext = () => {
  const context = useContext(UnifiedFinancialContext);
  if (!context) {
    throw new Error('useUnifiedFinancialContext must be used within a UnifiedFinancialProvider');
  }
  return context;
};

// Backward-compatibility alias for components importing useTransactions
export const useTransactions = useUnifiedFinancialContext;
    case 'SET_PLANNING_START_DATE':
      return {
        ...state,
        planningStartDate: action.payload || null
      };
