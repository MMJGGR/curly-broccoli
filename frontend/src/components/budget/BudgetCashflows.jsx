/**
 * Budget & Cashflows Component - Phase 1 of Budget Integration Epic
 * CFA-guided personal finance budgeting with smart defaults and goal alignment
 * Enhanced with contextual timeline integration for phase-aware guidance
 */
import React, { useState } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';
import { useBudget } from '../../contexts/BudgetContext';
import { 
  LifecyclePhaseIndicator, 
  ContextualGuidance, 
  TimelineProgressWidget, 
  TimelineAlert,
  usePhaseDefaults
} from '../timeline/ContextualTimelineSystem';

const BudgetCashflows = () => {
  const {
    persona,
    personaTheme,
    loading: timelineLoading,
  } = useTimeline();

  const {
    budgetData,
    totalExpenses,
    actualSurplus,
    loading,
    error,
    isEditing,
    budgetPeriod,
    hasUnsavedChanges,
    updateBudgetItem,
    setEditingMode,
    setBudgetPeriod,
    handleSaveAndExit,
    formatAmount,
  } = useBudget();

  // Component state
  const [activeTab, setActiveTab] = useState('planning');
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  
  // Phase-aware defaults for smarter budgeting
  const phaseDefaults = usePhaseDefaults();


  // Budget categories with CFA-level organization
  const budgetCategories = {
    income: [
      { key: 'salary', label: 'Primary Salary', icon: '💼' },
      { key: 'bonuses', label: 'Bonuses & Commissions', icon: '🎯' },
      { key: 'investments', label: 'Investment Income', icon: '📈' },
      { key: 'other', label: 'Other Income', icon: '💰' }
    ],
    fixedExpenses: [
      { key: 'rent', label: 'Housing/Rent', icon: '🏠', required: true },
      { key: 'utilities', label: 'Utilities', icon: '⚡', required: true },
      { key: 'loanRepayments', label: 'Loan Repayments', icon: '🏦', required: true },
      { key: 'blackTax', label: 'Family Support', icon: '👨‍👩‍👧‍👦', required: true },
      { key: 'insurance', label: 'Insurance Premiums', icon: '🛡️' }
    ],
    variableExpenses: [
      { key: 'groceries', label: 'Groceries', icon: '🛒', required: true },
      { key: 'transport', label: 'Transportation', icon: '🚗', required: true },
      { key: 'dining', label: 'Dining Out', icon: '🍽️' },
      { key: 'entertainment', label: 'Entertainment', icon: '🎬' },
      { key: 'clothing', label: 'Clothing', icon: '👔' },
      { key: 'healthcare', label: 'Healthcare', icon: '🏥' },
      { key: 'personalCare', label: 'Personal Care', icon: '💅' },
      { key: 'miscellaneous', label: 'Miscellaneous', icon: '📝' }
    ],
    goalAllocations: [
      { key: 'emergencyFund', label: 'Emergency Fund', icon: '🚨' },
      { key: 'retirement', label: 'Retirement Savings', icon: '🏖️' },
      { key: 'education', label: 'Education Fund', icon: '🎓' },
      { key: 'investments', label: 'Investment Portfolio', icon: '📊' }
    ]
  };



  // Get persona-specific recommendations
  const getPersonaRecommendations = () => {
    const recommendations = {
      'Jamal': [
        'Increase investment allocation by 10% for better long-term growth',
        'Consider tax-advantaged retirement accounts',
        'Build emergency fund to 6 months of expenses'
      ],
      'Aisha': [
        'Prioritize education fund for children',
        'Ensure adequate family insurance coverage',
        'Balance family needs with retirement savings'
      ],
      'Samuel': [
        'Focus on wealth preservation strategies',
        'Consider healthcare cost inflation in planning',
        'Optimize tax-efficient withdrawal strategies'
      ]
    };

    return recommendations[persona] || [
      'Review and optimize your budget quarterly',
      'Align spending with long-term financial goals',
      'Build emergency fund before aggressive investing'
    ];
  };

  // Loading state
  if (loading || timelineLoading) {
    return (
      <div className="budget-cashflows h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Budget...</h2>
          <p className="text-gray-500 mt-2">Preparing your financial planning tools</p>
        </div>
      </div>
    );
  }

  return (
    <div className="budget-cashflows flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header with budget overview and period selector */}
      <div 
        className="budget-header p-6 bg-white shadow-lg border-b border-gray-200 rounded-t-xl mx-4 mt-4"
        style={{ 
          background: `linear-gradient(135deg, ${personaTheme?.secondary || '#f8fafc'} 0%, white 100%)`,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
        data-cy="budget-header"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
          {/* Title and overview */}
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                <span className="mr-3">💰</span>
                Budget & Cashflows
              </h1>
              <LifecyclePhaseIndicator size="medium" showDetails={false} />
            </div>
            <div className="flex flex-wrap items-center space-x-6 mt-2 text-sm">
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Monthly Income:</span>
                <span className="font-semibold text-green-600">
                  {formatAmount(budgetData?.monthlyIncome || 0)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Total Expenses:</span>
                <span className="font-semibold text-red-600">
                  {formatAmount(totalExpenses)}
                </span>
              </div>
              <div className="flex items-center">
                <span className="text-gray-600 mr-2">Available Surplus:</span>
                <span 
                  className={`font-semibold ${actualSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  data-cy="actual-surplus"
                >
                  {formatAmount(actualSurplus)}
                </span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <span>Recommended savings: {Math.round(phaseDefaults.recommendedSavingsRate * 100)}% • Emergency fund: {phaseDefaults.emergencyFundMonths} months</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-4">
            {/* Period Selector */}
            <div className="flex bg-white rounded-lg p-1 border border-gray-200">
              <button
                onClick={() => setBudgetPeriod('monthly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  budgetPeriod === 'monthly' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBudgetPeriod('annual')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  budgetPeriod === 'annual' 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Annual
              </button>
            </div>

            {/* Edit/Save Button */}
            <button
              onClick={isEditing ? handleSaveAndExit : () => setEditingMode(true)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isEditing 
                  ? `bg-green-600 text-white hover:bg-green-700 ${hasUnsavedChanges ? '' : 'opacity-75'}` 
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              disabled={isEditing && !hasUnsavedChanges}
            >
              {isEditing ? (hasUnsavedChanges ? 'Save Budget' : 'Saved') : 'Edit Budget'}
            </button>

            {/* Mobile Panel Toggle */}
            <button
              onClick={() => setShowMobilePanel(!showMobilePanel)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="budget-content flex-1 flex overflow-hidden mx-4 mb-4">
        <div className="flex-1 flex bg-white rounded-xl shadow-xl overflow-hidden"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        >
        
        {/* Budget Planning Area (70% on desktop, full on mobile) */}
        <div className={`budget-area ${showMobilePanel ? 'hidden md:flex' : 'flex'} md:w-7/10 w-full flex-col`}>
          
          {/* Tab Navigation */}
          <div className="tab-navigation bg-white border-b border-gray-200 px-4">
            <div className="flex space-x-8">
              {[
                { key: 'planning', label: 'Budget Planning', icon: '📊' },
                { key: 'tracking', label: 'Transaction Tracking', icon: '📈' },
                { key: 'analysis', label: 'Analysis & Insights', icon: '🔍' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="tab-content flex-1 overflow-y-auto p-4">
            
            {/* Budget Planning Tab */}
            {activeTab === 'planning' && (
              <div className="budget-planning space-y-6">
                
                {/* Timeline-aware alerts */}
                <TimelineAlert className="mb-4" />
                
                {/* Contextual guidance for budget planning */}
                <ContextualGuidance context="budget-dashboard" className="mb-6" />
                
                {/* Income Section */}
                <div className="income-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">💼</span>
                    Monthly Income
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Primary Salary</label>
                        <p className="text-xs text-gray-500 mt-1">Your main source of income</p>
                      </div>
                      <div className="text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={budgetData?.monthlyIncome || 0}
                            onChange={(e) => updateBudgetItem('monthlyIncome', null, e.target.value)}
                            className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-lg font-semibold text-green-600">
                            {formatAmount(budgetData?.monthlyIncome || 0)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Expenses Section */}
                <div className="fixed-expenses-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🏠</span>
                    Fixed Expenses
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                    {budgetCategories.fixedExpenses.map(category => (
                      <div key={category.key} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{category.icon}</span>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {category.label}
                              {category.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                          </div>
                        </div>
                        <div className="text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={budgetData?.expenses?.[category.key] || 0}
                              onChange={(e) => updateBudgetItem('expenses', category.key, e.target.value)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right focus:ring-blue-500 focus:border-blue-500"
                              data-cy={`expense-${category.key}`}
                            />
                          ) : (
                            <span className="text-lg font-semibold text-gray-800">
                              {formatAmount(budgetData?.expenses?.[category.key] || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variable Expenses Section */}
                <div className="variable-expenses-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🛒</span>
                    Variable Expenses
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                    {budgetCategories.variableExpenses.map(category => (
                      <div key={category.key} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{category.icon}</span>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {category.label}
                              {category.required && <span className="text-red-500 ml-1">*</span>}
                            </label>
                          </div>
                        </div>
                        <div className="text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={budgetData?.expenses?.[category.key] || 0}
                              onChange={(e) => updateBudgetItem('expenses', category.key, e.target.value)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right focus:ring-blue-500 focus:border-blue-500"
                              data-cy={`expense-${category.key}`}
                            />
                          ) : (
                            <span className="text-lg font-semibold text-gray-800">
                              {formatAmount(budgetData?.expenses?.[category.key] || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goal Allocations Section */}
                <div className="goal-allocations-section">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🎯</span>
                    Goal-Aligned Allocations
                  </h3>
                  <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-200">
                    {budgetCategories.goalAllocations.map(goal => (
                      <div key={goal.key} className="p-4 flex items-center justify-between">
                        <div className="flex items-center">
                          <span className="text-xl mr-3">{goal.icon}</span>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              {goal.label}
                            </label>
                            {goal.target && (
                              <p className="text-xs text-gray-500 mt-1">
                                Target: R{goal.target.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          {isEditing ? (
                            <input
                              type="number"
                              value={budgetData?.goalAllocations?.[goal.key] || 0}
                              onChange={(e) => updateBudgetItem('goalAllocations', goal.key, e.target.value)}
                              className="w-32 px-3 py-2 border border-gray-300 rounded-md text-right focus:ring-blue-500 focus:border-blue-500"
                              data-cy={`goal-${goal.key}`}
                            />
                          ) : (
                            <span className="text-lg font-semibold text-blue-600">
                              {formatAmount(budgetData?.goalAllocations?.[goal.key] || 0)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Surplus Summary */}
                <div className="surplus-summary">
                  <div className={`p-4 rounded-lg ${actualSurplus >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-800">Monthly Surplus/Deficit</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Income - Expenses - Goal Allocations
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`text-2xl font-bold ${actualSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatAmount(actualSurplus)}
                        </span>
                        <p 
                          className="text-sm text-gray-500 mt-1"
                          data-cy="surplus-message"
                        >
                          {actualSurplus >= 0 ? 'Available for additional goals' : 'Budget adjustment needed'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* Transaction Tracking Tab */}
            {activeTab === 'tracking' && (
              <div className="transaction-tracking">
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">📈</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Transaction Tracking</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Connect your accounts and track spending against your budget in real-time. 
                    This feature will be available in Phase 2 of the Budget Integration Epic.
                  </p>
                  <div className="space-y-3 text-sm text-gray-500">
                    <p>🔒 Secure account connections</p>
                    <p>📊 Real-time spend analysis</p>
                    <p>🚨 Budget alerts and notifications</p>
                    <p>🎯 Goal progress tracking</p>
                  </div>
                </div>
              </div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <div className="budget-analysis">
                <div className="text-center py-12">
                  <div className="text-6xl mb-6">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Budget Analysis & Insights</h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Get professional-grade budget analysis with trend insights, optimization recommendations, 
                    and goal impact calculations.
                  </p>
                  <div className="space-y-3 text-sm text-gray-500">
                    <p>📊 Spending trend analysis</p>
                    <p>🎯 Goal achievement projections</p>
                    <p>💡 Optimization recommendations</p>
                    <p>📈 Timeline impact modeling</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Sidebar with quick actions and health indicators (30% on desktop, overlay on mobile) */}
        <div className={`
          budget-sidebar bg-white border-l border-gray-200
          ${showMobilePanel ? 'fixed inset-y-0 right-0 w-80 shadow-xl z-50 md:relative md:inset-auto md:w-3/10 md:shadow-none' : 'hidden md:flex md:w-3/10'}
          flex flex-col
        `}>
          
          {/* Sidebar Header */}
          <div className="sidebar-header p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Budget Health</h3>
              <button
                onClick={() => setShowMobilePanel(false)}
                className="md:hidden text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="sidebar-content flex-1 overflow-y-auto p-4 space-y-6">
            
            {/* Timeline Progress Widget */}
            <TimelineProgressWidget showDetails={true} orientation="vertical" />
            
            {/* Budget Health Score */}
            <div className="health-score">
              <h4 className="font-medium text-gray-800 mb-3">Budget Health</h4>
              <div className="text-center">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-bold text-white"
                  style={{ backgroundColor: actualSurplus >= 0 ? '#16a34a' : '#dc2626' }}
                >
                  {actualSurplus >= 0 ? '85' : '45'}%
                </div>
                <p className="text-sm text-gray-600">
                  {actualSurplus >= 0 ? 'Excellent budget control' : 'Needs optimization'}
                </p>
                <div className="mt-2 text-xs text-gray-500">
                  Phase-appropriate allocation: {phaseDefaults.assetAllocation.equity}% growth / {phaseDefaults.assetAllocation.bonds}% stability
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
              <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200">
                  <div className="font-medium text-blue-800">📊 Export Budget</div>
                  <div className="text-sm text-blue-600">Download as Excel/PDF</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200">
                  <div className="font-medium text-green-800">🎯 Set New Goal</div>
                  <div className="text-sm text-green-600">Add financial milestone</div>
                </button>
                <button className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200">
                  <div className="font-medium text-purple-800">📈 View Trends</div>
                  <div className="text-sm text-purple-600">Analyze spending patterns</div>
                </button>
              </div>
            </div>

            {/* Persona Recommendations */}
            <div className="persona-recommendations" data-cy="persona-recommendations">
              <h4 className="font-medium text-gray-800 mb-3">
                {persona} Recommendations
              </h4>
              <div className="space-y-3">
                {getPersonaRecommendations().map((rec, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700">{rec}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Budget Breakdown Chart Placeholder */}
            <div className="budget-chart">
              <h4 className="font-medium text-gray-800 mb-3">Expense Breakdown</h4>
              <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <p className="text-sm text-gray-500">Interactive chart coming soon</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Mobile Panel Backdrop */}
        {showMobilePanel && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowMobilePanel(false)}
          />
        )}

        </div>
      </div>
    </div>
  );
};

export default BudgetCashflows;