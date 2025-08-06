/**
 * ProgressBar Unit Tests
 * Tests the onboarding progress visualization component
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../ProgressBar';

// Mock the context
const mockContext = {
  currentStep: 2,
  completedSteps: [1],
  STEP_NAMES: {
    1: 'Personal Info',
    2: 'Risk Assessment',
    3: 'Financial Info',
    4: 'Goals',
    5: 'Review'
  }
};

jest.mock('../../../contexts/OnboardingContext', () => ({
  useOnboarding: () => mockContext
}));

describe('ProgressBar', () => {
  describe('Component Rendering', () => {
    it('should render progress bar with test id', () => {
      render(<ProgressBar />);
      
      expect(screen.getByTestId('progress-bar')).toBeInTheDocument();
    });

    it('should render all 5 steps', () => {
      render(<ProgressBar />);
      
      expect(screen.getByText('Personal Info')).toBeInTheDocument();
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
      expect(screen.getByText('Financial Info')).toBeInTheDocument();
      expect(screen.getByText('Goals')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
    });

    it('should show step numbers for non-completed steps', () => {
      render(<ProgressBar />);
      
      // Step 2 (current) should show number
      expect(screen.getByText('2')).toBeInTheDocument();
      // Steps 3, 4, 5 (pending) should show numbers
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('4')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should show checkmark for completed steps', () => {
      render(<ProgressBar />);
      
      const checkmarks = screen.getAllByRole('img', { hidden: true }); // SVG checkmarks
      expect(checkmarks.length).toBeGreaterThan(0);
    });
  });

  describe('Step Status Visualization', () => {
    it('should apply correct styles for completed steps', () => {
      render(<ProgressBar />);
      
      // Step 1 should be completed (green background)
      const step1Circle = screen.getByLabelText(/step 1.*completed/i);
      expect(step1Circle).toHaveClass('bg-green-500');
    });

    it('should apply correct styles for current step', () => {
      render(<ProgressBar />);
      
      // Step 2 should be current (blue background)
      const step2Circle = screen.getByLabelText(/step 2.*current/i);
      expect(step2Circle).toHaveClass('bg-blue-500');
    });

    it('should apply correct styles for pending steps', () => {
      render(<ProgressBar />);
      
      // Step 3 should be pending (gray background)
      const step3Circle = screen.getByLabelText(/step 3.*pending/i);
      expect(step3Circle).toHaveClass('bg-gray-200');
    });

    it('should highlight current step text', () => {
      render(<ProgressBar />);
      
      const riskAssessmentText = screen.getByText('Risk Assessment');
      expect(riskAssessmentText).toHaveClass('text-blue-600', 'font-medium');
    });
  });

  describe('Progress Line Visualization', () => {
    it('should show completed progress lines for finished steps', () => {
      render(<ProgressBar />);
      
      // There should be progress lines between steps
      const progressLines = screen.getByTestId('progress-bar').querySelectorAll('.bg-green-500');
      expect(progressLines.length).toBeGreaterThan(0);
    });

    it('should show gray lines for incomplete steps', () => {
      render(<ProgressBar />);
      
      const grayLines = screen.getByTestId('progress-bar').querySelectorAll('.bg-gray-200');
      expect(grayLines.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('should show mobile-responsive elements', () => {
      render(<ProgressBar />);
      
      // Should have mobile-specific classes
      const circles = screen.getByTestId('progress-bar').querySelectorAll('.w-6.h-6');
      expect(circles.length).toBeGreaterThan(0);
      
      // Should have desktop-specific classes
      const desktopCircles = screen.getByTestId('progress-bar').querySelectorAll('.md\\:w-8.md\\:h-8');
      expect(desktopCircles.length).toBeGreaterThan(0);
    });

    it('should show truncated text on mobile', () => {
      render(<ProgressBar />);
      
      // Desktop text should be hidden on mobile
      const hiddenOnMobile = screen.getByTestId('progress-bar').querySelectorAll('.hidden.md\\:inline');
      expect(hiddenOnMobile.length).toBeGreaterThan(0);
      
      // Mobile text should be shown only on mobile
      const mobileOnly = screen.getByTestId('progress-bar').querySelectorAll('.md\\:hidden');
      expect(mobileOnly.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels for each step', () => {
      render(<ProgressBar />);
      
      expect(screen.getByLabelText(/step 1.*personal info.*completed/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/step 2.*risk assessment.*current/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/step 3.*financial info.*pending/i)).toBeInTheDocument();
    });

    it('should provide step status information for screen readers', () => {
      render(<ProgressBar />);
      
      const step1Label = screen.getByLabelText(/step 1.*completed/i);
      const step2Label = screen.getByLabelText(/step 2.*current/i);
      const step3Label = screen.getByLabelText(/step 3.*pending/i);
      
      expect(step1Label).toBeInTheDocument();
      expect(step2Label).toBeInTheDocument();
      expect(step3Label).toBeInTheDocument();
    });
  });

  describe('Progress Percentage Display', () => {
    it('should show current step information', () => {
      render(<ProgressBar />);
      
      expect(screen.getByText(/step 2 of 5/i)).toBeInTheDocument();
    });

    it('should calculate completion percentage correctly', () => {
      render(<ProgressBar />);
      
      // With 1 completed step out of 5, should show 20%
      expect(screen.getByText(/20% complete/i)).toBeInTheDocument();
    });
  });

  describe('Different Step States', () => {
    it('should handle no completed steps', () => {
      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        currentStep: 1,
        completedSteps: [],
        STEP_NAMES: mockContext.STEP_NAMES
      });
      
      render(<ProgressBar />);
      
      expect(screen.getByText(/0% complete/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/step 1.*current/i)).toBeInTheDocument();
    });

    it('should handle multiple completed steps', () => {
      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        currentStep: 4,
        completedSteps: [1, 2, 3],
        STEP_NAMES: mockContext.STEP_NAMES
      });
      
      render(<ProgressBar />);
      
      expect(screen.getByText(/60% complete/i)).toBeInTheDocument();
      expect(screen.getByText(/step 4 of 5/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/step 4.*current/i)).toBeInTheDocument();
    });

    it('should handle all steps completed', () => {
      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        currentStep: 5,
        completedSteps: [1, 2, 3, 4, 5],
        STEP_NAMES: mockContext.STEP_NAMES
      });
      
      render(<ProgressBar />);
      
      expect(screen.getByText(/100% complete/i)).toBeInTheDocument();
      expect(screen.getByText(/step 5 of 5/i)).toBeInTheDocument();
    });
  });

  describe('Visual Design Elements', () => {
    it('should use proper color scheme for status indication', () => {
      render(<ProgressBar />);
      
      // Completed: green
      expect(screen.getByLabelText(/step 1.*completed/i)).toHaveClass('bg-green-500');
      
      // Current: blue
      expect(screen.getByLabelText(/step 2.*current/i)).toHaveClass('bg-blue-500');
      
      // Pending: gray
      expect(screen.getByLabelText(/step 3.*pending/i)).toHaveClass('bg-gray-200');
    });

    it('should have proper spacing and layout classes', () => {
      render(<ProgressBar />);
      
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toHaveClass('w-full');
      
      // Should have flex layout for steps
      const stepContainer = progressBar.querySelector('.flex.items-center.justify-between');
      expect(stepContainer).toBeInTheDocument();
    });
  });

  describe('Step Names Display', () => {
    it('should truncate step names appropriately on mobile', () => {
      render(<ProgressBar />);
      
      // Personal Info should show as "Personal" on mobile
      const personalText = screen.getByText('Personal');
      expect(personalText).toHaveClass('md:hidden');
      
      // Full text should be shown on desktop
      const fullPersonalText = screen.getByText('Personal Info');
      expect(fullPersonalText).toHaveClass('hidden', 'md:inline');
    });

    it('should handle step names with multiple words', () => {
      render(<ProgressBar />);
      
      // "Risk Assessment" should show as "Risk" on mobile
      expect(screen.getByText('Risk Assessment')).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('should render progress bar and percentage in separate sections', () => {
      render(<ProgressBar />);
      
      const progressBar = screen.getByTestId('progress-bar');
      
      // Should have step indicators section
      const stepIndicators = progressBar.querySelector('.flex.items-center.justify-between');
      expect(stepIndicators).toBeInTheDocument();
      
      // Should have percentage section
      const percentageSection = progressBar.querySelector('.text-center');
      expect(percentageSection).toBeInTheDocument();
    });

    it('should handle horizontal scrolling on mobile', () => {
      render(<ProgressBar />);
      
      const stepContainer = screen.getByTestId('progress-bar').querySelector('.overflow-x-auto');
      expect(stepContainer).toBeInTheDocument();
    });
  });
});