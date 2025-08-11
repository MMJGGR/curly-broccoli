/**
 * Phase Appropriate Defaults Utility
 * Provides CFA-standard defaults based on lifecycle phase
 * Used throughout the app to pre-populate forms and guide decisions with professional standards
 */

import { LIFECYCLE_PHASES } from '../../hooks/useLifecyclePhase';
import cfaGuidanceService from '../../services/cfaGuidance';

class PhaseAppropriateDefaults {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
  }

  /**
   * Get comprehensive phase-appropriate defaults for a user
   * @param {Object} userProfile - User's financial profile
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @returns {Object} Complete set of CFA-standard defaults
   */
  getDefaults(userProfile, lifecyclePhase) {
    const cacheKey = `${lifecyclePhase}-${userProfile.age}-${userProfile.income}`;
    
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.data;
      }
    }

    const defaults = this.generateDefaults(userProfile, lifecyclePhase);
    
    this.cache.set(cacheKey, {
      data: defaults,
      timestamp: Date.now()
    });

    return defaults;
  }

  /**
   * Get asset allocation defaults based on lifecycle phase
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {number} age - User's age
   * @returns {Object} Asset allocation percentages
   */
  getAssetAllocationDefaults(lifecyclePhase, age = 30) {
    const baseEquityPercentage = Math.max(20, Math.min(90, 100 - age));
    
    const allocations = {
      [LIFECYCLE_PHASES.ACCUMULATION]: {
        equities: Math.max(70, baseEquityPercentage),
        bonds: 15,
        alternatives: 10,
        cash: 5,
        international_equity: 30, // Percentage of equity allocation
        emerging_markets: 10 // Percentage of equity allocation
      },
      [LIFECYCLE_PHASES.CONSOLIDATION]: {
        equities: Math.max(40, Math.min(70, baseEquityPercentage)),
        bonds: 35,
        alternatives: 15,
        cash: 10,
        international_equity: 25,
        emerging_markets: 5
      },
      [LIFECYCLE_PHASES.SPENDING]: {
        equities: Math.max(20, Math.min(50, baseEquityPercentage)),
        bonds: 50,
        alternatives: 10,
        cash: 20,
        international_equity: 20,
        emerging_markets: 0
      }
    };

    return allocations[lifecyclePhase];
  }

  /**
   * Get savings rate defaults
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {number} income - Monthly income
   * @returns {Object} Savings rate recommendations
   */
  getSavingsRateDefaults(lifecyclePhase, income = 0) {
    const baseRates = {
      [LIFECYCLE_PHASES.ACCUMULATION]: {
        target: 20,
        minimum: 15,
        aggressive: 25
      },
      [LIFECYCLE_PHASES.CONSOLIDATION]: {
        target: 15,
        minimum: 12,
        aggressive: 20
      },
      [LIFECYCLE_PHASES.SPENDING]: {
        target: 5,
        minimum: 0,
        aggressive: 10
      }
    };

    const rates = baseRates[lifecyclePhase];

    // Adjust based on income level
    if (income > 150000) { // High income
      rates.target += 5;
      rates.aggressive += 5;
    } else if (income < 60000) { // Lower income
      rates.target = Math.max(10, rates.target - 3);
      rates.minimum = Math.max(5, rates.minimum - 3);
    }

    return rates;
  }

  /**
   * Get emergency fund defaults
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {number} monthlyExpenses - Monthly expenses
   * @param {number} dependents - Number of dependents
   * @returns {Object} Emergency fund recommendations
   */
  getEmergencyFundDefaults(lifecyclePhase, monthlyExpenses = 0, dependents = 0) {
    const baseMonths = {
      [LIFECYCLE_PHASES.ACCUMULATION]: 6,
      [LIFECYCLE_PHASES.CONSOLIDATION]: 9,
      [LIFECYCLE_PHASES.SPENDING]: 12
    }[lifecyclePhase];

    // Adjust for dependents and life complexity
    const adjustedMonths = baseMonths + (dependents > 0 ? 2 : 0);
    const targetAmount = monthlyExpenses * adjustedMonths;

    return {
      target_months: adjustedMonths,
      target_amount: targetAmount,
      minimum_months: Math.max(3, baseMonths - 2),
      minimum_amount: monthlyExpenses * Math.max(3, baseMonths - 2),
      priority: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 'high' : 'critical'
    };
  }

  /**
   * Get insurance coverage defaults
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {Object} userProfile - User profile
   * @returns {Object} Insurance recommendations
   */
  getInsuranceDefaults(lifecyclePhase, userProfile) {
    const { income = 0, dependents = 0, age = 30 } = userProfile;

    const defaults = {
      life_insurance: this.getLifeInsuranceDefaults(lifecyclePhase, income, dependents),
      disability_insurance: this.getDisabilityInsuranceDefaults(lifecyclePhase, income),
      health_insurance: this.getHealthInsuranceDefaults(lifecyclePhase, age, dependents),
      property_insurance: this.getPropertyInsuranceDefaults(lifecyclePhase),
      umbrella_insurance: this.getUmbrellaInsuranceDefaults(lifecyclePhase, income)
    };

    return defaults;
  }

  /**
   * Get goal timeframe defaults
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {number} age - User's age
   * @returns {Object} Goal timeframe recommendations
   */
  getGoalTimeframeDefaults(lifecyclePhase, age = 30) {
    const retirementAge = 65;
    const yearsToRetirement = Math.max(0, retirementAge - age);

    return {
      emergency_fund: {
        timeframe: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? '6-12 months' : '3-6 months',
        priority: 'immediate'
      },
      retirement: {
        timeframe: `${yearsToRetirement} years`,
        priority: lifecyclePhase === LIFECYCLE_PHASES.SPENDING ? 'current' : 'ongoing'
      },
      home_purchase: {
        timeframe: age < 35 ? '3-7 years' : '2-5 years',
        priority: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 'medium' : 'low'
      },
      education_fund: {
        timeframe: dependents > 0 ? '10-18 years' : 'N/A',
        priority: dependents > 0 ? 'high' : 'low'
      },
      investment_goals: {
        timeframe: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? '10+ years' : '5-10 years',
        priority: 'ongoing'
      }
    };
  }

  /**
   * Get risk tolerance defaults
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {number} age - User's age
   * @returns {Object} Risk tolerance recommendations
   */
  getRiskToleranceDefaults(lifecyclePhase, age = 30) {
    const profiles = {
      [LIFECYCLE_PHASES.ACCUMULATION]: {
        level: 'aggressive',
        equity_tolerance: 90,
        volatility_comfort: 'high',
        loss_tolerance: '20-30%',
        time_horizon: 'long-term'
      },
      [LIFECYCLE_PHASES.CONSOLIDATION]: {
        level: 'moderate',
        equity_tolerance: 60,
        volatility_comfort: 'medium',
        loss_tolerance: '10-15%',
        time_horizon: 'medium-term'
      },
      [LIFECYCLE_PHASES.SPENDING]: {
        level: 'conservative',
        equity_tolerance: 35,
        volatility_comfort: 'low',
        loss_tolerance: '5-10%',
        time_horizon: 'short-term'
      }
    };

    return profiles[lifecyclePhase];
  }

  /**
   * Get budget allocation defaults
   * @param {string} lifecyclePhase - Current lifecycle phase
   * @param {number} income - Monthly income
   * @returns {Object} Budget allocation percentages
   */
  getBudgetAllocationDefaults(lifecyclePhase, income = 0) {
    const baseAllocations = {
      [LIFECYCLE_PHASES.ACCUMULATION]: {
        housing: 30,
        transportation: 15,
        food: 12,
        utilities: 8,
        savings_investment: 20,
        emergency_fund: 5,
        insurance: 5,
        personal: 5
      },
      [LIFECYCLE_PHASES.CONSOLIDATION]: {
        housing: 28,
        transportation: 15,
        food: 12,
        utilities: 8,
        savings_investment: 15,
        emergency_fund: 3,
        insurance: 7,
        healthcare: 5,
        personal: 7
      },
      [LIFECYCLE_PHASES.SPENDING]: {
        housing: 25,
        transportation: 12,
        food: 15,
        utilities: 8,
        healthcare: 15,
        insurance: 8,
        personal: 12,
        legacy: 5
      }
    };

    return baseAllocations[lifecyclePhase];
  }

  // Private helper methods
  generateDefaults(userProfile, lifecyclePhase) {
    const { age = 30, income = 0, expenses = 0, dependents = 0 } = userProfile;

    return {
      asset_allocation: this.getAssetAllocationDefaults(lifecyclePhase, age),
      savings_rate: this.getSavingsRateDefaults(lifecyclePhase, income),
      emergency_fund: this.getEmergencyFundDefaults(lifecyclePhase, expenses, dependents),
      insurance_coverage: this.getInsuranceDefaults(lifecyclePhase, userProfile),
      goal_timeframes: this.getGoalTimeframeDefaults(lifecyclePhase, age),
      risk_tolerance: this.getRiskToleranceDefaults(lifecyclePhase, age),
      budget_allocation: this.getBudgetAllocationDefaults(lifecyclePhase, income),
      phase_priorities: this.getPhasePriorities(lifecyclePhase),
      cfa_benchmarks: this.getCFABenchmarks(lifecyclePhase, age, income)
    };
  }

  getLifeInsuranceDefaults(lifecyclePhase, income, dependents) {
    if (dependents === 0 && lifecyclePhase === LIFECYCLE_PHASES.SPENDING) {
      return { recommended: false, amount: 0 };
    }

    const multiplier = lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 12 :
                     lifecyclePhase === LIFECYCLE_PHASES.CONSOLIDATION ? 10 : 5;
    
    return {
      recommended: true,
      amount: income * 12 * multiplier, // Annual income * multiplier
      type: lifecyclePhase === LIFECYCLE_PHASES.SPENDING ? 'whole' : 'term',
      term: lifecyclePhase !== LIFECYCLE_PHASES.SPENDING ? '20-30 years' : 'permanent'
    };
  }

  getDisabilityInsuranceDefaults(lifecyclePhase, income) {
    return {
      recommended: lifecyclePhase !== LIFECYCLE_PHASES.SPENDING,
      coverage_amount: Math.round(income * 0.65), // 65% income replacement
      benefit_period: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 'to age 65' : '5 years',
      waiting_period: '90 days'
    };
  }

  getHealthInsuranceDefaults(lifecyclePhase, age, dependents) {
    return {
      recommended: true,
      type: age > 65 ? 'Medicare + Supplement' : 'Comprehensive',
      deductible: lifecyclePhase === LIFECYCLE_PHASES.ACCUMULATION ? 'high' : 'moderate',
      family_coverage: dependents > 0,
      hsa_eligible: age < 65 && lifecyclePhase !== LIFECYCLE_PHASES.SPENDING
    };
  }

  getPropertyInsuranceDefaults(lifecyclePhase) {
    return {
      homeowners: {
        recommended: true,
        coverage: 'replacement_cost',
        liability: lifecyclePhase === LIFECYCLE_PHASES.SPENDING ? 500000 : 300000
      },
      auto: {
        recommended: true,
        liability: 'high_limits',
        comprehensive: true,
        collision: true
      }
    };
  }

  getUmbrellaInsuranceDefaults(lifecyclePhase, income) {
    const recommended = income > 100000 || lifecyclePhase === LIFECYCLE_PHASES.CONSOLIDATION;
    
    return {
      recommended,
      amount: recommended ? Math.max(1000000, income * 5) : 0
    };
  }

  getPhasePriorities(lifecyclePhase) {
    const priorities = {
      [LIFECYCLE_PHASES.ACCUMULATION]: [
        'Emergency fund completion',
        'Maximize retirement contributions',
        'Build investment portfolio',
        'Optimize tax-advantaged accounts',
        'Establish insurance coverage'
      ],
      [LIFECYCLE_PHASES.CONSOLIDATION]: [
        'Retirement readiness assessment',
        'Healthcare cost planning',
        'Estate planning preparation',
        'Portfolio risk adjustment',
        'Income replacement strategy'
      ],
      [LIFECYCLE_PHASES.SPENDING]: [
        'Sustainable withdrawal rate',
        'Healthcare cost management',
        'Estate plan implementation',
        'Legacy planning',
        'Capital preservation'
      ]
    };

    return priorities[lifecyclePhase];
  }

  getCFABenchmarks(lifecyclePhase, age, income) {
    return {
      net_worth_target: this.getNetWorthBenchmark(age, income),
      savings_rate_target: this.getSavingsRateDefaults(lifecyclePhase, income).target,
      asset_allocation_target: this.getAssetAllocationDefaults(lifecyclePhase, age),
      emergency_fund_target: this.getEmergencyFundDefaults(lifecyclePhase, income * 0.7).target_months,
      retirement_readiness: this.getRetirementReadinessBenchmark(lifecyclePhase, age)
    };
  }

  getNetWorthBenchmark(age, income) {
    // Rule of thumb: Age/10 * Annual Income
    const multiplier = age / 10;
    return (income * 12) * multiplier;
  }

  getRetirementReadinessBenchmark(lifecyclePhase, age) {
    const benchmarks = {
      [LIFECYCLE_PHASES.ACCUMULATION]: {
        target_multiple: age < 35 ? 1 : age < 45 ? 3 : 6,
        on_track_indicator: 'Building foundation'
      },
      [LIFECYCLE_PHASES.CONSOLIDATION]: {
        target_multiple: age < 55 ? 8 : age < 65 ? 10 : 12,
        on_track_indicator: 'Pre-retirement optimization'
      },
      [LIFECYCLE_PHASES.SPENDING]: {
        target_multiple: 15,
        on_track_indicator: 'Retirement implementation'
      }
    };

    return benchmarks[lifecyclePhase];
  }

  /**
   * Clear the cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Create singleton instance
const phaseAppropriateDefaults = new PhaseAppropriateDefaults();

export default phaseAppropriateDefaults;