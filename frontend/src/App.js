import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Onboarding components
import AuthScreen from './components/AuthScreen';
import PersonalDetailsForm from './components/PersonalDetailsForm';
import RiskQuestionnaire from './components/RiskQuestionnaire';
import OnboardingDataConnection from './components/OnboardingDataConnection';
import OnboardingCashFlowSetup from './components/OnboardingCashFlowSetup';

// Main application layout
import MainAppLayout from './components/MainAppLayout';

// Advisor components (will be nested under a separate layout or route)
import AdvisorLogin from './components/AdvisorLogin';
import AdvisorDashboard from './components/AdvisorDashboard';
import ClientList from './components/ClientList';
import ClientProfile from './components/ClientProfile';

function App() {
  return (
    <div className="bg-white min-h-screen">
      <Routes>
        {/* Initial entry point: Auth Screen */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthScreen />} />

        {/* Onboarding Flow */}
        <Route path="/onboarding/personal-details" element={<PersonalDetailsForm />} />
        <Route path="/onboarding/risk-questionnaire" element={<RiskQuestionnaire />} />
        <Route path="/onboarding/data-connection" element={<OnboardingDataConnection />} />
        <Route path="/onboarding/cash-flow-setup" element={<OnboardingCashFlowSetup />} />

        {/* Main Application - uses MainAppLayout for shared navigation */}
        <Route path="/app/*" element={<MainAppLayout />} />

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