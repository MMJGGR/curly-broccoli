/**
 * GoalsStep - Step 4 of onboarding
 * Enhanced with persona-specific smart defaults and guidance
 */
import React, { useState, useEffect } from 'react';

const GoalsStep = ({ onboardingContext }) => {
  const { 
    goalsData, 
    financialData, 
    updateGoalsData, 
    saveStep 
  } = onboardingContext;
  
  const [formData, setFormData] = useState({
    emergencyFund: goalsData.emergencyFund || '',
    homeDownPayment: goalsData.homeDownPayment || '',
    education: goalsData.education || '',
    retirement: goalsData.retirement || '',
    investment: goalsData.investment || '',
    debtPayoff: goalsData.debtPayoff || '',
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
  // Per-goal metadata (current_amount, target_date, priority, planned_monthly)
  const [goalsMeta, setGoalsMeta] = useState(() => goalsData.goals_meta || {
    emergencyFund: { current_amount: '', target_date: '', priority: 'high', planned_monthly: '' },
    homeDownPayment: { current_amount: '', target_date: '', priority: 'medium', planned_monthly: '' },
    education: { current_amount: '', target_date: '', priority: 'medium', planned_monthly: '' },
    retirement: { current_amount: '', target_date: '', priority: 'high', planned_monthly: '' },
    investment: { current_amount: '', target_date: '', priority: 'medium', planned_monthly: '' },
    debtPayoff: { current_amount: '', target_date: '', priority: 'high', planned_monthly: '' },
  });
  const [otherGoal, setOtherGoal] = useState(() => goalsData.other_goal || {
    name: goalsData.other_name || '',
    target_amount: goalsData.other || '',
    current_amount: '',
    target_date: '',
    priority: 'low',
    planned_monthly: ''
  });
  // Plan preference
  const [planPref, setPlanPref] = useState(() => goalsData.planPreference || { strategy: 'B', applyOnComplete: false });
  
  useEffect(() => {
    updateGoalsData({
      ...formData,
      timeframes: selectedTimeframes,
      goals_meta: goalsMeta,
      other_goal: otherGoal,
      planPreference: planPref
    });
  }, [formData, selectedTimeframes, goalsMeta, otherGoal, planPref, updateGoalsData]);
  
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

  const handleMetaChange = (key, field, value) => {
    setGoalsMeta(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
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
  // Planner preview calculations
  const monthlyIncome = parseFloat(financialData?.monthlyIncome) || 0;
  const baselineExpenses = ['rent','utilities','groceries','transport','loanRepayments']
    .map(k => parseFloat(financialData?.[k]) || 0).reduce((a,b)=>a+b,0);
  const surplus = monthlyIncome - baselineExpenses;
  const monthsFromTf = (tf) => {
    if (!tf) return 12;
    try {
      if (tf.includes('month')) return parseInt(tf);
      if (tf.includes('year')) return parseInt(tf) * 12;
    } catch (e) { return 12; }
    return 12;
  };
  const requiredMonthly = (target, current, months) => {
    const t = parseFloat(target)||0, c = parseFloat(current)||0, m = Math.max(1, months||0);
    return Math.max(0, (t - c)/m);
  };
  const goalList = [
    { key: 'emergencyFund', name: 'Emergency Fund', target: formData.emergencyFund, meta: goalsMeta.emergencyFund, tf: selectedTimeframes.emergencyFund },
    { key: 'homeDownPayment', name: 'Home Down Payment', target: formData.homeDownPayment, meta: goalsMeta.homeDownPayment, tf: selectedTimeframes.homeDownPayment },
    { key: 'education', name: 'Education', target: formData.education, meta: goalsMeta.education, tf: selectedTimeframes.education },
    { key: 'retirement', name: 'Retirement', target: formData.retirement, meta: goalsMeta.retirement, tf: selectedTimeframes.retirement },
    { key: 'investment', name: 'Investment', target: formData.investment, meta: goalsMeta.investment, tf: selectedTimeframes.investment },
    { key: 'debtPayoff', name: 'Debt Payoff', target: formData.debtPayoff, meta: goalsMeta.debtPayoff, tf: selectedTimeframes.debtPayoff },
  ].filter(g => parseFloat(g.target) > 0);
  const other = otherGoal && otherGoal.name && parseFloat(otherGoal.target_amount) > 0 ? { ...otherGoal, tf: selectedTimeframes.other || '3-years' } : null;
  const previewItems = goalList.map(g => {
    const months = g.meta.target_date ? Math.max(1, Math.round((new Date(g.meta.target_date)- new Date())/(1000*60*60*24*30))) : monthsFromTf(g.tf);
    return {
      name: g.name, required: requiredMonthly(g.target, g.meta.current_amount, months)
    };
  });
  if (other) {
    const months = other.target_date ? Math.max(1, Math.round((new Date(other.target_date)- new Date())/(1000*60*60*24*30))) : monthsFromTf('3-years');
    previewItems.push({ name: other.name, required: requiredMonthly(other.target_amount, other.current_amount, months) });
  }
  const totalRequired = previewItems.reduce((s,i)=>s+i.required,0);
  
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
      
      {/* Goal Input Fields with Timeframes and Details */}
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount (KES)</label>
              <input type="number" value={goalsMeta.emergencyFund.current_amount}
                onChange={(e)=>handleMetaChange('emergencyFund','current_amount', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
              <input type="date" value={goalsMeta.emergencyFund.target_date}
                onChange={(e)=>handleMetaChange('emergencyFund','target_date', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select value={goalsMeta.emergencyFund.priority}
                  onChange={(e)=>handleMetaChange('emergencyFund','priority', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planned Monthly (KES)</label>
                <input type="number" value={goalsMeta.emergencyFund.planned_monthly}
                  onChange={(e)=>handleMetaChange('emergencyFund','planned_monthly', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount (KES)</label>
                <input type="number" value={goalsMeta.debtPayoff.current_amount}
                  onChange={(e)=>handleMetaChange('debtPayoff','current_amount', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <input type="date" value={goalsMeta.debtPayoff.target_date}
                  onChange={(e)=>handleMetaChange('debtPayoff','target_date', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select value={goalsMeta.debtPayoff.priority}
                    onChange={(e)=>handleMetaChange('debtPayoff','priority', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Planned Monthly (KES)</label>
                  <input type="number" value={goalsMeta.debtPayoff.planned_monthly}
                    onChange={(e)=>handleMetaChange('debtPayoff','planned_monthly', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
                </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount (KES)</label>
              <input type="number" value={goalsMeta.retirement.current_amount}
                onChange={(e)=>handleMetaChange('retirement','current_amount', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
              <input type="date" value={goalsMeta.retirement.target_date}
                onChange={(e)=>handleMetaChange('retirement','target_date', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select value={goalsMeta.retirement.priority}
                  onChange={(e)=>handleMetaChange('retirement','priority', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planned Monthly (KES)</label>
                <input type="number" value={goalsMeta.retirement.planned_monthly}
                  onChange={(e)=>handleMetaChange('retirement','planned_monthly', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount (KES)</label>
              <input type="number" value={goalsMeta.investment.current_amount}
                onChange={(e)=>handleMetaChange('investment','current_amount', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
              <input type="date" value={goalsMeta.investment.target_date}
                onChange={(e)=>handleMetaChange('investment','target_date', e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                <select value={goalsMeta.investment.priority}
                  onChange={(e)=>handleMetaChange('investment','priority', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Planned Monthly (KES)</label>
                <input type="number" value={goalsMeta.investment.planned_monthly}
                  onChange={(e)=>handleMetaChange('investment','planned_monthly', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
              </div>
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
      {/* Other Goal */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-800">➕ Other Goal</h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input value={otherGoal.name} onChange={(e)=>setOtherGoal({...otherGoal, name: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Amount (KES)</label>
            <input type="number" value={otherGoal.target_amount} onChange={(e)=>setOtherGoal({...otherGoal, target_amount: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Amount (KES)</label>
            <input type="number" value={otherGoal.current_amount} onChange={(e)=>setOtherGoal({...otherGoal, current_amount: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
            <input type="date" value={otherGoal.target_date} onChange={(e)=>setOtherGoal({...otherGoal, target_date: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select value={otherGoal.priority} onChange={(e)=>setOtherGoal({...otherGoal, priority: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md">
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Planned Monthly (KES)</label>
            <input type="number" value={otherGoal.planned_monthly} onChange={(e)=>setOtherGoal({...otherGoal, planned_monthly: e.target.value})} className="block w-full px-3 py-2 border border-gray-300 rounded-md" />
          </div>
        </div>
      </div>

      {/* Plan Preview & Apply Option */}
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h4 className="text-lg font-medium text-gray-800 mb-2">Plan Preview</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-3 bg-white rounded border">
            <p className="text-sm text-gray-600">Monthly Income</p>
            <p className="text-xl font-bold text-gray-800">KES {Math.round(monthlyIncome).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white rounded border">
            <p className="text-sm text-gray-600">Baseline Expenses</p>
            <p className="text-xl font-bold text-gray-800">KES {Math.round(baselineExpenses).toLocaleString()}</p>
          </div>
          <div className="p-3 bg-white rounded border">
            <p className="text-sm text-gray-600">Surplus</p>
            <p className={`text-xl font-bold ${surplus>=0?'text-blue-700':'text-orange-700'}`}>KES {Math.round(surplus).toLocaleString()}</p>
          </div>
        </div>
        <div className="p-3 bg-white rounded border mb-3">
          <p className="text-sm text-gray-600">Required Monthly for Entered Goals</p>
          <p className={`text-xl font-bold ${totalRequired<=surplus?'text-green-700':'text-orange-700'}`}>KES {Math.round(totalRequired).toLocaleString()} ({totalRequired<=surplus?'Feasible':'Shortfall'})</p>
        </div>
        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-700">Strategy for Post‑Onboarding Apply:</label>
          <select value={planPref.strategy} onChange={(e)=>setPlanPref({...planPref, strategy: e.target.value})} className="border rounded px-2 py-1">
            <option value="B">Allocate surplus equally across goals</option>
          </select>
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={!!planPref.applyOnComplete} onChange={(e)=>setPlanPref({...planPref, applyOnComplete: e.target.checked})} /> Apply after completion</label>
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
