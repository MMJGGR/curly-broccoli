/**
 * Goal Analytics Dashboard Component
 * Advanced predictive analytics dashboard for financial goal tracking
 */

import React, { useState, useMemo, useCallback } from 'react';
import predictiveAnalytics from '../../services/predictiveAnalytics';
import ProbabilityGauge from './ProbabilityGauge';
import ConfidenceIntervalChart from './ConfidenceIntervalChart';
import ProjectionChart from './ProjectionChart';
import RecommendationPanel from './RecommendationPanel';
import ScenarioAnalysis from './ScenarioAnalysis';

const GoalAnalyticsDashboard = ({ 
  goalId, 
  goalData, 
  onProgressUpdate, 
  className = '' 
}) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [simulationData, setSimulationData] = useState(null);
  const [projections, setProjections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedScenario, setSelectedScenario] = useState('realistic');
  const [refreshing, setRefreshing] = useState(false);

  const loadAnalyticsData = useCallback(async () => {
    if (!goalId) return;

    setLoading(true);
    setError(null);

    try {
      // Load all analytics data in parallel
      const [trajectoryData, simulationResults, projectionData] = await Promise.allSettled([
        predictiveAnalytics.analyzeGoalTrajectory(goalId),
        predictiveAnalytics.runMonteCarloSimulation(goalId),
        predictiveAnalytics.getGoalProjections(goalId, { 
          scenario: selectedScenario,
          yearsAhead: 10 
        })
      ]);

      // Handle trajectory analysis
      if (trajectoryData.status === 'fulfilled') {
        setAnalyticsData(trajectoryData.value);
      } else {
        console.warn('Trajectory analysis failed:', trajectoryData.reason);
      }

      // Handle simulation results
      if (simulationResults.status === 'fulfilled') {
        setSimulationData(simulationResults.value);
      } else {
        console.warn('Monte Carlo simulation failed:', simulationResults.reason);
      }

      // Handle projections
      if (projectionData.status === 'fulfilled') {
        setProjections(projectionData.value);
      } else {
        console.warn('Projections failed:', projectionData.reason);
      }

    } catch (err) {
      console.error('Error loading analytics data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [goalId, selectedScenario]);

  const refreshAnalytics = async () => {
    setRefreshing(true);
    try {
      // Update goal progress first
      await predictiveAnalytics.updateGoalProgress(goalId, true);
      
      // Clear cache and reload
      predictiveAnalytics.clearCache();
      await loadAnalyticsData();
      
      if (onProgressUpdate) {
        onProgressUpdate();
      }
    } catch (err) {
      console.error('Error refreshing analytics:', err);
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate key metrics
  const keyMetrics = useMemo(() => {
    if (!analyticsData && !simulationData) return null;

    const currentProgress = analyticsData?.current_progress || {};
    const simulation = simulationData || {};

    return {
      successProbability: simulation.success_probability || 0,
      currentAmount: currentProgress.actual_amount || 0,
      targetAmount: currentProgress.target_amount || 0,
      progressPercentage: currentProgress.progress_percentage || 0,
      projectedFinalValue: simulation.projected_values?.expected_final_amount || 0,
      shortfallRisk: simulation.projected_values?.shortfall_risk || 0,
      upsidetPotential: simulation.projected_values?.upside_potential || 0
    };
  }, [analyticsData, simulationData]);

  const formatCurrency = (amount) => {
    return predictiveAnalytics.formatCurrency(amount);
  };

  if (loading && !analyticsData) {
    return (
      <div className={`analytics-dashboard loading ${className}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading predictive analytics...</p>
        </div>
      </div>
    );
  }

  if (error && !analyticsData) {
    return (
      <div className={`analytics-dashboard error ${className}`}>
        <div className="error-message">
          <h3>Analytics Unavailable</h3>
          <p>{error}</p>
          <button 
            onClick={loadAnalyticsData}
            className="retry-button"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <h2>Predictive Goal Analysis</h2>
          <p>{goalData?.name || 'Goal Analysis'}</p>
        </div>
        <div className="header-actions">
          <button
            onClick={refreshAnalytics}
            disabled={refreshing}
            className="refresh-button"
          >
            {refreshing ? 'Updating...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Key Metrics Overview */}
      {keyMetrics && (
        <div className="metrics-overview">
          <div className="metric-card success-probability">
            <div className="metric-header">
              <h4>Success Probability</h4>
              <span className="metric-info">?</span>
            </div>
            <ProbabilityGauge 
              probability={keyMetrics.successProbability}
              size="large"
            />
          </div>

          <div className="metric-card progress">
            <div className="metric-header">
              <h4>Current Progress</h4>
            </div>
            <div className="progress-details">
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${Math.min(keyMetrics.progressPercentage, 100)}%` }}
                />
              </div>
              <div className="progress-text">
                <span className="current">{formatCurrency(keyMetrics.currentAmount)}</span>
                <span className="target">of {formatCurrency(keyMetrics.targetAmount)}</span>
              </div>
              <div className="progress-percentage">
                {keyMetrics.progressPercentage.toFixed(1)}% Complete
              </div>
            </div>
          </div>

          <div className="metric-card projection">
            <div className="metric-header">
              <h4>Projected Outcome</h4>
            </div>
            <div className="projection-details">
              <div className="projected-amount">
                {formatCurrency(keyMetrics.projectedFinalValue)}
              </div>
              {keyMetrics.shortfallRisk > 0 ? (
                <div className="shortfall-risk">
                  <span className="risk-label">Potential Shortfall:</span>
                  <span className="risk-amount">{formatCurrency(keyMetrics.shortfallRisk)}</span>
                </div>
              ) : (
                <div className="upside-potential">
                  <span className="upside-label">Potential Upside:</span>
                  <span className="upside-amount">{formatCurrency(keyMetrics.upsidetPotential)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Analytics Content */}
      <div className="analytics-content">
        {/* Left Column - Charts */}
        <div className="charts-section">
          {/* Confidence Intervals */}
          {simulationData?.confidence_intervals && (
            <div className="chart-container">
              <h3>Probability Distribution</h3>
              <ConfidenceIntervalChart 
                intervals={simulationData.confidence_intervals}
                targetAmount={keyMetrics?.targetAmount}
                currentAmount={keyMetrics?.currentAmount}
              />
            </div>
          )}

          {/* Projections over Time */}
          {projections && (
            <div className="chart-container">
              <div className="chart-header">
                <h3>Growth Projections</h3>
                <select 
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="scenario-selector"
                >
                  <option value="pessimistic">Pessimistic Scenario</option>
                  <option value="realistic">Realistic Scenario</option>
                  <option value="optimistic">Optimistic Scenario</option>
                </select>
              </div>
              <ProjectionChart 
                projections={projections.projections}
                targetAmount={keyMetrics?.targetAmount}
                scenario={selectedScenario}
              />
            </div>
          )}

          {/* Scenario Analysis */}
          {simulationData?.scenario_analysis && (
            <div className="chart-container">
              <h3>Scenario Analysis</h3>
              <ScenarioAnalysis 
                scenarios={simulationData.scenario_analysis}
                baseSuccessProbability={keyMetrics?.successProbability}
              />
            </div>
          )}
        </div>

        {/* Right Column - Recommendations */}
        <div className="recommendations-section">
          <RecommendationPanel 
            recommendations={simulationData?.recommendations || []}
            analyticsRecommendations={analyticsData?.recommendations || []}
            actionItems={analyticsData?.action_items || []}
            nextReviewDate={analyticsData?.next_review_date}
            onActionComplete={() => refreshAnalytics()}
          />

          {/* Risk Metrics */}
          {simulationData?.risk_metrics && (
            <div className="risk-metrics-panel">
              <h3>Risk Assessment</h3>
              <div className="risk-metrics">
                <div className="risk-metric">
                  <label>Value at Risk (5th percentile):</label>
                  <span>{formatCurrency(simulationData.risk_metrics.value_at_risk_5)}</span>
                </div>
                <div className="risk-metric">
                  <label>Shortfall Probability:</label>
                  <span>{(simulationData.risk_metrics.shortfall_probability * 100).toFixed(1)}%</span>
                </div>
                {simulationData.risk_metrics.average_shortfall > 0 && (
                  <div className="risk-metric">
                    <label>Average Shortfall:</label>
                    <span>{formatCurrency(simulationData.risk_metrics.average_shortfall)}</span>
                  </div>
                )}
                <div className="risk-metric">
                  <label>Volatility (Std. Dev.):</label>
                  <span>{formatCurrency(simulationData.projected_values?.standard_deviation || 0)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contribution Analysis */}
          {analyticsData?.contribution_analysis && (
            <div className="contribution-panel">
              <h3>Contribution Analysis</h3>
              <div className="contribution-metrics">
                <div className="contribution-metric">
                  <label>Average Monthly:</label>
                  <span>{formatCurrency(analyticsData.contribution_analysis.average_monthly_contribution)}</span>
                </div>
                <div className="contribution-metric">
                  <label>Consistency Score:</label>
                  <span>{(analyticsData.contribution_analysis.contribution_consistency * 100).toFixed(0)}%</span>
                </div>
                <div className="contribution-metric">
                  <label>Trend:</label>
                  <span className={`trend ${analyticsData.contribution_analysis.trend}`}>
                    {analyticsData.contribution_analysis.trend.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .analytics-dashboard {
          background: #ffffff;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          margin: 16px 0;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
        }

        .header-content h2 {
          margin: 0 0 4px 0;
          color: #1f2937;
          font-size: 24px;
          font-weight: 600;
        }

        .header-content p {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .refresh-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .refresh-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .refresh-button:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .metrics-overview {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 20px;
          margin-bottom: 32px;
        }

        .metric-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
        }

        .metric-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .metric-header h4 {
          margin: 0;
          color: #1f2937;
          font-size: 16px;
          font-weight: 500;
        }

        .metric-info {
          background: #e5e7eb;
          color: #6b7280;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          cursor: help;
        }

        .progress-bar {
          background: #e5e7eb;
          height: 8px;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-fill {
          background: linear-gradient(90deg, #3b82f6, #10b981);
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }

        .progress-text {
          display: flex;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .progress-text .current {
          color: #1f2937;
          font-weight: 600;
        }

        .progress-text .target {
          color: #6b7280;
          font-size: 14px;
        }

        .progress-percentage {
          color: #3b82f6;
          font-weight: 500;
          font-size: 14px;
        }

        .projected-amount {
          color: #1f2937;
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .shortfall-risk, .upside-potential {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .risk-label, .upside-label {
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
        }

        .risk-amount {
          color: #ef4444;
          font-weight: 500;
        }

        .upside-amount {
          color: #10b981;
          font-weight: 500;
        }

        .analytics-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }

        .chart-container {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .chart-container h3 {
          margin: 0 0 16px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 500;
        }

        .chart-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .scenario-selector {
          background: white;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 14px;
        }

        .risk-metrics-panel, .contribution-panel {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 24px;
        }

        .risk-metrics-panel h3, .contribution-panel h3 {
          margin: 0 0 16px 0;
          color: #1f2937;
          font-size: 18px;
          font-weight: 500;
        }

        .risk-metrics, .contribution-metrics {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .risk-metric, .contribution-metric {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .risk-metric:last-child, .contribution-metric:last-child {
          border-bottom: none;
        }

        .risk-metric label, .contribution-metric label {
          color: #6b7280;
          font-size: 14px;
        }

        .risk-metric span, .contribution-metric span {
          color: #1f2937;
          font-weight: 500;
        }

        .trend.increasing {
          color: #10b981;
        }

        .trend.decreasing {
          color: #ef4444;
        }

        .trend.stable {
          color: #6b7280;
        }

        .loading-spinner {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-message {
          text-align: center;
          padding: 60px;
        }

        .error-message h3 {
          color: #ef4444;
          margin-bottom: 8px;
        }

        .error-message p {
          color: #6b7280;
          margin-bottom: 16px;
        }

        .retry-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .analytics-content {
            grid-template-columns: 1fr;
            gap: 20px;
          }

          .metrics-overview {
            grid-template-columns: 1fr;
            gap: 16px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
            gap: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default GoalAnalyticsDashboard;