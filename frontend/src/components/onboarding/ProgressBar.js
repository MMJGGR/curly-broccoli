/**
 * ProgressBar - Shows onboarding progress
 */
import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const ProgressBar = () => {
  const { currentStep, completedSteps, STEP_NAMES } = useOnboarding();
  
  const steps = [1, 2, 3, 4, 5];
  
  const getStepStatus = (stepNumber) => {
    if (completedSteps.includes(stepNumber)) return 'completed';
    if (stepNumber === currentStep) return 'current';
    return 'pending';
  };
  
  return (
    <div className="w-full" data-testid="progress-bar">
      {/* Progress bar */}
      <div className="flex items-center justify-between mb-4 overflow-x-auto">
        {steps.map((step, index) => {
          const status = getStepStatus(step);
          return (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center min-w-0 flex-shrink-0">
                <div
                  className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-medium ${
                    status === 'completed'
                      ? 'bg-green-500 text-white'
                      : status === 'current'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                  aria-label={`Step ${step}: ${STEP_NAMES[step]} - ${status}`}
                >
                  {status === 'completed' ? (
                    <svg className="w-3 h-3 md:w-4 md:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                <p className={`text-xs mt-1 text-center max-w-[60px] md:max-w-none truncate md:whitespace-normal ${
                  status === 'current' ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  <span className="hidden md:inline">{STEP_NAMES[step]}</span>
                  <span className="md:hidden">
                    {STEP_NAMES[step].split(' ')[0]}
                  </span>
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    completedSteps.includes(step) ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
      
      {/* Progress percentage */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          Step {currentStep} of 5 • {Math.round((completedSteps.length / 5) * 100)}% complete
        </p>
      </div>
    </div>
  );
};

export default ProgressBar;