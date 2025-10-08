/**
 * CFA-Compliant Financial Planning Validation Utilities
 * Kenya-specific parameters and professional standards
 */

export const KENYA_CFA_PARAMETERS = {
  // Economic Base Rates (2024)
  riskFreeRate: 0.085,        // Kenya 10-year government bonds
  countryRiskPremium: 0.015,  // Kenya sovereign risk
  averageInflation: 0.055,    // CBK historical data
  
  // Life Expectancy (WHO + Professional Adjustments)
  lifeExpectancy: {
    base: 66,                 // Kenya WHO average
    urbanPremium: 1,          // Urban location bonus
    educationPremium: 4,      // University/postgraduate
    incomeAdjustments: {
      topDecile: 5,           // Top 10% income (300K+ KES)
      topQuartile: 3,         // Top 25% income (150K+ KES)
      median: 0               // No adjustment
    },
    maximum: 78               // Conservative upper bound
  },
  
  // Professional Income Growth Rates (Real Terms)
  realIncomeGrowth: {
    technology: 0.035,        // 3.5% real growth
    financial_services: 0.030, // 3.0% real growth  
    government: 0.020,        // 2.0% real growth
    healthcare: 0.025,        // 2.5% real growth
    education: 0.015,         // 1.5% real growth
    general: 0.025            // Default 2.5%
  },
  
  // Career Risk Factors
  careerRisk: {
    annualJobLossRisk: 0.05,  // 5% annual career disruption
    disabilityRisk: 0.015,    // 1.5% annual disability risk
    industryObsolescence: {
      technology: 0.02,       // High change, but high demand
      financial_services: 0.025, // Automation pressure
      government: 0.005,      // Very stable
      general: 0.015
    }
  }
};

/**
 * Calculate CFA-compliant life expectancy for individual
 */
export const calculateLifeExpectancy = (profileData) => {
  const params = KENYA_CFA_PARAMETERS.lifeExpectancy;
  let adjustedAge = params.base;
  
  // Income-based adjustments
  const monthlyIncome = profileData.monthly_income || 0;
  if (monthlyIncome >= 300000) {
    adjustedAge += params.incomeAdjustments.topDecile;
  } else if (monthlyIncome >= 150000) {
    adjustedAge += params.incomeAdjustments.topQuartile;
  }
  
  // Education premium
  if (profileData.education_level === 'university' || profileData.education_level === 'postgraduate') {
    adjustedAge += params.educationPremium;
  }
  
  // Urban location premium
  if (profileData.location === 'nairobi' || profileData.location === 'mombasa') {
    adjustedAge += params.urbanPremium;
  }
  
  return Math.min(params.maximum, adjustedAge);
};

/**
 * Calculate CFA-compliant discount rates for Kenya
 */
export const calculateDiscountRates = (profileData) => {
  const baseRate = KENYA_CFA_PARAMETERS.riskFreeRate + KENYA_CFA_PARAMETERS.countryRiskPremium;
  
  // Human capital discount rate (higher due to career uncertainty)
  const industryRisk = KENYA_CFA_PARAMETERS.careerRisk.industryObsolescence[profileData.industry] || 0.015;
  const careerRisk = KENYA_CFA_PARAMETERS.careerRisk.annualJobLossRisk;
  
  const humanCapitalRate = Math.min(0.15, baseRate + industryRisk + careerRisk); // Cap at 15%
  
  // Expense liability rate (lower, more predictable)
  const expenseRate = Math.min(0.12, baseRate + 0.005); // Small premium for expense uncertainty
  
  return {
    humanCapital: humanCapitalRate,
    expenses: expenseRate,
    breakdown: {
      riskFree: KENYA_CFA_PARAMETERS.riskFreeRate,
      countryRisk: KENYA_CFA_PARAMETERS.countryRiskPremium,
      careerRisk: careerRisk,
      industryRisk: industryRisk
    }
  };
};

/**
 * Calculate realistic income growth (nominal terms)
 */
export const calculateIncomeGrowth = (profileData) => {
  const inflation = KENYA_CFA_PARAMETERS.averageInflation;
  const realGrowth = KENYA_CFA_PARAMETERS.realIncomeGrowth[profileData.industry] || 
                     KENYA_CFA_PARAMETERS.realIncomeGrowth.general;
  
  // Fisher equation: (1 + nominal) = (1 + real) * (1 + inflation)
  const nominalGrowth = (1 + realGrowth) * (1 + inflation) - 1;
  
  return {
    nominal: nominalGrowth,
    real: realGrowth,
    inflation: inflation
  };
};

/**
 * Validate financial planning assumptions against CFA standards
 */
export const validateCFAAssumptions = (assumptions) => {
  const warnings = [];
  const recommendations = [];
  
  // Life expectancy validation
  if (assumptions.lifeExpectancy > 78) {
    warnings.push("Life expectancy exceeds conservative upper bound for Kenya");
    recommendations.push("Consider reducing life expectancy to 75-78 years maximum");
  }
  
  if (assumptions.lifeExpectancy < 65) {
    warnings.push("Life expectancy below Kenya average - may underestimate longevity risk");
    recommendations.push("Consider professional/income adjustments to base life expectancy");
  }
  
  // Discount rate validation
  if (assumptions.humanCapitalRate < 0.08) {
    warnings.push("Human capital discount rate below Kenya risk-free rate");
    recommendations.push("Minimum rate should reflect Kenya government bond yields (8.5%+)");
  }
  
  if (assumptions.humanCapitalRate > 0.15) {
    warnings.push("Human capital discount rate exceptionally high");
    recommendations.push("Review career risk assumptions - may be overly conservative");
  }
  
  // Expense growth validation
  if (assumptions.expenseGrowth < KENYA_CFA_PARAMETERS.averageInflation) {
    warnings.push("Expense growth below Kenya inflation rate - unrealistic assumption");
    recommendations.push(`Use minimum ${(KENYA_CFA_PARAMETERS.averageInflation * 100).toFixed(1)}% expense growth`);
  }
  
  // Income growth validation
  if (assumptions.incomeGrowth < 0.02) {
    warnings.push("Income growth assumption may be too conservative");
  }
  
  if (assumptions.incomeGrowth > 0.12) {
    warnings.push("Income growth assumption may be overly optimistic");
    recommendations.push("Consider realistic professional growth trajectories");
  }
  
  // Overall assessment
  const riskLevel = warnings.length === 0 ? 'LOW' : 
                   warnings.length <= 2 ? 'MEDIUM' : 'HIGH';
  
  const cfaCompliance = warnings.filter(w => w.includes('rate')).length === 0 && 
                       assumptions.expenseGrowth >= KENYA_CFA_PARAMETERS.averageInflation;
  
  return {
    isValid: warnings.length <= 1,
    riskLevel,
    cfaCompliant: cfaCompliance,
    warnings,
    recommendations,
    confidence: Math.max(0.3, 1 - (warnings.length * 0.2)),
    
    // Professional notes
    notes: cfaCompliance 
      ? "Assumptions align with CFA standards for Kenyan financial planning"
      : "Review required - assumptions may not meet professional standards"
  };
};

/**
 * Calculate expected impact of assumption changes
 */
export const calculateAssumptionImpact = (currentAssumptions, proposedAssumptions, profileData) => {
  // Simplified impact calculation for key metrics
  const currentLifetimeValue = estimateLifetimeValue(currentAssumptions, profileData);
  const proposedLifetimeValue = estimateLifetimeValue(proposedAssumptions, profileData);
  
  const percentageChange = ((proposedLifetimeValue - currentLifetimeValue) / currentLifetimeValue) * 100;
  
  return {
    absoluteChange: proposedLifetimeValue - currentLifetimeValue,
    percentageChange,
    impactLevel: Math.abs(percentageChange) > 20 ? 'HIGH' : 
                Math.abs(percentageChange) > 10 ? 'MEDIUM' : 'LOW',
    explanation: generateImpactExplanation(percentageChange, currentAssumptions, proposedAssumptions)
  };
};

// Helper function for impact calculation
const estimateLifetimeValue = (assumptions, profileData) => {
  const annualIncome = (profileData.monthly_income || 0) * 12;
  const workingYears = Math.max(0, 65 - (profileData.age || 30));
  
  // Simplified PV calculation
  let pv = 0;
  for (let year = 1; year <= workingYears; year++) {
    const futureIncome = annualIncome * Math.pow(1 + assumptions.incomeGrowth, year);
    pv += futureIncome / Math.pow(1 + assumptions.humanCapitalRate, year);
  }
  
  return pv;
};

const generateImpactExplanation = (percentageChange, current, proposed) => {
  if (Math.abs(percentageChange) < 5) {
    return "Minimal impact on lifetime financial projections";
  }
  
  const direction = percentageChange > 0 ? "increase" : "decrease";
  const magnitude = Math.abs(percentageChange) > 20 ? "significant" : "moderate";
  
  return `${magnitude} ${direction} in lifetime net worth projection (${percentageChange.toFixed(1)}%)`;
};

const cfaValidationExports = {
  KENYA_CFA_PARAMETERS,
  calculateLifeExpectancy,
  calculateDiscountRates,
  calculateIncomeGrowth,
  validateCFAAssumptions,
  calculateAssumptionImpact
};

export default cfaValidationExports;
