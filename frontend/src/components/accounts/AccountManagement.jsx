import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import AccountForm from './AccountForm';

const AccountManagement = () => {
  const {
    accounts,
    accountSummary,
    isLoading,
    error,
    fetchAccounts,
    deleteAccount,
    clearError
  } = useTransactions();

  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [deleteForce, setDeleteForce] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowAccountForm(true);
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      await deleteAccount(accountToDelete.id, deleteForce);
      setShowDeleteDialog(false);
      setAccountToDelete(null);
      setDeleteForce(false);
      await fetchAccounts(); // Refresh accounts list
    } catch (error) {
      console.error('Failed to delete account:', error);
      // Error will be handled by context
    }
  };

  const formatCurrency = (amount) => {
    try {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        notation: 'compact',
        maximumFractionDigits: 0
      }).format(Math.abs(amount || 0));
    } catch {
      return new Intl.NumberFormat('en-KE', {
        style: 'currency',
        currency: 'KES',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(Math.abs(amount || 0));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-KE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAccountTypeIcon = (type) => {
    switch (type) {
      case 'checking': return '🏦';
      case 'savings': return '🏛️';
      case 'credit': return '💳';
      case 'investment': return '📈';
      case 'loan': return '💰';
      case 'mortgage': return '🏠';
      default: return '🏦';
    }
  };

  const getAccountTypeClass = (type, balance) => {
    if (type === 'credit' || type === 'loan' || type === 'mortgage') {
      return 'text-red-600';
    }
    return balance >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (error) {
    return (
      <div className=\"min-h-screen bg-gray-50 flex items-center justify-center\">
        <div className=\"bg-white p-8 rounded-lg shadow-sm max-w-md w-full\">
          <div className=\"text-center\">
            <div className=\"text-red-500 text-6xl mb-4\">⚠️</div>
            <h2 className=\"text-xl font-semibold text-gray-900 mb-2\">Something went wrong</h2>
            <p className=\"text-gray-600 mb-6\">{error}</p>
            <div className=\"flex space-x-3 justify-center\">
              <button
                onClick={clearError}
                className=\"bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg\"
              >
                Dismiss
              </button>
              <button
                onClick={() => fetchAccounts()}
                className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg\"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className=\"min-h-screen bg-gray-50\">
      <div className=\"max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8\">
        {/* Header */}
        <div className=\"mb-8\">
          <div className=\"flex justify-between items-center\">
            <div>
              <h1 className=\"text-3xl font-bold text-gray-900\">Account Management</h1>
              <p className=\"text-gray-600 mt-2\">Manage your financial accounts and track balances</p>
            </div>
            
            <button
              onClick={() => {
                setEditingAccount(null);
                setShowAccountForm(true);
              }}
              className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center\"
            >
              <span className=\"mr-2\">➕</span>
              Add Account
            </button>
          </div>
        </div>

        {/* Account Summary Cards */}
        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6 mb-8\">
          <div className=\"bg-white overflow-hidden shadow-sm rounded-lg\">
            <div className=\"p-6\">
              <div className=\"flex items-center\">
                <div className=\"flex-shrink-0\">
                  <div className=\"w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center\">
                    <span className=\"text-blue-600 text-lg\">🏦</span>
                  </div>
                </div>
                <div className=\"ml-4 w-0 flex-1\">
                  <dl>
                    <dt className=\"text-sm font-medium text-gray-500 truncate\">Total Accounts</dt>
                    <dd className=\"text-lg font-semibold text-blue-600\">
                      {accountSummary.totalAccounts || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className=\"bg-white overflow-hidden shadow-sm rounded-lg\">
            <div className=\"p-6\">
              <div className=\"flex items-center\">
                <div className=\"flex-shrink-0\">
                  <div className=\"w-8 h-8 bg-green-100 rounded-full flex items-center justify-center\">
                    <span className=\"text-green-600 text-lg\">📈</span>
                  </div>
                </div>
                <div className=\"ml-4 w-0 flex-1\">
                  <dl>
                    <dt className=\"text-sm font-medium text-gray-500 truncate\">Total Assets</dt>
                    <dd className=\"text-lg font-semibold text-green-600\">
                      {formatCurrency(accountSummary.totalAssets || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className=\"bg-white overflow-hidden shadow-sm rounded-lg\">
            <div className=\"p-6\">
              <div className=\"flex items-center\">
                <div className=\"flex-shrink-0\">
                  <div className=\"w-8 h-8 bg-red-100 rounded-full flex items-center justify-center\">
                    <span className=\"text-red-600 text-lg\">📉</span>
                  </div>
                </div>
                <div className=\"ml-4 w-0 flex-1\">
                  <dl>
                    <dt className=\"text-sm font-medium text-gray-500 truncate\">Total Liabilities</dt>
                    <dd className=\"text-lg font-semibold text-red-600\">
                      {formatCurrency(accountSummary.totalLiabilities || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className=\"bg-white overflow-hidden shadow-sm rounded-lg\">
            <div className=\"p-6\">
              <div className=\"flex items-center\">
                <div className=\"flex-shrink-0\">
                  <div className={`w-8 h-8 ${(accountSummary.netWorth || 0) >= 0 ? 'bg-purple-100' : 'bg-orange-100'} rounded-full flex items-center justify-center`}>
                    <span className={`${(accountSummary.netWorth || 0) >= 0 ? 'text-purple-600' : 'text-orange-600'} text-lg`}>
                      {(accountSummary.netWorth || 0) >= 0 ? '💰' : '⚠️'}
                    </span>
                  </div>
                </div>
                <div className=\"ml-4 w-0 flex-1\">
                  <dl>
                    <dt className=\"text-sm font-medium text-gray-500 truncate\">Net Worth</dt>
                    <dd className={`text-lg font-semibold ${(accountSummary.netWorth || 0) >= 0 ? 'text-purple-600' : 'text-orange-600'}`}>
                      {formatCurrency(accountSummary.netWorth || 0)}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className=\"bg-white shadow-sm rounded-lg\">
          <div className=\"px-6 py-4 border-b border-gray-200\">
            <h3 className=\"text-lg font-medium text-gray-900\">Your Accounts</h3>
          </div>

          {isLoading ? (
            <div className=\"flex items-center justify-center py-12\">
              <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600\"></div>
              <span className=\"ml-2 text-gray-600\">Loading accounts...</span>
            </div>
          ) : accounts.length === 0 ? (
            <div className=\"text-center py-12\">
              <div className=\"text-gray-400 text-6xl mb-4\">🏦</div>
              <h3 className=\"text-lg font-medium text-gray-900 mb-2\">No accounts found</h3>
              <p className=\"text-gray-600 mb-6\">
                Add your first account to start tracking your finances.
              </p>
              <button
                onClick={() => {
                  setEditingAccount(null);
                  setShowAccountForm(true);
                }}
                className=\"bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg\"
              >
                Add Your First Account
              </button>
            </div>
          ) : (
            <div className=\"overflow-hidden\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6\">
                {accounts.map((account) => (
                  <div key={account.id} className=\"border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow\">
                    <div className=\"flex items-center justify-between mb-4\">
                      <div className=\"flex items-center\">
                        <span className=\"text-2xl mr-3\">{getAccountTypeIcon(account.type)}</span>
                        <div>
                          <h4 className=\"text-lg font-medium text-gray-900\">{account.name}</h4>
                          <p className=\"text-sm text-gray-500 capitalize\">{account.type}</p>
                        </div>
                      </div>
                      
                      <div className=\"flex space-x-1\">
                        <button
                          onClick={() => handleEditAccount(account)}
                          className=\"text-blue-600 hover:text-blue-800 text-sm font-medium p-1\"
                          title=\"Edit account\"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => {
                            setAccountToDelete(account);
                            setShowDeleteDialog(true);
                          }}
                          className=\"text-red-600 hover:text-red-800 text-sm font-medium p-1\"
                          title=\"Delete account\"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    <div className=\"space-y-3\">
                      {/* Balance */}
                      <div className=\"flex justify-between items-center\">
                        <span className=\"text-sm text-gray-500\">Balance:</span>
                        <span className={`text-lg font-semibold ${getAccountTypeClass(account.type, account.balance)}`}>
                          {formatCurrency(account.balance)}
                        </span>
                      </div>

                      {/* Institution */}
                      <div className=\"flex justify-between items-center\">
                        <span className=\"text-sm text-gray-500\">Institution:</span>
                        <span className=\"text-sm text-gray-900\">{account.institution_name}</span>
                      </div>

                      {/* Account Number (masked) */}
                      {account.account_number && (
                        <div className=\"flex justify-between items-center\">
                          <span className=\"text-sm text-gray-500\">Account:</span>
                          <span className=\"text-sm text-gray-900 font-mono\">
                            ****{account.account_number.slice(-4)}
                          </span>
                        </div>
                      )}

                      {/* Recent Activity */}
                      <div className=\"flex justify-between items-center\">
                        <span className=\"text-sm text-gray-500\">Recent Activity:</span>
                        <span className=\"text-sm text-gray-900\">
                          {account.recent_transactions_count || 0} this month
                        </span>
                      </div>

                      {/* Last Transaction */}
                      <div className=\"flex justify-between items-center\">
                        <span className=\"text-sm text-gray-500\">Last Transaction:</span>
                        <span className=\"text-sm text-gray-900\">
                          {formatDate(account.last_transaction_date)}
                        </span>
                      </div>

                      {/* Last Sync */}
                      <div className=\"flex justify-between items-center\">
                        <span className=\"text-sm text-gray-500\">Last Sync:</span>
                        <span className=\"text-sm text-gray-900\">
                          {formatDate(account.last_sync)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className=\"mt-4 pt-4 border-t border-gray-200\">
                      <div className=\"flex space-x-2\">
                        <button
                          onClick={() => {/* TODO: Navigate to transactions for this account */}}
                          className=\"flex-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-3 rounded\"
                        >
                          View Transactions
                        </button>
                        <button
                          onClick={() => {/* TODO: Sync account */}}
                          className=\"flex-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium py-2 px-3 rounded\"
                        >
                          Sync Account
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Account Form Modal */}
        {showAccountForm && (
          <AccountForm
            account={editingAccount}
            onClose={() => {
              setShowAccountForm(false);
              setEditingAccount(null);
            }}
            onSuccess={() => {
              setShowAccountForm(false);
              setEditingAccount(null);
              fetchAccounts();
            }}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && accountToDelete && (
          <div className=\"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50\">
            <div className=\"relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white\">
              <div className=\"mt-3 text-center\">
                <div className=\"mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100\">
                  <span className=\"text-red-600 text-xl\">⚠️</span>
                </div>
                <h3 className=\"text-lg font-medium text-gray-900 mt-4\">Delete Account</h3>
                <div className=\"mt-2 px-7 py-3\">
                  <p className=\"text-sm text-gray-500 mb-4\">
                    Are you sure you want to delete \"{accountToDelete.name}\"?
                  </p>
                  
                  {accountToDelete.recent_transactions_count > 0 && (
                    <div className=\"bg-yellow-50 border border-yellow-200 rounded p-3 mb-4\">
                      <p className=\"text-xs text-yellow-700 mb-2\">
                        This account has {accountToDelete.recent_transactions_count} transactions.
                      </p>
                      <label className=\"flex items-center text-sm\">
                        <input
                          type=\"checkbox\"
                          checked={deleteForce}
                          onChange={(e) => setDeleteForce(e.target.checked)}
                          className=\"mr-2\"
                        />
                        <span className=\"text-yellow-800\">Delete transactions too (force delete)</span>
                      </label>
                    </div>
                  )}
                  
                  <p className=\"text-xs text-gray-400\">
                    This action cannot be undone.
                  </p>
                </div>
                <div className=\"items-center px-4 py-3 flex justify-center space-x-4\">
                  <button
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setAccountToDelete(null);
                      setDeleteForce(false);
                    }}
                    className=\"px-4 py-2 bg-gray-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-300\"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className=\"px-4 py-2 bg-red-500 text-white text-base font-medium rounded-md shadow-sm hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300\"
                  >
                    {deleteForce ? 'Force Delete' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountManagement;
