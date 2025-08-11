/**
 * Timeline Profile - Profile management with Timeline context integration
 * Replaces the traditional Profile.js with Timeline-first approach
 */
import React, { useState, useEffect } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';
import { API_BASE_URL } from '../../config';

const TimelineProfile = () => {
  console.log('🚀 TimelineProfile: Component mounted');
  
  const {
    persona,
    personaTheme,
    currentAge,
    currentPhase,
    alignmentScore
  } = useTimeline();

  const [profileData, setProfileData] = useState({
    personalDetails: {
      name: '',
      email: '',
      age: '',
      occupation: '',
      dependents: ''
    },
    financialDetails: {
      monthlyIncome: '',
      monthlyExpenses: '',
      currentSavings: '',
      monthlyDebtPayments: '',
      riskTolerance: ''
    },
    goals: {
      retirementAge: '',
      emergencyFundTarget: '',
      majorGoals: []
    }
  });

  const [isEditing, setIsEditing] = useState(false);
  const [activeSection, setActiveSection] = useState('personal');
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.log('⚠️ TimelineProfile: No JWT token found, user needs to login');
      return;
    }

    try {
      console.log('🔍 TimelineProfile: Loading profile data...');
      
      // First try to get Profile data from the profile table
      let response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      let data = null;
      let hasProfileData = false;

      if (response.ok) {
        data = await response.json();
        console.log('✅ TimelineProfile: Profile endpoint response:', data);
        
        // Check if we have meaningful profile data
        hasProfileData = data.profile && (
          data.profile.first_name || 
          data.profile.annual_income || 
          data.profile.monthly_income ||
          data.profile.dependents !== null
        );
      }

      // If no Profile data, try to get OnboardingState data and attempt transfer
      if (!hasProfileData) {
        console.log('🔄 TimelineProfile: Profile data incomplete, trying onboarding state...');
        response = await fetch(`${API_BASE_URL}/api/v1/onboarding/state`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const onboardingData = await response.json();
          console.log('✅ TimelineProfile: Onboarding state loaded:', onboardingData);
          
          // If we have rich onboarding data, try to transfer it to profile
          if (onboardingData.personal_data || onboardingData.financial_data) {
            console.log('🔄 TimelineProfile: Attempting to transfer onboarding data to profile...');
            try {
              const transferResponse = await fetch(`${API_BASE_URL}/api/v1/onboarding/transfer-to-profile`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (transferResponse.ok) {
                const transferResult = await transferResponse.json();
                console.log('✅ TimelineProfile: Data transfer result:', transferResult);
                
                // Reload profile data after transfer - Try multiple times to ensure success
                if (transferResult.success) {
                  let retryCount = 0;
                  const maxRetries = 3;
                  
                  while (retryCount < maxRetries) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
                    
                    const newProfileResponse = await fetch(`${API_BASE_URL}/auth/me`, {
                      headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    if (newProfileResponse.ok) {
                      const newProfileData = await newProfileResponse.json();
                      console.log(`🔄 Retry ${retryCount + 1}: Profile data:`, newProfileData.profile);
                      
                      if (newProfileData.profile && (newProfileData.profile.first_name || newProfileData.profile.annual_income || newProfileData.profile.monthly_income)) {
                        data = newProfileData;
                        hasProfileData = true;
                        console.log('✅ Profile data successfully loaded after transfer!');
                        break;
                      }
                    }
                    retryCount++;
                  }
                  
                  if (!hasProfileData) {
                    console.warn('⚠️ Profile data still not available after transfer and retries');
                  }
                }
              } else {
                console.error('❌ Transfer failed:', await transferResponse.text());
              }
            } catch (transferError) {
              console.warn('Transfer attempt failed:', transferError);
            }
          }
          
          // If transfer didn't work or wasn't attempted, use onboarding data directly
          if (!hasProfileData) {
            // Map onboarding data to profile structure
            const personalData = onboardingData.personal_data || {};
            const financialData = onboardingData.financial_data || {};
            const goalsData = onboardingData.goals_data || {};
            
            setProfileData({
              personalDetails: {
                name: personalData.firstName && personalData.lastName ? 
                  `${personalData.firstName} ${personalData.lastName}` : '',
                email: data?.email || '', // Get email from auth/me response
                age: personalData.dateOfBirth ? 
                  Math.floor((new Date() - new Date(personalData.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000)).toString() : '',
                occupation: personalData.employmentStatus || '',
                dependents: personalData.dependents?.toString() || ''
              },
              financialDetails: {
                monthlyIncome: financialData.monthlyIncome?.toString() || '',
                monthlyExpenses: (
                  (financialData.rent || 0) + 
                  (financialData.utilities || 0) + 
                  (financialData.groceries || 0) + 
                  (financialData.transport || 0) + 
                  (financialData.loanRepayments || 0)
                ).toString() || '',
                currentSavings: financialData.currentSavings?.toString() || '',
                monthlyDebtPayments: financialData.loanRepayments?.toString() || '',
                riskTolerance: onboardingData.risk_data?.questionnaire ? 
                  getRiskToleranceFromQuestionnaire(onboardingData.risk_data.questionnaire) : ''
              },
              goals: {
                retirementAge: goalsData.retirementAge?.toString() || '',
                emergencyFundTarget: goalsData.emergencyFund?.toString() || '',
                majorGoals: goalsData.goals || []
              }
            });
            return;
          }
        }
      }

      // If we have Profile data, use it
      if (hasProfileData) {
        const profile = data.profile;
        setProfileData({
          personalDetails: {
            name: profile.first_name && profile.last_name ? 
              `${profile.first_name} ${profile.last_name}` : '',
            email: data.email || '',
            age: profile.date_of_birth ? 
              Math.floor((new Date() - new Date(profile.date_of_birth)) / (365.25 * 24 * 60 * 60 * 1000)).toString() : '',
            occupation: profile.employment_status || '',
            dependents: profile.dependents?.toString() || ''
          },
          financialDetails: {
            monthlyIncome: profile.monthly_income?.toString() || 
                          (profile.annual_income ? (profile.annual_income / 12).toString() : ''),
            monthlyExpenses: profile.monthly_expenses?.toString() || '',
            currentSavings: profile.current_savings?.toString() || '',
            monthlyDebtPayments: profile.monthly_debt_payments?.toString() || '',
            riskTolerance: profile.questionnaire ? 
              getRiskToleranceFromQuestionnaire(profile.questionnaire) : ''
          },
          goals: {
            retirementAge: profile.retirement_age?.toString() || profile.target_retirement_age?.toString() || '',
            emergencyFundTarget: profile.emergency_fund_target?.toString() || '',
            majorGoals: profile.goals ? (Array.isArray(profile.goals) ? profile.goals : []) : []
          }
        });
      }

    } catch (error) {
      console.error('❌ TimelineProfile: Failed to load profile data:', error);
    }
  };

  // Helper function to convert risk questionnaire to tolerance level
  const getRiskToleranceFromQuestionnaire = (questionnaire) => {
    if (!Array.isArray(questionnaire) || questionnaire.length === 0) return '';
    
    const average = questionnaire.reduce((sum, val) => sum + val, 0) / questionnaire.length;
    if (average <= 2) return 'conservative';
    if (average <= 3.5) return 'moderate';
    return 'aggressive';
  };

  const saveProfileData = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    setIsSaving(true);

    try {
      const requestData = {
        name: profileData.personalDetails.name,
        age: parseInt(profileData.personalDetails.age) || null,
        occupation: profileData.personalDetails.occupation,
        dependents: parseInt(profileData.personalDetails.dependents) || 0,
        monthly_income: parseFloat(profileData.financialDetails.monthlyIncome) || null,
        monthly_expenses: parseFloat(profileData.financialDetails.monthlyExpenses) || null,
        current_savings: parseFloat(profileData.financialDetails.currentSavings) || null,
        monthly_debt_payments: parseFloat(profileData.financialDetails.monthlyDebtPayments) || null,
        risk_tolerance: profileData.financialDetails.riskTolerance,
        retirement_age: parseInt(profileData.goals.retirementAge) || null,
        emergency_fund_target: parseFloat(profileData.goals.emergencyFundTarget) || null,
        major_goals: profileData.goals.majorGoals
      };

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        setIsEditing(false);
        // Refresh Timeline data
        window.location.reload(); // Simple refresh for now
      } else {
        throw new Error('Failed to save profile');
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleLogout = () => {
    // Clear all stored data
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    localStorage.removeItem('advisorProfessionalDetails');
    localStorage.removeItem('advisorServiceModel');
    
    // Redirect to login
    window.location.href = '/';
  };

  const handleDeleteAccount = async () => {
    const token = localStorage.getItem('jwt');
    if (!token) return;

    setIsSaving(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Clear all data and redirect
        localStorage.clear();
        alert('Account deleted successfully');
        window.location.href = '/';
      } else {
        const error = await response.json();
        alert(`Failed to delete account: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Delete account error:', error);
      alert('Failed to delete account. Please try again.');
    } finally {
      setIsSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const renderPersonalDetails = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
        <input
          type="text"
          value={profileData.personalDetails.name}
          onChange={(e) => handleInputChange('personalDetails', 'name', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={profileData.personalDetails.email}
          onChange={(e) => handleInputChange('personalDetails', 'email', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
          <input
            type="number"
            value={profileData.personalDetails.age}
            onChange={(e) => handleInputChange('personalDetails', 'age', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Dependents</label>
          <input
            type="number"
            value={profileData.personalDetails.dependents}
            onChange={(e) => handleInputChange('personalDetails', 'dependents', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
        <input
          type="text"
          value={profileData.personalDetails.occupation}
          onChange={(e) => handleInputChange('personalDetails', 'occupation', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        />
      </div>
    </div>
  );

  const renderFinancialDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Income (KES)</label>
          <input
            type="number"
            value={profileData.financialDetails.monthlyIncome}
            onChange={(e) => handleInputChange('financialDetails', 'monthlyIncome', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Expenses (KES)</label>
          <input
            type="number"
            value={profileData.financialDetails.monthlyExpenses}
            onChange={(e) => handleInputChange('financialDetails', 'monthlyExpenses', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Current Savings (KES)</label>
          <input
            type="number"
            value={profileData.financialDetails.currentSavings}
            onChange={(e) => handleInputChange('financialDetails', 'currentSavings', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Debt Payments (KES)</label>
          <input
            type="number"
            value={profileData.financialDetails.monthlyDebtPayments}
            onChange={(e) => handleInputChange('financialDetails', 'monthlyDebtPayments', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Risk Tolerance</label>
        <select
          value={profileData.financialDetails.riskTolerance}
          onChange={(e) => handleInputChange('financialDetails', 'riskTolerance', e.target.value)}
          disabled={!isEditing}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
        >
          <option value="">Select risk tolerance</option>
          <option value="conservative">Conservative</option>
          <option value="moderate">Moderate</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>
    </div>
  );

  const renderGoals = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Target Retirement Age</label>
          <input
            type="number"
            value={profileData.goals.retirementAge}
            onChange={(e) => handleInputChange('goals', 'retirementAge', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Fund Target (KES)</label>
          <input
            type="number"
            value={profileData.goals.emergencyFundTarget}
            onChange={(e) => handleInputChange('goals', 'emergencyFundTarget', e.target.value)}
            disabled={!isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="timeline-profile flex flex-col bg-gray-50" style={{ height: 'calc(100vh - 4rem)' }}>
      
      {/* Header */}
      <div 
        className="profile-header p-6 shadow-sm border-b border-gray-200"
        style={{ backgroundColor: personaTheme?.secondary || '#f8fafc' }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Profile Settings</h1>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-600">
                {persona} Profile • Age {currentAge} • {currentPhase}
              </span>
              {alignmentScore && (
                <span 
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white"
                  style={{ backgroundColor: personaTheme?.primary }}
                >
                  {Math.round(alignmentScore)}% Aligned
                </span>
              )}
            </div>
          </div>

          {/* Edit Actions */}
          <div className="flex items-center space-x-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Logout
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={saveProfileData}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="profile-content flex-1 flex overflow-hidden">
        
        {/* Navigation */}
        <div className="profile-nav w-64 bg-white border-r border-gray-200 p-4">
          <nav className="space-y-1">
            {[
              { key: 'personal', label: 'Personal Details', icon: '👤' },
              { key: 'financial', label: 'Financial Details', icon: '💰' },
              { key: 'goals', label: 'Goals & Targets', icon: '🎯' }
            ].map((section) => (
              <button
                key={section.key}
                onClick={() => setActiveSection(section.key)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  activeSection === section.key 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{section.icon}</span>
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="profile-main flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-6">
            
            {/* Section Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">
                {activeSection === 'personal' && 'Personal Information'}
                {activeSection === 'financial' && 'Financial Information'}
                {activeSection === 'goals' && 'Goals & Targets'}
              </h2>
              <p className="text-gray-600 text-sm">
                {activeSection === 'personal' && 'Update your personal details and contact information.'}
                {activeSection === 'financial' && 'Manage your financial information for better Timeline insights.'}
                {activeSection === 'goals' && 'Set and update your financial goals and targets.'}
              </p>
            </div>

            {/* Form Content */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {activeSection === 'personal' && renderPersonalDetails()}
              {activeSection === 'financial' && renderFinancialDetails()}
              {activeSection === 'goals' && renderGoals()}
            </div>

            {/* Timeline Impact Notice */}
            {isEditing && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-3">
                  <div className="text-blue-600 mt-0.5">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-blue-800 mb-1">Timeline Impact</div>
                    <div className="text-sm text-blue-700">
                      Changes to your profile will update your Timeline milestones and alignment score. 
                      Your persona-specific recommendations will be refreshed after saving.
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Delete Account Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete your account? This action cannot be undone. 
                All your data, including profile information, financial data, and onboarding progress will be permanently removed.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isSaving}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineProfile;