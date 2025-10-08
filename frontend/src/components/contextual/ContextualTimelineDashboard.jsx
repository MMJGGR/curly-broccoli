/**
 * Contextual Timeline Dashboard
 * Transforms the space-dominating timeline into contextual intelligence
 * Provides CFA-level guidance at decision points with <20% screen usage
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../../contexts/TimelineContext';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import useLifecyclePhase from '../../hooks/useLifecyclePhase';
import LifecyclePhaseIndicator from './LifecyclePhaseIndicator';
import { formatCurrency } from '../../utils/formatters';
import ContextualGuidanceWidget from './ContextualGuidanceWidget';
import TimelineStatusBadge from './TimelineStatusBadge';
import phaseAppropriateDefaults from './PhaseAppropriateDefaults';
import { PageHeader } from '../ui';

const ContextualTimelineDashboard = () => {
  const navigate = useNavigate();
  const [activeGuidanceContext, setActiveGuidanceContext] = useState(null);
  const [showCompactTimeline, setShowCompactTimeline] = useState(false);

  const {
    loading: timelineLoading,
    error,
    persona,
    personaTheme,
    currentAge,
    milestones = [],
    nextMilestone,
    alignmentScore,
    isTimelineReady,
    loadTimelineJourney,
  } = useTimeline();

  const {
    incomes = [],
    expenses = [],
    selectNetCashFlow,
  } = useUnifiedFinancialContext();
  const actualSurplus = typeof selectNetCashFlow === 'function' ? selectNetCashFlow() : 0;
  const monthlyIncome = Array.isArray(incomes) ? incomes.reduce((s, i) => s + (i.monthly_amount || i.amount || 0), 0) : (incomes?.total_monthly_income || 0);
  const monthlyExpenses = Array.isArray(expenses) ? expenses.reduce((s, e) => s + (e.monthly_equivalent || e.amount || 0), 0) : 0;
  const budgetData = { monthlyIncome, monthlyExpenses };
  const budgetLoading = { global: false };
  const isBudgetReady = true;

  // User profile for lifecycle analysis
  const userProfile = {
    age: currentAge || 30,
    income: budgetData?.monthlyIncome || 0,
    expenses: budgetData?.monthlyExpenses || 0,
    netWorth: budgetData?.netWorth || 0,
    dependents: budgetData?.dependents || 0,
    goals: milestones,
    currentAssets: budgetData?.currentAssets || {}
  };

  const {
    phase,
    recommendations,
    guidance,
    health,
    loading: lifecycleLoading
  } = useLifecyclePhase(userProfile);

  const loading = timelineLoading || budgetLoading || lifecycleLoading;

  // Load timeline data on mount
  useEffect(() => {
    if (!isTimelineReady) {
      loadTimelineJourney();
    }
  }, [isTimelineReady, loadTimelineJourney]);

  // Determine contextual guidance to show
  const getContextualGuidanceContext = () => {
    if (actualSurplus !== undefined) {
      if (actualSurplus > 50000) return 'investment_allocation';
      if (actualSurplus < 0) return 'budget_planning';
    }
    
    if (!budgetData?.currentAssets?.emergency_fund || budgetData.currentAssets.emergency_fund < (budgetData?.monthlyExpenses * 3)) {
      return 'emergency_fund';
    }

    if (!milestones || milestones.length === 0) {
      return 'goal_setting';
    }

    return null;
  };

  const contextualGuidance = getContextualGuidanceContext();

  if (loading) {
    return (
      <div className="contextual-timeline-dashboard h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Financial Intelligence...</h2>
          <p className="text-gray-600">Preparing your contextual guidance system</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="contextual-timeline-dashboard h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">System Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contextual-timeline-dashboard min-h-screen bg-gray-50">
      <PageHeader title="Dashboard" description="Timeline alignment and contextual guidance" />

      {/* Main Content - Contextual Intelligence Focus */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Smart Contextual Guidance - Primary Focus */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Primary Guidance Widget */}
          <div className="lg:col-span-2">
            {contextualGuidance && (
              <ContextualGuidanceWidget
                context={activeGuidanceContext || contextualGuidance}
                trigger="automatic"
                data={{ surplus: actualSurplus, budgetData }}
                autoShow={true}
                maxRecommendations={4}
                className="h-full"
                onRecommendationClick={(recommendation, context) => {
                  console.log('Recommendation clicked:', recommendation, context);
                  // Handle navigation or actions based on recommendation
                }}
              />
            )}

            {!contextualGuidance && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🎉</span>
                    <h2 className="text-xl font-bold text-gray-800">
                      Financial Health Excellent
                    </h2>
                  </div>
                  <TimelineStatusBadge size="large" showPercentage={true} />
                </div>
                
                <p className="text-gray-600 mb-6">
                  Your {phase.toLowerCase()} phase trajectory is on track. Continue your current strategy while monitoring for optimization opportunities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveGuidanceContext('investment_allocation')}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800 mb-1">📈 Portfolio Review</div>
                    <div className="text-sm text-gray-600">Optimize asset allocation for {phase.toLowerCase()} phase</div>
                  </button>
                  
                  <button
                    onClick={() => setActiveGuidanceContext('goal_setting')}
                    className="p-4 text-left border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <div className="font-medium text-gray-800 mb-1">🎯 Goal Optimization</div>
                    <div className="text-sm text-gray-600">Review and enhance your financial goals</div>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Phase Health and Quick Stats */}
          <div className="space-y-4">
            
            {/* Phase Health Card */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-800">{phase} Health</h3>
                <span className="text-gray-400" aria-hidden>•</span>
              </div>
              
              {health && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overall Score</span>
                    <span className="font-bold text-lg" style={{ color: health.score >= 80 ? '#10b981' : health.score >= 60 ? '#3b82f6' : '#f59e0b' }}>
                      {health.score}%
                    </span>
                  </div>
                  
                  {health.factors?.slice(0, 3).map((factor, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">{factor.factor}</span>
                      <span className={`text-xs font-medium ${
                        factor.status === 'excellent' ? 'text-green-600' :
                        factor.status === 'good' ? 'text-blue-600' : 'text-amber-600'
                      }`}>
                        {factor.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Next Milestone */}
            {nextMilestone && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Next Milestone</h3>
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{getMilestoneIcon(nextMilestone.category)}</span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800 text-sm">{nextMilestone.title}</div>
                    <div className="text-xs text-gray-600 mt-1">Age {nextMilestone.age}</div>
                    {nextMilestone.target_amount && (
                      <div className="text-sm font-semibold text-green-600 mt-1">
                        {formatCurrency(nextMilestone.target_amount)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Budget Status */}
            {isBudgetReady && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-3">Budget Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Surplus</span>
                    <span className={`font-semibold ${actualSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(actualSurplus)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Health</span>
                    <span className={`text-sm font-medium ${
                      budgetHealth === 'healthy' ? 'text-green-600' :
                      budgetHealth === 'fair' ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {budgetHealth === 'healthy' ? 'Healthy' :
                       budgetHealth === 'fair' ? 'Fair' : 'Needs Attention'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Timeline (Only shown when toggled - <20% screen space) */}
        {showCompactTimeline && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6" style={{ maxHeight: '300px' }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Timeline Overview</h2>
              <button
                onClick={() => setShowCompactTimeline(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Compact Timeline Visualization */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2" style={{ borderColor: personaTheme?.primary || '#3b82f6' }}></div>
              </div>
              <div className="relative flex justify-between">
                {milestones.slice(0, 5).map((milestone, index) => (
                  <div key={index} className="flex flex-col items-center bg-white">
                    <div 
                      className="w-8 h-8 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-sm"
                      style={{ backgroundColor: personaTheme?.primary || '#3b82f6' }}
                    >
                      {getMilestoneIcon(milestone.category)}
                    </div>
                    <div className="mt-2 text-center">
                      <div className="text-xs font-medium text-gray-800">{milestone.title}</div>
                      <div className="text-xs text-gray-500">Age {milestone.age}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/budget')}
            className="p-4 bg-white rounded-xl shadow-lg text-left hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📊</span>
              {isBudgetReady && (
                <span className={`w-2 h-2 rounded-full ${actualSurplus >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
              )}
            </div>
            <div className="font-medium text-gray-800 mb-1">Budget Review</div>
            <div className="text-sm text-gray-600">
              {isBudgetReady ? 
                `${actualSurplus >= 0 ? 'Surplus' : 'Deficit'}: ${formatCurrency(Math.abs(actualSurplus))}` :
                'Set up your budget'
              }
            </div>
          </button>

          <button
            onClick={() => setActiveGuidanceContext('investment_allocation')}
            className="p-4 bg-white rounded-xl shadow-lg text-left hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400" aria-hidden>•</span>
              <span className="text-xs text-blue-600 font-medium">{phase}</span>
            </div>
            <div className="font-medium text-gray-800 mb-1">Asset Allocation</div>
            <div className="text-sm text-gray-600">
              {recommendations?.assetAllocation?.equities}% equities recommended
            </div>
          </button>

          <button
            onClick={() => setActiveGuidanceContext('goal_setting')}
            className="p-4 bg-white rounded-xl shadow-lg text-left hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400" aria-hidden>•</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">{milestones.length}</span>
            </div>
            <div className="font-medium text-gray-800 mb-1">Financial Goals</div>
            <div className="text-sm text-gray-600">
              {milestones.length > 0 ? 'Review and optimize' : 'Set your first goal'}
            </div>
          </button>

          <button
            onClick={() => setActiveGuidanceContext('risk_management')}
            className="p-4 bg-white rounded-xl shadow-lg text-left hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400" aria-hidden>•</span>
              <span className="text-xs text-purple-600 font-medium">CFA</span>
            </div>
            <div className="font-medium text-gray-800 mb-1">Risk Management</div>
            <div className="text-sm text-gray-600">
              {recommendations?.riskProfile?.level} risk profile
            </div>
          </button>
        </div>
      </div>

      {/* Active Guidance Modal */}
      {activeGuidanceContext && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <ContextualGuidanceWidget
              context={activeGuidanceContext}
              trigger="manual"
              data={{ surplus: actualSurplus, budgetData }}
              autoShow={true}
              maxRecommendations={6}
              className="border-none shadow-none m-0"
              onRecommendationClick={(recommendation, context) => {
                console.log('Modal recommendation clicked:', recommendation, context);
                // Handle specific actions here
                setActiveGuidanceContext(null);
              }}
            />
            <button
              onClick={() => setActiveGuidanceContext(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function for milestone icons
const getMilestoneIcon = () => '';

export default ContextualTimelineDashboard;
