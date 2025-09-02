import React, { useState } from 'react';
import IncomeOverview from '../income/IncomeOverview';
import GoalsOverview from '../goals/GoalsOverview';
import ExpenseManagement from './ExpenseManagement';

const ToolsDashboard = () => {
  const [activeSection, setActiveSection] = useState('overview');

  const toolSections = [
    {
      id: 'overview',
      name: 'Tools Overview',
      icon: '🏠',
      description: 'Quick access to all financial tools'
    },
    {
      id: 'income',
      name: 'Income Management',
      icon: '💰',
      description: 'CFA-compliant income analysis and planning'
    },
    {
      id: 'goals',
      name: 'Goals Management', 
      icon: '🎯',
      description: 'SMART goals framework and tracking'
    },
    {
      id: 'expenses',
      name: 'Expense Management',
      icon: '💳',
      description: 'Expense tracking and budget analysis'
    },
    {
      id: 'calculators',
      name: 'Financial Calculators',
      icon: '🧮',
      description: 'Professional financial calculation tools'
    },
    {
      id: 'analysis',
      name: 'Portfolio Analysis',
      icon: '📊',
      description: 'Investment and risk analysis tools'
    },
    {
      id: 'planning',
      name: 'Financial Planning',
      icon: '📋',
      description: 'Comprehensive financial planning tools'
    }
  ];

  const renderOverview = () => (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Professional Financial Tools</h2>
        <p className="text-gray-600">CFA-compliant financial management and analysis tools for comprehensive financial planning.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {toolSections.filter(section => section.id !== 'overview').map(section => (
          <div
            key={section.id}
            className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 cursor-pointer border border-gray-100"
            onClick={() => setActiveSection(section.id)}
          >
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-4">{section.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800">{section.name}</h3>
            </div>
            <p className="text-gray-600 mb-4">{section.description}</p>
            <div className="flex items-center text-blue-600 font-medium">
              <span>Access Tool</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>
      
      {/* Quick Actions */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setActiveSection('income')}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            Add Income Source
          </button>
          <button
            onClick={() => setActiveSection('goals')}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            Create New Goal
          </button>
          <button className="bg-white text-blue-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            Run Financial Health Check
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title, description) => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{title}</h2>
        <p className="text-gray-600 mb-6">{description}</p>
        <button
          onClick={() => setActiveSection('overview')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Tools Overview
        </button>
      </div>
    </div>
  );

  return (
    <div className="h-full bg-gray-50">
      {/* Header with Section Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Financial Tools</h1>
            {activeSection !== 'overview' && (
              <button
                onClick={() => setActiveSection('overview')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                ← Back to Tools
              </button>
            )}
          </div>
          
          {/* Current Section Info */}
          {activeSection !== 'overview' && (
            <div className="flex items-center text-sm text-gray-600">
              <span className="text-lg mr-2">{toolSections.find(s => s.id === activeSection)?.icon}</span>
              <span className="font-medium">{toolSections.find(s => s.id === activeSection)?.name}</span>
              <span className="mx-2">•</span>
              <span>{toolSections.find(s => s.id === activeSection)?.description}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'overview' && renderOverview()}
        {activeSection === 'income' && <IncomeOverview />}
        {activeSection === 'goals' && <GoalsOverview />}
        {activeSection === 'expenses' && <ExpenseManagement />}
        {activeSection === 'calculators' && renderPlaceholder(
          'Financial Calculators',
          'Professional calculators for loan payments, investment returns, retirement planning, and more.'
        )}
        {activeSection === 'analysis' && renderPlaceholder(
          'Portfolio Analysis',
          'Advanced portfolio optimization, risk analysis, and asset allocation tools.'
        )}
        {activeSection === 'planning' && renderPlaceholder(
          'Financial Planning',
          'Comprehensive financial planning tools including estate planning, tax optimization, and scenario analysis.'
        )}
      </div>
    </div>
  );
};

export default ToolsDashboard;