/**
 * GoalsStep Unit Tests
 * Tests the financial goals form with persona-specific recommendations
 */
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GoalsStep from '../GoalsStep';

// Mock the context
const mockUpdateGoalsData = jest.fn();
const mockSaveStep = jest.fn();

const mockFinancialData = {
  monthlyIncome: '80000',
  monthlyExpenses: '60000'
};

jest.mock('../../../contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    goalsData: {
      emergencyFund: '',
      homeDownPayment: '',
      education: '',
      retirement: '',
      investment: '',
      debtPayoff: '',
      other: ''
    },
    financialData: mockFinancialData,
    updateGoalsData: mockUpdateGoalsData,
    saveStep: mockSaveStep,
    saveStatus: { 4: 'idle' }
  })
}));

describe('GoalsStep', () => {
  beforeEach(() => {
    mockUpdateGoalsData.mockClear();
    mockSaveStep.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render financial goals header and description', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText(/financial goals/i)).toBeInTheDocument();
      expect(screen.getByText(/set realistic targets based on your income/i)).toBeInTheDocument();
    });

    it('should render core goal input fields', () => {
      render(<GoalsStep />);
      
      expect(screen.getByLabelText(/target amount.*emergency fund/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/retirement target/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/investment portfolio target/i)).toBeInTheDocument();
    });

    it('should render timeframe selectors for each goal', () => {
      render(<GoalsStep />);
      
      const timeframeSelects = screen.getAllByRole('combobox');
      expect(timeframeSelects.length).toBeGreaterThan(2); // At least emergency, retirement, investment
    });
  });

  describe('Persona Detection and Smart Recommendations', () => {
    it('should detect early-career persona and show appropriate priorities', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText(/early career goal priorities/i)).toBeInTheDocument();
      expect(screen.getByText(/emergency fund/i)).toBeInTheDocument();
      expect(screen.getByText(/debt payoff/i)).toBeInTheDocument();
    });

    it('should show debt payoff section for early-career persona', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText(/debt payoff target/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/total debt to pay off/i)).toBeInTheDocument();
    });

    it('should detect family-business persona with higher income', () => {
      const familyFinancialData = {
        monthlyIncome: '120000',
        monthlyExpenses: '80000'
      };

      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        goalsData: {},
        financialData: familyFinancialData,
        updateGoalsData: mockUpdateGoalsData,
        saveStep: mockSaveStep,
        saveStatus: { 4: 'idle' }
      });
      
      render(<GoalsStep />);
      
      expect(screen.getByText(/family financial priorities/i)).toBeInTheDocument();
      expect(screen.getByText(/education fund/i)).toBeInTheDocument();
    });

    it('should detect senior-executive persona with high income', () => {
      const executiveFinancialData = {
        monthlyIncome: '200000',
        monthlyExpenses: '120000'
      };

      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        goalsData: {},
        financialData: executiveFinancialData,
        updateGoalsData: mockUpdateGoalsData,
        saveStep: mockSaveStep,
        saveStatus: { 4: 'idle' }
      });
      
      render(<GoalsStep />);
      
      expect(screen.getByText(/executive financial priorities/i)).toBeInTheDocument();
      expect(screen.getByText(/retirement maximization/i)).toBeInTheDocument();
    });

    it('should show personalized tips for each persona', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText(/personalized tips:/i)).toBeInTheDocument();
      expect(screen.getByText(/start with 3-month emergency fund/i)).toBeInTheDocument();
    });

    it('should apply smart recommendations when button is clicked', async () => {
      const user = userEvent.setup();
      render(<GoalsStep />);
      
      const smartRecommendationsButton = screen.getByText(/use smart recommendations/i);
      await user.click(smartRecommendationsButton);
      
      // Should populate suggested values in form fields
      await waitFor(() => {
        const emergencyFundInput = screen.getByLabelText(/target amount.*emergency fund/i);
        expect(emergencyFundInput.value).not.toBe('');
      });
    });
  });

  describe('Goal Categories and Priorities', () => {
    it('should show emergency fund as high priority with proper styling', () => {
      render(<GoalsStep />);
      
      const emergencySection = screen.getByText(/emergency fund/i).closest('div');
      expect(emergencySection).toHaveClass('bg-red-50');
    });

    it('should show retirement planning section', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText(/retirement planning|retirement maximization/i)).toBeInTheDocument();
      const retirementInput = screen.getByLabelText(/retirement target/i);
      expect(retirementInput).toBeInTheDocument();
    });

    it('should show investment goals section', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText(/investment target/i)).toBeInTheDocument();
      const investmentInput = screen.getByLabelText(/investment portfolio target/i);
      expect(investmentInput).toBeInTheDocument();
    });

    it('should conditionally show education fund for family personas', () => {
      const familyFinancialData = {
        monthlyIncome: '120000',
        monthlyExpenses: '80000'
      };

      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        goalsData: {},
        financialData: familyFinancialData,
        updateGoalsData: mockUpdateGoalsData,
        saveStep: mockSaveStep,
        saveStatus: { 4: 'idle' }
      });
      
      render(<GoalsStep />);
      
      expect(screen.getByText(/education fund/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/children's education target/i)).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update context when goal amounts change', async () => {
      const user = userEvent.setup();
      render(<GoalsStep />);
      
      const emergencyFundInput = screen.getByLabelText(/target amount.*emergency fund/i);
      
      await user.type(emergencyFundInput, '240000');
      
      expect(mockUpdateGoalsData).toHaveBeenCalledWith(
        expect.objectContaining({
          emergencyFund: '240000'
        })
      );
    });

    it('should update timeframes when timeframe selectors change', async () => {
      const user = userEvent.setup();
      render(<GoalsStep />);
      
      const timeframeSelects = screen.getAllByRole('combobox');
      const emergencyTimeframe = timeframeSelects[0]; // First select should be emergency fund
      
      await user.selectOptions(emergencyTimeframe, '1-year');
      
      expect(mockUpdateGoalsData).toHaveBeenCalledWith(
        expect.objectContaining({
          timeframes: expect.objectContaining({
            emergencyFund: '1-year'
          })
        })
      );
    });

    it('should call saveStep when save button is clicked', async () => {
      mockSaveStep.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      render(<GoalsStep />);
      
      const saveButton = screen.getByText(/save goals/i);
      await user.click(saveButton);
      
      expect(mockSaveStep).toHaveBeenCalledWith(4, expect.any(Object), true);
    });
  });

  describe('Smart Calculations and Suggestions', () => {
    it('should calculate appropriate emergency fund based on income', () => {
      render(<GoalsStep />);
      
      const emergencyFundInput = screen.getByLabelText(/target amount.*emergency fund/i);
      
      // For early career (monthly income 80000), should suggest 3 months = 240000
      expect(emergencyFundInput).toHaveAttribute('placeholder', expect.stringContaining('240,000'));
    });

    it('should show different retirement multipliers for different personas', () => {
      const executiveFinancialData = {
        monthlyIncome: '200000',
        monthlyExpenses: '120000'
      };

      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        goalsData: {},
        financialData: executiveFinancialData,
        updateGoalsData: mockUpdateGoalsData,
        saveStep: mockSaveStep,
        saveStatus: { 4: 'idle' }
      });
      
      render(<GoalsStep />);
      
      expect(screen.getByText(/15x annual income/i)).toBeInTheDocument();
    });

    it('should provide contextual advice for each goal type', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText(/covers unexpected expenses like medical bills/i)).toBeInTheDocument();
      expect(screen.getByText(/rule of thumb:/i)).toBeInTheDocument();
    });
  });

  describe('Goal Priority Visualization', () => {
    it('should show numbered priorities for persona-specific goals', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
      expect(screen.getByText('#3')).toBeInTheDocument();
    });

    it('should use appropriate colors for different goal categories', () => {
      render(<GoalsStep />);
      
      // Emergency fund should be red (urgent)
      const emergencySection = screen.getByText(/emergency fund/i).closest('.bg-red-50');
      expect(emergencySection).toBeInTheDocument();
      
      // Retirement should be purple (long-term)
      const retirementSection = screen.getByText(/retirement/i).closest('.bg-purple-50');
      expect(retirementSection).toBeInTheDocument();
    });
  });

  describe('Timeframe Management', () => {
    it('should show appropriate timeframe options for different goals', () => {
      render(<GoalsStep />);
      
      // Emergency fund should have short timeframes
      const timeframeSelects = screen.getAllByRole('combobox');
      const emergencyTimeframe = timeframeSelects[0];
      expect(emergencyTimeframe).toBeInTheDocument();
    });

    it('should default to reasonable timeframes for each goal type', () => {
      render(<GoalsStep />);
      
      const timeframeSelects = screen.getAllByRole('combobox');
      expect(timeframeSelects.length).toBeGreaterThan(2);
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper form labels and associations', () => {
      render(<GoalsStep />);
      
      const emergencyFundInput = screen.getByLabelText(/target amount.*emergency fund/i);
      const retirementInput = screen.getByLabelText(/retirement target/i);
      
      expect(emergencyFundInput).toBeInTheDocument();
      expect(retirementInput).toBeInTheDocument();
    });

    it('should have proper keyboard navigation support', () => {
      render(<GoalsStep />);
      
      const inputs = screen.getAllByRole('textbox');
      const selects = screen.getAllByRole('combobox');
      
      [...inputs, ...selects].forEach(element => {
        expect(element).not.toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('Existing Data Loading', () => {
    it('should initialize with existing goals data', () => {
      const existingGoalsData = {
        emergencyFund: '300000',
        retirement: '5000000',
        investment: '1000000',
        debtPayoff: '200000'
      };

      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        goalsData: existingGoalsData,
        financialData: mockFinancialData,
        updateGoalsData: mockUpdateGoalsData,
        saveStep: mockSaveStep,
        saveStatus: { 4: 'idle' }
      });
      
      render(<GoalsStep />);
      
      expect(screen.getByDisplayValue('300000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('5000000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1000000')).toBeInTheDocument();
    });
  });

  describe('Conditional Goal Fields', () => {
    it('should only show debt payoff for early-career personas', () => {
      render(<GoalsStep />);
      
      // Should show debt payoff for early career (income 80000)
      expect(screen.getByText(/debt payoff target/i)).toBeInTheDocument();
    });

    it('should only show education fund for family-business personas', () => {
      const familyFinancialData = {
        monthlyIncome: '120000',
        monthlyExpenses: '80000'
      };

      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        goalsData: {},
        financialData: familyFinancialData,
        updateGoalsData: mockUpdateGoalsData,
        saveStep: mockSaveStep,
        saveStatus: { 4: 'idle' }
      });
      
      render(<GoalsStep />);
      
      expect(screen.getByText(/education fund/i)).toBeInTheDocument();
      expect(screen.queryByText(/debt payoff target/i)).not.toBeInTheDocument();
    });
  });

  describe('Goal Strategies and Tips', () => {
    it('should show appropriate strategies for debt payoff', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText(/pay off high-interest debt first/i)).toBeInTheDocument();
    });

    it('should show investment approach guidance', () => {
      render(<GoalsStep />);
      
      expect(screen.getByText(/start with index funds|diversified portfolio/i)).toBeInTheDocument();
    });
  });
});