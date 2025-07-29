import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';

const Profile = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [deleteConfirmText, setDeleteConfirmText] = useState('');
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [editingSection, setEditingSection] = useState(null); // 'personal', 'contact', 'financial', 'goals'
    const [editFormData, setEditFormData] = useState({});
    const [expenseCategories, setExpenseCategories] = useState([]);
    const navigate = useNavigate();

    const showActionMessage = (actionName) => {
        setMessage('Action: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const fetchExpenseCategories = useCallback(async () => {
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) return;

            const API_BASE = 'http://localhost:8000';
            const response = await fetch(`${API_BASE}/expense-categories/`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setExpenseCategories(data);
            }
        } catch (error) {
            console.error('Error fetching expense categories:', error);
        }
    }, []);

    const fetchUserProfile = useCallback(async () => {
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) {
                navigate('/auth');
                return;
            }

            // Force use of localhost:8000 for browser-based requests
            const API_BASE = 'http://localhost:8000';
            console.log('API_BASE:', API_BASE);
            console.log('JWT token exists:', !!jwt);
            console.log('Full URL:', `${API_BASE}/auth/me`);
            
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('jwt');
                    navigate('/auth');
                    return;
                }
                throw new Error('Failed to fetch profile');
            }

            const userData = await response.json();
            console.log('Profile API Response:', userData);
            
            // Transform backend data to frontend format
            const profile = userData.profile || userData; // Handle both nested and flat structures
            const profileData = {
                personal: {
                    firstName: profile.first_name || 'Not provided',
                    lastName: profile.last_name || 'Not provided',
                    name: `${profile.first_name || 'Not'} ${profile.last_name || 'provided'}`,
                    age: calculateAge(profile.dob),
                    dateOfBirth: profile.dob || 'Not provided',
                    nationalId: profile.nationalId || 'Not provided',
                    kraPin: profile.kra_pin || 'Not provided',
                    employmentStatus: profile.employment_status || 'Not specified',
                    dependents: profile.dependents !== undefined ? profile.dependents : 'Not specified',
                },
                contact: {
                    email: userData.email,
                    phone: profile.phone || 'Not provided',
                },
                financial: {
                    annualIncome: profile.annual_income ? `KES ${profile.annual_income?.toLocaleString()}` : 'Not provided',
                },
                goals: {
                    type: profile.goals?.type || 'Not set',
                    targetAmount: profile.goals?.targetAmount ? `KES ${profile.goals.targetAmount?.toLocaleString()}` : 'Not set',
                    timeHorizon: profile.goals?.timeHorizon ? `${profile.goals.timeHorizon} years` : 'Not set',
                    description: profile.goals ? `${profile.goals.type || 'Goal'} of KES ${profile.goals.targetAmount?.toLocaleString() || 'amount not set'} over ${profile.goals.timeHorizon || 'timeframe not set'} years` : 'No goals set'
                },
                riskProfile: {
                    score: userData.risk_score || 'Not assessed',
                    level: userData.risk_level || 'Not assessed',
                    questionnaireCompleted: profile.questionnaire && profile.questionnaire.length > 0 ? 'Yes' : 'No'
                },
                settings: {
                    notifications: 'On',
                    dataPrivacy: 'High',
                    linkedAccounts: '1',
                }
            };
            
            setUserProfile(profileData);
            await fetchExpenseCategories();
        } catch (error) {
            console.error('Error fetching profile:', error);
            console.error('Error details:', error.message);
            setMessage(`Failed to load profile data: ${error.message}`);
            setShowMessageBox(true);
            
            // Fallback to basic profile
            setUserProfile({
                personal: { 
                    firstName: 'Unknown', lastName: 'Unknown', name: 'Unknown User', 
                    age: 'Unknown', dateOfBirth: 'Unknown', nationalId: 'Unknown', 
                    kraPin: 'Unknown', employmentStatus: 'Unknown', dependents: 'Unknown' 
                },
                contact: { email: 'Unknown', phone: 'Unknown' },
                financial: { annualIncome: 'Unknown' },
                goals: { type: 'Not set', targetAmount: 'Not set', timeHorizon: 'Not set', description: 'No goals set' },
                riskProfile: { score: 'Not assessed', level: 'Not assessed', questionnaireCompleted: 'No' },
                settings: { notifications: 'On', dataPrivacy: 'High', linkedAccounts: '1' }
            });
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    const calculateAge = (dob) => {
        if (!dob) return 'Unknown';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        setMessage('Logged out successfully');
        setShowMessageBox(true);
        setTimeout(() => navigate('/auth'), 1000);
    };

    const handleDeleteAccount = async () => {
        if (deletePassword.trim() === '' || deleteConfirmText !== 'DELETE MY ACCOUNT') {
            setMessage('Please enter your password and type "DELETE MY ACCOUNT" to confirm');
            setShowMessageBox(true);
            return;
        }

        setDeleteLoading(true);
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) {
                navigate('/auth');
                return;
            }

            const API_BASE = 'http://localhost:8000';
            
            // Verify password before deletion
            const loginResponse = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: `username=${encodeURIComponent(userProfile.contact.email)}&password=${encodeURIComponent(deletePassword)}`
            });

            if (!loginResponse.ok) {
                setMessage('Incorrect password. Account deletion cancelled.');
                setShowMessageBox(true);
                setDeleteLoading(false);
                return;
            }

            // Delete the account
            const deleteResponse = await fetch(`${API_BASE}/auth/delete-account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password: deletePassword })
            });

            if (!deleteResponse.ok) {
                throw new Error('Failed to delete account');
            }

            // Clear local storage and redirect
            localStorage.removeItem('jwt');
            setMessage('Account deleted successfully. Sorry to see you go!');
            setShowMessageBox(true);
            setTimeout(() => navigate('/auth'), 2000);

        } catch (error) {
            console.error('Error deleting account:', error);
            setMessage('Failed to delete account. Please try again or contact support.');
            setShowMessageBox(true);
        } finally {
            setDeleteLoading(false);
        }
    };

    const openDeleteModal = () => {
        setShowDeleteModal(true);
        setDeletePassword('');
        setDeleteConfirmText('');
    };

    const closeDeleteModal = () => {
        setShowDeleteModal(false);
        setDeletePassword('');
        setDeleteConfirmText('');
    };

    const startEditing = (section) => {
        setEditingSection(section);
        // Pre-populate form with current data
        if (section === 'personal') {
            setEditFormData({
                firstName: userProfile.personal.firstName,
                lastName: userProfile.personal.lastName,
                dateOfBirth: userProfile.personal.dateOfBirth,
                nationalId: userProfile.personal.nationalId,
                kraPin: userProfile.personal.kraPin,
                phone: userProfile.contact.phone,
                employmentStatus: userProfile.personal.employmentStatus,
                dependents: userProfile.personal.dependents,
            });
        } else if (section === 'financial') {
            setEditFormData({
                annualIncome: parseFloat(userProfile.financial.annualIncome.replace(/[^\d]/g, '')) || 0,
                expenseCategories: expenseCategories.map(cat => ({
                    id: cat.id,
                    name: cat.name,
                    amount: cat.budgeted_amount
                }))
            });
        } else if (section === 'goals') {
            setEditFormData({
                goalType: userProfile.goals.type,
                targetAmount: parseFloat(userProfile.goals.targetAmount.replace(/[^\d]/g, '')) || 0,
                timeHorizon: parseInt(userProfile.goals.timeHorizon) || 1,
            });
        }
    };

    const cancelEditing = () => {
        setEditingSection(null);
        setEditFormData({});
    };

    const saveChanges = async () => {
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) {
                navigate('/auth');
                return;
            }

            const API_BASE = 'http://localhost:8000';
            let updatePayload = {};

            if (editingSection === 'personal') {
                updatePayload = {
                    first_name: editFormData.firstName,
                    last_name: editFormData.lastName,
                    date_of_birth: editFormData.dateOfBirth,
                    nationalId: editFormData.nationalId,
                    kra_pin: editFormData.kraPin,
                    phone: editFormData.phone,
                    employment_status: editFormData.employmentStatus,
                    dependents: parseInt(editFormData.dependents),
                };
                console.log('Personal info update payload:', updatePayload);
            } else if (editingSection === 'financial') {
                // Update annual income via profile API
                const profileUpdatePayload = {
                    annual_income: parseFloat(editFormData.annualIncome),
                };
                
                // Update profile first
                const profileResponse = await fetch(`${API_BASE}/auth/profile`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${jwt}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(profileUpdatePayload)
                });

                if (!profileResponse.ok) {
                    throw new Error('Failed to update profile');
                }
                
                // Update expense categories
                for (const category of editFormData.expenseCategories || []) {
                    if (category.id) {
                        // Update existing category
                        await fetch(`${API_BASE}/expense-categories/${category.id}`, {
                            method: 'PUT',
                            headers: {
                                'Authorization': `Bearer ${jwt}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: category.name,
                                budgeted_amount: category.amount
                            })
                        });
                    } else if (category.name && category.amount > 0) {
                        // Create new category
                        await fetch(`${API_BASE}/expense-categories/`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${jwt}`,
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                name: category.name,
                                budgeted_amount: category.amount
                            })
                        });
                    }
                }
                
                // Refresh data and exit early since we handled the API calls above
                await fetchUserProfile();
                await fetchExpenseCategories();
                setEditingSection(null);
                setEditFormData({});
                setMessage('Financial information updated successfully!');
                setShowMessageBox(true);
                return;
            } else if (editingSection === 'goals') {
                updatePayload = {
                    goals: {
                        type: editFormData.goalType,
                        targetAmount: parseFloat(editFormData.targetAmount),
                        timeHorizon: parseInt(editFormData.timeHorizon),
                    }
                };
            }

            const response = await fetch(`${API_BASE}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${jwt}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatePayload)
            });

            if (!response.ok) {
                throw new Error('Failed to update profile');
            }

            // Refresh profile data
            await fetchUserProfile();
            setEditingSection(null);
            setEditFormData({});
            setMessage('Profile updated successfully!');
            setShowMessageBox(true);

        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage(`Failed to update profile: ${error.message}`);
            setShowMessageBox(true);
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    if (loading) {
        return (
            <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
                <div className="text-lg text-gray-600">Loading your profile...</div>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center">
                <div className="text-lg text-red-600">Failed to load profile</div>
                <button 
                    className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
                    onClick={fetchUserProfile}
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col">
            <main className="flex-grow container mx-auto p-6 md:p-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Information</h2>
                    {editingSection === 'personal' ? (
                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.firstName || ''}
                                        onChange={(e) => setEditFormData({...editFormData, firstName: e.target.value})}
                                        className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                    <input
                                        type="text"
                                        value={editFormData.lastName || ''}
                                        onChange={(e) => setEditFormData({...editFormData, lastName: e.target.value})}
                                        className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        value={editFormData.dateOfBirth || ''}
                                        onChange={(e) => setEditFormData({...editFormData, dateOfBirth: e.target.value})}
                                        className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={editFormData.phone || ''}
                                        onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                                        className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                                    <input
                                        type="text"
                                        value={editFormData.nationalId || ''}
                                        onChange={(e) => setEditFormData({...editFormData, nationalId: e.target.value})}
                                        className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">KRA PIN</label>
                                    <input
                                        type="text"
                                        value={editFormData.kraPin || ''}
                                        onChange={(e) => setEditFormData({...editFormData, kraPin: e.target.value})}
                                        className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Employment Status</label>
                                    <select
                                        value={editFormData.employmentStatus || ''}
                                        onChange={(e) => setEditFormData({...editFormData, employmentStatus: e.target.value})}
                                        className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option>Employed</option>
                                        <option>Self-employed</option>
                                        <option>Unemployed</option>
                                        <option>Student</option>
                                        <option>Retired</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Dependents</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editFormData.dependents || ''}
                                        onChange={(e) => setEditFormData({...editFormData, dependents: e.target.value})}
                                        className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={saveChanges}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                                <div>
                                    <p><strong>First Name:</strong> {userProfile.personal.firstName}</p>
                                    <p><strong>Last Name:</strong> {userProfile.personal.lastName}</p>
                                    <p><strong>Age:</strong> {userProfile.personal.age}</p>
                                    <p><strong>Date of Birth:</strong> {userProfile.personal.dateOfBirth}</p>
                                    <p><strong>Phone:</strong> {userProfile.contact.phone}</p>
                                </div>
                                <div>
                                    <p><strong>National ID:</strong> {userProfile.personal.nationalId}</p>
                                    <p><strong>KRA PIN:</strong> {userProfile.personal.kraPin}</p>
                                    <p><strong>Employment Status:</strong> {userProfile.personal.employmentStatus}</p>
                                    <p><strong>Dependents:</strong> {userProfile.personal.dependents}</p>
                                </div>
                            </div>
                            <button
                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4"
                                onClick={() => startEditing('personal')}
                            >
                                Edit Personal Info
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                    <div className="text-gray-700">
                        <p><strong>Email:</strong> {userProfile.contact.email}</p>
                        <p><strong>Phone:</strong> {userProfile.contact.phone}</p>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Information</h2>
                    {editingSection === 'financial' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Annual Income (KES)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editFormData.annualIncome || ''}
                                    onChange={(e) => setEditFormData({...editFormData, annualIncome: e.target.value})}
                                    className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter annual income"
                                />
                                <p className="text-sm text-gray-600 mt-1">Enter your total yearly income. If you know your monthly income, multiply by 12.</p>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-3">Monthly Expense Categories</label>
                                <div className="space-y-3">
                                    {(editFormData.expenseCategories || []).map((category, index) => (
                                        <div key={category.id || index} className="flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={category.name}
                                                onChange={(e) => {
                                                    const newCategories = [...(editFormData.expenseCategories || [])];
                                                    newCategories[index].name = e.target.value;
                                                    setEditFormData({...editFormData, expenseCategories: newCategories});
                                                }}
                                                className="border-gray-300 rounded-lg p-2 flex-1 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Category name"
                                            />
                                            <input
                                                type="number"
                                                min="0"
                                                value={category.amount || ''}
                                                onChange={(e) => {
                                                    const newCategories = [...(editFormData.expenseCategories || [])];
                                                    newCategories[index].amount = parseFloat(e.target.value) || 0;
                                                    setEditFormData({...editFormData, expenseCategories: newCategories});
                                                }}
                                                className="border-gray-300 rounded-lg p-2 w-32 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Amount"
                                            />
                                            <span className="text-sm text-gray-500">KES</span>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newCategories = [...(editFormData.expenseCategories || [])];
                                        newCategories.push({ name: '', amount: 0 });
                                        setEditFormData({...editFormData, expenseCategories: newCategories});
                                    }}
                                    className="mt-2 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                                >
                                    + Add Category
                                </button>
                            </div>
                            
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={saveChanges}
                                    className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-gray-700 space-y-3">
                                <p><strong>Annual Income:</strong> {userProfile.financial.annualIncome}</p>
                                
                                <div>
                                    <p className="font-semibold mb-2">Monthly Expenses:</p>
                                    {expenseCategories.length > 0 ? (
                                        <div className="space-y-1 ml-4">
                                            {expenseCategories.map(category => (
                                                <div key={category.id} className="flex justify-between">
                                                    <span>{category.name}:</span>
                                                    <span>KES {category.budgeted_amount?.toLocaleString()}</span>
                                                </div>
                                            ))}
                                            <div className="border-t pt-1 font-semibold flex justify-between">
                                                <span>Total Monthly:</span>
                                                <span>KES {expenseCategories.reduce((sum, cat) => sum + (cat.budgeted_amount || 0), 0).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-500 ml-4">No expense categories set</span>
                                    )}
                                </div>
                            </div>
                            <button
                                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4"
                                onClick={() => startEditing('financial')}
                            >
                                Update Financial Info
                            </button>
                        </div>
                    )}
                </div>


                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Goals</h2>
                    {editingSection === 'goals' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Goal Type</label>
                                <select
                                    value={editFormData.goalType || ''}
                                    onChange={(e) => setEditFormData({...editFormData, goalType: e.target.value})}
                                    className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option>Wealth</option>
                                    <option>Education</option>
                                    <option>Retirement</option>
                                    <option>Emergency Fund</option>
                                    <option>Investment</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount (KES)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={editFormData.targetAmount || ''}
                                    onChange={(e) => setEditFormData({...editFormData, targetAmount: e.target.value})}
                                    className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter target amount"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Time Horizon (years)</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={editFormData.timeHorizon || ''}
                                    onChange={(e) => setEditFormData({...editFormData, timeHorizon: e.target.value})}
                                    className="border-gray-300 rounded-lg p-2 w-full focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Enter time horizon in years"
                                />
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={saveChanges}
                                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    onClick={cancelEditing}
                                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="space-y-2 text-gray-700">
                                <p><strong>Goal Type:</strong> <span className="font-bold text-green-600">{userProfile.goals.type}</span></p>
                                <p><strong>Target Amount:</strong> <span className="font-bold text-green-600">{userProfile.goals.targetAmount}</span></p>
                                <p><strong>Time Horizon:</strong> <span className="font-bold text-green-600">{userProfile.goals.timeHorizon}</span></p>
                                <p><strong>Goal Summary:</strong> {userProfile.goals.description}</p>
                            </div>
                            <button
                                className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-md mt-4"
                                onClick={() => startEditing('goals')}
                            >
                                Update Financial Goals
                            </button>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk Profile</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Risk Score:</strong> <span className="font-bold text-blue-600">{userProfile.riskProfile.score}</span></p>
                        <p><strong>Risk Level:</strong> <span className="font-bold text-blue-600">{userProfile.riskProfile.level}</span></p>
                        <p><strong>Questionnaire Completed:</strong> <span className="font-bold text-blue-600">{userProfile.riskProfile.questionnaireCompleted}</span></p>
                    </div>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md mt-4" onClick={() => alert('Risk assessment retake functionality coming soon!')}>
                        Retake Risk Assessment
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Notifications:</strong> {userProfile.settings.notifications} <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage('Toggle Notifications')}>Toggle</button></p>
                        <p><strong>Data Privacy:</strong> {userProfile.settings.dataPrivacy} <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage('Adjust Data Privacy')}>Adjust</button></p>
                        <p><strong>Linked Accounts:</strong> {userProfile.settings.linkedAccounts} <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage('Manage Linked Accounts')}>Manage</button></p>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md" onClick={() => showActionMessage('Change Password')}>
                            Change Password
                        </button>
                        <button className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md" onClick={handleLogout}>
                            Logout
                        </button>
                        <button className="bg-red-700 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors duration-200 shadow-md border-2 border-red-500" onClick={openDeleteModal}>
                            Delete Account
                        </button>
                    </div>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
            
            {/* Delete Account Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                        <div className="text-center mb-6">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Account</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                This action cannot be undone. This will permanently delete your account and all associated data.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="deletePassword" className="block text-sm font-medium text-gray-700 mb-1">
                                    Enter your password to confirm
                                </label>
                                <input
                                    type="password"
                                    id="deletePassword"
                                    value={deletePassword}
                                    onChange={(e) => setDeletePassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                                    placeholder="Your password"
                                />
                            </div>

                            <div>
                                <label htmlFor="deleteConfirm" className="block text-sm font-medium text-gray-700 mb-1">
                                    Type "DELETE MY ACCOUNT" to confirm
                                </label>
                                <input
                                    type="text"
                                    id="deleteConfirm"
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-red-500 focus:border-red-500"
                                    placeholder="DELETE MY ACCOUNT"
                                />
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                onClick={closeDeleteModal}
                                disabled={deleteLoading}
                                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteLoading || deletePassword.trim() === '' || deleteConfirmText !== 'DELETE MY ACCOUNT'}
                                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Account'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
