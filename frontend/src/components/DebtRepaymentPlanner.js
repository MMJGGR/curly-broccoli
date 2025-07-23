// TODO: Submit loans to /debt-plan and show schedule (Epic 5 Story 7, ~80% completion)
import React, { useState } from 'react';
import MessageBox from './MessageBox';

const DebtRepaymentPlanner = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const showActionMessage = (actionName) => {
        setMessage('Action: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Debt Repayment Planner</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Plan Your Debt Payoff Strategy</h2>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label htmlFor="loanName" className="block text-gray-700 text-sm font-bold mb-2">Loan Name</label>
                            <input type="text" id="loanName" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., Student Loan" />
                        </div>
                        <div>
                            <label htmlFor="currentBalance" className="block text-gray-700 text-sm font-bold mb-2">Current Balance (KES)</label>
                            <input type="number" id="currentBalance" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 120,000" />
                        </div>
                        <div>
                            <label htmlFor="interestRate" className="block text-gray-700 text-sm font-bold mb-2">Annual Interest Rate (%)</label>
                            <input type="number" id="interestRate" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 8" />
                        </div>
                        <div>
                            <label htmlFor="minPayment" className="block text-gray-700 text-sm font-bold mb-2">Minimum Monthly Payment (KES)</label>
                            <input type="number" id="minPayment" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 5,000" />
                        </div>
                        <div>
                            <label htmlFor="extraPayment" className="block text-gray-700 text-sm font-bold mb-2">Extra Monthly Payment (Optional, KES)</label>
                            <input type="number" id="extraPayment" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 2,000" />
                        </div>
                    </div>
                    <button className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full" onClick={() => showActionMessage('Calculate Repayment Plan')}>
                        Calculate Repayment Plan
                    </button>

                    <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200 text-blue-800">
                        <h3 className="text-xl font-bold mb-3">Repayment Summary:</h3>
                        <p className="text-lg mb-2"><strong>Original Payoff Time:</strong> 28 months</p>
                        <p className="text-lg mb-2"><strong>New Payoff Time (with extra payment):</strong> 20 months</p>
                        <p className="text-lg"><strong>Interest Saved:</strong> KES 8,000</p>
                        <p className="text-sm text-gray-600 mt-4">
                            *Accelerating your debt payments can save you significant interest over time.*
                        </p>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default DebtRepaymentPlanner;
