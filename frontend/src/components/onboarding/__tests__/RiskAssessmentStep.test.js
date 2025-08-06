/**
 * RiskAssessmentStep Unit Tests
 * Tests the risk questionnaire and score calculation functionality
 */
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RiskAssessmentStep from '../RiskAssessmentStep';
import { calculateRiskScore, getRiskLevel } from '../../../utils/riskCalculation';

// Mock the context
const mockUpdateRiskData = jest.fn();
const mockSaveStep = jest.fn();

jest.mock('../../../contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    riskData: {
      questionnaire: [],
      riskScore: null,
      riskLevel: null
    },
    updateRiskData: mockUpdateRiskData,
    saveStep: mockSaveStep,
    saveStatus: { 2: 'idle' }
  })
}));

describe('RiskAssessmentStep', () => {
  beforeEach(() => {
    mockUpdateRiskData.mockClear();
    mockSaveStep.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render the risk assessment header and instructions', () => {
      render(<RiskAssessmentStep />);
      
      expect(screen.getByText(/risk assessment/i)).toBeInTheDocument();
      expect(screen.getByText(/help us understand your investment preferences/i)).toBeInTheDocument();
      expect(screen.getByText(/0\/5 questions completed/i)).toBeInTheDocument();
    });

    it('should render all 5 risk assessment questions', () => {
      render(<RiskAssessmentStep />);
      
      expect(screen.getByText(/what is your primary investment objective/i)).toBeInTheDocument();
      expect(screen.getByText(/what is your investment time horizon/i)).toBeInTheDocument();
      expect(screen.getByText(/how would you react to a 20% drop/i)).toBeInTheDocument();
      expect(screen.getByText(/which best describes your knowledge/i)).toBeInTheDocument();
      expect(screen.getByText(/how much of your income are you willing to risk/i)).toBeInTheDocument();
    });

    it('should render all answer options for each question', () => {
      render(<RiskAssessmentStep />);
      
      // Test first question options
      expect(screen.getByLabelText(/capital preservation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/income generation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/capital appreciation/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/speculation/i)).toBeInTheDocument();
    });
  });

  describe('Question Interaction', () => {
    it('should allow selecting answers for questions', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      const firstQuestionFirstOption = screen.getByLabelText(/capital preservation/i);
      await user.click(firstQuestionFirstOption);
      
      expect(firstQuestionFirstOption).toBeChecked();
    });

    it('should update progress as questions are answered', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      // Answer first question
      const firstOption = screen.getByLabelText(/capital preservation/i);
      await user.click(firstOption);
      
      await waitFor(() => {
        expect(screen.getByText(/1\/5 questions completed/i)).toBeInTheDocument();
      });
    });

    it('should only allow one selection per question', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      const firstOption = screen.getByLabelText(/capital preservation/i);
      const secondOption = screen.getByLabelText(/income generation/i);
      
      await user.click(firstOption);
      expect(firstOption).toBeChecked();
      
      await user.click(secondOption);
      expect(secondOption).toBeChecked();
      expect(firstOption).not.toBeChecked();
    });
  });

  describe('Risk Score Calculation', () => {
    it('should calculate risk score when all questions are answered', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      // Answer all questions with first option (conservative answers)
      const radioButtons = screen.getAllByRole('radio');
      
      // Select first option for each question (indices 0, 4, 8, 12, 16)
      await user.click(radioButtons[0]); // Q1 first option
      await user.click(radioButtons[4]); // Q2 first option
      await user.click(radioButtons[8]); // Q3 first option
      await user.click(radioButtons[12]); // Q4 first option
      await user.click(radioButtons[16]); // Q5 first option
      
      await waitFor(() => {
        expect(screen.getByTestId('risk-score')).toBeInTheDocument();
        expect(screen.getByText(/\/100/)).toBeInTheDocument();
      });
    });

    it('should display risk level based on calculated score', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      // Answer with conservative answers (should result in low risk)
      const radioButtons = screen.getAllByRole('radio');
      
      await user.click(radioButtons[0]); 
      await user.click(radioButtons[4]); 
      await user.click(radioButtons[8]); 
      await user.click(radioButtons[12]); 
      await user.click(radioButtons[16]);
      
      await waitFor(() => {
        expect(screen.getByText(/very low risk|low risk/i)).toBeInTheDocument();
      });
    });

    it('should show different risk levels for different answer patterns', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      const radioButtons = screen.getAllByRole('radio');
      
      // Answer with aggressive answers (should result in high risk)
      await user.click(radioButtons[3]); // Q1 last option
      await user.click(radioButtons[7]); // Q2 last option  
      await user.click(radioButtons[11]); // Q3 last option
      await user.click(radioButtons[15]); // Q4 last option
      await user.click(radioButtons[19]); // Q5 last option
      
      await waitFor(() => {
        expect(screen.getByText(/high risk|very high risk/i)).toBeInTheDocument();
      });
    });
  });

  describe('Context Integration', () => {
    it('should update context when risk data is calculated', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      const radioButtons = screen.getAllByRole('radio');
      
      // Answer all questions
      await user.click(radioButtons[0]);
      await user.click(radioButtons[4]);
      await user.click(radioButtons[8]);
      await user.click(radioButtons[12]);
      await user.click(radioButtons[16]);
      
      await waitFor(() => {
        expect(mockUpdateRiskData).toHaveBeenCalledWith(
          expect.objectContaining({
            questionnaire: expect.arrayContaining([1, 1, 1, 1, 1]),
            riskScore: expect.any(Number),
            riskLevel: expect.any(String)
          })
        );
      });
    });

    it('should call saveStep when save button is clicked', async () => {
      mockSaveStep.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      const radioButtons = screen.getAllByRole('radio');
      
      // Answer all questions first
      await user.click(radioButtons[0]);
      await user.click(radioButtons[4]);
      await user.click(radioButtons[8]);
      await user.click(radioButtons[12]);
      await user.click(radioButtons[16]);
      
      await waitFor(() => {
        const saveButton = screen.getByText(/save risk assessment/i);
        expect(saveButton).toBeInTheDocument();
      });
      
      const saveButton = screen.getByText(/save risk assessment/i);
      await user.click(saveButton);
      
      expect(mockSaveStep).toHaveBeenCalledWith(2, expect.any(Object), true);
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels for questions', () => {
      render(<RiskAssessmentStep />);
      
      expect(screen.getByLabelText(/capital preservation.*question 1/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/less than 1 year.*question 2/i)).toBeInTheDocument();
    });

    it('should associate radio buttons with question descriptions', () => {
      render(<RiskAssessmentStep />);
      
      const firstRadio = screen.getAllByRole('radio')[0];
      expect(firstRadio).toHaveAttribute('aria-describedby', 'question-1-description');
    });

    it('should have screen reader support for risk levels', () => {
      render(<RiskAssessmentStep />);
      
      const screenReaderTexts = screen.getAllByText(/low risk option|moderate risk option|high risk option|very high risk option/i);
      expect(screenReaderTexts.length).toBeGreaterThan(0);
    });

    it('should have proper keyboard navigation support', () => {
      render(<RiskAssessmentStep />);
      
      const radioButtons = screen.getAllByRole('radio');
      radioButtons.forEach(radio => {
        expect(radio).not.toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('Risk Level Explanations', () => {
    it('should show appropriate investment guidance for each risk level', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      const radioButtons = screen.getAllByRole('radio');
      
      // Test very low risk explanation
      await user.click(radioButtons[0]);
      await user.click(radioButtons[4]);
      await user.click(radioButtons[8]);
      await user.click(radioButtons[12]);
      await user.click(radioButtons[16]);
      
      await waitFor(() => {
        expect(screen.getByText(/government bonds and fixed deposits|conservative mutual funds|diversified portfolios|growth stocks|speculative investments/i)).toBeInTheDocument();
      });
    });

    it('should display what risk level means section', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      const radioButtons = screen.getAllByRole('radio');
      
      await user.click(radioButtons[0]);
      await user.click(radioButtons[4]);
      await user.click(radioButtons[8]);
      await user.click(radioButtons[12]);
      await user.click(radioButtons[16]);
      
      await waitFor(() => {
        expect(screen.getByText(/what this means:/i)).toBeInTheDocument();
      });
    });
  });

  describe('Save Status and Progress', () => {
    it('should show save status when automatically saved', () => {
      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        riskData: { questionnaire: [], riskScore: null, riskLevel: null },
        updateRiskData: mockUpdateRiskData,
        saveStep: mockSaveStep,
        saveStatus: { 2: 'saved' }
      });
      
      render(<RiskAssessmentStep />);
      
      expect(screen.getByText(/saved automatically/i)).toBeInTheDocument();
    });

    it('should show progress bar with correct percentage', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      // Answer 3 out of 5 questions
      const radioButtons = screen.getAllByRole('radio');
      await user.click(radioButtons[0]);
      await user.click(radioButtons[4]);
      await user.click(radioButtons[8]);
      
      expect(screen.getByText(/3\/5 questions completed/i)).toBeInTheDocument();
    });

    it('should only show save button when all questions are answered', async () => {
      const user = userEvent.setup();
      render(<RiskAssessmentStep />);
      
      // Initially no save button
      expect(screen.queryByText(/save risk assessment/i)).not.toBeInTheDocument();
      
      // Answer all questions
      const radioButtons = screen.getAllByRole('radio');
      await user.click(radioButtons[0]);
      await user.click(radioButtons[4]);
      await user.click(radioButtons[8]);
      await user.click(radioButtons[12]);
      await user.click(radioButtons[16]);
      
      await waitFor(() => {
        expect(screen.getByText(/save risk assessment/i)).toBeInTheDocument();
      });
    });
  });

  describe('Instructions and Help Text', () => {
    it('should display how it works instructions', () => {
      render(<RiskAssessmentStep />);
      
      expect(screen.getByText(/how this works:/i)).toBeInTheDocument();
      expect(screen.getByText(/answer all 5 questions honestly/i)).toBeInTheDocument();
      expect(screen.getByText(/your risk score is calculated automatically/i)).toBeInTheDocument();
    });
  });

  describe('Existing Data Loading', () => {
    it('should initialize with existing risk data', () => {
      const existingData = {
        questionnaire: [2, 3, 2, 4, 1],
        riskScore: 45,
        riskLevel: 'Medium'
      };

      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        riskData: existingData,
        updateRiskData: mockUpdateRiskData,
        saveStep: mockSaveStep,
        saveStatus: { 2: 'idle' }
      });
      
      render(<RiskAssessmentStep />);
      
      // Should show completed state
      expect(screen.getByText(/5\/5 questions completed/i)).toBeInTheDocument();
      expect(screen.getByTestId('risk-score')).toHaveTextContent('45');
    });
  });
});