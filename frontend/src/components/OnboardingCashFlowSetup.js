// TODO: Persist income and expenses via createIncome/Expense APIs (Epic 1 Stories 3-5, ~80% completion)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';
import { useOnboarding } from '../contexts/OnboardingContext';

const OnboardingCashFlowSetup = () => {
    const { updateProfile, updateCashFlow } = useOnboarding();
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cashFlowData, setCashFlowData] = useState({
        monthlyIncome: '',
        incomeFrequency: 'Monthly',
        rent: '',
        utilities: '',
        groceries: '',
        transport: '',
        loanRepayments: ''
    });
    const navigate = useNavigate();

    const showActionMessage = (actionName) => {
        setMessage('Initiating ' + actionName + '... (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const handleInputChange = (field, value) => {
        setCashFlowData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNext = async () => {
        if (isSubmitting) {
            console.log('🔍 Already submitting, ignoring duplicate click');
            return;
        }
        
        setIsSubmitting(true);
        setMessage('Updating your profile...');
        setShowMessageBox(true);
        
        try {
            // Save cash flow data to context first
            console.log('Saving cash flow data:', cashFlowData);
            updateCashFlow(cashFlowData);
            
            console.log('Calling updateProfile...');
            const result = await updateProfile();
            console.log('updateProfile result:', result);
            
            if (result && result.success) {
                console.log('Profile update successful, redirecting to dashboard');
                setMessage('Profile updated successfully! Welcome to your complete dashboard!');
                
                // Set flag to trigger dashboard refresh
                localStorage.setItem('onboardingCompleted', 'true');
                
                setTimeout(() => {
                    console.log('Navigating to dashboard...');
                    navigate('/app/dashboard');
                }, 2000);
            } else {
                console.log('Profile update failed:', result);
                setMessage(`Profile update failed: ${result?.error || 'Unknown error'}`);
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error('🔍 Submission error:', error);
            setMessage(`Failed to create account: ${error.message}`);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-2xl w-full text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Tell Us About Your Spending</h1>
                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                    To get started, help us understand your regular income and expenses. This will refine your financial snapshot.
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                    <div className="bg-blue-600 h-2.5 rounded-full w-[80%]"></div>
                    <p className="text-sm text-gray-600 mt-2">Step 4 of 5</p>
                </div>

                <div className="text-left space-y-6 mb-10">
                    {/* Income Section */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Income</h3>
                        <div className="mb-4">
                            <label htmlFor="monthlyIncome" className="block text-gray-700 text-sm font-bold mb-2">Monthly Net Income</label>
                            <input 
                                type="number" 
                                id="monthlyIncome" 
                                value={cashFlowData.monthlyIncome}
                                onChange={(e) => handleInputChange('monthlyIncome', e.target.value)}
                                className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
                                placeholder="KES 250,000" 
                            />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="incomeFrequency" className="block text-gray-700 text-sm font-bold mb-2">Income Frequency</label>
                            <select 
                                id="incomeFrequency" 
                                value={cashFlowData.incomeFrequency}
                                onChange={(e) => handleInputChange('incomeFrequency', e.target.value)}
                                className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            >
                                <option>Monthly</option>
                                <option>Bi-weekly</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200" onClick={() => showActionMessage('Add Another Income Source')}>
                            + Add Another Income Source
                        </button>
                    </div>

                    {/* Expense Categories */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Top Expenses</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="rent" className="block text-gray-700 text-sm font-bold mb-2">Rent/Mortgage</label>
                                <input 
                                    type="number" 
                                    id="rent" 
                                    value={cashFlowData.rent}
                                    onChange={(e) => handleInputChange('rent', e.target.value)}
                                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
                                    placeholder="KES 30,000" 
                                />
                            </div>
                            <div>
                                <label htmlFor="utilities" className="block text-gray-700 text-sm font-bold mb-2">Utilities</label>
                                <input 
                                    type="number" 
                                    id="utilities" 
                                    value={cashFlowData.utilities}
                                    onChange={(e) => handleInputChange('utilities', e.target.value)}
                                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
                                    placeholder="KES 5,000" 
                                />
                            </div>
                            <div>
                                <label htmlFor="groceries" className="block text-gray-700 text-sm font-bold mb-2">Groceries</label>
                                <input 
                                    type="number" 
                                    id="groceries" 
                                    value={cashFlowData.groceries}
                                    onChange={(e) => handleInputChange('groceries', e.target.value)}
                                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
                                    placeholder="KES 10,000" 
                                />
                            </div>
                            <div>
                                <label htmlFor="transport" className="block text-gray-700 text-sm font-bold mb-2">Transport</label>
                                <input 
                                    type="number" 
                                    id="transport" 
                                    value={cashFlowData.transport}
                                    onChange={(e) => handleInputChange('transport', e.target.value)}
                                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
                                    placeholder="KES 8,000" 
                                />
                            </div>
                            <div>
                                <label htmlFor="loanRepayments" className="block text-gray-700 text-sm font-bold mb-2">Loan Repayments</label>
                                <input 
                                    type="number" 
                                    id="loanRepayments" 
                                    value={cashFlowData.loanRepayments}
                                    onChange={(e) => handleInputChange('loanRepayments', e.target.value)}
                                    className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" 
                                    placeholder="KES 15,000" 
                                />
                            </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4" onClick={() => showActionMessage('Add Custom Category')}>
                            + Add Custom Category
                        </button>
                    </div>

                </div>

                <div className="flex flex-col md:flex-row gap-4">
                    <button 
                        type="button"
                        onClick={() => navigate('/onboarding/data-connection')}
                        className="bg-gray-300 text-gray-700 py-3 px-8 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-300 shadow-lg flex-1"
                    >
                        ← Back
                    </button>
                    <button 
                        className={`py-3 px-8 rounded-lg font-semibold transition-all duration-300 shadow-lg flex-1 ${
                            isSubmitting 
                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                        onClick={handleNext}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Creating Account...' : 'Complete Registration'}
                    </button>
                </div>
            </div>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default OnboardingCashFlowSetup;