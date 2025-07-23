// TODO: Use listMilestones() for timeline events (Epic 2 Story 1, ~75% once connected)
import React, { useState } from 'react';
import MessageBox from './MessageBox';

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

export default LifetimeJourneyTimeline;
