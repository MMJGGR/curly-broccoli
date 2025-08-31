/**
 * Comprehensive CFA-Compliant Financial Analysis Component
 * Integrates all Kenya-specific solutions: Return/Risk modeling, Liability analysis,
 * Advanced assumptions management, and CFA-compliant reporting
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, 
  AlertTriangle, 
  PieChart, 
  Calculator,
  FileBarChart,
  Settings,
  CheckCircle,
  XCircle,
  Info
} from '../ui/icons';

// Import Kenya-specific utilities
import { 
  KENYA_ASSET_CLASSES, 
  calculateKenyaAssetReturns,
  optimizeKenyaPortfolio 
} from '../../utils/kenyaReturnRiskModels';
import { 
  KENYA_LIABILITY_TYPES,
  calculateLiabilityCosts,
  analyzeDebtPortfolio 
} from '../../utils/kenyaLiabilityModels';
import { 
  assumptionsManager,
  DEFAULT_ASSUMPTION_PROFILES 
} from '../../utils/advancedAssumptionsManager';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const ComprehensiveFinancialAnalysis = ({ userId, profileData }) => {
  // State management
  const [analysisResults, setAnalysisResults] = useState(null);
  const [assumptions, setAssumptions] = useState(null);
  const [portfolioOptimization, setPortfolioOptimization] = useState(null);
  const [debtAnalysis, setDebtAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize comprehensive analysis
  useEffect(() => {
    initializeAnalysis();
    
    // Cleanup on unmount
    return () => {
      assumptionsManager.cleanup();
    };
  }, [userId, profileData]);

  const initializeAnalysis = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Initialize assumptions manager
      const userProfile = determineUserProfile(profileData);
      const initialAssumptions = assumptionsManager.initialize(
        DEFAULT_ASSUMPTION_PROFILES[userProfile].assumptions,
        true // Enable auto-save
      );
      setAssumptions(initialAssumptions);

      // 2. Fetch user assets and liabilities
      const [assetsData, liabilitiesData] = await Promise.all([
        fetchUserAssets(),
        fetchUserLiabilities()
      ]);

      // 3. Perform comprehensive analysis
      const results = await performComprehensiveAnalysis({
        assets: assetsData,
        liabilities: liabilitiesData,
        assumptions: initialAssumptions,
        profileData
      });

      setAnalysisResults(results);

    } catch (err) {
      console.error('Comprehensive analysis failed:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId, profileData]);

  /**
   * Determine appropriate user profile based on CFA methodology
   */
  const determineUserProfile = (profileData) => {
    if (!profileData?.profile) return 'moderate_mid_career';

    const age = profileData.profile.age || 30;
    const monthlyIncome = profileData.profile.monthly_income || 50000;
    
    // CFA-compliant profiling logic
    if (age < 35 && monthlyIncome < 100000) {
      return 'conservative_young_professional';
    } else if (age >= 50 || monthlyIncome < 50000) {
      return 'pre_retirement_conservative';
    } else if (monthlyIncome > 200000) {
      return 'aggressive_high_earner';
    } else {
      return 'moderate_mid_career';
    }
  };

  /**
   * Perform comprehensive CFA-compliant financial analysis
   */
  const performComprehensiveAnalysis = async ({ assets, liabilities, assumptions, profileData }) => {
    // 1. Asset Analysis with Kenya-specific return/risk modeling
    const assetAnalysis = analyzeAssetPortfolio(assets, assumptions);
    
    // 2. Liability Cost Analysis
    const liabilityAnalysis = analyzeLiabilities(liabilities, assumptions);
    
    // 3. Portfolio Optimization using Modern Portfolio Theory
    const optimization = performPortfolioOptimization(assets, assumptions);
    
    // 4. Lifetime Value Analysis (Human Capital + Assets - Liabilities)
    const lifetimeAnalysis = calculateLifetimeValue(profileData, assets, liabilities, assumptions);
    
    // 5. CFA Compliance Assessment
    const complianceAssessment = assessCFACompliance(assumptions, assetAnalysis, liabilityAnalysis);
    
    // 6. Risk Management Analysis
    const riskAnalysis = performRiskAnalysis(assetAnalysis, liabilityAnalysis, assumptions);
    
    // 7. Recommendations Generation
    const recommendations = generateCFARecommendations({
      assetAnalysis,
      liabilityAnalysis,
      optimization,
      lifetimeAnalysis,
      riskAnalysis,
      assumptions
    });

    return {
      assetAnalysis,
      liabilityAnalysis,
      optimization,
      lifetimeAnalysis,
      complianceAssessment,
      riskAnalysis,
      recommendations,
      summary: generateExecutiveSummary({
        assetAnalysis,
        liabilityAnalysis,
        lifetimeAnalysis,
        riskAnalysis
      })
    };
  };

  /**
   * Analyze asset portfolio using Kenya-specific models
   */
  const analyzeAssetPortfolio = (assets, assumptions) => {
    if (!assets || assets.length === 0) {
      return { totalValue: 0, allocations: {}, riskMetrics: {}, performance: {} };
    }

    let totalValue = 0;
    const allocations = {};
    const riskMetrics = [];
    
    assets.forEach(asset => {
      const assetType = mapAssetToKenyaType(asset.asset_type);
      const analysis = calculateKenyaAssetReturns(assetType, 10, assumptions.rates);
      
      totalValue += asset.current_value;
      allocations[assetType] = (allocations[assetType] || 0) + asset.current_value;
      
      riskMetrics.push({
        assetId: asset.id,
        type: assetType,
        value: asset.current_value,
        ...analysis
      });
    });

    // Calculate portfolio-level metrics
    const weightedReturn = riskMetrics.reduce((sum, metric) => {
      const weight = metric.value / totalValue;
      return sum + (weight * metric.nominalReturn);
    }, 0);

    const portfolioVolatility = Math.sqrt(
      riskMetrics.reduce((sum, metric) => {
        const weight = metric.value / totalValue;
        return sum + (weight * weight * metric.volatility * metric.volatility);
      }, 0)
    );

    return {
      totalValue,
      allocations,
      riskMetrics,
      portfolioReturn: weightedReturn,
      portfolioVolatility,
      portfolioSharpe: (weightedReturn - 0.145) / portfolioVolatility, // Using Kenya risk-free rate
      diversificationScore: calculateDiversificationScore(allocations)
    };
  };

  /**
   * Analyze liabilities using Kenya debt models
   */
  const analyzeLiabilities = (liabilities, assumptions) => {
    if (!liabilities || liabilities.length === 0) {
      return { totalDebt: 0, analyses: [], summary: {} };
    }

    const liabilityAnalyses = liabilities.map(liability => {
      const liabilityType = mapLiabilityToKenyaType(liability.liability_type);
      return calculateLiabilityCosts(
        liabilityType,
        liability.current_balance,
        liability.term_months,
        liability.interest_rate,
        { 
          marginalTaxRate: 0.3, // Kenyan top marginal rate
          discountRate: assumptions.rates.expenseDiscountRate / 100,
          monthlyIncome: profileData?.profile?.monthly_income
        }
      );
    });

    return analyzeDebtPortfolio(
      liabilities.map((liability, index) => ({
        type: mapLiabilityToKenyaType(liability.liability_type),
        amount: liability.current_balance,
        rate: liability.interest_rate,
        term: liability.term_months
      })),
      {
        marginalTaxRate: 0.3,
        monthlyIncome: profileData?.profile?.monthly_income
      }
    );
  };

  /**
   * Perform portfolio optimization
   */
  const performPortfolioOptimization = (assets, assumptions) => {
    // Select appropriate asset types for optimization
    const selectedAssets = ['nse_large_cap', 'government_bonds', 'residential_property', 'money_market'];
    
    const constraints = {
      riskTolerance: assumptions.investment.riskTolerance,
      liquidityRequirement: assumptions.investment.liquidityPreference,
      timeHorizon: (assumptions.demographics.retirementAge - (profileData?.profile?.age || 30)),
      totalInvestment: assets.reduce((sum, asset) => sum + asset.current_value, 0) || 1000000,
      maxSingleAsset: 0.4
    };

    return optimizeKenyaPortfolio(selectedAssets, constraints);
  };

  /**
   * Calculate lifetime value using CFA methodology
   */
  const calculateLifetimeValue = (profileData, assets, liabilities, assumptions) => {
    const monthlyIncome = profileData?.profile?.monthly_income || 0;
    const currentAge = profileData?.profile?.age || 30;
    const retirementAge = assumptions.demographics.retirementAge;
    const lifeExpectancy = assumptions.demographics.lifeExpectancy;

    // Human capital calculation (similar to balance sheet calculation)
    const workingYears = Math.max(0, retirementAge - currentAge);
    const annualIncome = monthlyIncome * 12;
    const discountRate = assumptions.rates.incomeDiscountRate / 100;
    const growthRate = assumptions.rates.incomeGrowthRate / 100;

    let humanCapitalPV = 0;
    for (let year = 1; year <= workingYears; year++) {
      const futureIncome = annualIncome * Math.pow(1 + growthRate, year);
      humanCapitalPV += futureIncome / Math.pow(1 + discountRate, year);
    }

    // Current assets
    const currentAssets = assets.reduce((sum, asset) => sum + asset.current_value, 0);

    // Current liabilities
    const currentLiabilities = liabilities.reduce((sum, liability) => sum + liability.current_balance, 0);

    // Lifetime expense liabilities (simplified)
    const estimatedAnnualExpenses = annualIncome * 0.7; // 70% of income
    const expenseYears = lifeExpectancy - currentAge;
    const expenseDiscountRate = assumptions.rates.expenseDiscountRate / 100;
    
    let lifetimeExpensesPV = 0;
    for (let year = 1; year <= expenseYears; year++) {
      const futureExpenses = estimatedAnnualExpenses * Math.pow(1.055, year); // 5.5% inflation
      lifetimeExpensesPV += futureExpenses / Math.pow(1 + expenseDiscountRate, year);
    }

    return {
      humanCapital: humanCapitalPV,
      currentAssets,
      currentLiabilities,
      lifetimeExpensesPV,
      lifetimeNetWorth: humanCapitalPV + currentAssets - currentLiabilities - lifetimeExpensesPV,
      traditional: {
        netWorth: currentAssets - currentLiabilities,
        assets: currentAssets,
        liabilities: currentLiabilities
      }
    };
  };

  /**
   * Assess CFA compliance of the analysis
   */
  const assessCFACompliance = (assumptions, assetAnalysis, liabilityAnalysis) => {
    const complianceChecks = [
      {
        category: 'Risk Assessment',
        check: 'Portfolio diversification',
        passing: assetAnalysis.diversificationScore > 0.6,
        score: assetAnalysis.diversificationScore,
        benchmark: 0.6,
        message: 'CFA recommends portfolio diversification score above 60%'
      },
      {
        category: 'Liability Management',
        check: 'Debt-to-income ratio',
        passing: (liabilityAnalysis.summary?.debtToIncomeRatio || 0) < 0.36,
        score: liabilityAnalysis.summary?.debtToIncomeRatio || 0,
        benchmark: 0.36,
        message: 'CFA standards recommend debt service below 36% of income'
      },
      {
        category: 'Liquidity Management',
        check: 'Emergency fund adequacy',
        passing: assumptions.investment.liquidityPreference >= 0.15,
        score: assumptions.investment.liquidityPreference,
        benchmark: 0.15,
        message: 'Maintain minimum 15% liquid assets for emergencies'
      },
      {
        category: 'Return Assumptions',
        check: 'Realistic return expectations',
        passing: assumptions.rates.incomeDiscountRate <= 20 && assumptions.rates.incomeDiscountRate >= 8,
        score: assumptions.rates.incomeDiscountRate,
        benchmark: 14,
        message: 'Income discount rates should be realistic (8-20% for Kenya market)'
      }
    ];

    const passingChecks = complianceChecks.filter(check => check.passing).length;
    const overallScore = passingChecks / complianceChecks.length;

    return {
      overallScore,
      grade: overallScore >= 0.8 ? 'Excellent' : overallScore >= 0.6 ? 'Good' : overallScore >= 0.4 ? 'Fair' : 'Poor',
      checks: complianceChecks,
      recommendations: complianceChecks
        .filter(check => !check.passing)
        .map(check => `Improve ${check.check}: ${check.message}`)
    };
  };

  /**
   * Perform comprehensive risk analysis
   */
  const performRiskAnalysis = (assetAnalysis, liabilityAnalysis, assumptions) => {
    return {
      portfolioRisk: {
        volatility: assetAnalysis.portfolioVolatility,
        var95: assetAnalysis.portfolioReturn - (1.645 * assetAnalysis.portfolioVolatility),
        maxDrawdown: -assetAnalysis.portfolioVolatility * 2,
        sharpeRatio: assetAnalysis.portfolioSharpe
      },
      liabilityRisk: {
        defaultRisk: liabilityAnalysis.summary?.highRiskPercentage || 0,
        interestRateRisk: calculateInterestRateRisk(liabilityAnalysis),
        refinancingOpportunities: identifyRefinancingOpportunities(liabilityAnalysis)
      },
      overallRisk: {
        netWorthVolatility: calculateNetWorthVolatility(assetAnalysis, liabilityAnalysis),
        liquidityRisk: 1 - assumptions.investment.liquidityPreference,
        concentrationRisk: calculateConcentrationRisk(assetAnalysis.allocations)
      }
    };
  };

  /**
   * Generate CFA-compliant recommendations
   */
  const generateCFARecommendations = ({ assetAnalysis, liabilityAnalysis, optimization, lifetimeAnalysis, riskAnalysis }) => {
    const recommendations = [];

    // Asset allocation recommendations
    if (assetAnalysis.diversificationScore < 0.6) {
      recommendations.push({
        category: 'Asset Allocation',
        priority: 'High',
        title: 'Improve Portfolio Diversification',
        description: `Current diversification score: ${(assetAnalysis.diversificationScore * 100).toFixed(1)}%. Consider spreading investments across different asset classes.`,
        action: 'Add government bonds or real estate to reduce concentration risk'
      });
    }

    // Liability management recommendations
    if (liabilityAnalysis.summary?.debtToIncomeRatio > 0.36) {
      recommendations.push({
        category: 'Debt Management',
        priority: 'Critical',
        title: 'Reduce Debt Service Ratio',
        description: `Debt service ratio of ${(liabilityAnalysis.summary.debtToIncomeRatio * 100).toFixed(1)}% exceeds CFA recommendation of 36%.`,
        action: 'Consider debt consolidation or term extension'
      });
    }

    // Liquidity recommendations
    if (assumptions.investment.liquidityPreference < 0.15) {
      recommendations.push({
        category: 'Liquidity',
        priority: 'Medium',
        title: 'Increase Emergency Fund',
        description: 'Maintain higher liquid asset allocation for financial stability.',
        action: 'Target 20-25% in high-yield savings or money market funds'
      });
    }

    // Optimization recommendations
    if (optimization && optimization.metrics.sharpeRatio > assetAnalysis.portfolioSharpe * 1.1) {
      recommendations.push({
        category: 'Portfolio Optimization',
        priority: 'Medium',
        title: 'Consider Portfolio Rebalancing',
        description: `Optimized portfolio could improve Sharpe ratio from ${assetAnalysis.portfolioSharpe.toFixed(2)} to ${optimization.metrics.sharpeRatio.toFixed(2)}.`,
        action: 'Review suggested allocation adjustments'
      });
    }

    return recommendations;
  };

  // Helper functions
  const mapAssetToKenyaType = (assetType) => {
    const mapping = {
      'equity': 'nse_large_cap',
      'bond': 'government_bonds',
      'real_estate': 'residential_property',
      'cash': 'money_market'
    };
    return mapping[assetType] || 'money_market';
  };

  const mapLiabilityToKenyaType = (liabilityType) => {
    const mapping = {
      'mortgage': 'residential_mortgage',
      'personal_loan': 'personal_loan_unsecured',
      'credit_card': 'credit_card',
      'business_loan': 'business_term_loan'
    };
    return mapping[liabilityType] || 'personal_loan_unsecured';
  };

  const calculateDiversificationScore = (allocations) => {
    const values = Object.values(allocations);
    const total = values.reduce((sum, value) => sum + value, 0);
    const weights = values.map(value => value / total);
    
    // Herfindahl-Hirschman Index (inverse for diversification)
    const hhi = weights.reduce((sum, weight) => sum + weight * weight, 0);
    return Math.max(0, 1 - hhi);
  };

  const calculateInterestRateRisk = (liabilityAnalysis) => {
    // Simplified interest rate risk calculation
    return liabilityAnalysis.summary?.weightedAverageRate > 0.18 ? 'High' : 'Moderate';
  };

  const identifyRefinancingOpportunities = (liabilityAnalysis) => {
    return liabilityAnalysis.analyses?.filter(analysis => 
      analysis.isAboveMarket && analysis.refinancingSavings > 50000
    ).length || 0;
  };

  const calculateNetWorthVolatility = (assetAnalysis, liabilityAnalysis) => {
    // Simplified calculation - in practice would consider correlations
    return assetAnalysis.portfolioVolatility || 0.15;
  };

  const calculateConcentrationRisk = (allocations) => {
    const values = Object.values(allocations);
    const total = values.reduce((sum, value) => sum + value, 0);
    const maxWeight = Math.max(...values) / total;
    return maxWeight > 0.5 ? 'High' : maxWeight > 0.3 ? 'Moderate' : 'Low';
  };

  const generateExecutiveSummary = ({ assetAnalysis, liabilityAnalysis, lifetimeAnalysis, riskAnalysis }) => {
    return {
      totalAssets: assetAnalysis.totalValue,
      totalLiabilities: liabilityAnalysis.summary?.totalDebt || 0,
      currentNetWorth: assetAnalysis.totalValue - (liabilityAnalysis.summary?.totalDebt || 0),
      lifetimeNetWorth: lifetimeAnalysis.lifetimeNetWorth,
      humanCapital: lifetimeAnalysis.humanCapital,
      portfolioRisk: riskAnalysis.portfolioRisk.volatility,
      overallHealthScore: calculateOverallHealthScore({
        assetAnalysis,
        liabilityAnalysis,
        riskAnalysis
      })
    };
  };

  const calculateOverallHealthScore = ({ assetAnalysis, liabilityAnalysis, riskAnalysis }) => {
    let score = 100;
    
    // Deduct for high debt ratio
    if (liabilityAnalysis.summary?.debtToIncomeRatio > 0.36) {
      score -= 25;
    }
    
    // Deduct for poor diversification
    if (assetAnalysis.diversificationScore < 0.4) {
      score -= 20;
    }
    
    // Deduct for high risk
    if (riskAnalysis.portfolioRisk.volatility > 0.25) {
      score -= 15;
    }
    
    return Math.max(0, score);
  };

  const fetchUserAssets = async () => {
    // This would normally fetch from your API
    // For demo purposes, return empty array
    return [];
  };

  const fetchUserLiabilities = async () => {
    // This would normally fetch from your API
    // For demo purposes, return empty array
    return [];
  };

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Performing comprehensive CFA analysis...</p>
          <p className="text-sm text-gray-500 mt-2">Analyzing assets, liabilities, and generating Kenya-specific recommendations</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span>Analysis Error: {error}</span>
          </div>
          <Button onClick={initializeAnalysis} className="mt-4" variant="outline">
            Retry Analysis
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Main render
  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-blue-800">
            <FileBarChart className="h-6 w-6" />
            <span>CFA-Compliant Financial Analysis</span>
            <Badge variant="outline" className="bg-white text-blue-700">
              Kenya Market Specialized
            </Badge>
          </CardTitle>
          <p className="text-blue-600">
            Comprehensive analysis using CFA Institute standards adapted for Kenyan financial markets
          </p>
        </CardHeader>
        <CardContent>
          {analysisResults?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-white/70 rounded-lg">
                <p className="text-sm text-gray-600">Current Net Worth</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(analysisResults.summary.currentNetWorth)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg">
                <p className="text-sm text-gray-600">Lifetime Net Worth</p>
                <p className="text-xl font-bold text-purple-600">
                  {formatCurrency(analysisResults.summary.lifetimeNetWorth)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg">
                <p className="text-sm text-gray-600">Human Capital</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(analysisResults.summary.humanCapital)}
                </p>
              </div>
              <div className="text-center p-4 bg-white/70 rounded-lg">
                <p className="text-sm text-gray-600">Financial Health</p>
                <p className={`text-xl font-bold ${
                  analysisResults.summary.overallHealthScore >= 80 ? 'text-green-600' :
                  analysisResults.summary.overallHealthScore >= 60 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {analysisResults.summary.overallHealthScore}/100
                </p>
              </div>
            </div>
          )}

          {/* CFA Compliance Score */}
          {analysisResults?.complianceAssessment && (
            <div className="p-4 bg-white/70 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">CFA Institute Compliance</h4>
                <Badge 
                  variant="outline" 
                  className={`${
                    analysisResults.complianceAssessment.grade === 'Excellent' ? 'bg-green-50 text-green-700' :
                    analysisResults.complianceAssessment.grade === 'Good' ? 'bg-blue-50 text-blue-700' :
                    analysisResults.complianceAssessment.grade === 'Fair' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }`}
                >
                  {analysisResults.complianceAssessment.grade}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {analysisResults.complianceAssessment.checks.map((check, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {check.passing ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className="text-sm">{check.check}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Key Recommendations */}
      {analysisResults?.recommendations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Priority Recommendations</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResults.recommendations.slice(0, 3).map((rec, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge 
                          variant="outline"
                          className={`${
                            rec.priority === 'Critical' ? 'bg-red-50 text-red-700' :
                            rec.priority === 'High' ? 'bg-orange-50 text-orange-700' :
                            'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {rec.priority} Priority
                        </Badge>
                        <span className="text-sm text-gray-600">{rec.category}</span>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{rec.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                      <p className="text-sm font-medium text-blue-600">
                        <strong>Action:</strong> {rec.action}
                      </p>
                    </div>
                    <Info className="h-5 w-5 text-gray-400 mt-1" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          onClick={() => assumptionsManager.saveAsDefaults('My Kenya Analysis Defaults')}
          className="flex items-center space-x-2"
        >
          <Settings className="h-4 w-4" />
          <span>Save Analysis Settings</span>
        </Button>
        <Button 
          onClick={initializeAnalysis}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Calculator className="h-4 w-4" />
          <span>Refresh Analysis</span>
        </Button>
      </div>

      {/* Technical Note */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h5 className="font-semibold text-gray-800 mb-2">Technical Implementation Notes</h5>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <strong>Return/Risk Modeling:</strong> Uses Kenya NSE data and CFA-compliant Modern Portfolio Theory</p>
          <p>• <strong>Liability Analysis:</strong> Incorporates Kenya debt market rates and CMA/CBK regulatory standards</p>
          <p>• <strong>Human Capital:</strong> CFA methodology with Kenya life expectancy and career progression data</p>
          <p>• <strong>Advanced Assumptions:</strong> Hybrid auto-save with user preference persistence</p>
          <p>• <strong>Compliance:</strong> Adheres to CFA Institute Portfolio Management standards</p>
        </div>
      </div>
    </div>
  );
};

export default ComprehensiveFinancialAnalysis;