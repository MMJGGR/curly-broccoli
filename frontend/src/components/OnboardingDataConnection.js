// TODO: Upload CSV and link accounts using linkAccount() (Epic 1 Story 6, ~90% once integrated)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';

const OnboardingDataConnection = () => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const navigate = useNavigate();

    const showActionMessage = (actionName) => {
        setMessage('Initiating ' + actionName + '... (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const handleNext = () => {
        // In a real app, this would involve actual data connection logic
        navigate('/onboarding/cash-flow-setup');
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-2xl w-full text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Welcome to [App Name]!</h1>
                <h2 className="text-2xl font-semibold text-blue-700 mb-8">Let's Connect Your Finances.</h2>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-8">
                    <div className="bg-blue-600 h-2.5 rounded-full w-[60%]"></div>
                    <p className="text-sm text-gray-600 mt-2">Step 3 of 5</p>
                </div>

                <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                    To help you achieve your financial goals, [App Name] can automatically categorize your transactions by securely monitoring your M-PESA SMS alerts and/or payroll emails. This allows us to build your personalized Lifetime Balance Sheet and offer tailored advice.
                </p>

                <div className="flex justify-center items-center space-x-6 mb-10">
                    {/* Icon: Secure Lock */}
                    <svg className="w-20 h-20 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-2 4h4m6-10V7a4 4 0 00-4-4H8a4 4 0 00-4 4v3m6 10h2a2 2 0 002-2v-2a2 2 0 00-2-2H9a2 2 0 00-2 2v2a2 2 0 002 2zm9-11V7a4 4 0 00-4-4H8a4 4 0 00-4 4v3"></path>
                    </svg>
                    {/* Icon: Phone with SMS */}
                    <svg className="w-20 h-20 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path>
                    </svg>
                    {/* Icon: Email */}
                    <svg className="w-20 h-20 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-1 12H4a2 2 0 01-2-2V6a2 2 0 012-2h16a2 2 0 012 2v12a2 2 0 01-2 2z"></path>
                    </svg>
                </div>

                <div className="text-left mb-10 space-y-4 text-gray-700">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">How it Works:</h3>
                    <p><strong className="text-blue-600">1. Grant Permission:</strong> Securely connect your M-PESA SMS or Email provider.</p>
                    <p><strong className="text-blue-600">2. Smart Categorization:</strong> We identify keywords like 'salary,' 'loan repayment,' 'deposit,' etc.</p>
                    <p><strong className="text-blue-600">3. Real-time Insights:</strong> Your balance sheet updates automatically with personalized advice.</p>
                    <p className="text-sm text-gray-600 mt-4">Your data is encrypted and never shared. You control your privacy.</p>
                </div>

                <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <button className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg" onClick={() => showActionMessage('M-PESA SMS Connection')}>
                        Connect M-PESA SMS
                    </button>
                    <button className="bg-indigo-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-indigo-700 transition-all duration-300 shadow-lg" onClick={() => showActionMessage('Email Provider Connection')}>
                        Connect Email Provider
                    </button>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <button 
                        className="bg-gray-300 text-gray-700 py-3 px-8 rounded-lg font-semibold hover:bg-gray-400 transition-all duration-300 shadow-lg flex-1"
                        onClick={() => navigate('/onboarding/risk-questionnaire')}
                    >
                        ← Back
                    </button>
                    <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 flex-1" onClick={handleNext}>
                        Manual Entry (Later) →
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-8">
                    By continuing, you agree to our
                    <button type="button" className="text-blue-500 hover:underline ml-1">
                        Privacy Policy
                    </button>.
                </p>
            </div>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default OnboardingDataConnection;