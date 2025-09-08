import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, AlertCircle } from '../ui/icons';
import { Badge } from '../ui/badge';
import AssetForm from './AssetForm';
import AssetList from './AssetList';
import PortfolioAnalysis from './PortfolioAnalysis';
import { formatCurrency } from '../../utils/formatters';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const AssetDashboard = () => {
  const {
    assets,
    loading,
    error,
    deleteAsset,
    fetchAllFinancialData
  } = useUnifiedFinancialContext();
  
  const [summary, setSummary] = useState(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    calculateAssetsSummary();
  }, [assets]);

  const calculateAssetsSummary = () => {
    if (!assets || assets.length === 0) {
      setSummary({
        total_current_value: 0,
        total_assets: 0,
        total_unrealized_gain_loss: 0
      });
      setPortfolioAnalysis({
        liquidity_ratio: 0,
        risk_assessment: 'moderate',
        diversification_score: 0
      });
      return;
    }

    const totalCurrentValue = assets.reduce((sum, asset) => sum + (asset.current_value || 0), 0);
    const totalPurchasePrice = assets.reduce((sum, asset) => sum + (asset.purchase_price || 0), 0);
    const totalUnrealizedGainLoss = totalCurrentValue - totalPurchasePrice;

    // Calculate basic portfolio analysis
    const liquidAssetTypes = ['savings_account', 'investment_account'];
    const liquidAssetsValue = assets
      .filter(asset => liquidAssetTypes.includes(asset.asset_type))
      .reduce((sum, asset) => sum + (asset.current_value || 0), 0);
    const liquidityRatio = totalCurrentValue > 0 ? (liquidAssetsValue / totalCurrentValue) * 100 : 0;

    // Calculate diversification score (basic implementation)
    const assetTypes = [...new Set(assets.map(asset => asset.asset_type))];
    const diversificationScore = Math.min(assetTypes.length * 2, 10);

    // Risk assessment based on asset types
    const highRiskTypes = ['business', 'collectibles'];
    const moderateRiskTypes = ['real_estate', 'investment_account'];
    const highRiskValue = assets
      .filter(asset => highRiskTypes.includes(asset.asset_type))
      .reduce((sum, asset) => sum + (asset.current_value || 0), 0);
    const moderateRiskValue = assets
      .filter(asset => moderateRiskTypes.includes(asset.asset_type))
      .reduce((sum, asset) => sum + (asset.current_value || 0), 0);
    
    let riskAssessment = 'low';
    if (highRiskValue / totalCurrentValue > 0.3) riskAssessment = 'high';
    else if (moderateRiskValue / totalCurrentValue > 0.3) riskAssessment = 'moderate';

    setSummary({
      total_current_value: totalCurrentValue,
      total_assets: assets.length,
      total_unrealized_gain_loss: totalUnrealizedGainLoss
    });

    setPortfolioAnalysis({
      liquidity_ratio: liquidityRatio,
      risk_assessment: riskAssessment,
      diversification_score: diversificationScore
    });
  };

  const handleAssetCreated = (newAsset) => {
    setShowAssetForm(false);
    fetchAllFinancialData(); // Refresh all data through unified context
  };

  const handleAssetUpdated = (updatedAsset) => {
    setEditingAsset(null);
    fetchAllFinancialData(); // Refresh all data through unified context
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setShowAssetForm(true);
  };

  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) {
      return;
    }

    try {
      await deleteAsset(assetId);
    } catch (err) {
      console.error('Error deleting asset:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading assets...</div>
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
              <span>Error loading assets: {error}</span>
            </div>
            <Button 
              onClick={fetchAllFinancialData} 
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

  const getRiskLevelColor = (level) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asset Portfolio</h1>
          <p className="text-gray-600 mt-1">Track and manage your assets with CFA-compliant analysis</p>
        </div>
        <Button 
          onClick={() => {
            setEditingAsset(null);
            setShowAssetForm(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Asset</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.total_current_value || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.total_assets || 0} assets total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unrealized Gain/Loss</CardTitle>
            {(summary?.total_unrealized_gain_loss || 0) >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              (summary?.total_unrealized_gain_loss || 0) >= 0 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {formatCurrency(summary?.total_unrealized_gain_loss || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Since acquisition
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Liquidity Ratio</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(portfolioAnalysis?.liquidity_ratio || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Liquid assets percentage
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Assessment</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge 
              className={getRiskLevelColor(portfolioAnalysis?.risk_assessment || 'moderate')}
              variant="outline"
            >
              {(portfolioAnalysis?.risk_assessment || 'moderate').toUpperCase()}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Diversification: {portfolioAnalysis?.diversification_score || 0}/10
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Portfolio Analysis */}
      <PortfolioAnalysis 
        portfolioAnalysis={portfolioAnalysis}
        summary={summary}
      />

      {/* Asset Form Modal */}
      {showAssetForm && (
        <AssetForm
          asset={editingAsset}
          onAssetCreated={handleAssetCreated}
          onAssetUpdated={handleAssetUpdated}
          onCancel={() => {
            setShowAssetForm(false);
            setEditingAsset(null);
          }}
        />
      )}

      {/* Asset List */}
      <AssetList
        assets={assets}
        onEditAsset={handleEditAsset}
        onDeleteAsset={handleDeleteAsset}
      />
    </div>
  );
};

export default AssetDashboard;