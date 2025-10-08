/**
 * Timeline Main App Layout - Replaces MainAppLayout with Timeline-first design
 * Integrates Timeline context and routes to Timeline-first components
 */
import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Timeline Context
import { TimelineProvider } from '../contexts/TimelineContext';
import { AnalyticsProvider } from '../contexts/AnalyticsContext';

// Timeline-first components
import TimelineDashboard from './timeline/TimelineDashboard';
import ContextualTimelineDashboard from './timeline/ContextualTimelineDashboard';

// Budget components
import BudgetCashflows from './budget/BudgetCashflows';

// Tools components
import ToolsDashboard from './tools/ToolsDashboard';
import PlanDashboard from './plan/PlanDashboard';
import CashFlowDashboard from './cashflow/CashFlowDashboard';

// Balance Sheet components (Assets and Liabilities) - CFA-compliant structure
import BalanceSheetDashboard from './balance-sheet/BalanceSheetDashboard';
import { AssetDashboard } from './assets';

// Income Statement components (Income and Expenses) - Separate from Balance Sheet
import { IncomeDashboard } from './income';
import { ExpenseDashboard } from './expenses';

// Legacy components (for fallback/migration)  
import ProfileDynamic from './ProfileDynamic';
import BottomNavBar from './BottomNavBar';
import { Button } from './ui/button';

// Config
// import { API_BASE_URL } from '../config'; // Disabled - not needed for simplified flow

// Utility functions - Disabled to prevent redirect loops
// const isOnboardingComplete = async () => {
//   const token = localStorage.getItem('jwt');
//   if (!token) return false;
//
//   try {
//     const url = `${API_BASE_URL}/api/v1/onboarding/status`;
//     console.log('🔧 TimelineMainAppLayout fetching from:', url);
//     const response = await fetch(url, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'Content-Type': 'application/json'
//       }
//     });
//
//     if (!response.ok) {
//       throw new Error('Failed to check onboarding status');
//     }
//
//     const data = await response.json();
//     return data.is_complete === true;
//   } catch (error) {
//     console.error('Error checking onboarding status:', error);
//     return false;
//   }
// };

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
      case 'plan':
        navigate('plan');
        break;
      case 'balance-sheet':
        navigate('balance-sheet');
        break;
      case 'cash-flow':
        navigate('cash-flow');
        break;
      case 'timeline':
        navigate('timeline-legacy');
        break;
      default:
        break;
    }
  };

  // Check onboarding status on mount
  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        // Trust that if user reached this component, onboarding is complete
        // The routing logic should handle onboarding redirects at App.js level
        console.log('🔧 TimelineMainAppLayout: Assuming onboarding complete (user reached dashboard)');
        setOnboardingComplete(true);
        setIsLoading(false);
        return;
        
        // Disabled automatic API check that was causing redirect loops
        // const complete = await isOnboardingComplete();
        // setOnboardingComplete(complete);
      } catch (error) {
        console.error('Onboarding check failed:', error);
        setOnboardingComplete(true); // Default to complete to avoid loops
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
        <AnalyticsProvider>
        <div className="timeline-app min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {/* Scrollable content area with bottom padding for fixed nav */}
          <div className="flex flex-col" style={{ minHeight: '100vh' }}>
            {/* Top Header with Profile access (keeps five-tab bottom nav) */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur border-b border-gray-200">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-end">
                <Button variant="outline" size="sm" onClick={() => navigate('profile')} aria-label="Open profile">
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A7 7 0 0112 15a7 7 0 016.879 2.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    Profile
                  </span>
                </Button>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto pb-20" style={{ height: 'calc(100vh - 7rem)' }}>
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
                <Route path="plan" element={<PlanDashboard />} />
                <Route path="cash-flow" element={<CashFlowDashboard />} />
                
                {/* Balance Sheet - Assets and Liabilities (CFA-compliant structure) */}
                <Route path="balance-sheet" element={<BalanceSheetDashboard />} />
                <Route path="assets" element={<AssetDashboard />} />
                
                {/* Income Statement - Revenue and Expenses (separate from Balance Sheet) */}
                <Route path="income" element={<IncomeDashboard />} />
                <Route path="expenses" element={<ExpenseDashboard />} />
                
                {/* Financial Management Tools */}
                <Route path="tools" element={<ToolsDashboard />} />
                
                {/* Legacy routes for fallback (redirect to new dashboard) */}
                <Route path="dashboard-legacy" element={<Navigate to="dashboard" replace />} />
                {/* Legacy profile route removed - use /app/profile */}
                
                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="dashboard" replace />} />
              </Routes>
            </div>

          {/* Bottom Navigation */}
          <BottomNavBar onTabClick={handleTabClick} activeTab={activeTab} />
          </div>
        </div>
        </AnalyticsProvider>
    </TimelineProvider>
  );
};

export default TimelineMainAppLayout;
