import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { api } from '../../api';

const EnhancedProfile = () => {
  const {
    accounts,
    fetchAccounts
  } = useTransactions();

  const [userProfile, setUserProfile] = useState(null);
  const [onboardingData, setOnboardingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        
        // Load profile data from clean endpoints
        const [profileResponse, onboardingResponse] = await Promise.all([
          api.get('/api/v1/timeline/journey'),
          api.get('/api/v1/onboarding-v2-clean/state')
        ]);
        
        setUserProfile(profileResponse.data);
        setOnboardingData(onboardingResponse.data);
        
        // Load financial data
        await fetchAccounts();
        
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [fetchAccounts]);

  const handleEditSection = (section) => {
    setEditingSection(section);
    
    if (section === 'personal') {
      setEditFormData({
        firstName: userProfile.basic_info?.first_name || '',
        lastName: userProfile.basic_info?.last_name || '',
        email: userProfile.basic_info?.email || '',
        age: userProfile.basic_info?.age || '',
        employment_status: userProfile.basic_info?.employment_status || '',
        dependents: userProfile.basic_info?.dependents || 0
      });
    } else if (section === 'financial') {
      setEditFormData({
        annual_income: userProfile.financial_snapshot?.annual_income || 0,
        risk_level: userProfile.financial_snapshot?.risk_level || ''
      });
    }
  };

  const handleSaveSection = async (section) => {
    try {
      if (section === 'personal') {
        // Update profile via timeline impact endpoint
        await api.put('/api/v1/profile-v2/', {
          first_name: editFormData.firstName,
          last_name: editFormData.lastName,
          employment_status: editFormData.employment_status,
          dependents: parseInt(editFormData.dependents) || 0
        });
      } else if (section === 'financial') {
        await api.put('/api/v1/profile-v2/', {
          annual_income: parseFloat(editFormData.annual_income) || 0
        });
      }
      
      // Reload profile data
      const profileResponse = await api.get('/api/v1/timeline/journey');
      setUserProfile(profileResponse.data);
      
      setEditingSection(null);
      setEditFormData({});
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to update profile');
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'KES 0';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPersonaIcon = (persona) => {
    switch (persona) {
      case 'Jamal': return '👨‍💻';
      case 'Aisha': return '👩‍👧‍👦';
      case 'Samuel': return '👨‍💼';
      default: return '👤';
    }
  };

  const getPersonaDescription = (persona) => {
    switch (persona) {
      case 'Jamal': return 'Early-Career Accumulator';
      case 'Aisha': return 'Family & Property Owner';
      case 'Samuel': return 'Pre-Retirement Consolidation';
      default: return 'General Profile';
    }
  };

  if (loading) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"text-center\">
          <div className=\"animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4\"></div>
          <p className=\"text-gray-600\">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"bg-white p-8 rounded-lg shadow-sm max-w-md w-full text-center\">
          <div className=\"text-red-500 text-6xl mb-4\">⚠️</div>
          <h2 className=\"text-xl font-semibold text-gray-900 mb-2\">Profile Error</h2>
          <p className=\"text-gray-600 mb-6\">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg\"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <div className=\"max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {/* Header */}
        <div className=\"mb-8\">
          <div className=\"flex items-center justify-between\">
            <div>
              <h1 className=\"text-3xl font-bold text-gray-900\">
                {userProfile?.user_info?.name || 'Your Profile'}
              </h1>
              <p className=\"text-gray-600 mt-2\">Manage your personal and financial information</p>
            </div>
            
            {/* Persona Badge */}
            {userProfile?.persona && (
              <div className=\"bg-blue-50 border border-blue-200 rounded-lg px-4 py-2\">
                <div className=\"flex items-center\">
                  <span className=\"text-2xl mr-2\">{getPersonaIcon(userProfile.persona)}</span>
                  <div>
                    <div className=\"text-sm font-medium text-blue-900\">{userProfile.persona}</div>
                    <div className=\"text-xs text-blue-700\">{getPersonaDescription(userProfile.persona)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Completion Status */}
        <div className=\"bg-white rounded-lg shadow-sm border mb-8 p-6\">
          <h2 className=\"text-lg font-medium text-gray-900 mb-4\">Profile Completion</h2>
          <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4\">
            <div className=\"flex items-center\">
              <div className={`w-4 h-4 rounded-full mr-3 ${userProfile?.completion_status?.profile_complete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className=\"text-sm text-gray-700\">Personal Info</span>
            </div>
            <div className=\"flex items-center\">
              <div className={`w-4 h-4 rounded-full mr-3 ${userProfile?.completion_status?.financial_complete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className=\"text-sm text-gray-700\">Financial Data</span>
            </div>
            <div className=\"flex items-center\">
              <div className={`w-4 h-4 rounded-full mr-3 ${userProfile?.completion_status?.goals_complete ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className=\"text-sm text-gray-700\">Goals Set</span>
            </div>
            <div className=\"flex items-center\">
              <div className={`w-4 h-4 rounded-full mr-3 ${userProfile?.completion_status?.ready_for_timeline ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <span className=\"text-sm text-gray-700\">Timeline Ready</span>
            </div>
          </div>
        </div>

        <div className=\"space-y-8\">
          {/* Personal Information */}
          <div className=\"bg-white rounded-lg shadow-sm border\">
            <div className=\"px-6 py-4 border-b border-gray-200 flex justify-between items-center\">
              <h2 className=\"text-lg font-medium text-gray-900\">Personal Information</h2>
              <button
                onClick={() => handleEditSection('personal')}
                className=\"text-blue-600 hover:text-blue-800 text-sm font-medium\"
              >
                {editingSection === 'personal' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            <div className=\"p-6\">
              {editingSection === 'personal' ? (
                <div className=\"space-y-4\">
                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                    <div>
                      <label className=\"block text-sm font-medium text-gray-700 mb-2\">First Name</label>
                      <input
                        type=\"text\"
                        value={editFormData.firstName || ''}
                        onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                        className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                      />
                    </div>
                    <div>
                      <label className=\"block text-sm font-medium text-gray-700 mb-2\">Last Name</label>
                      <input
                        type=\"text\"
                        value={editFormData.lastName || ''}
                        onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                        className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                      />
                    </div>
                  </div>
                  
                  <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                    <div>
                      <label className=\"block text-sm font-medium text-gray-700 mb-2\">Employment Status</label>
                      <select
                        value={editFormData.employment_status || ''}
                        onChange={(e) => setEditFormData({...editFormData, employment_status: e.target.value})}
                        className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                      >
                        <option value=\"Employed\">Employed</option>
                        <option value=\"Self-employed\">Self-employed</option>
                        <option value=\"Unemployed\">Unemployed</option>
                        <option value=\"Student\">Student</option>
                        <option value=\"Retired\">Retired</option>
                      </select>
                    </div>
                    <div>
                      <label className=\"block text-sm font-medium text-gray-700 mb-2\">Dependents</label>
                      <input
                        type=\"number\"
                        min=\"0\"
                        value={editFormData.dependents || 0}
                        onChange={(e) => setEditFormData({...editFormData, dependents: e.target.value})}
                        className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                      />
                    </div>
                  </div>
                  
                  <div className=\"flex space-x-3 pt-4\">
                    <button
                      onClick={() => handleSaveSection('personal')}
                      className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg\"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
                      className=\"bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg\"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Full Name</h3>
                    <p className=\"text-lg text-gray-900\">
                      {userProfile?.basic_info?.first_name} {userProfile?.basic_info?.last_name}
                    </p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Email</h3>
                    <p className=\"text-lg text-gray-900\">{userProfile?.basic_info?.email}</p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Age</h3>
                    <p className=\"text-lg text-gray-900\">{userProfile?.basic_info?.age} years old</p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Employment Status</h3>
                    <p className=\"text-lg text-gray-900\">{userProfile?.basic_info?.employment_status}</p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Dependents</h3>
                    <p className=\"text-lg text-gray-900\">{userProfile?.basic_info?.dependents || 0}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Financial Snapshot */}
          <div className=\"bg-white rounded-lg shadow-sm border\">
            <div className=\"px-6 py-4 border-b border-gray-200 flex justify-between items-center\">
              <h2 className=\"text-lg font-medium text-gray-900\">Financial Overview</h2>
              <button
                onClick={() => handleEditSection('financial')}
                className=\"text-blue-600 hover:text-blue-800 text-sm font-medium\"
              >
                {editingSection === 'financial' ? 'Cancel' : 'Edit'}
              </button>
            </div>
            
            <div className=\"p-6\">
              {editingSection === 'financial' ? (
                <div className=\"space-y-4\">
                  <div>
                    <label className=\"block text-sm font-medium text-gray-700 mb-2\">Annual Income (KES)</label>
                    <input
                      type=\"number\"
                      min=\"0\"
                      value={editFormData.annual_income || ''}
                      onChange={(e) => setEditFormData({...editFormData, annual_income: e.target.value})}
                      className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                    />
                  </div>
                  
                  <div className=\"flex space-x-3 pt-4\">
                    <button
                      onClick={() => handleSaveSection('financial')}
                      className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg\"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
                      className=\"bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg\"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Annual Income</h3>
                    <p className=\"text-xl font-semibold text-green-600\">
                      {formatCurrency(userProfile?.financial_snapshot?.annual_income)}
                    </p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Risk Level</h3>
                    <p className=\"text-lg text-gray-900\">{userProfile?.financial_snapshot?.risk_level}</p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Risk Score</h3>
                    <p className=\"text-lg text-gray-900\">{userProfile?.financial_snapshot?.risk_score}/100</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Account Summary */}
          {accounts.length > 0 && (
            <div className=\"bg-white rounded-lg shadow-sm border\">
              <div className=\"px-6 py-4 border-b border-gray-200\">
                <h2 className=\"text-lg font-medium text-gray-900\">Account Summary</h2>
              </div>
              <div className=\"p-6\">
                <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6 mb-4\">
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Total Accounts</h3>
                    <p className=\"text-xl font-semibold text-blue-600\">{accounts.length}</p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Total Balance</h3>
                    <p className=\"text-xl font-semibold text-green-600\">
                      {formatCurrency(accounts.reduce((sum, acc) => sum + (acc.balance || 0), 0))}
                    </p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Active Accounts</h3>
                    <p className=\"text-xl font-semibold text-purple-600\">
                      {accounts.filter(acc => acc.is_active !== false).length}
                    </p>
                  </div>
                </div>
                
                <div className=\"space-y-3\">
                  {accounts.slice(0, 3).map((account) => (
                    <div key={account.id} className=\"flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0\">
                      <div>
                        <p className=\"font-medium text-gray-900\">{account.name}</p>
                        <p className=\"text-sm text-gray-500 capitalize\">{account.type} • {account.institution_name}</p>
                      </div>
                      <p className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                  ))}
                </div>
                
                {accounts.length > 3 && (
                  <p className=\"text-sm text-gray-500 mt-3\">
                    and {accounts.length - 3} more accounts...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Budget Categories Summary */}
          {budgetCategories.length > 0 && (
            <div className=\"bg-white rounded-lg shadow-sm border\">
              <div className=\"px-6 py-4 border-b border-gray-200\">
                <h2 className=\"text-lg font-medium text-gray-900\">Budget Overview</h2>
              </div>
              <div className=\"p-6\">
                <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6 mb-4\">
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Total Budget</h3>
                    <p className=\"text-xl font-semibold text-blue-600\">
                      {formatCurrency(budgetCategories.reduce((sum, cat) => sum + (cat.budgeted_amount || 0), 0))}
                    </p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Total Spent</h3>
                    <p className=\"text-xl font-semibold text-orange-600\">
                      {formatCurrency(budgetCategories.reduce((sum, cat) => sum + (cat.actual_amount || 0), 0))}
                    </p>
                  </div>
                  <div>
                    <h3 className=\"text-sm font-medium text-gray-500 mb-1\">Budget Categories</h3>
                    <p className=\"text-xl font-semibold text-purple-600\">{budgetCategories.length}</p>
                  </div>
                </div>
                
                <div className=\"space-y-3\">
                  {budgetCategories.slice(0, 5).map((category) => {
                    const utilization = category.budgeted_amount > 0 
                      ? (category.actual_amount / category.budgeted_amount) * 100 
                      : 0;
                    
                    return (
                      <div key={category.id} className=\"flex justify-between items-center py-2\">
                        <div className=\"flex-1\">
                          <p className=\"font-medium text-gray-900\">{category.name}</p>
                          <div className=\"w-full bg-gray-200 rounded-full h-2 mt-1\">
                            <div 
                              className={`h-2 rounded-full ${utilization > 100 ? 'bg-red-500' : utilization > 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                              style={{ width: `${Math.min(utilization, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className=\"ml-4 text-right\">
                          <p className=\"font-semibold text-gray-900\">
                            {formatCurrency(category.actual_amount)} / {formatCurrency(category.budgeted_amount)}
                          </p>
                          <p className=\"text-xs text-gray-500\">{utilization.toFixed(0)}% used</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Persona Insights */}
          {userProfile?.persona_insights && (
            <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-6\">
              <h2 className=\"text-lg font-medium text-blue-900 mb-4\">
                {getPersonaIcon(userProfile.persona)} Personalized Insights
              </h2>
              <div className=\"space-y-4\">
                <div>
                  <h3 className=\"text-sm font-medium text-blue-800 mb-1\">Focus Area</h3>
                  <p className=\"text-blue-700\">{userProfile.persona_insights.focus}</p>
                </div>
                <div>
                  <h3 className=\"text-sm font-medium text-blue-800 mb-1\">Key Priorities</h3>
                  <ul className=\"list-disc list-inside space-y-1\">
                    {userProfile.persona_insights.priorities?.map((priority, index) => (
                      <li key={index} className=\"text-blue-700\">{priority}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className=\"text-sm font-medium text-blue-800 mb-1\">Recommended Timeline</h3>
                  <p className=\"text-blue-700\">{userProfile.persona_insights.timeline_span}</p>
                </div>
                <div className=\"bg-blue-100 rounded-lg p-3\">
                  <h3 className=\"text-sm font-medium text-blue-800 mb-1\">Key Advice</h3>
                  <p className=\"text-blue-700 font-medium\">{userProfile.persona_insights.key_advice}</p>
                </div>
              </div>
            </div>
          )}

          {/* Onboarding Data Status */}
          {onboardingData && (
            <div className=\"bg-gray-50 border border-gray-200 rounded-lg p-6\">
              <h2 className=\"text-lg font-medium text-gray-900 mb-4\">Onboarding Status</h2>
              <div className=\"grid grid-cols-2 md:grid-cols-5 gap-4\">
                <div className=\"text-center\">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${onboardingData.has_personal_data ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {onboardingData.has_personal_data ? '✓' : '○'}
                  </div>
                  <p className=\"text-xs text-gray-600\">Personal</p>
                </div>
                <div className=\"text-center\">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${onboardingData.has_risk_data ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {onboardingData.has_risk_data ? '✓' : '○'}
                  </div>
                  <p className=\"text-xs text-gray-600\">Risk</p>
                </div>
                <div className=\"text-center\">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${onboardingData.has_financial_data ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {onboardingData.has_financial_data ? '✓' : '○'}
                  </div>
                  <p className=\"text-xs text-gray-600\">Financial</p>
                </div>
                <div className=\"text-center\">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${onboardingData.has_goals_data ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {onboardingData.has_goals_data ? '✓' : '○'}
                  </div>
                  <p className=\"text-xs text-gray-600\">Goals</p>
                </div>
                <div className=\"text-center\">
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${onboardingData.has_preferences_data ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                    {onboardingData.has_preferences_data ? '✓' : '○'}
                  </div>
                  <p className=\"text-xs text-gray-600\">Preferences</p>
                </div>
              </div>
              
              <div className=\"mt-4 text-center\">
                <p className=\"text-sm text-gray-600\">
                  Onboarding Status: <span className={`font-medium ${onboardingData.is_complete ? 'text-green-600' : 'text-orange-600'}`}>
                    {onboardingData.is_complete ? 'Complete' : 'In Progress'}
                  </span>
                </p>
                {onboardingData.completed_steps && (
                  <p className=\"text-xs text-gray-500 mt-1\">
                    Completed Steps: {onboardingData.completed_steps.join(', ')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedProfile;
