import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config';
import MessageBox from './MessageBox';

/**
 * Dynamic Profile Component - Uses onboarding data instead of hardcoded values
 * Displays user information from the consolidated onboarding system
 */
const ProfileDynamic = () => {
    const [onboardingData, setOnboardingData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const navigate = useNavigate();

    const API_BASE = API_BASE_URL;

    useEffect(() => {
        fetchOnboardingData();
    }, []);

    const fetchOnboardingData = async () => {
        try {
            setLoading(true);
            const jwt = localStorage.getItem('jwt');
            if (!jwt) {
                navigate('/auth');
                return;
            }

            const response = await fetch(`${API_BASE}/api/v1/onboarding/state`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('jwt');
                    navigate('/auth');
                    return;
                }
                throw new Error('Failed to fetch profile data');
            }

            const data = await response.json();
            setOnboardingData(data);
        } catch (error) {
            console.error('Error fetching onboarding data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

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

    const calculateRiskScore = (questionnaire) => {
        if (!questionnaire || questionnaire.length !== 5) return null;
        const total = questionnaire.reduce((sum, answer) => sum + answer, 0);
        return Math.round((total / 20) * 100); // Convert to percentage
    };

    const getRiskLevel = (riskScore) => {
        if (riskScore === null) return 'Not assessed';
        if (riskScore <= 25) return 'Conservative';
        if (riskScore <= 50) return 'Moderate';
        if (riskScore <= 75) return 'Balanced';
        return 'Aggressive';
    };

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
                    onClick={fetchOnboardingData}
                >
                    Retry
                </button>
            </div>
        );
    }

    const personal = onboardingData?.personal_data || {};
    const risk = onboardingData?.risk_data || {};
    const financial = onboardingData?.financial_data || {};
    const goals = onboardingData?.goals_data || {};
    const preferences = onboardingData?.preferences_data || {};
    
    const riskScore = calculateRiskScore(risk.questionnaire);
    const riskLevel = getRiskLevel(riskScore);

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>

                {/* Completion Status */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Onboarding Status</h2>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-gray-700">
                                <strong>Current Step:</strong> {onboardingData?.current_step || 1} of 5
                            </p>
                            <p className="text-gray-700">
                                <strong>Completed Steps:</strong> {onboardingData?.completed_steps?.join(', ') || 'None'}
                            </p>
                            <p className="text-gray-700">
                                <strong>Status:</strong> 
                                <span className={`ml-2 px-2 py-1 rounded text-sm ${
                                    onboardingData?.is_complete 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {onboardingData?.is_complete ? 'Complete' : 'In Progress'}
                                </span>
                            </p>
                        </div>
                        {!onboardingData?.is_complete && (
                            <button
                                onClick={() => navigate('/onboarding')}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                            >
                                Continue Onboarding
                            </button>
                        )}
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
                        <p><strong>Questionnaire:</strong> {risk.questionnaire?.length === 5 ? 'Completed' : 'Not completed'}</p>
                        {risk.questionnaire?.length === 5 && (
                            <p><strong>Responses:</strong> [{risk.questionnaire.join(', ')}]</p>
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
                        <p><strong>Monthly Income:</strong> {formatCurrency(financial.monthlyIncome)}</p>
                        <p><strong>Income Frequency:</strong> {financial.incomeFrequency || 'Not specified'}</p>
                        
                        <div className="mt-4">
                            <p className="font-semibold mb-2">Monthly Expenses:</p>
                            <div className="ml-4 space-y-1">
                                <p>Rent: {formatCurrency(financial.rent)}</p>
                                <p>Utilities: {formatCurrency(financial.utilities)}</p>
                                <p>Groceries: {formatCurrency(financial.groceries)}</p>
                                <p>Transport: {formatCurrency(financial.transport)}</p>
                                <p>Loan Repayments: {formatCurrency(financial.loanRepayments)}</p>
                                
                                {/* Custom expenses */}
                                {financial.customExpenses?.length > 0 && (
                                    <div>
                                        <p className="font-semibold mt-2">Additional Expenses:</p>
                                        {financial.customExpenses.map((expense, index) => (
                                            <p key={index} className="ml-2">
                                                {expense.name}: {formatCurrency(expense.amount)}
                                            </p>
                                        ))}
                                    </div>
                                )}
                                
                                {/* Calculate total expenses - matching Budget calculation */}
                                {financial.monthlyIncome && (
                                    <div className="border-t pt-2 mt-2">
                                        {(() => {
                                            // Calculate total expenses to match Budget component calculation
                                            const coreExpenses = (parseFloat(financial.rent) || 0) +
                                                                (parseFloat(financial.utilities) || 0) +
                                                                (parseFloat(financial.groceries) || 0) +
                                                                (parseFloat(financial.transport) || 0) +
                                                                (parseFloat(financial.loanRepayments) || 0);
                                            
                                            const customExpensesTotal = financial.customExpenses?.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0) || 0;
                                            
                                            // Add custom expenses to miscellaneous category to match Budget structure
                                            const totalExpenses = coreExpenses + customExpensesTotal;
                                            
                                            const monthlyIncome = parseFloat(financial.monthlyIncome) || 0;
                                            const availableAfterExpenses = monthlyIncome - totalExpenses;
                                            
                                            return (
                                                <>
                                                    <p className="font-semibold">
                                                        Total Monthly Expenses: {formatCurrency(totalExpenses)}
                                                    </p>
                                                    <p className="font-semibold">
                                                        Monthly Income (Net): {formatCurrency(monthlyIncome)}
                                                    </p>
                                                    <p className={`font-semibold ${availableAfterExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                        Available After Expenses: {formatCurrency(availableAfterExpenses)}
                                                    </p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Goals */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Goals</h2>
                    <div className="text-gray-700">
                        {Object.keys(goals).length > 0 ? (
                            <div className="space-y-2">
                                {goals.emergencyFund && <p><strong>Emergency Fund:</strong> {formatCurrency(goals.emergencyFund)}</p>}
                                {goals.homeDownPayment && <p><strong>Home Down Payment:</strong> {formatCurrency(goals.homeDownPayment)}</p>}
                                {goals.education && <p><strong>Education:</strong> {formatCurrency(goals.education)}</p>}
                                {goals.retirement && <p><strong>Retirement:</strong> {formatCurrency(goals.retirement)}</p>}
                                {goals.investment && <p><strong>Investment:</strong> {formatCurrency(goals.investment)}</p>}
                                {goals.other && <p><strong>Other:</strong> {goals.other}</p>}
                            </div>
                        ) : (
                            <p className="text-gray-500">No goals set yet</p>
                        )}
                    </div>
                </div>

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
                            onClick={fetchOnboardingData}
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