import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';
import { useUnifiedFinancialContext } from '../contexts/TransactionContext';

/**
 * Dynamic Profile Component - Uses onboarding data instead of hardcoded values
 * Displays user information from the consolidated onboarding system
 */
const ProfileDynamic = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const navigate = useNavigate();
    const {
      profile,
      fetchProfile,
      selectRiskProfile,
      selectNetCashFlow,
      selectBudgetSummary,
      fetchAllFinancialData,
      applyBaselineToBudget
    } = useUnifiedFinancialContext();

    useEffect(() => {
        const init = async () => {
          try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) {
              navigate('/auth');
              return;
            }
            await Promise.all([fetchProfile(), fetchAllFinancialData()]);
            setError(null);
          } catch (e) {
            setError('Failed to load profile');
          } finally {
            setLoading(false);
          }
        };
        init();
    }, [fetchProfile, fetchAllFinancialData, navigate]);

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        setMessage('Logged out successfully');
        setShowMessageBox(true);
        setTimeout(() => navigate('/auth'), 1000);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const calculateAge = (dateOfBirth) => {
        if (!dateOfBirth) return 'Not provided';
        const birthDate = new Date(dateOfBirth);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const risk = selectRiskProfile();

    const personal = {
      firstName: profile?.first_name || '',
      lastName: profile?.last_name || '',
      dateOfBirth: profile?.date_of_birth || null,
      phone: profile?.phone || '',
      nationalId: profile?.national_id || '',
      kraPin: profile?.kra_pin || '',
      employmentStatus: profile?.employment_status || '',
      dependents: profile?.dependents ?? null,
    };

    const preferences = profile?.preferences || {};

    const formatCurrency = (amount) => {
        if (!amount) return 'Not specified';
        return `KES ${parseFloat(amount).toLocaleString()}`;
    };

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
                <div className="text-lg text-gray-600">Loading your profile...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
                <div className="text-lg text-red-600">Failed to load profile: {error}</div>
                <button 
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                    onClick={() => { setLoading(true); Promise.all([fetchProfile(), fetchAllFinancialData()]).finally(() => setLoading(false)); }}
                >
                    Retry
                </button>
            </div>
        );
    }

    const riskScore = risk?.score;
    const riskLevel = risk?.level;
    const budget = selectBudgetSummary();
    const netCash = selectNetCashFlow();

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>

                {/* Profile Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Summary</h2>
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700">
                      <p><strong>Name:</strong> {(profile?.first_name || '') + ' ' + (profile?.last_name || '')}</p>
                      <p><strong>Date of Birth:</strong> {profile?.date_of_birth || 'Not provided'}</p>
                      <p><strong>Age:</strong> {profile?.age ?? 'Not provided'}</p>
                      <p><strong>Employment:</strong> {profile?.employment_status || 'Not specified'}</p>
                      <p><strong>Dependents:</strong> {profile?.dependents ?? 'Not specified'}</p>
                    </div>
                    <button
                      onClick={() => navigate('/onboarding')}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Edit Profile Data
                    </button>
                  </div>
                </div>

                {/* Personal Information */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                    <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                        <div>
                            <p><strong>Name:</strong> {personal.firstName || 'Not provided'} {personal.lastName || ''}</p>
                            <p><strong>Date of Birth:</strong> {personal.dateOfBirth || 'Not provided'}</p>
                            <p><strong>Age:</strong> {calculateAge(personal.dateOfBirth)}</p>
                            <p><strong>Phone:</strong> {personal.phone || 'Not provided'}</p>
                        </div>
                        <div>
                            <p><strong>National ID:</strong> {personal.nationalId || 'Not provided'}</p>
                            <p><strong>KRA PIN:</strong> {personal.kraPin || 'Not provided'}</p>
                            <p><strong>Employment:</strong> {personal.employmentStatus || 'Not specified'}</p>
                            <p><strong>Dependents:</strong> {personal.dependents !== undefined ? personal.dependents : 'Not specified'}</p>
                        </div>
                    </div>
                </div>

                {/* Risk Assessment */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk Profile</h2>
                    <div className="text-gray-700">
                        <p><strong>Risk Score:</strong> <span className="font-bold text-blue-600">{riskScore !== null ? `${riskScore}%` : 'Not assessed'}</span></p>
                        <p><strong>Risk Level:</strong> <span className="font-bold text-blue-600">{riskLevel}</span></p>
                        <p><strong>Questionnaire:</strong> {Array.isArray(profile?.questionnaire) ? 'Completed' : 'Not completed'}</p>
                        {Array.isArray(profile?.questionnaire) && (
                            <p><strong>Responses:</strong> [{profile.questionnaire.join(', ')}]</p>
                        )}
                    </div>
                    <button 
                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors mt-4" 
                        onClick={() => navigate('/retake-risk-assessment')}
                    >
                        Retake Risk Assessment
                    </button>
                </div>

                {/* Financial Information */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Information</h2>
                    <div className="text-gray-700">
                        <p><strong>Monthly Income:</strong> {formatCurrency(profile?.monthly_income)}</p>
                        <div className="mt-4">
                          <p className="font-semibold mb-2">Monthly Totals (from Budget)</p>
                          <div className="ml-4 space-y-1">
                            <p>Total Expenses: {formatCurrency(budget?.total_spent || 0)}</p>
                            <p>Remaining: {formatCurrency(budget?.remaining_budget || 0)}</p>
                            <p className={`${(netCash || 0) >= 0 ? 'text-green-600' : 'text-red-600'} font-semibold`}>
                              Net Cash Flow: {formatCurrency(netCash || 0)}
                            </p>
                          </div>
                          <div className="mt-4">
                            <button
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                              onClick={async () => {
                                try {
                                  setLoading(true);
                                  await applyBaselineToBudget();
                                  setMessage('Baseline applied to Budget');
                                  setShowMessageBox(true);
                                  await fetchAllFinancialData();
                                } catch (e) {
                                  setError('Failed to apply baseline');
                                } finally {
                                  setLoading(false);
                                }
                              }}
                              data-testid="apply-baseline-button"
                            >
                              Apply Baseline to Budget
                            </button>
                          </div>
                        </div>
                    </div>
                </div>

                {/* Goals (basic placeholders; full goals managed elsewhere) */}
                {profile?.emergency_fund_target && (
                  <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Goals</h2>
                    <div className="text-gray-700">
                      <p><strong>Emergency Fund Target:</strong> {formatCurrency(profile.emergency_fund_target)}</p>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Preferences</h2>
                    <div className="text-gray-700">
                        <p><strong>Notifications:</strong> {preferences.notifications !== undefined ? (preferences.notifications ? 'Enabled' : 'Disabled') : 'Not set'}</p>
                        <p><strong>Data Sharing:</strong> {preferences.dataSharing !== undefined ? (preferences.dataSharing ? 'Enabled' : 'Disabled') : 'Not set'}</p>
                        <p><strong>Marketing Emails:</strong> {preferences.marketingEmails !== undefined ? (preferences.marketingEmails ? 'Enabled' : 'Disabled') : 'Not set'}</p>
                        <p><strong>Newsletter:</strong> {preferences.newsletterSubscription !== undefined ? (preferences.newsletterSubscription ? 'Enabled' : 'Disabled') : 'Not set'}</p>
                    </div>
                </div>

                {/* Account Actions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Actions</h2>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                            onClick={() => navigate('/onboarding')}
                        >
                            Edit Profile Data
                        </button>
                        <button 
                            className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                            onClick={() => { setLoading(true); fetchProfile().finally(() => setLoading(false)); }}
                        >
                            Refresh Data
                        </button>
                        <button 
                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </main>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default ProfileDynamic;
