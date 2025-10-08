import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  X, 
  AlertTriangle, 
  Calculator,
  TrendingUp,
  TrendingDown,
  Target,
  Edit
} from '../ui/icons';

const DiscountRateOverrideModal = ({ 
  isOpen, 
  onClose, 
  currentRates, 
  onRatesChange,
  profileData 
}) => {
  const [rates, setRates] = useState({
    incomeDiscountRate: 12.5,
    expenseDiscountRate: 10.5,
    incomeGrowthRate: 3.0,
    expenseInflationRate: 5.5
  });
  
  const [warnings, setWarnings] = useState([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [auditTrail, setAuditTrail] = useState([]);

  useEffect(() => {
    if (currentRates) {
      setRates(currentRates);
    }
  }, [currentRates]);

  useEffect(() => {
    validateRates();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rates]);

  const validateRates = () => {
    const newWarnings = [];
    
    // CFA Standard Validations
    if (rates.incomeDiscountRate < 8.0) {
      newWarnings.push({
        type: 'error',
        field: 'incomeDiscountRate',
        message: 'Income discount rate below 8% may underestimate career risk for Kenya market',
        recommendation: 'Consider 10-15% range for developing market premium'
      });
    }
    
    if (rates.incomeDiscountRate > 20.0) {
      newWarnings.push({
        type: 'warning',
        field: 'incomeDiscountRate', 
        message: 'Very high discount rate may be overly conservative',
        recommendation: 'Rates above 20% typically reserved for high-risk careers'
      });
    }
    
    if (rates.expenseDiscountRate < 5.0) {
      newWarnings.push({
        type: 'warning',
        field: 'expenseDiscountRate',
        message: 'Expense discount rate below inflation expectations',
        recommendation: 'Consider Kenya inflation rate + risk premium (8-12%)'
      });
    }
    
    if (Math.abs(rates.incomeDiscountRate - rates.expenseDiscountRate) < 1.0) {
      newWarnings.push({
        type: 'info',
        field: 'both',
        message: 'Income and expense rates very similar',
        recommendation: 'Typically income rates 2-4% higher than expense rates'
      });
    }

    // Age-based validations
    if (profileData?.profile?.age) {
      const age = profileData.profile.age;
      if (age < 35 && rates.incomeDiscountRate > 15.0) {
        newWarnings.push({
          type: 'warning',
          field: 'incomeDiscountRate',
          message: `High discount rate for age ${age} may be overly pessimistic`,
          recommendation: 'Younger professionals typically warrant lower discount rates'
        });
      }
      
      if (age > 50 && rates.incomeDiscountRate < 10.0) {
        newWarnings.push({
          type: 'warning', 
          field: 'incomeDiscountRate',
          message: `Low discount rate for age ${age} may underestimate career transition risk`,
          recommendation: 'Consider higher rates for later-career professionals'
        });
      }
    }

    setWarnings(newWarnings);
  };

  const handleRateChange = (field, value) => {
    const numValue = parseFloat(value) || 0;
    setRates(prev => ({
      ...prev,
      [field]: numValue
    }));
    
    // Add to audit trail
    setAuditTrail(prev => [...prev, {
      timestamp: new Date().toISOString(),
      field,
      oldValue: rates[field],
      newValue: numValue,
      reason: 'Manual adjustment'
    }]);
  };

  const resetToDefaults = () => {
    const defaultRates = {
      incomeDiscountRate: 12.5,
      expenseDiscountRate: 10.5, 
      incomeGrowthRate: 3.0,
      expenseInflationRate: 5.5
    };
    setRates(defaultRates);
    setAuditTrail(prev => [...prev, {
      timestamp: new Date().toISOString(),
      action: 'Reset to CFA Kenya defaults',
      rates: defaultRates
    }]);
  };

  const applyRates = () => {
    onRatesChange(rates);
    onClose();
  };

  const getWarningIcon = (type) => {
    switch(type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Calculator className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold">Discount Rate Override</h2>
              <p className="text-sm text-gray-500">CFA-compliant assumption adjustments</p>
            </div>
          </div>
          <Button 
            onClick={onClose}
            variant="ghost" 
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Current CFA Standards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-600" />
                <span>CFA Institute Kenya Standards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Badge variant="outline" className="bg-green-50">Kenya Risk-Free Rate: 11.5%</Badge>
                <Badge variant="outline" className="bg-blue-50">Career Risk Premium: 1-3%</Badge>
                <Badge variant="outline" className="bg-yellow-50">Inflation Expectation: 5.5%</Badge>
              </div>
              <div className="text-sm text-gray-600">
                <p><strong>Current Profile:</strong> {profileData?.profile?.full_name || 'User'}</p>
                <p><strong>Age:</strong> {profileData?.profile?.age || 'N/A'} years</p>
                <p><strong>Income:</strong> {profileData?.profile?.monthly_income ? 
                  `${(profileData.profile.monthly_income * 12).toLocaleString()} KES/year` : 'N/A'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Rate Adjustments */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income Discount Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Human Capital Discount Rate</span>
                </CardTitle>
                <p className="text-sm text-gray-600">Rate for discounting future earnings</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="incomeRate">Annual Discount Rate (%)</Label>
                  <Input
                    id="incomeRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="30"
                    value={rates.incomeDiscountRate}
                    onChange={(e) => handleRateChange('incomeDiscountRate', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard: 10-15% (developing markets)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="incomeGrowth">Income Growth Rate (%)</Label>
                  <Input
                    id="incomeGrowth"
                    type="number" 
                    step="0.1"
                    min="0"
                    max="10"
                    value={rates.incomeGrowthRate}
                    onChange={(e) => handleRateChange('incomeGrowthRate', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard: 2-4% (real income growth)
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Expense Discount Rate */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Expense Liability Rate</span>
                </CardTitle>
                <p className="text-sm text-gray-600">Rate for discounting future expenses</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="expenseRate">Annual Discount Rate (%)</Label>
                  <Input
                    id="expenseRate"
                    type="number"
                    step="0.1"
                    min="0"
                    max="25"
                    value={rates.expenseDiscountRate}
                    onChange={(e) => handleRateChange('expenseDiscountRate', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard: 8-12% (inflation + risk premium)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="expenseInflation">Expense Inflation (%)</Label>
                  <Input
                    id="expenseInflation"
                    type="number"
                    step="0.1"
                    min="0"
                    max="15"
                    value={rates.expenseInflationRate}
                    onChange={(e) => handleRateChange('expenseInflationRate', e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Standard: 4-7% (Kenya inflation expectation)
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Professional Warnings */}
          {warnings.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Professional Warnings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {warnings.map((warning, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-md">
                    {getWarningIcon(warning.type)}
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{warning.message}</p>
                      <p className="text-xs text-gray-600 mt-1">{warning.recommendation}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Advanced Options */}
          <div className="border-t pt-4">
            <Button
              onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
              variant="ghost"
              className="mb-4"
            >
              <Edit className="h-4 w-4 mr-2" />
              {showAdvancedOptions ? 'Hide' : 'Show'} Advanced Options & Audit Trail
            </Button>
            
            {showAdvancedOptions && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Methodology Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-gray-600">
                    <ul className="space-y-1">
                      <li>• Income rates reflect career risk and Kenya market conditions</li>
                      <li>• Expense rates typically 2-4% lower (more predictable cash flows)</li>
                      <li>• Age adjustments: younger = lower risk, older = career transition risk</li>
                      <li>• All rates follow CFA Institute present value methodology</li>
                    </ul>
                  </CardContent>
                </Card>
                
                {auditTrail.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Change Audit Trail</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {auditTrail.slice(-5).map((entry, index) => (
                          <div key={index} className="text-xs text-gray-600">
                            <span className="font-mono">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                            {entry.field ? (
                              <span> - {entry.field}: {entry.oldValue}% → {entry.newValue}%</span>
                            ) : (
                              <span> - {entry.action}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <Button
            onClick={resetToDefaults}
            variant="outline"
          >
            Reset to CFA Defaults
          </Button>
          
          <div className="space-x-3">
            <Button
              onClick={onClose}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={applyRates}
              className="bg-blue-600 text-white hover:bg-blue-700"
            >
              Apply Rate Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountRateOverrideModal;