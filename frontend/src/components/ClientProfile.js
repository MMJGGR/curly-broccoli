// TODO: Bind profile view to client detail endpoints (Epic 7 Story 6, ~70% completion)
import React, { useState } from 'react';
import MessageBox from './MessageBox';

const ClientProfile = ({ onNextScreen }) => {
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

    const clientData = {
        name: 'Jamal Mwangi',
        age: 27,
        occupation: 'Software Engineer',
        netWorth: '-KES 230,000',
        goals: [
            { name: 'Emergency Fund', progress: '75%' },
            { name: 'Student Loan Payoff', progress: '60%' },
        ],
        recentActivity: [
            'Updated cash flow details',
            'Viewed retirement projections',
        ],
        adviceHistory: [
            'Recommended NSSF contribution increase (July 2025)',
            'Suggested diversified equity fund (June 2025)',
        ]
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Client Profile: {clientData.name}</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Overview</h2>
                        <p className="text-gray-700 mb-2"><strong>Age:</strong> {clientData.age}</p>
                        <p className="text-gray-700 mb-2"><strong>Occupation:</strong> {clientData.occupation}</p>
                        <p className="text-gray-700 mb-2"><strong>Net Worth:</strong> <span className="font-bold text-red-600">{clientData.netWorth}</span></p>
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md mt-4" onClick={() => showActionMessage('View Full Financials')}>
                            View Full Financials
                        </button>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Goals Progress</h2>
                        <ul className="space-y-2 text-gray-700">
                            {clientData.goals.map((goal, index) => (
                                <li key={index} className="flex justify-between">
                                    <span>{goal.name}</span>
                                    <span className="font-medium text-green-600">{goal.progress}</span>
                                </li>
                            ))}
                        </ul>
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md mt-4" onClick={() => showActionMessage('Review Client Goals')}>
                            Review Client Goals
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Activity</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {clientData.recentActivity.map((activity, index) => (
                            <li key={index}>{activity}</li>
                        ))}
                    </ul>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Advice History</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {clientData.adviceHistory.map((advice, index) => (
                            <li key={index}>{advice}</li>
                        ))}
                    </ul>
                    <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md mt-4" onClick={() => showActionMessage('Provide New Advice')}>
                        Provide New Advice
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Actions for {clientData.name}</h2>
                    <div className="flex flex-wrap gap-4">
                        <button className="bg-indigo-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors duration-200 shadow-md" onClick={() => showActionMessage('Run Scenario for ' + clientData.name)}>
                            Run Scenario Modeling
                        </button>
                        <button className="bg-purple-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 shadow-md" onClick={() => showActionMessage('Generate Report for ' + clientData.name)}>
                            Generate Report
                        </button>
                        <button className="bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors duration-200 shadow-md" onClick={() => showActionMessage('Schedule Meeting with ' + clientData.name)}>
                            Schedule Meeting
                        </button>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default ClientProfile;
