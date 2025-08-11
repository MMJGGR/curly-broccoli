/**
 * Contextual Timeline System - Core components for timeline integration throughout the app
 * Replaces large timeline visualization with contextual, space-efficient timeline intelligence
 */
import React from 'react';
import { useTimeline } from '../../contexts/TimelineContext';
import { useBudget } from '../../contexts/BudgetContext';

// 1. CFA LIFECYCLE PHASE INDICATOR
// Universal component showing current financial phase with contextual styling
export const LifecyclePhaseIndicator = ({ 
  size = 'medium', 
  showDetails = true, 
  contextualGuidance = false,
  className = '' 
}) => {
  const { currentPhase, currentAge } = useTimeline();
  
  const phaseConfig = {
    'Accumulation': {
      icon: '📈',
      color: '#16a34a',
      bgColor: '#f0fdf4',
      description: 'Building wealth & assets',
      guidance: 'Focus on growth investments and emergency fund'
    },
    'Consolidation': {
      icon: '🎯',
      color: '#ea580c',
      bgColor: '#fff7ed',
      description: 'Optimizing & stabilizing',
      guidance: 'Balance risk and prepare for next phase'
    },
    'Spending/Gifting': {
      icon: '🏖️',
      color: '#7c3aed',
      bgColor: '#faf5ff',
      description: 'Wealth distribution phase',
      guidance: 'Focus on preservation and withdrawal strategy'
    }
  };

  const config = phaseConfig[currentPhase] || phaseConfig['Accumulation'];
  
  const sizeClasses = {
    small: 'text-xs px-2 py-1',
    medium: 'text-sm px-3 py-2',
    large: 'text-base px-4 py-3'
  };

  return (
    <div className={`lifecycle-phase-indicator ${className}`}>
      <div 
        className={`inline-flex items-center rounded-full border ${sizeClasses[size]} font-medium transition-all hover:shadow-md`}
        style={{ 
          backgroundColor: config.bgColor,
          borderColor: config.color,
          color: config.color 
        }}
      >
        <span className="mr-2">{config.icon}</span>
        <span className="font-semibold">{currentPhase}</span>
        {showDetails && size !== 'small' && (
          <span className="ml-2 text-xs opacity-75">• Age {currentAge}</span>
        )}
      </div>
      
      {contextualGuidance && (
        <div className="mt-2 text-xs text-gray-600 max-w-xs">
          {config.guidance}
        </div>
      )}
    </div>
  );
};

// 2. CONTEXTUAL TIMELINE GUIDANCE WIDGET
// Small, contextual elements that appear throughout the app with relevant guidance
export const ContextualGuidance = ({ context, className = '' }) => {
  const { currentPhase, currentAge } = useTimeline();
  const { actualSurplus } = useBudget();
  
  const getContextualMessage = () => {
    const messages = {
      'budget-dashboard': {
        'Accumulation': actualSurplus >= 0 
          ? `You're in accumulation phase - prioritize 70% growth investments, 30% emergency fund`
          : `Accumulation phase requires surplus - optimize expenses to enable wealth building`,
        'Consolidation': actualSurplus >= 0
          ? `Consolidation phase - balance growth (50%) and stability (50%) investments`
          : `Consolidation phase - review asset allocation while maintaining spending`,
        'Spending/Gifting': actualSurplus >= 0
          ? `Spending phase - focus on capital preservation and sustainable withdrawal`
          : `Spending phase - ensure withdrawal rates align with portfolio sustainability`
      },
      'goal-setting': {
        'Accumulation': `At age ${currentAge}, emergency fund should be 3-6 months expenses vs 12 months for later phases`,
        'Consolidation': `At age ${currentAge}, emergency fund should be 6-12 months for stability`,
        'Spending/Gifting': `At age ${currentAge}, maintain 12+ months liquid reserves for flexibility`
      },
      'investment-decisions': {
        'Accumulation': `Age ${currentAge}, accumulation phase: Consider 80/20 equity/bond allocation for growth`,
        'Consolidation': `Age ${currentAge}, consolidation phase: Consider 60/40 equity/bond allocation for balance`,
        'Spending/Gifting': `Age ${currentAge}, spending phase: Consider 40/60 equity/bond allocation for stability`
      }
    };
    
    return messages[context]?.[currentPhase] || `${currentPhase} phase guidance for ${context}`;
  };

  const getIconForContext = () => {
    const icons = {
      'budget-dashboard': '💰',
      'goal-setting': '🎯',
      'investment-decisions': '📊'
    };
    return icons[context] || '💡';
  };

  return (
    <div className={`contextual-guidance bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="text-blue-600 text-lg">
          {getIconForContext()}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-blue-800 mb-1">
            {currentPhase} Phase Guidance
          </div>
          <div className="text-sm text-blue-700">
            {getContextualMessage()}
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. PROGRESS TRACKING WIDGET
// Compact progress indicators showing timeline alignment without taking much space
export const TimelineProgressWidget = ({ 
  showDetails = false, 
  orientation = 'horizontal',
  className = '' 
}) => {
  const { alignmentScore, nextMilestone, nextMilestoneDistance, milestones } = useTimeline();
  const { actualSurplus } = useBudget();
  
  const completedMilestones = milestones?.filter(m => m.progress >= 100).length || 0;
  const totalMilestones = milestones?.length || 0;
  // const progressPercentage = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
  
  const getStatusColor = () => {
    if (alignmentScore >= 80) return '#16a34a'; // Green
    if (alignmentScore >= 60) return '#ea580c'; // Orange  
    return '#dc2626'; // Red
  };

  const getStatusMessage = () => {
    if (alignmentScore >= 80) return 'On track for timeline goals';
    if (alignmentScore >= 60) return 'Good progress, minor adjustments needed';
    return 'Timeline optimization recommended';
  };

  if (orientation === 'vertical') {
    return (
      <div className={`timeline-progress-widget bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        <div className="text-center">
          <div 
            className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: getStatusColor() }}
          >
            {Math.round(alignmentScore || 0)}%
          </div>
          <div className="text-sm font-medium text-gray-800 mb-1">Timeline Alignment</div>
          {showDetails && (
            <div className="space-y-2">
              <div className="text-xs text-gray-600">{getStatusMessage()}</div>
              <div className="text-xs text-gray-500">
                {completedMilestones}/{totalMilestones} milestones completed
              </div>
              {nextMilestone && (
                <div className="text-xs text-blue-600 font-medium">
                  Next: {nextMilestone.title} ({nextMilestoneDistance})
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`timeline-progress-widget bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium text-gray-800">Timeline Progress</div>
        <div 
          className="text-lg font-bold"
          style={{ color: getStatusColor() }}
        >
          {Math.round(alignmentScore || 0)}%
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            backgroundColor: getStatusColor(),
            width: `${alignmentScore || 0}%`
          }}
        />
      </div>
      
      {showDetails && (
        <div className="space-y-1">
          <div className="text-xs text-gray-600">{getStatusMessage()}</div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">
              {completedMilestones}/{totalMilestones} milestones
            </span>
            {actualSurplus !== undefined && (
              <span className={actualSurplus >= 0 ? 'text-green-600' : 'text-red-600'}>
                {actualSurplus >= 0 ? '+Budget aligned' : 'Budget impact'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 4. TIMELINE-AWARE ALERT SYSTEM
// Smart notifications that appear contextually based on timeline and budget status
export const TimelineAlert = ({ type = 'info', dismissible = true, className = '' }) => {
  const { currentPhase, alignmentScore, nextMilestone } = useTimeline();
  const { actualSurplus } = useBudget();
  // const budgetHealth = actualSurplus >= 0 ? 'healthy' : 'deficit';
  
  const getAlert = () => {
    // Critical alerts (budget issues affecting timeline)
    if (actualSurplus < 0) {
      return {
        type: 'error',
        icon: '⚠️',
        title: 'Timeline at Risk',
        message: `Monthly deficit of ${Math.abs(actualSurplus).toLocaleString()} KES threatens ${currentPhase} phase goals. Review budget immediately.`,
        action: 'Optimize Budget',
        priority: 'high'
      };
    }
    
    // Opportunity alerts (surplus available for timeline acceleration)
    if (actualSurplus >= 100000) {
      return {
        type: 'success',
        icon: '🚀',
        title: 'Timeline Acceleration Available',
        message: `Surplus of ${actualSurplus.toLocaleString()} KES could accelerate ${nextMilestone?.title || 'next goal'} by ${Math.round(actualSurplus / 50000)} months.`,
        action: 'Allocate Surplus',
        priority: 'medium'
      };
    }
    
    // Phase-specific guidance alerts
    if (alignmentScore < 60) {
      return {
        type: 'warning',
        icon: '📋',
        title: `${currentPhase} Phase Optimization`,
        message: `Current alignment score of ${Math.round(alignmentScore)}% suggests timeline adjustments needed for optimal progress.`,
        action: 'Review Timeline',
        priority: 'medium'
      };
    }
    
    return null;
  };

  const alert = getAlert();
  if (!alert) return null;
  
  const alertStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  return (
    <div className={`timeline-alert border rounded-lg p-4 ${alertStyles[alert.type]} ${className}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-lg">{alert.icon}</div>
          <div className="flex-1">
            <div className="font-medium text-sm mb-1">{alert.title}</div>
            <div className="text-sm opacity-90">{alert.message}</div>
            {alert.action && (
              <button className="mt-2 text-sm underline hover:no-underline font-medium">
                {alert.action} →
              </button>
            )}
          </div>
        </div>
        {dismissible && (
          <button className="text-gray-400 hover:text-gray-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// 5. COMPACT MILESTONE STATUS BAR
// Horizontal bar showing upcoming milestones without taking much vertical space
export const MilestoneStatusBar = ({ maxMilestones = 3, className = '' }) => {
  const { milestones, currentAge } = useTimeline();
  
  const upcomingMilestones = milestones
    ?.filter(m => m.age >= currentAge)
    .sort((a, b) => a.age - b.age)
    .slice(0, maxMilestones) || [];

  if (upcomingMilestones.length === 0) {
    return (
      <div className={`milestone-status-bar bg-gray-50 rounded-lg p-3 text-center ${className}`}>
        <div className="text-sm text-gray-500">No upcoming milestones set</div>
      </div>
    );
  }

  return (
    <div className={`milestone-status-bar bg-white rounded-lg border border-gray-200 p-3 ${className}`}>
      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>Upcoming Milestones</span>
        <span>{upcomingMilestones.length} active</span>
      </div>
      
      <div className="space-y-2">
        {upcomingMilestones.map((milestone, index) => (
          <div key={milestone.id || index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div>
                <span className="text-sm font-medium text-gray-800">{milestone.title}</span>
                <span className="text-xs text-gray-500 ml-2">Age {milestone.age}</span>
              </div>
            </div>
            <div className="text-right">
              {milestone.target_amount && (
                <div className="text-sm font-medium text-green-600">
                  {(milestone.target_amount / 1000).toFixed(0)}K
                </div>
              )}
              <div className="text-xs text-gray-500">
                {milestone.age - currentAge} years
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 6. PHASE-APPROPRIATE DEFAULTS PROVIDER
// Hook that provides smart defaults based on lifecycle phase
export const usePhaseDefaults = () => {
  const { currentPhase, currentAge } = useTimeline();
  
  const getEmergencyFundMonths = () => {
    switch (currentPhase) {
      case 'Accumulation': return currentAge < 30 ? 3 : 6;
      case 'Consolidation': return 9;
      case 'Spending/Gifting': return 12;
      default: return 6;
    }
  };

  const getAssetAllocation = () => {
    switch (currentPhase) {
      case 'Accumulation': return { equity: 80, bonds: 20 };
      case 'Consolidation': return { equity: 60, bonds: 40 };
      case 'Spending/Gifting': return { equity: 40, bonds: 60 };
      default: return { equity: 70, bonds: 30 };
    }
  };

  const getSavingsRate = () => {
    switch (currentPhase) {
      case 'Accumulation': return currentAge < 30 ? 0.20 : 0.15;
      case 'Consolidation': return 0.10;
      case 'Spending/Gifting': return 0.05;
      default: return 0.15;
    }
  };

  return {
    emergencyFundMonths: getEmergencyFundMonths(),
    assetAllocation: getAssetAllocation(),
    recommendedSavingsRate: getSavingsRate(),
    currentPhase,
    currentAge
  };
};