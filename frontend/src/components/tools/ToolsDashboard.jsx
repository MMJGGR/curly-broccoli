import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import IncomeManagement from './IncomeManagement';
import Layout from '../layout/Layout';
import GoalsOverview from '../goals/GoalsOverview';
import ExpenseManagement from './ExpenseManagement';
import AssetManagement from './AssetManagement';
import LiabilityManagement from './LiabilityManagement';
import GoalRealityCheck from './GoalRealityCheck';
import CashFlowStatement from './CashFlowStatement';
import IncomeStatement from './IncomeStatement';
import TrialBalanceAudit from './TrialBalanceAudit';

const ToolsDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSection = useMemo(() => {
    const sec = new URLSearchParams(location.search).get('section') || 'overview';
    return sec;
  }, [location.search]);
  const [activeSection, setActiveSection] = useState(initialSection);

  // Keep section in sync with query param
  useEffect(() => {
    const current = new URLSearchParams(location.search).get('section') || 'overview';
    if (current !== activeSection) setActiveSection(current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

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
      name: 'Goals & Reality Check', 
      icon: '🎯',
      description: 'Set goals and validate timelines vs surplus'
    },
    {
      id: 'expenses',
      name: 'Expense Management',
      icon: '💳',
      description: 'Expense tracking and budget analysis'
    },
    {
      id: 'assets',
      name: 'Asset Management',
      icon: '🏠',
      description: 'Complete asset portfolio tracking'
    },
    {
      id: 'liabilities',
      name: 'Liability Management',
      icon: '📋',
      description: 'Debt and liability tracking'
    },
    {
      id: 'trial-balance',
      name: 'Trial Balance (Audit)',
      icon: '🧾',
      description: 'Monthly totals, reconciliation, and suggestions'
    },
    {
      id: 'cashflow',
      name: 'Cash Flow Statement',
      icon: '💧',
      description: 'Operating/Investing/Financing net cash per month'
    },
    {
      id: 'pnl',
      name: 'Income Statement',
      icon: '📈',
      description: 'Monthly P&L with goal contributions'
    },
    {
      id: 'reports',
      name: 'Reports & Exports',
      icon: '📤',
      description: 'Download basic CSV exports (coming soon)'
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
            onClick={() => {
              setActiveSection(section.id);
              const params = new URLSearchParams(location.search);
              params.set('section', section.id);
              navigate({ search: params.toString() }, { replace: true });
            }}
          >
            <div className="flex items-center mb-4">
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
          <button onClick={() => setActiveSection('goals')} className="bg-white text-blue-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            Run Goal Reality Check
          </button>
          <button
            onClick={() => setActiveSection('trial-balance')}
            className="bg-white text-blue-700 px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-shadow"
          >
            Open Trial Balance
          </button>
        </div>
      </div>
    </div>
  );

  const renderPlaceholder = (title, description) => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-4" aria-hidden></div>
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

  // Fallback for unknown section ids
  const knownIds = new Set(toolSections.map(s => s.id));
  const safeSection = knownIds.has(activeSection) ? activeSection : 'overview';

  return (
    <div className="h-full bg-gray-50">
      {/* Header with Section Tabs */}
      <div className="bg-white shadow-sm border-b">
        <Layout className="py-4">
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
              <span className="font-medium">{toolSections.find(s => s.id === activeSection)?.name}</span>
              <span className="mx-2">•</span>
              <span>{toolSections.find(s => s.id === activeSection)?.description}</span>
            </div>
          )}
        </Layout>
      </div>

      {/* Content Area */}
      <Layout className="flex-1 overflow-auto py-6">
        {safeSection === 'overview' && renderOverview()}
        {safeSection === 'income' && <IncomeManagement />}
        {safeSection === 'goals' && (
          <div className="space-y-6">
            <GoalsOverview />
            <div className="max-w-6xl mx-auto">
              <GoalRealityCheck />
            </div>
          </div>
        )}
        {safeSection === 'expenses' && <ExpenseManagement />}
        {safeSection === 'assets' && <AssetManagement />}
        {safeSection === 'liabilities' && <LiabilityManagement />}
        {safeSection === 'trial-balance' && <TrialBalanceAudit />}
        {safeSection === 'cashflow' && <CashFlowStatement />}
        {safeSection === 'pnl' && (
          <div className="max-w-6xl mx-auto">
            <IncomeStatement months={12} />
          </div>
        )}
        {safeSection === 'reports' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Reports & Exports</h2>
            <p className="text-gray-600 mb-4">Download CSV exports for P&L and Journal.</p>
            <div className="flex flex-wrap gap-3">
              <a href={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/pl/statement.csv?months=12`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Download P&L (12m)</a>
              <a href={`${process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000'}/api/v1/ledger/journal.csv`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Download Journal (all)</a>
            </div>
          </div>
        )}
        {safeSection === 'calculators' && renderPlaceholder(
          'Financial Calculators',
          'Professional calculators for loan payments, investment returns, retirement planning, and more.'
        )}
        {safeSection === 'analysis' && renderPlaceholder(
          'Portfolio Analysis',
          'Advanced portfolio optimization, risk analysis, and asset allocation tools.'
        )}
        {safeSection === 'planning' && renderPlaceholder(
          'Financial Planning',
          'Comprehensive financial planning tools including estate planning, tax optimization, and scenario analysis.'
        )}
      </Layout>
    </div>
  );
};

export default ToolsDashboard;
