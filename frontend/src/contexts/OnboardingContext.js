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

  // Submit complete onboarding data to backend
  const submitOnboarding = async () => {
    const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
    
    try {
      console.log('Current onboarding state:', state);
      
      const registrationData = {
        email: `user${Date.now()}@example.com`, // Generate unique email
        password: 'defaultPassword123',
        first_name: state.personalDetails.firstName,
        last_name: state.personalDetails.lastName,
        dob: state.personalDetails.dob,
        nationalId: state.personalDetails.nationalId || '12345678',
        kra_pin: state.personalDetails.kraPin,
        annual_income: Number(state.cashFlowData.income) || 50000,
        dependents: Number(state.personalDetails.dependents) || 0,
        goals: {
          targetAmount: Number(state.goals.emergencyFund) || 10000,
          timeHorizon: 12
        },
        questionnaire: state.riskQuestionnaire.length > 0 ? state.riskQuestionnaire.map(q => Number(q)) : [1, 2, 3, 4, 5]
      };

      console.log('Submitting registration data:', registrationData);
      console.log('API_BASE URL:', API_BASE);
      console.log('Full registration URL:', `${API_BASE}/auth/register`);

      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      
      // Store JWT token
      localStorage.setItem('jwt', data.access_token);
      
      completeOnboarding();
      return { success: true, data };
      
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Error stack:', error.stack);
      console.error('Error type:', typeof error);
      console.error('Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      return { success: false, error: error.message || 'Network error occurred' };
    }
  };

  const value = {
    ...state,
    updatePersonalDetails,
    updateRiskQuestionnaire,
    updateCashFlow,
    updateGoals,
    submitOnboarding,
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