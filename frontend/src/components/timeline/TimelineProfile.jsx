/**
 * Timeline Profile - Profile management with Timeline context integration
 * Replaces the traditional Profile.js with Timeline-first approach
 */
import React, { useState, useEffect } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';

const TimelineProfile = () => {
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

  // Load profile data
  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/profile/timeline-data`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.profile) {
          setProfileData({
            personalDetails: {
              name: data.profile.name || '',
              email: data.profile.email || '',
              age: data.profile.age?.toString() || '',
              occupation: data.profile.occupation || '',
              dependents: data.profile.dependents?.toString() || ''
            },
            financialDetails: {
              monthlyIncome: data.profile.monthly_income?.toString() || '',
              monthlyExpenses: data.profile.monthly_expenses?.toString() || '',
              currentSavings: data.profile.current_savings?.toString() || '',
              monthlyDebtPayments: data.profile.monthly_debt_payments?.toString() || '',
              riskTolerance: data.profile.risk_tolerance || ''
            },
            goals: {
              retirementAge: data.profile.retirement_age?.toString() || '',
              emergencyFundTarget: data.profile.emergency_fund_target?.toString() || '',
              majorGoals: data.profile.major_goals || []
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to load profile data:', error);
    }
  };

  const saveProfileData = async () => {
    const token = localStorage.getItem('authToken');
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

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/profile/update`, {
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
    <div className="timeline-profile h-screen flex flex-col bg-gray-50">
      
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
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
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
    </div>
  );
};

export default TimelineProfile;