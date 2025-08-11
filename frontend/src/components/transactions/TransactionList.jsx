import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';

const TransactionList = ({ accountId = null, showFilters = true }) => {
  const {
    transactions,
    accounts,
    isLoading,
    error,
    fetchTransactions,
    deleteTransaction,
    clearError
  } = useTransactions();

  const [filters, setFilters] = useState({
    accountId: accountId || '',
    category: '',
    startDate: '',
    endDate: '',
    limit: 50,
    offset: 0
  });

  const [selectedTransactions, setSelectedTransactions] = useState(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  useEffect(() => {
    fetchTransactions(filters);
  }, [fetchTransactions, filters]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      offset: 0 // Reset pagination when filtering
    }));
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await deleteTransaction(transactionId);
      setShowDeleteDialog(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Failed to delete transaction:', error);
    }
  };

  const handleSelectTransaction = (transactionId) => {
    const newSelected = new Set(selectedTransactions);
    if (newSelected.has(transactionId)) {
      newSelected.delete(transactionId);
    } else {
      newSelected.add(transactionId);
    }
    setSelectedTransactions(newSelected);
  };

  const formatAmount = (amount) => {
    const absAmount = Math.abs(amount);
    const formattedAmount = new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(absAmount);
    
    return amount < 0 ? `-${formattedAmount}` : formattedAmount;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTransactionTypeIcon = (amount) => {
    return amount < 0 ? '↓' : '↑';
  };

  const getTransactionTypeClass = (amount) => {
    return amount < 0 ? 'expense' : 'income';
  };

  const categories = [...new Set(transactions.map(t => t.category))];

  if (error) {
    return (
      <div className=\"bg-red-50 border border-red-200 rounded-lg p-4 mb-6\">
        <div className=\"flex justify-between items-center\">
          <div>
            <h3 className=\"text-red-800 font-medium\">Error Loading Transactions</h3>
            <p className=\"text-red-600 text-sm mt-1\">{error}</p>
          </div>
          <button
            onClick={clearError}
            className=\"text-red-600 hover:text-red-800\"
          >
            <span className=\"sr-only\">Close</span>
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Filters */}
      {showFilters && (
        <div className=\"bg-white p-6 rounded-lg shadow-sm border\">
          <h3 className=\"text-lg font-medium text-gray-900 mb-4\">Filter Transactions</h3>
          
          <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4\">
            <div>
              <label htmlFor=\"account-filter\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Account
              </label>
              <select
                id=\"account-filter\"
                value={filters.accountId}
                onChange={(e) => handleFilterChange('accountId', e.target.value)}
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              >
                <option value=\"\">All Accounts</option>
                {accounts.map(account => (
                  <option key={account.id} value={account.id}>
                    {account.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor=\"category-filter\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                Category
              </label>
              <select
                id=\"category-filter\"
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              >
                <option value=\"\">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor=\"start-date\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                From Date
              </label>
              <input
                type=\"date\"
                id=\"start-date\"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              />
            </div>

            <div>
              <label htmlFor=\"end-date\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                To Date
              </label>
              <input
                type=\"date\"
                id=\"end-date\"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
              />
            </div>
          </div>

          <div className=\"mt-4 flex justify-between items-center\">
            <button
              onClick={() => setFilters({
                accountId: accountId || '',
                category: '',
                startDate: '',
                endDate: '',
                limit: 50,
                offset: 0
              })}
              className=\"text-sm text-gray-600 hover:text-gray-800\"
            >
              Clear Filters
            </button>
            
            <div className=\"text-sm text-gray-600\">
              {transactions.length} transactions
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className=\"bg-white rounded-lg shadow-sm border\">
        <div className=\"px-6 py-4 border-b border-gray-200\">
          <h3 className=\"text-lg font-medium text-gray-900\">Recent Transactions</h3>
        </div>

        {isLoading ? (
          <div className=\"flex items-center justify-center py-12\">
            <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600\"></div>
            <span className=\"ml-2 text-gray-600\">Loading transactions...</span>
          </div>
        ) : transactions.length === 0 ? (
          <div className=\"text-center py-12\">
            <div className=\"text-gray-400 text-6xl mb-4\">💳</div>
            <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No transactions found</h3>
            <p className=\"text-gray-600\">
              {Object.values(filters).some(f => f) ? 
                'Try adjusting your filters or add some transactions.' :
                'Start by adding your first transaction or importing from a CSV file.'
              }
            </p>
          </div>
        ) : (
          <div className=\"overflow-hidden\">
            <table className=\"min-w-full divide-y divide-gray-200\">
              <thead className=\"bg-gray-50\">
                <tr>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Date
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Description
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Category
                  </th>
                  <th className=\"px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Account
                  </th>
                  <th className=\"px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Amount
                  </th>
                  <th className=\"px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider\">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className=\"bg-white divide-y divide-gray-200\">
                {transactions.map((transaction) => (
                  <tr 
                    key={transaction.id}
                    className={`hover:bg-gray-50 ${selectedTransactions.has(transaction.id) ? 'bg-blue-50' : ''}`}
                  >
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-900\">
                      {formatDate(transaction.date)}
                    </td>
                    <td className=\"px-6 py-4 text-sm text-gray-900\">
                      <div className=\"flex items-center\">
                        <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mr-3 ${
                          transaction.amount < 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          {getTransactionTypeIcon(transaction.amount)}
                        </span>
                        <div>
                          <div className=\"font-medium\">{transaction.description}</div>
                          {transaction.merchant && (
                            <div className=\"text-gray-500 text-xs\">{transaction.merchant}</div>
                          )}
                          {transaction.is_pending && (
                            <div className=\"text-orange-600 text-xs font-medium\">Pending</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap\">
                      <span className=\"inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800\">
                        {transaction.category}
                      </span>
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-sm text-gray-500\">
                      {transaction.account_name}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${getTransactionTypeClass(transaction.amount)}`}>
                      {formatAmount(transaction.amount)}
                    </td>
                    <td className=\"px-6 py-4 whitespace-nowrap text-right text-sm font-medium\">
                      <div className=\"flex items-center justify-end space-x-2\">
                        <input
                          type=\"checkbox\"
                          checked={selectedTransactions.has(transaction.id)}
                          onChange={() => handleSelectTransaction(transaction.id)}
                          className=\"h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded\"
                        />
                        <button
                          onClick={() => {/* TODO: Open edit modal */}}
                          className=\"text-blue-600 hover:text-blue-900 text-sm\"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setTransactionToDelete(transaction.id);
                            setShowDeleteDialog(true);
                          }}
                          className=\"text-red-600 hover:text-red-900 text-sm\"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className=\"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50\">
          <div className=\"relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white\">
            <div className=\"mt-3 text-center\">
              <div className=\"mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100\">
                <span className=\"text-red-600 text-xl\">⚠️</span>
              </div>
              <h3 className=\"text-lg font-medium text-gray-900 mt-4\">Delete Transaction</h3>
              <div className=\"mt-2 px-7 py-3\">
                <p className=\"text-sm text-gray-500\">
                  Are you sure you want to delete this transaction? This action cannot be undone.
                </p>
              </div>
              <div className=\"items-center px-4 py-3 flex justify-center space-x-4\">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className=\"px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300\"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTransaction(transactionToDelete)}
                  className=\"px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300\"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionList;