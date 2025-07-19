import React, { useState } from 'react';
import MessageBox from './MessageBox';

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

export default BalanceSheet;
