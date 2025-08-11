import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import BudgetCategoryForm from './BudgetCategoryForm';

const BudgetOverview = () => {
  const {
    budgetCategories,
    budgetOverview,
    isLoading,
    error,
    fetchBudgetOverview,
    fetchBudgetCategories,
    deleteBudgetCategory,
    clearError
  } = useTransactions();

  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    const loadBudgetData = async () => {
      await Promise.all([
        fetchBudgetOverview(selectedPeriod),
        fetchBudgetCategories()
      ]);
    };

    loadBudgetData();
  }, [selectedPeriod, fetchBudgetOverview, fetchBudgetCategories]);

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowCategoryForm(true);
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    try {
      await deleteBudgetCategory(categoryToDelete.id);
      setShowDeleteDialog(false);
      setCategoryToDelete(null);
      // Refresh data
      await Promise.all([
        fetchBudgetOverview(selectedPeriod),
        fetchBudgetCategories()
      ]);
    } catch (error) {
      console.error('Failed to delete budget category:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(Math.abs(amount || 0));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'under_budget': return 'text-green-600 bg-green-100';
      case 'on_budget': return 'text-blue-600 bg-blue-100';
      case 'over_budget': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'under_budget': return 'Under Budget';
      case 'on_budget': return 'On Budget';
      case 'over_budget': return 'Over Budget';
      default: return 'No Data';
    }
  };

  const getProgressBarColor = (status) => {
    switch (status) {
      case 'under_budget': return 'bg-green-500';
      case 'on_budget': return 'bg-blue-500';
      case 'over_budget': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getProgressPercentage = (budgeted, actual) => {
    if (budgeted === 0) return 0;
    return Math.min((actual / budgeted) * 100, 100);
  };

  if (error) {
    return (
      <div className=\"bg-red-50 border border-red-200 rounded-lg p-6 mb-6\">
        <div className=\"flex justify-between items-center\">
          <div>
            <h3 className=\"text-red-800 font-medium\">Error Loading Budget Data</h3>
            <p className=\"text-red-600 text-sm mt-1\">{error}</p>
          </div>
          <div className=\"flex space-x-2\">
            <button
              onClick={clearError}
              className=\"text-red-600 hover:text-red-800 text-sm\"
            >
              Dismiss
            </button>
            <button
              onClick={() => fetchBudgetOverview(selectedPeriod)}
              className=\"bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm\"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=\"space-y-8\">
      {/* Header */}
      <div className=\"flex justify-between items-center\">
        <div>
          <h2 className=\"text-2xl font-bold text-gray-900\">Budget Overview</h2>
          <p className=\"text-gray-600 mt-1\">Track your spending against your budget</p>
        </div>
        
        <div className=\"flex items-center space-x-4\">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className=\"border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
          >
            <option value=\"month\">This Month</option>
            <option value=\"year\">This Year</option>
          </select>
          
          <button
            onClick={() => {
              setEditingCategory(null);
              setShowCategoryForm(true);
            }}
            className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center\"
          >
            <span className=\"mr-2\">➕</span>
            Add Category
          </button>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6\">
        <div className=\"bg-white overflow-hidden shadow-sm rounded-lg\">
          <div className=\"p-6\">
            <div className=\"flex items-center\">
              <div className=\"flex-shrink-0\">
                <div className=\"w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center\">
                  <span className=\"text-blue-600 text-lg\">🎯</span>
                </div>
              </div>
              <div className=\"ml-4 w-0 flex-1\">
                <dl>
                  <dt className=\"text-sm font-medium text-gray-500 truncate\">Total Budgeted</dt>
                  <dd className=\"text-lg font-semibold text-blue-600\">
                    {formatCurrency(budgetOverview.total_budgeted || 0)}
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
                <div className=\"w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center\">
                  <span className=\"text-orange-600 text-lg\">💸</span>
                </div>
              </div>
              <div className=\"ml-4 w-0 flex-1\">
                <dl>
                  <dt className=\"text-sm font-medium text-gray-500 truncate\">Total Spent</dt>
                  <dd className=\"text-lg font-semibold text-orange-600\">
                    {formatCurrency(budgetOverview.total_spent || 0)}
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
                <div className={`w-8 h-8 ${(budgetOverview.remaining_budget || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                  <span className={`${(budgetOverview.remaining_budget || 0) >= 0 ? 'text-green-600' : 'text-red-600'} text-lg`}>
                    {(budgetOverview.remaining_budget || 0) >= 0 ? '💰' : '⚠️'}
                  </span>
                </div>
              </div>
              <div className=\"ml-4 w-0 flex-1\">
                <dl>
                  <dt className=\"text-sm font-medium text-gray-500 truncate\">Remaining</dt>
                  <dd className={`text-lg font-semibold ${(budgetOverview.remaining_budget || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(budgetOverview.remaining_budget || 0)}
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
                  <span className=\"text-purple-600 text-lg\">📊</span>
                </div>
              </div>
              <div className=\"ml-4 w-0 flex-1\">
                <dl>
                  <dt className=\"text-sm font-medium text-gray-500 truncate\">Budget Utilization</dt>
                  <dd className=\"text-lg font-semibold text-purple-600\">
                    {budgetOverview.budget_utilization?.toFixed(1) || 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Alerts */}
      {budgetOverview.alerts && budgetOverview.alerts.length > 0 && (
        <div className=\"space-y-4\">
          {budgetOverview.alerts.map((alert, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${
                alert.severity === 'high'
                  ? 'bg-red-50 border-red-200'
                  : alert.severity === 'medium'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className=\"flex\">
                <div className=\"flex-shrink-0\">
                  <span className=\"text-xl\">
                    {alert.severity === 'high' ? '🚨' : alert.severity === 'medium' ? '⚠️' : 'ℹ️'}
                  </span>
                </div>
                <div className=\"ml-3\">
                  <h3 className={`text-sm font-medium ${
                    alert.severity === 'high'
                      ? 'text-red-800'
                      : alert.severity === 'medium'
                      ? 'text-yellow-800'
                      : 'text-blue-800'
                  }`}>
                    {alert.type === 'overall_over_budget' ? 'Budget Exceeded' : 'Category Alert'}
                  </h3>
                  <div className={`mt-2 text-sm ${
                    alert.severity === 'high'
                      ? 'text-red-700'
                      : alert.severity === 'medium'
                      ? 'text-yellow-700'
                      : 'text-blue-700'
                  }`}>
                    <p className=\"mb-1\">{alert.message}</p>
                    <p className=\"text-xs font-medium\">{alert.action}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Budget Categories */}
      <div className=\"bg-white shadow-sm rounded-lg\">
        <div className=\"px-6 py-4 border-b border-gray-200\">
          <h3 className=\"text-lg font-medium text-gray-900\">Budget Categories</h3>
        </div>

        {isLoading ? (
          <div className=\"flex items-center justify-center py-12\">
            <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600\"></div>
            <span className=\"ml-2 text-gray-600\">Loading budget data...</span>
          </div>
        ) : budgetCategories.length === 0 ? (
          <div className=\"text-center py-12\">
            <div className=\"text-gray-400 text-6xl mb-4\">📊</div>
            <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No budget categories</h3>
            <p className=\"text-gray-600 mb-6\">
              Create your first budget category to start tracking your spending.
            </p>
            <button
              onClick={() => {
                setEditingCategory(null);
                setShowCategoryForm(true);
              }}
              className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg\"
            >
              Create Your First Category
            </button>
          </div>
        ) : (
          <div className=\"overflow-hidden\">
            <div className=\"p-6 space-y-6\">
              {budgetCategories.map((category) => (
                <div key={category.id} className=\"border border-gray-200 rounded-lg p-6\">
                  <div className=\"flex items-center justify-between mb-4\">
                    <div>
                      <h4 className=\"text-lg font-medium text-gray-900\">{category.name}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(category.status)}`}>
                        {getStatusText(category.status)}
                      </span>
                    </div>
                    
                    <div className=\"flex space-x-2\">
                      <button
                        onClick={() => handleEditCategory(category)}
                        className=\"text-blue-600 hover:text-blue-800 text-sm font-medium\"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setCategoryToDelete(category);
                          setShowDeleteDialog(true);
                        }}
                        className=\"text-red-600 hover:text-red-800 text-sm font-medium\"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className=\"space-y-4\">
                    {/* Progress Bar */}
                    <div>
                      <div className=\"flex justify-between text-sm text-gray-600 mb-1\">
                        <span>Spent: {formatCurrency(category.actual_spent || 0)}</span>
                        <span>Budget: {formatCurrency(category.budgeted_amount || 0)}</span>
                      </div>
                      <div className=\"w-full bg-gray-200 rounded-full h-2\">
                        <div
                          className={`h-2 rounded-full ${getProgressBarColor(category.status)}`}
                          style={{
                            width: `${getProgressPercentage(category.budgeted_amount, category.actual_spent)}%`
                          }}
                        ></div>
                      </div>
                      <div className=\"flex justify-between text-xs text-gray-500 mt-1\">
                        <span>
                          {getProgressPercentage(category.budgeted_amount, category.actual_spent).toFixed(1)}% used
                        </span>
                        <span>
                          {formatCurrency(category.remaining_budget || 0)} remaining
                        </span>
                      </div>
                    </div>

                    {/* Category Details */}
                    <div className=\"grid grid-cols-2 md:grid-cols-4 gap-4 text-sm\">
                      <div>
                        <span className=\"text-gray-500\">Variance:</span>
                        <div className={`font-medium ${category.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {category.variance >= 0 ? '+' : ''}{formatCurrency(category.variance)}
                        </div>
                      </div>
                      
                      <div>
                        <span className=\"text-gray-500\">Daily Budget:</span>
                        <div className=\"font-medium text-gray-900\">
                          {formatCurrency(category.daily_budget || 0)}
                        </div>
                      </div>
                      
                      <div>
                        <span className=\"text-gray-500\">Daily Actual:</span>
                        <div className=\"font-medium text-gray-900\">
                          {formatCurrency(category.daily_actual || 0)}
                        </div>
                      </div>
                      
                      <div>
                        <span className=\"text-gray-500\">Projected:</span>
                        <div className={`font-medium ${category.projected_spending > category.budgeted_amount ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatCurrency(category.projected_spending || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Days Remaining */}
                    {category.days_remaining > 0 && (
                      <div className=\"text-xs text-gray-500\">
                        {category.days_remaining} days remaining in {selectedPeriod}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Budget Category Form Modal */}
      {showCategoryForm && (
        <BudgetCategoryForm
          category={editingCategory}
          onClose={() => {
            setShowCategoryForm(false);
            setEditingCategory(null);
          }}
          onSuccess={async () => {
            setShowCategoryForm(false);
            setEditingCategory(null);
            // Refresh data
            await Promise.all([
              fetchBudgetOverview(selectedPeriod),
              fetchBudgetCategories()
            ]);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && categoryToDelete && (
        <div className=\"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50\">
          <div className=\"relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white\">
            <div className=\"mt-3 text-center\">
              <div className=\"mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100\">
                <span className=\"text-red-600 text-xl\">⚠️</span>
              </div>
              <h3 className=\"text-lg font-medium text-gray-900 mt-4\">Delete Budget Category</h3>
              <div className=\"mt-2 px-7 py-3\">
                <p className=\"text-sm text-gray-500 mb-2\">
                  Are you sure you want to delete \"{categoryToDelete.name}\"?
                </p>
                <p className=\"text-xs text-gray-400\">
                  This action cannot be undone. The category will be deactivated if it has associated transactions.
                </p>
              </div>
              <div className=\"items-center px-4 py-3 flex justify-center space-x-4\">
                <button
                  onClick={() => {
                    setShowDeleteDialog(false);
                    setCategoryToDelete(null);
                  }}
                  className=\"px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300\"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteCategory}
                  className=\"px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300\"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;