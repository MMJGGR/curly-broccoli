/**
 * Timeline Dashboard - Main dashboard replacement with Timeline-first design
 * 70% Timeline, 30% contextual information
 */
import React, { useState, useEffect, useCallback } from 'react';
import { STRUCTURED_UX } from '../../config';
import TimelineStructured from '../structured/TimelineStructured';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../../contexts/TimelineContext';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import TimelineVisualization from './TimelineVisualization';
import AlignmentDashboard from './AlignmentDashboard';
import GoalAnalyticsDashboard from '../analytics/GoalAnalyticsDashboard';
import { useAnalytics } from '../../contexts/AnalyticsContext';

const TimelineDashboard = () => {
  // Helper function for milestone icons
  const getMilestoneIcon = () => '';

  const {
    loading,
    error,
    persona,
    personaTheme,
    personaWelcome,
    currentAge,
    currentPhase,
    milestones,
    nextMilestone,
    nextMilestoneDistance,
    alignmentScore,
    quickActions = [],
    isTimelineReady,
    loadTimelineJourney,
  } = useTimeline();

  const {
    expenses,
    incomes = [],
    loading: budgetLoading
  } = useUnifiedFinancialContext();

  // Calculate derived values from unified context
  const totalIncome = Array.isArray(incomes)
    ? incomes.reduce((sum, inc) => sum + (inc.monthly_amount || inc.amount || 0), 0)
    : (incomes?.total_monthly_income || 0);
  const totalExpenses = expenses?.reduce((sum, expense) => sum + (expense.monthly_equivalent || 0), 0) || 0;
  const actualSurplus = totalIncome - totalExpenses;
  const formatAmount = (amount) => `KES ${Math.round(amount).toLocaleString()}`;
  const budgetHealth = actualSurplus >= 0 ? 'healthy' : 'deficit';
  const isBudgetReady = !budgetLoading?.global && Array.isArray(expenses) && (Array.isArray(incomes) ? incomes.length >= 0 : true);

  // Mock budgetData structure for compatibility with existing code
  const budgetData = {
    monthlyIncome: totalIncome,
    expenses: expenses?.reduce((acc, expense) => {
      const category = expense.expense_category || 'miscellaneous';
      acc[category] = (acc[category] || 0) + (expense.monthly_equivalent || 0);
      return acc;
    }, {}) || {},
    goalAllocations: {
      emergencyFund: 0, // This would come from goals in future
      retirement: 0,
      education: 0,
      investments: 0
    }
  };

  const [activeView, setActiveView] = useState('overview');
  const [showMobilePanel, setShowMobilePanel] = useState(false);
  const [selectedGoalForAnalytics, setSelectedGoalForAnalytics] = useState(null);
  const [dashboardInsights, setDashboardInsights] = useState(null);
  const [goalAnalytics, setGoalAnalytics] = useState({});
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const navigate = useNavigate();
  const analytics = useAnalytics();

  const loadDashboardAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);
    try {
      // Load dashboard insights
      const insights = await analytics.getDashboardInsights();
      setDashboardInsights(insights);

      // Load analytics for each milestone/goal
      if (milestones && milestones.length > 0) {
        const analyticsPromises = milestones
          .filter(milestone => milestone.id)
          .slice(0, 5) // Limit to first 5 for performance
          .map(async (milestone) => {
            try {
              const analysis = await analytics.analyzeGoalTrajectory(milestone.id);
              return { id: milestone.id, analysis };
            } catch (error) {
              console.warn(`Analytics failed for milestone ${milestone.id}:`, error);
              return { id: milestone.id, analysis: null };
            }
          });

        const analyticsResults = await Promise.allSettled(analyticsPromises);
        const analyticsMap = {};
        
        analyticsResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value.analysis) {
            analyticsMap[result.value.id] = result.value.analysis;
          }
        });

        setGoalAnalytics(analyticsMap);
      }
    } catch (error) {
      console.error('Error loading dashboard analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [milestones]);

  // Refresh data on mount
  useEffect(() => {
    if (!isTimelineReady) {
      loadTimelineJourney();
    }
  }, [isTimelineReady, loadTimelineJourney]);

  // Load dashboard insights and goal analytics
  useEffect(() => {
    if (isTimelineReady && milestones?.length > 0) {
      loadDashboardAnalytics();
    }
  }, [isTimelineReady, milestones, loadDashboardAnalytics]);

  const refreshAnalytics = async () => {
    // Clear cache and reload analytics
    analytics.clearCache();
    await loadDashboardAnalytics();
  };

  if (STRUCTURED_UX) {
    return <TimelineStructured />;
  }
  // Loading state - Enterprise-grade design matching onboarding
  if (loading || budgetLoading) {
    return (
      <div className="timeline-dashboard h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading your Timeline...</h2>
          <p className="text-gray-600">Preparing your personalized financial journey</p>
        </div>
      </div>
    );
  }

  // Error state - Enterprise-grade design
  if (error) {
    return (
      <div className="timeline-dashboard h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Timeline Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Retry Loading
            </button>
            <button
              onClick={() => navigate('../budget')}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Go to Budget Instead
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-dashboard flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 min-h-0 overflow-hidden" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* Header with persona welcome and alignment score */}
      <div 
        className="dashboard-header p-6 bg-white shadow-lg border-b border-gray-200 rounded-t-xl mx-4 mt-4"
        style={{ 
          background: `linear-gradient(135deg, ${personaTheme?.secondary || '#f8fafc'} 0%, white 100%)`,
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <div className="flex items-center justify-between">
          {/* Welcome Message */}
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              {personaWelcome || `Welcome to your Financial Timeline`}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-gray-600">
                {currentPhase} • Age {currentAge}
              </span>
              {persona && (
                <span 
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white shadow-md hover:shadow-lg transition-shadow"
                  style={{ 
                    background: `linear-gradient(135deg, ${personaTheme?.primary} 0%, ${personaTheme?.accent || personaTheme?.primary} 100%)`,
                    boxShadow: `0 2px 4px ${personaTheme?.primary}20`
                  }}
                  data-cy="persona-badge"
                >
                  {persona} Profile
                </span>
              )}
            </div>
          </div>

          {/* Alignment Score & Controls */}
          <div className="flex items-center space-x-4">
            {/* Alignment Score */}
            <div className="text-center">
              <div className="text-sm text-gray-600">Alignment Score</div>
              <div 
                className="text-2xl font-bold"
                style={{ color: personaTheme?.primary }}
                data-cy="alignment-score"
              >
                {alignmentScore ? calculateBudgetEnhancedAlignment(alignmentScore, actualSurplus, budgetHealth) : '--'}%
              </div>
              {isBudgetReady && actualSurplus !== undefined && (
                <div className="text-xs text-gray-500 mt-1">
                  {actualSurplus >= 0 ? '+Budget Boost' : 'Budget Impact'}
                </div>
              )}
            </div>

            {/* Timeline Collapse Toggle */}
            <button
              onClick={() => setTimelineCollapsed(!timelineCollapsed)}
              className={`p-2 rounded-lg transition-all duration-200 border border-gray-200 ${
                timelineCollapsed ? 'bg-blue-500 text-white shadow-md' : 'bg-white text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              title={timelineCollapsed ? 'Expand Timeline' : 'Collapse Timeline'}
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {timelineCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                )}
              </svg>
            </button>

            {/* View Toggle */}
            <div className="flex bg-white rounded-xl p-1 border border-gray-200 shadow-md">
              <button
                onClick={() => setActiveView('overview')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  activeView === 'overview' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveView('analytics')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  activeView === 'analytics' 
                    ? 'bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Analytics
              </button>
              <button
                onClick={() => setActiveView('journey')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  activeView === 'journey' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Journey
              </button>
              <button
                onClick={() => setActiveView('alignment')}
                className={`px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                  activeView === 'alignment' 
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md transform scale-105' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                Alignment
              </button>
            </div>

            {/* Mobile Panel Toggle */}
            <button
              onClick={() => setShowMobilePanel(!showMobilePanel)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-800"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content flex-1 flex overflow-hidden mx-4 mb-4">
        <div className="flex-1 flex bg-white rounded-xl shadow-xl overflow-hidden"
          style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
        >
        
        {/* Timeline Area (70% on desktop, full on mobile, collapsible) */}
        <div className={`timeline-area transition-all duration-300 ${
          timelineCollapsed 
            ? 'hidden' 
            : showMobilePanel 
              ? 'hidden md:flex md:w-7/10' 
              : 'flex md:w-7/10'
        } w-full flex-col`}>
          <TimelineVisualization />
        </div>

        {/* Context Panel (30% on desktop, full width when timeline collapsed, overlay on mobile) */}
        <div className={`
          context-panel bg-white transition-all duration-300
          ${timelineCollapsed 
            ? 'flex w-full' 
            : showMobilePanel 
              ? 'fixed inset-y-0 right-0 w-80 shadow-xl z-50 md:relative md:inset-auto md:w-3/10 md:shadow-none border-l border-gray-200' 
              : 'hidden md:flex md:w-3/10 border-l border-gray-200'
          }
          flex-col
        `}>
          
          {/* Panel Header */}
          <div className="panel-header p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">
                {timelineCollapsed && <span className="text-blue-600 mr-2">📊</span>}
                {activeView === 'overview' && (timelineCollapsed ? 'Dashboard Overview' : 'Overview')}
                {activeView === 'analytics' && 'Predictive Analytics'}
                {activeView === 'journey' && 'Journey Details'}  
                {activeView === 'alignment' && 'Alignment Insights'}
              </h3>
              <button
                onClick={() => setShowMobilePanel(false)}
                className="md:hidden text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Panel Content */}
          <div className="panel-content flex-1 overflow-y-auto">
            
            {/* Overview Panel */}
            {activeView === 'overview' && (
              <div className="p-4 space-y-6">
                
                {/* Next Milestone with Analytics */}
                {nextMilestone && (
                  <div className="next-milestone">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-800">Next Milestone</h4>
                      {goalAnalytics[nextMilestone.id] && (
                        <button
                          onClick={() => setSelectedGoalForAnalytics(nextMilestone.id)}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200"
                        >
                          View Analytics
                        </button>
                      )}
                    </div>
                    <div 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: personaTheme?.secondary }}
                    >
                      <div className="font-medium text-gray-800">{nextMilestone.title}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {nextMilestoneDistance}
                      </div>
                      {nextMilestone.target_amount && (
                        <div className="text-lg font-semibold text-green-600 mt-2">
                          {analytics.formatCurrency(nextMilestone.target_amount)}
                        </div>
                      )}
                      
                      {/* Add analytics preview */}
                      {goalAnalytics[nextMilestone.id] && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Success Probability:</span>
                            <span 
                              className="font-semibold"
                              style={{ 
                                color: analytics.getRiskLevelColor(
                                  goalAnalytics[nextMilestone.id].success_probability
                                )
                              }}
                            >
                              {analytics.formatPercentage(
                                goalAnalytics[nextMilestone.id].success_probability
                              )}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span className="text-gray-600">Current Progress:</span>
                            <span className="font-semibold text-blue-600">
                              {goalAnalytics[nextMilestone.id].current_progress?.progress_percentage?.toFixed(1) || 0}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    {/* Budget-specific actions */}
                    {isBudgetReady && (
                      <>
                        <button
                          onClick={() => navigate('../budget')}
                          className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          <div className="font-medium text-blue-800">📊 Review Budget</div>
                          <div className="text-sm text-blue-600">
                            {actualSurplus >= 0 ? 'Optimize surplus allocation' : 'Adjust spending plan'}
                          </div>
                        </button>
                        {actualSurplus >= 50000 && (
                          <button
                            onClick={() => navigate('../budget')}
                            className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200"
                          >
                            <div className="font-medium text-green-800">🎯 Allocate Surplus</div>
                            <div className="text-sm text-green-600">
                              {formatAmount(actualSurplus)} available for goals
                            </div>
                          </button>
                        )}
                        {budgetHealth === 'deficit' && (
                          <button
                            onClick={() => navigate('../budget')}
                            className="w-full text-left p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors border border-red-200"
                          >
                            <div className="font-medium text-red-800">⚠️ Budget Alert</div>
                            <div className="text-sm text-red-600">Spending exceeds income</div>
                          </button>
                        )}
                      </>
                    )}
                    {/* Timeline quick actions */}
                    {quickActions.map((action, index) => (
                      <button
                        key={index}
                        className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-800">{action.title}</div>
                        <div className="text-sm text-gray-600">{action.category}</div>
                      </button>
                    ))}
                    {/* Default action if no specific actions */}
                    {quickActions.length === 0 && !isBudgetReady && (
                      <button
                        className="w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="font-medium text-gray-800">🚀 Get Started</div>
                        <div className="text-sm text-gray-600">Complete your financial profile</div>
                      </button>
                    )}
                  </div>
                </div>

                {/* Budget Health Indicator */}
                {isBudgetReady && (
                  <div className="budget-health">
                    <h4 className="font-medium text-gray-800 mb-3">Budget Health</h4>
                    <div 
                      className="p-4 rounded-lg"
                      style={{ backgroundColor: personaTheme?.secondary }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Health Score</span>
                        <span 
                          className="text-2xl font-bold"
                          style={{ color: actualSurplus >= 0 ? '#16a34a' : '#dc2626' }}
                        >
                          {actualSurplus >= 0 ? '85' : '45'}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Monthly Surplus</span>
                        <span 
                          className={`font-semibold ${
                            actualSurplus >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {formatAmount(actualSurplus)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {actualSurplus >= 0 
                          ? 'Excellent budget control - surplus available for goals' 
                          : 'Budget optimization needed - expenses exceed income'
                        }
                      </div>
                      {actualSurplus >= 0 && nextMilestone && (
                        <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-700">
                          💡 Current surplus could accelerate {nextMilestone.title} by{' '}
                          {Math.round(actualSurplus / (nextMilestone.target_amount / 12))} months
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Budget Variance Alerts & Recommendations */}
                {isBudgetReady && (
                  <div className="budget-recommendations">
                    <h4 className="font-medium text-gray-800 mb-3">Smart Recommendations</h4>
                    <div className="space-y-2">
                      {actualSurplus >= 100000 && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-start">
                            <span className="text-green-600 mr-2">💰</span>
                            <div>
                              <div className="text-sm font-medium text-green-800">High Surplus Opportunity</div>
                              <div className="text-xs text-green-600 mt-1">
                                Consider allocating {formatAmount(Math.round(actualSurplus * 0.6))} to investments and{' '}
                                {formatAmount(Math.round(actualSurplus * 0.4))} to emergency fund.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {actualSurplus >= 30000 && actualSurplus < 100000 && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start">
                            <span className="text-blue-600 mr-2">🎯</span>
                            <div>
                              <div className="text-sm font-medium text-blue-800">Goal Acceleration Available</div>
                              <div className="text-xs text-blue-600 mt-1">
                                Surplus of {formatAmount(actualSurplus)} could boost your next milestone by{' '}
                                {nextMilestone ? Math.round(actualSurplus / (nextMilestone.target_amount / 12)) : '3-6'} months.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {actualSurplus < 0 && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-start">
                            <span className="text-red-600 mr-2">⚠️</span>
                            <div>
                              <div className="text-sm font-medium text-red-800">Budget Optimization Needed</div>
                              <div className="text-xs text-red-600 mt-1">
                                Monthly deficit of {formatAmount(Math.abs(actualSurplus))}. Review variable expenses and consider income optimization.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {actualSurplus >= 0 && actualSurplus < 30000 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-start">
                            <span className="text-yellow-600 mr-2">📈</span>
                            <div>
                              <div className="text-sm font-medium text-yellow-800">Growth Opportunity</div>
                              <div className="text-xs text-yellow-600 mt-1">
                                Small surplus of {formatAmount(actualSurplus)}. Consider reducing expenses to increase goal allocations.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      {/* Goal-specific recommendations based on budget */}
                      {budgetData?.goalAllocations?.emergencyFund < 50000 && actualSurplus >= 10000 && (
                        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <div className="flex items-start">
                            <span className="text-orange-600 mr-2">🆘</span>
                            <div>
                              <div className="text-sm font-medium text-orange-800">Emergency Fund Priority</div>
                              <div className="text-xs text-orange-600 mt-1">
                                Current: {formatAmount(budgetData?.goalAllocations?.emergencyFund || 0)}. Target: KES 50,000.
                                Consider increasing allocation.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Persona Insights */}
                <div className="persona-insights">
                  <h4 className="font-medium text-gray-800 mb-3">
                    {persona} Insights
                  </h4>
                  <div 
                    className="p-4 rounded-lg text-sm"
                    style={{ 
                      backgroundColor: personaTheme?.secondary,
                      color: personaTheme?.primary 
                    }}
                  >
                    {getPersonaInsightText(persona, actualSurplus, budgetData)}
                  </div>
                </div>

              </div>
            )}

            {/* Analytics Panel */}
            {activeView === 'analytics' && (
              <div className="p-4 space-y-6">
                
                {/* Analytics Overview */}
                <div className="analytics-overview">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-800">Portfolio Analytics</h4>
                    <button
                      onClick={refreshAnalytics}
                      disabled={loadingAnalytics}
                      className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50"
                    >
                      {loadingAnalytics ? 'Loading...' : 'Refresh'}
                    </button>
                  </div>

                  {dashboardInsights && (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-200">
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-lg font-bold text-purple-600">
                            {dashboardInsights.insights?.total_goals || 0}
                          </div>
                          <div className="text-xs text-gray-600">Active Goals</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-green-600">
                            {dashboardInsights.insights?.overall_progress_percentage?.toFixed(1) || 0}%
                          </div>
                          <div className="text-xs text-gray-600">Overall Progress</div>
                        </div>
                      </div>
                      
                      {dashboardInsights.insights?.portfolio_health && (
                        <div className="text-center mb-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${
                            dashboardInsights.insights.portfolio_health === 'excellent' ? 'bg-green-100 text-green-800' :
                            dashboardInsights.insights.portfolio_health === 'on_track' ? 'bg-blue-100 text-blue-800' :
                            dashboardInsights.insights.portfolio_health === 'needs_attention' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {dashboardInsights.insights.portfolio_health.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Goal Analytics Cards */}
                <div className="goal-analytics-cards">
                  <h4 className="font-medium text-gray-800 mb-3">Goal Analytics</h4>
                  <div className="space-y-3">
                    {milestones?.slice(0, 3).map((milestone) => {
                      const analytics = goalAnalytics[milestone.id];
                      return (
                        <div
                          key={milestone.id}
                          className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setSelectedGoalForAnalytics(milestone.id)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className="text-lg mr-2">{getMilestoneIcon(milestone.category)}</span>
                              <div className="text-sm font-medium text-gray-800 truncate">
                                {milestone.title}
                              </div>
                            </div>
                            {analytics && (
                              <div className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                                Analytics
                              </div>
                            )}
                          </div>
                          
                          {analytics ? (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-gray-500">Success Rate:</span>
                                <div 
                                  className="font-semibold"
                                  style={{ 
                                    color: analytics.getRiskLevelColor(analytics.success_probability)
                                  }}
                                >
                                  {analytics.formatPercentage(analytics.success_probability)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-500">Progress:</span>
                                <div className="font-semibold text-blue-600">
                                  {analytics.current_progress?.progress_percentage?.toFixed(1) || 0}%
                                </div>
                              </div>
                              <div className="col-span-2">
                                <span className="text-gray-500">Current:</span>
                                <div className="font-semibold text-green-600">
                                  {analytics.formatCurrency(analytics.current_progress?.actual_amount || 0)}
                                </div>
                              </div>
                              {analytics.recommendations && analytics.recommendations.length > 0 && (
                                <div className="col-span-2 mt-1 p-2 bg-yellow-50 rounded text-xs text-yellow-800">
                                  💡 {analytics.recommendations[0]?.slice(0, 80)}...
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-xs text-gray-500">
                              {loadingAnalytics ? 'Loading analytics...' : 'Click to analyze'}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Alerts and Recommendations */}
                {dashboardInsights?.insights && (
                  <div className="insights-alerts">
                    <h4 className="font-medium text-gray-800 mb-3">Smart Insights</h4>
                    
                    {/* Alerts */}
                    {dashboardInsights.insights.alerts?.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {dashboardInsights.insights.alerts.map((alert, index) => (
                          <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start">
                              <span className="text-red-600 mr-2">⚠️</span>
                              <div className="text-sm text-red-800">{alert}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Opportunities */}
                    {dashboardInsights.insights.opportunities?.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {dashboardInsights.insights.opportunities.map((opportunity, index) => (
                          <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start">
                              <span className="text-green-600 mr-2">💡</span>
                              <div className="text-sm text-green-800">{opportunity}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Next Actions */}
                    {dashboardInsights.insights.next_actions?.length > 0 && (
                      <div>
                        <h5 className="font-medium text-gray-700 mb-2">Recommended Actions</h5>
                        <div className="space-y-2">
                          {dashboardInsights.insights.next_actions.map((action, index) => (
                            <div key={index} className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                              <div className="flex items-start">
                                <span className="text-blue-600 mr-2">🎯</span>
                                <div className="text-sm text-blue-800">{action}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Detailed Analytics Link */}
                {selectedGoalForAnalytics && (
                  <div className="detailed-analytics-link">
                    <button
                      onClick={() => setActiveView('overview')} // Could open full analytics modal
                      className="w-full p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Detailed Analytics for Selected Goal
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* Journey Panel */}
            {activeView === 'journey' && (
              <div className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-3 flex items-center">
                    🗺️ Financial Journey Analytics
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600">Journey Progress</div>
                      <div className="text-2xl font-bold text-blue-600">
                        {milestones?.length ? Math.round((milestones.filter(m => m.progress > 50).length / milestones.length) * 100) : 0}%
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="text-sm text-gray-600">Active Milestones</div>
                      <div className="text-2xl font-bold text-green-600">
                        {milestones?.length || 0}
                      </div>
                    </div>
                  </div>
                  
                  {/* Timeline Summary */}
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-semibold text-gray-800 mb-3">Upcoming Milestones</h5>
                    {milestones?.slice(0, 3).map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{getMilestoneIcon(milestone.category)}</span>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">{milestone.title}</div>
                            <div className="text-xs text-gray-500">Age {milestone.age}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          {milestone.target_amount && (
                            <div className="text-sm font-semibold text-green-600">
                              ${formatAmount(milestone.target_amount)}
                            </div>
                          )}
                          {milestone.progress !== undefined && (
                            <div className="text-xs text-gray-500">
                              {Math.round(milestone.progress)}% done
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {(!milestones || milestones.length === 0) && (
                      <div className="text-center py-4 text-gray-500">
                        <div className="text-2xl mb-2">🎯</div>
                        <p className="text-sm">Set your first financial milestone to begin tracking your journey.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Journey Insights */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h4 className="font-bold text-green-800 mb-3">💡 Journey Insights</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-sm font-medium text-gray-800">Financial Trajectory</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {alignmentScore >= 80 
                          ? "Excellent progress - you're on track for early goal achievement"
                          : alignmentScore >= 60
                          ? "Good momentum - consider optimizing key areas for better results"
                          : "Focus needed - review budget and goal priorities for better alignment"
                        }
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm">
                      <div className="text-sm font-medium text-gray-800">Next Priority Action</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {actualSurplus > 50000 
                          ? "Allocate surplus strategically across investment and emergency goals"
                          : actualSurplus > 0
                          ? "Build consistency in surplus generation and goal funding"
                          : "Optimize budget to create surplus for goal achievement"
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Alignment Panel */}
            {activeView === 'alignment' && (
              <AlignmentDashboard />
            )}

          </div>
        </div>

        {/* Mobile Panel Backdrop */}
        {showMobilePanel && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setShowMobilePanel(false)}
          />
        )}

        </div>
      </div>

      {/* Detailed Goal Analytics Modal */}
      {selectedGoalForAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Goal Analytics - {milestones?.find(m => m.id === selectedGoalForAnalytics)?.title}
                </h3>
                <p className="text-sm text-gray-600">Comprehensive predictive analysis and recommendations</p>
              </div>
              <button
                onClick={() => setSelectedGoalForAnalytics(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-0 overflow-y-auto max-h-[calc(90vh-80px)]">
              <GoalAnalyticsDashboard 
                goalId={selectedGoalForAnalytics}
                goalData={milestones?.find(m => m.id === selectedGoalForAnalytics)}
                onProgressUpdate={() => {
                  refreshAnalytics();
                  loadTimelineJourney();
                }}
                className="border-none shadow-none m-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper functions
const getPersonaInsightText = (persona, actualSurplus = 0, budgetData = null) => {
  const baseInsights = {
    'Jamal': 'Focus on building your investment foundation. Start with emergency funds and gradually increase your investment portfolio.',
    'Aisha': 'Balance your family goals with long-term planning. Education savings and family insurance are key priorities.',
    'Samuel': 'Optimize your path to retirement. Focus on wealth preservation and healthcare planning.'
  };
  
  // Budget-aware insights when budget data is available
  if (budgetData && actualSurplus !== undefined) {
    const budgetInsights = {
      'Jamal': actualSurplus >= 50000 
        ? `Excellent surplus of KES ${actualSurplus.toLocaleString()}! Allocate 60% to investments and 40% to emergency fund to accelerate your wealth building.`
        : actualSurplus >= 0
        ? `Good budget control with KES ${actualSurplus.toLocaleString()} surplus. Prioritize emergency fund completion before aggressive investing.`
        : 'Budget optimization needed. Consider reducing variable expenses and increasing investment allocation gradually.',
      'Aisha': actualSurplus >= 50000
        ? `Strong family budget with KES ${actualSurplus.toLocaleString()} surplus! Prioritize education fund and family insurance while maintaining emergency reserves.`
        : actualSurplus >= 0
        ? `Well-managed family finances with KES ${actualSurplus.toLocaleString()} available. Balance children's future needs with retirement planning.`
        : 'Family budget needs adjustment. Review childcare and household expenses while protecting essential family goals.',
      'Samuel': actualSurplus >= 50000
        ? `Excellent pre-retirement position with KES ${actualSurplus.toLocaleString()} surplus! Focus on wealth preservation and healthcare cost planning.`
        : actualSurplus >= 0
        ? `Good retirement preparation with KES ${actualSurplus.toLocaleString()} available. Consider increasing healthcare and long-term care allocations.`
        : 'Retirement budget requires optimization. Focus on reducing expenses while protecting healthcare and essential retirement needs.'
    };
    
    return budgetInsights[persona] || baseInsights[persona] || 'Build your financial timeline step by step with personalized milestones.';
  }
  
  return baseInsights[persona] || 'Build your financial timeline step by step with personalized milestones.';
};

// Calculate enhanced alignment score with budget factors
const calculateBudgetEnhancedAlignment = (baseAlignment, actualSurplus, budgetHealth) => {
  if (!baseAlignment) return baseAlignment;
  
  let budgetFactor = 1.0;
  
  // Positive surplus improves alignment
  if (actualSurplus > 0) {
    budgetFactor = 1.1; // 10% boost for positive surplus
  } else if (actualSurplus < 0) {
    budgetFactor = 0.9; // 10% penalty for deficit
  }
  
  // Budget health affects alignment
  if (budgetHealth === 'healthy') {
    budgetFactor *= 1.05; // Additional 5% for healthy budget
  }
  
  return Math.min(100, Math.round(baseAlignment * budgetFactor));
};

export default TimelineDashboard;
