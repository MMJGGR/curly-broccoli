/**
 * PersonalInfoStep - Step 1 of onboarding
 * Features:
 * - Phone field included (this was missing before!)
 * - Auto-save functionality
 * - Real-time validation
 * - Kenya-specific formatting
 */
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PersonalInfoStep = () => {
  const { personalData, updatePersonalData, saveStep, saveStatus } = useOnboarding();
  
  // Local state for form fields
  const [formData, setFormData] = useState({
    firstName: personalData.firstName || '',
    lastName: personalData.lastName || '',
    dateOfBirth: personalData.dateOfBirth || '',
    phone: personalData.phone || '', // ✅ PHONE FIELD INCLUDED!
    nationalId: personalData.nationalId || '',
    kraPin: personalData.kraPin || '',
    employmentStatus: personalData.employmentStatus || 'Employed',
    dependents: personalData.dependents || 0
  });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Update context when form data changes
  useEffect(() => {
    updatePersonalData(formData);
  }, [formData]);
  
  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  // Phone number formatting for Kenya
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Format based on Kenya patterns
    if (digits.startsWith('254')) {
      // +254 format
      return '+254 ' + digits.slice(3, 6) + ' ' + digits.slice(6, 9) + ' ' + digits.slice(9, 12);
    } else if (digits.startsWith('0')) {
      // 0 format - convert to +254
      return '+254 ' + digits.slice(1, 4) + ' ' + digits.slice(4, 7) + ' ' + digits.slice(7, 10);
    } else if (digits.length > 0) {
      // Assume local number, add +254
      return '+254 ' + digits.slice(0, 3) + ' ' + digits.slice(3, 6) + ' ' + digits.slice(6, 9);
    }
    return value;
  };
  
  // Handle phone input with formatting
  const handlePhoneChange = (value) => {
    const formatted = formatPhoneNumber(value);
    handleChange('phone', formatted);
  };
  
  // Validate field
  const validateField = (field, value) => {
    switch (field) {
      case 'firstName':
        return !value ? 'First name is required' : null;
      case 'lastName':
        return !value ? 'Last name is required' : null;
      case 'dateOfBirth': {
        if (!value) return 'Date of birth is required';
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) return 'You must be at least 18 years old';
        if (age > 100) return 'Please enter a valid date of birth';
        return null;
      }
      case 'phone': {
        if (!value) return 'Phone number is required';
        const phoneDigits = value.replace(/\D/g, '');
        if (phoneDigits.length < 12) return 'Please enter a valid Kenya phone number';
        return null;
      }
      case 'nationalId':
        if (value && value.length !== 8) return 'National ID should be 8 digits';
        return null;
      case 'kraPin':
        if (value && !/^[A-Z]\d{9}[A-Z]$/.test(value)) return 'KRA PIN format: A123456789Z';
        return null;
      case 'dependents':
        return value < 0 ? 'Dependents cannot be negative' : null;
      default:
        return null;
    }
  };
  
  // Handle blur for validation
  const handleBlur = (field, value) => {
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  // Manual save button
  const handleSaveStep = async () => {
    const result = await saveStep(1, formData, true);
    if (result.success) {
      console.log('✅ Personal information saved successfully');
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Save Status Indicator */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        {saveStatus[1] === 'saved' && (
          <div className="flex items-center text-green-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Saved automatically
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* First Name */}
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            onBlur={(e) => handleBlur('firstName', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.firstName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your first name"
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>
        
        {/* Last Name */}
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            onBlur={(e) => handleBlur('lastName', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.lastName ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter your last name"
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
        
        {/* Date of Birth */}
        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <input
            type="date"
            id="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            onBlur={(e) => handleBlur('dateOfBirth', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dateOfBirth ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.dateOfBirth && (
            <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
          )}
        </div>
        
        {/* ✅ PHONE NUMBER FIELD - This was missing before! */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            id="phone"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={(e) => handleBlur('phone', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="+254 700 123 456"
          />
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
          <p className="mt-1 text-xs text-gray-500">Enter your Kenya mobile number</p>
        </div>
        
        {/* National ID */}
        <div>
          <label htmlFor="nationalId" className="block text-sm font-medium text-gray-700 mb-2">
            National ID
          </label>
          <input
            type="text"
            id="nationalId"
            value={formData.nationalId}
            onChange={(e) => handleChange('nationalId', e.target.value)}
            onBlur={(e) => handleBlur('nationalId', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.nationalId ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="12345678"
            maxLength="8"
          />
          {errors.nationalId && (
            <p className="mt-1 text-sm text-red-600">{errors.nationalId}</p>
          )}
        </div>
        
        {/* KRA PIN */}
        <div>
          <label htmlFor="kraPin" className="block text-sm font-medium text-gray-700 mb-2">
            KRA PIN
          </label>
          <input
            type="text"
            id="kraPin"
            value={formData.kraPin}
            onChange={(e) => handleChange('kraPin', e.target.value.toUpperCase())}
            onBlur={(e) => handleBlur('kraPin', e.target.value)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.kraPin ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="A123456789Z"
            maxLength="11"
          />
          {errors.kraPin && (
            <p className="mt-1 text-sm text-red-600">{errors.kraPin}</p>
          )}
        </div>
        
        {/* Employment Status */}
        <div>
          <label htmlFor="employmentStatus" className="block text-sm font-medium text-gray-700 mb-2">
            Employment Status *
          </label>
          <select
            id="employmentStatus"
            value={formData.employmentStatus}
            onChange={(e) => handleChange('employmentStatus', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Employed">Employed</option>
            <option value="Self-employed">Self-employed</option>
            <option value="Unemployed">Unemployed</option>
            <option value="Student">Student</option>
            <option value="Retired">Retired</option>
          </select>
        </div>
        
        {/* Dependents */}
        <div>
          <label htmlFor="dependents" className="block text-sm font-medium text-gray-700 mb-2">
            Number of Dependents
          </label>
          <input
            type="number"
            id="dependents"
            value={formData.dependents}
            onChange={(e) => handleChange('dependents', parseInt(e.target.value) || 0)}
            onBlur={(e) => handleBlur('dependents', parseInt(e.target.value) || 0)}
            className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dependents ? 'border-red-300' : 'border-gray-300'
            }`}
            min="0"
            max="20"
          />
          {errors.dependents && (
            <p className="mt-1 text-sm text-red-600">{errors.dependents}</p>
          )}
        </div>
      </div>
      
      {/* Manual Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveStep}
          disabled={saveStatus[1] === 'saving'}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saveStatus[1] === 'saving' ? 'Saving...' : 'Save Progress'}
        </button>
      </div>
      
      {/* Required fields note */}
      <div className="text-sm text-gray-500">
        <p>* Required fields</p>
        <p>Your information is automatically saved as you type and kept secure.</p>
      </div>
    </div>
  );
};

export default PersonalInfoStep;