/**
 * Scenario Analysis Component
 * Displays various scenario analyses (market crash, job loss, high inflation)
 */

import React from 'react';
import predictiveAnalytics from '../../services/predictiveAnalytics';

const ScenarioAnalysis = ({ scenarios, baseSuccessProbability }) => {
  if (!scenarios || Object.keys(scenarios).length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <div className="text-2xl mb-2">📊</div>
        <p>No scenario analysis available</p>
      </div>
    );
  }

  const getScenarioIcon = (scenarioKey) => {
    switch (scenarioKey) {
      case 'market_crash': return '📉';
      case 'high_inflation': return '💸';
      case 'job_loss': return '💼';
      default: return '📊';
    }
  };

  const getScenarioTitle = (scenarioKey) => {
    switch (scenarioKey) {
      case 'market_crash': return 'Market Crash';
      case 'high_inflation': return 'High Inflation';
      case 'job_loss': return 'Job Loss';
      default: return scenarioKey.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getScenarioColor = (probability) => {
    if (probability >= 0.7) return 'text-green-600';
    if (probability >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScenarioBgColor = (probability) => {
    if (probability >= 0.7) return 'bg-green-50 border-green-200';
    if (probability >= 0.4) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="scenario-analysis space-y-4">
      {/* Base Scenario for Reference */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <span className="text-xl mr-3">📈</span>
            <div>
              <h4 className="font-medium text-blue-800">Base Scenario</h4>
              <p className="text-xs text-blue-600">Current market conditions</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              {predictiveAnalytics.formatPercentage(baseSuccessProbability)}
            </div>
            <div className="text-xs text-blue-500">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Scenario Cards */}
      {Object.entries(scenarios).map(([scenarioKey, scenarioData]) => {
        const probability = scenarioData.success_probability || 0;
        const expectedValue = scenarioData.expected_value;
        const adjustedTarget = scenarioData.adjusted_target;
        const successProbabilityAdjusted = scenarioData.success_probability_adjusted;

        return (
          <div
            key={scenarioKey}
            className={`rounded-lg p-4 border ${getScenarioBgColor(probability)}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="text-xl mr-3">{getScenarioIcon(scenarioKey)}</span>
                <div>
                  <h4 className="font-medium text-gray-800">
                    {getScenarioTitle(scenarioKey)}
                  </h4>
                  <p className="text-xs text-gray-600">
                    {scenarioKey === 'market_crash' && 'Lower returns + higher volatility'}
                    {scenarioKey === 'high_inflation' && 'Higher target due to inflation'}
                    {scenarioKey === 'job_loss' && '6 months without contributions'}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getScenarioColor(probability)}`}>
                  {predictiveAnalytics.formatPercentage(probability)}
                </div>
                <div className="text-xs text-gray-500">Success Rate</div>
              </div>
            </div>

            {/* Additional Scenario Details */}
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {expectedValue && (
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-gray-500">Expected Value</div>
                  <div className="font-semibold text-gray-800">
                    {predictiveAnalytics.formatCurrency(expectedValue)}
                  </div>
                </div>
              )}
              
              {adjustedTarget && (
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-gray-500">Inflation-Adjusted Target</div>
                  <div className="font-semibold text-gray-800">
                    {predictiveAnalytics.formatCurrency(adjustedTarget)}
                  </div>
                </div>
              )}
              
              {successProbabilityAdjusted !== undefined && (
                <div className="bg-white rounded p-2">
                  <div className="text-xs text-gray-500">Adjusted Success Rate</div>
                  <div className={`font-semibold ${getScenarioColor(successProbabilityAdjusted)}`}>
                    {predictiveAnalytics.formatPercentage(successProbabilityAdjusted)}
                  </div>
                </div>
              )}
            </div>

            {/* Impact Analysis */}
            <div className="mt-3 p-2 bg-white rounded">
              <div className="text-xs text-gray-500 mb-1">Impact vs Base Scenario</div>
              <div className="flex items-center">
                {probability < baseSuccessProbability ? (
                  <>
                    <span className="text-red-500 mr-2">↓</span>
                    <span className="text-red-600 font-medium">
                      {predictiveAnalytics.formatPercentage(baseSuccessProbability - probability)} lower
                    </span>
                  </>
                ) : probability > baseSuccessProbability ? (
                  <>
                    <span className="text-green-500 mr-2">↑</span>
                    <span className="text-green-600 font-medium">
                      {predictiveAnalytics.formatPercentage(probability - baseSuccessProbability)} higher
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500 mr-2">→</span>
                    <span className="text-gray-600">No significant change</span>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Scenario Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-800 mb-3">Scenario Analysis Summary</h4>
        <div className="space-y-2 text-sm">
          {Object.keys(scenarios).length > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Most Resilient:</span>
              <span className="font-medium text-green-600">
                {getScenarioTitle(
                  Object.keys(scenarios).reduce((best, current) =>
                    scenarios[current].success_probability > scenarios[best].success_probability
                      ? current
                      : best
                  )
                )}
              </span>
            </div>
          )}
          {Object.keys(scenarios).length > 1 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Highest Risk:</span>
              <span className="font-medium text-red-600">
                {getScenarioTitle(
                  Object.keys(scenarios).reduce((worst, current) =>
                    scenarios[current].success_probability < scenarios[worst].success_probability
                      ? current
                      : worst
                  )
                )}
              </span>
            </div>
          )}
          <div className="text-xs text-gray-500 mt-3">
            💡 Consider strategies to improve performance in lower-probability scenarios
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScenarioAnalysis;