/**
 * GoalsStep - Step 4 of onboarding
 * Enhanced with persona-specific smart defaults and guidance
 */
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const GoalsStep = () => {
  const { goalsData, financialData, updateGoalsData, saveStep } = useOnboarding();
  
  const [formData, setFormData] = useState({
    emergencyFund: goalsData.emergencyFund || '',
    homeDownPayment: goalsData.homeDownPayment || '',
    education: goalsData.education || '',
    retirement: goalsData.retirement || '',
    investment: goalsData.investment || '',
    debtPayoff: goalsData.debtPayoff || '', // New field for debt-focused goals
    other: goalsData.other || ''
  });
  
  const [selectedTimeframes, setSelectedTimeframes] = useState({
    emergencyFund: '1-year',
    homeDownPayment: '5-years',
    education: '10-years',
    retirement: '30-years',
    investment: '5-years',
    debtPayoff: '3-years'
  });
  
  useEffect(() => {
    updateGoalsData({ ...formData, timeframes: selectedTimeframes });
  }, [formData, selectedTimeframes]);
  
  // Persona detection based on financial data
  const detectPersona = () => {
    const income = parseFloat(financialData?.monthlyIncome) || 0;
    
    if (income < 100000) return 'early-career'; // Jamal
    if (income >= 100000 && income < 150000) return 'family-business'; // Aisha
    if (income >= 150000) return 'senior-executive'; // Samuel
    return 'general';
  };
  
  // Smart defaults based on persona and income
  const getPersonaGoalSuggestions = () => {
    const persona = detectPersona();
    const monthlyIncome = parseFloat(financialData?.monthlyIncome) || 0;
    const annualIncome = monthlyIncome * 12;
    
    switch (persona) {
      case 'early-career': // Jamal Mwangi
        return {
          emergencyFund: Math.round(monthlyIncome * 3), // 3 months expenses
          debtPayoff: Math.round(annualIncome * 0.3), // 30% of annual for debt
          investment: Math.round(annualIncome * 0.1), // 10% investment
          retirement: Math.round(annualIncome * 8), // 8x annual income
          priorities: ['Emergency Fund', 'Debt Payoff', 'Investment'],
          tips: [
            "🎯 Start with 3-month emergency fund",
            "💳 Focus on high-interest debt first", 
            "📈 Begin with small, consistent investments"
          ]
        };
      case 'family-business': // Aisha Otieno
        return {
          emergencyFund: Math.round(monthlyIncome * 6), // 6 months for business volatility
          education: Math.round(annualIncome * 0.15), // 15% for children's education
          homeDownPayment: Math.round(annualIncome * 0.5), // 50% annual for property
          retirement: Math.round(annualIncome * 10), // 10x annual income
          investment: Math.round(annualIncome * 0.2), // 20% investment/property
          priorities: ['Emergency Fund', 'Education Fund', 'Property Investment'],
          tips: [
            "👨‍👩‍👧‍👦 Larger emergency fund for family security",
            "🎓 Education fund grows tax-free",
            "🏠 Real estate can provide rental income"
          ]
        };
      case 'senior-executive': // Samuel Kariuki
        return {
          emergencyFund: Math.round(monthlyIncome * 12), // 1 year expenses
          retirement: Math.round(annualIncome * 15), // 15x annual income
          investment: Math.round(annualIncome * 0.3), // 30% investment
          education: Math.round(annualIncome * 0.1), // Legacy/grandchildren
          priorities: ['Retirement Maximization', 'Investment Portfolio', 'Legacy Planning'],
          tips: [
            "🏖️ Maximize retirement contributions now",
            "💼 Diversify investment portfolio",
            "🏥 Plan for healthcare costs"
          ]
        };
      default:
        return {
          emergencyFund: Math.round(monthlyIncome * 6),
          retirement: Math.round(annualIncome * 10),
          investment: Math.round(annualIncome * 0.15),
          priorities: ['Emergency Fund', 'Retirement', 'Investment'],
          tips: ["💡 Build a balanced financial foundation"]
        };
    }
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleTimeframeChange = (field, timeframe) => {
    setSelectedTimeframes(prev => ({ ...prev, [field]: timeframe }));
  };
  
  const handleSaveStep = async () => {
    const result = await saveStep(4, { ...formData, timeframes: selectedTimeframes }, true);
    if (result.success) {
      console.log('✅ Goals saved successfully');
    }
  };
  
  const suggestions = getPersonaGoalSuggestions();
  const persona = detectPersona();
  
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Financial Goals</h3>
        <p className="text-sm text-gray-600 mt-1">
          Set realistic targets based on your income and life stage. (Optional - you can skip this step)
        </p>
      </div>
      
      {/* Persona-Specific Goal Priorities */}
      {financialData?.monthlyIncome && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border border-green-200">
          <h4 className="text-lg font-medium text-gray-800 mb-4">
            {persona === 'early-career' && '🎯 Early Career Goal Priorities'}
            {persona === 'family-business' && '👨‍👩‍👧‍👦 Family Financial Priorities'}
            {persona === 'senior-executive' && '🏆 Executive Financial Priorities'}
            {persona === 'general' && '💡 Recommended Goal Priorities'}
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {suggestions.priorities.map((priority, index) => (
              <div key={index} className="text-center p-3 bg-white rounded-lg">
                <div className="text-lg font-bold text-blue-600">#{index + 1}</div>
                <div className="text-sm font-medium text-gray-700">{priority}</div>
              </div>
            ))}
          </div>
          
          <div className="p-4 bg-white rounded-lg">
            <p className="font-medium text-gray-800 mb-2">💡 Personalized Tips:</p>
            <ul className="text-sm text-gray-700 space-y-1">
              {suggestions.tips.map((tip, index) => (
                <li key={index}>{tip}</li>
              ))}
            </ul>
          </div>
          
          <button
            type="button"
            onClick={() => {
              const newData = { ...formData };
              Object.keys(suggestions).forEach(key => {
                if (typeof suggestions[key] === 'number' && !newData[key]) {
                  newData[key] = suggestions[key];
                }
              });
              setFormData(newData);
            }}
            className="mt-4 bg-green-100 text-green-700 px-4 py-2 rounded-md hover:bg-green-200 transition-colors"
          >
            ✨ Use Smart Recommendations
          </button>
        </div>
      )}
      
      {/* Goal Input Fields with Timeframes */}
      <div className="space-y-6">
        {/* Emergency Fund */}
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-800">🚨 Emergency Fund</h4>
            <select
              value={selectedTimeframes.emergencyFund}
              onChange={(e) => handleTimeframeChange('emergencyFund', e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="6-months">6 months</option>
              <option value="1-year">1 year</option>
              <option value="2-years">2 years</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Amount (KES)
              </label>
              <input
                type="number"
                value={formData.emergencyFund}
                onChange={(e) => handleChange('emergencyFund', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={`Suggested: ${suggestions.emergencyFund?.toLocaleString() || '100,000'}`}
              />
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <div>
                <p className="font-medium">Why this matters:</p>
                <p>Covers unexpected expenses like medical bills or job loss</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debt Payoff (for early career) */}
        {persona === 'early-career' && (
          <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-800">💳 Debt Payoff Target</h4>
              <select
                value={selectedTimeframes.debtPayoff}
                onChange={(e) => handleTimeframeChange('debtPayoff', e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="2-years">2 years</option>
                <option value="3-years">3 years</option>
                <option value="5-years">5 years</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Total Debt to Pay Off (KES)
                </label>
                <input
                  type="number"
                  value={formData.debtPayoff}
                  onChange={(e) => handleChange('debtPayoff', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={`Suggested: ${suggestions.debtPayoff?.toLocaleString() || '200,000'}`}
                />
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                <div>
                  <p className="font-medium">Strategy:</p>
                  <p>Pay off high-interest debt first (credit cards, personal loans)</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Education Fund (for family) */}
        {persona === 'family-business' && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-800">🎓 Education Fund</h4>
              <select
                value={selectedTimeframes.education}
                onChange={(e) => handleTimeframeChange('education', e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1"
              >
                <option value="10-years">10 years</option>
                <option value="15-years">15 years</option>
                <option value="18-years">18 years</option>
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Children's Education Target (KES)
                </label>
                <input
                  type="number"
                  value={formData.education}
                  onChange={(e) => handleChange('education', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder={`Suggested: ${suggestions.education?.toLocaleString() || '500,000'}`}
                />
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                <div>
                  <p className="font-medium">Education Investment:</p>
                  <p>University fees, professional courses, or skills development</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Retirement (for all, but emphasis for executives) */}
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-800">
              {persona === 'senior-executive' ? '🏖️ Retirement Maximization' : '🏖️ Retirement Planning'}
            </h4>
            <select
              value={selectedTimeframes.retirement}
              onChange={(e) => handleTimeframeChange('retirement', e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="20-years">20 years</option>
              <option value="30-years">30 years</option>
              <option value="40-years">40 years</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Retirement Target (KES)
              </label>
              <input
                type="number"
                value={formData.retirement}
                onChange={(e) => handleChange('retirement', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={`Suggested: ${suggestions.retirement?.toLocaleString() || '5,000,000'}`}
              />
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <div>
                <p className="font-medium">Rule of thumb:</p>
                <p>{persona === 'senior-executive' ? '15x annual income' : '10-12x annual income'} for comfortable retirement</p>
              </div>
            </div>
          </div>
        </div>

        {/* Investment Goals */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium text-gray-800">📈 Investment Target</h4>
            <select
              value={selectedTimeframes.investment}
              onChange={(e) => handleTimeframeChange('investment', e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="3-years">3 years</option>
              <option value="5-years">5 years</option>
              <option value="10-years">10 years</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Investment Portfolio Target (KES)
              </label>
              <input
                type="number"
                value={formData.investment}
                onChange={(e) => handleChange('investment', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder={`Suggested: ${suggestions.investment?.toLocaleString() || '1,000,000'}`}
              />
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <div>
                <p className="font-medium">Investment approach:</p>
                <p>{persona === 'senior-executive' ? 'Diversified portfolio, conservative-growth' : 'Start with index funds, grow consistently'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button
          onClick={handleSaveStep}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Save Goals
        </button>
      </div>
    </div>
  );
};

export default GoalsStep;