/**
 * Contextual Timeline System - Component Exports
 * Professional-grade contextual financial intelligence components
 */

// Core contextual timeline components
export { default as LifecyclePhaseIndicator } from './LifecyclePhaseIndicator';
export { default as ContextualGuidanceWidget } from './ContextualGuidanceWidget';
export { default as TimelineStatusBadge } from './TimelineStatusBadge';
export { default as ContextualTimelineDashboard } from './ContextualTimelineDashboard';

// Utility services
export { default as phaseAppropriateDefaults } from './PhaseAppropriateDefaults';

// Hooks and services (re-exports for convenience)
export { default as useLifecyclePhase, LIFECYCLE_PHASES } from '../../hooks/useLifecyclePhase';
export { default as cfaGuidanceService } from '../../services/cfaGuidance';

// Component configuration constants
export const CONTEXTUAL_COMPONENTS_CONFIG = {
  PHASE_INDICATOR: {
    sizes: ['small', 'default', 'large'],
    positions: ['header', 'sidebar', 'mobile', 'inline'],
    showDetails: true,
    showGuidance: true
  },
  GUIDANCE_WIDGET: {
    contexts: [
      'budget_planning',
      'investment_allocation', 
      'goal_setting',
      'risk_management',
      'emergency_fund',
      'retirement_planning',
      'debt_management',
      'tax_optimization'
    ],
    triggers: ['manual', 'automatic', 'decision_point'],
    maxRecommendations: 6
  },
  STATUS_BADGE: {
    sizes: ['small', 'default', 'large'],
    positions: ['bottom', 'top', 'left', 'right'],
    showPercentage: true,
    showDetails: true,
    animated: true
  }
};

// Helper functions for integration
export const contextualHelpers = {
  /**
   * Determine if contextual guidance should be shown automatically
   * @param {Object} userProfile - User's financial profile
   * @param {Object} budgetData - Current budget data
   * @returns {string|null} Context to show or null
   */
  getAutoGuidanceContext: (userProfile, budgetData) => {
    const { actualSurplus } = budgetData || {};
    
    // High surplus - show investment guidance
    if (actualSurplus > 50000) return 'investment_allocation';
    
    // Deficit - show budget planning
    if (actualSurplus < 0) return 'budget_planning';
    
    // No emergency fund - show emergency fund guidance
    if (!budgetData?.currentAssets?.emergency_fund) return 'emergency_fund';
    
    // No goals - show goal setting
    if (!userProfile?.goals || userProfile.goals.length === 0) return 'goal_setting';
    
    return null;
  },

  /**
   * Get contextual priorities based on lifecycle phase and financial status
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {Object} financialStatus - Current financial status
   * @returns {Array} Priority actions
   */
  getContextualPriorities: (lifecyclePhase, financialStatus) => {
    const { surplus, emergencyFund, goals } = financialStatus;
    const priorities = [];

    // Cash flow priority
    if (surplus < 0) {
      priorities.push({
        context: 'budget_planning',
        priority: 'critical',
        title: 'Address Budget Deficit',
        description: 'Negative cash flow threatens financial stability'
      });
    }

    // Emergency fund priority
    if (!emergencyFund || emergencyFund < 50000) {
      priorities.push({
        context: 'emergency_fund',
        priority: lifecyclePhase === 'Accumulation' ? 'high' : 'critical',
        title: 'Build Emergency Fund',
        description: 'Establish financial safety net'
      });
    }

    // Investment optimization
    if (surplus > 30000) {
      priorities.push({
        context: 'investment_allocation',
        priority: 'medium',
        title: 'Optimize Surplus Allocation',
        description: 'Strategic deployment of available funds'
      });
    }

    return priorities.slice(0, 3); // Top 3 priorities
  },

  /**
   * Calculate integration score for contextual timeline system
   * @param {Object} components - Components integration status
   * @returns {Object} Integration health metrics
   */
  calculateIntegrationHealth: (components) => {
    const integrationPoints = [
      'phase_indicator_active',
      'guidance_widget_responsive', 
      'status_badge_accurate',
      'mobile_navigation_enhanced',
      'budget_integration_working',
      'goal_system_connected'
    ];

    const activePoints = integrationPoints.filter(point => components[point]);
    const healthScore = Math.round((activePoints.length / integrationPoints.length) * 100);

    return {
      score: healthScore,
      active_components: activePoints.length,
      total_components: integrationPoints.length,
      status: healthScore >= 80 ? 'excellent' : healthScore >= 60 ? 'good' : 'needs_improvement',
      missing_integrations: integrationPoints.filter(point => !components[point])
    };
  }
};

// Success criteria validation
export const SUCCESS_CRITERIA = {
  TIMELINE_SPACE_USAGE: {
    target: '<20%',
    current_large_timeline: '70%',
    contextual_approach: '<20%',
    improvement: '50%+ reduction'
  },
  CFA_GUIDANCE_COVERAGE: {
    lifecycle_phases: 3,
    decision_contexts: 8,
    professional_standards: 'CFA Institute Guidelines',
    recommendation_types: ['strategic', 'tactical', 'risk_management']
  },
  MOBILE_EXPERIENCE: {
    timeline_in_navigation: true,
    contextual_widgets: true,
    touch_optimized: true,
    progressive_disclosure: true
  },
  INTEGRATION_POINTS: {
    budget_dashboard: 'phase_context',
    goal_setting: 'cfa_defaults',
    profile_management: 'lifecycle_recommendations',
    transaction_analysis: 'spending_insights'
  }
};

export default {
  LifecyclePhaseIndicator,
  ContextualGuidanceWidget, 
  TimelineStatusBadge,
  ContextualTimelineDashboard,
  phaseAppropriateDefaults,
  useLifecyclePhase,
  cfaGuidanceService,
  contextualHelpers,
  CONTEXTUAL_COMPONENTS_CONFIG,
  SUCCESS_CRITERIA
};