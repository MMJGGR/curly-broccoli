import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
// Removed unused Select imports - using native HTML select instead
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, TrendingUp } from '../ui/icons';
import { formatCurrency } from '../../utils/formatters';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const AssetManagement = () => {
  // Use UnifiedFinancialContext instead of local state
  const {
    assets,
    loading,
    createAsset,
    updateAsset,
    deleteAsset,
    fetchAllFinancialData
  } = useUnifiedFinancialContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    asset_type: '',
    current_value: '',
    purchase_price: '',
    purchase_date: '',
    description: '',
    notes: ''
  });

  const assetTypes = [
    { value: 'real_estate', label: 'Real Estate', icon: TrendingUp },
    { value: 'vehicle', label: 'Vehicle', icon: TrendingUp },
    { value: 'business', label: 'Business', icon: TrendingUp },
    { value: 'investment_account', label: 'Investment Account', icon: TrendingUp },
    { value: 'savings_account', label: 'Savings Account', icon: TrendingUp },
    { value: 'equipment', label: 'Equipment', icon: TrendingUp },
    { value: 'collectibles', label: 'Collectibles', icon: TrendingUp },
    { value: 'other', label: 'Other', icon: TrendingUp }
  ];

  useEffect(() => {
    // Load all financial data from unified context
    if (assets.length === 0) {
      fetchAllFinancialData().catch(error => {
        console.error('Error loading financial data:', error);
      });
    }
  }, [assets.length, fetchAllFinancialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        current_value: parseFloat(formData.current_value),
        purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : null
      };

      if (editingAsset) {
        await updateAsset(editingAsset.id, payload);
      } else {
        await createAsset(payload);
      }

      setIsFormOpen(false);
      setEditingAsset(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save asset:', error);
    }
  };

  const handleEdit = (asset) => {
    setEditingAsset(asset);
    setFormData({
      name: asset.name,
      asset_type: asset.asset_type,
      current_value: asset.current_value.toString(),
      purchase_price: asset.purchase_price?.toString() || '',
      purchase_date: asset.purchase_date || '',
      description: asset.description || '',
      notes: asset.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset? This will also remove any linked income or expenses.')) return;
    
    try {
      await deleteAsset(assetId);
    } catch (error) {
      console.error('Failed to delete asset:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      asset_type: '',
      current_value: '',
      purchase_price: '',
      purchase_date: '',
      description: '',
      notes: ''
    });
  };

  const calculateGainLoss = (asset) => {
    if (!asset.purchase_price || asset.purchase_price === 0) return null;
    const gain = asset.current_value - asset.purchase_price;
    const percentage = (gain / asset.purchase_price) * 100;
    return { gain, percentage };
  };

  const getAssetTypeIcon = (assetType) => {
    const type = assetTypes.find(t => t.value === assetType);
    return type ? type.icon : TrendingUp;
  };

  const totalAssetValue = assets.reduce((sum, asset) => sum + asset.current_value, 0);

  if (loading.assets || loading.global) {
    return <div className="flex justify-center items-center h-64">Loading assets...</div>;
  }

  return (
    <div className="space-y-6" data-testid="asset-management-section">
      {/* Asset Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-600">Total Asset Value</p>
              <p className="text-3xl font-bold text-green-600" data-testid="total-asset-value">
                {formatCurrency(totalAssetValue)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Asset List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Asset Portfolio</CardTitle>
          <Button onClick={() => setIsFormOpen(true)} data-testid="add-asset-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Asset
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="asset-list">
            {assets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No assets yet. Add your first asset to start building your portfolio.</p>
              </div>
            ) : (
              assets.map((asset) => {
                const IconComponent = getAssetTypeIcon(asset.asset_type);
                const gainLoss = calculateGainLoss(asset);
                
                return (
                  <div key={asset.id} className="border rounded-lg p-4 bg-gray-50" data-testid="asset-item">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-lg" data-testid="asset-name">
                              {asset.name}
                            </h3>
                            <Badge variant="secondary" data-testid="asset-type-badge">
                              {assetTypes.find(t => t.value === asset.asset_type)?.label || asset.asset_type}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-600">Current Value</p>
                            <p className="font-semibold text-green-600" data-testid="current-value">
                              {formatCurrency(asset.current_value)}
                            </p>
                          </div>
                          
                          {asset.purchase_price && (
                            <div>
                              <p className="text-sm text-gray-600">Purchase Price</p>
                              <p className="font-semibold">
                                {formatCurrency(asset.purchase_price)}
                              </p>
                            </div>
                          )}
                          
                          {gainLoss && (
                            <div>
                              <p className="text-sm text-gray-600">Gain/Loss</p>
                              <p className={`font-semibold ${gainLoss.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {gainLoss.gain >= 0 ? '+' : ''}{formatCurrency(gainLoss.gain)}
                              </p>
                              <p className={`text-xs ${gainLoss.gain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ({gainLoss.percentage >= 0 ? '+' : ''}{gainLoss.percentage.toFixed(1)}%)
                              </p>
                            </div>
                          )}
                          
                          {asset.purchase_date && (
                            <div>
                              <p className="text-sm text-gray-600">Purchase Date</p>
                              <p className="font-semibold">
                                {new Date(asset.purchase_date).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </div>

                        {asset.description && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Description:</span> {asset.description}
                            </p>
                          </div>
                        )}

                        {asset.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {asset.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(asset)} data-testid="edit-asset-button">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(asset.id)} className="text-red-600 hover:text-red-800">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Asset Form */}
      {isFormOpen && (
        <Card data-testid="asset-form">
          <CardHeader>
            <CardTitle>{editingAsset ? 'Edit Asset' : 'Add New Asset'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Asset Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Kileleshwa Property"
                    required
                    data-testid="asset-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="asset_type">Asset Type *</Label>
                  <select
                    id="asset_type"
                    value={formData.asset_type}
                    onChange={(e) => {
                      console.log('Asset type selected:', e.target.value); // Debug log
                      setFormData(prev => ({...prev, asset_type: e.target.value}));
                    }}
                    required
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      backgroundColor: 'white',
                      fontSize: '14px'
                    }}
                    data-testid="asset-type-select"
                  >
                    <option value="">Select asset type</option>
                    {assetTypes.map((type) => {
                      console.log('Rendering asset type option:', type.value, type.label); // Debug log
                      return (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <Label htmlFor="current_value">Current Value (KES) *</Label>
                  <Input
                    id="current_value"
                    type="number"
                    step="0.01"
                    value={formData.current_value}
                    onChange={(e) => setFormData({...formData, current_value: e.target.value})}
                    placeholder="0.00"
                    required
                    data-testid="current-value-input"
                  />
                </div>

                <div>
                  <Label htmlFor="purchase_price">Purchase Price (KES)</Label>
                  <Input
                    id="purchase_price"
                    type="number"
                    step="0.01"
                    value={formData.purchase_price}
                    onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                    placeholder="0.00"
                    data-testid="purchase-price-input"
                  />
                </div>

                <div>
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                    data-testid="purchase-date-input"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the asset"
                    data-testid="asset-description-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about this asset..."
                  rows={3}
                  data-testid="asset-notes"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" data-testid="submit-asset">
                  {editingAsset ? 'Update Asset' : 'Add Asset'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingAsset(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AssetManagement;