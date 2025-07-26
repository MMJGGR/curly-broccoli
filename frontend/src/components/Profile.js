import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';

const Profile = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const showActionMessage = (actionName) => {
        setMessage('Action: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const fetchUserProfile = async () => {
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) {
                navigate('/auth');
                return;
            }

            const response = await fetch('/auth/me', {
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
            
            // Transform backend data to frontend format
            const profileData = {
                personal: {
                    name: `${userData.first_name} ${userData.last_name}`,
                    age: calculateAge(userData.dob),
                    occupation: userData.occupation || 'Not specified',
                    maritalStatus: userData.marital_status || 'Not specified',
                },
                contact: {
                    email: userData.email,
                    phone: userData.phone || 'Not provided',
                },
                settings: {
                    notifications: 'On',
                    dataPrivacy: 'High',
                    linkedAccounts: '1',
                },
                financialMilestones: {
                    nextMajor: `Emergency Fund (Target: KES ${userData.goals?.targetAmount || 'Not set'})`,
                    yearsToRetirement: userData.years_to_retirement || 'Not calculated',
                    emergencyFundStatus: userData.emergency_fund_status || 'Not started',
                },
                riskProfile: {
                    score: userData.risk_score || 'Not assessed',
                    level: userData.risk_level || 'Not assessed'
                }
            };
            
            setUserProfile(profileData);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage('Failed to load profile data');
            setShowMessageBox(true);
            
            // Fallback to basic profile
            setUserProfile({
                personal: { name: 'User', age: 'Unknown', occupation: 'Unknown', maritalStatus: 'Unknown' },
                contact: { email: 'Unknown', phone: 'Unknown' },
                settings: { notifications: 'On', dataPrivacy: 'High', linkedAccounts: '1' },
                financialMilestones: { nextMajor: 'Not set', yearsToRetirement: 'Unknown', emergencyFundStatus: 'Unknown' },
                riskProfile: { score: 'Not assessed', level: 'Not assessed' }
            });
        } finally {
            setLoading(false);
        }
    };

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

    useEffect(() => {
        fetchUserProfile();
    }, []);

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
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Name:</strong> {userProfile.personal.name}</p>
                        <p><strong>Age:</strong> {userProfile.personal.age}</p>
                        <p><strong>Occupation:</strong> {userProfile.personal.occupation}</p>
                        <p><strong>Marital Status:</strong> {userProfile.personal.maritalStatus}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4" onClick={() => showActionMessage('Edit Personal Info')}>
                        Edit Personal Info
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Information</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Email:</strong> {userProfile.contact.email}</p>
                        <p><strong>Phone:</strong> {userProfile.contact.phone}</p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4" onClick={() => showActionMessage('Update Contact Info')}>
                        Update Contact Info
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Settings</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Notifications:</strong> {userProfile.settings.notifications} <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage('Toggle Notifications')}>Toggle</button></p>
                        <p><strong>Data Privacy:</strong> {userProfile.settings.dataPrivacy} <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage('Adjust Data Privacy')}>Adjust</button></p>
                        <p><strong>Linked Accounts:</strong> {userProfile.settings.linkedAccounts} <button className="ml-2 text-blue-500 hover:text-blue-700 text-xs" onClick={() => showActionMessage('Manage Linked Accounts')}>Manage</button></p>
                    </div>
                    <div className="flex space-x-2 mt-4">
                        <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md" onClick={() => showActionMessage('Change Password')}>
                            Change Password
                        </button>
                        <button className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-md" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Risk Profile</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Risk Score:</strong> <span className="font-bold text-blue-600">{userProfile.riskProfile.score}</span></p>
                        <p><strong>Risk Level:</strong> <span className="font-bold text-blue-600">{userProfile.riskProfile.level}</span></p>
                    </div>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md mt-4" onClick={() => showActionMessage('Retake Risk Assessment')}>
                        Retake Risk Assessment
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Financial Milestones Summary</h2>
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Next Major Milestone:</strong> <span className="font-bold text-blue-600">{userProfile.financialMilestones.nextMajor}</span></p>
                        <p><strong>Years to Retirement:</strong> <span className="font-bold text-blue-600">{userProfile.financialMilestones.yearsToRetirement}</span></p>
                        <p><strong>Emergency Fund Status:</strong> <span className="font-bold text-green-600">{userProfile.financialMilestones.emergencyFundStatus}</span></p>
                    </div>
                    <button className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md mt-4" onClick={() => showActionMessage('View Full Timeline')}>
                        View Full Timeline
                    </button>
                </div>
            </main>
            {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
        </div>
    );
};

export default Profile;
