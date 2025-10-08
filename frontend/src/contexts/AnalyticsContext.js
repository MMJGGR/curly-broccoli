import React, { createContext, useContext, useMemo } from 'react';
import predictiveAnalytics from '../services/predictiveAnalytics';

const AnalyticsContext = createContext(null);

export const AnalyticsProvider = ({ children }) => {
  // Thin wrapper over service to keep a consistent app-level seam
  const api = useMemo(() => ({
    getDashboardInsights: () => predictiveAnalytics.getDashboardInsights(),
    analyzeGoalTrajectory: (goalId) => predictiveAnalytics.analyzeGoalTrajectory(goalId),
    runMonteCarloSimulation: (goalId) => predictiveAnalytics.runMonteCarloSimulation(goalId),
    getGoalProjections: (goalId, params) => predictiveAnalytics.getGoalProjections(goalId, params),
    updateGoalProgress: (goalId, success) => predictiveAnalytics.updateGoalProgress(goalId, success),
    clearCache: () => predictiveAnalytics.clearCache(),
    formatCurrency: (value) => predictiveAnalytics.formatCurrency(value),
    formatPercentage: (value) => predictiveAnalytics.formatPercentage(value),
    getRiskLevelColor: (p) => predictiveAnalytics.getRiskLevelColor(p)
  }), []);

  return (
    <AnalyticsContext.Provider value={api}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error('useAnalytics must be used within an AnalyticsProvider');
  return ctx;
};

