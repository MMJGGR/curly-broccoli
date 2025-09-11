// Placeholder OnboardingContext - Original was removed during unified context migration
// This maintains compatibility with existing onboarding wizard components
import React, { createContext, useContext } from 'react';

const OnboardingContext = createContext();

export const OnboardingProvider = ({ children }) => {
  // Provide all properties expected by OnboardingWizard to prevent runtime errors
  const contextValue = {
    currentStep: 1,
    isComplete: false,
    isLoading: false,
    error: null,
    saveStatus: {},
    personalData: {},
    riskData: {},
    financialData: {},
    goalsData: {},
    employmentData: {},
    completedSteps: [],
    nextStep: () => {},
    previousStep: () => {},
    canProceedFromStep: () => false,
    completeOnboarding: () => Promise.resolve({ success: false }),
    saveStep: () => Promise.resolve({ success: false }),
    clearError: () => {},
    forceSaveAllSteps: () => Promise.resolve(),
    STEP_NAMES: {
      1: 'Personal Information',
      2: 'Risk Assessment', 
      3: 'Financial Information',
      4: 'Goals',
      5: 'Employment Profile'
    }
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    console.warn('useOnboarding must be used within OnboardingProvider - using placeholder context');
    return {};
  }
  return context;
};

export default OnboardingContext;