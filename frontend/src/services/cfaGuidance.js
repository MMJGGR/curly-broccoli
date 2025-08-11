/**
 * CFA-Level Financial Guidance Service
 * Provides professional-grade financial recommendations based on CFA Institute best practices
 * Integrates with lifecycle phases to deliver contextual, actionable advice
 */

import { LIFECYCLE_PHASES } from '../hooks/useLifecyclePhase';

class CFAGuidanceService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get comprehensive financial guidance based on user profile and lifecycle phase
   * @param {Object} userProfile - User's financial profile
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {Object} budgetData - Current budget information
   * @returns {Object} Comprehensive guidance recommendations
   */
  async getComprehensiveGuidance(userProfile, lifecyclePhase, budgetData = null) {
    const cacheKey = this.generateCacheKey('comprehensive', userProfile, lifecyclePhase, budgetData);
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const guidance = this.generateComprehensiveGuidance(userProfile, lifecyclePhase, budgetData);
    
    this.cache.set(cacheKey, {
      data: guidance,
      timestamp: Date.now()
    });

    return guidance;
  }

  /**
   * Get contextual guidance for specific decision points
   * @param {string} context - Decision context (budget, investment, goal-setting, etc.)
   * @param {Object} userProfile - User's financial profile
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {Object} additionalData - Context-specific data
   * @returns {Object} Contextual recommendations
   */
  async getContextualGuidance(context, userProfile, lifecyclePhase, additionalData = {}) {
    const guidanceMethods = {
      'budget_planning': () => this.getBudgetGuidance(userProfile, lifecyclePhase, additionalData),
      'investment_allocation': () => this.getInvestmentGuidance(userProfile, lifecyclePhase, additionalData),
      'goal_setting': () => this.getGoalSettingGuidance(userProfile, lifecyclePhase, additionalData),
      'risk_management': () => this.getRiskManagementGuidance(userProfile, lifecyclePhase, additionalData),
      'emergency_fund': () => this.getEmergencyFundGuidance(userProfile, lifecyclePhase, additionalData),
      'retirement_planning': () => this.getRetirementGuidance(userProfile, lifecyclePhase, additionalData),
      'debt_management': () => this.getDebtManagementGuidance(userProfile, lifecyclePhase, additionalData),
      'tax_optimization': () => this.getTaxOptimizationGuidance(userProfile, lifecyclePhase, additionalData)
    };

    const guidanceMethod = guidanceMethods[context];
    if (!guidanceMethod) {
      throw new Error(`Unknown guidance context: ${context}`);
    }

    return guidanceMethod();
  }

  /**
   * Generate phase-appropriate defaults for financial decisions
   * @param {string} decisionType - Type of decision (allocation, goal, etc.)
   * @param {Object} userProfile - User's financial profile
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @returns {Object} CFA-standard defaults
   */
  getPhaseAppropriateDefaults(decisionType, userProfile, lifecyclePhase) {
    const { age = 30, income = 0, dependents = 0 } = userProfile;

    const defaults = {
      asset_allocation: this.getDefaultAssetAllocation(lifecyclePhase, age),
      savings_rate: this.getDefaultSavingsRate(lifecyclePhase, income),
      emergency_fund: this.getDefaultEmergencyFund(lifecyclePhase, userProfile),
      insurance_coverage: this.getDefaultInsuranceCoverage(lifecyclePhase, userProfile),
      goal_timeframes: this.getDefaultGoalTimeframes(lifecyclePhase, age),
      risk_tolerance: this.getDefaultRiskTolerance(lifecyclePhase, age)
    };

    return defaults[decisionType] || defaults;
  }

  /**
   * Get smart recommendations based on budget analysis and lifecycle phase
   * @param {Object} budgetData - Current budget data
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {number} surplus - Monthly budget surplus/deficit
   * @returns {Array} Prioritized recommendations
   */
  getBudgetOptimizationRecommendations(budgetData, lifecyclePhase, surplus) {
    const recommendations = [];

    // Surplus allocation recommendations
    if (surplus > 0) {
      recommendations.push(...this.getSurplusAllocationRecommendations(surplus, lifecyclePhase, budgetData));
    } else if (surplus < 0) {
      recommendations.push(...this.getDeficitReductionRecommendations(Math.abs(surplus), lifecyclePhase, budgetData));
    }

    // Phase-specific budget optimizations
    recommendations.push(...this.getPhaseSpecificBudgetRecommendations(lifecyclePhase, budgetData));

    // Goal acceleration opportunities
    recommendations.push(...this.getGoalAccelerationRecommendations(budgetData, lifecyclePhase));

    return this.prioritizeRecommendations(recommendations, lifecyclePhase);
  }

  // Private methods for generating specific guidance

  generateComprehensiveGuidance(userProfile, lifecyclePhase, budgetData) {
    const { age = 30, income = 0, expenses = 0, netWorth = 0, goals = [] } = userProfile;
    const surplus = income - expenses;

    return {
      executive_summary: this.generateExecutiveSummary(userProfile, lifecyclePhase, budgetData),
      phase_analysis: this.generatePhaseAnalysis(lifecyclePhase, age),
      financial_health: this.assessFinancialHealth(userProfile, lifecyclePhase),
      priority_actions: this.generatePriorityActions(userProfile, lifecyclePhase, budgetData),
      allocation_recommendations: this.generateAllocationRecommendations(userProfile, lifecyclePhase),
      risk_assessment: this.generateRiskAssessment(userProfile, lifecyclePhase),
      goal_optimization: this.generateGoalOptimization(goals, lifecyclePhase, surplus),
      benchmarking: this.generateBenchmarking(userProfile, lifecyclePhase),
      scenario_analysis: this.generateScenarioAnalysis(userProfile, lifecyclePhase),
      next_review_date: this.calculateNextReviewDate(lifecyclePhase)
    };
  }

  getBudgetGuidance(userProfile, lifecyclePhase, budgetData) {
    const { income = 0, expenses = 0 } = userProfile;
    const surplus = income - expenses;
    const savingsRate = income > 0 ? (surplus / income) * 100 : 0;

    const targetSavingsRates = {
      [LIFECYCLE_PHASES.ACCUMULATION]: 20,
      [LIFECYCLE_PHASES.CONSOLIDATION]: 15,
      [LIFECYCLE_PHASES.SPENDING]: 5
    };

    const targetRate = targetSavingsRates[lifecyclePhase];

    return {
      current_savings_rate: savingsRate,
      target_savings_rate: targetRate,
      monthly_surplus: surplus,
      recommendations: [
        savingsRate < targetRate 
          ? `Increase savings rate from ${savingsRate.toFixed(1)}% to ${targetRate}% to align with ${lifecyclePhase.toLowerCase()} phase best practices`
          : `Excellent savings rate of ${savingsRate.toFixed(1)}% exceeds ${lifecyclePhase.toLowerCase()} phase target`,
        surplus > 0 
          ? 'Optimize surplus allocation across emergency fund, investments, and goals'
          : 'Review variable expenses and increase income to create positive cash flow'
      ],
      budget_allocation_guide: this.getBudgetAllocationGuide(lifecyclePhase),
      expense_optimization: this.getExpenseOptimizationTips(lifecyclePhase, budgetData)
    };
  }

  getInvestmentGuidance(userProfile, lifecyclePhase, portfolioData) {
    const { age = 30 } = userProfile;
    const targetAllocation = this.getDefaultAssetAllocation(lifecyclePhase, age);

    return {
      recommended_allocation: targetAllocation,
      rebalancing_frequency: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 'quarterly' : 'semi-annually',
      investment_vehicles: this.getRecommendedInvestmentVehicles(lifecyclePhase),
      tax_considerations: this.getInvestmentTaxConsiderations(lifecyclePhase),
      risk_management: this.getInvestmentRiskManagement(lifecyclePhase),
      cost_optimization: this.getInvestmentCostOptimization(lifecyclePhase)
    };
  }

  getGoalSettingGuidance(userProfile, lifecyclePhase, existingGoals) {
    const { age = 30, income = 0, dependents = 0 } = userProfile;

    return {
      recommended_goals: this.getRecommendedGoalsByPhase(lifecyclePhase, userProfile),
      goal_prioritization: this.getGoalPrioritizationMatrix(lifecyclePhase),
      funding_strategies: this.getGoalFundingStrategies(lifecyclePhase, income),
      timeframe_optimization: this.getOptimalGoalTimeframes(lifecyclePhase, age),
      success_probability: this.calculateGoalSuccessProbability(existingGoals, userProfile, lifecyclePhase)
    };
  }

  // Asset allocation methods
  getDefaultAssetAllocation(lifecyclePhase, age) {
    const baseEquityPercentage = Math.max(20, Math.min(90, 100 - age));
    
    const allocations = {
      [LIFECYCLE_PHASES.ACCUMULATION]: {
        equities: Math.max(70, baseEquityPercentage),
        bonds: 15,
        alternatives: 10,
        cash: 5
      },
      [LIFECYCLE_PHASES.CONSOLIDATION]: {
        equities: Math.max(40, Math.min(70, baseEquityPercentage)),
        bonds: 35,
        alternatives: 15,
        cash: 10
      },
      [LIFECYCLE_PHASES.SPENDING]: {
        equities: Math.max(20, Math.min(50, baseEquityPercentage)),
        bonds: 50,
        alternatives: 10,
        cash: 20
      }
    };

    return allocations[lifecyclePhase];
  }

  getDefaultSavingsRate(lifecyclePhase, income) {
    const rates = {
      [LIFECYCLE_PHASES.ACCUMULATION]: income < 60000 ? 15 : 20,
      [LIFECYCLE_PHASES.CONSOLIDATION]: income < 100000 ? 12 : 15,
      [LIFECYCLE_PHASES.SPENDING]: 5
    };

    return rates[lifecyclePhase];
  }

  getDefaultEmergencyFund(lifecyclePhase, userProfile) {
    const { expenses = 0, dependents = 0 } = userProfile;
    
    const baseMonths = {
      [LIFECYCLE_PHASES.ACCUMULATION]: 6,
      [LIFECYCLE_PHASES.CONSOLIDATION]: 9,
      [LIFECYCLE_PHASES.SPENDING]: 12
    }[lifecyclePhase];

    // Adjust for dependents and job stability
    const adjustedMonths = baseMonths + (dependents > 0 ? 2 : 0);
    
    return {
      months: adjustedMonths,
      amount: expenses * adjustedMonths,
      priority: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 'high' : 'critical'
    };
  }

  // Recommendation generation methods
  getSurplusAllocationRecommendations(surplus, lifecyclePhase, budgetData) {
    const recommendations = [];

    if (surplus >= 100000) {
      recommendations.push({
        type: 'high_surplus_optimization',
        priority: 'high',
        title: 'Optimize High Surplus Allocation',
        description: `With ${this.formatCurrency(surplus)} monthly surplus, implement strategic allocation: 60% investments, 30% emergency fund, 10% goal acceleration`,
        action: 'Allocate across diversified investment portfolio and emergency fund completion'
      });
    } else if (surplus >= 30000) {
      recommendations.push({
        type: 'moderate_surplus_optimization',
        priority: 'medium',
        title: 'Accelerate Goal Achievement',
        description: `${this.formatCurrency(surplus)} surplus enables goal acceleration. Prioritize emergency fund completion, then systematic investing`,
        action: 'Complete emergency fund, then increase investment contributions'
      });
    }

    // Phase-specific surplus recommendations
    if (lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION) {
      recommendations.push({
        type: 'accumulation_surplus',
        priority: 'high',
        title: 'Maximize Growth Potential',
        description: 'Allocate surplus to high-growth investments and retirement accounts',
        action: 'Increase equity exposure and maximize retirement contributions'
      });
    }

    return recommendations;
  }

  getDeficitReductionRecommendations(deficit, lifecyclePhase, budgetData) {
    return [
      {
        type: 'expense_optimization',
        priority: 'critical',
        title: 'Eliminate Budget Deficit',
        description: `Address ${this.formatCurrency(deficit)} monthly deficit through expense optimization and income enhancement`,
        action: 'Review variable expenses and explore income opportunities'
      },
      {
        type: 'emergency_planning',
        priority: 'high',
        title: 'Prevent Financial Stress',
        description: 'Deficit spending threatens financial stability and goal achievement',
        action: 'Create immediate action plan to achieve positive cash flow'
      }
    ];
  }

  getPhaseSpecificBudgetRecommendations(lifecyclePhase, budgetData) {
    const recommendations = [];

    if (lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION) {
      recommendations.push({
        type: 'accumulation_focus',
        priority: 'medium',
        title: 'Optimize for Growth',
        description: 'Minimize lifestyle inflation, maximize savings and investment contributions',
        action: 'Implement aggressive savings strategy with 20%+ savings rate'
      });
    } else if (lifecyclePhase === LIFECYCLE_PHASES.CONSOLIDATION) {
      recommendations.push({
        type: 'consolidation_balance',
        priority: 'medium',
        title: 'Balance Current Needs with Future Security',
        description: 'Optimize spending between current lifestyle and retirement preparation',
        action: 'Review discretionary spending and maximize retirement contributions'
      });
    } else if (lifecyclePhase === LIFECYCLE_PHASES.SPENDING) {
      recommendations.push({
        type: 'spending_preservation',
        priority: 'high',
        title: 'Capital Preservation Focus',
        description: 'Implement systematic withdrawal strategy to preserve capital',
        action: 'Establish sustainable spending rate based on 4% withdrawal rule'
      });
    }

    return recommendations;
  }

  // Utility methods
  generateCacheKey(...args) {
    return JSON.stringify(args);
  }

  formatCurrency(amount) {
    if (amount >= 1000000) {
      return `KES ${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `KES ${(amount / 1000).toFixed(0)}K`;
    }
    return `KES ${amount.toLocaleString()}`;
  }

  prioritizeRecommendations(recommendations, lifecyclePhase) {
    const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    
    return recommendations
      .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
      .slice(0, 8); // Top 8 recommendations
  }

  calculateNextReviewDate(lifecyclePhase) {
    const reviewIntervals = {
      [LIFECYCLE_PHASES.ACCUMULATION]: 6, // 6 months
      [LIFECYCLE_PHASES.CONSOLIDATION]: 4, // 4 months
      [LIFECYCLE_PHASES.SPENDING]: 3 // 3 months
    };

    const months = reviewIntervals[lifecyclePhase];
    const reviewDate = new Date();
    reviewDate.setMonth(reviewDate.getMonth() + months);
    
    return reviewDate.toISOString();
  }

  // Assessment methods
  assessFinancialHealth(userProfile, lifecyclePhase) {
    const { income = 0, expenses = 0, netWorth = 0, age = 30 } = userProfile;
    const surplus = income - expenses;
    const savingsRate = income > 0 ? (surplus / income) * 100 : 0;
    
    let score = 0;
    const factors = [];

    // Savings rate assessment
    const targetSavingsRate = lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 20 : 15;
    if (savingsRate >= targetSavingsRate) {
      score += 25;
      factors.push({ factor: 'Savings Rate', status: 'excellent', impact: 'high' });
    } else if (savingsRate >= targetSavingsRate * 0.7) {
      score += 18;
      factors.push({ factor: 'Savings Rate', status: 'good', impact: 'high' });
    } else {
      score += 8;
      factors.push({ factor: 'Savings Rate', status: 'needs_improvement', impact: 'high' });
    }

    // Net worth assessment
    const targetNetWorth = income * (age < 35 ? 1 : age < 45 ? 3 : age < 55 ? 7 : 10);
    if (netWorth >= targetNetWorth) {
      score += 25;
      factors.push({ factor: 'Net Worth', status: 'excellent', impact: 'high' });
    } else if (netWorth >= targetNetWorth * 0.6) {
      score += 18;
      factors.push({ factor: 'Net Worth', status: 'good', impact: 'high' });
    } else {
      score += 8;
      factors.push({ factor: 'Net Worth', status: 'needs_improvement', impact: 'high' });
    }

    // Cash flow assessment
    if (surplus > income * 0.1) {
      score += 25;
      factors.push({ factor: 'Cash Flow', status: 'excellent', impact: 'medium' });
    } else if (surplus > 0) {
      score += 15;
      factors.push({ factor: 'Cash Flow', status: 'good', impact: 'medium' });
    } else {
      factors.push({ factor: 'Cash Flow', status: 'critical', impact: 'high' });
    }

    // Debt service assessment (placeholder - would need debt data)
    score += 25; // Assume good debt management for now
    factors.push({ factor: 'Debt Management', status: 'assumed_good', impact: 'medium' });

    return {
      overall_score: Math.min(100, score),
      health_level: score >= 80 ? 'excellent' : score >= 65 ? 'good' : score >= 50 ? 'fair' : 'needs_attention',
      factors,
      key_strengths: factors.filter(f => f.status === 'excellent').map(f => f.factor),
      improvement_areas: factors.filter(f => f.status === 'needs_improvement' || f.status === 'critical').map(f => f.factor)
    };
  }

  generateExecutiveSummary(userProfile, lifecyclePhase, budgetData) {
    const { age = 30, income = 0, expenses = 0 } = userProfile;
    const surplus = income - expenses;
    
    return {
      phase_status: `Currently in ${lifecyclePhase} phase at age ${age}`,
      financial_position: surplus > 0 ? 'positive cash flow' : 'cash flow needs optimization',
      key_priority: this.getKeyPriority(lifecyclePhase, surplus),
      next_milestone: this.getNextMilestone(lifecyclePhase, age),
      confidence_level: this.calculateConfidenceLevel(userProfile, lifecyclePhase)
    };
  }

  getKeyPriority(lifecyclePhase, surplus) {
    if (surplus <= 0) return 'Achieve positive cash flow';
    
    const priorities = {
      [LIFECYCLE_PHASES.ACCUMULATION]: 'Build emergency fund and maximize investment growth',
      [LIFECYCLE_PHASES.CONSOLIDATION]: 'Optimize retirement preparations and risk management',
      [LIFECYCLE_PHASES.SPENDING]: 'Implement sustainable withdrawal and preserve capital'
    };
    
    return priorities[lifecyclePhase];
  }

  getNextMilestone(lifecyclePhase, age) {
    const milestones = {
      [LIFECYCLE_PHASES.ACCUMULATION]: age < 35 ? 'Emergency fund completion' : 'Investment portfolio of 3x income',
      [LIFECYCLE_PHASES.CONSOLIDATION]: age < 55 ? 'Retirement readiness assessment' : 'Pre-retirement optimization',
      [LIFECYCLE_PHASES.SPENDING]: 'Sustainable withdrawal implementation'
    };
    
    return milestones[lifecyclePhase];
  }

  calculateConfidenceLevel(userProfile, lifecyclePhase) {
    const { income = 0, expenses = 0, netWorth = 0 } = userProfile;
    const surplus = income - expenses;
    const savingsRate = income > 0 ? (surplus / income) * 100 : 0;
    
    let confidence = 50; // Base confidence
    
    // Positive factors
    if (surplus > 0) confidence += 20;
    if (savingsRate >= 15) confidence += 15;
    if (netWorth > income) confidence += 15;
    
    // Phase-specific adjustments
    if (lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION && savingsRate >= 20) confidence += 10;
    if (lifecyclePhase === LIFECYCLE_PHASES.CONSOLIDATION && netWorth >= income * 5) confidence += 10;
    if (lifecyclePhase === LIFECYCLE_PHASES.SPENDING && netWorth >= income * 15) confidence += 10;
    
    return Math.min(100, confidence);
  }

  // Additional helper methods for comprehensive guidance
  generatePriorityActions(userProfile, lifecyclePhase, budgetData) {
    const actions = [];
    const { income = 0, expenses = 0 } = userProfile;
    const surplus = income - expenses;

    // Cash flow priority
    if (surplus <= 0) {
      actions.push({
        priority: 1,
        action: 'Achieve positive cash flow',
        timeline: 'immediate',
        impact: 'critical'
      });
    }

    // Emergency fund priority
    actions.push({
      priority: 2,
      action: 'Complete emergency fund target',
      timeline: '6-12 months',
      impact: 'high'
    });

    // Phase-specific priorities
    if (lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION) {
      actions.push({
        priority: 3,
        action: 'Maximize retirement account contributions',
        timeline: 'ongoing',
        impact: 'high'
      });
    }

    return actions.slice(0, 5);
  }

  generateAllocationRecommendations(userProfile, lifecyclePhase) {
    const { age = 30 } = userProfile;
    return {
      asset_allocation: this.getDefaultAssetAllocation(lifecyclePhase, age),
      rebalancing_schedule: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 'quarterly' : 'semi-annual',
      tax_optimization: this.getTaxOptimizedAllocation(lifecyclePhase),
      cost_minimization: this.getCostOptimizedFunds(lifecyclePhase)
    };
  }

  getTaxOptimizedAllocation(lifecyclePhase) {
    return {
      tax_deferred: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 70 : 
                   lifecyclePhase === LIFECYCLE_PHASES.CONSOLIDATION ? 60 : 40,
      tax_free: 20,
      taxable: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 10 : 
              lifecyclePhase === LIFECYCLE_PHASES.CONSOLIDATION ? 20 : 40
    };
  }

  getCostOptimizedFunds(lifecyclePhase) {
    return {
      target_expense_ratio: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 0.15 : 0.20,
      preferred_vehicles: ['index_funds', 'etfs', 'target_date_funds'],
      avoid: ['high_fee_mutual_funds', 'frequent_trading']
    };
  }
}

// Create singleton instance
const cfaGuidanceService = new CFAGuidanceService();

export default cfaGuidanceService;