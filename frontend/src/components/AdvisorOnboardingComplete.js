import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdvisorOnboardingComplete = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  
  const navigate = useNavigate();

  const hideMessageBox = () => {
    setShowMessageBox(false);
    setMessage('');
  };

  const handleCompleteOnboarding = async () => {
    setLoading(true);
    
    try {
      // Get all advisor data from localStorage
      const professionalDetails = JSON.parse(localStorage.getItem('advisorProfessionalDetails') || '{}');
      const serviceModel = JSON.parse(localStorage.getItem('advisorServiceModel') || '{}');
      
      // Get JWT token
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        throw new Error('Please login first');
      }

      // Prepare advisor profile data
      const advisorProfileData = {
        first_name: professionalDetails.firstName,
        last_name: professionalDetails.lastName,
        firm_name: professionalDetails.firmName,
        license_number: professionalDetails.licenseNumber,
        professional_email: professionalDetails.professionalEmail,
        phone: professionalDetails.phone,
        service_model: serviceModel.serviceModel,
        target_client_type: serviceModel.targetClientType,
        minimum_aum: serviceModel.minimumAUM,
        // Default advisor values
        date_of_birth: '1980-01-01',
        nationalId: 'ADV-' + Date.now(),
        kra_pin: 'A' + Date.now() + 'Z',
        annual_income: 300000,
        dependents: 0,
        goals: {
          targetAmount: 100000,
          timeHorizon: 24
        },
        questionnaire: [4, 4, 3, 4, 4] // Moderate-aggressive profile for advisors
      };

      // Submit to backend
      const response = await fetch('/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`
        },
        body: JSON.stringify(advisorProfileData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to complete advisor setup');
      }

      // Clear onboarding data
      localStorage.removeItem('advisorProfessionalDetails');
      localStorage.removeItem('advisorServiceModel');
      
      setMessage('Advisor profile created successfully!');
      setShowMessageBox(true);
      
      // Navigate to advisor dashboard after a delay
      setTimeout(() => {
        navigate('/advisor/dashboard');
      }, 2000);
      
    } catch (error) {
      console.error('Advisor onboarding error:', error);
      setMessage(error.message || 'Failed to complete advisor setup');
      setShowMessageBox(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-3">Almost Done!</h1>
          <p className="text-gray-600 text-lg">Let's complete your advisor profile setup</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">What you'll get:</h3>
          <div className="space-y-3 text-left">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Professional advisor dashboard</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Client management tools</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Portfolio analysis capabilities</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700">Professional reporting features</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleCompleteOnboarding}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-600 to-blue-600 text-white py-4 px-8 rounded-xl font-bold hover:from-green-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Setting up your profile...
            </div>
          ) : (
            'Complete Advisor Setup'
          )}
        </button>

        <p className="text-sm text-gray-500 mt-4">
          You can always update these details later in your profile settings
        </p>

        {/* Progress indicator */}
        <div className="mt-6 flex justify-center space-x-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
        </div>
        <p className="text-center text-sm text-gray-600 mt-2">Step 3 of 3</p>

        {showMessageBox && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <p className="text-gray-800 mb-4">{message}</p>
              <button
                onClick={hideMessageBox}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvisorOnboardingComplete;