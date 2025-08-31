/**
 * Timeline Main App Layout - Replaces MainAppLayout with Timeline-first design
 * Integrates Timeline context and routes to Timeline-first components
 */
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Timeline Context
import { TimelineProvider } from '../contexts/TimelineContext';
import { BudgetProvider } from '../contexts/BudgetContext';
import { TransactionProvider } from '../contexts/TransactionContext';

// Timeline-first components
import TimelineDashboard from './timeline/TimelineDashboard';
import ContextualTimelineDashboard from './timeline/ContextualTimelineDashboard';

// Budget components
import BudgetCashflows from './budget/BudgetCashflows';

// Tools components
import ToolsDashboard from './tools/ToolsDashboard';

// Balance Sheet components (Assets and Liabilities) - CFA-compliant structure
import BalanceSheetDashboard from './balance-sheet/BalanceSheetDashboard';
import { AssetDashboard } from './assets';

// Income Statement components (Income and Expenses) - Separate from Balance Sheet
import { IncomeDashboard } from './income';
import { ExpenseDashboard } from './expenses';

// Legacy components (for fallback/migration)  
import Dashboard from './Dashboard';
import ProfileDynamic from './ProfileDynamic';
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
        navigate('dashboard');
        break;
      case 'profile':
        navigate('profile');
        break;
      case 'budget':
        navigate('budget');
        break;
      case 'balance-sheet':
        navigate('balance-sheet');
        break;
      case 'goals':
        navigate('tools');
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
      <BudgetProvider>
        <TransactionProvider>
        <div className="timeline-app h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <Routes>
            {/* Default redirect */}
            <Route path="/" element={<Navigate to="dashboard" replace />} />
            
            {/* Contextual Timeline Dashboard (New Design) */}
            <Route path="dashboard" element={<ContextualTimelineDashboard />} />
            
            {/* Legacy Timeline Dashboard (Large visualization) */}
            <Route path="timeline-legacy" element={<TimelineDashboard />} />
            
            {/* Dynamic Profile using onboarding data */}
            <Route path="profile" element={<ProfileDynamic />} />
            
            {/* Budget & Cashflows */}
            <Route path="budget" element={<BudgetCashflows />} />
            
            {/* Balance Sheet - Assets and Liabilities (CFA-compliant structure) */}
            <Route path="balance-sheet" element={<BalanceSheetDashboard />} />
            <Route path="assets" element={<AssetDashboard />} />
            
            {/* Income Statement - Revenue and Expenses (separate from Balance Sheet) */}
            <Route path="income" element={<IncomeDashboard />} />
            <Route path="expenses" element={<ExpenseDashboard />} />
            
            {/* Financial Management Tools */}
            <Route path="tools" element={<ToolsDashboard />} />
            
            {/* Legacy routes for fallback */}
            <Route path="dashboard-legacy" element={<Dashboard />} />
            {/* Legacy profile route removed - use /app/profile */}
            
            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Routes>

          {/* Bottom Navigation */}
          <BottomNavBar onTabClick={handleTabClick} activeTab={activeTab} />
        </div>
        </TransactionProvider>
      </BudgetProvider>
    </TimelineProvider>
  );
};

export default TimelineMainAppLayout;