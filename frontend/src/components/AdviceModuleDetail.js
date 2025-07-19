import React, { useState } from 'react';
import MessageBox from './MessageBox';

const AdviceModuleDetail = ({ onNextScreen }) => {
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
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Advice: Boost Your Retirement Savings</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Increase NSSF contributions to 12% for retirement boost</h2>

                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Why This Matters (CFA Context):</h3>
                        <p className="text-gray-600 leading-relaxed">
                            This advice is based on the principle of <strong className="text-blue-600">Compound Interest</strong>. By increasing your NSSF contributions, you leverage the power of long-term compounding, significantly growing your retirement nest egg over time.
                        </p>
                        {/* Placeholder for Infographic/Animation */}
                        <div className="bg-gray-50 h-32 rounded-lg flex items-center justify-center text-gray-400 text-sm mt-4">
                            [Infographic/Animation: Illustrating compound interest]
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Your Current Situation:</h3>
                        <p className="text-gray-600">Your current NSSF contribution is <span className="font-bold">5%</span>.</p>
                        <p className="text-gray-600">Your employer matches up to <span className="font-bold">7%</span>.</p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Recommended Action:</h3>
                        <p className="text-gray-600 leading-relaxed">
                            We recommend increasing your NSSF contributions to <span className="font-bold">12%</span> of your gross salary. This will increase your monthly contribution by <span className="font-bold">KES [Amount]</span> and potentially unlock an additional <span className="font-bold">KES [Employer Match Amount]</span> from your employer.
                        </p>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-lg font-bold text-gray-700 mb-2">How to Take Action (Step-by-Step Guide):</h3>
                        <ol className="list-decimal list-inside text-gray-600 space-y-2">
                            <li>Contact your HR department.</li>
                            <li>Request to increase your NSSF voluntary contributions.</li>
                            <li>Confirm the new deduction on your payslip.</li>
                        </ol>
                        <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 mt-4">
                            <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md flex-grow" onClick={() => showActionMessage('Generate Email Template')}>
                                Generate Email Template for HR
                            </button>
                            <button className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:bg-gray-400 transition-colors duration-200 shadow-md flex-grow" onClick={() => showActionMessage('Set Reminder')}>
                                Set Reminder to Follow Up
                            </button>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-gray-700 mb-2">Projected Impact:</h3>
                        {/* Placeholder for Mini Chart */}
                        <div className="bg-gray-50 h-32 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-4">
                            [Mini Chart: Projected Retirement Savings with vs. without increased contributions]
                        </div>
                        <p className="text-gray-600">By age 65, this change could add <span className="font-bold text-green-600">KES [Amount]</span> to your retirement fund.</p>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default AdviceModuleDetail;
