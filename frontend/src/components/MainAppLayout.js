// TODO: Persist layout prefs from backend (Epic 6 Story 3, ~80% integration)
import React from 'react';
import { Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import BottomNavBar from './BottomNavBar';

// Main application components
import Dashboard from './Dashboard';
import AccountsTransactions from './AccountsTransactions';
import BalanceSheet from './BalanceSheet';
import GoalsOverview from './GoalsOverview';
import FIRECalculator from './FIRECalculator';
import MonteCarloSimulation from './MonteCarloSimulation';
import DebtRepaymentPlanner from './DebtRepaymentPlanner';
import AdviceModuleDetail from './AdviceModuleDetail';
import LifetimeJourneyTimeline from './LifetimeJourneyTimeline';
import Profile from './Profile';

const MainAppLayout = () => {
  const navigate = useNavigate();

  const handleTabClick = (sectionId) => {
    // Navigate to the corresponding route within the /app/ path
    navigate(`/app/${sectionId}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cashflows" element={<AccountsTransactions />} />
          <Route path="balance-sheet" element={<BalanceSheet />} />
          <Route path="goals" element={<GoalsOverview />} />
          <Route path="fire-calculator" element={<FIRECalculator />} />
          <Route path="monte-carlo" element={<MonteCarloSimulation />} />
          <Route path="debt-planner" element={<DebtRepaymentPlanner />} />
          <Route path="advice" element={<AdviceModuleDetail />} />
          <Route path="timeline" element={<LifetimeJourneyTimeline />} />
          <Route path="profile" element={<Profile />} />
          {/* Add more routes for other main app sections here */}
        </Routes>
        <Outlet /> {/* This is where nested routes will render */}
      </main>
      <BottomNavBar onTabClick={handleTabClick} />
    </div>
  );
};

export default MainAppLayout;
