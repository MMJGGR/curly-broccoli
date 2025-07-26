import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';

const Profile = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);
    const navigate = useNavigate();

    const showActionMessage = (actionName) => {
        setMessage('Action: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        setMessage('Logged out successfully');
        setShowMessageBox(true);
        setTimeout(() => navigate('/auth'), 1000);
    };

    const userProfile = {
        personal: {
            name: 'Jamal Mwangi',
            age: 27,
            occupation: 'Software Engineer',
            maritalStatus: 'Single',
        },
        contact: {
            email: 'jamal.mwangi@example.com',
            phone: '+254 7XX XXX XXX',
        },
        settings: {
            notifications: 'On',
            dataPrivacy: 'High',
            linkedAccounts: '2',
        },
        financialMilestones: {
            nextMajor: 'Home Purchase (5 years)',
            yearsToRetirement: '38 years (Age 65)',
            emergencyFundStatus: '75% Complete',
        }
    };

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
