import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';

const OnboardingCashFlowSetup = () => {
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
        // In a real app, this would involve saving cash flow data to backend
        navigate('/app/dashboard'); // Navigate to the main application dashboard
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
                    <div className="bg-blue-600 h-2.5 rounded-full w-[40%]"></div> {/* Example: 2/5 steps */}
                    <p className="text-sm text-gray-600 mt-2">Step 2 of 5</p>
                </div>

                <div className="text-left space-y-6 mb-10">
                    {/* Income Section */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Income</h3>
                        <div className="mb-4">
                            <label htmlFor="monthlyIncome" className="block text-gray-700 text-sm font-bold mb-2">Monthly Net Income</label>
                            <input type="number" id="monthlyIncome" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="KES 250,000" />
                        </div>
                        <div className="mb-4">
                            <label htmlFor="incomeFrequency" className="block text-gray-700 text-sm font-bold mb-2">Income Frequency</label>
                            <select id="incomeFrequency" className="shadow border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500">
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
                                <input type="number" id="rent" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="KES 30,000" />
                            </div>
                            <div>
                                <label htmlFor="utilities" className="block text-gray-700 text-sm font-bold mb-2">Utilities</label>
                                <input type="number" id="utilities" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="KES 5,000" />
                            </div>
                            <div>
                                <label htmlFor="groceries" className="block text-gray-700 text-sm font-bold mb-2">Groceries</label>
                                <input type="number" id="groceries" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="KES 10,000" />
                            </div>
                            <div>
                                <label htmlFor="transport" className="block text-gray-700 text-sm font-bold mb-2">Transport</label>
                                <input type="number" id="transport" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="KES 8,000" />
                            </div>
                            <div>
                                <label htmlFor="loanRepayments" className="block text-gray-700 text-sm font-bold mb-2">Loan Repayments</label>
                                <input type="number" id="loanRepayments" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="KES 15,000" />
                            </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4" onClick={() => showActionMessage('Add Custom Category')}>
                            + Add Custom Category
                        </button>
                    </div>

                    {/* Emergency Fund Target */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                        <h3 className="text-xl font-bold text-blue-800 mb-4">Emergency Fund Target</h3>
                        <p className="text-blue-700 mb-4">
                            Based on your expenses, we recommend a 6-month emergency fund of <span className="font-bold">KES 60,000</span>.
                        </p>
                        <label className="inline-flex items-center">
                            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded" defaultChecked />
                            <span className="ml-2 text-gray-700">Set as a Goal</span>
                        </label>
                    </div>
                </div>

                <button className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full" onClick={handleNext}>
                    Next: Set Your Goals
                </button>
            </div>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default OnboardingCashFlowSetup;