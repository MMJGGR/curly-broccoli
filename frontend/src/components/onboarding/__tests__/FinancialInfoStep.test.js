/**
 * FinancialInfoStep Unit Tests
 * Tests the financial information form with persona-specific guidance
 */
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FinancialInfoStep from '../FinancialInfoStep';

// Mock the context
const mockUpdateFinancialData = jest.fn();
const mockSaveStep = jest.fn();

jest.mock('../../../contexts/OnboardingContext', () => ({
  useOnboarding: () => ({
    financialData: {
      monthlyIncome: '',
      monthlyExpenses: '',
      existingSavings: '',
      existingDebt: '',
      savingsGoal: '',
      incomeSource: 'Employment'
    },
    updateFinancialData: mockUpdateFinancialData,
    saveStep: mockSaveStep,
    saveStatus: { 3: 'idle' }
  })
}));

describe('FinancialInfoStep', () => {
  beforeEach(() => {
    mockUpdateFinancialData.mockClear();
    mockSaveStep.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render all required financial form fields', () => {
      render(<FinancialInfoStep />);
      
      expect(screen.getByLabelText(/monthly income/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/monthly expenses/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/existing savings/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/existing debt/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/income source/i)).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
      render(<FinancialInfoStep />);
      
      expect(screen.getByText(/monthly income \*/i)).toBeInTheDocument();
      expect(screen.getByText(/monthly expenses \*/i)).toBeInTheDocument();
    });

    it('should render income source dropdown options', () => {
      render(<FinancialInfoStep />);
      
      const incomeSourceSelect = screen.getByLabelText(/income source/i);
      expect(incomeSourceSelect).toBeInTheDocument();
      
      // Check that it has the expected options
      expect(screen.getByDisplayValue('Employment')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      const monthlyExpensesInput = screen.getByLabelText(/monthly expenses/i);
      
      // Test empty field validation
      fireEvent.blur(monthlyIncomeInput);
      await waitFor(() => {
        expect(screen.getByText(/monthly income is required/i)).toBeInTheDocument();
      });
      
      fireEvent.blur(monthlyExpensesInput);
      await waitFor(() => {
        expect(screen.getByText(/monthly expenses is required/i)).toBeInTheDocument();
      });
    });

    it('should validate positive number inputs', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      
      await user.type(monthlyIncomeInput, '-1000');
      fireEvent.blur(monthlyIncomeInput);
      
      await waitFor(() => {
        expect(screen.getByText(/income must be a positive number/i)).toBeInTheDocument();
      });
    });

    it('should validate that expenses do not exceed income', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      const monthlyExpensesInput = screen.getByLabelText(/monthly expenses/i);
      
      await user.type(monthlyIncomeInput, '50000');
      await user.type(monthlyExpensesInput, '60000');
      fireEvent.blur(monthlyExpensesInput);
      
      await waitFor(() => {
        expect(screen.getByText(/expenses cannot exceed income/i)).toBeInTheDocument();
      });
    });

    it('should clear validation errors when user corrects input', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      
      // Trigger error
      await user.type(monthlyIncomeInput, '-1000');
      fireEvent.blur(monthlyIncomeInput);
      
      await waitFor(() => {
        expect(screen.getByText(/income must be a positive number/i)).toBeInTheDocument();
      });
      
      // Correct the input
      await user.clear(monthlyIncomeInput);
      await user.type(monthlyIncomeInput, '50000');
      
      expect(screen.queryByText(/income must be a positive number/i)).not.toBeInTheDocument();
    });
  });

  describe('Persona Detection and Smart Defaults', () => {
    it('should detect early-career persona and show appropriate guidance', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      
      // Income indicating early career (Jamal)
      await user.type(monthlyIncomeInput, '80000');
      fireEvent.blur(monthlyIncomeInput);
      
      await waitFor(() => {
        expect(screen.getByText(/early career financial guidance/i)).toBeInTheDocument();
        expect(screen.getByText(/focus on building emergency fund/i)).toBeInTheDocument();
      });
    });

    it('should detect family-business persona and show appropriate guidance', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      
      // Income indicating family business (Aisha)
      await user.type(monthlyIncomeInput, '120000');
      fireEvent.blur(monthlyIncomeInput);
      
      await waitFor(() => {
        expect(screen.getByText(/family business financial guidance/i)).toBeInTheDocument();
        expect(screen.getByText(/plan for education expenses/i)).toBeInTheDocument();
      });
    });

    it('should detect senior-executive persona and show appropriate guidance', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      
      // Income indicating senior executive (Samuel)
      await user.type(monthlyIncomeInput, '200000');
      fireEvent.blur(monthlyIncomeInput);
      
      await waitFor(() => {
        expect(screen.getByText(/executive financial guidance/i)).toBeInTheDocument();
        expect(screen.getByText(/maximize retirement contributions/i)).toBeInTheDocument();
      });
    });

    it('should apply smart defaults when button is clicked', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      
      // Set income to trigger persona detection
      await user.type(monthlyIncomeInput, '80000');
      fireEvent.blur(monthlyIncomeInput);
      
      await waitFor(() => {
        const smartDefaultsButton = screen.getByText(/apply smart defaults/i);
        expect(smartDefaultsButton).toBeInTheDocument();
      });
      
      const smartDefaultsButton = screen.getByText(/apply smart defaults/i);
      await user.click(smartDefaultsButton);
      
      // Should populate recommended values
      const expensesInput = screen.getByLabelText(/monthly expenses/i);
      expect(expensesInput.value).not.toBe('');
    });
  });

  describe('Form Interaction and Auto-save', () => {
    it('should update context when form data changes', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      
      await user.type(monthlyIncomeInput, '75000');
      
      expect(mockUpdateFinancialData).toHaveBeenCalledWith(
        expect.objectContaining({
          monthlyIncome: '75000'
        })
      );
    });

    it('should handle income source selection', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const incomeSourceSelect = screen.getByLabelText(/income source/i);
      
      await user.selectOptions(incomeSourceSelect, 'Business');
      
      expect(mockUpdateFinancialData).toHaveBeenCalledWith(
        expect.objectContaining({
          incomeSource: 'Business'
        })
      );
    });

    it('should call saveStep when save button is clicked', async () => {
      mockSaveStep.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const saveButton = screen.getByText(/save financial information/i);
      await user.click(saveButton);
      
      expect(mockSaveStep).toHaveBeenCalledWith(3, expect.any(Object), true);
    });
  });

  describe('Budget Analysis and Insights', () => {
    it('should calculate and display disposable income', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      const monthlyExpensesInput = screen.getByLabelText(/monthly expenses/i);
      
      await user.type(monthlyIncomeInput, '100000');
      await user.type(monthlyExpensesInput, '70000');
      
      await waitFor(() => {
        expect(screen.getByText(/disposable income/i)).toBeInTheDocument();
        expect(screen.getByText(/30,000/)).toBeInTheDocument();
      });
    });

    it('should show budget health indicators', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      const monthlyExpensesInput = screen.getByLabelText(/monthly expenses/i);
      
      // Good budget ratio (70% expenses)
      await user.type(monthlyIncomeInput, '100000');
      await user.type(monthlyExpensesInput, '70000');
      
      await waitFor(() => {
        expect(screen.getByText(/healthy budget|good financial position/i)).toBeInTheDocument();
      });
    });

    it('should warn about high expense ratios', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      const monthlyExpensesInput = screen.getByLabelText(/monthly expenses/i);
      
      // High expense ratio (95% expenses)
      await user.type(monthlyIncomeInput, '100000');
      await user.type(monthlyExpensesInput, '95000');
      
      await waitFor(() => {
        expect(screen.getByText(/high expense ratio|consider reducing expenses/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels and form associations', () => {
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      const monthlyExpensesInput = screen.getByLabelText(/monthly expenses/i);
      
      expect(monthlyIncomeInput).toHaveAttribute('id', 'monthlyIncome');
      expect(monthlyExpensesInput).toHaveAttribute('id', 'monthlyExpenses');
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      
      await user.type(monthlyIncomeInput, '-1000');
      fireEvent.blur(monthlyIncomeInput);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/income must be a positive number/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });

    it('should have proper keyboard navigation', () => {
      render(<FinancialInfoStep />);
      
      const inputs = screen.getAllByRole('textbox');
      const selectElements = screen.getAllByRole('combobox');
      
      // All inputs should be keyboard focusable
      inputs.forEach(input => {
        expect(input).not.toHaveAttribute('tabIndex', '-1');
      });
      
      selectElements.forEach(select => {
        expect(select).not.toHaveAttribute('tabIndex', '-1');
      });
    });
  });

  describe('Currency Formatting', () => {
    it('should format numbers with proper currency display', async () => {
      const user = userEvent.setup();
      render(<FinancialInfoStep />);
      
      const monthlyIncomeInput = screen.getByLabelText(/monthly income/i);
      
      await user.type(monthlyIncomeInput, '123456');
      fireEvent.blur(monthlyIncomeInput);
      
      // Should show formatted version somewhere in the UI
      await waitFor(() => {
        expect(screen.getByText(/123,456|KES 123,456/)).toBeInTheDocument();
      });
    });
  });

  describe('Save Status and Progress', () => {
    it('should show save status indicator', () => {
      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        financialData: { monthlyIncome: '80000' },
        updateFinancialData: mockUpdateFinancialData,
        saveStep: mockSaveStep,
        saveStatus: { 3: 'saved' }
      });
      
      render(<FinancialInfoStep />);
      
      expect(screen.getByText(/saved automatically/i)).toBeInTheDocument();
    });
  });

  describe('Existing Data Loading', () => {
    it('should initialize with existing financial data', () => {
      const existingData = {
        monthlyIncome: '120000',
        monthlyExpenses: '80000',
        existingSavings: '500000',
        existingDebt: '100000',
        incomeSource: 'Business'
      };

      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        financialData: existingData,
        updateFinancialData: mockUpdateFinancialData,
        saveStep: mockSaveStep,
        saveStatus: { 3: 'idle' }
      });
      
      render(<FinancialInfoStep />);
      
      expect(screen.getByDisplayValue('120000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('80000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('500000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('100000')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Business')).toBeInTheDocument();
    });
  });

  describe('Help and Instructions', () => {
    it('should display helpful information about financial planning', () => {
      render(<FinancialInfoStep />);
      
      expect(screen.getByText(/your information is automatically saved/i)).toBeInTheDocument();
      expect(screen.getByText(/all amounts in kenya shillings/i)).toBeInTheDocument();
    });
  });
});