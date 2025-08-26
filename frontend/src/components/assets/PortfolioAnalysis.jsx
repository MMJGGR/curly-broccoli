import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { PieChart, BarChart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from '../ui/icons';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const PortfolioAnalysis = ({ portfolioAnalysis, summary }) => {
  if (!portfolioAnalysis || !summary) {
    return null;
  }

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      current_assets: 'bg-blue-500',
      investment_assets: 'bg-purple-500',
      fixed_assets: 'bg-orange-500',
      intangible_assets: 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <TrendingUp className="h-4 w-4 text-blue-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Asset Allocation Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Asset Allocation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioAnalysis.category_breakdown && Object.entries(portfolioAnalysis.category_breakdown).map(([category, data]) => {
              const percentage = ((data.value / summary.total_current_value) * 100).toFixed(1);
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${getCategoryColor(category)}`}></div>
                    <span className="text-sm font-medium">
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatCurrency(data.value)}</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Progress Bars */}
          <div className="mt-4 space-y-2">
            {portfolioAnalysis.category_breakdown && Object.entries(portfolioAnalysis.category_breakdown).map(([category, data]) => {
              const percentage = (data.value / summary.total_current_value) * 100;
              return (
                <div key={category} className="space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getCategoryColor(category)}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Risk & Performance Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5" />
            <span>Risk & Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Overall Performance */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Portfolio Performance</p>
              <div className="flex items-center space-x-2 mt-1">
                {(summary.total_unrealized_gain_loss || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className={`font-semibold ${
                  (summary.total_unrealized_gain_loss || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(summary.total_unrealized_gain_loss || 0)}
                </span>
                <span className="text-sm text-gray-500">
                  ({formatPercentage(
                    summary.total_acquisition_cost > 0 
                      ? (summary.total_unrealized_gain_loss / summary.total_acquisition_cost) * 100 
                      : 0
                  )})
                </span>
              </div>
            </div>
          </div>

          {/* Risk Assessment */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Risk Level</span>
              <Badge 
                className={getRiskLevelColor(portfolioAnalysis.risk_assessment || 'moderate')}
                variant="outline"
              >
                {(portfolioAnalysis.risk_assessment || 'moderate').toUpperCase()}
              </Badge>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Diversification Score</span>
              <span className="font-semibold">
                {portfolioAnalysis.diversification_score || 0}/10
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Liquidity Ratio</span>
              <span className="font-semibold">
                {formatPercentage(portfolioAnalysis.liquidity_ratio || 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CFA-Compliant Recommendations */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Portfolio Recommendations</CardTitle>
          <p className="text-sm text-gray-600">
            CFA Institute-aligned suggestions for portfolio optimization
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {portfolioAnalysis.recommendations && portfolioAnalysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                {getRecommendationIcon(rec.type)}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                  {rec.impact && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Expected Impact: {rec.impact}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Default recommendations if none provided */}
            {(!portfolioAnalysis.recommendations || portfolioAnalysis.recommendations.length === 0) && (
              <>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Diversification Review</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Consider diversifying across asset classes to optimize risk-adjusted returns.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Liquidity Assessment</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Ensure adequate liquid assets (3-6 months expenses) for emergency fund requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Regular Rebalancing</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Review and rebalance portfolio quarterly to maintain target allocation percentages.
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PortfolioAnalysis;