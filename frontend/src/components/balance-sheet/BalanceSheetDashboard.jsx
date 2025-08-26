import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Building2, 
  CreditCard,
  PieChart,
  BarChart,
  AlertCircle,
  Calculator
} from '../ui/icons';
import { AssetDashboard } from '../assets';
import { ExpenseDashboard } from '../expenses';
import { formatCurrency } from '../../utils/formatters';

const BalanceSheetDashboard = () => {
  const [activeView, setActiveView] = useState('overview');
  const [balanceSheetMode, setBalanceSheetMode] = useState('traditional'); // 'traditional' or 'lifetime'
  const [balanceSheetData, setBalanceSheetData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBalanceSheetData();
  }, []);

  const fetchBalanceSheetData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('jwt');
      
      // Fetch both assets and expenses data in parallel
      const [assetsResponse, expensesResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/assets-v2/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/expenses-v2/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ]);

      if (!assetsResponse.ok || !expensesResponse.ok) {
        throw new Error('Failed to fetch balance sheet data');
      }

      const [assetsData, expensesData] = await Promise.all([
        assetsResponse.json(),
        expensesResponse.json()
      ]);

      // Calculate both traditional and lifetime values
      const traditionalNetWorth = (assetsData.summary?.total_current_value || 0);
      const lifetimeAssets = traditionalNetWorth + calculateHumanCapital(assetsData, expensesData);
      const lifetimeExpenseLiabilities = calculateLifetimeExpenseLiabilities(expensesData);
      
      setBalanceSheetData({
        assets: assetsData,
        expenses: expensesData,
        traditional: {
          netWorth: traditionalNetWorth,
          totalAssets: assetsData.summary?.total_current_value || 0,
          totalLiabilities: 0 // TODO: Add real liabilities
        },
        lifetime: {
          netWorth: lifetimeAssets - lifetimeExpenseLiabilities,
          totalAssets: lifetimeAssets,
          totalLiabilities: lifetimeExpenseLiabilities,
          humanCapital: calculateHumanCapital(assetsData, expensesData)
        }
      });

    } catch (err) {
      console.error('Error fetching balance sheet:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Simple lifetime calculations (placeholder - should be enhanced)
  const calculateHumanCapital = (assetsData, expensesData) => {
    // Estimate based on current income if available
    // For demo: assume 40 years of work at current income level
    const estimatedAnnualIncome = 800000; // KES - should come from user data
    const workingYears = 40;
    const discountRate = 0.08;
    
    let humanCapitalPV = 0;
    for (let year = 1; year <= workingYears; year++) {
      humanCapitalPV += estimatedAnnualIncome / Math.pow(1 + discountRate, year);
    }
    return humanCapitalPV;
  };

  const calculateLifetimeExpenseLiabilities = (expensesData) => {
    // Estimate lifetime expense obligations
    const estimatedAnnualExpenses = 600000; // KES - should come from expense data
    const remainingLifeYears = 50;
    const discountRate = 0.06;
    
    let lifetimeExpensesPV = 0;
    for (let year = 1; year <= remainingLifeYears; year++) {
      lifetimeExpensesPV += estimatedAnnualExpenses / Math.pow(1 + discountRate, year);
    }
    return lifetimeExpensesPV;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading balance sheet...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span>Error loading balance sheet: {error}</span>
            </div>
            <Button 
              onClick={fetchBalanceSheetData} 
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderOverview = () => (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header with Mode Toggle */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Balance Sheet Overview</h1>
        <p className="text-gray-600 mt-2">
          Comprehensive view of your financial position with CFA-compliant analysis
        </p>
        
        {/* Clean Toggle */}
        <div className="mt-6 inline-flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setBalanceSheetMode('traditional')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              balanceSheetMode === 'traditional'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📊 Current Position
          </button>
          <button
            onClick={() => setBalanceSheetMode('lifetime')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
              balanceSheetMode === 'lifetime'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            🎯 Lifetime View
          </button>
        </div>
        
        {/* Mode Description */}
        <p className="text-sm text-gray-500 mt-3">
          {balanceSheetMode === 'traditional' 
            ? 'Your current assets and liabilities today'
            : 'Your lifetime earning capacity vs. lifetime expenses (CFA method)'
          }
        </p>
      </div>

      {/* Key Metrics - Dynamic based on mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {balanceSheetMode === 'traditional' ? (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Assets</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(balanceSheetData?.traditional?.totalAssets || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Physical assets you own today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Liabilities</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(balanceSheetData?.traditional?.totalLiabilities || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Debts you owe today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Net Worth</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  (balanceSheetData?.traditional?.netWorth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(balanceSheetData?.traditional?.netWorth || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Assets minus liabilities
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lifetime Assets</CardTitle>
                <Building2 className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(balanceSheetData?.lifetime?.totalAssets || 0)}
                </div>
                <p className="text-xs text-purple-600">
                  Current assets + human capital
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lifetime Liabilities</CardTitle>
                <CreditCard className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(balanceSheetData?.lifetime?.totalLiabilities || 0)}
                </div>
                <p className="text-xs text-purple-600">
                  Present value of future expenses
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lifetime Net Worth</CardTitle>
                <Calculator className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${
                  (balanceSheetData?.lifetime?.netWorth || 0) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(balanceSheetData?.lifetime?.netWorth || 0)}
                </div>
                <p className="text-xs text-purple-600">
                  CFA lifetime value approach
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Asset vs Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Asset Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceSheetData?.assets?.portfolio_analysis?.category_breakdown ? (
              <div className="space-y-3">
                {Object.entries(balanceSheetData.assets.portfolio_analysis.category_breakdown).map(([category, data]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{category.replace('_', ' ').toUpperCase()}</span>
                    <span className="font-semibold">{formatCurrency(data.value)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No asset data available</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="h-5 w-5" />
              <span>Expense Categories</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {balanceSheetData?.expenses?.summary?.expense_count_by_category ? (
              <div className="space-y-3">
                {Object.entries(balanceSheetData.expenses.summary.expense_count_by_category).map(([category, count]) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm">{category.replace('_', ' ').toUpperCase()}</span>
                    <Badge variant="outline">
                      {count} expenses
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No expense data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* CFA Analysis Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Position Analysis</CardTitle>
          <p className="text-sm text-gray-600">
            CFA Institute-aligned assessment of your financial health
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Liquidity Assessment</h4>
              <div className="flex justify-between">
                <span>Liquidity Ratio:</span>
                <span className="font-semibold">
                  {(balanceSheetData?.assets?.portfolio_analysis?.liquidity_ratio || 0).toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span>Monthly Recurring Expenses:</span>
                <span className="font-semibold text-red-600">
                  {formatCurrency(balanceSheetData?.expenses?.summary?.monthly_recurring_total?.amount || 0)}
                </span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900">Portfolio Health</h4>
              <div className="flex justify-between">
                <span>Risk Assessment:</span>
                <Badge variant="outline">
                  {(balanceSheetData?.assets?.portfolio_analysis?.risk_assessment || 'moderate').toUpperCase()}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Asset Performance:</span>
                <span className={`font-semibold ${
                  (balanceSheetData?.assets?.summary?.total_unrealized_gain_loss || 0) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(balanceSheetData?.assets?.summary?.total_unrealized_gain_loss || 0)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button
          onClick={() => setActiveView('assets')}
          className="flex items-center space-x-2"
          size="lg"
        >
          <Building2 className="h-4 w-4" />
          <span>Manage Assets</span>
        </Button>
        <Button
          onClick={() => setActiveView('expenses')}
          variant="outline"
          className="flex items-center space-x-2"
          size="lg"
        >
          <CreditCard className="h-4 w-4" />
          <span>Track Expenses</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <nav className="flex space-x-8" aria-label="Balance Sheet Navigation">
            <button
              onClick={() => setActiveView('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveView('assets')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'assets'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Assets
            </button>
            <button
              onClick={() => setActiveView('expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeView === 'expenses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Expenses
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="py-6">
        {activeView === 'overview' && renderOverview()}
        {activeView === 'assets' && <AssetDashboard />}
        {activeView === 'expenses' && <ExpenseDashboard />}
      </div>
    </div>
  );
};

export default BalanceSheetDashboard;