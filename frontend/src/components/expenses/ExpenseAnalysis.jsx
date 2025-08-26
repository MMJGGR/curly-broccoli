import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { BarChart, PieChart, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Target } from '../ui/icons';
import { formatCurrency, formatPercentage } from '../../utils/formatters';

const ExpenseAnalysis = ({ analysis, summary }) => {
  if (!analysis || !summary) {
    return null;
  }

  const getCategoryColor = (category) => {
    const colors = {
      fixed_expenses: 'bg-red-500',
      variable_expenses: 'bg-orange-500',
      discretionary_expenses: 'bg-blue-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  const getRecommendationIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'target': return <Target className="h-4 w-4 text-blue-600" />;
      default: return <TrendingUp className="h-4 w-4 text-blue-600" />;
    }
  };

  const getBudgetStatusColor = (status) => {
    switch (status) {
      case 'on_track': return 'bg-green-100 text-green-800 border-green-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'over_budget': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Spending Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Spending Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {summary.expense_count_by_category && Object.entries(summary.expense_count_by_category).map(([category, count]) => {
              const totalExpenses = summary.total_expenses || 1;
              const percentage = ((count / totalExpenses) * 100).toFixed(1);
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-4 h-4 rounded ${getCategoryColor(category)}`}></div>
                    <span className="text-sm font-medium">
                      {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{count} expenses</div>
                    <div className="text-xs text-gray-500">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Visual Progress Bars */}
          <div className="mt-4 space-y-2">
            {summary.expense_count_by_category && Object.entries(summary.expense_count_by_category).map(([category, count]) => {
              const percentage = (count / (summary.total_expenses || 1)) * 100;
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

      {/* Budget Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart className="h-5 w-5" />
            <span>Budget Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Budget Status */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-700">Budget Status</p>
              <Badge 
                className={getBudgetStatusColor(analysis.budget_status || 'unknown')}
                variant="outline"
              >
                {(analysis.budget_status || 'unknown').replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </div>

          {/* Essential vs Discretionary */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Essential Expenses</span>
              <div className="text-right">
                <span className="font-semibold">{summary.essential_expenses || 0}</span>
                <p className="text-xs text-gray-500">
                  {summary.total_expenses > 0 ? 
                    formatPercentage((summary.essential_expenses || 0) / summary.total_expenses * 100) : '0%'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Discretionary Expenses</span>
              <div className="text-right">
                <span className="font-semibold">{summary.discretionary_expenses || 0}</span>
                <p className="text-xs text-gray-500">
                  {summary.total_expenses > 0 ? 
                    formatPercentage((summary.discretionary_expenses || 0) / summary.total_expenses * 100) : '0%'}
                </p>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Monthly Recurring</span>
              <span className="font-semibold">
                {formatCurrency(summary.monthly_recurring_total?.amount || 0)}
              </span>
            </div>
          </div>

          {/* Spending Efficiency */}
          {analysis.spending_efficiency && (
            <div className="flex justify-between items-center p-2 bg-blue-50 rounded-md">
              <span className="text-sm font-medium text-blue-700">Spending Efficiency</span>
              <span className="font-semibold text-blue-700">
                {analysis.spending_efficiency}/10
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CFA-Compliant Recommendations */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Budget Optimization Recommendations</CardTitle>
          <p className="text-sm text-gray-600">
            CFA Institute-aligned suggestions for expense management and budgeting
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.recommendations && analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                {getRecommendationIcon(rec.type)}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{rec.title}</h4>
                  <p className="text-sm text-gray-700 mt-1">{rec.description}</p>
                  {rec.potential_savings && (
                    <p className="text-xs text-blue-600 mt-2 font-medium">
                      Potential Savings: {formatCurrency(rec.potential_savings)}
                    </p>
                  )}
                </div>
              </div>
            ))}

            {/* Default CFA-compliant recommendations */}
            {(!analysis.recommendations || analysis.recommendations.length === 0) && (
              <>
                <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">50/30/20 Budget Rule</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Allocate 50% to needs, 30% to wants, and 20% to savings and debt repayment.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Recurring Expense Review</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Review recurring expenses monthly - cancel unused subscriptions and negotiate better rates.
                    </p>
                    <p className="text-xs text-yellow-600 mt-2 font-medium">
                      Monthly Impact: {formatCurrency(summary.monthly_recurring_total?.amount || 0)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900">Expense Tracking</h4>
                    <p className="text-sm text-gray-700 mt-1">
                      Continue detailed expense tracking to identify spending patterns and optimization opportunities.
                    </p>
                  </div>
                </div>

                {/* Additional recommendation based on spending patterns */}
                {summary.discretionary_expenses > summary.essential_expenses && (
                  <div className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                    <TrendingDown className="h-4 w-4 text-orange-600" />
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">Discretionary Spending Review</h4>
                      <p className="text-sm text-gray-700 mt-1">
                        Your discretionary expenses exceed essential expenses. Consider reducing non-essential spending to improve savings rate.
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseAnalysis;