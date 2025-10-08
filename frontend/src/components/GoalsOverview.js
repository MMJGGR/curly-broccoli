import React, { useEffect, useState, useCallback } from 'react';
import MessageBox from './MessageBox';
import { useUnifiedFinancialContext } from '../contexts/TransactionContext';

const GoalsOverview = ({ onNextScreen }) => {
  const [message, setMessage] = useState('');
  const [showMessageBox, setShowMessageBox] = useState(false);
  const { goals, createGoal, updateGoal, deleteGoal, fetchAllFinancialData } = useUnifiedFinancialContext();
  const [localGoals, setLocalGoals] = useState([]);

  const refreshGoals = useCallback(async () => {
    try {
      await fetchAllFinancialData();
      setLocalGoals(goals);
    } catch (err) {
      console.error(err);
    }
  }, [fetchAllFinancialData, goals]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'test') return;
    refreshGoals();
  }, [refreshGoals]);

  const showActionMessage = (actionName) => {
    setMessage('Action: ' + actionName + ' (This is a wireframe action)');
    setShowMessageBox(true);
  };

  const hideMessageBox = () => {
    setShowMessageBox(false);
    setMessage('');
  };

  const addGoal = async () => {
    showActionMessage('Add New Goal');
    const newGoal = { name: 'New Goal', progress: 0, target: 'KES 0', current: 'KES 0' };
    setLocalGoals((g) => [...g, newGoal]);
    try {
      await createGoal({
        name: 'New Goal',
        target_amount: 0,
        target_date: new Date().toISOString().slice(0,10),
        current_amount: 0
      });
      await refreshGoals();
    } catch (err) {
      console.error(err);
      refreshGoals();
    }
  };

  const adjustGoal = async (index) => {
    const goal = localGoals[index];
    const updated = { ...goal, progress: Math.min(100, (goal.progress || 0) + 5) };
    setLocalGoals((g) => g.map((goal, i) => (i === index ? updated : goal)));
    try {
      await updateGoal(goal.id, { current_amount: (goal.current_amount || 0) + 1000 });
      await refreshGoals();
    } catch (err) {
      console.error(err);
      refreshGoals();
    }
  };

  const removeGoal = async (index) => {
    const goal = localGoals[index];
    const prev = [...localGoals];
    setLocalGoals((g) => g.filter((_, i) => i !== index));
    try {
      await deleteGoal(goal.id);
    } catch (err) {
      console.error(err);
      setLocalGoals(prev);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Financial Goals</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {localGoals.map((goal, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-3">{goal.name}</h2>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                  <div className="bg-green-500 h-3 rounded-full" style={{ width: `${goal.progress}%` }}></div>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  Progress: <span className="font-bold">{goal.progress}% complete</span>
                </p>
                <p className="text-sm text-gray-700">
                  Target: {goal.target} | Current: {goal.current}
                </p>
                {goal.targetDate && <p className="text-sm text-gray-700">Target Date: {goal.targetDate}</p>}
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md text-sm flex-grow"
                  onClick={() => adjustGoal(index)}
                >
                  Adjust
                </button>
                <button
                  className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md text-sm"
                  onClick={() => removeGoal(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            className="bg-green-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-600 transition-all duration-300 shadow-lg"
            onClick={addGoal}
          >
            + Add New Goal
          </button>
        </div>
      </main>
      {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
    </div>
  );
};

export default GoalsOverview;
