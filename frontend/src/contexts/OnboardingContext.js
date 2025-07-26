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
    // Use relative URL to leverage the proxy configuration
    const API_BASE = '';
    
    try {
      console.log('🔍 Starting registration submission...');
      console.log('🔍 Current onboarding state:', JSON.stringify(state, null, 2));
      console.log('🔍 API_BASE:', API_BASE);
      
      const registrationData = {
        email: state.personalDetails?.email || `user${Date.now()}@example.com`,
        password: state.personalDetails?.password || 'defaultPassword123',
        first_name: state.personalDetails?.firstName || 'DefaultFirst',
        last_name: state.personalDetails?.lastName || 'DefaultLast',
        dob: state.personalDetails?.dob || '1990-01-01',
        nationalId: state.personalDetails?.nationalId || '12345678',
        kra_pin: state.personalDetails?.kraPin || 'A123456789Z',
        annual_income: Number(state.cashFlowData?.income) || 50000,
        dependents: Number(state.personalDetails?.dependents) || 0,
        goals: {
          targetAmount: Number(state.goals?.emergencyFund) || 10000,
          timeHorizon: 12
        },
        questionnaire: (state.riskQuestionnaire && state.riskQuestionnaire.length > 0) ? state.riskQuestionnaire.map(q => Number(q)) : [1, 2, 3, 4, 5]
      };

      // Validate registration data before sending
      const requiredFields = ['email', 'password', 'first_name', 'last_name', 'dob', 'kra_pin'];
      const missingFields = requiredFields.filter(field => !registrationData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      console.log('🔍 Submitting registration data:', JSON.stringify(registrationData, null, 2));
      console.log('🔍 API_BASE URL:', API_BASE);
      console.log('🔍 Full registration URL:', `${API_BASE}/auth/register`);

      console.log('🔍 Making fetch request...');
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registrationData),
      });

      console.log('🔍 Response received:', response);
      console.log('🔍 Response status:', response.status);
      console.log('🔍 Response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.log('🔍 Error response data:', errorData);
        throw new Error(errorData.detail || 'Registration failed');
      }

      const data = await response.json();
      console.log('🔍 Success response data:', data);
      
      // Store JWT token
      localStorage.setItem('jwt', data.access_token);
      
      completeOnboarding();
      return { success: true, data };
      
    } catch (error) {
      console.error('🔍 Registration error:', error);
      console.error('🔍 Error stack:', error.stack);
      console.error('🔍 Error type:', typeof error);
      console.error('🔍 Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
      
      // Handle different error types
      let errorMessage = 'Network error occurred';
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      console.error('🔍 Returning error result:', { success: false, error: errorMessage });
      return { success: false, error: errorMessage };
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