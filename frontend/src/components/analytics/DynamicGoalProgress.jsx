/**
 * Dynamic Goal Progress Component
 * Replaces static progress displays with real-time analytics-driven progress tracking
 */

import React, { useState, useEffect, useMemo } from 'react';
import predictiveAnalytics from '../../services/predictiveAnalytics';

const DynamicGoalProgress = ({ 
  goalId, 
  goalData, 
  compact = false,
  showAnalytics = true,
  onAnalyticsClick 
}) => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load analytics for this goal
  useEffect(() => {
    if (!goalId) return;
    
    loadGoalAnalytics();
  }, [goalId]);

  const loadGoalAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await predictiveAnalytics.analyzeGoalTrajectory(goalId);
      setAnalytics(analysis);
    } catch (err) {
      console.warn('Goal analytics failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress metrics
  const progressMetrics = useMemo(() => {
    if (!analytics) {
      // Fallback to static data if analytics unavailable
      return {
        currentAmount: parseFloat(goalData?.current || 0),
        targetAmount: parseFloat(goalData?.target || 0),
        progressPercentage: parseFloat(goalData?.progress || 0),
        calculationMethod: 'static',
        successProbability: null,
        isOnTrack: null
      };
    }

    const currentProgress = analytics.current_progress || {};
    return {
      currentAmount: currentProgress.actual_amount || 0,
      targetAmount: currentProgress.target_amount || 0,
      progressPercentage: currentProgress.progress_percentage || 0,
      calculationMethod: currentProgress.calculation_method || 'analytics',
      successProbability: analytics.success_probability,
      isOnTrack: analytics.success_probability >= 0.7,
      projectedFinal: analytics.trajectory_analysis?.simulation_results?.projected_values?.expected_final_amount,
      shortfallRisk: analytics.trajectory_analysis?.simulation_results?.projected_values?.shortfall_risk
    };
  }, [analytics, goalData]);

  const formatCurrency = (amount) => {
    return predictiveAnalytics.formatCurrency(amount);
  };

  const getProgressColor = () => {
    if (progressMetrics.successProbability !== null) {
      return predictiveAnalytics.getRiskLevelColor(progressMetrics.successProbability);
    }
    if (progressMetrics.progressPercentage >= 80) return '#10b981';
    if (progressMetrics.progressPercentage >= 50) return '#3b82f6';
    if (progressMetrics.progressPercentage >= 25) return '#f59e0b';
    return '#ef4444';
  };

  const getStatusIndicator = () => {
    if (loading) return { icon: '⏳', text: 'Analyzing...', color: '#6b7280' };
    if (error) return { icon: '❌', text: 'Analysis Error', color: '#ef4444' };
    
    if (progressMetrics.successProbability !== null) {
      if (progressMetrics.successProbability >= 0.8) {
        return { icon: '🎯', text: 'Excellent Track', color: '#10b981' };
      }
      if (progressMetrics.successProbability >= 0.6) {
        return { icon: '✅', text: 'On Track', color: '#3b82f6' };
      }
      if (progressMetrics.successProbability >= 0.4) {
        return { icon: '⚠️', text: 'Needs Attention', color: '#f59e0b' };
      }
      return { icon: '🚨', text: 'At Risk', color: '#ef4444' };
    }
    
    // Fallback to percentage-based status
    if (progressMetrics.progressPercentage >= 75) {
      return { icon: '🎯', text: 'Great Progress', color: '#10b981' };
    }
    if (progressMetrics.progressPercentage >= 50) {
      return { icon: '📈', text: 'Making Progress', color: '#3b82f6' };
    }
    return { icon: '🚀', text: 'Getting Started', color: '#f59e0b' };
  };

  const status = getStatusIndicator();

  if (compact) {
    return (
      <div className="dynamic-goal-progress-compact flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{status.icon}</span>
          <div>
            <div className="text-sm font-medium text-gray-800">
              {progressMetrics.progressPercentage.toFixed(1)}%
            </div>
            {progressMetrics.calculationMethod === 'analytics' && (
              <div className="text-xs text-gray-500">Real-time</div>
            )}
          </div>
        </div>
        
        {showAnalytics && analytics && onAnalyticsClick && (
          <button
            onClick={() => onAnalyticsClick(goalId)}
            className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            Analytics
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="dynamic-goal-progress bg-white border border-gray-200 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{status.icon}</span>
          <div>
            <h4 className="font-medium text-gray-800">{goalData?.name || 'Goal Progress'}</h4>
            <div className="flex items-center space-x-2 text-xs">
              <span 
                className="font-medium"
                style={{ color: status.color }}
              >
                {status.text}
              </span>
              {progressMetrics.calculationMethod === 'analytics' && (
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded">
                  Live Data
                </span>
              )}
            </div>
          </div>
        </div>
        
        {showAnalytics && analytics && onAnalyticsClick && (
          <button
            onClick={() => onAnalyticsClick(goalId)}
            className="text-sm px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
          >
            View Analytics
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium text-gray-800">
            {progressMetrics.progressPercentage.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(progressMetrics.progressPercentage, 100)}%`,
              backgroundColor: getProgressColor()
            }}
          />
        </div>
      </div>

      {/* Amount Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-gray-500">Current Amount</div>
          <div className="text-lg font-semibold text-gray-800">
            {formatCurrency(progressMetrics.currentAmount)}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Target Amount</div>
          <div className="text-lg font-semibold text-gray-800">
            {formatCurrency(progressMetrics.targetAmount)}
          </div>
        </div>
      </div>

      {/* Analytics-Enhanced Information */}
      {analytics && (
        <div className="border-t border-gray-200 pt-3">
          {/* Success Probability */}
          {progressMetrics.successProbability !== null && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Success Probability</span>
              <span 
                className="text-sm font-semibold"
                style={{ color: getProgressColor() }}
              >
                {predictiveAnalytics.formatPercentage(progressMetrics.successProbability)}
              </span>
            </div>
          )}

          {/* Projected Final Value */}
          {progressMetrics.projectedFinal && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600">Projected Final</span>
              <span className="text-sm font-semibold text-blue-600">
                {formatCurrency(progressMetrics.projectedFinal)}
              </span>
            </div>
          )}

          {/* Risk Assessment */}
          {progressMetrics.shortfallRisk > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <div className="flex items-center">
                <span className="text-yellow-600 mr-2 text-sm">⚠️</span>
                <div>
                  <div className="text-xs font-medium text-yellow-800">
                    Potential Shortfall: {formatCurrency(progressMetrics.shortfallRisk)}
                  </div>
                  <div className="text-xs text-yellow-700 mt-1">
                    Consider increasing contributions or extending timeline
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Recommendation */}
          {analytics.recommendations && analytics.recommendations.length > 0 && (
            <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
              <div className="flex items-start">
                <span className="text-blue-600 mr-2 text-sm">💡</span>
                <div className="text-xs text-blue-800">
                  {analytics.recommendations[0]}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading/Error States */}
      {loading && (
        <div className="text-center py-2">
          <div className="inline-flex items-center text-xs text-gray-500">
            <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-blue-600 mr-2"></div>
            Loading analytics...
          </div>
        </div>
      )}

      {error && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <div className="text-xs text-red-800">
            Analytics temporarily unavailable. Showing last known progress.
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicGoalProgress;