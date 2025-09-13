import React, { useState } from 'react';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { Card, CardContent } from '../ui/card';
import { formatCurrency } from '../../utils/formatters';

const BudgetOverview = () => {
  const {
    expenses,
    incomes = [],
    loading,
    errors
  } = useUnifiedFinancialContext();

  const [selectedPeriod, setSelectedPeriod] = useState('month');

  // Calculate total income from unified context (supports array or object)
  const totalIncome = Array.isArray(incomes)
    ? incomes.reduce((sum, inc) => sum + (inc.monthly_amount || inc.amount || 0), 0)
    : (incomes?.total_monthly_income || 0);

  // Group expenses by category for budget overview
  const expensesByCategory = React.useMemo(() => {
    if (!expenses || !Array.isArray(expenses)) return {};

    const grouped = {};
    let totalExpenses = 0;

    expenses.forEach(expense => {
      const category = expense.expense_category || 'Miscellaneous';
      const monthlyAmount = expense.monthly_equivalent || 0;

      if (!grouped[category]) {
        grouped[category] = {
          name: category,
          total: 0,
          count: 0
        };
      }

      grouped[category].total += monthlyAmount;
      grouped[category].count += 1;
      totalExpenses += monthlyAmount;
    });

    return { categories: grouped, totalExpenses };
  }, [expenses]);

  const budgetOverview = React.useMemo(() => ({
    total_budgeted: totalIncome,
    total_spent: expensesByCategory.totalExpenses || 0,
    remaining_budget: totalIncome - (expensesByCategory.totalExpenses || 0),
    budget_utilization: totalIncome > 0 ? ((expensesByCategory.totalExpenses || 0) / totalIncome * 100) : 0
  }), [totalIncome, expensesByCategory.totalExpenses]);

  if (errors?.global || errors?.expenses) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-red-800 font-medium">Error Loading Financial Data</h3>
            <p className="text-red-600 text-sm mt-1">{errors.global || errors.expenses}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Overview</h2>
          <p className="text-gray-600 mt-1">Track your spending by category</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Budget Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-lg">💰</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Income</dt>
                  <dd className="text-lg font-semibold text-blue-600">
                    {formatCurrency(budgetOverview.total_budgeted || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">💸</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Expenses</dt>
                  <dd className="text-lg font-semibold text-orange-600">
                    {formatCurrency(budgetOverview.total_spent || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 ${(budgetOverview.remaining_budget || 0) >= 0 ? 'bg-green-100' : 'bg-red-100'} rounded-full flex items-center justify-center`}>
                  <span className={`${(budgetOverview.remaining_budget || 0) >= 0 ? 'text-green-600' : 'text-red-600'} text-lg`}>
                    {(budgetOverview.remaining_budget || 0) >= 0 ? '✅' : '⚠️'}
                  </span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Remaining</dt>
                  <dd className={`text-lg font-semibold ${(budgetOverview.remaining_budget || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(budgetOverview.remaining_budget || 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 text-lg">📊</span>
                </div>
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Expense Ratio</dt>
                  <dd className="text-lg font-semibold text-purple-600">
                    {budgetOverview.budget_utilization?.toFixed(1) || 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense Categories Breakdown */}
      <Card>
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Expense Categories</h3>
        </div>

        {loading?.expenses ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading expense data...</span>
          </div>
        ) : !expensesByCategory.categories || Object.keys(expensesByCategory.categories).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expense data</h3>
            <p className="text-gray-600 mb-6">
              Add some expenses to see your spending breakdown by category.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <div className="p-6 space-y-6">
              {Object.entries(expensesByCategory.categories).map(([categoryName, categoryData]) => {
                const percentage = budgetOverview.total_spent > 0 ? (categoryData.total / budgetOverview.total_spent * 100) : 0;

                return (
                  <div key={categoryName} className="border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{categoryData.name}</h4>
                        <span className="text-sm text-gray-500">{categoryData.count} expense{categoryData.count !== 1 ? 's' : ''}</span>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-semibold text-gray-900">
                          {formatCurrency(categoryData.total)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {percentage.toFixed(1)}% of total
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Progress Bar */}
                      <div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-blue-500"
                            style={{
                              width: `${Math.min(percentage, 100)}%`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BudgetOverview;
