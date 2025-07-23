// TODO: Use src/api.js listAccounts() and listTransactions() to fetch data (Epic 3 Stories 2 & 7, ~70% of account register after integration)
import React, { useState } from 'react';
import MessageBox from './MessageBox';

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

export default AccountsTransactions;
