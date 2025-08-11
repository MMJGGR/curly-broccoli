import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';

const TransactionForm = ({ 
  transaction = null, 
  onClose, 
  onSuccess,
  defaultAccountId = null 
}) => {
  const {
    accounts,
    budgetCategories,
    createTransaction,
    updateTransaction,
    isSubmitting,
    error
  } = useTransactions();

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    transaction_type: 'debit',
    category: '',
    subcategory: '',
    account_id: defaultAccountId || '',
    merchant: '',
    notes: '',
    is_pending: false
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Populate form if editing existing transaction
  useEffect(() => {
    if (transaction) {
      setFormData({
        date: transaction.date,
        description: transaction.description,
        amount: Math.abs(transaction.amount).toString(),
        transaction_type: transaction.amount < 0 ? 'debit' : 'credit',
        category: transaction.category,
        subcategory: transaction.subcategory || '',
        account_id: transaction.account_id,
        merchant: transaction.merchant || '',
        notes: transaction.notes || '',
        is_pending: transaction.is_pending
      });
    }
  }, [transaction]);

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

    if (!formData.date) {
      errors.date = 'Date is required';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }

    if (!formData.amount || isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }

    if (!formData.account_id) {
      errors.account_id = 'Account is required';
    }

    if (!formData.category.trim()) {
      errors.category = 'Category is required';
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
      const transactionData = {
        ...formData,
        amount: formData.transaction_type === 'debit' 
          ? -Math.abs(parseFloat(formData.amount))
          : Math.abs(parseFloat(formData.amount))
      };

      let result;
      if (transaction) {
        result = await updateTransaction(transaction.id, transactionData);
      } else {
        result = await createTransaction(transactionData);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save transaction:', error);
    }
  };

  const getAccountName = (accountId) => {
    const account = accounts.find(a => a.id === parseInt(accountId));
    return account ? account.name : '';
  };

  // Get unique categories from existing budget categories
  const categoryOptions = [
    ...new Set([
      ...budgetCategories.map(cat => cat.name),
      'Food & Dining',
      'Shopping',
      'Entertainment',
      'Bills & Utilities',
      'Transport',
      'Healthcare',
      'Travel',
      'Education',
      'Groceries',
      'Income',
      'Transfer',
      'Other'
    ])
  ].sort();

  return (
    <div className=\"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50\">
      <div className=\"relative top-4 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-lg bg-white my-8\">
        {/* Header */}
        <div className=\"flex items-center justify-between p-6 border-b border-gray-200\">
          <h3 className=\"text-lg font-medium text-gray-900\">
            {transaction ? 'Edit Transaction' : 'Add New Transaction'}
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
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            {/* Date */}
            <div>
              <label htmlFor=\"date\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Date *
              </label>
              <input
                type=\"date\"
                id=\"date\"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.date ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.date && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.date}</p>
              )}
            </div>

            {/* Transaction Type */}
            <div>
              <label htmlFor=\"transaction_type\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Type *
              </label>
              <select
                id=\"transaction_type\"
                value={formData.transaction_type}
                onChange={(e) => handleInputChange('transaction_type', e.target.value)}
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              >
                <option value=\"debit\">Expense (Money Out)</option>
                <option value=\"credit\">Income (Money In)</option>
              </select>
            </div>

            {/* Description */}
            <div className=\"md:col-span-2\">
              <label htmlFor=\"description\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Description *
              </label>
              <input
                type=\"text\"
                id=\"description\"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder=\"e.g., Grocery shopping at Carrefour\"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.description ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.description && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.description}</p>
              )}
            </div>

            {/* Amount */}
            <div>
              <label htmlFor=\"amount\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Amount (KES) *
              </label>
              <div className=\"relative\">
                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
                  <span className=\"text-gray-500 sm:text-sm\">KES</span>
                </div>
                <input
                  type=\"number\"
                  id=\"amount\"
                  step=\"0.01\"
                  min=\"0\"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder=\"0.00\"
                  className={`w-full border rounded-lg pl-12 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.amount ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {validationErrors.amount && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.amount}</p>
              )}
            </div>

            {/* Account */}
            <div>
              <label htmlFor=\"account_id\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Account *
              </label>
              <select
                id=\"account_id\"
                value={formData.account_id}
                onChange={(e) => handleInputChange('account_id', e.target.value)}
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.account_id ? 'border-red-300' : 'border-gray-300'
                }`}
              >
                <option value=\"\">Select an account</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name} - {account.type}
                  </option>
                ))}
              </select>
              {validationErrors.account_id && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.account_id}</p>
              )}
            </div>

            {/* Category */}
            <div>
              <label htmlFor=\"category\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Category *
              </label>
              <input
                type=\"text\"
                id=\"category\"
                list=\"category-options\"
                value={formData.category}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder=\"Select or enter category\"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.category ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <datalist id=\"category-options\">
                {categoryOptions.map(category => (
                  <option key={category} value={category} />
                ))}
              </datalist>
              {validationErrors.category && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.category}</p>
              )}
            </div>

            {/* Subcategory */}
            <div>
              <label htmlFor=\"subcategory\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Subcategory
              </label>
              <input
                type=\"text\"
                id=\"subcategory\"
                value={formData.subcategory}
                onChange={(e) => handleInputChange('subcategory', e.target.value)}
                placeholder=\"Optional subcategory\"
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              />
            </div>

            {/* Merchant */}
            <div className=\"md:col-span-2\">
              <label htmlFor=\"merchant\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Merchant/Payee
              </label>
              <input
                type=\"text\"
                id=\"merchant\"
                value={formData.merchant}
                onChange={(e) => handleInputChange('merchant', e.target.value)}
                placeholder=\"e.g., Carrefour, Uber, John Doe\"
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              />
            </div>

            {/* Notes */}
            <div className=\"md:col-span-2\">
              <label htmlFor=\"notes\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Notes
              </label>
              <textarea
                id=\"notes\"
                rows={3}
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                placeholder=\"Additional notes about this transaction...\"
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              />
            </div>

            {/* Pending Status */}
            <div className=\"md:col-span-2\">
              <div className=\"flex items-center\">
                <input
                  id=\"is_pending\"
                  type=\"checkbox\"
                  checked={formData.is_pending}
                  onChange={(e) => handleInputChange('is_pending', e.target.checked)}
                  className=\"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
                />
                <label htmlFor=\"is_pending\" className=\"ml-2 block text-sm text-gray-900\">
                  This is a pending transaction
                </label>
              </div>
              <p className=\"mt-1 text-xs text-gray-500\">
                Check this if the transaction hasn't been processed by your bank yet
              </p>
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
                transaction ? 'Update Transaction' : 'Add Transaction'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;