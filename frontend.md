import React, { useState, useEffect, useRef } from 'react';

// Reusable Message Box Component
const MessageBox = ({ message, onClose }) => {
    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={onClose}></div>
            {/* Message Box */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-8 rounded-xl shadow-2xl z-50 text-center max-w-sm border border-gray-200">
                <p className="text-gray-800 text-lg font-medium mb-4">{message}</p>
                <button className="bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200" onClick={onClose}>OK</button>
            </div>
        </>
    );
};

// Component for the Onboarding: SMS/Email Permission & Data Ingestion screen
const OnboardingDataConnection = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const showActionMessage = (actionName) => {
        setMessage('Initiating ' + actionName + '... (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-2xl w-full text-center">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6">Welcome to [App Name]!</h1>
                <h2 className="text-2xl font-semibold text-blue-700 mb-8">Let's Connect Your Finances.</h2>

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
                {/* This button will trigger a dummy navigation in scrollable view */}
                <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200" onClick={() => onNextScreen('OnboardingCashFlow')}>
                    Manual Entry (Later)
                </button>

                <p className="text-xs text-gray-500 mt-8">
                    By continuing, you agree to our <a href="#" className="text-blue-500 hover:underline">Privacy Policy</a>.
                </p>
            </div>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

// Component for the Onboarding: Initial Cash Flow Setup screen
const OnboardingCashFlowSetup = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const showActionMessage = (actionName) => {
        setMessage('Initiating ' + actionName + '... (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
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

                {/* This button will trigger a dummy navigation in scrollable view */}
                <button className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full" onClick={() => onNextScreen('UserDashboard')}>
                    Next: Set Your Goals
                </button>
            </div>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

// Component for the User Dashboard screen
const UserDashboard = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

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

// Component for Accounts & Transactions
const AccountsTransactions = ({ onNextScreen }) => {
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

    const transactions = [
        { date: '2025-07-15', description: 'Salary', amount: '250,000', category: 'Income: Salary', account: 'M-PESA' },
        { date: '2025-07-10', description: 'Loan Repayment', amount: '-15,000', category: 'Expenses: Loan', account: 'M-PESA' },
        { date: '2025-07-08', description: 'Groceries - Naivas', amount: '-5,000', category: 'Expenses: Food & Dining', account: 'KCB' },
        { date: '2025-07-05', description: 'Electricity Bill', amount: '-2,500', category: 'Expenses: Utilities', account: 'M-PESA' },
        { date: '2025-07-03', description: 'Transport - Uber', amount: '-800', category: 'Expenses: Transport', account: 'KCB' },
    ];

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Accounts & Transactions</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-800">
                            <p className="font-medium">M-PESA</p>
                            <p className="text-lg font-bold">KES 50,000</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-800">
                            <p className="font-medium">Bank Account (KCB)</p>
                            <p className="text-lg font-bold">KES 20,000</p>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-blue-800">
                            <p className="font-medium">Pension Fund (NSSF)</p>
                            <p className="text-lg font-bold">KES 10,000</p>
                        </div>
                    </div>
                    <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md" onClick={() => showActionMessage('Link New Account')}>
                        Link New Account
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction History</h2>
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                        <input type="date" className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                        <input type="text" placeholder="Search transactions..." className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 flex-grow" />
                        <select className="shadow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500">
                            <option>All Categories</option>
                            <option>Income</option>
                            <option>Expenses</option>
                        </select>
                        <select className="shadow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500">
                            <option>All Accounts</option>
                            <option>M-PESA</option>
                            <option>KCB</option>
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left rounded-tl-lg">Date</th>
                                    <th className="py-3 px-6 text-left">Description</th>
                                    <th className="py-3 px-6 text-left">Amount</th>
                                    <th className="py-3 px-6 text-left">Category</th>
                                    <th className="py-3 px-6 text-left rounded-tr-lg">Account</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm font-light">
                                {transactions.map((tx, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">{tx.date}</td>
                                        <td className="py-3 px-6 text-left">{tx.description}</td>
                                        <td className={`py-3 px-6 text-left ${tx.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>{tx.amount}</td>
                                        <td className="py-3 px-6 text-left">{tx.category}</td>
                                        <td className="py-3 px-6 text-left">
                                            {tx.account}
                                            <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage(`Edit transaction: ${tx.description}`)}>
                                                <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-center text-gray-600">
                        <p>Uncategorized Transactions: <span className="font-bold text-red-500">3</span> (Click 'Edit' to categorize)</p>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

// Component for Balance Sheet
const BalanceSheet = ({ onNextScreen }) => {
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

    const assets = {
        cashEquivalents: {
            'M-PESA': 50000,
            'Bank Account (KCB)': 20000,
            'Savings Account': 15000,
        },
        investments: {
            'Unit Trusts': 75000,
            'Pension Fund (NSSF)': 10000,
            'Stocks (Local)': 30000,
        },
        property: {
            'Primary Residence': 5000000, // Example: Market value
            'Investment Land': 1000000,
        },
        otherAssets: {
            'Vehicle (Motorcycle)': 200000,
            'Electronics': 50000,
        }
    };

    const liabilities = {
        loans: {
            'Student Loan': 120000,
            'Mortgage': 4000000,
            'Personal Loan': 50000,
        },
        creditCards: {
            'Visa Card': 15000,
        },
        otherLiabilities: {
            'Utility Bills (Pending)': 3000,
        }
    };

    const calculateTotal = (obj) => {
        let total = 0;
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                total += Object.values(obj[key]).reduce((sum, val) => sum + val, 0);
            } else {
                total += obj[key];
            }
        }
        return total;
    };

    const totalAssets = calculateTotal(assets);
    const totalLiabilities = calculateTotal(liabilities);
    const netWorth = totalAssets - totalLiabilities;

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Lifetime Balance Sheet</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Summary as of July 17, 2025</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center mb-6">
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200 text-green-800">
                            <p className="font-medium">Total Assets</p>
                            <p className="text-2xl font-bold">KES {totalAssets.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-red-800">
                            <p className="font-medium">Total Liabilities</p>
                            <p className="text-2xl font-bold">KES {totalLiabilities.toLocaleString()}</p>
                        </div>
                        <div className={`p-4 rounded-lg border ${netWorth >= 0 ? 'bg-blue-50 border-blue-200 text-blue-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                            <p className="font-medium">Net Worth</p>
                            <p className="text-3xl font-bold">KES {netWorth.toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 h-48 rounded-lg flex items-center justify-center text-gray-400 text-sm mb-4">
                        [Net Worth Trend Chart (Timeline Integration)]
                    </div>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md w-full" onClick={() => showActionMessage('Explore Net Worth Projection')}>
                        Explore Net Worth Projection
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Assets Register */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Assets Register</h2>
                        {Object.keys(assets).map(category => (
                            <div key={category} className="mb-4">
                                <h3 className="text-lg font-bold text-gray-700 mb-2 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {Object.entries(assets[category]).map(([item, value]) => (
                                        <li key={item} className="flex justify-between">
                                            <span>{item}</span>
                                            <span className="font-medium">KES {value.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4" onClick={() => showActionMessage('Add New Asset')}>
                            + Add New Asset
                        </button>
                    </div>

                    {/* Liabilities Register */}
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">Liabilities Register</h2>
                        {Object.keys(liabilities).map(category => (
                            <div key={category} className="mb-4">
                                <h3 className="text-lg font-bold text-gray-700 mb-2 capitalize">{category.replace(/([A-Z])/g, ' $1').trim()}:</h3>
                                <ul className="list-disc list-inside space-y-1 text-gray-600">
                                    {Object.entries(liabilities[category]).map(([item, value]) => (
                                        <li key={item} className="flex justify-between">
                                            <span>{item}</span>
                                            <span className="font-medium">KES {value.toLocaleString()}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                        <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4" onClick={() => showActionMessage('Add New Liability')}>
                            + Add New Liability
                        </button>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

// Component for Goals Overview
const GoalsOverview = ({ onNextScreen }) => {
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

    const goals = [
        { name: 'Emergency Fund', progress: 75, target: 'KES 100,000', current: 'KES 75,000' },
        { name: 'Student Loan Payoff', progress: 60, target: 'KES 300,000', current: 'KES 180,000' },
        { name: 'Motorcycle Purchase', progress: 30, target: 'KES 250,000', current: 'KES 75,000', targetDate: '2 years' },
        { name: 'Children\'s University Fund', progress: 15, target: 'KES 5,000,000', current: 'KES 750,000', targetDate: '5 years' },
        { name: 'Home Purchase', progress: 5, target: 'KES 1,000,000 (down payment)', current: 'KES 50,000' },
        { name: 'Retirement', progress: 20, target: 'Age 65', current: 'Projected KES 3M' },
    ];

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Financial Goals</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800 mb-3">{goal.name}</h2>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                                    <div className="bg-green-500 h-3 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                                </div>
                                <p className="text-sm text-gray-700 mb-2">Progress: <span className="font-bold">{goal.progress}% complete</span></p>
                                <p className="text-sm text-gray-700">Target: {goal.target} | Current: {goal.current}</p>
                                {goal.targetDate && <p className="text-sm text-gray-700">Target Date: {goal.targetDate}</p>}
                            </div>
                            <div className="mt-4 flex space-x-2">
                                <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md text-sm flex-grow" onClick={() => showActionMessage(`View Details for ${goal.name}`)}>
                                    View Details
                                </button>
                                <button className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200 shadow-md text-sm" onClick={() => showActionMessage(`Adjust ${goal.name}`)}>
                                    Adjust
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-8">
                    <button className="bg-green-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg" onClick={() => showActionMessage('Add New Goal')}>
                        + Add New Goal
                    </button>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

// Component for Advice Module Detail
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
                            <button className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200 shadow-md flex-grow" onClick={() => showActionMessage('Set Reminder')}>
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

// Component for the Lifetime Journey Timeline screen (now primarily for content to be embedded)
const LifetimeJourneyTimeline = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const showActionMessage = (actionName) => {
        setMessage('Viewing details for: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    // Sample data for Jamal's timeline
    const jamalTimeline = [
        { age: 27, phase: 'Accumulation', event: 'Onboarding: SMS/Email Intake', assets: 'KES 70 k', liabs: 'KES 300 k', netWorth: '–KES 230 k', advice: 'Set up cash-flow categories & target a 6-mo emergency fund (Cash-flow analysis)' },
        { age: 28, phase: 'Accumulation', event: 'Emergency Fund Achieved: 6-Month Buffer', assets: 'KES 150 k', liabs: 'KES 280 k', netWorth: '–KES 130 k', advice: 'Redirect 20% of income into a growth-oriented ETF (Time-Value of Money)' },
        { age: 29, phase: 'Accumulation', event: 'Pension Enrollment: Employer Match Started', assets: 'KES 150 k (bank) + KES 10 k (pension)', liabs: 'KES 260 k', netWorth: '–KES 100 k', advice: 'Increase NSSF contributions to 12% to capture long-term compounding (Compound Interest)' },
        { age: 30, phase: 'Accumulation → Family', event: 'Student-Loan Paid Off: Debt-Free Milestone', assets: 'KES 200 k', liabs: '0', netWorth: 'KES 200 k', advice: 'Allocate the freed-up KES 15 k/mo to a diversified equity fund (Liability Management)' },
        { age: 33, phase: 'Family & Property', event: 'Motorcycle Purchase: Asset Acquisition', assets: 'KES 300 k', liabs: 'KES 50 k (vehicle loan)', netWorth: 'KES 250 k', advice: 'Automate an insurance & maintenance reserve at 5% of asset value (Asset Protection)' },
        { age: 36, phase: 'Family & Property', event: 'Education Fund Kick-off: Future College', assets: 'KES 350 k total savings', liabs: 'KES 50 k', netWorth: 'KES 300 k', advice: 'Launch a dedicated unit-trust SIP targeting 8% p.a. (Education Goals Framework)' },
        { age: 40, phase: 'Family & Property', event: 'Home Purchase: First Mortgage', assets: 'Pre-mortgage NW KES 800 k', liabs: 'KES 1.5 M mortgage', netWorth: '–KES 700 k', advice: 'Optimize mortgage tenor & prepayment schedule (Liability Management)' },
        { age: 55, phase: 'Pre-Retirement Consolidation', event: 'Portfolio Rebalance: Shift to Income', assets: '2 M (60% bonds/40% equities)', liabs: 'KES 100 k', netWorth: 'KES 1.9 M', advice: 'Rebalance to a 40/60 equity-bond split (Life-Cycle Asset Allocation)' },
        { age: 65, phase: 'Decumulation & Legacy', event: 'Retirement & Drawdown Start: SWP Launch', assets: 'KES 3 M portfolio', liabs: 'KES 100 k', netWorth: 'KES 2.9 M', advice: 'Run a 4% systematic withdrawal Monte-Carlo stress test (Decumulation Planning)' },
        { age: 75, phase: 'Decumulation & Legacy', event: 'Estate Planning: Legacy Blueprint', assets: 'Remaining portfolio KES 2.5 M', liabs: 'Estate setup costs', netWorth: 'KES 2.5 M', advice: 'Initiate trust formation & charitable bequests (Estate Planning)' },
    ];


    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Lifetime Financial Journey</h1>

                <div className="relative py-8">
                    {/* Timeline Line */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 w-1 bg-blue-300 h-full hidden md:block"></div>

                    <div className="flex flex-col items-center md:items-stretch">
                        {jamalTimeline.map((item, index) => (
                            <div key={index} className={`flex w-full ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-center mb-8`}>
                                <div className="hidden md:block w-1/2"></div> {/* Empty div for spacing on one side */}
                                <div className="z-10 flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full shadow-lg flex-shrink-0 text-white font-bold text-sm">
                                    {item.age}
                                </div>
                                <div className={`flex-grow bg-white rounded-xl shadow-lg p-6 mx-4 w-full md:w-1/2 ${index % 2 === 0 ? 'md:ml-8' : 'md:mr-8'}`}>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.event}</h3>
                                    <p className="text-sm text-gray-600 mb-3">Age: {item.age} | Phase: {item.phase}</p>
                                    <div className="text-gray-700 text-sm mb-3">
                                        <p><strong>Assets:</strong> {item.assets}</p>
                                        <p><strong>Liabilities:</strong> {item.liabs}</p>
                                        <p><strong>Net Worth:</strong> {item.netWorth}</p>
                                    </div>
                                    <p className="text-blue-700 text-sm italic mb-4">{item.advice}</p>
                                    <button
                                        className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md text-sm"
                                        onClick={() => showActionMessage(item.event)}
                                    >
                                        Take Action on this Advice
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-8">
                    <button className="bg-green-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg" onClick={() => showActionMessage('Add Custom Milestone')}>
                        + Add Custom Milestone
                    </button>
                </div>
            </main>

            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};


// Component for FIRE Calculator
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

// Component for Monte Carlo Simulation
const MonteCarloSimulation = ({ onNextScreen }) => {
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
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Monte Carlo Simulation</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Your Financial Plan's Resilience</h2>
                    <div className="space-y-4 mb-6">
                        <div>
                            <label htmlFor="initialPortfolio" className="block text-gray-700 text-sm font-bold mb-2">Initial Portfolio Value (KES)</label>
                            <input type="number" id="initialPortfolio" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 1,000,000" />
                        </div>
                        <div>
                            <label htmlFor="annualContribution" className="block text-gray-700 text-sm font-bold mb-2">Annual Contribution (KES)</label>
                            <input type="number" id="annualContribution" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 120,000" />
                        </div>
                        <div>
                            <label htmlFor="expectedReturnRange" className="block text-gray-700 text-sm font-bold mb-2">Expected Annual Return Range (%)</label>
                            <input type="text" id="expectedReturnRange" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 5-10" />
                        </div>
                        <div>
                            <label htmlFor="volatility" className="block text-gray-700 text-sm font-bold mb-2">Volatility (Standard Deviation %)</label>
                            <input type="number" id="volatility" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 15" />
                        </div>
                        <div>
                            <label htmlFor="simulationRuns" className="block text-gray-700 text-sm font-bold mb-2">Number of Simulations</label>
                            <input type="number" id="simulationRuns" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="e.g., 1000" />
                        </div>
                    </div>
                    <button className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full" onClick={() => showActionMessage('Run Monte Carlo Simulation')}>
                        Run Simulation
                    </button>

                    <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200 text-blue-800">
                        <h3 className="text-xl font-bold mb-3">Simulation Results:</h3>
                        <p className="text-lg mb-2"><strong>Success Probability:</strong> 85% (Reaching your goal)</p>
                        <p className="text-lg mb-2"><strong>Median Outcome:</strong> KES 5,000,000</p>
                        <p className="text-lg"><strong>Worst 5% Outcome:</strong> KES 1,200,000</p>
                        <p className="text-sm text-gray-600 mt-4">
                            *This simulation helps assess the likelihood of achieving your financial goals under various market conditions.*
                        </p>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

// Component for Debt Repayment Planner
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

// Component for Advisor Login
const AdvisorLogin = ({ onNextScreen }) => {
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
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Advisor Login</h1>
                <p className="text-gray-600 mb-6">Access your client management portal.</p>

                <div className="space-y-4 mb-6 text-left">
                    <div>
                        <label htmlFor="advisorEmail" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input type="email" id="advisorEmail" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="your.email@example.com" />
                    </div>
                    <div>
                        <label htmlFor="advisorPassword" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input type="password" id="advisorPassword" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="********" />
                        <a href="#" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" onClick={() => showActionMessage('Forgot Password')}>
                            Forgot Password?
                        </a>
                    </div>
                </div>

                <button className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full" onClick={() => onNextScreen('AdvisorDashboard')}>
                    Login
                </button>

                {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
            </div>
        </div>
    );
};

// Component for Advisor Dashboard
const AdvisorDashboard = ({ onNextScreen }) => {
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

// Component for Client List
const ClientList = ({ onNextScreen }) => {
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

    const clients = [
        { id: 'client1', name: 'Jamal Mwangi', netWorth: '-KES 230,000', nextReview: 'Aug 15, 2025', status: 'Needs Review' },
        { id: 'client2', name: 'Aisha Khan', netWorth: 'KES 1,200,000', nextReview: 'Sep 10, 2025', status: 'On Track' },
        { id: 'client3', name: 'David Kimani', netWorth: 'KES 50,000', nextReview: 'Jul 20, 2025', status: 'Urgent Action' },
        { id: 'client4', name: 'Grace Wanjiku', netWorth: 'KES 800,000', nextReview: 'Oct 01, 2025', status: 'On Track' },
    ];

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Clients</h1>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                        <input type="text" placeholder="Search clients..." className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 flex-grow" />
                        <select className="shadow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500">
                            <option>All Statuses</option>
                            <option>Needs Review</option>
                            <option>On Track</option>
                            <option>Urgent Action</option>
                        </select>
                        <button className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md" onClick={() => showActionMessage('Add New Client')}>
                            Add New Client
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left rounded-tl-lg">Client Name</th>
                                    <th className="py-3 px-6 text-left">Net Worth</th>
                                    <th className="py-3 px-6 text-left">Next Review</th>
                                    <th className="py-3 px-6 text-left rounded-tr-lg">Status</th>
                                    <th className="py-3 px-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm font-light">
                                {clients.map((client) => (
                                    <tr key={client.id} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">{client.name}</td>
                                        <td className="py-3 px-6 text-left">{client.netWorth}</td>
                                        <td className="py-3 px-6 text-left">{client.nextReview}</td>
                                        <td className="py-3 px-6 text-left">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                client.status === 'Needs Review' ? 'bg-yellow-200 text-yellow-800' :
                                                client.status === 'On Track' ? 'bg-green-200 text-green-800' :
                                                'bg-red-200 text-red-800'
                                            }`}>
                                                {client.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-6 text-center">
                                            <button className="text-blue-500 hover:text-blue-700 font-medium text-sm" onClick={() => onNextScreen('ClientProfile')}>
                                                View Profile
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

// Component for Client Profile (Advisor View)
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

// Component for User Profile
const Profile = ({ onNextScreen }) => {
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

    const userProfile = {
        personal: {
            name: 'Jamal Mwangi',
            age: 27,
            occupation: 'Software Engineer',
            maritalStatus: 'Single',
        },
        contact: {
            email: 'jamal.mwangi@example.com',
            phone: '+254 7XX XXX XXX',
        },
        settings: {
            notifications: 'On',
            dataPrivacy: 'High',
            linkedAccounts: '2',
        },
        financialMilestones: {
            nextMajor: 'Home Purchase (5 years)',
            yearsToRetirement: '38 years (Age 65)',
            emergencyFundStatus: '75% Complete',
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Name:</strong> {userProfile.personal.name}</p>
                        <p><strong>Age:</strong> {userProfile.personal.age}</p>
                        <p><strong>Occupation:</strong> {userProfile.personal.occupation}</p>
                        <p><strong>Marital Status:</strong> {userProfile.personal.maritalStatus}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4" onClick={() => showActionMessage('Edit Personal Info')}>
                        Edit Personal Info
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Email:</strong> {userProfile.contact.email}</p>
                        <p><strong>Phone:</strong> {userProfile.contact.phone}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4" onClick={() => showActionMessage('Update Contact Info')}>
                        Update Contact Info
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Notifications:</strong> {userProfile.settings.notifications} <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage('Toggle Notifications')}>Toggle</button></p>
                        <p><strong>Data Privacy:</strong> {userProfile.settings.dataPrivacy} <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage('Adjust Data Privacy')}>Adjust</button></p>
                        <p><strong>Linked Accounts:</strong> {userProfile.settings.linkedAccounts} <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage('Manage Linked Accounts')}>Manage</button></p>
                    </div>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md mt-4" onClick={() => showActionMessage('Change Password')}>
                        Change Password
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Milestones Summary</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Next Major Milestone:</strong> <span className="font-bold text-blue-600">{userProfile.financialMilestones.nextMajor}</span></p>
                        <p><strong>Years to Retirement:</strong> <span className="font-bold text-blue-600">{userProfile.financialMilestones.yearsToRetirement}</span></p>
                        <p><strong>Emergency Fund Status:</strong> <span className="font-bold text-green-600">{userProfile.financialMilestones.emergencyFundStatus}</span></p>
                    </div>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md mt-4" onClick={() => showActionMessage('View Full Timeline')}>
                        View Full Timeline
                    </button>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};


// Bottom Navigation Bar Component
const BottomNavBar = ({ onTabClick }) => {
    const tabs = [
        { id: 'cashflows-section', name: 'Cashflows', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
        )},
        { id: 'balance-sheet-section', name: 'Balance Sheet', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
        )},
        { id: 'dashboard-section', name: 'Dashboard', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
        )},
        { id: 'tools-section', name: 'Tools', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 100 4m-3 13a3 3 0 116 0m-6 0a3 3 0 006 0m-6 0h6m-5-9a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
        )},
        { id: 'profile-section', name: 'Profile', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
        )},
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50">
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors duration-200 focus:outline-none p-2 rounded-lg"
                        onClick={() => onTabClick(tab.id)}
                    >
                        {tab.icon}
                        <span className="text-xs mt-1">{tab.name}</span>
                    </button>
                ))}
            </div>
        </nav>
    );
};


// Main App component to render all screens in a scrollable view
const App = () => {
    // Refs for each section to enable smooth scrolling
    const onboardingDataConnectionRef = useRef(null);
    const onboardingCashFlowRef = useRef(null);
    const cashflowsRef = useRef(null);
    const balanceSheetRef = useRef(null);
    const dashboardRef = useRef(null);
    const toolsRef = useRef(null);
    const profileRef = useRef(null);
    const advisorLoginRef = useRef(null);
    const advisorDashboardRef = useRef(null);
    const clientListRef = useRef(null);
    const clientProfileRef = useRef(null);


    // Map tab IDs to their respective refs
    const sectionRefs = {
        'onboarding-data-connection-section': onboardingDataConnectionRef,
        'onboarding-cash-flow-section': onboardingCashFlowRef,
        'cashflows-section': cashflowsRef,
        'balance-sheet-section': balanceSheetRef,
        'dashboard-section': dashboardRef,
        'tools-section': toolsRef,
        'profile-section': profileRef,
        'advisor-login-section': advisorLoginRef,
        'advisor-dashboard-section': advisorDashboardRef,
        'client-list-section': clientListRef,
        'client-profile-section': clientProfileRef,
    };

    // Function to handle tab clicks and scroll to the section
    const handleTabClick = (sectionId) => {
        sectionRefs[sectionId].current.scrollIntoView({ behavior: 'smooth' });
    };

    // Dummy onNextScreen function for components, as we are not navigating
    // This will now only show a message box for internal component actions
    const dummyOnNextScreen = (pageName) => {
        // This function would be used for internal navigation within a "tab" section
        // For this scrollable wireframe, it just logs or shows a message.
        console.log(`Internal navigation action: ${pageName}`);
        // You could extend MessageBox to show this if needed for internal actions
    };

    return (
        <div className="font-sans pb-16"> {/* Add padding-bottom to account for fixed bottom nav */}
            {/* Onboarding screens are typically shown before the main app,
                but for a scrollable wireframe, we'll place them at the top. */}
            <div ref={onboardingDataConnectionRef} className="mb-16" id="onboarding-data-connection-section">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-8 pt-8">1. Onboarding: Connect Your Finances</h2>
                <OnboardingDataConnection onNextScreen={dummyOnNextScreen} />
            </div>

            <div ref={onboardingCashFlowRef} className="mb-16" id="onboarding-cash-flow-section">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-8 pt-8">2. Onboarding: Tell Us About Your Spending</h2>
                <OnboardingCashFlowSetup onNextScreen={dummyOnNextScreen} />
            </div>

            {/* Main App Sections, corresponding to bottom tabs */}

            <section ref={cashflowsRef} id="cashflows-section" className="mb-16 pt-8">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Cashflows: Income & Expenses, Accounts</h2>
                <AccountsTransactions onNextScreen={dummyOnNextScreen} />
            </section>

            <section ref={balanceSheetRef} id="balance-sheet-section" className="mb-16 pt-8">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Balance Sheet: Assets & Liabilities Register</h2>
                <BalanceSheet onNextScreen={dummyOnNextScreen} />
                <p className="text-center text-gray-600 mt-4">
                    *This section includes a Net Worth Trend graph (from timeline) and detailed asset/liability registers.*
                </p>
            </section>

            <section ref={dashboardRef} id="dashboard-section" className="mb-16 pt-8">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Dashboard: Your Financial Overview</h2>
                {/* The UserDashboard component now serves as the primary content for the Dashboard tab */}
                <UserDashboard onNextScreen={dummyOnNextScreen} />
                <p className="text-center text-gray-600 mt-4">
                    *Timeline elements like Net Worth Projection and Goal Progress are integrated here.*
                </p>
            </section>

            <section ref={toolsRef} id="tools-section" className="mb-16 pt-8">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Tools: Budgeting, Simulations & Advice</h2>
                <GoalsOverview onNextScreen={dummyOnNextScreen} />
                <FIRECalculator onNextScreen={dummyOnNextScreen} />
                <MonteCarloSimulation onNextScreen={dummyOnNextScreen} />
                <DebtRepaymentPlanner onNextScreen={dummyOnNextScreen} />
                <AdviceModuleDetail onNextScreen={dummyOnNextScreen} />
                <LifetimeJourneyTimeline onNextScreen={dummyOnNextScreen} /> {/* Detailed timeline view */}
                <p className="text-center text-gray-600 mt-4">
                    *Goal tracking and advice (which are timeline-driven) are key tools here. The full Lifetime Journey Timeline is also accessible.*
                </p>
            </section>

            <section ref={profileRef} id="profile-section" className="mb-16 pt-8">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Profile</h2>
                <Profile onNextScreen={dummyOnNextScreen} />
                <p className="text-center text-gray-600 mt-4">
                    *This section shows a summary of 'Years to Retirement' or 'Next Major Milestone' (from timeline).*
                </p>
            </section>

            {/* Advisor Sections (can be separate or integrated based on app logic) */}
            <div className="mb-16 pt-8">
                <h2 className="text-4xl font-bold text-center text-gray-800 mb-8">Advisor Portal (Separate Access)</h2>
                <AdvisorLogin onNextScreen={dummyOnNextScreen} />
                <AdvisorDashboard onNextScreen={dummyOnNextScreen} />
                <ClientList onNextScreen={dummyOnNextScreen} />
                <ClientProfile onNextScreen={dummyOnNextScreen} />
            </div>

            <BottomNavBar onTabClick={handleTabClick} />
        </div>
    );
};

export default App;
