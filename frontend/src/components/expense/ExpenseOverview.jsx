import React, { useEffect, useState } from 'react';
import { api } from '../../api';
import MessageBox from '../MessageBox';

const ExpenseOverview = ({ onNextScreen }) => {
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newExpense, setNewExpense] = useState({
    name: '',
    amount: '',
    category: 'other'
  });

  const fetchExpenseData = React.useCallback(async () => {
    try {
      setLoading(true);
      // Get onboarding data which contains expense information
      const response = await api.get('/api/v1/onboarding/state');
      const onboardingData = response.data;
      
      if (onboardingData && onboardingData.financial_data) {
        const financialData = onboardingData.financial_data;
        
        // Calculate total monthly expenses
        const standardExpenses = [
          { name: 'Rent', amount: financialData.rent || 0, category: 'housing' },
          { name: 'Utilities', amount: financialData.utilities || 0, category: 'utilities' },
          { name: 'Groceries', amount: financialData.groceries || 0, category: 'food' },
          { name: 'Transport', amount: financialData.transport || 0, category: 'transportation' },
          { name: 'Loan Repayments', amount: financialData.loanRepayments || 0, category: 'debt' }
        ].filter(expense => expense.amount > 0);
        
        const customExpenses = (financialData.customExpenses || []).map(expense => ({
          name: expense.name,
          amount: expense.amount,
          category: 'custom',
          id: expense.id
        }));
        
        const allExpenses = [...standardExpenses, ...customExpenses];
        const totalMonthlyExpenses = allExpenses.reduce((sum, expense) => sum + expense.amount, 0);
        
        // Calculate expense breakdown by category
        const categoryBreakdown = allExpenses.reduce((breakdown, expense) => {
          breakdown[expense.category] = (breakdown[expense.category] || 0) + expense.amount;
          return breakdown;
        }, {});
        
        setOverview({
          totalMonthlyExpenses,
          expenses: allExpenses,
          categoryBreakdown,
          expenseCount: allExpenses.length,
          monthlyIncome: financialData.monthlyIncome || 0,
          expenseToIncomeRatio: financialData.monthlyIncome > 0 ? (totalMonthlyExpenses / financialData.monthlyIncome * 100) : 0
        });
      }
    } catch (err) {
      console.error('Error fetching expense data:', err);
      showActionMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    fetchExpenseData();
  }, [fetchExpenseData]);

  const showActionMessage = (msg) => {
    setMessage(msg);
    setShowMessageBox(true);
    setTimeout(() => setShowMessageBox(false), 3000);
  };

  const handleAddExpense = async () => {
    if (!newExpense.name || !newExpense.amount) {
      showActionMessage('Please fill in all fields');
      return;
    }

    try {
      // For now, just show success message since we'd need to update onboarding data
      showActionMessage(`Expense "${newExpense.name}" would be added (integration pending)`);
      setShowAddForm(false);
      setNewExpense({ name: '', amount: '', category: 'other' });
      // Refresh data would go here
      fetchExpenseData();
    } catch (error) {
      showActionMessage(`Error adding expense: ${error.message}`);
    }
  };

  const formatAmount = (amount) => {
    return `KES ${parseFloat(amount).toLocaleString()}`;
  };

  const getCategoryColor = (category) => {
    const colors = {
      housing: 'bg-blue-50 border-blue-200 text-blue-800',
      utilities: 'bg-green-50 border-green-200 text-green-800',
      food: 'bg-orange-50 border-orange-200 text-orange-800',
      transportation: 'bg-purple-50 border-purple-200 text-purple-800',
      debt: 'bg-red-50 border-red-200 text-red-800',
      custom: 'bg-gray-50 border-gray-200 text-gray-800',
      other: 'bg-yellow-50 border-yellow-200 text-yellow-800'
    };
    return colors[category] || colors.other;
  };

  if (loading) {
    return (
      <div className="expense-overview flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-700">Loading Expense Data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="expense-overview p-6 bg-gradient-to-br from-red-50 to-orange-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Expense Management</h1>
          <p className="text-gray-600">
            CFA-compliant expense tracking and analysis from your onboarding data
          </p>
        </div>

        {/* Summary Cards */}
        {overview && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Monthly Expenses</h3>
              <p className="text-2xl font-bold text-red-600">{formatAmount(overview.totalMonthlyExpenses)}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Categories</h3>
              <p className="text-2xl font-bold text-blue-600">{Object.keys(overview.categoryBreakdown).length}</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-orange-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Expense Ratio</h3>
              <p className="text-2xl font-bold text-orange-600">{overview.expenseToIncomeRatio.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">of income</p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Surplus/Deficit</h3>
              <p className={`text-2xl font-bold ${overview.monthlyIncome - overview.totalMonthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatAmount(overview.monthlyIncome - overview.totalMonthlyExpenses)}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Expense List */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Monthly Expenses</h2>
              <button
                onClick={() => setShowAddForm(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Expense
              </button>
            </div>

            {overview && overview.expenses.length > 0 ? (
              <div className="space-y-3">
                {overview.expenses.map((expense, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getCategoryColor(expense.category)}`}>
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-semibold">{expense.name}</h3>
                        <p className="text-sm opacity-75 capitalize">{expense.category}</p>
                      </div>
                      <p className="font-bold text-lg">{formatAmount(expense.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No expenses found. Complete your onboarding or add expenses manually.</p>
              </div>
            )}
          </div>

          {/* Category Breakdown */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Category Breakdown</h2>
            
            {overview && Object.keys(overview.categoryBreakdown).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(overview.categoryBreakdown).map(([category, amount]) => {
                  const percentage = (amount / overview.totalMonthlyExpenses) * 100;
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{category}</span>
                        <span className="font-bold">{formatAmount(amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        {percentage.toFixed(1)}% of total expenses
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No category data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Expense Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Add New Expense</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expense Name</label>
                  <input
                    type="text"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense({...newExpense, name: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Internet Bill"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Amount (KES)</label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="5000"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="housing">Housing</option>
                    <option value="utilities">Utilities</option>
                    <option value="food">Food & Dining</option>
                    <option value="transportation">Transportation</option>
                    <option value="debt">Debt Payments</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleAddExpense}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Add Expense
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Message Box */}
        {showMessageBox && (
          <MessageBox 
            message={message} 
            onClose={() => setShowMessageBox(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default ExpenseOverview;