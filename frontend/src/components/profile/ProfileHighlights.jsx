import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const formatCurrency = (amount) => {
  const num = parseFloat(amount || 0);
  return `KES ${Math.round(num).toLocaleString()}`;
};

const ProfileHighlights = () => {
  const navigate = useNavigate();
  const { profile, selectNetCashFlow, selectBudgetSummary, selectHumanCapital, selectRiskProfile } = useUnifiedFinancialContext();
  const netCash = selectNetCashFlow();
  const budget = selectBudgetSummary();
  const humanCapital = Math.round(selectHumanCapital());
  const risk = selectRiskProfile();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Highlights</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Net Cash Flow</p>
          <p className={`text-2xl font-bold ${netCash >= 0 ? 'text-blue-800' : 'text-orange-800'}`}>{formatCurrency(netCash)}</p>
          <button className="mt-2 text-blue-700 text-sm underline" onClick={() => navigate('/app/budget')}>View Budget</button>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Savings Rate</p>
          <p className="text-2xl font-bold text-purple-800">{budget?.total_budgeted > 0 ? `${((1 - (budget.total_spent / budget.total_budgeted)) * 100).toFixed(1)}%` : '—'}</p>
          <button className="mt-2 text-purple-700 text-sm underline" onClick={() => navigate('/app/budget')}>Improve Savings</button>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-700 mb-1">Human Capital</p>
          <p className="text-2xl font-bold text-green-800">{formatCurrency(humanCapital)}</p>
          <button className="mt-2 text-green-700 text-sm underline" onClick={() => navigate('/app/balance-sheet')}>View Lifetime</button>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Risk Profile</p>
          <p className="text-2xl font-bold text-yellow-800">{risk?.level || 'Not assessed'}</p>
          <button className="mt-2 text-yellow-700 text-sm underline" onClick={() => navigate('/retake-risk-assessment')}>Retake Risk</button>
        </div>
        <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-200">
          <p className="text-sm font-medium text-indigo-700 mb-1">Age Category</p>
          <p className="text-2xl font-bold text-indigo-800">{profile?.age_category || '—'}</p>
        </div>
        <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200 md:col-span-2">
          <p className="text-sm font-medium text-emerald-700 mb-1">Emergency Fund Target</p>
          <p className="text-2xl font-bold text-emerald-800">{formatCurrency(profile?.emergency_fund_target || 0)}</p>
        </div>
      </div>
      <div className="mt-4">
        <button className="text-blue-600 underline text-sm" onClick={() => navigate('/app/tools')}>Run Goal Reality Check</button>
      </div>
    </div>
  );
};

export default ProfileHighlights;
