/**
 * NEW OnboardingWizard - Built from scratch for bulletproof data flow
 * Features:
 * - Auto-save per step
 * - Progress visualization
 * - Error handling
 * - Resume capability
 * - Phone field included
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOnboarding } from '../../contexts/OnboardingContext';

// Import step components
import PersonalInfoStep from './PersonalInfoStep';
import RiskAssessmentStep from './RiskAssessmentStep';
import FinancialInfoStep from './FinancialInfoStep';
import GoalsStep from './GoalsStep';
import PreferencesStep from './PreferencesStep';
import ProgressBar from './ProgressBar';
import SaveIndicator from './SaveIndicator';

const OnboardingWizard = () => {
  const {
    currentStep,
    isComplete,
    isLoading,
    error,
    saveStatus,
    personalData,
    riskData,
    financialData,
    goalsData,
    preferencesData,
    completedSteps,
    nextStep,
    previousStep,
    canProceedFromStep,
    completeOnboarding,
    saveStep,
    clearError,
    forceSaveAllSteps,
    STEP_NAMES
  } = useOnboarding();
  
  const navigate = useNavigate();
  
  // Handle onboarding completion
  useEffect(() => {
    if (isComplete) {
      // Navigate to dashboard after short delay
      setTimeout(() => {
        navigate('/app/dashboard', { replace: true });
      }, 1500);
    }
  }, [isComplete, navigate]);
  
  // Render current step component
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfoStep />;
      case 2:
        return <RiskAssessmentStep />;
      case 3:
        return <FinancialInfoStep />;
      case 4:
        return <GoalsStep />;
      case 5:
        return <PreferencesStep />;
      default:
        return <PersonalInfoStep />;
    }
  };
  
  // Handle next button click
  const handleNext = async () => {
    // Save current step before proceeding
    let stepData;
    switch (currentStep) {
      case 1:
        stepData = personalData;
        break;
      case 2:
        stepData = riskData;
        break;
      case 3:
        stepData = financialData;
        break;
      case 4:
        stepData = goalsData;
        break;
      case 5:
        stepData = preferencesData;
        break;
    }
    
    if (stepData) {
      const result = await saveStep(currentStep, stepData, false, true); // Save with step update
      if (!result.success) {
        console.error(`Failed to save step ${currentStep}:`, result.error);
        return; // Don't proceed if save failed
      }
    }
    
    if (currentStep < 5) {
      nextStep();
    } else {
      // Complete onboarding
      handleComplete();
    }
  };
  
  // Handle complete onboarding
  const handleComplete = async () => {
    const result = await completeOnboarding();
    if (!result.success) {
      console.error('Failed to complete onboarding:', result.error);
    }
  };
  
  // Handle skip (for optional steps)
  const handleSkip = () => {
    if (currentStep === 4 || currentStep === 5) {
      if (currentStep < 5) {
        nextStep();
      } else {
        handleComplete();
      }
    }
  };
  
  if (isComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Welcome to Your Financial Journey!</h1>
          <p className="text-gray-600 mb-6">Your profile has been created successfully.</p>
          <div className="inline-flex items-center text-blue-600">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Taking you to your dashboard...
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Complete Your Profile</h1>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Completed: [{completedSteps?.join(', ') || 'none'}]
              </div>
              <SaveIndicator stepNumber={currentStep} status={saveStatus[currentStep]} />
            </div>
          </div>
          <ProgressBar />
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-400 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <button
                onClick={clearError}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Step Header */}
          <div className="bg-gray-50 px-8 py-6 border-b">
            <h2 className="text-xl font-semibold text-gray-800">
              Step {currentStep}: {STEP_NAMES[currentStep]}
            </h2>
            <p className="text-gray-600 mt-1">
              Please provide the information below. Your data is automatically saved as you type.
            </p>
          </div>
          
          {/* Step Content */}
          <div className="px-8 py-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Loading...
                </div>
              </div>
            ) : (
              renderCurrentStep()
            )}
          </div>
          
          {/* Navigation */}
          <div className="bg-gray-50 px-8 py-6 border-t flex items-center justify-between">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={previousStep}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Previous
                </button>
              )}
            </div>
            
            <div className="flex space-x-3">
              {/* Debug: Force Save All Steps */}
              <button
                onClick={async () => {
                  console.log('🔧 Debug: Force saving all steps...');
                  console.log('Current step data:');
                  console.log('Step 1 (Personal):', personalData);
                  console.log('Step 2 (Risk):', riskData);
                  console.log('Step 3 (Financial):', financialData);
                  console.log('Step 4 (Goals):', goalsData);
                  console.log('Completed steps:', completedSteps);
                  await forceSaveAllSteps();
                }}
                className="px-3 py-2 text-xs font-medium text-purple-600 bg-purple-100 rounded-md hover:bg-purple-200"
              >
                🔧 Force Save All
              </button>
              
              {/* Debug: Show Data */}
              <button
                onClick={() => {
                  console.log('📊 Current onboarding data:');
                  console.log('Step 1 (Personal):', personalData);
                  console.log('Step 2 (Risk):', riskData);
                  console.log('Step 3 (Financial):', financialData);
                  console.log('Step 4 (Goals):', goalsData);
                  console.log('Completed steps:', completedSteps);
                  console.log('Current step:', currentStep);
                }}
                className="px-3 py-2 text-xs font-medium text-blue-600 bg-blue-100 rounded-md hover:bg-blue-200"
              >
                📊 Show Data
              </button>
              
              {/* Debug: Check Backend State */}
              <button
                onClick={async () => {
                  const jwt = localStorage.getItem('jwt');
                  try {
                    const response = await fetch('http://localhost:8000/api/v1/onboarding/debug', {
                      headers: { 'Authorization': `Bearer ${jwt}` }
                    });
                    const data = await response.json();
                    console.log('🔍 Backend onboarding state:', data);
                  } catch (error) {
                    console.error('Failed to fetch backend state:', error);
                  }
                }}
                className="px-3 py-2 text-xs font-medium text-green-600 bg-green-100 rounded-md hover:bg-green-200"
              >
                🔍 Backend State
              </button>
              
              {/* Skip button for optional steps */}
              {(currentStep === 4 || currentStep === 5) && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Skip for now
                </button>
              )}
              
              {/* Next/Complete button */}
              <button
                onClick={handleNext}
                disabled={!canProceedFromStep(currentStep) || isLoading}
                className={`inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                  canProceedFromStep(currentStep) && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                {currentStep < 5 ? 'Next' : 'Complete Setup'}
                {currentStep < 5 && (
                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWizard;