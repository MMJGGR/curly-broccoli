/**
 * Timeline Main App Layout - Replaces MainAppLayout with Timeline-first design
 * Integrates Timeline context and routes to Timeline-first components
 */
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Timeline Context
import { TimelineProvider } from '../contexts/TimelineContext';

// Timeline-first components
import TimelineDashboard from './timeline/TimelineDashboard';
import TimelineProfile from './timeline/TimelineProfile';

// Legacy components (for fallback/migration)  
import Dashboard from './Dashboard';
import Profile from './Profile';
import BottomNavBar from './BottomNavBar';

// Config
import { API_BASE_URL } from '../config';

// Utility functions
const isOnboardingComplete = async () => {
  const token = localStorage.getItem('jwt');
  if (!token) return false;

  try {
    const url = `${API_BASE_URL}/api/v1/onboarding/status`;
    console.log('🔧 TimelineMainAppLayout fetching from:', url);
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to check onboarding status');
    }

    const data = await response.json();
    return data.is_complete === true;
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

const TimelineMainAppLayout = () => {
  const [onboardingComplete, setOnboardingComplete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const navigate = useNavigate();

  // Handle tab navigation
  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
    // Navigate to appropriate route based on tab
    switch (tabId) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'profile':
        navigate('/profile');
        break;
      case 'cashflows':
        // TODO: Add cashflows route
        console.log('Cashflows tab clicked');
        break;
      case 'balance-sheet':
        // TODO: Add balance sheet route  
        console.log('Balance Sheet tab clicked');
        break;
      case 'goals':
        // TODO: Add goals/tools route
        console.log('Goals/Tools tab clicked');
        break;
      default:
        break;
    }
  };

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const complete = await isOnboardingComplete();
        setOnboardingComplete(complete);
      } catch (error) {
        console.error('Onboarding check failed:', error);
        setOnboardingComplete(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkOnboarding();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Timeline...</h2>
          <p className="text-gray-500 mt-2">Preparing your personalized financial journey</p>
        </div>
      </div>
    );
  }

  // Redirect to onboarding if not complete
  if (onboardingComplete === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return (
    <TimelineProvider>
      <div className="timeline-app h-screen bg-gray-50">
        <Routes>
          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          
          {/* Timeline-first Dashboard */}
          <Route path="/dashboard" element={<TimelineDashboard />} />
          
          {/* Timeline-first Profile */}
          <Route path="/profile" element={<TimelineProfile />} />
          
          {/* Legacy routes for fallback */}
          <Route path="/dashboard-legacy" element={<Dashboard />} />
          <Route path="/profile-legacy" element={<Profile />} />
          
          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
        </Routes>

        {/* Bottom Navigation */}
        <BottomNavBar onTabClick={handleTabClick} activeTab={activeTab} />
      </div>
    </TimelineProvider>
  );
};

export default TimelineMainAppLayout;