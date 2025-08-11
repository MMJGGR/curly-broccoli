import React, { useState } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';

const TransactionImport = ({ onClose, onSuccess }) => {
  const {
    accounts,
    importTransactionsCSV,
    isLoading
  } = useTransactions();

  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [importResults, setImportResults] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (file) => {
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setError(null);
    } else {
      setError('Please select a valid CSV file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setError(null);
      const results = await importTransactionsCSV(selectedFile, selectedAccountId || null);
      setImportResults(results);
      
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 3000); // Auto-close after 3 seconds
      }
    } catch (error) {
      setError(error.response?.data?.detail || error.message || 'Import failed');
    }
  };

  const csvFormatExample = `Date,Description,Amount,Category,Merchant
2024-01-15,"Grocery Shopping",-5000,"Groceries","Carrefour"
2024-01-16,"Salary Deposit",150000,"Income","Employer"
2024-01-17,"Uber Ride",-800,"Transport","Uber"`;

  return (
    <div className=\"fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50\">
      <div className=\"relative top-8 mx-auto p-0 border w-full max-w-2xl shadow-lg rounded-lg bg-white my-8\">
        {/* Header */}
        <div className=\"flex items-center justify-between p-6 border-b border-gray-200\">
          <h3 className=\"text-lg font-medium text-gray-900\">Import Transactions from CSV</h3>
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

        <div className=\"p-6\">
          {!importResults ? (
            <div className=\"space-y-6\">
              {/* Instructions */}
              <div className=\"bg-blue-50 border border-blue-200 rounded-lg p-4\">
                <div className=\"flex\">
                  <div className=\"flex-shrink-0\">
                    <span className=\"text-blue-400 text-xl\">💡</span>
                  </div>
                  <div className=\"ml-3\">
                    <h3 className=\"text-sm font-medium text-blue-800\">CSV Import Instructions</h3>
                    <div className=\"mt-2 text-sm text-blue-700\">
                      <ul className=\"list-disc list-inside space-y-1\">
                        <li>Your CSV file should include columns: Date, Description, Amount, Category</li>
                        <li>Dates should be in YYYY-MM-DD format (e.g., 2024-01-15)</li>
                        <li>Amounts should be positive for income, negative for expenses</li>
                        <li>Optional columns: Merchant, Reference ID, Notes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Selection */}
              <div>
                <label htmlFor=\"account\" className=\"block text-sm font-medium text-gray-700 mb-2\">
                  Account (Optional)
                </label>
                <select
                  id=\"account\"
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className=\"w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500\"
                >
                  <option value=\"\">Auto-detect or create accounts</option>
                  {accounts.map(account => (
                    <option key={account.id} value={account.id}>
                      {account.name} - {account.type}
                    </option>
                  ))}
                </select>
                <p className=\"mt-1 text-sm text-gray-500\">
                  If no account is selected, transactions will be assigned based on CSV data
                </p>
              </div>

              {/* File Upload Area */}
              <div>
                <label className=\"block text-sm font-medium text-gray-700 mb-2\">
                  CSV File
                </label>
                <div
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg ${
                    dragActive
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className=\"space-y-1 text-center\">
                    <svg
                      className=\"mx-auto h-12 w-12 text-gray-400\"
                      stroke=\"currentColor\"
                      fill=\"none\"
                      viewBox=\"0 0 48 48\"
                    >
                      <path
                        d=\"M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02\"
                        strokeWidth={2}
                        strokeLinecap=\"round\"
                        strokeLinejoin=\"round\"
                      />
                    </svg>
                    <div className=\"flex text-sm text-gray-600\">
                      <label
                        htmlFor=\"file-upload\"
                        className=\"relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500\"
                      >
                        <span>Upload a file</span>
                        <input
                          id=\"file-upload\"
                          name=\"file-upload\"
                          type=\"file\"
                          accept=\".csv\"
                          className=\"sr-only\"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileSelect(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <p className=\"pl-1\">or drag and drop</p>
                    </div>
                    <p className=\"text-xs text-gray-500\">CSV files only</p>
                  </div>
                </div>

                {selectedFile && (
                  <div className=\"mt-3 flex items-center justify-between bg-gray-50 p-3 rounded-lg\">
                    <div className=\"flex items-center\">
                      <span className=\"text-green-500 mr-2\">📄</span>
                      <div>
                        <p className=\"text-sm font-medium text-gray-900\">{selectedFile.name}</p>
                        <p className=\"text-xs text-gray-500\">
                          {Math.round(selectedFile.size / 1024)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className=\"text-gray-400 hover:text-gray-600\"
                    >
                      <span className=\"sr-only\">Remove</span>
                      <svg className=\"h-5 w-5\" fill=\"currentColor\" viewBox=\"0 0 20 20\">
                        <path
                          fillRule=\"evenodd\"
                          d=\"M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z\"
                          clipRule=\"evenodd\"
                        />
                      </svg>
                    </button>
                  </div>
                )}
              </div>

              {/* CSV Format Example */}
              <details className=\"border border-gray-200 rounded-lg\">
                <summary className=\"cursor-pointer p-4 text-sm font-medium text-gray-700 hover:bg-gray-50\">
                  📋 View CSV format example
                </summary>
                <div className=\"p-4 border-t border-gray-200 bg-gray-50\">
                  <pre className=\"text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap\">
                    {csvFormatExample}
                  </pre>
                </div>
              </details>

              {/* Error Display */}
              {error && (
                <div className=\"bg-red-50 border border-red-200 rounded-lg p-4\">
                  <div className=\"flex\">
                    <div className=\"flex-shrink-0\">
                      <span className=\"text-red-400 text-xl\">❌</span>
                    </div>
                    <div className=\"ml-3\">
                      <h3 className=\"text-sm font-medium text-red-800\">Import Error</h3>
                      <div className=\"mt-2 text-sm text-red-700\">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className=\"flex justify-end space-x-3 pt-6 border-t border-gray-200\">
                <button
                  type=\"button\"
                  onClick={onClose}
                  className=\"px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500\"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={!selectedFile || isLoading}
                  className={`px-4 py-2 border border-transparent rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    !selectedFile || isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isLoading ? (
                    <span className=\"flex items-center\">
                      <svg className=\"animate-spin -ml-1 mr-2 h-4 w-4 text-white\" fill=\"none\" viewBox=\"0 0 24 24\">
                        <circle className=\"opacity-25\" cx=\"12\" cy=\"12\" r=\"10\" stroke=\"currentColor\" strokeWidth=\"4\"></circle>
                        <path className=\"opacity-75\" fill=\"currentColor\" d=\"M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z\"></path>
                      </svg>
                      Importing...
                    </span>
                  ) : (
                    'Import Transactions'
                  )}
                </button>
              </div>
            </div>
          ) : (
            /* Import Results */
            <div className=\"space-y-6\">
              <div className=\"text-center\">
                <div className=\"text-green-500 text-6xl mb-4\">✅</div>
                <h3 className=\"text-lg font-medium text-gray-900 mb-2\">Import Completed!</h3>
                <p className=\"text-gray-600\">
                  Your transactions have been successfully imported.
                </p>
              </div>

              <div className=\"bg-green-50 border border-green-200 rounded-lg p-6\">
                <h4 className=\"font-medium text-green-900 mb-4\">Import Summary</h4>
                <div className=\"grid grid-cols-2 gap-4\">
                  <div>
                    <div className=\"text-2xl font-bold text-green-600\">{importResults.imported_count}</div>
                    <div className=\"text-sm text-green-700\">Transactions Imported</div>
                  </div>
                  <div>
                    <div className=\"text-2xl font-bold text-yellow-600\">{importResults.skipped_count}</div>
                    <div className=\"text-sm text-yellow-700\">Duplicates Skipped</div>
                  </div>
                </div>
                
                {importResults.batch_id && (
                  <div className=\"mt-4 text-xs text-green-600\">
                    Batch ID: {importResults.batch_id}
                  </div>
                )}
              </div>

              {importResults.errors && importResults.errors.length > 0 && (
                <div className=\"bg-yellow-50 border border-yellow-200 rounded-lg p-4\">
                  <h4 className=\"font-medium text-yellow-900 mb-2\">Import Warnings</h4>
                  <div className=\"text-sm text-yellow-700\">
                    <p className=\"mb-2\">Some rows had issues:</p>
                    <ul className=\"list-disc list-inside space-y-1\">
                      {importResults.errors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className=\"flex justify-center pt-6 border-t border-gray-200\">
                <button
                  onClick={onClose}
                  className=\"px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500\"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionImport;