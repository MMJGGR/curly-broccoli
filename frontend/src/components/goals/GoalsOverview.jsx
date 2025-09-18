import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import MessageBox from '../MessageBox';

const GoalsOverview = ({ onNextScreen }) => {
  // Use UnifiedFinancialContext instead of direct API calls
  const {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    fetchAllFinancialData
  } = useUnifiedFinancialContext();
  const navigate = useNavigate();

  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const [overview, setOverview] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    target_date: '',
    current_amount: '0'
  });

  const calculateOverview = React.useCallback(() => {
    if (goals.length === 0) {
      setOverview(null);
      return;
    }

    // Calculate overview from unified context goals data
    const totalTargetAmount = goals.reduce((sum, goal) => sum + (goal.target_amount || 0), 0);
    const totalCurrentAmount = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
    const completedGoals = goals.filter(goal => goal.current_amount >= goal.target_amount).length;
    const avgProgress = goals.length > 0 ? 
      goals.reduce((sum, goal) => sum + ((goal.current_amount / goal.target_amount) * 100), 0) / goals.length : 0;

    setOverview({
      total_target_amount: {
        amount: totalTargetAmount,
        currency: 'KES'
      },
      total_current_amount: {
        amount: totalCurrentAmount,
        currency: 'KES'
      },
      completed_goals: completedGoals,
      average_progress: avgProgress,
      goals: goals
    });
  }, [goals]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    // Load all financial data from unified context
    if (goals.length === 0) {
      fetchAllFinancialData().catch(error => {
        console.error('Error loading financial data:', error);
        showActionMessage(`Error: ${error.message}`);
      });
    }
  }, [goals.length, fetchAllFinancialData]);

  useEffect(() => {
    calculateOverview();
  }, [calculateOverview]);

  const showActionMessage = (message) => {
    setMessage(message);
    setShowMessageBox(true);
  };

  const hideMessageBox = () => {
    setShowMessageBox(false);
    setMessage('');
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    
    if (!newGoal.name || !newGoal.target_amount || !newGoal.target_date) {
      showActionMessage('Please fill in all required fields');
      return;
    }

    try {
      const goalData = {
        name: newGoal.name,
        target_amount: parseFloat(newGoal.target_amount),
        target_date: newGoal.target_date,
        current_amount: parseFloat(newGoal.current_amount || 0)
      };

      await createGoal(goalData);
      showActionMessage('Goal created successfully!');
      
      // Reset form and refresh data
      setNewGoal({
        name: '',
        target_amount: '',
        target_date: '',
        current_amount: '0'
      });
      setShowAddForm(false);
      
    } catch (err) {
      console.error('Error adding goal:', err);
      showActionMessage(`Error creating goal: ${err.message}`);
    }
  };

  const handleUpdateProgress = async (goalId, currentAmount) => {
    const newAmount = prompt(`Update progress for this goal. Current amount:`, currentAmount);
    if (newAmount === null) return; // User cancelled
    
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount < 0) {
      showActionMessage('Please enter a valid positive number');
      return;
    }

    try {
      await updateGoal(goalId, { current_amount: amount });
      showActionMessage('Goal progress updated successfully!');
    } catch (err) {
      console.error('Error updating goal:', err);
      showActionMessage(`Error updating progress: ${err.message}`);
    }
  };

  const handleDeleteGoal = async (goalId, goalName) => {
    if (!window.confirm(`Are you sure you want to delete "${goalName}"?`)) {
      return;
    }

    try {
      await deleteGoal(goalId);
      showActionMessage('Goal deleted successfully!');
    } catch (err) {
      console.error('Error deleting goal:', err);
      showActionMessage(`Error deleting goal: ${err.message}`);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  const getDaysUntilTarget = (targetDate) => {
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading.goals || loading.global) {
    return (
      <div className="bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading goals data...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-6 md:p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Financial Goals</h1>
          <div className="flex items-center gap-3">
            <button
              className="bg-blue-100 text-blue-700 py-2 px-4 rounded-lg font-semibold hover:bg-blue-200 transition-all duration-300 shadow-sm"
              onClick={() => navigate('/app/tools?section=reality-check')}
            >
              🧭 Run Reality Check
            </button>
            <button
            className="bg-green-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add New Goal'}
            </button>
          </div>
        </div>

        {/* Goals Overview Summary */}
        {overview && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Goals Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Goals</p>
                <p className="text-2xl font-bold text-blue-600">
                  {overview.summary?.total_goals || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Achieved</p>
                <p className="text-2xl font-bold text-green-600">
                  {overview.summary?.achieved_goals || 0}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Target</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(overview.summary?.total_target_amount || 0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(overview.summary?.total_current_amount || 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Add New Goal Form */}
        {showAddForm && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Goal</h2>
            <form onSubmit={handleAddGoal} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Goal Name *
                </label>
                <input
                  type="text"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="e.g., Emergency Fund, House Down Payment"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Amount (KES) *
                </label>
                <input
                  type="number"
                  value={newGoal.target_amount}
                  onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Date *
                </label>
                <input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Amount (KES)
                </label>
                <input
                  type="number"
                  value={newGoal.current_amount}
                  onChange={(e) => setNewGoal({...newGoal, current_amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
              <div className="md:col-span-2 flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-500 text-white py-2 px-6 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md"
                >
                  Create Goal
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 text-white py-2 px-6 rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Goals List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.length > 0 ? (
            goals.map((goal, index) => {
              const progress = getProgressPercentage(goal.current_amount, goal.target_amount);
              const daysUntil = getDaysUntilTarget(goal.target_date);
              
              return (
                <div key={goal.id || index} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <h2 className="text-xl font-semibold text-gray-800">{goal.name}</h2>
                      {goal.is_achieved && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          ✓ Achieved
                        </span>
                      )}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                      <div 
                        className={`h-3 rounded-full ${goal.is_achieved ? 'bg-green-500' : 'bg-blue-500'}`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-700">
                        Progress: <span className="font-bold">{progress.toFixed(1)}% complete</span>
                      </p>
                      <p className="text-sm text-gray-700">
                        Current: {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </p>
                      <p className="text-sm text-gray-700">
                        Target: {new Date(goal.target_date).toLocaleDateString()}
                      </p>
                      <p className={`text-sm ${daysUntil < 0 ? 'text-red-600' : daysUntil < 30 ? 'text-orange-600' : 'text-gray-700'}`}>
                        {daysUntil < 0 ? `${Math.abs(daysUntil)} days overdue` : `${daysUntil} days remaining`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md text-sm flex-grow"
                      onClick={() => handleUpdateProgress(goal.id, goal.current_amount)}
                    >
                      Update Progress
                    </button>
                    <button
                      className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md text-sm"
                      onClick={() => handleDeleteGoal(goal.id, goal.name)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="md:col-span-3 text-center py-12">
              <div className="text-gray-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Goals Yet</h3>
              <p className="text-gray-600 mb-4">
                Create your first financial goal to start tracking your progress.
              </p>
              <button
                className="bg-green-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg"
                onClick={() => setShowAddForm(true)}
              >
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      </main>

      {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
    </div>
  );
};

export default GoalsOverview;
