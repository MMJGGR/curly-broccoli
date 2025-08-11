import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';

const AccountForm = ({ account = null, onClose, onSuccess }) => {
  const {
    createAccount,
    updateAccount,
    isSubmitting,
    error
  } = useTransactions();

  const [formData, setFormData] = useState({
    name: '',
    type: 'checking',
    institution_name: '',
    account_number: '',
    balance: '0.00',
    institution_id: '',
    is_active: true
  });

  const [validationErrors, setValidationErrors] = useState({});

  // Populate form if editing existing account
  useEffect(() => {
    if (account) {
      setFormData({
        name: account.name || '',
        type: account.type || 'checking',
        institution_name: account.institution_name || '',
        account_number: account.account_number || '',
        balance: account.balance?.toString() || '0.00',
        institution_id: account.institution_id || '',
        is_active: account.is_active !== undefined ? account.is_active : true
      });
    }
  }, [account]);

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
      errors.name = 'Account name is required';
    }

    if (!formData.type) {
      errors.type = 'Account type is required';
    }

    if (!formData.institution_name.trim()) {
      errors.institution_name = 'Institution name is required';
    }

    if (formData.balance && isNaN(parseFloat(formData.balance))) {
      errors.balance = 'Balance must be a valid number';
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
      const accountData = {
        ...formData,
        balance: parseFloat(formData.balance) || 0
      };

      let result;
      if (account) {
        result = await updateAccount(account.id, accountData);
      } else {
        result = await createAccount(accountData);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to save account:', error);
    }
  };

  const accountTypes = [
    { value: 'checking', label: 'Checking Account', description: 'Primary spending account', icon: '🏦' },
    { value: 'savings', label: 'Savings Account', description: 'Interest-bearing savings', icon: '🏛️' },
    { value: 'credit', label: 'Credit Card', description: 'Revolving credit account', icon: '💳' },
    { value: 'investment', label: 'Investment Account', description: 'Brokerage or retirement', icon: '📈' },
    { value: 'loan', label: 'Personal Loan', description: 'Fixed-term loan', icon: '💰' },
    { value: 'mortgage', label: 'Mortgage', description: 'Home loan', icon: '🏠' }
  ];

  const kenyanBanks = [
    'Kenya Commercial Bank (KCB)',
    'Equity Bank Kenya',
    'Cooperative Bank of Kenya',
    'Standard Chartered Bank Kenya',
    'Barclays Bank Kenya',
    'NCBA Bank Kenya',
    'ABSA Bank Kenya',
    'I&M Bank Kenya',
    'Diamond Trust Bank Kenya',
    'National Bank of Kenya',
    'Prime Bank Kenya',
    'Consolidated Bank of Kenya',
    'Credit Bank Kenya',
    'Development Bank of Kenya',
    'Family Bank Kenya',
    'First Community Bank',
    'Guardian Bank Kenya',
    'Gulf African Bank',
    'Habib Bank A.G. Zurich',
    'Housing Finance Company of Kenya',
    'Jamii Bora Bank',
    'Mayfair Bank Kenya',
    'Middle East Bank Kenya',
    'M-Shwari (Safaricom)',
    'KCB M-Pesa',
    'Other'
  ];

  return (
    <div className=\"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50\">
      <div className=\"relative top-4 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-lg bg-white my-8\">
        {/* Header */}
        <div className=\"flex items-center justify-between p-6 border-b border-gray-200\">
          <h3 className=\"text-lg font-medium text-gray-900\">
            {account ? 'Edit Account' : 'Add New Account'}
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
            {/* Account Name */}
            <div>
              <label htmlFor=\"name\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Account Name *
              </label>
              <input
                type=\"text\"
                id=\"name\"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder=\"e.g., KCB Checking Account\"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {validationErrors.name && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.name}</p>
              )}
            </div>

            {/* Account Type */}
            <div>
              <label htmlFor=\"type\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Account Type *
              </label>
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-3\">
                {accountTypes.map((type) => (
                  <label
                    key={type.value}
                    className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${
                      formData.type === type.value
                        ? 'border-blue-600 ring-2 ring-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <input
                      type=\"radio\"
                      name=\"type\"
                      value={type.value}
                      checked={formData.type === type.value}
                      onChange={(e) => handleInputChange('type', e.target.value)}
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
              {validationErrors.type && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.type}</p>
              )}
            </div>

            {/* Institution */}
            <div>
              <label htmlFor=\"institution_name\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Financial Institution *
              </label>
              <input
                type=\"text\"
                id=\"institution_name\"
                list=\"kenyan-banks\"
                value={formData.institution_name}
                onChange={(e) => handleInputChange('institution_name', e.target.value)}
                placeholder=\"Select or enter your bank name\"
                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  validationErrors.institution_name ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              <datalist id=\"kenyan-banks\">
                {kenyanBanks.map(bank => (
                  <option key={bank} value={bank} />
                ))}
              </datalist>
              {validationErrors.institution_name && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.institution_name}</p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label htmlFor=\"account_number\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Account Number
              </label>
              <input
                type=\"text\"
                id=\"account_number\"
                value={formData.account_number}
                onChange={(e) => handleInputChange('account_number', e.target.value)}
                placeholder=\"Optional - last 4 digits will be shown\"
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              />
              <p className=\"mt-1 text-xs text-gray-500\">
                Only the last 4 digits will be displayed for security
              </p>
            </div>

            {/* Current Balance */}
            <div>
              <label htmlFor=\"balance\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Current Balance (KES)
              </label>
              <div className=\"relative\">
                <div className=\"absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none\">
                  <span className=\"text-gray-500 sm:text-sm\">KES</span>
                </div>
                <input
                  type=\"number\"
                  id=\"balance\"
                  step=\"0.01\"
                  value={formData.balance}
                  onChange={(e) => handleInputChange('balance', e.target.value)}
                  placeholder=\"0.00\"
                  className={`w-full border rounded-lg pl-12 pr-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    validationErrors.balance ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
              </div>
              {validationErrors.balance && (
                <p className=\"mt-1 text-sm text-red-600\">{validationErrors.balance}</p>
              )}
              <p className=\"mt-1 text-xs text-gray-500\">
                Enter your current account balance. For credit cards, enter the outstanding balance as a positive number.
              </p>
            </div>

            {/* Institution ID (Optional) */}
            <div>
              <label htmlFor=\"institution_id\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Institution ID (Optional)
              </label>
              <input
                type=\"text\"
                id=\"institution_id\"
                value={formData.institution_id}
                onChange={(e) => handleInputChange('institution_id', e.target.value)}
                placeholder=\"For future banking API integration\"
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              />
              <p className=\"mt-1 text-xs text-gray-500\">
                This will be used for automatic transaction syncing when available
              </p>
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
                Account is active
              </label>
            </div>
            <p className=\"text-xs text-gray-500\">
              Inactive accounts will be hidden from transaction forms and summaries
            </p>
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
                account ? 'Update Account' : 'Add Account'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountForm;