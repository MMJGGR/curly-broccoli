/**
 * Budget Context - Clean state management for Budget & Cashflows
 * Following the successful TimelineContext pattern for consistency
 */
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { API_BASE_URL } from '../config';

const BudgetContext = createContext();

// Budget state reducer
const budgetReducer = (state, action) => {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true, error: null };
    case 'LOAD_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        budgetData: action.payload,
        lastUpdated: new Date().toISOString()
      };
    case 'LOAD_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgetData: { ...state.budgetData, ...action.payload },
        hasUnsavedChanges: true
      };
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        budgetData: {
          ...state.budgetData,
          [action.payload.category]: {
            ...state.budgetData[action.payload.category],
            [action.payload.key]: action.payload.value
          }
        },
        hasUnsavedChanges: true
      };
    case 'SAVE_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null,
        hasUnsavedChanges: false,
        lastUpdated: new Date().toISOString()
      };
    case 'SAVE_ERROR':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'SET_EDITING':
      return {
        ...state,
        isEditing: action.payload
      };
    case 'SET_PERIOD':
      return {
        ...state,
        budgetPeriod: action.payload
      };
    case 'RESET_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Get empty initial state - will be populated from user's actual data
const getEmptyBudgetData = () => ({
  monthlyIncome: 0,
  expenses: {
    // Fixed expenses
    rent: 0,
    utilities: 0,
    loanRepayments: 0,
    blackTax: 0,
    insurance: 0,
    // Variable expenses
    groceries: 0,
    transport: 0,
    dining: 0,
    entertainment: 0,
    clothing: 0,
    healthcare: 0,
    personalCare: 0,
    miscellaneous: 0
  },
  goalAllocations: {
    emergencyFund: 0,
    retirement: 0,
    education: 0,
    investments: 0
  }
});

const initialState = {
  loading: false,
  error: null,
  isEditing: false,
  hasUnsavedChanges: false,
  budgetPeriod: 'monthly',
  lastUpdated: null,
  budgetData: getEmptyBudgetData()
};

export const BudgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(budgetReducer, initialState);

  // Get auth token from localStorage
  const getAuthToken = useCallback(() => {
    return localStorage.getItem('jwt');
  }, []);

  // Load budget data from API or create from user's actual onboarding/profile data
  const loadBudgetData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      // Use empty data if no token
      dispatch({
        type: 'LOAD_SUCCESS',
        payload: getEmptyBudgetData()
      });
      return;
    }

    dispatch({ type: 'LOADING' });

    try {
      // First try to get existing budget
      let response = await fetch(`${API_BASE_URL}/api/v1/budget/current`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const budgetData = await response.json();
        dispatch({
          type: 'LOAD_SUCCESS',
          payload: budgetData
        });
        return;
      }

      // If no budget exists, create from user's profile/onboarding data
      console.log('📊 No existing budget found, creating from user profile data...');
      
      // Get user profile data (use compatibility endpoint for onboarding data)
      const profileResponse = await fetch(`${API_BASE_URL}/api/v1/onboarding/profile-compatibility`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let userBudgetData = getEmptyBudgetData();
      
      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        console.log('👤 Profile data for budget:', profileData);
        
        // Use profile data if available (prioritize monthly_income over calculated annual)
        if (profileData.profile) {
          const profile = profileData.profile;
          userBudgetData.monthlyIncome = profile.monthly_income || 
                                       (profile.annual_income ? profile.annual_income / 12 : 0);
          
          // Use actual expense data if available
          if (profile.monthly_expenses) {
            const monthlyExpenses = profile.monthly_expenses;
            // Distribute total expenses across categories (rough estimation)
            userBudgetData.expenses.rent = monthlyExpenses * 0.3;  // 30% for housing
            userBudgetData.expenses.groceries = monthlyExpenses * 0.2;  // 20% for food
            userBudgetData.expenses.transport = monthlyExpenses * 0.15; // 15% for transport
            userBudgetData.expenses.utilities = monthlyExpenses * 0.1;  // 10% for utilities
            userBudgetData.expenses.miscellaneous = monthlyExpenses * 0.25; // 25% other
            if (profile.monthly_debt_payments) {
              userBudgetData.expenses.loanRepayments = profile.monthly_debt_payments;
            }
          }
        }
      }

      // If still no income data, try onboarding data
      if (userBudgetData.monthlyIncome === 0) {
        console.log('🔄 Trying onboarding data for budget...');
        const onboardingResponse = await fetch(`${API_BASE_URL}/api/v1/onboarding/state`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (onboardingResponse.ok) {
          const onboardingData = await onboardingResponse.json();
          console.log('📋 Onboarding data for budget:', onboardingData);
          
          if (onboardingData.financial_data) {
            const financial = onboardingData.financial_data;
            userBudgetData.monthlyIncome = parseFloat(financial.monthlyIncome) || 0;
            
            // Map onboarding expenses to budget structure
            userBudgetData.expenses = {
              rent: parseFloat(financial.rent) || 0,
              utilities: parseFloat(financial.utilities) || 0,
              groceries: parseFloat(financial.groceries) || 0,
              transport: parseFloat(financial.transport) || 0,
              loanRepayments: parseFloat(financial.loanRepayments) || 0,
              blackTax: 0, // Not collected in onboarding
              insurance: 0, // Not collected in onboarding
              dining: 0,
              entertainment: 0,
              clothing: 0,
              healthcare: 0,
              personalCare: 0,
              miscellaneous: 0
            };

            // Add custom expenses from onboarding
            if (financial.customExpenses && Array.isArray(financial.customExpenses)) {
              financial.customExpenses.forEach(expense => {
                userBudgetData.expenses.miscellaneous += parseFloat(expense.amount) || 0;
              });
            }
          }
        }
      }

      console.log('✅ Created budget from user data:', userBudgetData);
      
      dispatch({
        type: 'LOAD_SUCCESS',
        payload: userBudgetData
      });

    } catch (error) {
      console.error('Budget loading failed:', error);
      dispatch({
        type: 'LOAD_ERROR',
        payload: error.message
      });
      
      // Fallback to empty data on error
      setTimeout(() => {
        dispatch({
          type: 'LOAD_SUCCESS',
          payload: getEmptyBudgetData()
        });
        dispatch({
          type: 'SAVE_ERROR',
          payload: 'Could not load budget data. Create your budget manually.'
        });
      }, 1000);
    }
  }, [getAuthToken]);

  // Save budget data to API
  const saveBudgetData = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      dispatch({
        type: 'SAVE_ERROR',
        payload: 'Authentication required to save budget'
      });
      return false;
    }

    if (!state.hasUnsavedChanges) {
      return true; // Nothing to save
    }

    dispatch({ type: 'LOADING' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/budget/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...state.budgetData,
          lastUpdated: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to save budget: ${response.status}`);
      }

      await response.json();
      dispatch({ type: 'SAVE_SUCCESS' });
      return true;

    } catch (error) {
      console.error('Budget save failed:', error);
      dispatch({
        type: 'SAVE_ERROR',
        payload: error.message
      });
      return false;
    }
  }, [getAuthToken, state.budgetData, state.hasUnsavedChanges]);

  // Update entire budget data
  const updateBudget = useCallback((updates) => {
    dispatch({
      type: 'UPDATE_BUDGET',
      payload: updates
    });
  }, []);

  // Update specific budget category and item
  const updateBudgetItem = useCallback((category, key, value) => {
    const numericValue = parseFloat(value) || 0;
    
    if (category === 'monthlyIncome') {
      dispatch({
        type: 'UPDATE_BUDGET',
        payload: { monthlyIncome: numericValue }
      });
    } else {
      dispatch({
        type: 'UPDATE_CATEGORY',
        payload: { category, key, value: numericValue }
      });
    }
  }, []);

  // Set editing mode
  const setEditingMode = useCallback((editing) => {
    dispatch({
      type: 'SET_EDITING',
      payload: editing
    });
  }, []);

  // Set budget period (monthly/annual)
  const setBudgetPeriod = useCallback((period) => {
    dispatch({
      type: 'SET_PERIOD',
      payload: period
    });
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'RESET_ERROR' });
  }, []);

  // Auto-save when leaving edit mode
  const handleSaveAndExit = useCallback(async () => {
    const saved = await saveBudgetData();
    if (saved) {
      setEditingMode(false);
    }
    return saved;
  }, [saveBudgetData, setEditingMode]);

  // Initialize budget data on mount
  useEffect(() => {
    loadBudgetData();
  }, [loadBudgetData]);

  // Computed values
  const computedValues = React.useMemo(() => {
    if (!state.budgetData) {
      return {
        totalExpenses: 0,
        totalGoalAllocations: 0,
        actualSurplus: 0,
        budgetHealth: 'unknown',
        expensesByCategory: {}
      };
    }

    const totalExpenses = Object.values(state.budgetData.expenses || {})
      .reduce((sum, amount) => sum + (amount || 0), 0);

    const totalGoalAllocations = Object.values(state.budgetData.goalAllocations || {})
      .reduce((sum, amount) => sum + (amount || 0), 0);

    const actualSurplus = (state.budgetData.monthlyIncome || 0) - totalExpenses - totalGoalAllocations;

    const budgetHealth = actualSurplus >= 0 ? 'healthy' : 'deficit';

    // Group expenses by type for analysis
    const fixedExpenses = ['rent', 'utilities', 'loanRepayments', 'blackTax', 'insurance'];
    const variableExpenses = ['groceries', 'transport', 'dining', 'entertainment', 'clothing', 'healthcare', 'personalCare', 'miscellaneous'];

    const expensesByCategory = {
      fixed: fixedExpenses.reduce((sum, key) => sum + (state.budgetData.expenses[key] || 0), 0),
      variable: variableExpenses.reduce((sum, key) => sum + (state.budgetData.expenses[key] || 0), 0)
    };

    return {
      totalExpenses,
      totalGoalAllocations,
      actualSurplus,
      budgetHealth,
      expensesByCategory
    };
  }, [state.budgetData]);

  // Context value
  const value = {
    // State
    ...state,
    
    // Computed values
    ...computedValues,
    
    // Actions
    loadBudgetData,
    saveBudgetData,
    updateBudget,
    updateBudgetItem,
    setEditingMode,
    setBudgetPeriod,
    clearError,
    handleSaveAndExit,
    
    // Helper methods
    getMonthlyAmount: (amount) => state.budgetPeriod === 'annual' ? amount * 12 : amount,
    formatAmount: (amount) => `KES ${(state.budgetPeriod === 'annual' ? amount * 12 : amount).toLocaleString()}`,
    
    // Status flags
    isBudgetReady: !state.loading && state.budgetData && !state.error,
    needsSaving: state.hasUnsavedChanges
  };

  return (
    <BudgetContext.Provider value={value}>
      {children}
    </BudgetContext.Provider>
  );
};

// Hook to use Budget context
export const useBudget = () => {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error('useBudget must be used within BudgetProvider');
  }
  return context;
};

export default BudgetContext;