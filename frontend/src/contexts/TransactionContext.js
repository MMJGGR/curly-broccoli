import React, { createContext, useContext, useReducer, useCallback } from 'react';
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

  // Local memo cache helpers
  const memo = React.useRef({});

  // --- Utility: API Base ---
  const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

  // API Service Methods
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
      const response = await fetch(url, {
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
      
      const token = localStorage.getItem('jwt');
      
      // Fetch all financial data in parallel - using onboarding-integrated endpoints with timeout
      const [assetsRes, liabilitiesRes, incomesRes, expensesRes, goalsRes] = await Promise.all([
        fetchWithTimeout(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/assets-v2/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/liabilities-v2/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/income-v2/overview`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/expenses-v2/`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetchWithTimeout(`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/goals-v2/overview`, { headers: { 'Authorization': `Bearer ${token}` } })
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
        const goals = await goalsRes.json();
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_GOALS, payload: goals });
      }

    } catch (error) {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_ERROR, payload: { global: error.message } });
    } finally {
      dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_LOADING, payload: { global: false } });
    }
  }, [fetchWithTimeout, state.loading.global]);

  // Load data on mount only once
  React.useEffect(() => {
    fetchAllFinancialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  const value = {
    // State
    ...state,
    // Backward-compatibility aliases for legacy consumers
    incomes: state.incomeSource || [],
    profile: state.userProfile || null,

    // Actions
    fetchProfile: async () => {
      const token = localStorage.getItem('jwt');
      if (!token) return null;
      try {
        // Try auth/me first
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
              risk_tolerance: p.risk_tolerance || null
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
              risk_tolerance: null
            };
          }
        }

        if (profilePayload) {
          dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_PROFILE, payload: profilePayload });
          // Trigger recalculation based on latest profile + existing incomes/expenses
          recalc();
          return profilePayload;
        }
        return null;
      } catch (e) {
        // Non-fatal for UI
        return null;
      }
    },

    updateProfile: async (updates) => {
      const token = localStorage.getItem('jwt');
      if (!token) throw new Error('Not authenticated');
      const res = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      // refresh
      await value.fetchProfile();
      return true;
    },

    // Selectors (memoized)
    selectHumanCapital: () => computeHumanCapital(state.userProfile),
    selectNetCashFlow: () => computeNetCashFlow(state.incomeSource, state.expenses),
    selectBudgetSummary: () => computeBudgetSummary(state.incomeSource, state.expenses),
    selectRiskProfile: () => computeRiskProfile(state.userProfile),

    // Budget categories (API-backed where available with fallback)
    fetchBudgetCategories: async () => {
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
            category_type: c.category_type,
            is_active: !!c.is_active
          }));
          dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_BUDGET_CATEGORIES, payload: mapped });
          return mapped;
        }
      } catch (e) {
        // fall through to comparison
      }
      // Fallback to budget comparison
      try {
        const res = await fetch(`${API_BASE}/api/v1/budget-comparison`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to fetch budget categories');
        const data = await res.json();
        const mapped = (data.budget_comparison || []).map((c, idx) => ({
          id: `bc_${idx}_${c.category}`,
          name: c.category,
          budgeted_amount: c.budgeted,
          actual_amount: c.actual
        }));
        dispatch({ type: UNIFIED_FINANCIAL_ACTIONS.SET_BUDGET_CATEGORIES, payload: mapped });
        return mapped;
      } catch (e) {
        console.warn('Budget categories fetch failed, using local state only:', e.message);
        return state.budgetCategories;
      }
    },
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
    fetchAllFinancialData
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

