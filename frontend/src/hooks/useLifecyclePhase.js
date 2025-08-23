/**
 * CFA Lifecycle Phase Detection Hook
 * Implements professional financial lifecycle analysis based on CFA Institute guidelines
 * Determines lifecycle phase (Accumulation/Consolidation/Spending) and provides phase-specific guidance
 */
import { useState, useEffect, useMemo } from 'react';

// CFA Institute lifecycle phase definitions
export const LIFECYCLE_PHASES = {
  ACCUMULATION: 'Accumulation',
  CONSOLIDATION: 'Consolidation', 
  SPENDING: 'Spending'
};

// Age-based phase thresholds (CFA standard with flexibility)
const PHASE_AGE_THRESHOLDS = {
  ACCUMULATION_MAX: 45,
  CONSOLIDATION_MAX: 65,
  SPENDING_MIN: 65
};

// Asset allocation guidelines by phase (100-Age rule with adjustments)
const PHASE_ASSET_ALLOCATION = {
  [LIFECYCLE_PHASES.ACCUMULATION]: {
    equities: { min: 70, max: 90, default: 80 },
    bonds: { min: 10, max: 25, default: 15 },
    alternatives: { min: 0, max: 15, default: 5 },
    cash: { min: 2, max: 8, default: 5 }
  },
  [LIFECYCLE_PHASES.CONSOLIDATION]: {
    equities: { min: 40, max: 70, default: 60 },
    bonds: { min: 25, max: 45, default: 35 },
    alternatives: { min: 0, max: 15, default: 5 },
    cash: { min: 5, max: 15, default: 10 }
  },
  [LIFECYCLE_PHASES.SPENDING]: {
    equities: { min: 20, max: 50, default: 35 },
    bonds: { min: 40, max: 70, default: 55 },
    alternatives: { min: 0, max: 10, default: 0 },
    cash: { min: 10, max: 20, default: 15 }
  }
};

// Emergency fund targets by phase (months of expenses)
const EMERGENCY_FUND_TARGETS = {
  [LIFECYCLE_PHASES.ACCUMULATION]: { months: 6, priority: 'high' },
  [LIFECYCLE_PHASES.CONSOLIDATION]: { months: 9, priority: 'critical' },
  [LIFECYCLE_PHASES.SPENDING]: { months: 12, priority: 'critical' }
};

// Risk tolerance guidelines
const RISK_TOLERANCE_GUIDELINES = {
  [LIFECYCLE_PHASES.ACCUMULATION]: {
    level: 'aggressive',
    description: 'High growth focus with long-term horizon',
    volatility_tolerance: 'high'
  },
  [LIFECYCLE_PHASES.CONSOLIDATION]: {
    level: 'moderate',
    description: 'Balanced growth and stability',
    volatility_tolerance: 'moderate'
  },
  [LIFECYCLE_PHASES.SPENDING]: {
    level: 'conservative',
    description: 'Capital preservation and income generation',
    volatility_tolerance: 'low'
  }
};

// Goal prioritization by phase
const GOAL_PRIORITIES = {
  [LIFECYCLE_PHASES.ACCUMULATION]: [
    'emergency_fund',
    'retirement_savings',
    'investment_portfolio',
    'education_fund',
    'home_purchase'
  ],
  [LIFECYCLE_PHASES.CONSOLIDATION]: [
    'retirement_optimization',
    'emergency_fund',
    'healthcare_planning',
    'estate_planning',
    'family_support'
  ],
  [LIFECYCLE_PHASES.SPENDING]: [
    'income_replacement',
    'healthcare_costs',
    'estate_planning', 
    'legacy_planning',
    'lifestyle_maintenance'
  ]
};

export const useLifecyclePhase = (userProfile = {}) => {
  const [lifecycleData, setLifecycleData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract user data
  const {
    age = 30,
    income = 0,
    expenses = 0,
    netWorth = 0,
    dependents = 0,
    retirementGoalAge = 65,
    currentAssets = {},
    goals = []
  } = userProfile;

  // Calculate lifecycle phase
  const calculateLifecyclePhase = useMemo(() => {
    if (!age) return LIFECYCLE_PHASES.ACCUMULATION;

    // Primary age-based determination
    if (age <= PHASE_AGE_THRESHOLDS.ACCUMULATION_MAX) {
      return LIFECYCLE_PHASES.ACCUMULATION;
    } else if (age <= PHASE_AGE_THRESHOLDS.CONSOLIDATION_MAX) {
      return LIFECYCLE_PHASES.CONSOLIDATION;
    } else {
      return LIFECYCLE_PHASES.SPENDING;
    }
  }, [age]);

  // Calculate phase-specific recommendations
  const phaseRecommendations = useMemo(() => {
    const phase = calculateLifecyclePhase;
    const allocation = PHASE_ASSET_ALLOCATION[phase];
    const emergencyFund = EMERGENCY_FUND_TARGETS[phase];
    const riskGuideline = RISK_TOLERANCE_GUIDELINES[phase];
    const priorities = GOAL_PRIORITIES[phase];

    // Calculate recommended asset allocation based on 100-Age rule with phase adjustments
    const baseEquityAllocation = Math.max(20, Math.min(90, 100 - age));
    const adjustedAllocation = {
      equities: Math.max(allocation.equities.min, Math.min(allocation.equities.max, baseEquityAllocation)),
      bonds: allocation.bonds.default,
      alternatives: allocation.alternatives.default,
      cash: allocation.cash.default
    };

    // Normalize to 100%
    const total = Object.values(adjustedAllocation).reduce((sum, val) => sum + val, 0);
    Object.keys(adjustedAllocation).forEach(key => {
      adjustedAllocation[key] = Math.round((adjustedAllocation[key] / total) * 100);
    });

    return {
      phase,
      assetAllocation: adjustedAllocation,
      emergencyFundTarget: {
        months: emergencyFund.months,
        amount: expenses * emergencyFund.months,
        priority: emergencyFund.priority
      },
      riskProfile: riskGuideline,
      goalPriorities: priorities,
      yearsToRetirement: Math.max(0, retirementGoalAge - age)
    };
  }, [calculateLifecyclePhase, age, expenses, retirementGoalAge]);

  // Generate CFA-level guidance
  const generateGuidance = useMemo(() => {
    const phase = calculateLifecyclePhase;
    const surplus = income - expenses;
    const savingsRate = income > 0 ? (surplus / income) * 100 : 0;

    const guidance = {
      phase_overview: getPhaseOverview(phase, age),
      savings_guidance: getSavingsGuidance(phase, savingsRate, surplus),
      investment_guidance: getInvestmentGuidance(phase, phaseRecommendations.assetAllocation),
      risk_management: getRiskManagement(phase, dependents, netWorth),
      next_actions: getNextActions(phase, userProfile),
      benchmarks: getPhaseBenchmarks(phase, age, income)
    };

    return guidance;
  }, [calculateLifecyclePhase, age, income, expenses, dependents, netWorth, phaseRecommendations, userProfile]);

  // Calculate phase health score
  const calculatePhaseHealth = useMemo(() => {
    const phase = calculateLifecyclePhase;
    let score = 0;
    const factors = [];

    // Emergency fund adequacy
    const currentEmergencyFund = currentAssets.emergency_fund || 0;
    const targetEmergencyFund = phaseRecommendations.emergencyFundTarget.amount;
    const emergencyFundRatio = targetEmergencyFund > 0 ? (currentEmergencyFund / targetEmergencyFund) : 0;
    
    if (emergencyFundRatio >= 1) {
      score += 25;
      factors.push({ factor: 'Emergency Fund', status: 'excellent', score: 25 });
    } else if (emergencyFundRatio >= 0.7) {
      score += 20;
      factors.push({ factor: 'Emergency Fund', status: 'good', score: 20 });
    } else if (emergencyFundRatio >= 0.3) {
      score += 10;
      factors.push({ factor: 'Emergency Fund', status: 'needs_improvement', score: 10 });
    } else {
      factors.push({ factor: 'Emergency Fund', status: 'critical', score: 0 });
    }

    // Savings rate adequacy
    const surplus = income - expenses;
    const savingsRate = income > 0 ? (surplus / income) * 100 : 0;
    const targetSavingsRate = phase === LIFECYCLE_PHASES.ACCUMULATION ? 20 : 
                             phase === LIFECYCLE_PHASES.CONSOLIDATION ? 15 : 5;
    
    if (savingsRate >= targetSavingsRate) {
      score += 25;
      factors.push({ factor: 'Savings Rate', status: 'excellent', score: 25 });
    } else if (savingsRate >= targetSavingsRate * 0.7) {
      score += 20;
      factors.push({ factor: 'Savings Rate', status: 'good', score: 20 });
    } else if (savingsRate >= targetSavingsRate * 0.4) {
      score += 10;
      factors.push({ factor: 'Savings Rate', status: 'needs_improvement', score: 10 });
    } else {
      factors.push({ factor: 'Savings Rate', status: 'critical', score: 0 });
    }

    // Investment diversification (if assets provided)
    if (Object.keys(currentAssets).length > 0) {
      const totalInvestments = Object.values(currentAssets).reduce((sum, val) => sum + (val || 0), 0);
      if (totalInvestments > 0) {
        score += 25;
        factors.push({ factor: 'Investment Portfolio', status: 'good', score: 25 });
      } else {
        factors.push({ factor: 'Investment Portfolio', status: 'needs_improvement', score: 0 });
      }
    }

    // Goal progress
    const activeGoals = goals.filter(g => g.status === 'active').length;
    if (activeGoals >= 3) {
      score += 25;
      factors.push({ factor: 'Goal Planning', status: 'excellent', score: 25 });
    } else if (activeGoals >= 1) {
      score += 15;
      factors.push({ factor: 'Goal Planning', status: 'good', score: 15 });
    } else {
      factors.push({ factor: 'Goal Planning', status: 'needs_improvement', score: 0 });
    }

    return {
      score: Math.min(100, score),
      factors,
      level: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'fair' : 'needs_attention'
    };
  }, [calculateLifecyclePhase, phaseRecommendations, income, expenses, currentAssets, goals]);

  // Load lifecycle data with memoized values to prevent infinite loops
  const lifecycleAnalysis = useMemo(() => ({
    phase: calculateLifecyclePhase,
    recommendations: phaseRecommendations,
    guidance: generateGuidance,
    health: calculatePhaseHealth,
    metadata: {
      user_age: age,
      years_to_retirement: Math.max(0, retirementGoalAge - age)
    }
  }), [calculateLifecyclePhase, phaseRecommendations, generateGuidance, calculatePhaseHealth, age, retirementGoalAge]);

  useEffect(() => {
    setLifecycleData(lifecycleAnalysis);
    setLoading(false);
  }, [calculateLifecyclePhase, age, income, expenses, netWorth, dependents, retirementGoalAge]);

  return {
    // Core lifecycle data
    phase: lifecycleData?.phase || LIFECYCLE_PHASES.ACCUMULATION,
    recommendations: lifecycleData?.recommendations,
    guidance: lifecycleData?.guidance,
    health: lifecycleData?.health,
    
    // Convenience accessors
    assetAllocation: lifecycleData?.recommendations?.assetAllocation,
    emergencyFundTarget: lifecycleData?.recommendations?.emergencyFundTarget,
    riskProfile: lifecycleData?.recommendations?.riskProfile,
    goalPriorities: lifecycleData?.recommendations?.goalPriorities,
    
    // State
    loading,
    metadata: lifecycleData?.metadata,
    
    // Utility functions
    isAccumulationPhase: lifecycleData?.phase === LIFECYCLE_PHASES.ACCUMULATION,
    isConsolidationPhase: lifecycleData?.phase === LIFECYCLE_PHASES.CONSOLIDATION,
    isSpendingPhase: lifecycleData?.phase === LIFECYCLE_PHASES.SPENDING,
    getPhaseColor: (phase) => getPhaseColor(phase || lifecycleData?.phase),
    getPhaseIcon: (phase) => getPhaseIcon(phase || lifecycleData?.phase)
  };
};

// Helper functions for guidance generation
function getPhaseOverview(phase, age) {
  const overviews = {
    [LIFECYCLE_PHASES.ACCUMULATION]: `At age ${age}, you're in the Accumulation phase - the foundation-building period of your financial journey. Focus on aggressive growth, emergency fund establishment, and long-term wealth building through systematic investing.`,
    [LIFECYCLE_PHASES.CONSOLIDATION]: `At age ${age}, you're in the Consolidation phase - balancing growth with risk management as retirement approaches. Optimize your portfolio mix, maximize retirement contributions, and plan for healthcare costs.`,
    [LIFECYCLE_PHASES.SPENDING]: `At age ${age}, you're in the Spending phase - transitioning from wealth accumulation to wealth preservation and distribution. Focus on capital preservation, income generation, and estate planning.`
  };
  return overviews[phase];
}

function getSavingsGuidance(phase, currentRate, surplus) {
  const targetRates = {
    [LIFECYCLE_PHASES.ACCUMULATION]: 20,
    [LIFECYCLE_PHASES.CONSOLIDATION]: 15,
    [LIFECYCLE_PHASES.SPENDING]: 5
  };
  
  const target = targetRates[phase];
  const status = currentRate >= target ? 'excellent' : 
                currentRate >= target * 0.7 ? 'good' : 'needs_improvement';
  
  return {
    current_rate: currentRate,
    target_rate: target,
    status,
    monthly_surplus: surplus,
    recommendation: currentRate < target 
      ? `Increase savings rate from ${currentRate.toFixed(1)}% to ${target}% to meet ${phase.toLowerCase()} phase targets.`
      : `Excellent savings rate of ${currentRate.toFixed(1)}% exceeds ${phase.toLowerCase()} phase target of ${target}%.`
  };
}

function getInvestmentGuidance(phase, allocation) {
  const guidance = {
    [LIFECYCLE_PHASES.ACCUMULATION]: {
      strategy: 'Growth-focused with high equity allocation',
      key_principles: ['Time diversification', 'Dollar-cost averaging', 'Tax-advantaged account maximization'],
      allocation_rationale: `${allocation.equities}% equities for long-term growth, ${allocation.bonds}% bonds for stability`
    },
    [LIFECYCLE_PHASES.CONSOLIDATION]: {
      strategy: 'Balanced growth and risk management',
      key_principles: ['Portfolio rebalancing', 'Risk capacity assessment', 'Pre-retirement optimization'],
      allocation_rationale: `${allocation.equities}% equities for continued growth, ${allocation.bonds}% bonds for stability as retirement approaches`
    },
    [LIFECYCLE_PHASES.SPENDING]: {
      strategy: 'Capital preservation and income generation',
      key_principles: ['Principal protection', 'Inflation hedging', 'Systematic withdrawal planning'],
      allocation_rationale: `${allocation.equities}% equities for inflation protection, ${allocation.bonds}% bonds for stable income`
    }
  };
  
  return guidance[phase];
}

function getRiskManagement(phase, dependents, netWorth) {
  const baseRecommendations = {
    [LIFECYCLE_PHASES.ACCUMULATION]: [
      'Term life insurance (10-12x annual income)',
      'Disability insurance (60-70% income replacement)',
      'Basic health insurance with emergency fund'
    ],
    [LIFECYCLE_PHASES.CONSOLIDATION]: [
      'Adequate life insurance coverage review',
      'Long-term care insurance consideration',
      'Estate planning and will preparation'
    ],
    [LIFECYCLE_PHASES.SPENDING]: [
      'Medicare supplement planning',
      'Long-term care insurance',
      'Estate tax planning for high net worth'
    ]
  };
  
  const recommendations = [...baseRecommendations[phase]];
  
  // Adjust for dependents
  if (dependents > 0 && phase !== LIFECYCLE_PHASES.SPENDING) {
    recommendations.push(`Enhanced life insurance for ${dependents} dependent${dependents > 1 ? 's' : ''}`);
    recommendations.push('529 education savings plan consideration');
  }
  
  return {
    recommendations,
    priority_level: phase === LIFECYCLE_PHASES.SPENDING ? 'critical' : 
                   phase === LIFECYCLE_PHASES.CONSOLIDATION ? 'high' : 'moderate'
  };
}

function getNextActions(phase, userProfile) {
  const { income, expenses, currentAssets = {} } = userProfile;
  const surplus = income - expenses;
  
  const actions = [];
  
  // Emergency fund check
  const emergencyFund = currentAssets.emergency_fund || 0;
  const targetEmergency = expenses * (phase === LIFECYCLE_PHASES.ACCUMULATION ? 6 : 9);
  if (emergencyFund < targetEmergency) {
    actions.push(`Build emergency fund to ${targetEmergency.toLocaleString()} (${phase === LIFECYCLE_PHASES.ACCUMULATION ? 6 : 9} months expenses)`);
  }
  
  // Savings optimization
  if (surplus > 0) {
    actions.push(`Optimize ${surplus.toLocaleString()} monthly surplus allocation across goals`);
  } else {
    actions.push('Review and optimize budget to create positive cash flow');
  }
  
  // Phase-specific actions
  if (phase === LIFECYCLE_PHASES.ACCUMULATION) {
    actions.push('Maximize retirement account contributions');
    actions.push('Establish systematic investment plan');
  } else if (phase === LIFECYCLE_PHASES.CONSOLIDATION) {
    actions.push('Review and rebalance investment portfolio');
    actions.push('Optimize retirement withdrawal strategy');
  } else {
    actions.push('Implement systematic withdrawal plan');
    actions.push('Review estate planning documents');
  }
  
  return actions.slice(0, 5); // Top 5 priorities
}

function getPhaseBenchmarks(phase, age, income) {
  const benchmarks = {
    [LIFECYCLE_PHASES.ACCUMULATION]: {
      net_worth_multiple: age < 30 ? 0.5 : age < 35 ? 1 : age < 40 ? 2 : 3,
      savings_rate: 20,
      emergency_fund_months: 6
    },
    [LIFECYCLE_PHASES.CONSOLIDATION]: {
      net_worth_multiple: age < 50 ? 5 : age < 55 ? 7 : age < 60 ? 9 : 11,
      savings_rate: 15,
      emergency_fund_months: 9
    },
    [LIFECYCLE_PHASES.SPENDING]: {
      net_worth_multiple: 15,
      withdrawal_rate: 4,
      emergency_fund_months: 12
    }
  };
  
  const phaseBenchmarks = benchmarks[phase];
  
  return {
    ...phaseBenchmarks,
    target_net_worth: income * phaseBenchmarks.net_worth_multiple,
    description: `Industry benchmarks for ${phase.toLowerCase()} phase at age ${age}`
  };
}

// Utility functions
function getPhaseColor(phase) {
  const colors = {
    [LIFECYCLE_PHASES.ACCUMULATION]: '#10b981', // Green
    [LIFECYCLE_PHASES.CONSOLIDATION]: '#3b82f6', // Blue  
    [LIFECYCLE_PHASES.SPENDING]: '#8b5cf6' // Purple
  };
  return colors[phase] || '#6b7280';
}

function getPhaseIcon(phase) {
  const icons = {
    [LIFECYCLE_PHASES.ACCUMULATION]: '🚀', // Growth/Launch
    [LIFECYCLE_PHASES.CONSOLIDATION]: '⚖️', // Balance
    [LIFECYCLE_PHASES.SPENDING]: '🏖️' // Retirement/Leisure
  };
  return icons[phase] || '📊';
}

export default useLifecyclePhase;