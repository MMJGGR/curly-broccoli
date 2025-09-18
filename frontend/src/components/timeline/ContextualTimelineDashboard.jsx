/**
 * Contextual Timeline Dashboard - Redesigned timeline-first dashboard
 * Focuses on contextual timeline integration rather than massive timeline visualization
 * Emphasizes actionable insights and phase-appropriate guidance
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTimeline } from '../../contexts/TimelineContext';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { 
  LifecyclePhaseIndicator, 
  ContextualGuidance, 
  TimelineProgressWidget, 
  TimelineAlert,
  MilestoneStatusBar,
  usePhaseDefaults
} from './ContextualTimelineSystem';

const ContextualTimelineDashboard = () => {
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
    isTimelineReady,
    loadTimelineJourney,
  } = useTimeline();

  const {
    expenses,
    incomes = [],
    loading: budgetLoading,
    selectNetCashFlow,
    selectBudgetSummary,
    selectSurplusAfterGoals,
    selectGoalAllocationsTotal,
    fetchBudgetCategories,
    budgetCategories = [],
    planningStartDate,
    setPlanningStartDate
  } = useUnifiedFinancialContext();

  // Calculate derived values from unified context
  const budget = selectBudgetSummary ? selectBudgetSummary() : null;
  const actualSurplus = selectNetCashFlow ? selectNetCashFlow() : 0;
  const afterGoalsSurplus = selectSurplusAfterGoals ? selectSurplusAfterGoals() : actualSurplus;
  const goalAllocationsTotal = selectGoalAllocationsTotal ? selectGoalAllocationsTotal() : 0;
  const totalIncome = budget?.total_budgeted ?? (Array.isArray(incomes)
    ? incomes.reduce((sum, inc) => sum + (inc.monthly_amount || inc.amount || 0), 0)
    : (incomes?.total_monthly_income || 0));
  const totalExpenses = budget?.total_spent ?? (expenses?.reduce((sum, expense) => sum + (expense.monthly_equivalent || 0), 0) || 0);
  const formatAmount = (amount) => `KES ${Math.round(amount).toLocaleString()}`;
  const isBudgetReady = !budgetLoading?.global && Array.isArray(expenses) && (Array.isArray(incomes) ? incomes.length >= 0 : true);

  // Mock budgetData structure for compatibility
  const budgetData = {
    monthlyIncome: totalIncome,
    expenses: expenses?.reduce((acc, expense) => {
      const category = expense.expense_category || 'miscellaneous';
      acc[category] = (acc[category] || 0) + (expense.monthly_equivalent || 0);
      return acc;
    }, {}) || {},
    goalAllocations: {
      emergencyFund: 0,
      retirement: 0,
      education: 0,
      investments: 0
    }
  };

  const [activeView, setActiveView] = useState('insights');
  const navigate = useNavigate();
  const phaseDefaults = usePhaseDefaults();

  // Refresh data on mount
  useEffect(() => {
    if (!isTimelineReady) {
      loadTimelineJourney();
    }
    // Ensure budget categories (for goal allocations) are present
    try {
      if ((budgetCategories || []).length === 0 && fetchBudgetCategories) {
        fetchBudgetCategories();
      }
    } catch {}
  }, [isTimelineReady, loadTimelineJourney]);

  // Loading state
  if (loading || budgetLoading?.global) {
    return (
      <div className="contextual-timeline-dashboard h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="w-16 h-16 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Dashboard...</h2>
          <p className="text-gray-600">Preparing your personalized financial insights</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="contextual-timeline-dashboard h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-100">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Unavailable</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="contextual-timeline-dashboard flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100" style={{ height: 'calc(100vh - 4rem)' }}>
      
      {/* Header - Compact with phase context */}
      <div 
        className="dashboard-header p-4 bg-white shadow-sm border-b border-gray-200 mx-4 mt-4 rounded-t-xl"
        style={{ 
          background: `linear-gradient(135deg, ${personaTheme?.secondary || '#f8fafc'} 0%, white 100%)`,
        }}
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                {personaWelcome || `Financial Dashboard`}
              </h1>
              <LifecyclePhaseIndicator size="medium" showDetails={true} />
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <span>Age {currentAge}</span>
              {persona && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" 
                  style={{ 
                    backgroundColor: `${personaTheme?.primary}20`,
                    color: personaTheme?.primary
                  }}>
                  {persona} Profile
                </span>
              )}
              <span>Alignment: {alignmentScore ? Math.round(alignmentScore) : '--'}%</span>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => setActiveView('insights')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'insights' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              💡 Insights
            </button>
            <button
              onClick={() => setActiveView('milestones')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeView === 'milestones' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🎯 Milestones
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Grid Layout */}
      <div className="dashboard-content flex-1 overflow-hidden mx-4 mb-4">
        <div className="h-full bg-white rounded-b-xl shadow-xl p-6">
          
          {/* Alert Banner */}
          <TimelineAlert className="mb-6" />
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
            
            {/* Left Column - Primary Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Insights View */}
              {activeView === 'insights' && (
                <>
                  {/* Key Metrics Row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-green-800">Monthly Surplus</div>
                          <div className="text-2xl font-bold text-green-600 mt-1">
                            {formatAmount(actualSurplus || 0)}
                          </div>
                        </div>
                        <div className="text-3xl">💰</div>
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-emerald-800">After Goals Surplus</div>
                          <div className={`text-2xl font-bold ${afterGoalsSurplus >= 0 ? 'text-emerald-600' : 'text-orange-600'} mt-1`}>
                            {formatAmount(afterGoalsSurplus || 0)}
                          </div>
                          <div className="text-[11px] text-gray-600 mt-1">Goals allocations: {formatAmount(goalAllocationsTotal || 0)}</div>
                        </div>
                        <div className="text-3xl">🎯</div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-blue-800">Timeline Progress</div>
                          <div className="text-2xl font-bold text-blue-600 mt-1">
                            {Math.round(alignmentScore || 0)}%
                          </div>
                        </div>
                        <div className="text-3xl">📊</div>
                      </div>
                    </div>
                    {/* Planning start month control */}
                    <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-4 border border-gray-200">
                      <div className="text-sm font-medium text-gray-800 mb-1">Planning Start</div>
                      <div className="flex items-center gap-2">
                        <input
                          type="month"
                          value={(planningStartDate || '').slice(0,7)}
                          onChange={(e) => setPlanningStartDate(e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        />
                      </div>
                      <div className="text-[11px] text-gray-500 mt-1">Base month for schedules and labels</div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-purple-800">Next Milestone</div>
                          <div className="text-lg font-bold text-purple-600 mt-1">
                            {nextMilestone ? nextMilestoneDistance : 'Not set'}
                          </div>
                        </div>
                        <div className="text-3xl">🎯</div>
                      </div>
                    </div>
                  </div>

                  {/* Contextual Guidance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ContextualGuidance context="budget-dashboard" />
                    <ContextualGuidance context="goal-setting" />
                  </div>

                  {/* Phase-specific insights */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">🎯</span>
                      {currentPhase} Phase Strategy
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Recommended Savings Rate</span>
                          <span className="font-semibold text-blue-600">
                            {Math.round(phaseDefaults.recommendedSavingsRate * 100)}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Emergency Fund Target</span>
                          <span className="font-semibold text-green-600">
                            {phaseDefaults.emergencyFundMonths} months
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Growth Assets</span>
                          <span className="font-semibold text-orange-600">
                            {phaseDefaults.assetAllocation.equity}%
                          </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-600">Stability Assets</span>
                          <span className="font-semibold text-gray-600">
                            {phaseDefaults.assetAllocation.bonds}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {/* Milestones View */}
              {activeView === 'milestones' && (
                <>
                  <MilestoneStatusBar maxMilestones={5} className="mb-6" />
                  
                  {/* Detailed milestone cards */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">All Milestones</h3>
                    {milestones?.length > 0 ? (
                      <div className="space-y-3">
                        {milestones.slice(0, 6).map((milestone, index) => (
                          <div key={milestone.id || index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="text-2xl">{getMilestoneIcon(milestone.category)}</div>
                                <div>
                                  <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                                  <div className="text-sm text-gray-600">Age {milestone.age} • {milestone.age - currentAge} years away</div>
                                </div>
                              </div>
                              <div className="text-right">
                                {milestone.target_amount && (
                                  <div className="font-semibold text-green-600">
                                    {formatAmount(milestone.target_amount)}
                                  </div>
                                )}
                                {milestone.progress !== undefined && (
                                  <div className="text-sm text-gray-500">
                                    {Math.round(milestone.progress)}% complete
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {milestone.progress !== undefined && (
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full bg-blue-500"
                                    style={{ width: `${milestone.progress}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <div className="text-4xl mb-4">🎯</div>
                        <p>No milestones set yet</p>
                        <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Set Your First Goal
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Right Column - Timeline Progress & Quick Actions */}
            <div className="space-y-6">
              
              {/* Timeline Progress Widget */}
              <TimelineProgressWidget showDetails={true} orientation="vertical" />

              {/* Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-800 mb-3">Quick Actions</h4>
                <div className="space-y-2">
                  
                  {/* Budget-specific actions */}
                  {isBudgetReady && (
                    <button
                      onClick={() => navigate('../budget')}
                      className="w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-200"
                    >
                      <div className="font-medium text-blue-800">📊 Review Budget</div>
                      <div className="text-sm text-blue-600">
                        {actualSurplus >= 0 ? 'Optimize surplus allocation' : 'Adjust spending plan'}
                      </div>
                    </button>
                  )}

                  <button
                    onClick={() => navigate('../budget')}
                    className="w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors border border-green-200"
                  >
                    <div className="font-medium text-green-800">🎯 Set New Goal</div>
                    <div className="text-sm text-green-600">Add financial milestone</div>
                  </button>

                  <button
                    onClick={() => navigate('../profile')}
                    className="w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors border border-purple-200"
                  >
                    <div className="font-medium text-purple-800">⚙️ Update Profile</div>
                    <div className="text-sm text-purple-600">Adjust timeline parameters</div>
                  </button>
                </div>
              </div>

              {/* Persona Insights */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="font-medium text-gray-800 mb-3">{persona} Insights</h4>
                <div 
                  className="p-3 rounded-lg text-sm"
                  style={{ 
                    backgroundColor: personaTheme?.secondary,
                    color: personaTheme?.primary 
                  }}
                >
                  {getPersonaInsightText(persona, actualSurplus, budgetData, currentPhase)}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
const getMilestoneIcon = (category) => {
  const icons = {
    emergency: '🛡️',
    investment: '📈',
    education: '🎓',
    housing: '🏠',
    retirement: '🏖️',
    healthcare: '⚕️',
    general: '🎯'
  };
  return icons[category] || icons.general;
};

const getPersonaInsightText = (persona, actualSurplus = 0, budgetData = null, currentPhase = '') => {
  const insights = {
    'Jamal': {
      'Accumulation': actualSurplus >= 50000 
        ? `Excellent! Your surplus enables aggressive wealth building. Consider 80% equity allocation and maxing out retirement contributions.`
        : `Focus on increasing surplus to accelerate accumulation. Target 20% savings rate for optimal growth trajectory.`,
      'Consolidation': `Balance growth and stability. Your portfolio should shift toward more conservative allocations while maintaining growth exposure.`,
      'Spending/Gifting': `Focus on wealth preservation and sustainable withdrawal strategies. Consider tax-efficient distribution methods.`
    },
    'Aisha': {
      'Accumulation': `Balance family needs with wealth building. Prioritize emergency fund and education savings while building retirement assets.`,
      'Consolidation': `Optimize family financial security. Review insurance coverage and education funding while preparing for retirement.`,
      'Spending/Gifting': `Plan sustainable family support and legacy distribution. Consider tax-efficient gifting strategies.`
    },
    'Samuel': {
      'Accumulation': `Focus on aggressive accumulation strategies. High income years are critical for retirement preparation.`,
      'Consolidation': `Begin de-risking portfolio while maintaining growth. Plan for healthcare costs and longevity risk.`,
      'Spending/Gifting': `Execute planned withdrawal strategy. Monitor healthcare costs and maintain purchasing power protection.`
    }
  };
  
  return insights[persona]?.[currentPhase] || `Continue building your financial timeline step by step with personalized milestones.`;
};

export default ContextualTimelineDashboard;
