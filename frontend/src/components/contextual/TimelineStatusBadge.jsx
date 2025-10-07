/**
 * Timeline Status Badge Component
 * Compact timeline health indicators that can be embedded throughout the app
 * Provides quick visual feedback on financial timeline health and progress
 */
import React, { useState } from 'react';
import useLifecyclePhase from '../../hooks/useLifecyclePhase';
import { useTimeline } from '../../contexts/TimelineContext';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const TimelineStatusBadge = ({
  size = 'default', // small, default, large
  showPercentage = true,
  showDetails = true,
  position = 'bottom', // bottom, top, left, right (for tooltip)
  className = '',
  onClick = null,
  animated = true
}) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const { currentAge, milestones, alignmentScore, persona, personaTheme } = useTimeline();
  const { incomes = [], expenses = [], selectNetCashFlow } = useUnifiedFinancialContext();
  const actualSurplus = typeof selectNetCashFlow === 'function' ? selectNetCashFlow() : 0;
  const monthlyIncome = Array.isArray(incomes) ? incomes.reduce((s, i) => s + (i.monthly_amount || i.amount || 0), 0) : (incomes?.total_monthly_income || 0);
  const monthlyExpenses = Array.isArray(expenses) ? expenses.reduce((s, e) => s + (e.monthly_equivalent || e.amount || 0), 0) : 0;
  const budgetData = { monthlyIncome, monthlyExpenses, netWorth: 0, dependents: 0, goals: milestones };

  // Mock user profile - in real app this would come from context/props
  const userProfile = {
    age: currentAge || 30,
    income: budgetData?.monthlyIncome || 0,
    expenses: budgetData?.monthlyExpenses || 0,
    netWorth: budgetData?.netWorth || 0,
    dependents: budgetData?.dependents || 0,
    goals: milestones || []
  };

  const { phase, health, loading, getPhaseIcon } = useLifecyclePhase(userProfile);

  // Calculate overall timeline health score
  const calculateTimelineHealth = () => {
    let score = 0;
    const factors = [];

    // Lifecycle phase health (40% weight)
    if (health) {
      score += (health.score * 0.4);
      factors.push({
        name: 'Phase Health',
        score: health.score,
        weight: 40,
        status: health.level
      });
    }

    // Timeline alignment score (35% weight)
    if (alignmentScore) {
      score += (alignmentScore * 0.35);
      factors.push({
        name: 'Goal Alignment',
        score: alignmentScore,
        weight: 35,
        status: alignmentScore >= 80 ? 'excellent' : alignmentScore >= 60 ? 'good' : 'needs_improvement'
      });
    }

    // Budget surplus impact (25% weight)
    if (actualSurplus !== undefined) {
      const surplusScore = actualSurplus > 0 ? 
        Math.min(100, 50 + (actualSurplus / 10000) * 10) : // Positive surplus boosts score
        Math.max(0, 50 + (actualSurplus / 10000) * 20); // Negative surplus reduces score more dramatically
      
      score += (surplusScore * 0.25);
      factors.push({
        name: 'Cash Flow',
        score: surplusScore,
        weight: 25,
        status: actualSurplus > 0 ? 'excellent' : 'needs_improvement'
      });
    }

    return {
      overall_score: Math.round(Math.min(100, score)),
      factors,
      status: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'critical'
    };
  };

  if (loading) {
    return (
      <div className={`timeline-status-badge loading ${className}`}>
        <div className="animate-pulse flex items-center space-x-1">
          <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
          <div className="w-8 h-3 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const timelineHealth = calculateTimelineHealth();
  const sizeClasses = {
    small: 'px-2 py-1 text-xs',
    default: 'px-3 py-1.5 text-sm',
    large: 'px-4 py-2 text-base'
  };

  const iconSizes = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-lg'
  };

  const getHealthColor = (status) => {
    const colors = {
      excellent: '#10b981', // Green
      good: '#3b82f6', // Blue
      fair: '#f59e0b', // Amber
      critical: '#ef4444' // Red
    };
    return colors[status] || colors.fair;
  };

  const getHealthIcon = (status) => {
    const icons = {
      excellent: '🎯',
      good: '📊',
      fair: '⚠️',
      critical: '🚨'
    };
    return icons[status] || icons.fair;
  };

  const getStatusText = (status) => {
    const texts = {
      excellent: 'Excellent',
      good: 'On Track',
      fair: 'Fair',
      critical: 'Needs Attention'
    };
    return texts[status] || texts.fair;
  };

  const handleClick = () => {
    if (onClick) {
      onClick(timelineHealth);
    }
  };

  const tooltipPositionClasses = {
    bottom: 'top-full mt-2',
    top: 'bottom-full mb-2',
    left: 'right-full mr-2 top-1/2 transform -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 transform -translate-y-1/2'
  };

  return (
    <div 
      className={`timeline-status-badge relative ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Main Badge */}
      <div
        className={`
          inline-flex items-center space-x-2 rounded-full border-2 transition-all duration-200
          ${sizeClasses[size]}
          ${onClick ? 'cursor-pointer hover:scale-105' : ''}
          ${animated ? 'transform transition-transform' : ''}
        `}
        style={{
          backgroundColor: `${getHealthColor(timelineHealth.status)}15`,
          borderColor: getHealthColor(timelineHealth.status),
          color: getHealthColor(timelineHealth.status)
        }}
        onClick={handleClick}
      >
        {/* Health Icon */}
        <span className={iconSizes[size]}>
          {getHealthIcon(timelineHealth.status)}
        </span>

        {/* Score/Status */}
        {showPercentage ? (
          <span className="font-bold">
            {timelineHealth.overall_score}%
          </span>
        ) : (
          <span className="font-medium">
            {getStatusText(timelineHealth.status)}
          </span>
        )}

        {/* Phase Integration */}
        {size !== 'small' && (
          <span className={`${iconSizes[size]} opacity-75`}>
            {getPhaseIcon(phase)}
          </span>
        )}
      </div>

      {/* Tooltip */}
      {showTooltip && showDetails && (
        <div 
          className={`
            absolute z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-3
            ${tooltipPositionClasses[position]}
          `}
          style={{
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
          }}
        >
          {/* Tooltip Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getHealthIcon(timelineHealth.status)}</span>
              <div>
                <div className="font-semibold text-gray-800 text-sm">
                  Timeline Health
                </div>
                <div className="text-xs text-gray-500">
                  {getStatusText(timelineHealth.status)} • {phase} Phase
                </div>
              </div>
            </div>
            <div 
              className="text-2xl font-bold"
              style={{ color: getHealthColor(timelineHealth.status) }}
            >
              {timelineHealth.overall_score}%
            </div>
          </div>

          {/* Health Factor Breakdown */}
          <div className="space-y-2 mb-3">
            {timelineHealth.factors.map((factor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: getHealthColor(factor.status) }}
                  ></div>
                  <span className="text-xs text-gray-600">{factor.name}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-xs font-medium">{Math.round(factor.score)}%</span>
                  <span className="text-xs text-gray-400">({factor.weight}%)</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Insights */}
          <div className="border-t border-gray-200 pt-2">
            <div className="text-xs text-gray-600">
              {timelineHealth.status === 'excellent' && (
                <span className="text-green-700">
                  🎉 Outstanding financial trajectory! Keep up the excellent work.
                </span>
              )}
              {timelineHealth.status === 'good' && (
                <span className="text-blue-700">
                  📈 Good progress on financial goals. Consider optimization opportunities.
                </span>
              )}
              {timelineHealth.status === 'fair' && (
                <span className="text-amber-700">
                  ⚡ Room for improvement. Focus on budget optimization and goal alignment.
                </span>
              )}
              {timelineHealth.status === 'critical' && (
                <span className="text-red-700">
                  🚨 Timeline needs immediate attention. Review budget and priorities.
                </span>
              )}
            </div>
          </div>

          {/* Persona Context */}
          {persona && personaTheme && (
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">
                Optimized for {persona}
              </span>
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: personaTheme.primary }}
              ></div>
            </div>
          )}

          {/* Tooltip Arrow */}
          <div 
            className={`absolute w-3 h-3 transform rotate-45 border-r border-b border-gray-200 bg-white ${
              position === 'bottom' ? '-top-1.5 left-6' :
              position === 'top' ? '-bottom-1.5 left-6' :
              position === 'left' ? '-right-1.5 top-6' :
              '-left-1.5 top-6'
            }`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default TimelineStatusBadge;
