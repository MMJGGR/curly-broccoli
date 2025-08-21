import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import TransactionList from './TransactionList';
import TransactionForm from './TransactionForm';
import TransactionImportNew from './TransactionImportNew';
import BudgetOverview from '../budget/BudgetOverview';

const TransactionDashboard = () => {
  const {
    transactions,
    accounts,
    budgetOverview,
    spendingAnalytics,
    isLoading,
    error,
    fetchTransactions,
    fetchAccounts,
    fetchBudgetOverview,
    fetchSpendingAnalytics,
    getBudgetComparison
  } = useTransactions();

  const [activeTab, setActiveTab] = useState('overview');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [budgetComparison, setBudgetComparison] = useState(null);

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchAccounts(),
        fetchTransactions({ limit: 10 }),
        fetchBudgetOverview(),
        fetchSpendingAnalytics()
      ]);

      try {
        const comparison = await getBudgetComparison();
        setBudgetComparison(comparison);
      } catch (error) {
        console.error('Failed to fetch budget comparison:', error);
      }
    };

    loadData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount || 0));
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
  };

  const getNetCashFlow = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'transactions', name: 'Transactions', icon: '💳' },
    { id: 'budget', name: 'Budget', icon: '📈' },
    { id: 'analytics', name: 'Analytics', icon: '📋' }
  ];

  if (error && !transactions.length) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"bg-white p-8 rounded-lg shadow-sm max-w-md w-full\">
          <div className=\"text-center\">
            <div className=\"text-red-500 text-6xl mb-4\">⚠️</div>
            <h2 className=\"text-xl font-semibold text-gray-900 mb-2\">Something went wrong</h2>
            <p className=\"text-gray-600 mb-6\">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg\"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {/* Header */}
        <div className=\"mb-8\">
          <div className=\"flex justify-between items-center\">
            <div>
              <h1 className=\"text-3xl font-bold text-gray-900\">Financial Dashboard</h1>
              <p className=\"text-gray-600 mt-2\">Track your transactions, budget, and spending insights</p>
            </div>
            
            <div className=\"flex space-x-3\">
              <button
                onClick={() => setShowImportModal(true)}
                className=\"bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg flex items-center\"
              >
                <span className=\"mr-2\">📤</span>
                Import CSV
              </button>
              <button
                onClick={() => setShowTransactionForm(true)}
                className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center\"
              >
                <span className=\"mr-2\">➕</span>
                Add Transaction
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className=\"border-b border-gray-200 mb-8\">
          <nav className=\"-mb-px flex space-x-8\">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className=\"space-y-8\">
            {/* Financial Summary Cards */}
            <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6\">
              <div className=\"bg-white overflow-hidden shadow-sm rounded-lg\">
                <div className=\"p-6\">
                  <div className=\"flex items-center\">
                    <div className=\"flex-shrink-0\">
                      <div className=\"w-8 h-8 bg-green-100 rounded-full flex items-center justify-center\">
                        <span className=\"text-green-600 text-lg\">💰</span>
                      </div>
                    </div>
                    <div className=\"ml-4 w-0 flex-1\">
                      <dl>
                        <dt className=\"text-sm font-medium text-gray-500 truncate\">Total Income</dt>
                        <dd className=\"text-lg font-semibold text-green-600\">
                          {formatCurrency(getTotalIncome())}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className=\"bg-white overflow-hidden shadow-sm rounded-lg\">
                <div className=\"p-6\">
                  <div className=\"flex items-center\">
                    <div className=\"flex-shrink-0\">
                      <div className=\"w-8 h-8 bg-red-100 rounded-full flex items-center justify-center\">
                        <span className=\"text-red-600 text-lg\">💸</span>
                      </div>
                    </div>
                    <div className=\"ml-4 w-0 flex-1\">
                      <dl>
                        <dt className=\"text-sm font-medium text-gray-500 truncate\">Total Expenses</dt>
                        <dd className=\"text-lg font-semibold text-red-600\">
                          {formatCurrency(getTotalExpenses())}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className=\"bg-white overflow-hidden shadow-sm rounded-lg\">
                <div className=\"p-6\">
                  <div className=\"flex items-center\">
                    <div className=\"flex-shrink-0\">
                      <div className={`w-8 h-8 ${getNetCashFlow() >= 0 ? 'bg-blue-100' : 'bg-orange-100'} rounded-full flex items-center justify-center`}>
                        <span className={`${getNetCashFlow() >= 0 ? 'text-blue-600' : 'text-orange-600'} text-lg`}>
                          {getNetCashFlow() >= 0 ? '📈' : '📉'}
                        </span>
                      </div>
                    </div>
                    <div className=\"ml-4 w-0 flex-1\">
                      <dl>
                        <dt className=\"text-sm font-medium text-gray-500 truncate\">Net Cash Flow</dt>
                        <dd className={`text-lg font-semibold ${getNetCashFlow() >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                          {formatCurrency(getNetCashFlow())}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className=\"bg-white overflow-hidden shadow-sm rounded-lg\">
                <div className=\"p-6\">
                  <div className=\"flex items-center\">
                    <div className=\"flex-shrink-0\">
                      <div className=\"w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center\">
                        <span className=\"text-purple-600 text-lg\">🏦</span>
                      </div>
                    </div>
                    <div className=\"ml-4 w-0 flex-1\">
                      <dl>
                        <dt className=\"text-sm font-medium text-gray-500 truncate\">Net Worth</dt>
                        <dd className=\"text-lg font-semibold text-purple-600\">
                          {formatCurrency(budgetOverview?.netWorth || 0)}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Budget Overview */}
            {budgetComparison && (
              <div className=\"bg-white shadow-sm rounded-lg\">
                <div className=\"px-6 py-4 border-b border-gray-200\">
                  <h3 className=\"text-lg font-medium text-gray-900\">Budget vs Actual (This Month)</h3>
                </div>
                <div className=\"p-6\">
                  <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6 mb-6\">
                    <div className=\"text-center\">
                      <div className=\"text-2xl font-bold text-blue-600\">
                        {formatCurrency(budgetComparison.summary?.total_budgeted || 0)}
                      </div>
                      <div className=\"text-sm text-gray-500\">Budgeted</div>
                    </div>
                    <div className=\"text-center\">
                      <div className=\"text-2xl font-bold text-orange-600\">
                        {formatCurrency(budgetComparison.summary?.total_actual || 0)}
                      </div>
                      <div className=\"text-sm text-gray-500\">Spent</div>
                    </div>
                    <div className=\"text-center\">
                      <div className={`text-2xl font-bold ${(budgetComparison.summary?.overall_variance || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(budgetComparison.summary?.overall_variance || 0)}
                      </div>
                      <div className=\"text-sm text-gray-500\">
                        {(budgetComparison.summary?.overall_variance || 0) >= 0 ? 'Under Budget' : 'Over Budget'}
                      </div>
                    </div>
                  </div>
                  
                  {budgetComparison.summary?.categories_over_budget > 0 && (
                    <div className=\"bg-red-50 border border-red-200 rounded-lg p-4\">
                      <div className=\"flex\">
                        <div className=\"flex-shrink-0\">
                          <span className=\"text-red-400 text-xl\">⚠️</span>
                        </div>
                        <div className=\"ml-3\">
                          <h3 className=\"text-sm font-medium text-red-800\">
                            Budget Alert
                          </h3>
                          <div className=\"mt-2 text-sm text-red-700\">
                            You have {budgetComparison.summary.categories_over_budget} categories over budget this month.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Recent Transactions Preview */}
            <div className=\"bg-white shadow-sm rounded-lg\">
              <div className=\"px-6 py-4 border-b border-gray-200 flex justify-between items-center\">
                <h3 className=\"text-lg font-medium text-gray-900\">Recent Transactions</h3>
                <button
                  onClick={() => setActiveTab('transactions')}
                  className=\"text-blue-600 hover:text-blue-800 text-sm font-medium\"
                >
                  View All
                </button>
              </div>
              <TransactionList showFilters={false} />
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionList showFilters={true} />
        )}

        {activeTab === 'budget' && (
          <BudgetOverview />
        )}

        {activeTab === 'analytics' && (
          <div className=\"space-y-8\">
            {/* Spending Analytics */}
            <div className=\"bg-white shadow-sm rounded-lg\">
              <div className=\"px-6 py-4 border-b border-gray-200\">
                <h3 className=\"text-lg font-medium text-gray-900\">Spending Analytics</h3>
              </div>
              <div className=\"p-6\">
                {isLoading ? (
                  <div className=\"text-center py-8\">
                    <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto\"></div>
                    <p className=\"mt-2 text-gray-600\">Loading analytics...</p>
                  </div>
                ) : spendingAnalytics.categoryBreakdown?.length > 0 ? (
                  <div>
                    <h4 className=\"text-sm font-medium text-gray-900 mb-4\">Spending by Category</h4>
                    <div className=\"space-y-3\">
                      {spendingAnalytics.categoryBreakdown.map((category, index) => (
                        <div key={category.category} className=\"flex justify-between items-center\">
                          <div className=\"flex items-center\">
                            <div 
                              className=\"w-4 h-4 rounded-full mr-3\"
                              style={{ backgroundColor: `hsl(${index * 360 / spendingAnalytics.categoryBreakdown.length}, 70%, 50%)` }}
                            ></div>
                            <span className=\"text-sm text-gray-900\">{category.category}</span>
                          </div>
                          <div className=\"text-sm font-medium text-gray-900\">
                            {formatCurrency(category.amount)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className=\"text-center py-8\">
                    <p className=\"text-gray-500\">No spending data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {showTransactionForm && (
          <TransactionForm
            onClose={() => setShowTransactionForm(false)}
            onSuccess={() => {
              setShowTransactionForm(false);
              fetchTransactions();
            }}
          />
        )}

        {showImportModal && (
          <TransactionImportNew
            onClose={() => setShowImportModal(false)}
            onSuccess={() => {
              setShowImportModal(false);
              fetchTransactions();
            }}
          />
        )}
      </div>
    </div>
  );
};

export default TransactionDashboard;