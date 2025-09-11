/**
 * Budget & Cashflows Component - Phase 1 of Budget Integration Epic
 * CFA-guided personal finance budgeting with smart defaults and goal alignment
 * Enhanced with contextual timeline integration for phase-aware guidance
 * Updated: React Hooks compliance fixed
 */
import React, { useState } from 'react';
import { useTimeline } from '../../contexts/TimelineContext';
import { useBudget } from '../../contexts/BudgetContext';
// import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

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
    formatAmount,
    refreshBudgetData
  } = useBudget();

  // Get real financial data from UnifiedFinancialContext (available for future use)
  // const {
  //   incomeSource,
  //   expenses,
  //   goals,
  //   assets,
  //   liabilities
  // } = useUnifiedFinancialContext();

  // Component state
  const [activeTab, setActiveTab] = useState('planning');
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  // Calculate total goal allocations (must be before early returns)
  const totalGoalAllocations = React.useMemo(() => {
    if (!budgetData?.goalAllocations) return 0;
    return Object.values(budgetData.goalAllocations).reduce((total, amount) => total + (parseFloat(amount) || 0), 0);
  }, [budgetData?.goalAllocations]);

  // Import handlers
  const handleImportClose = () => {
    setShowImportModal(false);
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

  // Get dynamic recommendations based on actual financial data (NO HARDCODED VALUES)
  const getPersonaRecommendations = () => {
    const recommendations = [];
    
    // Generate recommendations based on actual financial data
    if (surplus > 0) {
      recommendations.push('Great job! You have positive cash flow. Consider increasing investments.');
    } else {
      recommendations.push('Your expenses exceed income. Review and reduce variable expenses.');
    }
    
    if (monthlyIncome > 0) {
      const savingsRate = (surplus / monthlyIncome) * 100;
      if (savingsRate >= 20) {
        recommendations.push(`Excellent savings rate of ${savingsRate.toFixed(1)}%. You're on track for financial independence.`);
      } else if (savingsRate >= 10) {
        recommendations.push(`Good savings rate of ${savingsRate.toFixed(1)}%. Consider increasing to 20% for optimal growth.`);
      } else {
        recommendations.push(`Low savings rate of ${savingsRate.toFixed(1)}%. Aim for at least 20% of income.`);
      }
    }
    
    // Add general recommendation
    recommendations.push('Review and optimize your budget quarterly for best results.');
    
    return recommendations;
  };

  // Safely get budget values with defaults
  const getBudgetValue = (key, defaultValue = 0) => {
    return budgetData?.[key] || defaultValue;
  };

  const monthlyIncome = getBudgetValue('monthlyIncome', 0);
  const totalBudgetedExpenses = totalExpenses || 0;
  const surplus = actualSurplus || (monthlyIncome - totalBudgetedExpenses);

  return (
    <div className="budget-cashflows flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100" style={{ height: 'calc(100vh - 4rem)' }}>
      {/* Header with budget overview */}
      <div 
        className="budget-header p-6 bg-white shadow-lg border-b border-gray-200 rounded-t-xl mx-4 mt-4"
        style={{ 
          background: `linear-gradient(135deg, ${personaTheme?.secondary || '#f8fafc'} 0%, white 100%)`,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Budget & Cashflow Planning
            </h1>
            <p className="text-gray-600">
              Smart budgeting with {persona}'s financial profile
            </p>
          </div>
          
          {/* Budget Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:w-2/3">
            {/* Monthly Income */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-medium text-green-700 mb-1">Monthly Income</h3>
              <p className="text-2xl font-bold text-green-800">
                {formatAmount ? formatAmount(monthlyIncome) : `KES ${monthlyIncome.toLocaleString()}`}
              </p>
            </div>
            
            {/* Total Expenses */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h3 className="text-sm font-medium text-red-700 mb-1">Total Expenses</h3>
              <p className="text-2xl font-bold text-red-800">
                {formatAmount ? formatAmount(totalBudgetedExpenses) : `KES ${totalBudgetedExpenses.toLocaleString()}`}
              </p>
            </div>
            
            {/* Surplus/Deficit */}
            <div className={`p-4 rounded-lg border ${surplus >= 0 ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200'}`}>
              <h3 className={`text-sm font-medium mb-1 ${surplus >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                {surplus >= 0 ? 'Surplus' : 'Deficit'}
              </h3>
              <p className={`text-2xl font-bold ${surplus >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>
                {formatAmount ? formatAmount(Math.abs(surplus)) : `KES ${Math.abs(surplus).toLocaleString()}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 overflow-hidden">
        {/* Budget Planning Panel */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Budget Categories</h2>
            
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
              <button
                onClick={() => setActiveTab('planning')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'planning'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Budget Planning
              </button>
              <button
                onClick={() => setActiveTab('analysis')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'analysis'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Analysis
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'planning' && (
              <div className="space-y-6">
                {/* Income Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    💰 Income Sources
                  </h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Primary Income</span>
                      <span className="font-semibold text-green-700">
                        {formatAmount ? formatAmount(monthlyIncome) : `KES ${monthlyIncome.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Expenses Section */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                    💳 Expense Categories
                  </h3>
                  <div className="space-y-3">
                    {budgetData?.categories && Object.entries(budgetData.categories).map(([key, category]) => (
                      <div key={key} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="font-semibold text-gray-800">
                            {formatAmount ? formatAmount(category) : `KES ${category.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Show custom categories */}
                    {budgetData?.customCategories && Object.entries(budgetData.customCategories).map(([key, customCat]) => (
                      <div key={key} className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700 font-medium">{customCat.name}</span>
                          <span className="font-semibold text-blue-800">
                            {formatAmount ? formatAmount(customCat.amount) : `KES ${customCat.amount.toLocaleString()}`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goals Section */}
                {totalGoalAllocations > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      🎯 Goal Allocations
                    </h3>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Total Goal Savings</span>
                        <span className="font-semibold text-purple-700">
                          {formatAmount ? formatAmount(totalGoalAllocations) : `KES ${totalGoalAllocations.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="space-y-6">
                {/* Financial Health */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Financial Health</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-700 mb-2">Savings Rate</h4>
                      <p className="text-2xl font-bold text-blue-800">
                        {monthlyIncome > 0 ? `${((surplus / monthlyIncome) * 100).toFixed(1)}%` : '0%'}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-medium text-green-700 mb-2">Expense Ratio</h4>
                      <p className="text-2xl font-bold text-green-800">
                        {monthlyIncome > 0 ? `${((totalBudgetedExpenses / monthlyIncome) * 100).toFixed(1)}%` : '0%'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Recommendations</h3>
                  <div className="space-y-2">
                    {getPersonaRecommendations().map((recommendation, index) => (
                      <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                        <p className="text-sm text-yellow-800">{recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:w-80 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Import Transactions
            </button>
            
            <button
              onClick={refreshBudgetData}
              className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
            >
              Refresh Data
            </button>
            
            <button
              onClick={() => setShowMobilePanel(!showMobilePanel)}
              className="w-full bg-gray-500 text-white py-3 px-4 rounded-lg hover:bg-gray-600 transition-colors lg:hidden"
            >
              {showMobilePanel ? 'Hide' : 'Show'} Details
            </button>
          </div>

          {/* Budget Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Budget Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Categories:</span>
                <span className="font-medium">
                  {budgetData?.categories ? Object.keys(budgetData.categories).length : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Goals:</span>
                <span className="font-medium">
                  {budgetData?.goalAllocations ? Object.keys(budgetData.goalAllocations).length : 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`font-medium ${surplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {surplus >= 0 ? 'Balanced' : 'Over Budget'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Import Transactions</h3>
            <p className="text-gray-600 mb-4">Import functionality temporarily unavailable.</p>
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  if (refreshBudgetData) refreshBudgetData();
                  handleImportClose();
                }}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Refresh Data
              </button>
              <button 
                onClick={handleImportClose}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCashflows;