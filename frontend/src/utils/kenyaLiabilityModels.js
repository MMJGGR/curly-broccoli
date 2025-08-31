/**
 * Kenya-Specific Liability Cost Modeling Framework
 * CFA Institute-compliant debt analysis and liability management for Kenyan market
 */

// Kenya Debt Market Data (2024-2025)
export const KENYA_DEBT_MARKET = {
  // Benchmark rates
  centralBankRate: 0.125, // 12.5% CBK base rate
  interBankRate: 0.132, // 13.2% average interbank rate
  
  // Credit spreads by category
  creditSpreads: {
    prime: 0.02, // 2% spread for excellent credit
    standard: 0.045, // 4.5% spread for good credit
    subprime: 0.08, // 8% spread for poor credit
    secured: -0.015, // 1.5% discount for secured loans
  },

  // Sector-specific rates
  mortgageRates: {
    residential: 0.145, // 14.5% average mortgage rate
    commercial: 0.165, // 16.5% commercial property
  },

  // Default and delinquency rates
  defaultRates: {
    personal_loan: 0.08, // 8% annual default rate
    mortgage: 0.03, // 3% annual default rate
    credit_card: 0.12, // 12% annual default rate
    business_loan: 0.06, // 6% annual default rate
  },

  // Recovery rates (in case of default)
  recoveryRates: {
    secured: 0.75, // 75% recovery for secured debt
    unsecured: 0.25, // 25% recovery for unsecured debt
  }
};

// CFA-Compliant Liability Categories for Kenya
export const KENYA_LIABILITY_TYPES = {
  // MORTGAGE DEBT
  residential_mortgage: {
    label: "Residential Mortgage",
    category: "secured_debt",
    typical_rate: 0.145, // 14.5%
    rate_type: "fixed", // or "variable"
    typical_term_months: 240, // 20 years
    ltv_ratio: 0.85, // 85% loan-to-value
    processing_fees: 0.015, // 1.5% of loan amount
    ongoing_costs: {
      insurance: 0.002, // 0.2% of loan balance annually
      valuation: 0.0005, // 0.05% annually
      legal_fees: 0.001, // 0.1% annually
    },
    early_payment_penalty: 0.03, // 3% of outstanding balance
    tax_deductible: true, // Interest is tax deductible in Kenya
    default_probability: 0.03,
    recovery_rate: 0.75,
    collateral_depreciation: 0.02, // 2% annual depreciation of collateral value
  },

  commercial_mortgage: {
    label: "Commercial Property Mortgage", 
    category: "secured_debt",
    typical_rate: 0.165, // 16.5%
    rate_type: "variable",
    typical_term_months: 180, // 15 years
    ltv_ratio: 0.70, // 70% loan-to-value (more conservative)
    processing_fees: 0.02,
    ongoing_costs: {
      insurance: 0.003,
      valuation: 0.001,
      legal_fees: 0.002,
    },
    early_payment_penalty: 0.05,
    tax_deductible: true,
    default_probability: 0.04,
    recovery_rate: 0.70,
    collateral_depreciation: 0.03,
  },

  // PERSONAL LOANS
  personal_loan_secured: {
    label: "Secured Personal Loan",
    category: "secured_debt", 
    typical_rate: 0.155, // 15.5%
    rate_type: "fixed",
    typical_term_months: 48, // 4 years
    processing_fees: 0.02,
    ongoing_costs: {
      insurance: 0.015, // Credit life insurance
      administration: 0.005,
    },
    early_payment_penalty: 0.02,
    tax_deductible: false,
    default_probability: 0.06,
    recovery_rate: 0.60,
  },

  personal_loan_unsecured: {
    label: "Unsecured Personal Loan",
    category: "unsecured_debt",
    typical_rate: 0.195, // 19.5%
    rate_type: "fixed", 
    typical_term_months: 36, // 3 years
    processing_fees: 0.025,
    ongoing_costs: {
      insurance: 0.02,
      administration: 0.01,
    },
    early_payment_penalty: 0.04,
    tax_deductible: false,
    default_probability: 0.08,
    recovery_rate: 0.25,
  },

  // CREDIT CARDS
  credit_card: {
    label: "Credit Card Debt",
    category: "revolving_credit",
    typical_rate: 0.24, // 24% APR
    rate_type: "variable",
    minimum_payment_ratio: 0.03, // 3% of balance
    processing_fees: 0.0, // No processing fee for existing cards
    ongoing_costs: {
      annual_fee: 2500, // KES 2,500 annually
      overlimit_fee: 500, // KES 500 per incident
      late_fee: 1000, // KES 1,000 per late payment
    },
    grace_period: 25, // 25 days interest-free for purchases
    tax_deductible: false,
    default_probability: 0.12,
    recovery_rate: 0.20,
  },

  // BUSINESS LOANS
  business_term_loan: {
    label: "Business Term Loan",
    category: "business_debt",
    typical_rate: 0.165, // 16.5%
    rate_type: "variable",
    typical_term_months: 60, // 5 years
    processing_fees: 0.025,
    ongoing_costs: {
      guarantee_fee: 0.01, // 1% annually for guarantee
      monitoring_fee: 0.005,
    },
    collateral_requirement: 1.2, // 120% collateral coverage
    tax_deductible: true,
    default_probability: 0.06,
    recovery_rate: 0.50,
  },

  business_overdraft: {
    label: "Business Overdraft",
    category: "revolving_credit",
    typical_rate: 0.18, // 18%
    rate_type: "variable",
    processing_fees: 0.01,
    ongoing_costs: {
      facility_fee: 0.015, // 1.5% of limit annually
      commitment_fee: 0.005, // 0.5% on undrawn portion
    },
    tax_deductible: true,
    default_probability: 0.05,
    recovery_rate: 0.45,
  },

  // VEHICLE LOANS
  vehicle_loan: {
    label: "Vehicle Loan",
    category: "secured_debt",
    typical_rate: 0.155, // 15.5%
    rate_type: "fixed",
    typical_term_months: 60, // 5 years
    ltv_ratio: 0.85, // 85% of vehicle value
    processing_fees: 0.02,
    ongoing_costs: {
      insurance: 0.05, // 5% of vehicle value annually (comprehensive)
      tracking_fee: 3600, // KES 300 per month for GPS tracking
    },
    early_payment_penalty: 0.03,
    tax_deductible: false, // Personal use
    default_probability: 0.07,
    recovery_rate: 0.60,
    collateral_depreciation: 0.15, // 15% annual vehicle depreciation
  },

  // EDUCATION LOANS
  education_loan: {
    label: "Education/Student Loan",
    category: "special_purpose",
    typical_rate: 0.12, // 12% (subsidized rate)
    rate_type: "fixed",
    typical_term_months: 120, // 10 years
    grace_period_months: 12, // 1 year after graduation
    processing_fees: 0.01,
    ongoing_costs: {
      administration: 0.005,
    },
    tax_deductible: false,
    default_probability: 0.05,
    recovery_rate: 0.30,
  },

  // MICROFINANCE
  microfinance_loan: {
    label: "Microfinance Loan",
    category: "unsecured_debt",
    typical_rate: 0.28, // 28% (high rate due to risk)
    rate_type: "fixed",
    typical_term_months: 12, // 1 year
    processing_fees: 0.03,
    ongoing_costs: {
      group_fee: 500, // Monthly group fee
      insurance: 0.02,
    },
    tax_deductible: false, // Usually personal/business mix
    default_probability: 0.10,
    recovery_rate: 0.35, // Group guarantee helps recovery
  }
};

/**
 * Calculate comprehensive liability cost analysis using CFA methodology
 * @param {string} liabilityType - Type from KENYA_LIABILITY_TYPES
 * @param {number} principalAmount - Initial loan amount in KES
 * @param {number} termMonths - Loan term in months
 * @param {number} interestRate - Annual interest rate (optional, uses typical if not provided)
 * @param {object} customAssumptions - Additional assumptions
 * @returns {object} Comprehensive cost analysis
 */
export const calculateLiabilityCosts = (
  liabilityType, 
  principalAmount, 
  termMonths = null, 
  interestRate = null,
  customAssumptions = {}
) => {
  const liability = KENYA_LIABILITY_TYPES[liabilityType];
  if (!liability) {
    throw new Error(`Unknown liability type: ${liabilityType}`);
  }

  // Use provided parameters or defaults
  const term = termMonths || liability.typical_term_months;
  const rate = interestRate || liability.typical_rate;
  const monthlyRate = rate / 12;

  // Calculate monthly payment for amortizing loans
  let monthlyPayment;
  if (liability.category === 'revolving_credit') {
    // For credit cards/overdrafts, use minimum payment ratio
    monthlyPayment = principalAmount * (liability.minimum_payment_ratio || 0.03);
  } else {
    // Standard loan payment calculation
    if (monthlyRate === 0) {
      monthlyPayment = principalAmount / term;
    } else {
      monthlyPayment = principalAmount * 
        (monthlyRate * Math.pow(1 + monthlyRate, term)) / 
        (Math.pow(1 + monthlyRate, term) - 1);
    }
  }

  // Calculate total interest over life of loan
  const totalPayments = monthlyPayment * term;
  const totalInterest = totalPayments - principalAmount;

  // Processing and ongoing costs
  const processingFees = principalAmount * liability.processing_fees;
  
  // Calculate ongoing costs
  let annualOngoingCosts = 0;
  Object.entries(liability.ongoing_costs || {}).forEach(([costType, costValue]) => {
    if (typeof costValue === 'number') {
      if (costValue < 1) {
        // Percentage of loan balance or principal
        annualOngoingCosts += principalAmount * costValue;
      } else {
        // Fixed amount
        annualOngoingCosts += costValue;
      }
    }
  });

  const totalOngoingCosts = annualOngoingCosts * (term / 12);

  // Risk-adjusted costs (expected loss from default)
  const expectedLoss = principalAmount * liability.default_probability * 
    (1 - liability.recovery_rate);

  // Tax benefits (if applicable)
  let taxBenefit = 0;
  if (liability.tax_deductible && customAssumptions.marginalTaxRate) {
    taxBenefit = totalInterest * customAssumptions.marginalTaxRate;
  }

  // Net present value of liability (CFA methodology)
  let npvLiability = principalAmount; // Initial amount received
  for (let month = 1; month <= term; month++) {
    // Discount monthly payments back to present value
    const discountRate = (customAssumptions.discountRate || 0.12) / 12;
    npvLiability -= monthlyPayment / Math.pow(1 + discountRate, month);
  }
  npvLiability -= processingFees; // Subtract upfront costs
  npvLiability += taxBenefit; // Add tax benefits

  // Effective interest rate (including all costs)
  const effectiveRate = ((totalPayments + processingFees + totalOngoingCosts - taxBenefit - principalAmount) / principalAmount) / (term / 12);

  // Debt service coverage ratio (if income provided)
  let debtServiceRatio = null;
  if (customAssumptions.monthlyIncome) {
    debtServiceRatio = monthlyPayment / customAssumptions.monthlyIncome;
  }

  // Collateral analysis (for secured debt)
  let collateralAnalysis = null;
  if (liability.ltv_ratio && customAssumptions.collateralValue) {
    const currentLTV = principalAmount / customAssumptions.collateralValue;
    const depreciation = liability.collateral_depreciation || 0;
    const projectedCollateralValue = customAssumptions.collateralValue * 
      Math.pow(1 - depreciation, term / 12);
    
    collateralAnalysis = {
      initialLTV: currentLTV,
      maxLTV: liability.ltv_ratio,
      projectedCollateralValue: projectedCollateralValue,
      collateralCoverage: projectedCollateralValue / principalAmount,
      isAdequate: projectedCollateralValue >= principalAmount * 0.8
    };
  }

  // Refinancing analysis
  const marketRate = KENYA_DEBT_MARKET.centralBankRate + 
    KENYA_DEBT_MARKET.creditSpreads.standard;
  const refinancingSavings = rate > marketRate ? 
    (rate - marketRate) * principalAmount * (term / 12) : 0;

  return {
    // Basic payment structure
    principalAmount,
    monthlyPayment,
    totalPayments,
    totalInterest,
    term,
    interestRate: rate,

    // Cost analysis
    processingFees,
    annualOngoingCosts,
    totalOngoingCosts,
    expectedLoss,
    taxBenefit,
    effectiveRate,

    // Advanced metrics
    npvLiability,
    debtServiceRatio,
    collateralAnalysis,

    // Market analysis
    refinancingSavings,
    isAboveMarket: rate > marketRate,
    marketRate,

    // Risk metrics
    defaultProbability: liability.default_probability,
    recoveryRate: liability.recovery_rate,

    // Category information
    category: liability.category,
    isSecured: liability.category.includes('secured'),
    isTaxDeductible: liability.tax_deductible,

    // Optimization recommendations
    recommendations: generateLiabilityRecommendations(liability, rate, marketRate, debtServiceRatio)
  };
};

/**
 * Generate CFA-compliant liability management recommendations
 */
const generateLiabilityRecommendations = (liability, currentRate, marketRate, debtServiceRatio) => {
  const recommendations = [];

  // Rate-based recommendations
  if (currentRate > marketRate + 0.02) {
    recommendations.push({
      type: "refinancing",
      priority: "high",
      message: `Consider refinancing - current rate (${(currentRate * 100).toFixed(1)}%) is ${((currentRate - marketRate) * 100).toFixed(1)}% above market`,
      potential_savings: (currentRate - marketRate) * 100000 // Example for 100k loan
    });
  }

  // Debt service ratio recommendations
  if (debtServiceRatio && debtServiceRatio > 0.36) {
    recommendations.push({
      type: "debt_consolidation",
      priority: "high", 
      message: `Debt service ratio (${(debtServiceRatio * 100).toFixed(1)}%) exceeds CFA recommendation of 36%`,
      action: "Consider debt consolidation or term extension"
    });
  }

  // Category-specific recommendations
  if (liability.category === 'revolving_credit') {
    recommendations.push({
      type: "payment_strategy",
      priority: "medium",
      message: "Pay more than minimum payment to reduce interest costs",
      action: "Target highest-rate debt first (avalanche method)"
    });
  }

  // Early payment analysis
  if (liability.early_payment_penalty < 0.02) {
    recommendations.push({
      type: "early_payment",
      priority: "low",
      message: "Low early payment penalty - consider accelerated payments",
      action: "Evaluate opportunity cost vs. investment returns"
    });
  }

  return recommendations;
};

/**
 * Calculate portfolio-level debt analysis
 * @param {array} liabilities - Array of liability objects
 * @param {object} assumptions - Global assumptions
 * @returns {object} Portfolio debt analysis
 */
export const analyzeDebtPortfolio = (liabilities, assumptions = {}) => {
  let totalDebt = 0;
  let totalMonthlyPayments = 0;
  let weightedAverageRate = 0;
  let totalTaxBenefit = 0;
  let highRiskDebt = 0;

  const analyses = liabilities.map(liability => {
    const analysis = calculateLiabilityCosts(
      liability.type, 
      liability.amount, 
      liability.term, 
      liability.rate,
      assumptions
    );
    
    totalDebt += liability.amount;
    totalMonthlyPayments += analysis.monthlyPayment;
    weightedAverageRate += (liability.amount / totalDebt) * analysis.interestRate;
    totalTaxBenefit += analysis.taxBenefit;
    
    if (analysis.interestRate > 0.20) { // High-rate debt
      highRiskDebt += liability.amount;
    }
    
    return analysis;
  });

  // Portfolio-level metrics
  const debtToIncomeRatio = assumptions.monthlyIncome ? 
    totalMonthlyPayments / assumptions.monthlyIncome : null;

  const averageMaturity = liabilities.reduce((sum, liability, index) => {
    return sum + (liability.amount / totalDebt) * analyses[index].term;
  }, 0);

  // Debt avalanche vs snowball analysis
  const avalancheOrder = analyses
    .map((analysis, index) => ({ index, rate: analysis.effectiveRate, balance: liabilities[index].amount }))
    .sort((a, b) => b.rate - a.rate);

  const snowballOrder = analyses
    .map((analysis, index) => ({ index, rate: analysis.effectiveRate, balance: liabilities[index].amount }))
    .sort((a, b) => a.balance - b.balance);

  return {
    summary: {
      totalDebt,
      totalMonthlyPayments,
      weightedAverageRate,
      debtToIncomeRatio,
      averageMaturity,
      totalTaxBenefit,
      highRiskDebt,
      highRiskPercentage: highRiskDebt / totalDebt
    },
    analyses,
    strategies: {
      avalanche: avalancheOrder,
      snowball: snowballOrder,
      recommendedStrategy: debtToIncomeRatio > 0.36 ? "avalanche" : "snowball"
    },
    recommendations: generatePortfolioRecommendations(totalDebt, totalMonthlyPayments, debtToIncomeRatio, highRiskDebt / totalDebt)
  };
};

/**
 * Generate portfolio-level debt recommendations
 */
const generatePortfolioRecommendations = (totalDebt, monthlyPayments, debtToIncomeRatio, highRiskRatio) => {
  const recommendations = [];

  if (debtToIncomeRatio > 0.36) {
    recommendations.push({
      type: "emergency",
      priority: "critical",
      message: "Debt service ratio exceeds safe limits - immediate action required",
      actions: ["Debt consolidation", "Income increase strategies", "Expense reduction", "Professional debt counseling"]
    });
  }

  if (highRiskRatio > 0.3) {
    recommendations.push({
      type: "high_interest_debt",
      priority: "high",
      message: "High proportion of expensive debt - prioritize elimination",
      actions: ["Debt avalanche strategy", "Balance transfer opportunities", "Refinancing analysis"]
    });
  }

  if (totalDebt < 500000 && monthlyPayments < 15000) {
    recommendations.push({
      type: "optimization",
      priority: "medium",
      message: "Debt levels manageable - focus on optimization",
      actions: ["Rate negotiation", "Early payment strategies", "Tax optimization"]
    });
  }

  return recommendations;
};

// Kenya liability classes for CFA analysis
export const KENYA_LIABILITY_CLASSES = {
  SHORT_TERM: {
    name: "Short-term Liabilities",
    maxDuration: 12, // months
    categories: ["credit_cards", "payroll_liabilities", "accrued_expenses"]
  },
  MEDIUM_TERM: {
    name: "Medium-term Liabilities",
    maxDuration: 60, // months
    categories: ["vehicle_loans", "equipment_financing", "trade_credit"]
  },
  LONG_TERM: {
    name: "Long-term Liabilities",
    maxDuration: null,
    categories: ["mortgage", "business_loans", "bonds"]
  }
};

// CFA-compliant present value calculation for liabilities
export const calculateLiabilityPresentValue = (
  paymentAmount,
  discountRate,
  numberOfPayments,
  paymentFrequency = 12
) => {
  if (!paymentAmount || !discountRate || !numberOfPayments) return 0;
  
  const periodicRate = discountRate / paymentFrequency;
  const presentValue = paymentAmount * (
    (1 - Math.pow(1 + periodicRate, -numberOfPayments)) / periodicRate
  );
  
  return Math.round(presentValue * 100) / 100;
};

const KenyaLiabilityModels = {
  KENYA_DEBT_MARKET,
  KENYA_LIABILITY_TYPES,
  calculateLiabilityCosts,
  analyzeDebtPortfolio
};

export default KenyaLiabilityModels;