// TODO: Pull KPI metrics from /advisor/stats (Epic 7 Story 2, ~70% dashboard progress)
import React, { useState } from 'react';
import MessageBox from './MessageBox';

const AdvisorDashboard = ({ onNextScreen, initialMessage = '', initialShowMessageBox = false }) => {
    const [message, setMessage] = useState(initialMessage);
    const [showMessageBox, setShowMessageBox] = useState(initialShowMessageBox);

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Advisor Dashboard</h1>
                <p className="text-gray-600 mb-8">Welcome, [Advisor Name]! Here's an overview of your clients.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Total Clients</h2>
                        <p className="text-5xl font-extrabold text-blue-600">45</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">Pending Reviews</h2>
                        <p className="text-5xl font-extrabold text-orange-500">7</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                        <h2 className="text-xl font-semibold text-gray-800 mb-2">New Sign-ups (Last 30 days)</h2>
                        <p className="text-5xl font-extrabold text-green-600">3</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Client Activity</h2>
                    <ul className="space-y-3 text-gray-700">
                        <li className="flex justify-between items-center border-b pb-2">
                            <span><strong>Jamal Mwangi:</strong> Updated cash flow details</span>
                            <span className="text-sm text-gray-500">2 hours ago</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span><strong>Aisha Khan:</strong> Completed emergency fund goal</span>
                            <span className="text-sm text-gray-500">1 day ago</span>
                        </li>
                        <li className="flex justify-between items-center border-b pb-2">
                            <span><strong>David Kimani:</strong> Viewed Monte Carlo simulation</span>
                            <span className="text-sm text-gray-500">3 days ago</span>
                        </li>
                    </ul>
                </div>

                <button className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full" onClick={() => onNextScreen('ClientList')}>
                    View All Clients
                </button>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default AdvisorDashboard;
