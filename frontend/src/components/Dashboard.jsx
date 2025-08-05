import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProfileComplete, setIsProfileComplete] = useState(false);
  const navigate = useNavigate();

  const checkUserProfile = useCallback(async () => {
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        navigate('/auth');
        return;
      }

      const API_BASE = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
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
        if (response.status === 404) {
          // Profile not found - new user who hasn't completed onboarding yet
          // This is expected, show the incomplete profile UI
          setUser({ email: localStorage.getItem('userEmail') || 'user' });
          setIsProfileComplete(false);
          setLoading(false);
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const userData = await response.json();
      setUser(userData);
      
      // Check if profile is complete (not using default values)
      const profile = userData.profile || {};
      
      // A profile is incomplete if it has ANY default values
      const hasDefaultFirstName = profile.first_name === 'New';
      const hasDefaultLastName = profile.last_name === 'User';
      const hasDefaultDob = profile.dob === '1990-01-01';
      const hasDefaultNationalId = profile.nationalId === '12345678';
      
      // Also check if essential fields are missing
      const hasRequiredFields = profile.first_name && profile.last_name && profile.dob;
      
      const isProfileIncomplete = hasDefaultFirstName || hasDefaultLastName || hasDefaultDob || hasDefaultNationalId || !hasRequiredFields;
      const isComplete = !isProfileIncomplete;
      
      console.log('Profile completion check:', {
        profile,
        hasDefaultFirstName,
        hasDefaultLastName,
        hasDefaultDob,
        hasDefaultNationalId,
        hasRequiredFields,
        isComplete
      });
      
      setIsProfileComplete(isComplete);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    checkUserProfile();
  }, [checkUserProfile]);

  // Listen for onboarding completion to refresh profile
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'onboardingCompleted') {
        console.log('Onboarding completed, refreshing profile...');
        checkUserProfile();
        localStorage.removeItem('onboardingCompleted'); // Clean up
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus in case user completed onboarding in same tab
    const handleFocus = () => {
      if (localStorage.getItem('onboardingCompleted')) {
        console.log('Onboarding completed (same tab), refreshing profile...');
        checkUserProfile();
        localStorage.removeItem('onboardingCompleted');
      }
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkUserProfile]);

  const handleCompleteProfile = () => {
    const userType = localStorage.getItem('userType') || user?.role;
    
    if (userType === 'advisor') {
      navigate('/onboarding/advisor/professional-details');
    } else {
      navigate('/onboarding');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('userType');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isProfileComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-100 to-transparent rounded-full opacity-30 transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-100 to-transparent rounded-full opacity-30 transform -translate-x-32 translate-y-32"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Welcome{user?.email ? `, ${user.email.split('@')[0]}` : ''}!
                </h1>
                <p className="text-gray-600">Your financial journey starts here</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Logout
            </button>
          </div>

          {/* Welcome Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 text-center relative overflow-hidden">
            {/* Card background decoration */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100 to-transparent rounded-full opacity-50 transform translate-x-16 -translate-y-16"></div>
            
            <div className="mb-6 relative z-10">
              <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg animate-pulse">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-3">
                Account Created Successfully!
              </h2>
              <p className="text-gray-600 text-lg">Let's personalize your financial journey with a quick setup.</p>
            </div>

            {/* Progress Bar */}
            <div className="mb-8 relative z-10">
              <div className="flex justify-between text-sm font-medium text-gray-600 mb-3">
                <span>Profile Setup Progress</span>
                <span className="text-blue-600 font-bold">0% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out" style={{width: '0%'}}></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Complete your profile to unlock all features</p>
            </div>

            <button
              onClick={handleCompleteProfile}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-10 rounded-xl font-bold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 relative z-10"
            >
              <span className="flex items-center gap-2">
                Complete Your Profile
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </button>
          </div>

          {/* Setup Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="group bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
                <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Personal Details</h3>
              <p className="text-sm text-gray-600">Name, age, KRA pin, and basic info</p>
              <div className="mt-4 text-xs text-blue-600 font-medium">Step 1 of 5</div>
            </div>

            <div className="group bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200 hover:border-purple-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-purple-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-purple-200 group-hover:to-purple-300 transition-all duration-300">
                <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Risk Assessment</h3>
              <p className="text-sm text-gray-600">Understand your investment style</p>
              <div className="mt-4 text-xs text-purple-600 font-medium">Step 2 of 5</div>
            </div>

            <div className="group bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200 hover:border-green-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-r from-green-100 to-green-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-green-200 group-hover:to-green-300 transition-all duration-300">
                <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Data Connection</h3>
              <p className="text-sm text-gray-600">Connect your financial accounts</p>
              <div className="mt-4 text-xs text-green-600 font-medium">Step 3 of 5</div>
            </div>

            <div className="group bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200 hover:border-orange-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-r from-orange-100 to-orange-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-orange-200 group-hover:to-orange-300 transition-all duration-300">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Income & Expenses</h3>
              <p className="text-sm text-gray-600">Set up your cash flow tracking</p>
              <div className="mt-4 text-xs text-orange-600 font-medium">Step 4 of 5</div>
            </div>

            <div className="group bg-white/60 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-gray-200 hover:border-indigo-300 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1">
              <div className="w-14 h-14 bg-gradient-to-r from-indigo-100 to-indigo-200 rounded-xl flex items-center justify-center mb-4 group-hover:from-indigo-200 group-hover:to-indigo-300 transition-all duration-300">
                <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-gray-800 mb-2">Complete Profile</h3>
              <p className="text-sm text-gray-600">Finalize and activate account</p>
              <div className="mt-4 text-xs text-indigo-600 font-medium">Step 5 of 5</div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-blue-100 to-transparent rounded-full opacity-30 transform -translate-x-20 translate-y-20"></div>
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-6 text-center">
                What you'll unlock after setup:
              </h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Personalized Dashboard</h4>
                  <p className="text-sm text-gray-600">Real-time insights into your finances with smart analytics</p>
                </div>
              
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Smart Recommendations</h4>
                  <p className="text-sm text-gray-600">AI-powered financial advice tailored to your goals</p>
                </div>
                
                <div className="text-center group">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:-translate-y-1">
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">Goal Tracking</h4>
                  <p className="text-sm text-gray-600">Monitor progress toward your financial targets</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full dashboard for completed profiles
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, {user?.profile?.first_name || 'User'}!
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-semibold mb-4">Your Financial Dashboard</h2>
          <p className="text-gray-600">Complete dashboard with all your financial metrics will appear here.</p>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800">✅ Profile Complete - All features unlocked!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
