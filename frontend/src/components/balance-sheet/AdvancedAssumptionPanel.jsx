import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Calculator,
  Building2,
  Target
} from '../ui/icons';
import HybridSaveManager from './HybridSaveManager';

const AdvancedAssumptionPanel = ({ 
  assumptions,
  onAssumptionChange,
  profileData
}) => {
  const [expandedSections, setExpandedSections] = useState({
    demographics: false,
    economic: false,
    career: false,
    lifestyle: false
  });
  
  const [localAssumptions, setLocalAssumptions] = useState({
    // Demographics
    lifeExpectancy: 68,
    retirementAge: 60,
    dependentsGrowth: 0,
    
    // Economic Environment
    kenyaGdpGrowth: 5.2,
    inflationVolatility: 1.5,
    currencyRisk: 2.0,
    politicalRisk: 1.0,
    
    // Career Assumptions  
    careerProgressionRate: 1.5,
    jobChangeFrequency: 5,
    industryGrowthRate: 3.5,
    skillObsolescenceRisk: 0.5,
    
    // Lifestyle Assumptions
    lifestyleInflationRate: 2.5,
    healthcareEscalation: 6.0,
    educationInflation: 7.0,
    housingAppreciation: 4.0
  });
  
  const [warnings, setWarnings] = useState([]);

  useEffect(() => {
    if (assumptions) {
      setLocalAssumptions(prev => ({ ...prev, ...assumptions }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [assumptions]);

  useEffect(() => {
    validateAssumptions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localAssumptions]);

  const validateAssumptions = () => {
    const newWarnings = [];
    
    // Demographics validations
    if (localAssumptions.lifeExpectancy < 60) {
      newWarnings.push({
        type: 'error',
        category: 'demographics',
        message: 'Life expectancy below 60 may be too pessimistic for Kenya',
        recommendation: 'Consider 65-75 range based on income level and healthcare access'
      });
    }
    
    if (localAssumptions.retirementAge > 70) {
      newWarnings.push({
        type: 'warning',
        category: 'demographics', 
        message: 'Retirement age above 70 may be optimistic',
        recommendation: 'Kenya average retirement age is 55-65 depending on sector'
      });
    }
    
    // Economic validations
    if (localAssumptions.kenyaGdpGrowth > 8.0) {
      newWarnings.push({
        type: 'warning',
        category: 'economic',
        message: 'GDP growth above 8% may be overly optimistic',
        recommendation: 'Kenya historical average is 4-6% with volatility'
      });
    }
    
    if (localAssumptions.inflationVolatility < 1.0) {
      newWarnings.push({
        type: 'info',
        category: 'economic',
        message: 'Low inflation volatility assumption',
        recommendation: 'Kenya inflation can vary 3-5% annually'
      });
    }
    
    // Career validations
    if (profileData?.profile?.age) {
      const age = profileData.profile.age;
      if (age > 45 && localAssumptions.careerProgressionRate > 2.0) {
        newWarnings.push({
          type: 'warning',
          category: 'career',
          message: `High career progression rate for age ${age}`,
          recommendation: 'Career growth typically slows after 45'
        });
      }
    }
    
    setWarnings(newWarnings);
  };

  const handleAssumptionChange = (category, field, value) => {
    const numValue = parseFloat(value) || 0;
    const newAssumptions = {
      ...localAssumptions,
      [field]: numValue
    };
    setLocalAssumptions(newAssumptions);
    onAssumptionChange(newAssumptions);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const resetToDefaults = () => {
    const defaults = {
      // CFA-standard assumptions for Kenya
      lifeExpectancy: 68,
      retirementAge: 60,
      dependentsGrowth: 0,
      kenyaGdpGrowth: 5.2,
      inflationVolatility: 1.5,
      currencyRisk: 2.0,
      politicalRisk: 1.0,
      careerProgressionRate: 1.5,
      jobChangeFrequency: 5,
      industryGrowthRate: 3.5,
      skillObsolescenceRisk: 0.5,
      lifestyleInflationRate: 2.5,
      healthcareEscalation: 6.0,
      educationInflation: 7.0,
      housingAppreciation: 4.0
    };
    setLocalAssumptions(defaults);
    onAssumptionChange(defaults);
  };

  const getCategoryWarnings = (category) => {
    return warnings.filter(w => w.category === category);
  };

  const getWarningIcon = (type) => {
    switch(type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'info': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  // Hybrid save functionality for advanced assumptions
  const handleAutoSave = async (data, options = {}) => {
    try {
      const autoSaveData = {
        ...data,
        timestamp: new Date().toISOString(),
        entityType: 'advanced_assumptions'
      };
      
      // Auto-save to localStorage for recovery
      localStorage.setItem('advanced_assumptions_autosave', JSON.stringify(autoSaveData));
      
      // If manual save requested, also update parent component immediately
      if (options.manualSave) {
        onAssumptionChange(data);
      }
    } catch (error) {
      console.error('Advanced assumptions auto-save failed:', error);
      throw error;
    }
  };

  const handleSaveAsDefaults = async (data) => {
    try {
      const defaults = {
        ...data,
        savedAt: new Date().toISOString(),
        entityType: 'advanced_assumptions_defaults'
      };
      
      localStorage.setItem('advanced_assumptions_defaults', JSON.stringify(defaults));
      
      // Show success message
      setTimeout(() => {
        alert('Advanced assumption defaults saved! These will be used as your personal baseline for future calculations.');
      }, 100);
      
    } catch (error) {
      console.error('Save advanced assumptions defaults failed:', error);
      throw error;
    }
  };

  // Load saved defaults on component mount
  useEffect(() => {
    try {
      const savedDefaults = localStorage.getItem('advanced_assumptions_defaults');
      if (savedDefaults) {
        const defaults = JSON.parse(savedDefaults);
        const wasDataSaved = window.confirm(
          'Found your personal advanced assumption defaults. Would you like to apply them?'
        );
        
        if (wasDataSaved) {
          setLocalAssumptions(defaults);
          onAssumptionChange(defaults);
        }
      }

      // Recovery from auto-save
      const autoSaveData = localStorage.getItem('advanced_assumptions_autosave');
      if (autoSaveData) {
        const savedData = JSON.parse(autoSaveData);
        const timeDiff = new Date() - new Date(savedData.timestamp);
        
        // Only recover if auto-save is less than 30 minutes old
        if (timeDiff < 30 * 60 * 1000) {
          const shouldRecover = window.confirm(
            'Found unsaved advanced assumption changes from a previous session. Would you like to recover them?'
          );
          
          if (shouldRecover) {
            setLocalAssumptions(savedData);
            onAssumptionChange(savedData);
          } else {
            localStorage.removeItem('advanced_assumptions_autosave');
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved advanced assumptions:', error);
    }
  }, [onAssumptionChange]);

  // Component is always visible when rendered - visibility controlled by parent

  return (
    <Card className="mt-6 border-purple-200 bg-purple-50" data-testid="advanced-assumption-panel">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-purple-600" />
            <span>Advanced Financial Planning Assumptions</span>
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Professional Mode</Badge>
          </CardTitle>
        </div>
        <p className="text-sm text-purple-700">
          Professional-grade assumptions for comprehensive financial modeling
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Demographics Section */}
        <div className="border rounded-lg p-4 bg-white">
          <button
            onClick={() => toggleSection('demographics')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Demographics & Life Events</span>
              {getCategoryWarnings('demographics').length > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {getCategoryWarnings('demographics').length} warnings
                </Badge>
              )}
            </div>
            {expandedSections.demographics ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.demographics && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lifeExpectancy">Life Expectancy (years)</Label>
                <Input
                  id="lifeExpectancy"
                  type="number"
                  min="50"
                  max="90"
                  value={localAssumptions.lifeExpectancy}
                  onChange={(e) => handleAssumptionChange('demographics', 'lifeExpectancy', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Kenya average: 66-70 years</p>
              </div>
              
              <div>
                <Label htmlFor="retirementAge">Retirement Age (years)</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  min="50"
                  max="75"
                  value={localAssumptions.retirementAge}
                  onChange={(e) => handleAssumptionChange('demographics', 'retirementAge', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Kenya typical: 55-65 years</p>
              </div>
              
              <div>
                <Label htmlFor="dependentsGrowth">Dependents Growth Rate (%)</Label>
                <Input
                  id="dependentsGrowth"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={localAssumptions.dependentsGrowth}
                  onChange={(e) => handleAssumptionChange('demographics', 'dependentsGrowth', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Family expansion rate</p>
              </div>
            </div>
          )}
          
          {/* Demographics Warnings */}
          {getCategoryWarnings('demographics').length > 0 && (
            <div className="mt-4 space-y-2">
              {getCategoryWarnings('demographics').map((warning, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                  {getWarningIcon(warning.type)}
                  <div className="text-xs">
                    <p className="font-medium">{warning.message}</p>
                    <p className="text-gray-600">{warning.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Economic Environment Section */}
        <div className="border rounded-lg p-4 bg-white">
          <button
            onClick={() => toggleSection('economic')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-green-600" />
              <span className="font-medium">Economic Environment</span>
              {getCategoryWarnings('economic').length > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {getCategoryWarnings('economic').length} warnings
                </Badge>
              )}
            </div>
            {expandedSections.economic ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.economic && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="kenyaGdpGrowth">Kenya GDP Growth (%)</Label>
                <Input
                  id="kenyaGdpGrowth"
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  value={localAssumptions.kenyaGdpGrowth}
                  onChange={(e) => handleAssumptionChange('economic', 'kenyaGdpGrowth', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Historical: 4-6% annually</p>
              </div>
              
              <div>
                <Label htmlFor="inflationVolatility">Inflation Volatility (%)</Label>
                <Input
                  id="inflationVolatility"
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="5"
                  value={localAssumptions.inflationVolatility}
                  onChange={(e) => handleAssumptionChange('economic', 'inflationVolatility', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Annual inflation variation</p>
              </div>
              
              <div>
                <Label htmlFor="currencyRisk">Currency Risk Premium (%)</Label>
                <Input
                  id="currencyRisk"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={localAssumptions.currencyRisk}
                  onChange={(e) => handleAssumptionChange('economic', 'currencyRisk', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">KES volatility premium</p>
              </div>
              
              <div>
                <Label htmlFor="politicalRisk">Political Risk Factor (%)</Label>
                <Input
                  id="politicalRisk"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={localAssumptions.politicalRisk}
                  onChange={(e) => handleAssumptionChange('economic', 'politicalRisk', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Policy stability risk</p>
              </div>
            </div>
          )}
          
          {/* Economic Warnings */}
          {getCategoryWarnings('economic').length > 0 && (
            <div className="mt-4 space-y-2">
              {getCategoryWarnings('economic').map((warning, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                  {getWarningIcon(warning.type)}
                  <div className="text-xs">
                    <p className="font-medium">{warning.message}</p>
                    <p className="text-gray-600">{warning.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Career Progression Section */}
        <div className="border rounded-lg p-4 bg-white">
          <button
            onClick={() => toggleSection('career')}
            className="flex items-center justify-between w-full text-left"
          >
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span className="font-medium">Career Trajectory</span>
              {getCategoryWarnings('career').length > 0 && (
                <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                  {getCategoryWarnings('career').length} warnings
                </Badge>
              )}
            </div>
            {expandedSections.career ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          </button>
          
          {expandedSections.career && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="careerProgressionRate">Career Progression Rate (%)</Label>
                <Input
                  id="careerProgressionRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={localAssumptions.careerProgressionRate}
                  onChange={(e) => handleAssumptionChange('career', 'careerProgressionRate', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Annual promotion/advancement rate</p>
              </div>
              
              <div>
                <Label htmlFor="jobChangeFrequency">Job Change Frequency (years)</Label>
                <Input
                  id="jobChangeFrequency"
                  type="number"
                  min="2"
                  max="15"
                  value={localAssumptions.jobChangeFrequency}
                  onChange={(e) => handleAssumptionChange('career', 'jobChangeFrequency', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Average years between job changes</p>
              </div>
              
              <div>
                <Label htmlFor="industryGrowthRate">Industry Growth Rate (%)</Label>
                <Input
                  id="industryGrowthRate"
                  type="number"
                  step="0.1"
                  min="0"
                  max="15"
                  value={localAssumptions.industryGrowthRate}
                  onChange={(e) => handleAssumptionChange('career', 'industryGrowthRate', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Sector-specific growth expectations</p>
              </div>
              
              <div>
                <Label htmlFor="skillObsolescenceRisk">Skill Obsolescence Risk (%)</Label>
                <Input
                  id="skillObsolescenceRisk"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={localAssumptions.skillObsolescenceRisk}
                  onChange={(e) => handleAssumptionChange('career', 'skillObsolescenceRisk', e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-1">Annual risk of skill depreciation</p>
              </div>
            </div>
          )}
          
          {/* Career Warnings */}
          {getCategoryWarnings('career').length > 0 && (
            <div className="mt-4 space-y-2">
              {getCategoryWarnings('career').map((warning, index) => (
                <div key={index} className="flex items-start space-x-2 p-2 bg-yellow-50 rounded">
                  {getWarningIcon(warning.type)}
                  <div className="text-xs">
                    <p className="font-medium">{warning.message}</p>
                    <p className="text-gray-600">{warning.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hybrid Save Manager for Advanced Assumptions */}
        <div className="mt-6">
          <HybridSaveManager
            data={localAssumptions}
            onSave={handleAutoSave}
            onSaveAsDefaults={handleSaveAsDefaults}
            entityType="advanced_assumptions"
            autoSaveDelay={4000}
            showDefaultsOption={true}
            className="mb-4"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            onClick={resetToDefaults}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <Calculator className="h-4 w-4" />
            <span>Reset to CFA Kenya Defaults</span>
          </Button>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Target className="h-4 w-4" />
            <span>Professional Mode Active</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdvancedAssumptionPanel;