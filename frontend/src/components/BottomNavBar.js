// Enhanced Bottom Navigation with Contextual Timeline Intelligence
import React from 'react';
import LifecyclePhaseIndicator from './contextual/LifecyclePhaseIndicator';
import TimelineStatusBadge from './contextual/TimelineStatusBadge';
import { useTimeline } from '../contexts/TimelineContext';
import { useBudget } from '../contexts/BudgetContext';

const BottomNavBar = ({ onTabClick, activeTab = 'dashboard' }) => {
    const { persona, personaTheme } = useTimeline();
    const { actualSurplus, formatAmount } = useBudget();

    const tabs = [
        { id: 'budget', name: 'Budget', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-3-3c-1.115 0-2.01-.895-2.01-2s.895-2 2.01-2 2.01.895 2.01 2-.895 2-2.01 2z"></path>
            </svg>
        )},
        { id: 'balance-sheet', name: 'Balance Sheet', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
            </svg>
        )},
        { id: 'dashboard', name: 'Dashboard', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
            </svg>
        )},
        { id: 'goals', name: 'Tools', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 4a2 2 0 100 4m-3 13a3 3 0 116 0m-6 0a3 3 0 006 0m-6 0h6m-5-9a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0zm-3 4a1 1 0 11-2 0 1 1 0 012 0zm4 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
            </svg>
        )},
        { id: 'profile', name: 'Profile', icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
        )},
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 z-50 bottom-nav" data-testid="bottom-nav">
            {/* Contextual Timeline Intelligence Bar */}
            <div 
                className="px-4 py-2 border-b border-gray-200 flex items-center justify-between"
                style={{ 
                    backgroundColor: personaTheme?.secondary || '#f8fafc',
                    borderColor: `${personaTheme?.primary}20` || '#e2e8f020'
                }}
            >
                <div className="flex items-center space-x-3">
                    <LifecyclePhaseIndicator 
                        size="small" 
                        showDetails={false} 
                        showGuidance={false}
                    />
                    <TimelineStatusBadge 
                        size="small" 
                        showPercentage={false}
                        showDetails={false}
                        position="top"
                    />
                </div>
                
                {/* Smart Budget Status */}
                <div className="flex items-center space-x-2">
                    {actualSurplus !== undefined && (
                        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                            actualSurplus >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                            <span>{actualSurplus >= 0 ? '💰' : '⚠️'}</span>
                            <span>{formatAmount ? formatAmount(Math.abs(actualSurplus)) : Math.abs(actualSurplus)}</span>
                        </div>
                    )}
                    
                    {persona && (
                        <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: personaTheme?.primary || '#3b82f6' }}
                            title={`${persona} Profile`}
                        ></div>
                    )}
                </div>
            </div>
            
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
                        data-cy={`nav-${tab.id}`}
                        onClick={() => onTabClick(tab.id)}
                    >
                        {tab.icon}
                        <span className="text-xs mt-1">{tab.name}</span>
                        
                        {/* Smart Status Indicators */}
                        {tab.id === 'budget' && activeTab !== 'budget' && actualSurplus !== undefined && (
                            <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                                actualSurplus >= 0 ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                        )}
                        
                        {tab.id === 'dashboard' && activeTab !== 'dashboard' && (
                            <div 
                                className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                                style={{ backgroundColor: personaTheme?.primary || '#3b82f6' }}
                            ></div>
                        )}
                        
                        {tab.id === 'goals' && activeTab !== 'goals' && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border-2 border-white"></div>
                        )}
                    </button>
                ))}
            </div>
        </nav>
    );
};

export default BottomNavBar;
