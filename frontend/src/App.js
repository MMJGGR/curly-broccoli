import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Main components
import AuthScreen from './components/AuthScreen';
import RetakeRiskQuestionnaire from './components/RetakeRiskQuestionnaire';

// NEW Onboarding System
import OnboardingWizard from './components/onboarding/OnboardingWizard';
import { OnboardingProvider } from './contexts/OnboardingContext';

// Main application layout
import MainAppLayout from './components/MainAppLayout';
import PrivateRoute from './components/PrivateRoute';

// Advisor components (will be nested under a separate layout or route)
import AdvisorLogin from './components/AdvisorLogin';
import AdvisorDashboard from './components/AdvisorDashboard';
import ClientList from './components/ClientList';
import ClientProfile from './components/ClientProfile';

// Advisor onboarding components
import AdvisorProfessionalDetails from './components/AdvisorProfessionalDetails';
import AdvisorServiceModel from './components/AdvisorServiceModel';
import AdvisorOnboardingComplete from './components/AdvisorOnboardingComplete';

// Initial route component that handles authentication and onboarding checks
const InitialRoute = () => {
  const isLoggedIn = localStorage.getItem('jwt') !== null;
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" replace />;
  }
  
  // User is logged in, let Dashboard handle onboarding status checks
  return <Navigate to="/app/dashboard" replace />;
};

function App() {
  return (
    <div className="bg-white min-h-screen">
      <Routes>
        {/* Initial entry point: Auth Screen or Dashboard if logged in */}
        <Route path="/" element={<InitialRoute />} />
        <Route path="/auth" element={<AuthScreen />} />

        {/* NEW Onboarding Flow - Bulletproof Data Persistence */}
        <Route path="/onboarding" element={
          <PrivateRoute>
            <OnboardingProvider>
              <OnboardingWizard />
            </OnboardingProvider>
          </PrivateRoute>
        } />

        {/* Advisor Onboarding Flow */}
        <Route path="/onboarding/advisor/*" element={
          <Routes>
            <Route path="professional-details" element={<AdvisorProfessionalDetails />} />
            <Route path="service-model" element={<AdvisorServiceModel />} />
            <Route path="complete" element={<AdvisorOnboardingComplete />} />
          </Routes>
        } />

        {/* Retake Risk Assessment - for existing authenticated users */}
        <Route path="/retake-risk-assessment" element={
          <PrivateRoute>
            <RetakeRiskQuestionnaire />
          </PrivateRoute>
        } />

        {/* Main Application - uses MainAppLayout for shared navigation */}
        <Route path="/app/*" element={
          <PrivateRoute>
            <MainAppLayout />
          </PrivateRoute>
        } />

        {/* Advisor Portal */}
        <Route path="/advisor/login" element={<AdvisorLogin />} />
        <Route path="/advisor/dashboard" element={<AdvisorDashboard />} />
        <Route path="/advisor/clients" element={<ClientList />} />
        <Route path="/advisor/client/:id" element={<ClientProfile />} />

        {/* Catch-all for unhandled routes - redirects to auth for now */}
        <Route path="*" element={<Navigate to="/auth" replace />} />
      </Routes>
    </div>
  );
}

export default App;