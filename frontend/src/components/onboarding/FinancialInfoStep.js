/**
 * FinancialInfoStep - Step 3 of onboarding
 * Features:
 * - Real income capture (no hardcoded 600000!)
 * - Comprehensive expense tracking
 * - Auto-save functionality
 * - Budget calculations and insights
 */
import React, { useState, useEffect } from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';

const FinancialInfoStep = () => {
  const { financialData, updateFinancialData, saveStep, saveStatus } = useOnboarding();
  
  // Local state for form fields
  const [formData, setFormData] = useState({
    monthlyIncome: financialData.monthlyIncome || '',
    incomeFrequency: financialData.incomeFrequency || 'Monthly',
    rent: financialData.rent || '',
    utilities: financialData.utilities || '',
    groceries: financialData.groceries || '',
    transport: financialData.transport || '',
    loanRepayments: financialData.loanRepayments || '',
    customExpenses: financialData.customExpenses || [],
    customIncomes: financialData.customIncomes || []
  });

  // State for adding new expense/income types
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: '', amount: '' });
  const [newIncome, setNewIncome] = useState({ name: '', amount: '' });
  
  // Validation errors
  const [errors, setErrors] = useState({});
  
  // Update context when form data changes
  useEffect(() => {
    updateFinancialData(formData);
  }, [formData]);
  
  // Handle input changes with persona-aware validation
  const handleChange = (field, value) => {
    // Convert to number for financial fields
    const numericValue = ['monthlyIncome', 'rent', 'utilities', 'groceries', 'transport', 'loanRepayments'].includes(field)
      ? parseFloat(value) || ''
      : value;
    
    setFormData(prev => ({ ...prev, [field]: numericValue }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Add custom expense
  const handleAddExpense = () => {
    if (newExpense.name && newExpense.amount) {
      const expense = {
        id: Date.now(),
        name: newExpense.name,
        amount: parseFloat(newExpense.amount) || 0
      };
      setFormData(prev => ({
        ...prev,
        customExpenses: [...prev.customExpenses, expense]
      }));
      setNewExpense({ name: '', amount: '' });
      setShowAddExpense(false);
    }
  };

  // Remove custom expense
  const handleRemoveExpense = (id) => {
    setFormData(prev => ({
      ...prev,
      customExpenses: prev.customExpenses.filter(exp => exp.id !== id)
    }));
  };

  // Add custom income
  const handleAddIncome = () => {
    if (newIncome.name && newIncome.amount) {
      const income = {
        id: Date.now(),
        name: newIncome.name,
        amount: parseFloat(newIncome.amount) || 0
      };
      setFormData(prev => ({
        ...prev,
        customIncomes: [...prev.customIncomes, income]
      }));
      setNewIncome({ name: '', amount: '' });
      setShowAddIncome(false);
    }
  };

  // Remove custom income
  const handleRemoveIncome = (id) => {
    setFormData(prev => ({
      ...prev,
      customIncomes: prev.customIncomes.filter(inc => inc.id !== id)
    }));
  };

  // Calculate total monthly expenses
  const getTotalMonthlyExpenses = () => {
    const basicExpenses = (formData.rent || 0) + (formData.utilities || 0) + 
                         (formData.groceries || 0) + (formData.transport || 0) + 
                         (formData.loanRepayments || 0);
    const customExpensesTotal = formData.customExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    return basicExpenses + customExpensesTotal;
  };

  // Calculate total monthly income
  const getTotalMonthlyIncome = () => {
    const basicIncome = formData.monthlyIncome || 0;
    const customIncomesTotal = formData.customIncomes.reduce((sum, inc) => sum + inc.amount, 0);
    return basicIncome + customIncomesTotal;
  };

  // Persona-aware income patterns detection
  const detectPersonaPattern = () => {
    const income = parseFloat(formData.monthlyIncome) || 0;
    if (income <= 0) return null;
    
    if (income < 50000) return 'entry-level';
    if (income >= 50000 && income < 100000) return 'early-career'; // Jamal
    if (income >= 100000 && income < 150000) return 'family-business'; // Aisha  
    if (income >= 150000) return 'senior-executive'; // Samuel
    return 'general';
  };

  // Get persona-specific expense suggestions
  const getPersonaExpenseSuggestions = () => {
    const persona = detectPersonaPattern();
    const income = parseFloat(formData.monthlyIncome) || 0;
    
    switch (persona) {
      case 'early-career': // Jamal Mwangi
        return {
          rent: Math.round(income * 0.3), // 30% for rent
          utilities: Math.round(income * 0.08), // 8% utilities
          groceries: Math.round(income * 0.15), // 15% food
          transport: Math.round(income * 0.12), // 12% transport
          loanRepayments: Math.round(income * 0.15), // 15% debt payoff
          tips: [
            "💡 Focus on building emergency fund first",
            "🎯 Prioritize high-interest debt payoff",
            "📱 Consider shared living to reduce rent costs"
          ]
        };
      case 'family-business': // Aisha Otieno  
        return {
          rent: Math.round(income * 0.25), // 25% for family housing
          utilities: Math.round(income * 0.07), // 7% utilities
          groceries: Math.round(income * 0.20), // 20% family food
          transport: Math.round(income * 0.10), // 10% transport
          loanRepayments: Math.round(income * 0.08), // 8% loans
          tips: [
            "👨‍👩‍👧‍👦 Budget for children's education expenses",
            "🏠 Consider property investment opportunities",
            "💼 Account for irregular business income"
          ]
        };
      case 'senior-executive': // Samuel Kariuki
        return {
          rent: Math.round(income * 0.20), // 20% housing
          utilities: Math.round(income * 0.05), // 5% utilities  
          groceries: Math.round(income * 0.12), // 12% food
          transport: Math.round(income * 0.08), // 8% transport
          loanRepayments: Math.round(income * 0.05), // 5% loans
          tips: [
            "🏖️ Maximize retirement contributions",
            "💰 Consider tax-advantaged investments", 
            "🏥 Plan for healthcare cost increases"
          ]
        };
      default:
        return {
          rent: Math.round(income * 0.28),
          utilities: Math.round(income * 0.08),
          groceries: Math.round(income * 0.15),
          transport: Math.round(income * 0.10),
          loanRepayments: Math.round(income * 0.10),
          tips: ["💡 Build a balanced budget that works for your lifestyle"]
        };
    }
  };
  
  // Format currency input
  const formatCurrency = (value) => {
    if (!value) return '';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('KES', 'KES ');
  };
  
  // Validate field
  const validateField = (field, value) => {
    switch (field) {
      case 'monthlyIncome':
        if (!value || value <= 0) return 'Monthly income is required';
        if (value < 1000) return 'Monthly income seems too low';
        if (value > 10000000) return 'Monthly income seems unrealistically high';
        return null;
      case 'rent':
      case 'utilities':
      case 'groceries':
      case 'transport':
      case 'loanRepayments':
        if (value < 0) return 'Amount cannot be negative';
        if (value > formData.monthlyIncome) return 'Cannot exceed monthly income';
        return null;
      default:
        return null;
    }
  };
  
  // Handle blur for validation
  const handleBlur = (field, value) => {
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
  };
  
  // Calculate totals
  const calculateTotalExpenses = () => {
    const expenses = [
      formData.rent,
      formData.utilities,
      formData.groceries,
      formData.transport,
      formData.loanRepayments
    ];
    return expenses.reduce((total, expense) => total + (parseFloat(expense) || 0), 0);
  };
  
  
  
  // Manual save
  const handleSaveStep = async () => {
    const result = await saveStep(3, formData, true);
    if (result.success) {
      console.log('✅ Financial information saved successfully');
    }
  };
  
  // Get budget health color
  const getBudgetHealthColor = () => {
    const totalIncome = getTotalMonthlyIncome();
    const totalExpenses = getTotalMonthlyExpenses();
    const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100) : 0;
    if (savingsRate >= 20) return 'green';
    if (savingsRate >= 10) return 'yellow';
    return 'red';
  };
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Financial Information</h3>
          <p className="text-sm text-gray-600 mt-1">
            Help us understand your income and expenses to provide better financial guidance
          </p>
        </div>
        {saveStatus[3] === 'saved' && (
          <div className="flex items-center text-green-600 text-sm">
            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Saved automatically
          </div>
        )}
      </div>
      
      {/* Income Section */}
      <div className="bg-green-50 p-6 rounded-lg border border-green-200">
        <h4 className="text-lg font-medium text-gray-800 mb-4">💰 Monthly Income</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="monthlyIncome" className="block text-sm font-medium text-gray-700 mb-2">
              Monthly Income (KES) *
            </label>
            <input
              type="number"
              id="monthlyIncome"
              value={formData.monthlyIncome}
              onChange={(e) => handleChange('monthlyIncome', e.target.value)}
              onBlur={(e) => handleBlur('monthlyIncome', parseFloat(e.target.value) || 0)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.monthlyIncome ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 80000"
              min="0"
            />
            {errors.monthlyIncome && (
              <p className="mt-1 text-sm text-red-600">{errors.monthlyIncome}</p>
            )}
            {formData.monthlyIncome && !errors.monthlyIncome && (
              <p className="mt-1 text-sm text-green-600">
                Annual: {formatCurrency(formData.monthlyIncome * 12)}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="incomeFrequency" className="block text-sm font-medium text-gray-700 mb-2">
              Income Frequency
            </label>
            <select
              id="incomeFrequency"
              value={formData.incomeFrequency}
              onChange={(e) => handleChange('incomeFrequency', e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Monthly">Monthly</option>
              <option value="Bi-weekly">Bi-weekly</option>
              <option value="Weekly">Weekly</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
        
        {/* Custom Incomes Section */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-md font-medium text-gray-800">💼 Additional Income Sources</h5>
            <button
              type="button"
              onClick={() => setShowAddIncome(true)}
              className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md hover:bg-green-200 transition-colors"
            >
              + Add Income Source
            </button>
          </div>
          
          {/* Show add income form */}
          {showAddIncome && (
            <div className="bg-white p-4 rounded-md border border-green-200 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Income Source
                  </label>
                  <input
                    type="text"
                    value={newIncome.name}
                    onChange={(e) => setNewIncome(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Freelance, Side Business"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome(prev => ({ ...prev, amount: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 15000"
                    min="0"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    type="button"
                    onClick={handleAddIncome}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddIncome(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Display custom incomes */}
          {formData.customIncomes.length > 0 && (
            <div className="space-y-2">
              {formData.customIncomes.map((income) => (
                <div key={income.id} className="flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200">
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{income.name}</span>
                    <span className="ml-4 text-green-600">{formatCurrency(income.amount)}</span>
                    <span className="ml-2 text-sm text-gray-600">
                      (Annual: {formatCurrency(income.amount * 12)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveIncome(income.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Persona-Specific Guidance */}
      {formData.monthlyIncome && (
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h4 className="text-lg font-medium text-gray-800 mb-4">💡 Personalized Budget Guidance</h4>
          {(() => {
            const suggestions = getPersonaExpenseSuggestions();
            const persona = detectPersonaPattern();
            
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Rent</p>
                    <p className="text-blue-600">KES {suggestions.rent.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Utilities</p>
                    <p className="text-blue-600">KES {suggestions.utilities.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Food</p>
                    <p className="text-blue-600">KES {suggestions.groceries.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Transport</p>
                    <p className="text-blue-600">KES {suggestions.transport.toLocaleString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-gray-700">Loans</p>
                    <p className="text-blue-600">KES {suggestions.loanRepayments.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded-lg">
                  <p className="font-medium text-gray-800 mb-2">
                    {persona === 'early-career' && '🎯 Early Career Tips:'}
                    {persona === 'family-business' && '👨‍👩‍👧‍👦 Family Financial Tips:'}
                    {persona === 'senior-executive' && '🏆 Executive Financial Tips:'}
                    {!persona && '💡 Financial Tips:'}
                  </p>
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
                    if (!newData.rent) newData.rent = suggestions.rent;
                    if (!newData.utilities) newData.utilities = suggestions.utilities;
                    if (!newData.groceries) newData.groceries = suggestions.groceries;
                    if (!newData.transport) newData.transport = suggestions.transport;
                    if (!newData.loanRepayments) newData.loanRepayments = suggestions.loanRepayments;
                    setFormData(newData);
                  }}
                  className="text-sm bg-blue-100 text-blue-700 px-4 py-2 rounded-md hover:bg-blue-200 transition-colors"
                >
                  💫 Use Suggested Amounts
                </button>
              </div>
            );
          })()}
        </div>
      )}

      {/* Expenses Section */}
      <div className="bg-orange-50 p-6 rounded-lg border border-orange-200">
        <h4 className="text-lg font-medium text-gray-800 mb-4">📊 Monthly Expenses</h4>
        <p className="text-sm text-gray-600 mb-6">Enter your typical monthly spending in each category</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Rent/Mortgage */}
          <div>
            <label htmlFor="rent" className="block text-sm font-medium text-gray-700 mb-2">
              🏠 Rent/Mortgage
            </label>
            <input
              type="number"
              id="rent"
              value={formData.rent}
              onChange={(e) => handleChange('rent', e.target.value)}
              onBlur={(e) => handleBlur('rent', parseFloat(e.target.value) || 0)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.rent ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 25000"
              min="0"
            />
            {errors.rent && (
              <p className="mt-1 text-sm text-red-600">{errors.rent}</p>
            )}
            {formData.rent && !errors.rent && (
              <p className="mt-1 text-sm text-orange-600">
                Annual: {formatCurrency((formData.rent || 0) * 12)}
              </p>
            )}
          </div>
          
          {/* Utilities */}
          <div>
            <label htmlFor="utilities" className="block text-sm font-medium text-gray-700 mb-2">
              ⚡ Utilities (Electricity, Water, Internet)
            </label>
            <input
              type="number"
              id="utilities"
              value={formData.utilities}
              onChange={(e) => handleChange('utilities', e.target.value)}
              onBlur={(e) => handleBlur('utilities', parseFloat(e.target.value) || 0)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.utilities ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 8000"
              min="0"
            />
            {errors.utilities && (
              <p className="mt-1 text-sm text-red-600">{errors.utilities}</p>
            )}
            {formData.utilities && !errors.utilities && (
              <p className="mt-1 text-sm text-orange-600">
                Annual: {formatCurrency((formData.utilities || 0) * 12)}
              </p>
            )}
          </div>
          
          {/* Groceries */}
          <div>
            <label htmlFor="groceries" className="block text-sm font-medium text-gray-700 mb-2">
              🛒 Groceries & Food
            </label>
            <input
              type="number"
              id="groceries"
              value={formData.groceries}
              onChange={(e) => handleChange('groceries', e.target.value)}
              onBlur={(e) => handleBlur('groceries', parseFloat(e.target.value) || 0)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.groceries ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 15000"
              min="0"
            />
            {errors.groceries && (
              <p className="mt-1 text-sm text-red-600">{errors.groceries}</p>
            )}
            {formData.groceries && !errors.groceries && (
              <p className="mt-1 text-sm text-orange-600">
                Annual: {formatCurrency((formData.groceries || 0) * 12)}
              </p>
            )}
          </div>
          
          {/* Transport */}
          <div>
            <label htmlFor="transport" className="block text-sm font-medium text-gray-700 mb-2">
              🚗 Transport & Fuel
            </label>
            <input
              type="number"
              id="transport"
              value={formData.transport}
              onChange={(e) => handleChange('transport', e.target.value)}
              onBlur={(e) => handleBlur('transport', parseFloat(e.target.value) || 0)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.transport ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 12000"
              min="0"
            />
            {errors.transport && (
              <p className="mt-1 text-sm text-red-600">{errors.transport}</p>
            )}
            {formData.transport && !errors.transport && (
              <p className="mt-1 text-sm text-orange-600">
                Annual: {formatCurrency((formData.transport || 0) * 12)}
              </p>
            )}
          </div>
          
          {/* Loan Repayments */}
          <div className="md:col-span-2">
            <label htmlFor="loanRepayments" className="block text-sm font-medium text-gray-700 mb-2">
              💳 Loan Repayments & Debt
            </label>
            <input
              type="number"
              id="loanRepayments"
              value={formData.loanRepayments}
              onChange={(e) => handleChange('loanRepayments', e.target.value)}
              onBlur={(e) => handleBlur('loanRepayments', parseFloat(e.target.value) || 0)}
              className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.loanRepayments ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="e.g., 10000"
              min="0"
            />
            {errors.loanRepayments && (
              <p className="mt-1 text-sm text-red-600">{errors.loanRepayments}</p>
            )}
            {formData.loanRepayments && !errors.loanRepayments && (
              <p className="mt-1 text-sm text-orange-600">
                Annual: {formatCurrency((formData.loanRepayments || 0) * 12)}
              </p>
            )}
          </div>
        </div>
        
        {/* Custom Expenses Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-md font-medium text-gray-800">🏷️ Custom Expenses</h5>
            <button
              type="button"
              onClick={() => setShowAddExpense(true)}
              className="text-sm bg-orange-100 text-orange-700 px-3 py-1 rounded-md hover:bg-orange-200 transition-colors"
            >
              + Add Expense Type
            </button>
          </div>
          
          {/* Show add expense form */}
          {showAddExpense && (
            <div className="bg-white p-4 rounded-md border border-orange-200 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expense Name
                  </label>
                  <input
                    type="text"
                    value={newExpense.name}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, name: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Entertainment"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Amount (KES)
                  </label>
                  <input
                    type="number"
                    value={newExpense.amount}
                    onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 5000"
                    min="0"
                  />
                </div>
                <div className="flex items-end space-x-2">
                  <button
                    type="button"
                    onClick={handleAddExpense}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddExpense(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {/* Display custom expenses */}
          {formData.customExpenses.length > 0 && (
            <div className="space-y-2">
              {formData.customExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between bg-orange-50 p-3 rounded-md border border-orange-200">
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{expense.name}</span>
                    <span className="ml-4 text-orange-600">{formatCurrency(expense.amount)}</span>
                    <span className="ml-2 text-sm text-gray-600">
                      (Annual: {formatCurrency(expense.amount * 12)})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExpense(expense.id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Budget Summary */}
      {formData.monthlyIncome && (
        <div className={`bg-${getBudgetHealthColor()}-50 p-6 rounded-lg border border-${getBudgetHealthColor()}-200`}>
          <h4 className="text-lg font-medium text-gray-800 mb-4">📈 Budget Summary</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(getTotalMonthlyIncome())}
              </p>
              <p className="text-sm text-gray-600">Total Monthly Income</p>
              <p className="text-xs text-gray-500">
                (Primary: {formatCurrency(formData.monthlyIncome || 0)}
                {formData.customIncomes.length > 0 && ` + ${formData.customIncomes.length} additional sources`})
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {formatCurrency(getTotalMonthlyExpenses())}
              </p>
              <p className="text-sm text-gray-600">Total Monthly Expenses</p>
              <p className="text-xs text-gray-500">
                (Fixed: {formatCurrency(calculateTotalExpenses())}
                {formData.customExpenses.length > 0 && ` + ${formData.customExpenses.length} custom expenses`})
              </p>
            </div>
            
            <div className="text-center">
              <p className={`text-2xl font-bold text-${getBudgetHealthColor()}-600`}>
                {formatCurrency(getTotalMonthlyIncome() - getTotalMonthlyExpenses())}
              </p>
              <p className="text-sm text-gray-600">
                Net Income ({(((getTotalMonthlyIncome() - getTotalMonthlyExpenses()) / getTotalMonthlyIncome()) * 100).toFixed(1)}% savings rate)
              </p>
            </div>
          </div>
          
          {/* Budget insights */}
          <div className="mt-6 p-4 bg-white rounded-lg">
            <h5 className="font-medium text-gray-800 mb-2">💡 Budget Insights</h5>
            <div className="text-sm text-gray-700 space-y-1">
              {(() => {
                const totalIncome = getTotalMonthlyIncome();
                const totalExpenses = getTotalMonthlyExpenses();
                const savingsRate = totalIncome > 0 ? (((totalIncome - totalExpenses) / totalIncome) * 100) : 0;
                
                if (savingsRate >= 20) {
                  return <p className="text-green-600">✅ Excellent! You're saving over 20% of your total income.</p>;
                } else if (savingsRate >= 10) {
                  return <p className="text-yellow-600">⚠️ Good savings rate. Consider increasing to 20% if possible.</p>;
                } else if (savingsRate >= 0) {
                  return <p className="text-orange-600">💡 Consider reducing expenses to save at least 10% of total income.</p>;
                } else {
                  return <p className="text-red-600">🚨 Your expenses exceed income. Review and reduce spending.</p>;
                }
              })()}
              
              {/* Additional insights for custom items */}
              {formData.customIncomes.length > 0 && (
                <p className="text-blue-600">💼 Great! You have {formData.customIncomes.length} additional income source{formData.customIncomes.length > 1 ? 's' : ''} diversifying your earnings.</p>
              )}
              {formData.customExpenses.length > 0 && (
                <p className="text-purple-600">🏷️ You're tracking {formData.customExpenses.length} custom expense categor{formData.customExpenses.length > 1 ? 'ies' : 'y'} for better budgeting.</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Manual Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveStep}
          disabled={saveStatus[3] === 'saving' || !formData.monthlyIncome}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {saveStatus[3] === 'saving' ? 'Saving...' : 'Save Financial Info'}
        </button>
      </div>
      
      {/* Privacy note */}
      <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg">
        <p className="font-medium mb-2">🔒 Your financial information is secure:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>All data is encrypted and stored securely</li>
          <li>We never share your financial details with third parties</li>
          <li>This information helps us provide personalized financial advice</li>
          <li>You can update or delete this information anytime</li>
        </ul>
      </div>
    </div>
  );
};

export default FinancialInfoStep;