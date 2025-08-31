import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, TrendingUp, TrendingDown, DollarSign, PieChart, AlertCircle } from '../ui/icons';
import { Badge } from '../ui/badge';
import AssetForm from './AssetForm';
import AssetList from './AssetList';
import PortfolioAnalysis from './PortfolioAnalysis';
import { formatCurrency } from '../../utils/formatters';

const AssetDashboard = () => {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState(null);
  const [portfolioAnalysis, setPortfolioAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAssetForm, setShowAssetForm] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);

  useEffect(() => {
    fetchAssetsData();
  }, []);

  const fetchAssetsData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/assets-v2/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assets data');
      }

      const data = await response.json();
      setAssets(data.assets || []);
      setSummary(data.summary || {});
      setPortfolioAnalysis(data.portfolio_analysis || {});
    } catch (err) {
      console.error('Error fetching assets:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetCreated = (newAsset) => {
    setShowAssetForm(false);
    fetchAssetsData(); // Refresh data
  };

  const handleAssetUpdated = (updatedAsset) => {
    setEditingAsset(null);
    fetchAssetsData(); // Refresh data
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
      const token = localStorage.getItem('jwt');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/assets-v2/${assetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete asset');
      }

      fetchAssetsData(); // Refresh data
    } catch (err) {
      console.error('Error deleting asset:', err);
      setError(err.message);
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
              onClick={fetchAssetsData} 
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