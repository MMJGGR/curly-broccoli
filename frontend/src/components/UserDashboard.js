// TODO: Populate widgets from /dashboard endpoints (Epic 4 Stories 1-5, ~75% completion)
import React, { useState } from 'react';
import MessageBox from './MessageBox';

const UserDashboard = ({
    onNextScreen,
    initialMessage = '',
    initialShowMessageBox = false,
}) => {
    const [message, setMessage] = useState(initialMessage);
    const [showMessageBox, setShowMessageBox] = useState(initialShowMessageBox);

    const showTabMessage = (tabName) => {
        setMessage('Navigating to ' + tabName + ' section... (This is a wireframe)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            {/* Main Content Area */}
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Hello, Jamal Mwangi! Your Financial Snapshot</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Card 1: Lifetime Balance Sheet Snapshot */}
                    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Lifetime Balance Sheet Snapshot</h2>
                            <p className="text-sm text-gray-500 mb-3">As of July 17, 2025</p>
                            <div className="space-y-2 mb-4">
                                <p className="text-lg"><strong>Assets:</strong> <span className="text-green-600">KES 70,000</span></p>
                                <p className="text-lg"><strong>Liabilities:</strong> <span className="text-red-600">KES 300,000</span></p>
                                <p className="text-xl font-bold">Net Worth: <span className="text-red-700">–KES 230,000</span></p>
                            </div>
                            {/* Placeholder for Mini Chart: Net Worth Trend */}
                            <div className="bg-gray-50 h-24 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                [Mini Chart: Net Worth Trend (Last 12 months)]
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Net Worth Projection */}
                    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Net Worth Projection</h2>
                            {/* Placeholder for Interactive Line Chart */}
                            <div className="bg-gray-50 h-48 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-4">
                                [Interactive Line Chart: Projected Net Worth over Lifetime]
                            </div>
                            <p className="text-lg text-gray-700 mb-4">Turns positive at age <span className="font-bold text-blue-600">30</span></p>
                        </div>
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md" onClick={() => showTabMessage('Explore Projections')}>
                            Explore Projections
                        </button>
                    </div>

                    {/* Card 3: Monthly Cash Flow Summary */}
                    <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">Monthly Cash Flow Summary</h2>
                            <div className="space-y-2 mb-4">
                                <p className="text-lg"><strong>Income:</strong> <span className="text-green-600">KES 250,000</span></p>
                                <p className="text-lg"><strong>Expenses:</strong> <span className="text-red-600">KES 150,000</span></p>
                                <p className="text-xl font-bold">Savings Rate: <span className="text-blue-600">40%</span></p>
                            </div>
                            {/* Placeholder for Bar Chart: Income vs. Expense Breakdown */}
                            <div className="bg-gray-50 h-24 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                                [Bar Chart: Income vs. Expense Breakdown by Category (e.g., Rent, Groceries, Transport)]
                            </div>
                        </div>
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md" onClick={() => onNextScreen('AccountsTransactions')}>
                            View Detailed Transactions
                        </button>
                    </div>

                    {/* Card 4: Top Advice for You (Personalized) */}
                    <div className="bg-white rounded-xl shadow-lg p-6 col-span-1 md:col-span-2">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Top Advice for You</h2>
                        <div className="space-y-4">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-blue-800 font-medium">"Increase NSSF contributions to 12% for retirement boost."</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-blue-800 font-medium">"Allocate 10% of cashflow to children’s plan."</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <p className="text-blue-800 font-medium">"Run Monte Carlo drawdown test for retirement."</p>
                            </div>
                        </div>
                        <button className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md w-full" onClick={() => onNextScreen('AdviceModuleDetail')}>
                            Learn More & Act
                        </button>
                    </div>

                    {/* Card 5: Goal Progress at a Glance */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Goal Progress at a Glance</h2>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `75%` }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Emergency Fund: 75% complete</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `60%` }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Student Loan: 60% paid off</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `30%` }}></div>
                                </div>
                                <span className="text-sm font-medium text-gray-700">Motorcycle: 30% saved</span>
                            </div>
                        </div>
                        <button className="mt-6 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md w-full" onClick={() => onNextScreen('GoalsOverview')}>
                            View All Goals
                        </button>
                    </div>
                </div>
            </main>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default UserDashboard;
