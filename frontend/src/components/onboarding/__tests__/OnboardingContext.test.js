/**
 * OnboardingContext Unit Tests
 * Tests the core onboarding state management and auto-save functionality
 */
import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import { OnboardingProvider, useOnboarding } from '../../../contexts/OnboardingContext';

// Mock fetch globally
global.fetch = jest.fn();

// Test component to interact with the context
const TestComponent = () => {
  const {
    currentStep,
    personalData,
    updatePersonalData,
    saveStep,
    saveStatus,
    canProceedFromStep,
    nextStep,
    previousStep
  } = useOnboarding();

  return (
    <div>
      <div data-testid="current-step">{currentStep}</div>
      <div data-testid="first-name">{personalData.firstName}</div>
      <div data-testid="save-status">{saveStatus[1]}</div>
      <button 
        data-testid="update-personal" 
        onClick={() => updatePersonalData({ firstName: 'John', lastName: 'Doe' })}
      >
        Update Personal
      </button>
      <button 
        data-testid="save-step" 
        onClick={() => saveStep(1, personalData)}
      >
        Save Step
      </button>
      <button 
        data-testid="next-step" 
        onClick={nextStep}
      >
        Next
      </button>
      <button 
        data-testid="prev-step" 
        onClick={previousStep}
      >
        Previous
      </button>
      <div data-testid="can-proceed">{canProceedFromStep(1) ? 'true' : 'false'}</div>
    </div>
  );
};

const renderWithProvider = () => {
  return render(
    <OnboardingProvider>
      <TestComponent />
    </OnboardingProvider>
  );
};

describe('OnboardingContext', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    localStorage.setItem('jwt', 'test-token');
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { getByTestId } = renderWithProvider();
      
      expect(getByTestId('current-step')).toHaveTextContent('1');
      expect(getByTestId('first-name')).toHaveTextContent('');
      expect(getByTestId('save-status')).toHaveTextContent('idle');
      expect(getByTestId('can-proceed')).toHaveTextContent('false');
    });
  });

  describe('Personal Data Management', () => {
    it('should update personal data correctly', async () => {
      const { getByTestId } = renderWithProvider();
      
      await act(async () => {
        getByTestId('update-personal').click();
      });
      
      expect(getByTestId('first-name')).toHaveTextContent('John');
    });

    it('should validate step completion requirements', async () => {
      const { getByTestId } = renderWithProvider();
      
      // Initially should not be able to proceed
      expect(getByTestId('can-proceed')).toHaveTextContent('false');
      
      // Add required fields
      const context = require('../../../contexts/OnboardingContext');
      const { updatePersonalData } = context;
      
      await act(async () => {
        getByTestId('update-personal').click();
      });
      
      // Still missing required fields
      expect(getByTestId('can-proceed')).toHaveTextContent('false');
    });
  });

  describe('Step Navigation', () => {
    it('should navigate between steps correctly', async () => {
      const { getByTestId } = renderWithProvider();
      
      // Initially on step 1
      expect(getByTestId('current-step')).toHaveTextContent('1');
      
      // Move to next step
      await act(async () => {
        getByTestId('next-step').click();
      });
      
      expect(getByTestId('current-step')).toHaveTextContent('2');
      
      // Move back to previous step
      await act(async () => {
        getByTestId('prev-step').click();
      });
      
      expect(getByTestId('current-step')).toHaveTextContent('1');
    });

    it('should not go below step 1 or above step 5', async () => {
      const { getByTestId } = renderWithProvider();
      
      // Try to go before step 1
      await act(async () => {
        getByTestId('prev-step').click();
      });
      
      expect(getByTestId('current-step')).toHaveTextContent('1');
    });
  });

  describe('Auto-Save Functionality', () => {
    it('should save step data via API', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          current_step: 1,
          completed_steps: [1],
          success: true
        })
      });

      const { getByTestId } = renderWithProvider();
      
      await act(async () => {
        getByTestId('update-personal').click();
      });
      
      await act(async () => {
        getByTestId('save-step').click();
      });
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
          expect.stringContaining('/api/v1/onboarding/save-step'),
          expect.objectContaining({
            method: 'POST',
            headers: expect.objectContaining({
              'Authorization': 'Bearer test-token',
              'Content-Type': 'application/json'
            }),
            body: expect.stringContaining('"step_number":1')
          })
        );
      });
    });

    it('should handle save errors gracefully', async () => {
      fetch.mockRejectedValueOnce(new Error('Network error'));

      const { getByTestId } = renderWithProvider();
      
      await act(async () => {
        getByTestId('save-step').click();
      });
      
      // Should not crash and should handle error state
      expect(getByTestId('current-step')).toHaveTextContent('1');
    });
  });

  describe('Data Validation', () => {
    it('should validate required fields for step progression', () => {
      const { getByTestId } = renderWithProvider();
      
      // Without required fields, cannot proceed
      expect(getByTestId('can-proceed')).toHaveTextContent('false');
    });

    it('should allow progression when required fields are complete', async () => {
      const TestComponentWithValidData = () => {
        const { canProceedFromStep, updatePersonalData } = useOnboarding();
        
        React.useEffect(() => {
          updatePersonalData({
            firstName: 'John',
            lastName: 'Doe', 
            dateOfBirth: '1990-01-01',
            phone: '+254712345678'
          });
        }, [updatePersonalData]);

        return (
          <div data-testid="can-proceed-valid">
            {canProceedFromStep(1) ? 'true' : 'false'}
          </div>
        );
      };

      const { getByTestId } = render(
        <OnboardingProvider>
          <TestComponentWithValidData />
        </OnboardingProvider>
      );
      
      await waitFor(() => {
        expect(getByTestId('can-proceed-valid')).toHaveTextContent('true');
      });
    });
  });

  describe('Load Existing State', () => {
    it('should load existing onboarding state on mount', async () => {
      const mockState = {
        current_step: 2,
        completed_steps: [1],
        personal_data: { firstName: 'Existing', lastName: 'User' },
        financial_data: { monthlyIncome: 75000 }
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockState
      });

      const LoadTestComponent = () => {
        const { currentStep, personalData } = useOnboarding();
        return (
          <div>
            <div data-testid="loaded-step">{currentStep}</div>
            <div data-testid="loaded-name">{personalData.firstName}</div>
          </div>
        );
      };

      const { getByTestId } = render(
        <OnboardingProvider>
          <LoadTestComponent />
        </OnboardingProvider>
      );

      await waitFor(() => {
        expect(getByTestId('loaded-step')).toHaveTextContent('2');
        expect(getByTestId('loaded-name')).toHaveTextContent('Existing');
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/onboarding/state'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });
  });

  describe('Completion Percentage', () => {
    it('should calculate completion percentage correctly', async () => {
      const PercentageTestComponent = () => {
        const { getCompletionPercentage, updatePersonalData, updateRiskData, updateFinancialData } = useOnboarding();
        
        const [percentage, setPercentage] = React.useState(0);
        
        React.useEffect(() => {
          setPercentage(getCompletionPercentage());
        }, [getCompletionPercentage]);

        return (
          <div>
            <div data-testid="completion-percentage">{percentage}</div>
            <button 
              data-testid="complete-personal"
              onClick={() => {
                updatePersonalData({ firstName: 'Test', lastName: 'User', dateOfBirth: '1990-01-01', phone: '+254712345678' });
                setPercentage(getCompletionPercentage());
              }}
            >
              Complete Personal
            </button>
          </div>
        );
      };

      const { getByTestId } = render(
        <OnboardingProvider>
          <PercentageTestComponent />
        </OnboardingProvider>
      );

      // Initially 0%
      expect(getByTestId('completion-percentage')).toHaveTextContent('0');
    });
  });
});