// TODO: Implement user login with JWT via /auth/login (FR 1 Authentication, 100% when integrated)
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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

    const handleSubmit = (e) => {
        e.preventDefault();
        // This is a wireframe action. In a real app, you'd send data to backend.
        if (isLogin) {
            console.log('Logging in with:', { email, password });
            setMessage('Attempting login...');
            // Simulate successful login and navigate to personal details form
            setTimeout(() => {
                setMessage('Login successful!');
                setShowMessageBox(true);
                navigate('/onboarding/personal-details');
            }, 1000);
        } else {
            console.log('Registering with:', { email, password });
            setMessage('Attempting registration...');
            // Simulate successful registration and navigate to personal details form
            setTimeout(() => {
                setMessage('Registration successful!');
                setShowMessageBox(true);
                navigate('/onboarding/personal-details');
            }, 1000);
        }
    };

    return (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 md:p-10 max-w-md w-full text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">{isLogin ? 'Login' : 'Register'}</h1>
                <p className="text-gray-600 mb-6">{isLogin ? 'Access your account' : 'Create your new account'}.</p>

                <form onSubmit={handleSubmit} className="space-y-4 mb-6 text-left">
                    <div>
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="your.email@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="shadow appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                            placeholder="********"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
                            onClick={() => showActionMessage('Forgot Password')}
                        >
                            Forgot Password?
                        </button>
                    </div>
                    <button
                        type="submit"
                        className="bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 shadow-lg w-full"
                    >
                        {isLogin ? 'Login' : 'Register'}
                    </button>
                </form>

                <button
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'Need an account? Register' : 'Already have an account? Login'}
                </button>

                {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
            </div>
        </div>
    );
};

export default AuthScreen;