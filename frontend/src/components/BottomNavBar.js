// Enhanced Bottom Navigation
import React from 'react';

const BottomNavBar = ({ onTabClick, activeTab = 'dashboard' }) => {

    const tabs = [
        { id: 'dashboard', name: 'Dashboard', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
        )},
        { id: 'plan', name: 'Plan', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6M7 8h10m1-4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2z"></path>
            </svg>
        )},
        { id: 'balance-sheet', name: 'Balance Sheet', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
        )},
        { id: 'cash-flow', name: 'Cash Flow', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-3-3c-1.115 0-2.01-.895-2.01-2s.895-2 2.01-2 2.01.895 2.01 2-.895 2-2.01 2z"></path>
            </svg>
        )},
        { id: 'timeline', name: 'Timeline', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v8m-6-4h12m-9 8h6a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
        )},
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 bottom-nav" data-testid="bottom-nav">
            
            {/* Navigation Tabs */}
            <div className="flex justify-around items-center h-16">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        className={`flex flex-col items-center justify-center transition-colors duration-200 focus:outline-none p-2 rounded-lg relative ${
                            activeTab === tab.id 
                                ? 'text-blue-600' 
                                : 'text-gray-600 hover:text-blue-600'
                        }`}
                        data-cy={tab.id === 'cash-flow' ? 'nav-budget' : `nav-${tab.id}`}
                        data-testid={tab.id === 'cash-flow' ? 'nav-budget' : undefined}
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

export default BottomNavBar;
