// TODO: Use src/api.js listAccounts() and listTransactions() to fetch data (Epic 3 Stories 2 & 7, ~70% of account register after integration)
import React, { useEffect, useState } from 'react';
import MessageBox from './MessageBox';
import { listAccounts, listTransactions, createAccount, updateAccount, deleteAccount } from '../api';

const AccountsTransactions = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [showAddAccountForm, setShowAddAccountForm] = useState(false);
    const [editingAccount, setEditingAccount] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

    // Expose setShowAddAccountForm to window for Cypress testing
    useEffect(() => {
        if (window.Cypress) {
            window.setShowAddAccountForm = setShowAddAccountForm;
        }
    }, [setShowAddAccountForm]);

    // State for new account form inputs
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountBalance, setNewAccountBalance] = useState('');
    const [newAccountType, setNewAccountType] = useState('');
    const [newInstitutionName, setNewInstitutionName] = useState('');

    const showActionMessage = (actionName) => {
        setMessage('Action: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const fetchAccounts = async () => {
        try {
            const accts = await listAccounts(localStorage.getItem('jwt')); // Pass token
            if (Array.isArray(accts)) setAccounts(accts);
        } catch (err) {
            console.error('Error fetching accounts:', err);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const accts = await listAccounts(localStorage.getItem('jwt')); // Pass token
                if (Array.isArray(accts)) setAccounts(accts);
                const txs = await listTransactions(localStorage.getItem('jwt')); // Pass token
                if (Array.isArray(txs)) setTransactions(txs);
            } catch (err) {
                console.error(err);
            }
        };
        loadData();
    }, []);

    const handleAddAccountSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted'); // Debug log
        
        const token = localStorage.getItem('jwt');
        if (!token) {
            console.log('No token found'); // Debug log
            setMessage('Authentication token not found. Please log in again.');
            setShowMessageBox(true);
            return;
        }

        try {
            const accountData = {
                name: newAccountName,
                balance: parseFloat(newAccountBalance),
                type: newAccountType,
                institution_name: newInstitutionName,
            };
            
            console.log('Submitting account data:', accountData); // Debug log
            
            if (editingAccount) {
                console.log('Updating account:', editingAccount.id); // Debug log
                await updateAccount(token, editingAccount.id, accountData);
                setEditingAccount(null);
            } else {
                console.log('Creating new account'); // Debug log
                const result = await createAccount(token, accountData);
                console.log('Account created:', result); // Debug log
            }
            
            console.log('Refreshing accounts list'); // Debug log
            await fetchAccounts();
            
            console.log('Closing modal and clearing form'); // Debug log
            setShowAddAccountForm(false);
            setEditingAccount(null);
            
            // Clear form fields
            setNewAccountName('');
            setNewAccountBalance('');
            setNewAccountType('');
            setNewInstitutionName('');
            
            setMessage('Account saved successfully!');
            setShowMessageBox(true);
        } catch (error) {
            console.error('Error saving account:', error);
            setMessage('Error saving account: ' + (error.message || 'Unknown error'));
            setShowMessageBox(true);
        }
    };

    const handleEditAccount = (account) => {
        setEditingAccount(account);
        setNewAccountName(account.name);
        setNewAccountBalance(account.balance.toString());
        setNewAccountType(account.type);
        setNewInstitutionName(account.institution_name);
        setShowAddAccountForm(true);
    };

    const handleDeleteAccount = async (accountId) => {
        const token = localStorage.getItem('jwt');
        if (!token) {
            setMessage('Authentication token not found. Please log in again.');
            setShowMessageBox(true);
            return;
        }

        try {
            await deleteAccount(token, accountId);
            fetchAccounts();
            setShowDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting account:', error);
            setMessage('Error deleting account: ' + (error.message || 'Unknown error'));
            setShowMessageBox(true);
        }
    };

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Accounts & Transactions</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Summary</h2>
                    <div className="overflow-x-auto mb-6">
                        <table className="min-w-full bg-white rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left">Account Name</th>
                                    <th className="py-3 px-6 text-left">Balance</th>
                                    <th className="py-3 px-6 text-left">Type</th>
                                    <th className="py-3 px-6 text-left">Institution</th>
                                    <th className="py-3 px-6 text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm font-light">
                                {accounts.map((acct, idx) => (
                                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left">{acct.name}</td>
                                        <td className="py-3 px-6 text-left">${acct.balance}</td>
                                        <td className="py-3 px-6 text-left">{acct.type}</td>
                                        <td className="py-3 px-6 text-left">{acct.institution_name}</td>
                                        <td className="py-3 px-6 text-center">
                                            <button 
                                                data-testid="edit-account-button"
                                                className="text-blue-500 hover:text-blue-700 mr-2"
                                                onClick={() => handleEditAccount(acct)}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                data-testid="delete-account-button"
                                                className="text-red-500 hover:text-red-700"
                                                onClick={() => setShowDeleteConfirm(acct.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <button data-testid="add-account-button" className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md" onClick={() => setShowAddAccountForm(!showAddAccountForm)}>
                        Add New Account
                    </button>
                    {/* Temporary visual indicator for showAddAccountForm state */}
                    <div data-testid="show-form-state">showAddAccountForm: {showAddAccountForm ? 'true' : 'false'}</div>

                    {showAddAccountForm && (
                        <div data-testid="account-form-modal" className="mt-4 p-4 border rounded-lg bg-gray-50">
                            <h3 className="text-lg font-semibold mb-2">{editingAccount ? 'Edit Account' : 'Add New Account'}</h3>
                            <form onSubmit={handleAddAccountSubmit}>
                                <input data-testid="account-name-input" type="text" placeholder="Account Name" className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 mb-2 w-full" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} />
                                <input data-testid="account-balance-input" type="number" placeholder="Balance" className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 mb-2 w-full" value={newAccountBalance} onChange={(e) => setNewAccountBalance(e.target.value)} />
                                <select data-testid="account-type-select" className="shadow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 mb-2 w-full" value={newAccountType} onChange={(e) => setNewAccountType(e.target.value)}>
                                    <option value="">Select Type</option>
                                    <option value="Checking">Checking</option>
                                    <option value="Savings">Savings</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="Investment">Investment</option>
                                </select>
                                <input data-testid="institution-name-input" type="text" placeholder="Institution Name" className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 mb-2 w-full" value={newInstitutionName} onChange={(e) => setNewInstitutionName(e.target.value)} />
                                <button 
                                    data-testid={editingAccount ? "submit-edit-account" : "submit-add-account"} 
                                    type="submit" 
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
                                >
                                    {editingAccount ? 'Update Account' : 'Add Account'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Delete Confirmation Dialog */}
                    {showDeleteConfirm && (
                        <div data-testid="confirmation-dialog" className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-6 rounded-lg shadow-lg">
                                <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
                                <p className="mb-4">Are you sure you want to delete this account?</p>
                                <div className="flex justify-end space-x-2">
                                    <button 
                                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                                        onClick={() => setShowDeleteConfirm(null)}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        data-testid="confirm-delete-button"
                                        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() => handleDeleteAccount(showDeleteConfirm)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction History</h2>
                    <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                        <input type="date" className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" />
                        <input type="text" placeholder="Search transactions..." className="shadow appearance-none border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 flex-grow" />
                        <select className="shadow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500">
                            <option>All Categories</option>
                            <option>Income</option>
                            <option>Expenses</option>
                        </select>
                        <select className="shadow border rounded-lg py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500">
                            <option>All Accounts</option>
                            {accounts.map((acct, idx) => (
                                <option key={idx}>{acct.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white rounded-lg">
                            <thead>
                                <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal">
                                    <th className="py-3 px-6 text-left rounded-tl-lg">Date</th>
                                    <th className="py-3 px-6 text-left">Description</th>
                                    <th className="py-3 px-6 text-left">Amount</th>
                                    <th className="py-3 px-6 text-left">Category</th>
                                    <th className="py-3 px-6 text-left rounded-tr-lg">Account</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-700 text-sm font-light">
                                {transactions.map((tx, index) => (
                                    <tr key={index} className="border-b border-gray-200 hover:bg-gray-50">
                                        <td className="py-3 px-6 text-left whitespace-nowrap">{tx.date}</td>
                                        <td className="py-3 px-6 text-left">{tx.description}</td>
                                        <td className={`py-3 px-6 text-left ${tx.amount.startsWith('-') ? 'text-red-600' : 'text-green-600'}`}>{tx.amount}</td>
                                        <td className="py-3 px-6 text-left">{tx.category}</td>
                                        <td className="py-3 px-6 text-left">
                                            {tx.account}
                                            <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage(`Edit transaction: ${tx.description}`)}>
                                                <svg className="w-4 h-4 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-4 text-center text-gray-600">
                        <p>Uncategorized Transactions: <span className="font-bold text-red-500">3</span> (Click 'Edit' to categorize)</p>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default AccountsTransactions;