/**
 * Contextual Guidance Widget
 * Provides CFA-level smart recommendations at financial decision points
 * Appears contextually throughout the app to guide users with professional advice
 */
import React, { useState, useEffect } from 'react';
import useLifecyclePhase from '../../hooks/useLifecyclePhase';
import cfaGuidanceService from '../../services/cfaGuidance';
import { useTimeline } from '../../contexts/TimelineContext';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ContextualGuidanceWidget = ({ 
  context = 'general', // budget_planning, investment_allocation, goal_setting, etc.
  trigger = 'manual', // manual, automatic, decision_point
  data = {}, // Context-specific data
  className = '',
  onRecommendationClick = null,
  maxRecommendations = 3,
  autoShow = false
}) => {
  const [isVisible, setIsVisible] = useState(autoShow);
  const [guidance, setGuidance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);

  const { currentAge, persona, personaTheme } = useTimeline();
  const { incomes = [], expenses = [], selectNetCashFlow } = useUnifiedFinancialContext();
  const actualSurplus = typeof selectNetCashFlow === 'function' ? selectNetCashFlow() : 0;
  const monthlyIncome = Array.isArray(incomes) ? incomes.reduce((s, i) => s + (i.monthly_amount || i.amount || 0), 0) : (incomes?.total_monthly_income || 0);
  const monthlyExpenses = Array.isArray(expenses) ? expenses.reduce((s, e) => s + (e.monthly_equivalent || e.amount || 0), 0) : 0;
  const budgetData = { monthlyIncome, monthlyExpenses, netWorth: 0, dependents: 0, goals: [], currentAssets: {} };

  // Mock user profile - in real app this would come from context/props
  const userProfile = {
    age: currentAge || 30,
    income: budgetData?.monthlyIncome || 0,
    expenses: budgetData?.monthlyExpenses || 0,
    netWorth: budgetData?.netWorth || 0,
    dependents: budgetData?.dependents || 0,
    goals: budgetData?.goals || [],
    currentAssets: budgetData?.currentAssets || {}
  };

  const { phase, recommendations, health } = useLifecyclePhase(userProfile);

  // Load guidance when component mounts or context changes
  useEffect(() => {
    if (isVisible && context) {
      loadGuidance();
    }
  }, [context, phase, actualSurplus, isVisible]);

  // Auto-show logic for decision points
  useEffect(() => {
    if (trigger === 'decision_point' && shouldShowAutomatically()) {
      setIsVisible(true);
    }
  }, [trigger, context, actualSurplus, budgetData]);

  const loadGuidance = async () => {
    setLoading(true);
    setError(null);

    try {
      const contextualGuidance = await cfaGuidanceService.getContextualGuidance(
        context,
        userProfile,
        phase,
        { ...data, surplus: actualSurplus, budgetData }
      );

      setGuidance(contextualGuidance);
    } catch (err) {
      console.error('Error loading contextual guidance:', err);
      setError('Unable to load recommendations at this time');
    } finally {
      setLoading(false);
    }
  };

  const shouldShowAutomatically = () => {
    // Auto-show logic for different contexts
    switch (context) {
      case 'budget_planning':
        return actualSurplus !== undefined && (actualSurplus > 50000 || actualSurplus < 0);
      case 'investment_allocation':
        return actualSurplus > 30000;
      case 'goal_setting':
        return !budgetData?.goals || budgetData.goals.length === 0;
      case 'emergency_fund':
        return !budgetData?.currentAssets?.emergency_fund || budgetData.currentAssets.emergency_fund < (budgetData?.monthlyExpenses * 3);
      default:
        return false;
    }
  };

  const getContextIcon = (context) => {
    const icons = {
      budget_planning: '📊',
      investment_allocation: '📈',
      goal_setting: '🎯',
      risk_management: '🛡️',
      emergency_fund: '🆘',
      retirement_planning: '🏖️',
      debt_management: '💳',
      tax_optimization: '💰',
      general: '💡'
    };
    return icons[context] || icons.general;
  };

  const getContextTitle = (context) => {
    const titles = {
      budget_planning: 'Budget Optimization',
      investment_allocation: 'Investment Guidance',
      goal_setting: 'Goal Planning',
      risk_management: 'Risk Management',
      emergency_fund: 'Emergency Fund',
      retirement_planning: 'Retirement Planning',
      debt_management: 'Debt Strategy',
      tax_optimization: 'Tax Optimization',
      general: 'Financial Guidance'
    };
    return titles[context] || titles.general;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      critical: 'border-red-500 bg-red-50',
      high: 'border-orange-500 bg-orange-50',
      medium: 'border-blue-500 bg-blue-50',
      low: 'border-gray-500 bg-gray-50'
    };
    return colors[priority] || colors.medium;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      critical: '🚨',
      high: '⚠️',
      medium: '📋',
      low: '💡'
    };
    return icons[priority] || icons.medium;
  };

  const handleRecommendationClick = (recommendation, index) => {
    if (onRecommendationClick) {
      onRecommendationClick(recommendation, context);
    }
    
    if (expandedRecommendation === index) {
      setExpandedRecommendation(null);
    } else {
      setExpandedRecommendation(index);
    }
  };

  if (!isVisible) {
    return (
      <div className={`contextual-guidance-trigger ${className}`}>
        <button
          onClick={() => setIsVisible(true)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          style={{ 
            borderLeft: `3px solid ${personaTheme?.primary || '#3b82f6'}`,
            backgroundColor: `${personaTheme?.secondary || '#eff6ff'}`
          }}
        >
          <span>{getContextIcon(context)}</span>
          <span>Get CFA Guidance</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`contextual-guidance-widget bg-white rounded-lg shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div 
        className="px-4 py-3 border-b border-gray-200 flex items-center justify-between"
        style={{ backgroundColor: personaTheme?.secondary || '#f8fafc' }}
      >
        <div className="flex items-center space-x-2">
          <span className="text-xl">{getContextIcon(context)}</span>
          <div>
            <h3 className="font-semibold text-gray-800 text-sm">
              {getContextTitle(context)}
            </h3>
            <p className="text-xs text-gray-600">
              {phase} Phase • CFA-Level Guidance
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading guidance...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-6">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={loadGuidance}
              className="mt-2 text-xs text-blue-600 hover:text-blue-700"
            >
              Try Again
            </button>
          </div>
        )}

        {guidance && !loading && (
          <div className="space-y-4">
            {/* Context Summary */}
            {guidance.current_savings_rate !== undefined && (
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-800">Current Status</span>
                  <span className="text-xs text-blue-600">
                    {guidance.current_savings_rate?.toFixed(1)}% savings rate
                  </span>
                </div>
                <div className="text-xs text-blue-700">
                  Target: {guidance.target_savings_rate}% for {phase.toLowerCase()} phase
                </div>
              </div>
            )}

            {/* Recommendations */}
            {guidance.recommendations && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3 text-sm">
                  Smart Recommendations
                </h4>
                <div className="space-y-2">
                  {guidance.recommendations.slice(0, maxRecommendations).map((rec, index) => {
                    const isExpanded = expandedRecommendation === index;
                    
                    return (
                      <div
                        key={index}
                        className={`border rounded-lg cursor-pointer transition-all duration-200 ${
                          isExpanded ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleRecommendationClick(rec, index)}
                      >
                        <div className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="text-sm font-medium text-gray-800 mb-1">
                                {typeof rec === 'string' ? rec : rec.title || rec}
                              </div>
                              {typeof rec === 'object' && rec.description && (
                                <div className="text-xs text-gray-600 mb-2">
                                  {rec.description}
                                </div>
                              )}
                            </div>
                            
                            {typeof rec === 'object' && rec.priority && (
                              <div className="flex items-center space-x-1 ml-2">
                                <span className="text-xs">{getPriorityIcon(rec.priority)}</span>
                              </div>
                            )}
                          </div>

                          {/* Expanded Details */}
                          {isExpanded && typeof rec === 'object' && (
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              {rec.action && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-blue-800">Action: </span>
                                  <span className="text-xs text-blue-700">{rec.action}</span>
                                </div>
                              )}
                              
                              {rec.impact && (
                                <div className="mb-2">
                                  <span className="text-xs font-medium text-blue-800">Impact: </span>
                                  <span className="text-xs text-blue-700">{rec.impact}</span>
                                </div>
                              )}

                              {rec.timeline && (
                                <div>
                                  <span className="text-xs font-medium text-blue-800">Timeline: </span>
                                  <span className="text-xs text-blue-700">{rec.timeline}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Phase Health Integration */}
            {health && health.score < 70 && (
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center space-x-2 mb-2">
                  <span className="text-yellow-600">⚠️</span>
                  <span className="text-sm font-medium text-yellow-800">
                    Phase Health Alert
                  </span>
                  <span className="text-xs text-yellow-600">
                    {health.score}% score
                  </span>
                </div>
                <div className="text-xs text-yellow-700">
                  {health.improvement_areas?.length > 0 && (
                    <span>Focus on: {health.improvement_areas.join(', ')}</span>
                  )}
                </div>
              </div>
            )}

            {/* Additional Context-Specific Information */}
            {guidance.budget_allocation_guide && (
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">
                  Recommended Budget Allocation
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(guidance.budget_allocation_guide).map(([category, percentage]) => (
                    <div key={category} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{category.replace('_', ' ')}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {guidance.recommended_allocation && (
              <div>
                <h5 className="text-xs font-medium text-gray-700 mb-2">
                  Asset Allocation Guidance
                </h5>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(guidance.recommended_allocation).map(([asset, percentage]) => (
                    <div key={asset} className="flex justify-between">
                      <span className="text-gray-600 capitalize">{asset}</span>
                      <span className="font-medium">{percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer Actions */}
        {guidance && (
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <span>💡</span>
              <span>CFA Institute Guidelines</span>
            </div>
            
            <button
              onClick={loadGuidance}
              className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextualGuidanceWidget;
