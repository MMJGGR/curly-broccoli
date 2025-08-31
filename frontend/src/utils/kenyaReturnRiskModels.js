/**
 * Kenya-Specific Return/Risk Modeling Framework
 * CFA Institute-compliant methodologies adapted for Kenyan financial markets
 * References: JP Morgan LTCM, CFA Institute Portfolio Management Standards
 */

// Kenya Market Data (2024-2025 estimates)
export const KENYA_MARKET_DATA = {
  // Risk-free rate (91-day Treasury Bill)
  riskFreeRate: 0.145, // 14.5% as of 2024

  // Market risk premiums
  equityRiskPremium: 0.08, // 8% over risk-free rate
  bondRiskPremium: 0.03, // 3% over risk-free rate

  // Inflation expectations
  expectedInflation: 0.055, // 5.5% long-term expectation
  inflationVolatility: 0.025, // 2.5% volatility

  // Currency factors
  kshUsdVolatility: 0.12, // 12% annual volatility
  currencyRiskPremium: 0.02, // 2% for USD exposure

  // Real estate factors
  realEstateAppreciation: 0.07, // 7% annual in major urban areas
  realEstateLiquidity: 0.3, // 30% liquidity discount
};

// CFA-Compliant Asset Class Definitions for Kenya
export const KENYA_ASSET_CLASSES = {
  // EQUITIES
  nse_large_cap: {
    label: "NSE Large Cap Stocks",
    category: "equities",
    expectedReturn: 0.185, // 18.5% nominal
    volatility: 0.28, // 28% standard deviation
    sharpeRatio: 1.43,
    beta: 1.0,
    liquidityScore: 0.8,
    minimumInvestment: 1000,
    expenseRatio: 0.025, // 2.5% for managed funds
    taxImplications: {
      capitalGains: 0.05, // 5% withholding tax
      dividends: 0.05, // 5% withholding tax
    },
    correlations: {
      bonds: 0.2,
      realEstate: 0.3,
      international: 0.6,
    }
  },

  nse_small_cap: {
    label: "NSE Small Cap Stocks",
    category: "equities", 
    expectedReturn: 0.215, // 21.5% nominal (small cap premium)
    volatility: 0.35, // 35% standard deviation
    sharpeRatio: 2.0,
    beta: 1.3,
    liquidityScore: 0.4,
    minimumInvestment: 5000,
    expenseRatio: 0.03,
    taxImplications: {
      capitalGains: 0.05,
      dividends: 0.05,
    },
    correlations: {
      bonds: 0.1,
      realEstate: 0.2,
      international: 0.4,
    }
  },

  // FIXED INCOME
  government_bonds: {
    label: "Kenya Government Bonds",
    category: "fixed_income",
    expectedReturn: 0.175, // 17.5% nominal
    volatility: 0.08, // 8% standard deviation
    sharpeRatio: 3.75,
    duration: 7.5, // Modified duration
    creditRating: "B+",
    liquidityScore: 0.9,
    minimumInvestment: 50000,
    expenseRatio: 0.005,
    taxImplications: {
      interest: 0.15, // 15% withholding tax
    },
    correlations: {
      equities: 0.2,
      realEstate: 0.1,
    }
  },

  corporate_bonds: {
    label: "Kenya Corporate Bonds",
    category: "fixed_income",
    expectedReturn: 0.195, // 19.5% nominal (credit spread)
    volatility: 0.12, // 12% standard deviation
    sharpeRatio: 4.17,
    duration: 5.0,
    creditRating: "BB-",
    liquidityScore: 0.6,
    minimumInvestment: 100000,
    expenseRatio: 0.01,
    taxImplications: {
      interest: 0.15,
    }
  },

  // REAL ESTATE
  residential_property: {
    label: "Kenyan Residential Property",
    category: "real_estate",
    expectedReturn: 0.115, // 11.5% (7% appreciation + 4.5% rental yield)
    volatility: 0.15, // 15% standard deviation
    sharpeRatio: -1.93, // Negative due to liquidity premium
    liquidityScore: 0.2, // Very illiquid
    minimumInvestment: 2000000, // 2M KES minimum
    ongoingCosts: {
      maintenance: 0.02, // 2% annually
      management: 0.08, // 8% of rental income
      insurance: 0.005, // 0.5% of property value
      taxes: 0.01, // 1% property tax
    },
    taxImplications: {
      rentalIncome: 0.3, // 30% marginal rate
      capitalGains: 0.05,
    },
    correlations: {
      equities: 0.3,
      bonds: 0.1,
    }
  },

  commercial_property: {
    label: "Kenyan Commercial Property",
    category: "real_estate", 
    expectedReturn: 0.135, // 13.5% (8% appreciation + 5.5% rental yield)
    volatility: 0.18,
    sharpeRatio: -0.56,
    liquidityScore: 0.15,
    minimumInvestment: 5000000,
    ongoingCosts: {
      maintenance: 0.025,
      management: 0.1,
      insurance: 0.008,
      taxes: 0.015,
    },
    taxImplications: {
      rentalIncome: 0.3,
      capitalGains: 0.05,
    }
  },

  // INTERNATIONAL EXPOSURE
  international_equities: {
    label: "International Equity Funds",
    category: "international",
    expectedReturn: 0.155, // 15.5% in KES terms (includes currency risk)
    volatility: 0.22, // 22% (including currency volatility)
    sharpeRatio: 0.45,
    currencyExposure: "USD",
    liquidityScore: 0.9,
    minimumInvestment: 10000,
    expenseRatio: 0.015,
    taxImplications: {
      capitalGains: 0.05,
      dividends: 0.05,
    }
  },

  // ALTERNATIVE INVESTMENTS
  savings_account: {
    label: "High-Yield Savings Account",
    category: "cash_equivalents",
    expectedReturn: 0.08, // 8% nominal
    volatility: 0.0, // Assumed risk-free
    sharpeRatio: Infinity,
    liquidityScore: 1.0,
    minimumInvestment: 0,
    expenseRatio: 0.0,
    taxImplications: {
      interest: 0.15,
    }
  },

  money_market: {
    label: "Money Market Fund",
    category: "cash_equivalents",
    expectedReturn: 0.125, // 12.5% nominal
    volatility: 0.02, // 2% standard deviation
    sharpeRatio: -10.0,
    liquidityScore: 0.95,
    minimumInvestment: 1000,
    expenseRatio: 0.01,
    taxImplications: {
      interest: 0.15,
    }
  },

  // RETIREMENT ACCOUNTS
  nssf_contributions: {
    label: "NSSF Contributions",
    category: "retirement",
    expectedReturn: 0.10, // 10% historical average
    volatility: 0.06, // 6% standard deviation
    liquidityScore: 0.0, // Locked until retirement
    minimumInvestment: 400, // Monthly minimum
    expenseRatio: 0.02,
    taxImplications: {
      contributions: -0.3, // Tax deductible
      withdrawals: 0.05, // Taxed on withdrawal
    }
  },

  individual_pension: {
    label: "Individual Pension Scheme",
    category: "retirement",
    expectedReturn: 0.135, // 13.5% nominal
    volatility: 0.12, // 12% standard deviation
    liquidityScore: 0.1, // Limited liquidity
    minimumInvestment: 1000,
    expenseRatio: 0.025,
    taxImplications: {
      contributions: -0.3, // Tax deductible up to limits
      withdrawals: 0.05,
    }
  },
};

/**
 * Calculate CFA-compliant expected returns with Kenya-specific adjustments
 * @param {string} assetType - Asset type from KENYA_ASSET_CLASSES
 * @param {number} timeHorizon - Investment time horizon in years
 * @param {object} assumptions - Custom assumptions object
 * @returns {object} Risk/return metrics
 */
export const calculateKenyaAssetReturns = (assetType, timeHorizon = 10, assumptions = {}) => {
  const asset = KENYA_ASSET_CLASSES[assetType];
  if (!asset) {
    throw new Error(`Unknown asset type: ${assetType}`);
  }

  // Apply CFA methodology adjustments
  const marketData = { ...KENYA_MARKET_DATA, ...assumptions };
  
  // Time horizon adjustments (mean reversion for longer periods)
  const meanReversionFactor = Math.min(1.0, 0.7 + (timeHorizon * 0.03));
  const adjustedReturn = asset.expectedReturn * meanReversionFactor;
  
  // Volatility adjustments for time horizon
  const annualizedVolatility = asset.volatility / Math.sqrt(Math.min(timeHorizon, 20));
  
  // Risk-adjusted return calculations
  const realReturn = adjustedReturn - marketData.expectedInflation;
  const riskAdjustedReturn = adjustedReturn - (asset.volatility * 0.5 * asset.volatility); // Variance drag
  
  // Liquidity premium adjustment
  const liquidityDiscount = (1 - asset.liquidityScore) * 0.02; // Up to 2% discount
  const liquidityAdjustedReturn = adjustedReturn - liquidityDiscount;

  // Calculate Value at Risk (95% confidence)
  const var95 = adjustedReturn - (1.645 * asset.volatility); // 95% VaR
  const cvar95 = adjustedReturn - (2.0 * asset.volatility); // Conditional VaR
  
  return {
    nominalReturn: adjustedReturn,
    realReturn: realReturn,
    riskAdjustedReturn: riskAdjustedReturn,
    liquidityAdjustedReturn: liquidityAdjustedReturn,
    volatility: annualizedVolatility,
    sharpeRatio: (adjustedReturn - marketData.riskFreeRate) / asset.volatility,
    var95: var95,
    cvar95: cvar95,
    liquidityScore: asset.liquidityScore,
    minimumInvestment: asset.minimumInvestment,
    expenseRatio: asset.expenseRatio || 0,
    taxEfficiency: calculateTaxEfficiency(asset),
    confidence: {
      low: adjustedReturn - asset.volatility,
      high: adjustedReturn + asset.volatility,
      range: asset.volatility * 2
    }
  };
};

/**
 * Calculate tax efficiency score (0-1, higher is better)
 */
const calculateTaxEfficiency = (asset) => {
  const taxImplications = asset.taxImplications || {};
  
  // Calculate weighted tax burden
  const capitalGainsTax = taxImplications.capitalGains || 0;
  const dividendTax = taxImplications.dividends || 0;
  const interestTax = taxImplications.interest || 0;
  const rentalTax = taxImplications.rentalIncome || 0;
  
  // Weight by typical income distribution for asset class
  let weightedTax = 0;
  if (asset.category === 'equities') {
    weightedTax = (capitalGainsTax * 0.7) + (dividendTax * 0.3);
  } else if (asset.category === 'fixed_income') {
    weightedTax = interestTax;
  } else if (asset.category === 'real_estate') {
    weightedTax = (rentalTax * 0.6) + (capitalGainsTax * 0.4);
  } else {
    weightedTax = Math.max(capitalGainsTax, dividendTax, interestTax);
  }
  
  return Math.max(0, 1 - (weightedTax / 0.3)); // Normalize against 30% tax rate
};

/**
 * Portfolio optimization using Modern Portfolio Theory (CFA-compliant)
 * @param {array} selectedAssets - Array of asset types
 * @param {object} constraints - Investment constraints
 * @returns {object} Optimized portfolio allocation
 */
export const optimizeKenyaPortfolio = (selectedAssets, constraints = {}) => {
  const {
    riskTolerance = 'moderate', // conservative, moderate, aggressive
    liquidityRequirement = 0.2, // 20% liquid assets
    timeHorizon = 10,
    maxSingleAsset = 0.4, // 40% maximum in any single asset
  } = constraints;

  // Risk tolerance mappings
  const riskProfiles = {
    conservative: { targetVolatility: 0.08, equityMax: 0.3 },
    moderate: { targetVolatility: 0.12, equityMax: 0.6 },
    aggressive: { targetVolatility: 0.18, equityMax: 0.8 }
  };

  const profile = riskProfiles[riskTolerance];
  const allocations = {};
  
  // Calculate metrics for each selected asset
  const assetMetrics = selectedAssets.map(assetType => ({
    type: assetType,
    ...calculateKenyaAssetReturns(assetType, timeHorizon),
    asset: KENYA_ASSET_CLASSES[assetType]
  }));

  // Simple optimization (in practice, would use quadratic programming)
  // Priority: Liquidity requirement -> Risk constraint -> Return maximization
  
  let remainingAllocation = 1.0;
  let remainingLiquidity = liquidityRequirement;
  
  // 1. Meet liquidity requirements first
  const liquidAssets = assetMetrics.filter(asset => asset.liquidityScore >= 0.8);
  liquidAssets.forEach(asset => {
    if (remainingLiquidity > 0) {
      const allocation = Math.min(remainingLiquidity, maxSingleAsset);
      allocations[asset.type] = allocation;
      remainingAllocation -= allocation;
      remainingLiquidity -= allocation;
    }
  });

  // 2. Allocate remaining funds based on risk-adjusted returns
  const nonLiquidAssets = assetMetrics.filter(asset => 
    asset.liquidityScore < 0.8 && !allocations[asset.type]
  );
  
  // Sort by Sharpe ratio (risk-adjusted return)
  nonLiquidAssets.sort((a, b) => b.sharpeRatio - a.sharpeRatio);
  
  nonLiquidAssets.forEach(asset => {
    if (remainingAllocation > 0) {
      const maxAllowedForAsset = Math.min(maxSingleAsset, remainingAllocation);
      let allocation = maxAllowedForAsset;
      
      // Adjust based on risk constraints
      if (asset.asset.category === 'equities') {
        allocation = Math.min(allocation, profile.equityMax * 0.5); // Conservative equity allocation
      }
      
      allocations[asset.type] = allocation;
      remainingAllocation -= allocation;
    }
  });

  // Calculate portfolio metrics
  const portfolioReturn = Object.keys(allocations).reduce((sum, assetType) => {
    const metrics = calculateKenyaAssetReturns(assetType, timeHorizon);
    return sum + (allocations[assetType] * metrics.nominalReturn);
  }, 0);

  const portfolioVolatility = Math.sqrt(
    Object.keys(allocations).reduce((variance, assetType) => {
      const metrics = calculateKenyaAssetReturns(assetType, timeHorizon);
      const weight = allocations[assetType];
      return variance + (weight * weight * metrics.volatility * metrics.volatility);
    }, 0)
  );

  const portfolioSharpe = (portfolioReturn - KENYA_MARKET_DATA.riskFreeRate) / portfolioVolatility;

  return {
    allocations,
    metrics: {
      expectedReturn: portfolioReturn,
      volatility: portfolioVolatility,
      sharpeRatio: portfolioSharpe,
      liquidityScore: Object.keys(allocations).reduce((sum, assetType) => {
        return sum + (allocations[assetType] * KENYA_ASSET_CLASSES[assetType].liquidityScore);
      }, 0)
    },
    projections: {
      year1: { low: portfolioReturn - portfolioVolatility, expected: portfolioReturn, high: portfolioReturn + portfolioVolatility },
      year5: { 
        low: Math.pow(1 + portfolioReturn - portfolioVolatility, 5) - 1,
        expected: Math.pow(1 + portfolioReturn, 5) - 1,
        high: Math.pow(1 + portfolioReturn + portfolioVolatility, 5) - 1
      },
      year10: {
        low: Math.pow(1 + portfolioReturn - portfolioVolatility, 10) - 1,
        expected: Math.pow(1 + portfolioReturn, 10) - 1,
        high: Math.pow(1 + portfolioReturn + portfolioVolatility, 10) - 1
      }
    }
  };
};

/**
 * Kenya-specific asset type mappings for form dropdowns
 */
export const getKenyaAssetCategories = () => ({
  equities: Object.keys(KENYA_ASSET_CLASSES)
    .filter(key => KENYA_ASSET_CLASSES[key].category === 'equities')
    .map(key => ({
      value: key,
      label: KENYA_ASSET_CLASSES[key].label,
      risk_level: KENYA_ASSET_CLASSES[key].volatility > 0.2 ? 'high' : 'moderate',
      is_liquid: KENYA_ASSET_CLASSES[key].liquidityScore >= 0.8,
      is_appreciating: KENYA_ASSET_CLASSES[key].expectedReturn > KENYA_MARKET_DATA.expectedInflation,
      minimum_investment: KENYA_ASSET_CLASSES[key].minimumInvestment
    })),

  fixed_income: Object.keys(KENYA_ASSET_CLASSES)
    .filter(key => KENYA_ASSET_CLASSES[key].category === 'fixed_income')
    .map(key => ({
      value: key,
      label: KENYA_ASSET_CLASSES[key].label,
      risk_level: 'low',
      is_liquid: KENYA_ASSET_CLASSES[key].liquidityScore >= 0.8,
      is_appreciating: true,
      minimum_investment: KENYA_ASSET_CLASSES[key].minimumInvestment
    })),

  real_estate: Object.keys(KENYA_ASSET_CLASSES)
    .filter(key => KENYA_ASSET_CLASSES[key].category === 'real_estate')
    .map(key => ({
      value: key,
      label: KENYA_ASSET_CLASSES[key].label,
      risk_level: 'moderate',
      is_liquid: false,
      is_appreciating: true,
      minimum_investment: KENYA_ASSET_CLASSES[key].minimumInvestment
    })),

  retirement: Object.keys(KENYA_ASSET_CLASSES)
    .filter(key => KENYA_ASSET_CLASSES[key].category === 'retirement')
    .map(key => ({
      value: key,
      label: KENYA_ASSET_CLASSES[key].label,
      risk_level: 'low',
      is_liquid: false,
      is_appreciating: true,
      minimum_investment: KENYA_ASSET_CLASSES[key].minimumInvestment
    })),

  cash_equivalents: Object.keys(KENYA_ASSET_CLASSES)
    .filter(key => KENYA_ASSET_CLASSES[key].category === 'cash_equivalents')
    .map(key => ({
      value: key,
      label: KENYA_ASSET_CLASSES[key].label,
      risk_level: 'low',
      is_liquid: true,
      is_appreciating: KENYA_ASSET_CLASSES[key].expectedReturn > KENYA_MARKET_DATA.expectedInflation,
      minimum_investment: KENYA_ASSET_CLASSES[key].minimumInvestment
    })),

  international: Object.keys(KENYA_ASSET_CLASSES)
    .filter(key => KENYA_ASSET_CLASSES[key].category === 'international')
    .map(key => ({
      value: key,
      label: KENYA_ASSET_CLASSES[key].label,
      risk_level: 'moderate',
      is_liquid: KENYA_ASSET_CLASSES[key].liquidityScore >= 0.8,
      is_appreciating: true,
      minimum_investment: KENYA_ASSET_CLASSES[key].minimumInvestment
    }))
});

const KenyaReturnRiskModels = {
  KENYA_MARKET_DATA,
  KENYA_ASSET_CLASSES,
  calculateKenyaAssetReturns,
  optimizeKenyaPortfolio,
  getKenyaAssetCategories
};

export default KenyaReturnRiskModels;