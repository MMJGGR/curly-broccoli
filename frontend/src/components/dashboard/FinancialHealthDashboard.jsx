import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  TrendingUp, TrendingDown, DollarSign, Target, 
  PieChart, BarChart3, Calendar, AlertTriangle 
} from '../ui/icons';
import { formatCurrency } from '../../utils/formatters';

const FinancialHealthDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [projectionPeriod, setProjectionPeriod] = useState('1year');

  useEffect(() => {
    fetchDashboardData();
  }, [projectionPeriod]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      // Fetch data from multiple endpoints in parallel
      const [
        netWorthResponse,
        assetsResponse,
        liabilitiesResponse,
        goalsResponse,
        incomeResponse,
        expensesResponse
      ] = await Promise.all([
        fetch('/api/v1/relationships-v2/net-worth-impact', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/v1/assets-v2/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/v1/liabilities-v2/', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/v1/goals-v2/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/v1/income-v2/overview', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/v1/expenses-v2/', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const [
        netWorthData,
        assetsData,
        liabilitiesData,
        goalsData,
        incomeData,
        expensesData
      ] = await Promise.all([
        netWorthResponse.ok ? netWorthResponse.json() : { data: {} },
        assetsResponse.ok ? assetsResponse.json() : [],
        liabilitiesResponse.ok ? liabilitiesResponse.json() : [],
        goalsResponse.ok ? goalsResponse.json() : { goals: [] },
        incomeResponse.ok ? incomeResponse.json() : { total_monthly_income: 0 },
        expensesResponse.ok ? expensesResponse.json() : { expenses: [] }
      ]);

      // Calculate comprehensive dashboard metrics
      const calculatedData = calculateDashboardMetrics({
        netWorth: netWorthData.data || {},
        relationships: netWorthData.data || {}, // Use the same net worth data for relationships
        assets: assetsData,
        liabilities: liabilitiesData,
        goals: goalsData.goals || [],
        income: incomeData,
        expenses: expensesData.expenses || []
      });

      setDashboardData(calculatedData);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDashboardMetrics = (data) => {
    // Net Worth Calculation
    const totalAssets = data.assets.reduce((sum, asset) => sum + asset.current_value, 0);
    const totalLiabilities = data.liabilities.reduce((sum, liability) => sum + liability.balance, 0);
    const netWorth = totalAssets - totalLiabilities;

    // Income & Expenses
    const monthlyIncome = data.income.total_monthly_income || 0;
    const monthlyExpenses = data.expenses.reduce((sum, expense) => sum + (expense.monthly_equivalent || 0), 0);
    const monthlySurplus = monthlyIncome - monthlyExpenses;

    // Goals Analysis
    const totalGoalValue = data.goals.reduce((sum, goal) => sum + goal.target_amount, 0);
    const totalGoalProgress = data.goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);
    const goalCompletionRate = totalGoalValue > 0 ? (totalGoalProgress / totalGoalValue) * 100 : 0;

    // Financial Health Ratios (CFA-compliant)
    const savingsRate = monthlyIncome > 0 ? (monthlySurplus / monthlyIncome) * 100 : 0;
    const debtToIncomeRatio = monthlyIncome > 0 ? (totalLiabilities / (monthlyIncome * 12)) * 100 : 0;
    const emergencyFundRatio = monthlyExpenses > 0 ? (totalAssets / monthlyExpenses) : 0;

    // Asset Allocation
    const assetAllocation = calculateAssetAllocation(data.assets);

    // Financial Health Score (0-100)
    const healthScore = calculateFinancialHealthScore({
      savingsRate,
      debtToIncomeRatio,
      emergencyFundRatio,
      goalCompletionRate,
      netWorth
    });

    // Projections
    const projections = calculateProjections({
      monthlyIncome,
      monthlyExpenses,
      monthlySurplus,
      currentNetWorth: netWorth,
      savingsRate,
      period: projectionPeriod
    });

    return {
      overview: {
        netWorth,
        totalAssets,
        totalLiabilities,
        monthlyIncome,
        monthlyExpenses,
        monthlySurplus,
        healthScore
      },
      ratios: {
        savingsRate,
        debtToIncomeRatio,
        emergencyFundRatio,
        goalCompletionRate
      },
      goals: {
        totalGoals: data.goals.length,
        totalValue: totalGoalValue,
        totalProgress: totalGoalProgress,
        completionRate: goalCompletionRate,
        activeGoals: data.goals.filter(g => !g.is_achieved).length
      },
      assetAllocation,
      projections,
      relationships: data.relationships,
      alerts: generateFinancialAlerts({
        savingsRate,
        debtToIncomeRatio,
        emergencyFundRatio,
        monthlySurplus,
        goals: data.goals
      })
    };
  };

  const calculateAssetAllocation = (assets) => {
    const totalValue = assets.reduce((sum, asset) => sum + asset.current_value, 0);
    const allocation = {};

    assets.forEach(asset => {
      const type = asset.asset_type || 'other';
      if (!allocation[type]) {
        allocation[type] = { value: 0, percentage: 0, count: 0 };
      }
      allocation[type].value += asset.current_value;
      allocation[type].count += 1;
    });

    // Calculate percentages
    Object.keys(allocation).forEach(type => {
      allocation[type].percentage = totalValue > 0 ? (allocation[type].value / totalValue) * 100 : 0;
    });

    return allocation;
  };

  const calculateFinancialHealthScore = (metrics) => {
    let score = 0;

    // Savings Rate (25 points)
    if (metrics.savingsRate >= 20) score += 25;
    else if (metrics.savingsRate >= 10) score += 15;
    else if (metrics.savingsRate >= 5) score += 10;

    // Debt to Income Ratio (25 points)
    if (metrics.debtToIncomeRatio <= 20) score += 25;
    else if (metrics.debtToIncomeRatio <= 40) score += 15;
    else if (metrics.debtToIncomeRatio <= 60) score += 10;

    // Emergency Fund (25 points)
    if (metrics.emergencyFundRatio >= 6) score += 25;
    else if (metrics.emergencyFundRatio >= 3) score += 15;
    else if (metrics.emergencyFundRatio >= 1) score += 10;

    // Goal Progress (15 points)
    if (metrics.goalCompletionRate >= 80) score += 15;
    else if (metrics.goalCompletionRate >= 50) score += 10;
    else if (metrics.goalCompletionRate >= 20) score += 5;

    // Net Worth Positive (10 points)
    if (metrics.netWorth > 0) score += 10;

    return Math.min(score, 100);
  };

  const calculateProjections = (data) => {
    const periods = {
      '6months': 6,
      '1year': 12,
      '3years': 36,
      '5years': 60
    };

    const months = periods[data.period] || 12;
    const projectedNetWorth = data.currentNetWorth + (data.monthlySurplus * months);
    const projectedAssets = data.currentNetWorth + (data.monthlyIncome * data.savingsRate / 100 * months);

    return {
      period: data.period,
      months,
      projectedNetWorth,
      projectedAssets,
      totalSavings: data.monthlySurplus * months,
      compoundGrowth: calculateCompoundGrowth(data.currentNetWorth, data.monthlySurplus, months)
    };
  };

  const calculateCompoundGrowth = (principal, monthlyContribution, months, annualRate = 0.07) => {
    const monthlyRate = annualRate / 12;
    const futureValue = principal * Math.pow(1 + monthlyRate, months) +
      monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    return futureValue;
  };

  const generateFinancialAlerts = (data) => {
    const alerts = [];

    if (data.savingsRate < 10) {
      alerts.push({
        type: 'warning',
        message: `Low savings rate (${data.savingsRate.toFixed(1)}%). Aim for at least 20% of income.`,
        priority: 'high'
      });
    }

    if (data.debtToIncomeRatio > 40) {
      alerts.push({
        type: 'danger',
        message: `High debt-to-income ratio (${data.debtToIncomeRatio.toFixed(1)}%). Consider debt reduction.`,
        priority: 'high'
      });
    }

    if (data.emergencyFundRatio < 3) {
      alerts.push({
        type: 'warning',
        message: `Insufficient emergency fund. You have ${data.emergencyFundRatio.toFixed(1)} months of expenses.`,
        priority: 'medium'
      });
    }

    if (data.monthlySurplus < 0) {
      alerts.push({
        type: 'danger',
        message: 'Monthly deficit detected. Expenses exceed income.',
        priority: 'critical'
      });
    }

    // Goal-specific alerts
    const overdueGoals = data.goals.filter(goal => {
      const targetDate = new Date(goal.target_date);
      return targetDate < new Date() && !goal.is_achieved;
    });

    if (overdueGoals.length > 0) {
      alerts.push({
        type: 'info',
        message: `${overdueGoals.length} goal(s) are overdue. Consider revising timelines.`,
        priority: 'medium'
      });
    }

    return alerts;
  };

  const getHealthScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthScoreLabel = (score) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading financial dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Unable to load dashboard data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="financial-health-dashboard">
      {/* Header with Health Score */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Financial Health Dashboard</h1>
              <p className="text-gray-600">Comprehensive overview of your financial position</p>
            </div>
            <div className="text-center">
              <div className={`text-6xl font-bold ${getHealthScoreColor(dashboardData.overview.healthScore)}`}>
                {dashboardData.overview.healthScore}
              </div>
              <div className={`text-lg font-medium ${getHealthScoreColor(dashboardData.overview.healthScore)}`}>
                {getHealthScoreLabel(dashboardData.overview.healthScore)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Net Worth</p>
                <p className={`text-2xl font-bold ${dashboardData.overview.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dashboardData.overview.netWorth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Surplus</p>
                <p className={`text-2xl font-bold ${dashboardData.overview.monthlySurplus >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(dashboardData.overview.monthlySurplus)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <PieChart className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Savings Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dashboardData.ratios.savingsRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Goal Progress</p>
                <p className="text-2xl font-bold text-orange-600">
                  {dashboardData.ratios.goalCompletionRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts Section */}
      {dashboardData.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2 text-yellow-500" />
              Financial Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dashboardData.alerts.map((alert, index) => (
                <div key={index} className={`p-3 rounded-lg border ${
                  alert.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800' :
                  alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}>
                  <div className="flex justify-between items-start">
                    <p className="text-sm">{alert.message}</p>
                    <Badge variant={alert.priority === 'high' ? 'destructive' : 'secondary'}>
                      {alert.priority}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {['overview', 'projections', 'allocation'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors capitalize ${
              activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Ratios */}
          <Card>
            <CardHeader>
              <CardTitle>Key Financial Ratios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Savings Rate</span>
                  <span className="font-bold">{dashboardData.ratios.savingsRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Debt-to-Income</span>
                  <span className="font-bold">{dashboardData.ratios.debtToIncomeRatio.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Emergency Fund</span>
                  <span className="font-bold">{dashboardData.ratios.emergencyFundRatio.toFixed(1)} months</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Goal Completion</span>
                  <span className="font-bold">{dashboardData.ratios.goalCompletionRate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Goals Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Goals</span>
                  <span className="font-bold">{dashboardData.goals.totalGoals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Goals</span>
                  <span className="font-bold">{dashboardData.goals.activeGoals}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Target Value</span>
                  <span className="font-bold">{formatCurrency(dashboardData.goals.totalValue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Current Progress</span>
                  <span className="font-bold">{formatCurrency(dashboardData.goals.totalProgress)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'projections' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Financial Projections</CardTitle>
            <select
              value={projectionPeriod}
              onChange={(e) => setProjectionPeriod(e.target.value)}
              className="border rounded-md px-3 py-1"
            >
              <option value="6months">6 Months</option>
              <option value="1year">1 Year</option>
              <option value="3years">3 Years</option>
              <option value="5years">5 Years</option>
            </select>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Projected Net Worth</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(dashboardData.projections.projectedNetWorth)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(dashboardData.projections.totalSavings)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">With Compound Growth</p>
                <p className="text-2xl font-bold text-purple-600">
                  {formatCurrency(dashboardData.projections.compoundGrowth)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'allocation' && (
        <Card>
          <CardHeader>
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(dashboardData.assetAllocation).map(([type, data]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="capitalize font-medium">{type.replace('_', ' ')}</div>
                    <Badge variant="secondary">{data.count} assets</Badge>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{formatCurrency(data.value)}</div>
                    <div className="text-sm text-gray-600">{data.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancialHealthDashboard;