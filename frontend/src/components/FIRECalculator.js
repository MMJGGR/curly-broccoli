import React, { useState } from 'react';
import MessageBox from './MessageBox';

const FIRECalculator = ({ onNextScreen }) => {
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
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Financial Independence, Retire Early (FIRE) Calculator</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Calculate Your FIRE Number</h2>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label htmlFor="currentSavings" className="block text-gray-700 text-sm font-bold mb-2">Current Savings (KES)</label>
                            <input type="number" id="currentSavings" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 500,000" />
                        </div>
                        <div>
                            <label htmlFor="annualExpenses" className="block text-gray-700 text-sm font-bold mb-2">Desired Annual Expenses in Retirement (KES)</label>
                            <input type="number" id="annualExpenses" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 600,000" />
                        </div>
                        <div>
                            <label htmlFor="expectedReturn" className="block text-gray-700 text-sm font-bold mb-2">Expected Annual Investment Return (%)</label>
                            <input type="number" id="expectedReturn" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 7" />
                        </div>
                        <div>
                            <label htmlFor="withdrawalRate" className="block text-gray-700 text-sm font-bold mb-2">Safe Withdrawal Rate (%)</label>
                            <input type="number" id="withdrawalRate" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 4" />
                        </div>
                    </div>
                    <button className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full" onClick={() => showActionMessage('Calculate FIRE')}>
                        Calculate My FIRE Number
                    </button>

                    <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200 text-blue-800">
                        <h3 className="text-xl font-bold mb-3">Your FIRE Projection:</h3>
                        <p className="text-lg mb-2"><strong>Target FIRE Number:</strong> KES 15,000,000</p>
                        <p className="text-lg"><strong>Years to FIRE:</strong> 15 years (at current savings rate)</p>
                        <p className="text-sm text-gray-600 mt-4">
                            *This calculation is an estimate. Consider adjusting your savings or expenses to reach your goal faster.*
                        </p>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default FIRECalculator;
