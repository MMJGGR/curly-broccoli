import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';
import { useUnifiedFinancialContext } from '../contexts/TransactionContext';
import ProfileHealth from './profile/ProfileHealth';
import ProfileHighlights from './profile/ProfileHighlights';
import ProfileEditPersonal from './profile/ProfileEditPersonal';
import ProfileEditEmployment from './profile/ProfileEditEmployment';
import ProfilePreferences from './profile/ProfilePreferences';
import ProfileBudgetPreferences from './profile/ProfileBudgetPreferences';
import ProfilePlanningAssumptions from './profile/ProfilePlanningAssumptions';
import ProfileActions from './profile/ProfileActions';
import RecommendedAllocation from './profile/RecommendedAllocation';
import ProfileIncomeQuickAdd from './profile/ProfileIncomeQuickAdd';
import { useUnifiedFinancialContext as useUFC } from '../contexts/TransactionContext';
import PageHeader from './ui/PageHeader';

// Compact goals overview used in Profile
const GoalsMiniOverview = () => {
  const { goals = [], loading, fetchAllFinancialData } = useUFC();
  useEffect(() => {
    if ((Array.isArray(goals) ? goals.length : 0) === 0) {
      fetchAllFinancialData().catch(() => {});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = Array.isArray(goals) ? goals : (goals?.goals || []);
  if (loading?.goals || loading?.global) return null;
  if (!list || list.length === 0) return null;

  const progressPct = (g) => {
    const t = parseFloat(g.target_amount || g.target || 0) || 0;
    const c = parseFloat(g.current_amount || g.current || 0) || 0;
    if (!t) return 0;
    return Math.min(100, (c / t) * 100);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-semibold text-gray-800">Financial Goals</h2>
        <a href="/app/tools?section=goals" className="text-blue-600 hover:text-blue-800 text-sm">Manage Goals →</a>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {list.slice(0, 3).map((g) => (
          <div key={g.id || g.name} className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-800 truncate" title={g.name}>{g.name}</p>
              {g.is_achieved && (
                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Achieved</span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progressPct(g).toFixed(1)}%` }} />
            </div>
            <div className="text-xs text-gray-600">
              <span>{progressPct(g).toFixed(1)}% complete</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
      applyBaselineToBudget,
      planningStartDate,
      setPlanningStartDate
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
      maritalStatus: profile?.marital_status || '',
      phone: profile?.phone || '',
      nationalId: profile?.national_id || '',
      kraPin: profile?.kra_pin || '',
      employmentStatus: profile?.employment_status || '',
      dependents: profile?.dependents ?? null,
    };

    // Preferences are presented/edited in child components; no local var needed

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
            <PageHeader title="Profile" description="Personal info, preferences, planning and income" />
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>

                {/* Profile Health and Highlights */}
                <ProfileHealth />
                <ProfileHighlights />

                {/* Profile Summary */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Summary</h2>
                  <div className="flex items-center justify-between">
                    <div className="text-gray-700">
                      <p><strong>Name:</strong> {(profile?.first_name || '') + ' ' + (profile?.last_name || '')}</p>
                      <p><strong>Date of Birth:</strong> {profile?.date_of_birth || 'Not provided'}</p>
                      <p><strong>Age:</strong> {profile?.age ?? 'Not provided'}</p>
                      <p><strong>Employment:</strong> {profile?.employment_status || 'Not specified'}</p>
                      <p><strong>Marital Status:</strong> {profile?.marital_status || 'Not specified'}</p>
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

                {/* Personal Snapshot (avoid duplicating with editable section below) */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Snapshot</h2>
                    <div className="grid md:grid-cols-3 gap-4 text-gray-700">
                        <div>
                            <p><strong>Name:</strong> {personal.firstName || 'Not provided'} {personal.lastName || ''}</p>
                            <p><strong>Age:</strong> {calculateAge(personal.dateOfBirth)}</p>
                        </div>
                        <div>
                            <p><strong>Employment:</strong> {personal.employmentStatus || 'Not specified'}</p>
                            <p><strong>Marital:</strong> {personal.maritalStatus || 'Not specified'}</p>
                            <p><strong>Dependents:</strong> {personal.dependents !== undefined ? personal.dependents : 'Not specified'}</p>
                        </div>
                        <div className="flex items-start md:items-center">
                            <button 
                                className="mt-2 md:mt-0 inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                                onClick={() => {
                                  const el = document.getElementById('edit-personal-section');
                                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                            >
                                Edit Personal Info
                            </button>
                        </div>
                    </div>
                </div>

                {/* Planning Settings (CR025 — planning start supports historical) */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">Planning Settings</h2>
                  <div className="text-gray-700">
                    <label className="block text-sm text-gray-600 mb-1">Planning Start Month</label>
                    <input
                      type="month"
                      value={(planningStartDate || '').slice(0,7)}
                      onChange={(e) => setPlanningStartDate(e.target.value)}
                      className="border rounded-lg px-3 py-2"
                      data-testid="planning-start-month"
                    />
                    <p className="text-xs text-gray-500 mt-1">Base month for schedules and timeline labels (e.g., 2020-01).</p>
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

                {/* Recommended Allocation from profile-v2 insights */}
                {profile?.recommended_asset_allocation && (
                  <RecommendedAllocation allocation={profile.recommended_asset_allocation} />
                )}

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

                {/* Quick add income (CR019 parity in Profile) */}
                <ProfileIncomeQuickAdd />

                {/* Goals Overview (reads from unified context goals) */}
                <GoalsMiniOverview />

                {/* Editable Sections */}
                <div id="edit-personal-section">
                  <ProfileEditPersonal />
                </div>
                <ProfileEditEmployment />
                <ProfilePreferences />
                <ProfileBudgetPreferences />
                <ProfilePlanningAssumptions />

                {/* Account Actions */}
                <ProfileActions />
            </main>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default ProfileDynamic;
