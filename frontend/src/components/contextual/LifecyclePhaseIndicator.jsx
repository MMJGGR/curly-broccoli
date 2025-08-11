/**
 * Lifecycle Phase Indicator Component
 * Shows current lifecycle phase context throughout the app
 * Provides CFA-level phase information and quick access to phase-specific guidance
 */
import React, { useState } from 'react';
import useLifecyclePhase, { LIFECYCLE_PHASES } from '../../hooks/useLifecyclePhase';
import { useTimeline } from '../../contexts/TimelineContext';
import { useBudget } from '../../contexts/BudgetContext';

const LifecyclePhaseIndicator = ({ 
  size = 'default', 
  showDetails = true, 
  showGuidance = true,
  className = '',
  onPhaseClick = null 
}) => {
  const { currentAge, persona, personaTheme } = useTimeline();
  const { budgetData } = useBudget();
  const [showPhaseDetails, setShowPhaseDetails] = useState(false);

  // Mock user profile - in real app this would come from context/props
  const userProfile = {
    age: currentAge || 30,
    income: budgetData?.monthlyIncome || 0,
    expenses: budgetData?.monthlyExpenses || 0,
    netWorth: budgetData?.netWorth || 0,
    dependents: budgetData?.dependents || 0,
    goals: budgetData?.goals || []
  };

  const {
    phase,
    health,
    riskProfile,
    loading,
    getPhaseColor,
    getPhaseIcon
  } = useLifecyclePhase(userProfile);

  if (loading) {
    return (
      <div className={`lifecycle-phase-indicator loading ${className}`}>
        <div className="animate-pulse flex items-center space-x-2">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const sizeClasses = {
    small: 'text-xs',
    default: 'text-sm',
    large: 'text-base'
  };

  const iconSizes = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl'
  };

  const handleClick = () => {
    if (onPhaseClick) {
      onPhaseClick(phase);
    } else if (showGuidance) {
      setShowPhaseDetails(!showPhaseDetails);
    }
  };

  const getPhaseDescription = (phase) => {
    const descriptions = {
      [LIFECYCLE_PHASES.ACCUMULATION]: 'Building wealth through aggressive growth and systematic saving',
      [LIFECYCLE_PHASES.CONSOLIDATION]: 'Balancing growth with stability as retirement approaches',
      [LIFECYCLE_PHASES.SPENDING]: 'Preserving capital while generating retirement income'
    };
    return descriptions[phase];
  };

  const getHealthStatusColor = (healthScore) => {
    if (healthScore >= 80) return 'text-green-600';
    if (healthScore >= 60) return 'text-blue-600';
    if (healthScore >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthStatusIcon = (healthScore) => {
    if (healthScore >= 80) return '✅';
    if (healthScore >= 60) return '📊';
    if (healthScore >= 40) return '⚠️';
    return '🚨';
  };

  return (
    <div className={`lifecycle-phase-indicator relative ${className}`}>
      {/* Main Phase Indicator */}
      <div 
        className={`flex items-center space-x-2 cursor-pointer transition-all duration-200 hover:bg-gray-50 rounded-lg p-2 ${sizeClasses[size]}`}
        onClick={handleClick}
        style={{ 
          borderLeft: `4px solid ${getPhaseColor(phase)}`,
          backgroundColor: showPhaseDetails ? `${getPhaseColor(phase)}10` : 'transparent'
        }}
      >
        {/* Phase Icon */}
        <span className={`${iconSizes[size]}`} style={{ color: getPhaseColor(phase) }}>
          {getPhaseIcon(phase)}
        </span>

        {/* Phase Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <span 
              className="font-semibold truncate"
              style={{ color: getPhaseColor(phase) }}
            >
              {phase}
            </span>
            
            {health && (
              <span className={`text-xs ${getHealthStatusColor(health.score)}`}>
                {getHealthStatusIcon(health.score)}
              </span>
            )}
          </div>
          
          {showDetails && size !== 'small' && (
            <div className="text-xs text-gray-600 truncate">
              Age {currentAge} • {riskProfile?.level || 'Moderate'} Risk
            </div>
          )}
        </div>

        {/* Expand Indicator */}
        {showGuidance && (
          <div className="flex-shrink-0">
            <svg 
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${showPhaseDetails ? 'transform rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        )}
      </div>

      {/* Detailed Phase Information */}
      {showPhaseDetails && showGuidance && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-80">
          {/* Phase Overview */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-2xl">{getPhaseIcon(phase)}</span>
              <h3 className="font-bold text-gray-800">{phase} Phase</h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              {getPhaseDescription(phase)}
            </p>
          </div>

          {/* Health Score */}
          {health && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Phase Health Score</span>
                <div className="flex items-center space-x-1">
                  <span className={`text-lg ${getHealthStatusColor(health.score)}`}>
                    {getHealthStatusIcon(health.score)}
                  </span>
                  <span className={`font-bold ${getHealthStatusColor(health.score)}`}>
                    {health.score}%
                  </span>
                </div>
              </div>
              
              {/* Health Factors */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {health.factors?.slice(0, 4).map((factor, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-600 truncate">{factor.factor}</span>
                    <span className={`font-medium ${
                      factor.status === 'excellent' ? 'text-green-600' :
                      factor.status === 'good' ? 'text-blue-600' :
                      factor.status === 'needs_improvement' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {factor.status === 'excellent' ? '✅' :
                       factor.status === 'good' ? '📊' :
                       factor.status === 'needs_improvement' ? '⚠️' : '🚨'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Risk Profile */}
          {riskProfile && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Risk Profile</h4>
              <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                <span className="text-sm text-blue-800 font-medium">
                  {riskProfile.level?.charAt(0).toUpperCase() + riskProfile.level?.slice(1)} Risk
                </span>
                <span className="text-xs text-blue-600">
                  {riskProfile.volatility_tolerance} volatility tolerance
                </span>
              </div>
            </div>
          )}

          {/* Phase-Specific Quick Tips */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Key Focus Areas</h4>
            <div className="space-y-1">
              {getPhaseQuickTips(phase).map((tip, index) => (
                <div key={index} className="flex items-start space-x-2 text-xs">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span className="text-gray-600">{tip}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Persona Integration */}
          {persona && personaTheme && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Optimized for {persona} profile</span>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: personaTheme.primary }}
                ></div>
              </div>
            </div>
          )}

          {/* Close Button */}
          <button
            onClick={() => setShowPhaseDetails(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function for phase-specific tips
function getPhaseQuickTips(phase) {
  const tips = {
    [LIFECYCLE_PHASES.ACCUMULATION]: [
      'Maximize emergency fund to 6 months expenses',
      'Aggressive investment allocation (70-90% equities)',
      'Focus on high-growth, tax-advantaged accounts',
      'Implement systematic investment plan'
    ],
    [LIFECYCLE_PHASES.CONSOLIDATION]: [
      'Balance growth with risk management',
      'Optimize retirement account contributions',
      'Consider long-term care insurance',
      'Review and rebalance portfolio quarterly'
    ],
    [LIFECYCLE_PHASES.SPENDING]: [
      'Implement 4% withdrawal rule',
      'Focus on capital preservation',
      'Generate stable retirement income',
      'Plan for healthcare cost increases'
    ]
  };
  
  return tips[phase] || [];
}

export default LifecyclePhaseIndicator;