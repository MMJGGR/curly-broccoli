import React, { useState } from 'react';
import IncomeOverview from '../income/IncomeOverview';
import GoalsOverview from '../goals/GoalsOverview';

const ToolsDashboard = () => {
  const [activeSection, setActiveSection] = useState('income');

  return (
    <div className="h-full bg-gray-50">
      {/* Header with Section Tabs */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Financial Management Tools</h1>
          
          {/* Section Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveSection('income')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeSection === 'income'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Income Management
            </button>
            <button
              onClick={() => setActiveSection('goals')}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeSection === 'goals'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Goals Management
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeSection === 'income' && <IncomeOverview />}
        {activeSection === 'goals' && <GoalsOverview />}
      </div>
    </div>
  );
};

export default ToolsDashboard;