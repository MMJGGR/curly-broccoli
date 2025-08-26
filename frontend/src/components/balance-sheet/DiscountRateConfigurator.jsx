import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { 
  Calculator, 
  AlertCircle, 
  AlertTriangle, 
  Shield, 
  Info,
  TrendingUp,
  TrendingDown,
  Target
} from '../ui/icons';

const DiscountRateConfigurator = ({ 
  userProfile, 
  currentRates, 
  onRatesUpdate, 
  isVisible = true 
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showProfessionalWarning, setShowProfessionalWarning] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({});
  const [validationResults, setValidationResults] = useState({});
  const [impactAnalysis, setImpactAnalysis] = useState(null);
  const [userOverride, setUserOverride] = useState({
    humanCapital: false,
    expenseLiability: false
  });

  // CFA-compliant industry descriptions
  const INDUSTRY_GUIDANCE = {
    'government': {
      typical_range: '4.5% - 6.0%',
      description: 'High job security, predictable income, lower career risk',
      risk_factors: ['Budget constraints', 'Political changes']
    },
    'technology': {
      typical_range: '7.0% - 10.0%',
      description: 'High growth potential, moderate volatility, skill-dependent',
      risk_factors: ['Rapid technological change', 'Market volatility', 'Competition']
    },
    'healthcare': {
      typical_range: '5.5% - 7.5%',
      description: 'Stable demand, professional licensing, moderate growth',
      risk_factors: ['Regulatory changes', 'Insurance dynamics']
    },
    'financial_services': {
      typical_range: '6.5% - 9.0%',
      description: 'Cyclical industry, performance-based compensation',
      risk_factors: ['Economic cycles', 'Regulatory changes', 'Market conditions']
    },
    'startup': {
      typical_range: '10.0% - 15.0%',
      description: 'High risk, high reward, significant variability',
      risk_factors: ['Business failure risk', 'Funding challenges', 'Market acceptance']
    }
  };

  const handleRateChange = async (rateType, newRate) => {
    const numericRate = parseFloat(newRate);
    
    // Validate the rate
    const validation = await validateDiscountRate(rateType, numericRate);
    setValidationResults(prev => ({
      ...prev,
      [rateType]: validation
    }));

    // Calculate impact
    const impact = await calculateImpactAnalysis(rateType, numericRate);
    setImpactAnalysis(impact);

    // Store pending change
    setPendingChanges(prev => ({
      ...prev,
      [rateType]: numericRate
    }));

    // Show professional warning if needed
    if (validation.professional_review_required || validation.warnings.length > 2) {
      setShowProfessionalWarning(true);
    }
  };

  const handleOverrideToggle = (rateType) => {
    setUserOverride(prev => ({
      ...prev,
      [rateType]: !prev[rateType]
    }));
  };

  const applyChanges = async () => {
    try {
      const result = await onRatesUpdate(pendingChanges, impactAnalysis);
      if (result.success) {
        setPendingChanges({});
        setShowProfessionalWarning(false);
        setImpactAnalysis(null);
      }
    } catch (error) {
      console.error('Failed to update rates:', error);
    }
  };

  const resetToDefaults = async () => {
    const defaultRates = await calculateDefaultRates(userProfile);
    setPendingChanges(defaultRates);
    setUserOverride({ humanCapital: false, expenseLiability: false });
    setValidationResults({});
  };

  // Mock validation function (replace with actual API call)
  const validateDiscountRate = async (rateType, rate) => {
    return {
      is_valid: rate >= 0.02 && rate <= 0.15,
      warnings: rate < 0.03 ? ['Rate below typical range for your profile'] : [],
      professional_review_required: rate < 0.02 || rate > 0.12,
      confidence_level: 0.85,
      meets_cfa_standards: true
    };
  };

  // Mock impact calculation (replace with actual API call)
  const calculateImpactAnalysis = async (rateType, rate) => {
    const currentRate = currentRates[rateType] || 0.08;
    const rateDiff = rate - currentRate;
    
    return {
      humanCapitalImpact: rateType === 'humanCapital' ? -rateDiff * 8000000 : 0, // KES
      expenseLiabilityImpact: rateType === 'expenseLiability' ? rateDiff * 5000000 : 0,
      netWorthImpact: rateType === 'humanCapital' ? -rateDiff * 8000000 : rateDiff * 5000000,
      confidenceLevel: 0.8
    };
  };

  // Mock default rates calculation
  const calculateDefaultRates = async (profile) => {
    return {
      humanCapital: 0.075, // 7.5% for tech professional
      expenseLiability: 0.045 // 4.5% for essential expenses
    };
  };

  if (!isVisible) return null;

  const industryGuidance = INDUSTRY_GUIDANCE[userProfile?.employment?.industry_sector] || {};

  return (
    <div className="space-y-6">
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calculator className="h-5 w-5 text-amber-600" />
            <span>Discount Rate Configuration</span>
            <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
              CFA Method
            </Badge>
          </CardTitle>
          <p className="text-sm text-amber-700">
            Professional-grade discount rate management for lifetime balance sheet calculations
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Current Rates Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Human Capital Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Human Capital Discount Rate
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOverrideToggle('humanCapital')}
                  className="text-xs"
                >
                  {userOverride.humanCapital ? 'Use Auto' : 'Override'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="number"
                    step="0.0005"
                    min="0.02"
                    max="0.15"
                    value={pendingChanges.humanCapital || currentRates.humanCapital || 0.075}
                    onChange={(e) => handleRateChange('humanCapital', e.target.value)}
                    disabled={!userOverride.humanCapital}
                    className={`w-20 px-2 py-1 text-sm border rounded ${
                      userOverride.humanCapital 
                        ? 'border-amber-300 bg-white' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  <span className="absolute right-14 top-1 text-xs text-gray-400">%</span>
                </div>
                <span className="text-sm text-gray-600">
                  ({((pendingChanges.humanCapital || currentRates.humanCapital || 0.075) * 100).toFixed(2)}%)
                </span>
                {validationResults.humanCapital?.confidence_level && (
                  <Badge 
                    variant="outline"
                    className={`text-xs ${
                      validationResults.humanCapital.confidence_level > 0.8 
                        ? 'text-green-600 border-green-200' 
                        : 'text-amber-600 border-amber-200'
                    }`}
                  >
                    {Math.round(validationResults.humanCapital.confidence_level * 100)}% confidence
                  </Badge>
                )}
              </div>
              
              {industryGuidance.typical_range && (
                <div className="text-xs text-gray-600">
                  <strong>Industry typical:</strong> {industryGuidance.typical_range}
                </div>
              )}
            </div>

            {/* Expense Liability Rate */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Expense Liability Rate
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleOverrideToggle('expenseLiability')}
                  className="text-xs"
                >
                  {userOverride.expenseLiability ? 'Use Auto' : 'Override'}
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <input
                    type="number"
                    step="0.0005"
                    min="0.015"
                    max="0.10"
                    value={pendingChanges.expenseLiability || currentRates.expenseLiability || 0.045}
                    onChange={(e) => handleRateChange('expenseLiability', e.target.value)}
                    disabled={!userOverride.expenseLiability}
                    className={`w-20 px-2 py-1 text-sm border rounded ${
                      userOverride.expenseLiability 
                        ? 'border-amber-300 bg-white' 
                        : 'border-gray-200 bg-gray-50'
                    }`}
                  />
                  <span className="absolute right-14 top-1 text-xs text-gray-400">%</span>
                </div>
                <span className="text-sm text-gray-600">
                  ({((pendingChanges.expenseLiability || currentRates.expenseLiability || 0.045) * 100).toFixed(2)}%)
                </span>
              </div>
              
              <div className="text-xs text-gray-600">
                <strong>Essential expenses:</strong> Lower rate (more certain)
              </div>
            </div>
          </div>

          {/* Advanced Components Display */}
          {showAdvanced && (
            <div className="border-t pt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Rate Components Breakdown</h4>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Risk-free rate (Kenya bonds):</span>
                      <span>8.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Inflation premium:</span>
                      <span>2.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Industry risk premium:</span>
                      <span>3.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Experience adjustment:</span>
                      <span>-0.5%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Employment stability:</span>
                      <span>-1.0%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Income variability:</span>
                      <span>1.5%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Career outlook:</span>
                      <span>-0.5%</span>
                    </div>
                    <div className="flex justify-between font-medium border-t pt-1">
                      <span>Total calculated rate:</span>
                      <span>7.5%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs text-amber-600"
          >
            {showAdvanced ? 'Hide' : 'Show'} Components Breakdown
          </Button>

          {/* Professional Guidance */}
          <Alert className="border-blue-200 bg-blue-50">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertTitle className="text-blue-900">Professional Guidance</AlertTitle>
            <AlertDescription className="text-blue-700 text-sm space-y-2">
              <div>
                <strong>Human Capital:</strong> Higher rates reduce lifetime value. Use higher rates (8-12%) for 
                volatile careers, lower rates (5-7%) for stable employment.
              </div>
              <div>
                <strong>Expenses:</strong> Essential expenses use lower rates reflecting their certainty. 
                Discretionary expenses can use higher rates.
              </div>
              {industryGuidance.description && (
                <div>
                  <strong>Your Industry ({userProfile?.employment?.industry_sector}):</strong> {industryGuidance.description}
                </div>
              )}
            </AlertDescription>
          </Alert>

          {/* Validation Warnings */}
          {Object.keys(validationResults).some(key => validationResults[key]?.warnings?.length > 0) && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-900">Rate Validation Warnings</AlertTitle>
              <AlertDescription className="text-amber-700">
                <ul className="list-disc list-inside text-sm space-y-1">
                  {Object.entries(validationResults).map(([rateType, result]) =>
                    result?.warnings?.map((warning, idx) => (
                      <li key={`${rateType}-${idx}`}>
                        <strong>{rateType}:</strong> {warning}
                      </li>
                    ))
                  )}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Impact Analysis */}
          {impactAnalysis && (
            <Alert className="border-purple-200 bg-purple-50">
              <Target className="h-4 w-4 text-purple-600" />
              <AlertTitle className="text-purple-900">Impact Analysis</AlertTitle>
              <AlertDescription className="text-purple-700">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Human Capital Impact:</span>
                      <span className={`font-semibold flex items-center ${
                        impactAnalysis.humanCapitalImpact >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {impactAnalysis.humanCapitalImpact >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        KES {Math.abs(impactAnalysis.humanCapitalImpact).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Expense Liability Impact:</span>
                      <span className={`font-semibold flex items-center ${
                        impactAnalysis.expenseLiabilityImpact <= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {impactAnalysis.expenseLiabilityImpact <= 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                        KES {Math.abs(impactAnalysis.expenseLiabilityImpact).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span>Net Worth Impact:</span>
                      <span className={`font-semibold flex items-center ${
                        impactAnalysis.netWorthImpact >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {impactAnalysis.netWorthImpact >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                        KES {Math.abs(impactAnalysis.netWorthImpact).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Confidence Level:</span>
                      <span className="font-semibold">
                        {Math.round((impactAnalysis.confidenceLevel || 0.8) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {Object.keys(pendingChanges).length > 0 && (
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={applyChanges}
                className="bg-amber-600 hover:bg-amber-700 text-white flex items-center space-x-2"
              >
                <Calculator className="h-4 w-4" />
                <span>Apply Changes</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => setPendingChanges({})}
                className="border-amber-300 text-amber-700"
              >
                Cancel Changes
              </Button>
              <Button
                variant="ghost"
                onClick={resetToDefaults}
                className="text-gray-600"
              >
                Reset to Defaults
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Professional Disclaimer Modal */}
      <Dialog open={showProfessionalWarning} onOpenChange={setShowProfessionalWarning}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-amber-600" />
              <span>Professional Discount Rate Override</span>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="border-amber-200 bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-700">
                <strong>Important:</strong> Discount rates significantly impact lifetime balance sheet calculations. 
                Changes should reflect your actual risk profile and market conditions.
              </AlertDescription>
            </Alert>
            
            {impactAnalysis && (
              <div className="space-y-3">
                <h4 className="font-semibold">Impact of Your Changes:</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Human Capital Value Impact:</span>
                    <span className={`font-semibold ${impactAnalysis.humanCapitalImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {impactAnalysis.humanCapitalImpact >= 0 ? '+' : ''}KES {impactAnalysis.humanCapitalImpact.toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span>Expense Liability Impact:</span>
                    <span className={`font-semibold ${impactAnalysis.expenseLiabilityImpact <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {impactAnalysis.expenseLiabilityImpact >= 0 ? '+' : ''}KES {impactAnalysis.expenseLiabilityImpact.toLocaleString()}
                    </span>
                  </li>
                  <li className="flex justify-between border-t pt-2">
                    <span className="font-medium">Net Worth Impact:</span>
                    <span className={`font-bold ${impactAnalysis.netWorthImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {impactAnalysis.netWorthImpact >= 0 ? '+' : ''}KES {impactAnalysis.netWorthImpact.toLocaleString()}
                    </span>
                  </li>
                </ul>
              </div>
            )}
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Professional Guidelines:</h4>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Higher discount rates reduce human capital valuations</li>
                <li>Lower rates for essential expenses reflect their certainty</li>
                <li>Consider your actual career risk and economic environment</li>
                <li>Review rates annually or when circumstances change</li>
                <li>Consult with financial advisors for major life decisions</li>
              </ul>
            </div>

            {industryGuidance.risk_factors && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-900">
                  Risk Factors for {userProfile?.employment?.industry_sector} Industry:
                </h4>
                <ul className="text-sm space-y-1 list-disc list-inside text-blue-700">
                  {industryGuidance.risk_factors.map((factor, idx) => (
                    <li key={idx}>{factor}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowProfessionalWarning(false)}
            >
              Cancel Changes
            </Button>
            <Button 
              onClick={() => {
                applyChanges();
                setShowProfessionalWarning(false);
              }}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Accept & Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DiscountRateConfigurator;