/**
 * Mobile Timeline Indicators - Contextual timeline elements for mobile interfaces
 * Provides compact timeline intelligence for mobile-first design
 */
import React from 'react';
import { useTimeline } from '../../contexts/TimelineContext';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';
import { formatCurrency } from '../../utils/formatters';

// MOBILE PHASE BADGE - Ultra compact phase indicator for mobile navigation
export const MobilePhaseIndicator = ({ className = '' }) => {
  const { currentPhase, currentAge } = useTimeline();
  
  const phaseEmojis = {
    'Accumulation': '📈',
    'Consolidation': '⚖️',
    'Spending/Gifting': '🏖️'
  };

  const phaseColors = {
    'Accumulation': 'bg-green-100 text-green-700',
    'Consolidation': 'bg-orange-100 text-orange-700',
    'Spending/Gifting': 'bg-purple-100 text-purple-700'
  };

  return (
    <div className={`mobile-phase-indicator inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${phaseColors[currentPhase] || phaseColors['Accumulation']} ${className}`}>
      <span className="mr-1">{phaseEmojis[currentPhase] || '📈'}</span>
      <span>{currentPhase?.split('/')[0] || 'Accumulation'}</span>
    </div>
  );
};

// TIMELINE STATUS BADGE - Shows alignment status with color coding
export const TimelineStatusBadge = ({ showPercentage = true, size = 'small', className = '' }) => {
  const { alignmentScore } = useTimeline();
  const { selectNetCashFlow } = useUnifiedFinancialContext();
  const actualSurplus = typeof selectNetCashFlow === 'function' ? selectNetCashFlow() : 0;
  
  const getStatusConfig = () => {
    if (actualSurplus < 0) {
      return {
        color: 'bg-red-100 text-red-700',
        icon: '⚠️',
        label: 'At Risk',
        priority: 'high'
      };
    }
    
    if (alignmentScore >= 80) {
      return {
        color: 'bg-green-100 text-green-700',
        icon: '✅',
        label: 'On Track',
        priority: 'good'
      };
    }
    
    if (alignmentScore >= 60) {
      return {
        color: 'bg-yellow-100 text-yellow-700',
        icon: '⚡',
        label: 'Adjusting',
        priority: 'medium'
      };
    }
    
    return {
      color: 'bg-orange-100 text-orange-700',
      icon: '🎯',
      label: 'Optimizing',
      priority: 'medium'
    };
  };

  const config = getStatusConfig();
  const sizeClasses = size === 'small' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm';
  
  return (
    <div className={`timeline-status-badge inline-flex items-center rounded-full font-medium ${config.color} ${sizeClasses} ${className}`}>
      <span className="mr-1">{config.icon}</span>
      <span>{config.label}</span>
      {showPercentage && alignmentScore && (
        <span className="ml-1">({Math.round(alignmentScore)}%)</span>
      )}
    </div>
  );
};

// MOBILE MILESTONE PROGRESS - Horizontal progress indicator for mobile
export const MobileMilestoneProgress = ({ className = '' }) => {
  const { milestones, currentAge, nextMilestone } = useTimeline();
  
  const completedCount = milestones?.filter(m => m.progress >= 100).length || 0;
  const totalCount = milestones?.length || 0;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  
  return (
    <div className={`mobile-milestone-progress ${className}`}>
      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
        <span>Milestones</span>
        <span>{completedCount}/{totalCount}</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      
      {nextMilestone && (
        <div className="text-xs text-blue-600 mt-1">
          Next: {nextMilestone.title} ({nextMilestone.age - currentAge}yr)
        </div>
      )}
    </div>
  );
};

// SURPLUS STATUS INDICATOR - Shows budget surplus/deficit status
export const SurplusStatusIndicator = ({ compact = true, className = '' }) => {
  const { selectNetCashFlow } = useUnifiedFinancialContext();
  const actualSurplus = typeof selectNetCashFlow === 'function' ? selectNetCashFlow() : 0;
  
  if (actualSurplus === undefined) return null;
  
  const isPositive = actualSurplus >= 0;
  const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
  const bgClass = isPositive ? 'bg-green-50' : 'bg-red-50';
  const icon = isPositive ? '💰' : '⚠️';
  
  if (compact) {
    return (
      <div className={`surplus-status-indicator inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${bgClass} ${colorClass} ${className}`}>
        <span className="mr-1">{icon}</span>
        <span>{isPositive ? '+' : ''}{formatCurrency(actualSurplus)}</span>
      </div>
    );
  }
  
  return (
    <div className={`surplus-status-indicator flex items-center space-x-2 ${className}`}>
      <span className="text-lg">{icon}</span>
      <div>
        <div className={`font-semibold ${colorClass}`}>
          {isPositive ? '+' : ''}{formatCurrency(actualSurplus)}
        </div>
        <div className="text-xs text-gray-500">
          {isPositive ? 'Available' : 'Deficit'}
        </div>
      </div>
    </div>
  );
};

// CONTEXTUAL TIMELINE PILL - Small contextual guidance for any interface
export const ContextualTimelinePill = ({ context, className = '' }) => {
  const { currentPhase, currentAge } = useTimeline();
  const { selectNetCashFlow } = useUnifiedFinancialContext();
  const actualSurplus = typeof selectNetCashFlow === 'function' ? selectNetCashFlow() : 0;
  
  const getContextMessage = () => {
    if (context === 'budget') {
      if (currentPhase === 'Accumulation') {
        return actualSurplus >= 0 
          ? "Accumulation: Prioritize growth investments"
          : "Accumulation: Create surplus for wealth building";
      }
      if (currentPhase === 'Consolidation') {
        return "Consolidation: Balance growth & stability";
      }
      return "Focus on preservation & withdrawal strategy";
    }
    
    if (context === 'goals') {
      return `Age ${currentAge} ${currentPhase}: Emergency fund 3-6 months`;
    }
    
    return `${currentPhase} guidance`;
  };

  return (
    <div className={`contextual-timeline-pill bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-medium inline-flex items-center ${className}`}>
      <span className="mr-1">💡</span>
      <span>{getContextMessage()}</span>
    </div>
  );
};

// MOBILE ALERT BANNER - Compact alert for mobile interfaces
export const MobileTimelineAlert = ({ dismissible = true, className = '' }) => {
  const { alignmentScore, currentPhase } = useTimeline();
  const { selectNetCashFlow } = useUnifiedFinancialContext();
  const actualSurplus = typeof selectNetCashFlow === 'function' ? selectNetCashFlow() : 0;
  
  // Only show critical alerts on mobile
  const getAlert = () => {
    if (actualSurplus < 0) {
      return {
        type: 'error',
        icon: '⚠️',
        message: `Budget deficit threatens ${currentPhase} goals`,
        action: 'Fix Budget'
      };
    }
    
    if (actualSurplus >= 100000) {
      return {
        type: 'success', 
        icon: '🚀',
        message: `Surplus available for goal acceleration`,
        action: 'Allocate'
      };
    }
    
    if (alignmentScore < 50) {
      return {
        type: 'warning',
        icon: '📋',
        message: `Timeline alignment needs attention`,
        action: 'Review'
      };
    }
    
    return null;
  };

  const alert = getAlert();
  if (!alert) return null;
  
  const alertStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800', 
    success: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <div className={`mobile-timeline-alert border rounded-lg p-3 ${alertStyles[alert.type]} ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{alert.icon}</span>
          <span className="text-sm font-medium">{alert.message}</span>
        </div>
        <div className="flex items-center space-x-2">
          <button className="text-xs underline font-medium">
            {alert.action}
          </button>
          {dismissible && (
            <button className="text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// COMPACT DASHBOARD WIDGET - All-in-one mobile dashboard summary
export const CompactTimelineDashboard = ({ className = '' }) => {
  const { currentPhase, currentAge, alignmentScore, nextMilestone } = useTimeline();
  const { selectNetCashFlow } = useUnifiedFinancialContext();
  const actualSurplus = typeof selectNetCashFlow === 'function' ? selectNetCashFlow() : 0;
  
  return (
    <div className={`compact-timeline-dashboard bg-white rounded-xl border border-gray-200 p-4 ${className}`}>
      
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3">
        <MobilePhaseIndicator />
        <TimelineStatusBadge showPercentage={false} />
      </div>
      
      {/* Metrics Row */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">
            {Math.round(alignmentScore || 0)}%
          </div>
          <div className="text-xs text-gray-500">Aligned</div>
        </div>
        
        <div className="text-center">
          <div className={`text-lg font-bold ${actualSurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(actualSurplus || 0)}
          </div>
          <div className="text-xs text-gray-500">Surplus</div>
        </div>
        
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">
            {nextMilestone ? `${nextMilestone.age - currentAge}yr` : '--'}
          </div>
          <div className="text-xs text-gray-500">Next Goal</div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <MobileMilestoneProgress className="mb-3" />
      
      {/* Contextual Guidance */}
      <ContextualTimelinePill context="budget" />
      
    </div>
  );
};
