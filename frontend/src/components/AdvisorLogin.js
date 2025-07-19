import React, { useState } from 'react';
import MessageBox from './MessageBox';

const AdvisorLogin = ({ onNextScreen }) => {
    const [message, setMessage] = useState('');
    const [showMessageBox, setShowMessageBox] = useState(false);

    const showActionMessage = (actionName) => {
        setMessage('Action: ' + actionName + ' (This is a wireframe action)');
        setShowMessageBox(true);
    };

    const hideMessageBox = () => {
        setShowMessageBox(false);
        setMessage('');
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Advisor Login</h1>
                <p className="text-gray-600 mb-6">Access your client management portal.</p>

                <div className="space-y-4 mb-6 text-left">
                    <div>
                        <label htmlFor="advisorEmail" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input type="email" id="advisorEmail" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="your.email@example.com" />
                    </div>
                    <div>
                        <label htmlFor="advisorPassword" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input type="password" id="advisorPassword" className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500" placeholder="********" />
                        <a href="#" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800" onClick={() => showActionMessage('Forgot Password')}>
                            Forgot Password?
                        </a>
                    </div>
                </div>

                <button className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full" onClick={() => onNextScreen('AdvisorDashboard')}>
                    Login
                </button>

                {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
            </div>
        </div>
    );
};

export default AdvisorLogin;
