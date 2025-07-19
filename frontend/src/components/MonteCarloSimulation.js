import React, { useState } from 'react';
import MessageBox from './MessageBox';

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

export default MonteCarloSimulation;
