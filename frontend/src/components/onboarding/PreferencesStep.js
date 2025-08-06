/**
 * PreferencesStep - Step 5 of onboarding
 * Optional preferences
 */
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const PreferencesStep = () => {
  const { preferencesData, updatePreferencesData, saveStep } = useOnboarding();
  
  const [formData, setFormData] = useState({
    notifications: preferencesData.notifications ?? true,
    dataSharing: preferencesData.dataSharing ?? false,
    marketingEmails: preferencesData.marketingEmails ?? false,
    newsletterSubscription: preferencesData.newsletterSubscription ?? true
  });
  
  useEffect(() => {
    updatePreferencesData(formData);
  }, [formData]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSaveStep = async () => {
    await saveStep(5, formData, true);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
        <p className="text-sm text-gray-600 mt-1">
          Customize your experience (Optional)
        </p>
      </div>
      
      <div className="space-y-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.notifications}
            onChange={(e) => handleChange('notifications', e.target.checked)}
            className="mr-3"
          />
          <span>Enable notifications</span>
        </label>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.newsletterSubscription}
            onChange={(e) => handleChange('newsletterSubscription', e.target.checked)}
            className="mr-3"
          />
          <span>Subscribe to financial newsletter</span>
        </label>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleSaveStep}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
};

export default PreferencesStep;