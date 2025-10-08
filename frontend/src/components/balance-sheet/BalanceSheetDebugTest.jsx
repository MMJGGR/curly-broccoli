import React, { useState } from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Settings, TrendingUp } from '../ui/icons';

// Minimal component to test the exact conditional rendering issue
const BalanceSheetDebugTest = () => {
  const [balanceSheetMode, setBalanceSheetMode] = useState('traditional');
  const [showAdvancedAssumptions, setShowAdvancedAssumptions] = useState(false);
  
  const customRates = {
    incomeDiscountRate: 12.5,
    expenseDiscountRate: 10.5
  };

  console.log('Debug: balanceSheetMode =', balanceSheetMode);
  console.log('Debug: showAdvancedAssumptions =', showAdvancedAssumptions);

  return (
    <div className="p-8 space-y-6">
      <h1>Balance Sheet Mode Debug Test</h1>
      
      {/* Toggle Buttons */}
      <div className="inline-flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => {
            console.log('Clicking Traditional');
            setBalanceSheetMode('traditional');
          }}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            balanceSheetMode === 'traditional'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📊 Current Position
        </button>
        <button
          onClick={() => {
            console.log('Clicking Lifetime');
            setBalanceSheetMode('lifetime');
          }}
          className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            balanceSheetMode === 'lifetime'
              ? 'bg-white text-purple-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎯 Lifetime View
        </button>
      </div>

      {/* Debug Info */}
      <div className="p-4 bg-gray-100 rounded">
        <p>Current mode: <strong>{balanceSheetMode}</strong></p>
        <p>Condition check: balanceSheetMode === 'lifetime' = <strong>{String(balanceSheetMode === 'lifetime')}</strong></p>
      </div>

      {/* Mode Description */}
      <p className="text-sm text-gray-500">
        {balanceSheetMode === 'traditional' 
          ? 'Your current assets and liabilities today'
          : 'Lifetime earning capacity vs. expenses (CFA-compliant with Kenya adjustments)'
        }
      </p>

      {/* THE PROBLEMATIC CONDITIONAL RENDERING - EXACT COPY */}
      {console.log('Before conditional render check')}
      {balanceSheetMode === 'lifetime' && (
        <div className="mt-4 flex flex-col items-center space-y-4 border-2 border-red-500 p-4">
          <h2 className="text-red-600">🎯 THIS SHOULD APPEAR IN LIFETIME MODE</h2>
          <div className="flex items-center justify-center space-x-4">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Income Rate: {customRates.incomeDiscountRate}%
            </Badge>
            <Badge variant="outline" className="bg-purple-50 text-purple-700">
              Expense Rate: {customRates.expenseDiscountRate}%
            </Badge>
            <Button
              onClick={() => console.log('Adjust Assumptions clicked')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>Adjust Assumptions</span>
            </Button>
            <Button
              onClick={() => setShowAdvancedAssumptions(!showAdvancedAssumptions)}
              variant="ghost"
              size="sm"
              className="flex items-center space-x-2 text-gray-600"
            >
              <TrendingUp className="h-4 w-4" />
              <span>{showAdvancedAssumptions ? 'Hide' : 'Show'} Advanced</span>
            </Button>
          </div>
        </div>
      )}
      {console.log('After conditional render check')}

      {/* Advanced Panel Test */}
      {showAdvancedAssumptions && (
        <div className="p-4 border-2 border-green-500">
          <h3>🔧 Advanced Assumptions Panel Would Go Here</h3>
          <p>This confirms the show/hide toggle works</p>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetDebugTest;