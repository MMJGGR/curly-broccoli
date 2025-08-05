/**
 * NEW OnboardingContext - Built from scratch for bulletproof data persistence
 * Features:
 * - Auto-save per step
 * - Resume capability 
 * - Real-time validation
 * - Error recovery
 * - Progress tracking
 */
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { API_BASE_URL } from '../config';

const API_BASE = API_BASE_URL;

// Onboarding steps configuration
export const ONBOARDING_STEPS = {
  PERSONAL_INFO: 1,
  RISK_ASSESSMENT: 2,
  FINANCIAL_INFO: 3,
  GOALS: 4,
  PREFERENCES: 5 // Optional
};

export const STEP_NAMES = {
  1: 'Personal Information',
  2: 'Risk Assessment', 
  3: 'Financial Information',
  4: 'Goals Setup',
  5: 'Preferences'
};

// Initial state
const initialState = {
  // Progress tracking
  currentStep: 1,
  completedSteps: [],
  isComplete: false,
  isLoading: false,
  error: null,
  
  // Step data
  personalData: {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    nationalId: '',
    kraPin: '',
    employmentStatus: 'Employed',
    dependents: 0
  },
  riskData: {
    questionnaire: [],
    riskScore: null,
    riskLevel: null
  },
  financialData: {
    monthlyIncome: '',
    incomeFrequency: 'Monthly',
    rent: '',
    utilities: '',
    groceries: '',
    transport: '',
    loanRepayments: '',
    customExpenses: [],
    customIncomes: []
  },
  goalsData: {
    emergencyFund: '',
    homeDownPayment: '',
    education: '',
    retirement: '',
    investment: '',
    other: ''
  },
  preferencesData: {
    notifications: true,
    dataSharing: false,
    marketingEmails: false,
    newsletterSubscription: true
  },
  
  // Auto-save status per step
  saveStatus: {
    1: 'idle', // idle, saving, saved, error
    2: 'idle',
    3: 'idle', 
    4: 'idle',
    5: 'idle'
  }
};

// Reducer
function onboardingReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
      
    case 'SET_COMPLETED_STEPS':
      return { ...state, completedSteps: action.payload };
      
    case 'SET_SAVE_STATUS':
      return {
        ...state,
        saveStatus: {
          ...state.saveStatus,
          [action.stepNumber]: action.status
        }
      };
      
    case 'UPDATE_PERSONAL_DATA':
      return {
        ...state,
        personalData: { ...state.personalData, ...action.payload }
      };
      
    case 'UPDATE_RISK_DATA':
      return {
        ...state,
        riskData: { ...state.riskData, ...action.payload }
      };
      
    case 'UPDATE_FINANCIAL_DATA':
      return {
        ...state,
        financialData: { ...state.financialData, ...action.payload }
      };
      
    case 'UPDATE_GOALS_DATA':
      return {
        ...state,
        goalsData: { ...state.goalsData, ...action.payload }
      };
      
    case 'UPDATE_PREFERENCES_DATA':
      return {
        ...state,
        preferencesData: { ...state.preferencesData, ...action.payload }
      };
      
    case 'LOAD_ONBOARDING_STATE': {
      const { payload } = action;
      return {
        ...state,
        currentStep: payload.current_step,
        completedSteps: payload.completed_steps,
        isComplete: payload.is_complete,
        personalData: payload.personal_data || state.personalData,
        riskData: payload.risk_data || state.riskData,
        financialData: payload.financial_data || state.financialData,
        goalsData: payload.goals_data || state.goalsData,
        preferencesData: payload.preferences_data || state.preferencesData
      };
    }
      
    case 'MARK_COMPLETE':
      return {
        ...state,
        isComplete: true,
        currentStep: 6 // Beyond last step
      };
      
    case 'RESET_ONBOARDING':
      return initialState;
      
    default:
      return state;
  }
}

// Context
const OnboardingContext = createContext();

// Provider component
export function OnboardingProvider({ children }) {
  const [state, dispatch] = useReducer(onboardingReducer, initialState);
  
  // Load existing onboarding state on mount
  useEffect(() => {
    loadOnboardingState();
  }, []);
  
  // Auto-save functionality with improved throttling and connection management
  useEffect(() => {
    let globalAutoSaveTimeout = null;
    let lastAutoSaveTime = 0;
    const MIN_AUTO_SAVE_INTERVAL = 30000; // 30 seconds minimum between auto-saves
    
    // Single global auto-save function to prevent network flooding
    const performGlobalAutoSave = () => {
      const now = Date.now();
      if (now - lastAutoSaveTime < MIN_AUTO_SAVE_INTERVAL) {
        console.log('⏰ Auto-save throttled - too frequent');
        return;
      }
      
      lastAutoSaveTime = now;
      console.log('🔄 Performing global auto-save...');
      
      // Auto-save only steps with meaningful data, but limit to one request at a time
      const autoSaveQueue = [];
      
      if (state.personalData.firstName || state.personalData.lastName) {
        autoSaveQueue.push({ step: 1, data: state.personalData });
      }
      if (state.riskData.questionnaire.length === 5) {
        autoSaveQueue.push({ step: 2, data: state.riskData });
      }
      if (state.financialData.monthlyIncome) {
        autoSaveQueue.push({ step: 3, data: state.financialData });
      }
      if (Object.values(state.goalsData).some(val => val)) {
        autoSaveQueue.push({ step: 4, data: state.goalsData });
      }
      
      // Process queue sequentially to avoid connection flooding
      if (autoSaveQueue.length > 0) {
        processAutoSaveQueue(autoSaveQueue);
      }
    };
    
    // Process auto-save queue sequentially
    const processAutoSaveQueue = async (queue) => {
      for (const item of queue) {
        try {
          await saveStep(item.step, item.data, false, false);
          // Add small delay between saves to prevent connection resets
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.warn(`Auto-save failed for step ${item.step}:`, error.message);
          break; // Stop processing if any save fails
        }
      }
    };
    
    // Set up global auto-save timer
    if (globalAutoSaveTimeout) {
      clearTimeout(globalAutoSaveTimeout);
    }
    
    globalAutoSaveTimeout = setTimeout(performGlobalAutoSave, MIN_AUTO_SAVE_INTERVAL);
    
    return () => {
      if (globalAutoSaveTimeout) {
        clearTimeout(globalAutoSaveTimeout);
      }
    };
  }, [state.personalData, state.riskData, state.financialData, state.goalsData]);
  
  // API Functions
  async function loadOnboardingState() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      
      const fetchUrl = `${API_BASE}/api/v1/onboarding/state`;
      console.log('🌐 About to fetch onboarding state from:', fetchUrl);
      
      const response = await fetch(fetchUrl, {
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        dispatch({ type: 'LOAD_ONBOARDING_STATE', payload: data });
        console.log('✅ Loaded onboarding state:', data);
      } else {
        console.log('No existing onboarding state found, starting fresh');
      }
    } catch (error) {
      console.error('Failed to load onboarding state:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load previous progress' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }
  
  // Enhanced retry function for network requests with connection reset handling
  async function retryRequest(requestFn, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        const isConnectionReset = error.message.includes('ERR_CONNECTION_RESET') || 
                                 error.message.includes('network error') ||
                                 error.message.includes('fetch');
        
        if (isConnectionReset && i < retries - 1) {
          console.warn(`🔄 Connection reset detected, retrying attempt ${i + 1}...`);
          await new Promise(resolve => setTimeout(resolve, delay * (i + 1) * 2)); // Longer backoff for connection issues
          continue;
        }
        
        console.warn(`Request attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) throw error; // Last attempt failed
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1))); // Exponential backoff
      }
    }
  }

  async function saveStep(stepNumber, stepData, showSuccessMessage = false, updateCurrentStep = true) {
    try {
      dispatch({ type: 'SET_SAVE_STATUS', stepNumber, status: 'saving' });
      
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        throw new Error('No authentication token found');
      }
      
      // Validate and format step data before sending
      let validatedStepData = { ...stepData };
      
      if (stepNumber === 2) {
        // Ensure questionnaire has exactly 5 responses
        if (!validatedStepData.questionnaire || validatedStepData.questionnaire.length !== 5) {
          console.warn(`Step 2 validation failed: questionnaire has ${validatedStepData.questionnaire?.length || 0} responses, need 5`);
          throw new Error('Risk assessment questionnaire must have exactly 5 responses');
        }
      } else if (stepNumber === 3) {
        // Ensure monthlyIncome is a valid number
        const monthlyIncome = parseFloat(validatedStepData.monthlyIncome);
        if (!monthlyIncome || monthlyIncome <= 0) {
          console.warn(`Step 3 validation failed: monthlyIncome is ${validatedStepData.monthlyIncome}`);
          throw new Error('Monthly income must be a positive number');
        }
        validatedStepData.monthlyIncome = monthlyIncome;
      }
      
      console.log(`💾 Saving step ${stepNumber} with data:`, validatedStepData);
      
      // Retry the network request up to 3 times
      const result = await retryRequest(async () => {
        const response = await fetch(`${API_BASE}/api/v1/onboarding/save-step`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            step_number: stepNumber,
            step_data: validatedStepData
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || 'Failed to save step');
        }
        
        return await response.json();
      });
      
      // CRITICAL: Ensure state synchronization with backend
      if (updateCurrentStep) {
        dispatch({ type: 'SET_CURRENT_STEP', payload: result.current_step });
      }
      
      // Force state synchronization by ensuring completed_steps is properly updated
      const backendCompletedSteps = result.completed_steps || [];
      dispatch({ type: 'SET_COMPLETED_STEPS', payload: backendCompletedSteps });
      dispatch({ type: 'SET_SAVE_STATUS', stepNumber, status: 'saved' });
      
      console.log(`✅ Step ${stepNumber} saved successfully`);
      console.log(`🔄 State synchronized - completed_steps: ${JSON.stringify(backendCompletedSteps)}`);
      
      if (showSuccessMessage) {
        console.log(`📢 User notification: Step ${stepNumber} saved successfully`);
      }
      
      return { success: true, result };
      
    } catch (error) {
      console.error(`❌ Failed to save step ${stepNumber} after retries:`, error);
      dispatch({ type: 'SET_SAVE_STATUS', stepNumber, status: 'error' });
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    }
  }
  
  async function completeOnboarding() {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        throw new Error('No authentication token found');
      }
      
      console.log('🎯 Attempting to complete onboarding...');
      console.log('Current state:', {
        personalData: state.personalData,
        riskData: state.riskData,
        financialData: state.financialData,
        completedSteps: state.completedSteps
      });
      
      // Force save all steps before completion
      await forceSaveAllSteps();
      
      const response = await fetch(`${API_BASE}/api/v1/onboarding/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${jwt}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ final_review: true })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Onboarding completion failed:', errorData);
        throw new Error(errorData.detail || 'Failed to complete onboarding');
      }
      
      const result = await response.json();
      
      dispatch({ type: 'MARK_COMPLETE' });
      
      // Trigger profile refresh after a short delay to allow navigation
      setTimeout(() => {
        localStorage.setItem('profileRefreshNeeded', 'true');
        window.dispatchEvent(new CustomEvent('onboardingComplete'));
      }, 1000);
      
      console.log('✅ Onboarding completed successfully:', result);
      return { success: true, result };
      
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, error: error.message };
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }
  
  // Helper functions
  const updatePersonalData = useCallback((data) => {
    dispatch({ type: 'UPDATE_PERSONAL_DATA', payload: data });
  }, []);
  
  const updateRiskData = useCallback((data) => {
    dispatch({ type: 'UPDATE_RISK_DATA', payload: data });
  }, []);
  
  const updateFinancialData = useCallback((data) => {
    dispatch({ type: 'UPDATE_FINANCIAL_DATA', payload: data });
  }, []);
  
  const updateGoalsData = useCallback((data) => {
    dispatch({ type: 'UPDATE_GOALS_DATA', payload: data });
  }, []);
  
  const updatePreferencesData = useCallback((data) => {
    dispatch({ type: 'UPDATE_PREFERENCES_DATA', payload: data });
  }, []);
  
  function goToStep(stepNumber) {
    if (stepNumber >= 1 && stepNumber <= 5) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: stepNumber });
    }
  }
  
  function nextStep() {
    if (state.currentStep < 5) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep + 1 });
    }
  }
  
  function previousStep() {
    if (state.currentStep > 1) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: state.currentStep - 1 });
    }
  }
  
  function clearError() {
    dispatch({ type: 'CLEAR_ERROR' });
  }
  
  function resetOnboarding() {
    dispatch({ type: 'RESET_ONBOARDING' });
  }
  
  // Calculate completion percentage
  function getCompletionPercentage() {
    const requiredSteps = [1, 2, 3]; // Personal, Risk, Financial are required
    const completedRequired = state.completedSteps.filter(step => requiredSteps.includes(step));
    return Math.round((completedRequired.length / requiredSteps.length) * 100);
  }
  
  // Check if current step can proceed
  function canProceedFromStep(stepNumber) {
    switch (stepNumber) {
      case 1:
        return state.personalData.firstName && 
               state.personalData.lastName && 
               state.personalData.dateOfBirth &&
               state.personalData.phone;
      case 2:
        return state.riskData.questionnaire.length === 5;
      case 3:
        return state.financialData.monthlyIncome > 0;
      case 4:
        return true; // Goals are optional
      case 5:
        return true; // Preferences are optional
      default:
        return false;
    }
  }
  
  // Force save all required steps before completion with improved sequencing
  async function forceSaveAllSteps() {
    console.log('🔄 Force saving all required steps...');
    
    const results = [];
    let finalCompletedSteps = [...(state.completedSteps || [])];
    
    // Sequential saving with proper error handling and state updates
    const stepsToSave = [
      { step: 1, data: state.personalData, valid: state.personalData.firstName && state.personalData.lastName },
      { step: 2, data: state.riskData, valid: state.riskData.questionnaire?.length === 5 },
      { step: 3, data: state.financialData, valid: !!state.financialData.monthlyIncome },
      { step: 4, data: state.goalsData, valid: Object.values(state.goalsData).some(val => val) }
    ];
    
    for (const { step, data, valid } of stepsToSave) {
      if (valid) {
        console.log(`💾 Force saving Step ${step}...`);
        try {
          const result = await saveStep(step, data, false, true);
          results.push({ step, success: result.success, error: result.error });
          
          if (result.success && result.result?.completed_steps) {
            finalCompletedSteps = [...result.result.completed_steps];
            console.log(`✅ Step ${step} saved, updated completed_steps: ${JSON.stringify(finalCompletedSteps)}`);
          }
          
          // Add delay between saves to prevent connection flooding
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Failed to force save Step ${step}:`, error);
          results.push({ step, success: false, error: error.message });
        }
      } else {
        console.warn(`⚠️ Step ${step} data invalid, skipping`);
        results.push({ step, success: false, error: 'Invalid data' });
      }
    }
    
    console.log('🔄 Force save results:', results);
    console.log('🔄 Final completed steps:', finalCompletedSteps);
    
    // Ensure state is synchronized with the final backend state
    dispatch({ type: 'SET_COMPLETED_STEPS', payload: finalCompletedSteps });
    
    // Verify we have the minimum required steps (1, 2, 3)
    const requiredSteps = [1, 2, 3];
    const missingSteps = requiredSteps.filter(step => !finalCompletedSteps.includes(step));
    
    if (missingSteps.length > 0) {
      throw new Error(`Missing required steps: ${missingSteps.join(', ')}`);
    }
    
    return results;
  }

  const value = {
    // State
    ...state,
    
    // Actions
    updatePersonalData,
    updateRiskData,
    updateFinancialData,
    updateGoalsData,
    updatePreferencesData,
    
    // Navigation
    goToStep,
    nextStep,
    previousStep,
    
    // Progress
    getCompletionPercentage,
    canProceedFromStep,
    
    // API
    saveStep,
    completeOnboarding,
    loadOnboardingState,
    forceSaveAllSteps,
    
    // Utilities
    clearError,
    resetOnboarding,
    
    // Constants
    ONBOARDING_STEPS,
    STEP_NAMES
  };
  
  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook to use the context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export default OnboardingContext;