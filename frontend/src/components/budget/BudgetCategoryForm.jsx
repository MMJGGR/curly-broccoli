import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';

const BudgetCategoryForm = ({ category = null, onClose, onSuccess }) => {
  const {
    createBudgetCategory,
    updateBudgetCategory,
    isSubmitting,
    error
  } = useTransactions();

  const [formData, setFormData] = useState({
    name: '',
    budgeted_amount: '',
    category_type: 'expense',
    budget_period: 'monthly',
    parent_category_id: null,
    is_active: true
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Populate form if editing existing category
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        budgeted_amount: category.budgeted_amount?.toString() || '',
        category_type: category.category_type || 'expense',
        budget_period: category.budget_period || 'monthly',
        parent_category_id: category.parent_category_id || null,
        is_active: category.is_active !== undefined ? category.is_active : true
      });
    }
  }, [category]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Category name is required';
    }

    if (!formData.budgeted_amount || isNaN(parseFloat(formData.budgeted_amount)) || parseFloat(formData.budgeted_amount) < 0) {
      errors.budgeted_amount = 'Budget amount must be a positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const categoryData = {
        ...formData,
        budgeted_amount: parseFloat(formData.budgeted_amount)
      };

      let result;
      if (category) {
        result = await updateBudgetCategory(category.id, categoryData);
      } else {
        result = await createBudgetCategory(categoryData);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save budget category:', error);
    }
  };

  const categoryTypes = [
    { value: 'expense', label: 'Expense', description: 'Money going out', icon: '💸' },
    { value: 'income', label: 'Income', description: 'Money coming in', icon: '💰' },
    { value: 'transfer', label: 'Transfer', description: 'Money moving between accounts', icon: '🔄' }
  ];

  const budgetPeriods = [
    { value: 'monthly', label: 'Monthly', description: 'Budget per month' },
    { value: 'yearly', label: 'Yearly', description: 'Budget per year' }
  ];

  const commonCategories = {
    expense: [
      'Food & Dining',
      'Groceries',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Transport',
      'Healthcare',
      'Travel',
      'Education',
      'Rent/Mortgage',
      'Insurance',
      'Personal Care',
      'Home Maintenance',
      'Subscriptions',
      'Charity',
      'Other Expenses'
    ],
    income: [
      'Salary',
      'Business Income',
      'Investment Returns',
      'Rental Income',
      'Freelance',
      'Bonus',
      'Gift/Cash',
      'Other Income'
    ],
    transfer: [
      'Savings Transfer',
      'Investment Transfer',
      'Account Transfer',
      'Loan Payment',
      'Credit Card Payment'
    ]
  };

  return (
    <div className=\"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50\">
      <div className=\"relative top-8 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-lg bg-white my-8\">
        {/* Header */}
        <div className=\"flex items-center justify-between p-6 border-b border-gray-200\">
          <h3 className=\"text-lg font-medium text-gray-900\">
            {category ? 'Edit Budget Category' : 'Add Budget Category'}
          </h3>
          <button
            onClick={onClose}
            className=\"text-gray-400 hover:text-gray-600 focus:outline-none\"
          >
            <span className=\"sr-only\">Close</span>
            <svg className=\"h-6 w-6\" fill=\"none\" viewBox=\"0 0 24 24\" stroke=\"currentColor\">
              <path strokeLinecap=\"round\" strokeLinejoin=\"round\" strokeWidth={2} d=\"M6 18L18 6M6 6l12 12\" />
            </svg>
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className=\"mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4\">
            <div className=\"flex\">
              <div className=\"ml-3\">
                <h3 className=\"text-sm font-medium text-red-800\">Error</h3>
                <div className=\"mt-2 text-sm text-red-700\">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className=\"p-6\">
          <div className=\"space-y-6\">
            {/* Category Name */}
            <div>
              <label htmlFor=\"name\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Category Name *
              </label>
              <input
                type=\"text\"
                id=\"name\"
                list=\"category-suggestions\"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder=\"e.g., Groceries, Rent, Entertainment\"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <datalist id=\"category-suggestions\">
                {commonCategories[formData.category_type]?.map(cat => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {validationErrors.name && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.name}</p>
              )}
            </div>

            {/* Category Type */}
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-3\">
                Category Type *
              </label>
              <div className=\"grid grid-cols-1 md:grid-cols-3 gap-3\">
                {categoryTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.category_type === type.value
                        ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type=\"radio\"
                      name=\"category_type\"
                      value={type.value}
                      checked={formData.category_type === type.value}
                      onChange={(e) => handleInputChange('category_type', e.target.value)}
                      className=\"sr-only\"
                    />
                    <div className=\"flex items-center\">
                      <span className=\"text-2xl mr-3\">{type.icon}</span>
                      <div>
                        <div className=\"text-sm font-medium text-gray-900\">{type.label}</div>
                        <div className=\"text-xs text-gray-500\">{type.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Budget Amount */}
            <div>
              <label htmlFor=\"budgeted_amount\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Budget Amount (KES) *
              </label>
              <div className=\"relative\">
                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
                  <span className=\"text-gray-500 sm:text-sm\">KES</span>
                </div>
                <input
                  type=\"number\"
                  id=\"budgeted_amount\"
                  step=\"0.01\"
                  min=\"0\"
                  value={formData.budgeted_amount}
                  onChange={(e) => handleInputChange('budgeted_amount', e.target.value)}
                  placeholder=\"0.00\"
                  className={`w-full border rounded-lg pl-12 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.budgeted_amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {validationErrors.budgeted_amount && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.budgeted_amount}</p>
              )}
              <p className=\"mt-1 text-xs text-gray-500\">
                Amount you plan to {formData.category_type === 'expense' ? 'spend' : formData.category_type === 'income' ? 'earn' : 'transfer'} in this category
              </p>
            </div>

            {/* Budget Period */}
            <div>
              <label className=\"block text-sm font-medium text-gray-700 mb-3\">
                Budget Period *
              </label>
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-3\">
                {budgetPeriods.map((period) => (
                  <label
                    key={period.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.budget_period === period.value
                        ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type=\"radio\"
                      name=\"budget_period\"
                      value={period.value}
                      checked={formData.budget_period === period.value}
                      onChange={(e) => handleInputChange('budget_period', e.target.value)}
                      className=\"sr-only\"
                    />
                    <div className=\"flex-1\">
                      <div className=\"text-sm font-medium text-gray-900\">{period.label}</div>
                      <div className=\"text-xs text-gray-500\">{period.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Active Status */}
            <div className=\"flex items-center\">
              <input
                id=\"is_active\"
                type=\"checkbox\"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className=\"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
              />
              <label htmlFor=\"is_active\" className=\"ml-2 block text-sm text-gray-900\">
                Category is active
              </label>
            </div>
            <p className=\"text-xs text-gray-500\">
              Inactive categories will be hidden from transaction forms and reports
            </p>

            {/* Budget Tips */}
            <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4\">
              <div className=\"flex\">
                <div className=\"flex-shrink-0\">
                  <span className=\"text-blue-400 text-xl\">💡</span>
                </div>
                <div className=\"ml-3\">
                  <h3 className=\"text-sm font-medium text-blue-800\">Budget Tips</h3>
                  <div className=\"mt-2 text-sm text-blue-700\">
                    <ul className=\"list-disc list-inside space-y-1\">
                      <li>Start with realistic amounts based on your past spending</li>
                      <li>Review and adjust your budgets monthly</li>
                      <li>Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings</li>
                      <li>Include a \"Miscellaneous\" category for unexpected expenses</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className=\"mt-8 flex justify-end space-x-3 pt-6 border-t border-gray-200\">
            <button
              type=\"button\"
              onClick={onClose}
              className=\"px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500\"
            >
              Cancel
            </button>
            <button
              type=\"submit\"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmitting ? (
                <span className=\"flex items-center\">
                  <svg className=\"animate-spin -ml-1 mr-2 h-4 w-4 text-white\" fill=\"none\" viewBox=\"0 0 24 24\">
                    <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\"></circle>
                    <path className=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                category ? 'Update Category' : 'Add Category'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetCategoryForm;