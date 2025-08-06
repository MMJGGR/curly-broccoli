/**
 * PersonalInfoStep Unit Tests
 * Tests the personal information form with phone field validation
 */
import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PersonalInfoStep from '../PersonalInfoStep';
import { OnboardingProvider } from '../../../contexts/OnboardingContext';

// Mock the context for controlled testing
const mockUpdatePersonalData = jest.fn();
const mockSaveStep = jest.fn();

jest.mock('../../../contexts/OnboardingContext', () => ({
  ...jest.requireActual('../../../contexts/OnboardingContext'),
  useOnboarding: () => ({
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
    updatePersonalData: mockUpdatePersonalData,
    saveStep: mockSaveStep,
    saveStatus: { 1: 'idle' }
  })
}));

describe('PersonalInfoStep', () => {
  beforeEach(() => {
    mockUpdatePersonalData.mockClear();
    mockSaveStep.mockClear();
  });

  describe('Component Rendering', () => {
    it('should render all required form fields', () => {
      render(<PersonalInfoStep />);
      
      expect(screen.getByLabelText(/first name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/last name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/date of birth/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/phone number/i)).toBeInTheDocument(); // CRITICAL: Phone field must exist
      expect(screen.getByLabelText(/employment status/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/number of dependents/i)).toBeInTheDocument();
    });

    it('should render optional fields', () => {
      render(<PersonalInfoStep />);
      
      expect(screen.getByLabelText(/national id/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/kra pin/i)).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
      render(<PersonalInfoStep />);
      
      expect(screen.getByText(/first name \*/i)).toBeInTheDocument();
      expect(screen.getByText(/last name \*/i)).toBeInTheDocument();
      expect(screen.getByText(/phone number \*/i)).toBeInTheDocument();
    });
  });

  describe('Phone Number Validation and Formatting', () => {
    it('should format Kenya phone numbers correctly', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      
      // Test various Kenya phone number formats
      await user.type(phoneInput, '0712345678');
      expect(phoneInput).toHaveValue('+254 712 345 678');
      
      // Clear and test another format
      await user.clear(phoneInput);
      await user.type(phoneInput, '254712345678');
      expect(phoneInput).toHaveValue('+254 712 345 678');
    });

    it('should show validation error for invalid phone numbers', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      
      await user.type(phoneInput, 'invalid-phone');
      fireEvent.blur(phoneInput);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid kenya phone number/i)).toBeInTheDocument();
      });
    });

    it('should clear validation error when user starts typing', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      
      // Trigger error
      await user.type(phoneInput, 'invalid');
      fireEvent.blur(phoneInput);
      
      await waitFor(() => {
        expect(screen.getByText(/please enter a valid kenya phone number/i)).toBeInTheDocument();
      });
      
      // Start typing valid number
      await user.clear(phoneInput);
      await user.type(phoneInput, '+254712');
      
      expect(screen.queryByText(/please enter a valid kenya phone number/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      
      // Test empty field validation
      fireEvent.blur(firstNameInput);
      await waitFor(() => {
        expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      });
      
      fireEvent.blur(lastNameInput);
      await waitFor(() => {
        expect(screen.getByText(/last name is required/i)).toBeInTheDocument();
      });
    });

    it('should validate date of birth constraints', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const dobInput = screen.getByLabelText(/date of birth/i);
      
      // Test underage validation
      const today = new Date();
      const underageDate = new Date(today.getFullYear() - 17, today.getMonth(), today.getDate());
      const underageDateString = underageDate.toISOString().split('T')[0];
      
      await user.type(dobInput, underageDateString);
      fireEvent.blur(dobInput);
      
      await waitFor(() => {
        expect(screen.getByText(/you must be at least 18 years old/i)).toBeInTheDocument();
      });
    });

    it('should validate National ID format', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const nationalIdInput = screen.getByLabelText(/national id/i);
      
      await user.type(nationalIdInput, '123456'); // Too short
      fireEvent.blur(nationalIdInput);
      
      await waitFor(() => {
        expect(screen.getByText(/national id should be 8 digits/i)).toBeInTheDocument();
      });
    });

    it('should validate KRA PIN format', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const kraPinInput = screen.getByLabelText(/kra pin/i);
      
      await user.type(kraPinInput, 'invalid-format');
      fireEvent.blur(kraPinInput);
      
      await waitFor(() => {
        expect(screen.getByText(/kra pin format: a123456789z/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Interaction and Auto-save', () => {
    it('should update context when form data changes', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      
      await user.type(firstNameInput, 'John');
      
      // Verify context was updated
      expect(mockUpdatePersonalData).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John'
        })
      );
    });

    it('should call saveStep when save button is clicked', async () => {
      mockSaveStep.mockResolvedValue({ success: true });
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const saveButton = screen.getByText(/save progress/i);
      await user.click(saveButton);
      
      expect(mockSaveStep).toHaveBeenCalledWith(1, expect.any(Object), true);
    });

    it('should show save status indicator', () => {
      // Test with saved status
      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        personalData: { firstName: 'John' },
        updatePersonalData: mockUpdatePersonalData,
        saveStep: mockSaveStep,
        saveStatus: { 1: 'saved' }
      });
      
      render(<PersonalInfoStep />);
      
      expect(screen.getByText(/saved automatically/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility Features', () => {
    it('should have proper ARIA labels', () => {
      render(<PersonalInfoStep />);
      
      const firstNameInput = screen.getByLabelText(/first name/i);
      const phoneInput = screen.getByLabelText(/phone number/i);
      
      expect(firstNameInput).toHaveAttribute('id', 'firstName');
      expect(phoneInput).toHaveAttribute('id', 'phone');
      expect(phoneInput).toHaveAttribute('type', 'tel');
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const phoneInput = screen.getByLabelText(/phone number/i);
      
      await user.type(phoneInput, 'invalid');
      fireEvent.blur(phoneInput);
      
      await waitFor(() => {
        const errorMessage = screen.getByText(/please enter a valid kenya phone number/i);
        expect(errorMessage).toBeInTheDocument();
        expect(errorMessage).toHaveClass('text-red-600');
      });
    });

    it('should have proper keyboard navigation', () => {
      render(<PersonalInfoStep />);
      
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

  describe('Employment Status and Dependents', () => {
    it('should handle employment status selection', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const employmentSelect = screen.getByLabelText(/employment status/i);
      
      await user.selectOptions(employmentSelect, 'Self-employed');
      
      expect(employmentSelect).toHaveValue('Self-employed');
      expect(mockUpdatePersonalData).toHaveBeenCalledWith(
        expect.objectContaining({
          employmentStatus: 'Self-employed'
        })
      );
    });

    it('should handle dependents input', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const dependentsInput = screen.getByLabelText(/number of dependents/i);
      
      await user.type(dependentsInput, '2');
      
      expect(mockUpdatePersonalData).toHaveBeenCalledWith(
        expect.objectContaining({
          dependents: 2
        })
      );
    });

    it('should validate negative dependents', async () => {
      const user = userEvent.setup();
      render(<PersonalInfoStep />);
      
      const dependentsInput = screen.getByLabelText(/number of dependents/i);
      
      await user.type(dependentsInput, '-1');
      fireEvent.blur(dependentsInput);
      
      await waitFor(() => {
        expect(screen.getByText(/dependents cannot be negative/i)).toBeInTheDocument();
      });
    });
  });

  describe('Privacy and Security Information', () => {
    it('should display privacy information', () => {
      render(<PersonalInfoStep />);
      
      expect(screen.getByText(/your information is automatically saved/i)).toBeInTheDocument();
      expect(screen.getByText(/required fields/i)).toBeInTheDocument();
    });
  });

  describe('Integration with Context State', () => {
    it('should initialize with existing personal data', () => {
      const existingData = {
        firstName: 'Jane',
        lastName: 'Doe',
        phone: '+254712345678',
        employmentStatus: 'Self-employed',
        dependents: 1
      };

      jest.mocked(require('../../../contexts/OnboardingContext').useOnboarding).mockReturnValue({
        personalData: existingData,
        updatePersonalData: mockUpdatePersonalData,
        saveStep: mockSaveStep,
        saveStatus: { 1: 'idle' }
      });
      
      render(<PersonalInfoStep />);
      
      expect(screen.getByDisplayValue('Jane')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Doe')).toBeInTheDocument();
      expect(screen.getByDisplayValue('+254712345678')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Self-employed')).toBeInTheDocument();
      expect(screen.getByDisplayValue('1')).toBeInTheDocument();
    });
  });
});