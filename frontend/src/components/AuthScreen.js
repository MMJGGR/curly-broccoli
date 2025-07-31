import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MessageBox from './MessageBox';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [userType, setUserType] = useState('user'); // 'user' or 'advisor'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const API_BASE = '';
        
        try {
            if (isLogin) {
                // Handle Login
                setMessage('Attempting login...');
                const formData = new FormData();
                formData.append('username', email);
                formData.append('password', password);
                
                const response = await fetch(`${API_BASE}/auth/login`, {
                    method: 'POST',
                    body: formData,
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Login failed:', response.status, errorData);
                    throw new Error(errorData.detail || 'Invalid credentials');
                }
                
                const data = await response.json();
                console.log('Login successful:', data);
                
                // Ensure localStorage is set before navigation
                localStorage.setItem('jwt', data.access_token);
                localStorage.setItem('userType', userType);
                
                setMessage('Login successful!');
                setShowMessageBox(true);
                
                // Navigate immediately after successful login
                console.log('Attempting navigation after login...');
                const storedToken = localStorage.getItem('jwt');
                console.log('Stored token before navigation:', storedToken ? 'EXISTS' : 'MISSING');
                
                if (userType === 'advisor') {
                    console.log('Navigating to advisor dashboard');
                    navigate('/advisor/dashboard', { replace: true });
                } else {
                    console.log('Navigating to user dashboard');
                    navigate('/app/dashboard', { replace: true });
                }
                
            } else {
                // Handle Registration - simplified to just email/password
                if (password !== confirmPassword) {
                    setMessage('Passwords do not match!');
                    setShowMessageBox(true);
                    return;
                }
                
                if (password.length < 8) {
                    setMessage('Password must be at least 8 characters long!');
                    setShowMessageBox(true);
                    return;
                }
                
                setMessage('Creating account...');
                
                const registrationData = {
                    email: email,
                    password: password,
                    user_type: userType,
                    // Minimal required fields - detailed info moved to onboarding
                    first_name: 'New',
                    last_name: 'User',
                    dob: '1990-01-01',
                    nationalId: '12345678',
                    kra_pin: 'A123456789Z',
                    annual_income: 50000,
                    dependents: 0,
                    goals: {
                        targetAmount: 10000,
                        timeHorizon: 12
                    },
                    questionnaire: [1, 2, 3, 4, 5]
                };
                
                const response = await fetch(`${API_BASE}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registrationData),
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Registration failed');
                }
                
                const data = await response.json();
                console.log('Registration successful:', data);
                localStorage.setItem('jwt', data.access_token);
                localStorage.setItem('userType', userType);
                
                setMessage('Account created successfully!');
                setShowMessageBox(true);
                
                // Navigate to onboarding for new users to complete their profile
                console.log('Attempting navigation to onboarding...');
                if (userType === 'advisor') {
                    console.log('Navigating to advisor onboarding');
                    navigate('/onboarding/advisor/professional-details', { replace: true });
                } else {
                    console.log('Navigating to user onboarding');
                    navigate('/onboarding/personal-details', { replace: true });
                }
            }
        } catch (error) {
            console.error('Authentication error:', error);
            setMessage(error.message || 'Authentication failed');
            setShowMessageBox(true);
            // Prevent any navigation on error
            return false;
        }
    };

    return (
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-purple-900 min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-[10px] opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
                    <div className="absolute top-3/4 right-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
                    <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
                </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 md:p-10 max-w-md w-full text-center relative z-10">
                {/* Logo/Icon */}
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-2">
                        {isLogin ? 'Welcome Back' : 'Get Started'}
                    </h1>
                    <p className="text-gray-600">
                        {isLogin ? 'Access your financial dashboard' : 'Join thousands managing their finances smarter'}
                    </p>
                </div>

                {/* User Type Toggle */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-bold mb-3">Account Type</label>
                    <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-1">
                        <button
                            type="button"
                            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                                userType === 'user' 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105' 
                                    : 'text-gray-700 hover:bg-white hover:shadow-sm'
                            }`}
                            onClick={() => setUserType('user')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Individual
                        </button>
                        <button
                            type="button"
                            className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                                userType === 'advisor' 
                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md transform scale-105' 
                                    : 'text-gray-700 hover:bg-white hover:shadow-sm'
                            }`}
                            onClick={() => setUserType('advisor')}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            Advisor
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 mb-6 text-left">
                    <div className="relative">
                        <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            </div>
                            <input
                                type="email"
                                id="email"
                                className="bg-gray-50 border border-gray-200 rounded-xl w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder="your.email@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="relative">
                        <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <input
                                type="password"
                                id="password"
                                className="bg-gray-50 border border-gray-200 rounded-xl w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                placeholder={isLogin ? "Enter your password" : "Minimum 8 characters"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        {isLogin && (
                            <button
                                type="button"
                                className="inline-block align-baseline font-semibold text-sm text-blue-600 hover:text-blue-800 mt-2 transition-colors"
                                onClick={() => showActionMessage('Forgot Password')}
                            >
                                Forgot Password?
                            </button>
                        )}
                    </div>
                    {!isLogin && (
                        <div className="relative">
                            <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-bold mb-2">Confirm Password</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="bg-gray-50 border border-gray-200 rounded-xl w-full py-3 pl-10 pr-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    placeholder="Re-enter your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    )}
                    <button
                        type="submit"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3.5 px-8 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 w-full"
                    >
                        {isLogin ? `Login as ${userType === 'advisor' ? 'Advisor' : 'User'}` : 'Create Account'}
                    </button>
                </form>

                <button
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mt-4"
                    onClick={() => setIsLogin(!isLogin)}
                >
                    {isLogin ? 'New user? Create Account' : 'Already have an account? Login'}
                </button>

                {showMessageBox && <MessageBox message={message} onClose={hideMessageBox} />}
            </div>
        </div>
    );
};

export default AuthScreen;