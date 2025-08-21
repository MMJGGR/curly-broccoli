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

      // If no budget exists, create from user's onboarding data (most accurate)
      console.log('📊 No existing budget found, creating from user data...');
      
      let userBudgetData = getEmptyBudgetData();
      let dataSource = 'none';

      // First priority: Try onboarding data (most detailed and accurate)
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
          
          // Map onboarding expenses to budget structure (actual categories)
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
          
          dataSource = 'onboarding';
          console.log('✅ Using detailed onboarding expense data');
        }
      }

      // Second priority: Try profile data (fallback if no onboarding data)
      if (dataSource === 'none') {
        console.log('🔄 Trying profile data for budget...');
        const profileResponse = await fetch(`${API_BASE_URL}/api/v1/onboarding/profile-compatibility`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
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
            
            dataSource = 'profile';
            console.log('⚠️ Using estimated profile expense distribution');
          }
        }
      }

      console.log(`✅ Created budget from ${dataSource} data:`, userBudgetData);
      
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

  // DYNAMIC Computed values - handles unlimited custom categories
  const computedValues = React.useMemo(() => {
    if (!state.budgetData) {
      return {
        totalExpenses: 0,
        totalGoalAllocations: 0,
        totalIncome: 0,
        actualSurplus: 0,
        budgetHealth: 'unknown',
        expensesByCategory: {},
        dynamicCategoryCount: 0,
        customCategoryCount: 0
      };
    }

    // Calculate total expenses from all expense categories (standard + custom)
    const totalExpenses = Object.values(state.budgetData.expenses || {})
      .reduce((sum, amount) => sum + (amount || 0), 0);

    // Calculate total goal allocations
    const totalGoalAllocations = Object.values(state.budgetData.goalAllocations || {})
      .reduce((sum, amount) => sum + (amount || 0), 0);

    // Calculate total income (primary + custom income sources)
    let totalIncome = state.budgetData.monthlyIncome || 0;
    if (state.budgetData.income) {
      totalIncome += Object.values(state.budgetData.income || {})
        .reduce((sum, amount) => sum + (amount || 0), 0);
    }

    // REAL-TIME SURPLUS CALCULATION
    const actualSurplus = totalIncome - totalExpenses - totalGoalAllocations;

    const budgetHealth = actualSurplus >= 0 ? 'healthy' : 'deficit';

    // DYNAMIC expense categorization - no hardcoded lists!
    const standardFixed = ['rent', 'utilities', 'loanRepayments', 'blackTax', 'insurance'];
    const standardVariable = ['groceries', 'transport', 'dining', 'entertainment', 'clothing', 'healthcare', 'personalCare', 'miscellaneous'];
    
    // Separate standard vs custom expenses
    const expensesByCategory = {
      fixed: 0,
      variable: 0,
      custom: 0
    };
    
    if (state.budgetData.expenses) {
      Object.entries(state.budgetData.expenses).forEach(([key, amount]) => {
        const value = amount || 0;
        if (standardFixed.includes(key)) {
          expensesByCategory.fixed += value;
        } else if (standardVariable.includes(key)) {
          expensesByCategory.variable += value;
        } else {
          expensesByCategory.custom += value;
        }
      });
    }

    // Count dynamic categories
    const dynamicCategoryCount = Object.keys(state.budgetData.expenses || {}).length +
                                Object.keys(state.budgetData.goalAllocations || {}).length +
                                Object.keys(state.budgetData.income || {}).length;
    
    const customCategoryCount = Object.keys(state.budgetData.customCategories || {}).length;

    return {
      totalExpenses,
      totalGoalAllocations,
      totalIncome,
      actualSurplus,
      budgetHealth,
      expensesByCategory,
      dynamicCategoryCount,
      customCategoryCount
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
    
    // Helper methods with enhanced functionality
    getMonthlyAmount: (amount) => state.budgetPeriod === 'annual' ? amount * 12 : amount,
    formatAmount: (amount) => {
      const displayAmount = state.budgetPeriod === 'annual' ? amount * 12 : amount;
      return `KES ${Math.round(displayAmount).toLocaleString()}`;
    },
    
    // DYNAMIC CATEGORY HELPERS
    refreshBudgetData: loadBudgetData,
    getCategoryType: (categoryKey) => {
      if (!state.budgetData?.customCategories) return 'standard';
      const customCat = state.budgetData.customCategories[categoryKey];
      return customCat ? 'custom' : 'standard';
    },
    getCategoryMetadata: (categoryKey) => {
      if (!state.budgetData?.customCategories) return null;
      return state.budgetData.customCategories[categoryKey] || null;
    },
    getCustomCategoriesList: () => {
      if (!state.budgetData?.customCategories) return [];
      return Object.entries(state.budgetData.customCategories).map(([key, data]) => ({
        key,
        ...data
      }));
    },
    
    // Status flags with enhanced budget readiness
    isBudgetReady: !state.loading && state.budgetData && !state.error,
    needsSaving: state.hasUnsavedChanges,
    hasDynamicCategories: (state.budgetData?.customCategories && Object.keys(state.budgetData.customCategories).length > 0),
    budgetDataFreshness: state.lastUpdated ? new Date(state.lastUpdated) : null,
    
    // Real-time calculation status
    isCalculationLive: !state.loading && !state.error,
    calculationTimestamp: new Date().toISOString()
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