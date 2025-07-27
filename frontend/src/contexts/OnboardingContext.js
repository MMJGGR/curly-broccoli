import React, { createContext, useContext, useReducer } from 'react';

const OnboardingContext = createContext();

const initialState = {
  personalDetails: {},
  riskQuestionnaire: [],
  cashFlowData: {},
  goals: {},
  isComplete: false
};

function onboardingReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_PERSONAL_DETAILS':
      return {
        ...state,
        personalDetails: { ...state.personalDetails, ...action.payload }
      };
    case 'UPDATE_RISK_QUESTIONNAIRE':
      return {
        ...state,
        riskQuestionnaire: action.payload
      };
    case 'UPDATE_CASH_FLOW':
      return {
        ...state,
        cashFlowData: { ...state.cashFlowData, ...action.payload }
      };
    case 'UPDATE_GOALS':
      return {
        ...state,
        goals: { ...state.goals, ...action.payload }
      };
    case 'COMPLETE_ONBOARDING':
      return {
        ...state,
        isComplete: true
      };
    case 'RESET_ONBOARDING':
      return initialState;
    default:
      return state;
  }
}

export function OnboardingProvider({ children }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);

  const updatePersonalDetails = (data) => {
    dispatch({ type: 'UPDATE_PERSONAL_DETAILS', payload: data });
  };

  const updateRiskQuestionnaire = (answers) => {
    dispatch({ type: 'UPDATE_RISK_QUESTIONNAIRE', payload: answers });
  };

  const updateCashFlow = (data) => {
    dispatch({ type: 'UPDATE_CASH_FLOW', payload: data });
  };

  const updateGoals = (data) => {
    dispatch({ type: 'UPDATE_GOALS', payload: data });
  };

  const completeOnboarding = () => {
    dispatch({ type: 'COMPLETE_ONBOARDING' });
  };

  const resetOnboarding = () => {
    dispatch({ type: 'RESET_ONBOARDING' });
  };

  // Update existing user profile with onboarding data
  const updateProfile = async () => {
    const API_BASE = '';
    
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        throw new Error('Please login first');
      }

      const profileUpdateData = {
        first_name: state.personalDetails?.firstName,
        last_name: state.personalDetails?.lastName,
        date_of_birth: state.personalDetails?.dob,
        nationalId: state.personalDetails?.nationalId,
        kra_pin: state.personalDetails?.kraPin,
        annual_income: Number(state.cashFlowData?.monthlyIncome) * 12 || 600000, // Convert monthly to annual
        dependents: Number(state.personalDetails?.dependents) || 0,
        goals: {
          targetAmount: Number(state.goals?.emergencyFund) || 10000,
          timeHorizon: 12
        },
        questionnaire: (state.riskQuestionnaire && state.riskQuestionnaire.length > 0) ? state.riskQuestionnaire.map(q => Number(q)) : [1, 2, 3, 4, 5]
      };

      // Remove undefined/null fields
      Object.keys(profileUpdateData).forEach(key => {
        if (profileUpdateData[key] === undefined || profileUpdateData[key] === null || profileUpdateData[key] === '') {
          delete profileUpdateData[key];
        }
      });

      console.log('Updating profile with data:', profileUpdateData);

      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(profileUpdateData),
      });

      if (!response.ok) {
        let errorMessage = 'Profile update failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || `Server error: ${response.status}`;
        } catch (e) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Profile updated successfully:', data);
      
      completeOnboarding();
      return { success: true, data };
      
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    }
  };

  const value = {
    ...state,
    updatePersonalDetails,
    updateRiskQuestionnaire,
    updateCashFlow,
    updateGoals,
    updateProfile,
    resetOnboarding
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}