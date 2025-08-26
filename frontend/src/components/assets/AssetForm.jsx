import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Save, AlertCircle } from '../ui/icons';
import { Badge } from '../ui/badge';

const AssetForm = ({ asset, onAssetCreated, onAssetUpdated, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    asset_type: '',
    current_value: '',
    acquisition_cost: '',
    acquisition_date: '',
    useful_life_years: '',
    description: '',
    location: ''
  });
  const [availableTypes, setAvailableTypes] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchAvailableTypes();
    
    // If editing, populate form with asset data
    if (asset) {
      setFormData({
        name: asset.name || '',
        asset_type: asset.asset_type || '',
        current_value: asset.current_value?.toString() || '',
        acquisition_cost: asset.acquisition_cost?.toString() || '',
        acquisition_date: asset.acquisition_date ? asset.acquisition_date.split('T')[0] : '',
        useful_life_years: asset.useful_life_years?.toString() || '',
        description: asset.description || '',
        location: asset.location || ''
      });
    }
  }, [asset]);

  const fetchAvailableTypes = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/assets-v2/types/available`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch asset types');
      }

      const data = await response.json();
      setAvailableTypes(data.asset_categories || {});
    } catch (err) {
      console.error('Error fetching asset types:', err);
      setError('Failed to load asset types');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Asset name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Asset name must be at least 2 characters';
    }

    if (!formData.asset_type) {
      errors.asset_type = 'Asset type is required';
    }

    if (!formData.current_value) {
      errors.current_value = 'Current value is required';
    } else if (isNaN(parseFloat(formData.current_value)) || parseFloat(formData.current_value) < 0) {
      errors.current_value = 'Current value must be a positive number';
    }

    if (!formData.acquisition_cost) {
      errors.acquisition_cost = 'Acquisition cost is required';
    } else if (isNaN(parseFloat(formData.acquisition_cost)) || parseFloat(formData.acquisition_cost) < 0) {
      errors.acquisition_cost = 'Acquisition cost must be a positive number';
    }

    if (!formData.acquisition_date) {
      errors.acquisition_date = 'Acquisition date is required';
    }

    if (formData.useful_life_years && 
        (isNaN(parseInt(formData.useful_life_years)) || parseInt(formData.useful_life_years) <= 0)) {
      errors.useful_life_years = 'Useful life must be a positive number';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const url = asset 
        ? `${process.env.REACT_APP_API_BASE_URL}/api/v1/assets-v2/${asset.id}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/v1/assets-v2/`;
      
      const method = asset ? 'PUT' : 'POST';

      const payload = {
        name: formData.name.trim(),
        asset_type: formData.asset_type,
        current_value: parseFloat(formData.current_value),
        acquisition_cost: parseFloat(formData.acquisition_cost),
        acquisition_date: formData.acquisition_date + 'T00:00:00Z',
        useful_life_years: formData.useful_life_years ? parseInt(formData.useful_life_years) : null,
        description: formData.description.trim() || null,
        location: formData.location.trim() || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save asset');
      }

      const result = await response.json();
      
      if (asset) {
        onAssetUpdated(result.asset);
      } else {
        onAssetCreated(result.asset);
      }
    } catch (err) {
      console.error('Error saving asset:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getAssetTypeInfo = (assetType) => {
    for (const category of Object.values(availableTypes)) {
      const type = category.find(t => t.value === assetType);
      if (type) return type;
    }
    return null;
  };

  const selectedTypeInfo = formData.asset_type ? getAssetTypeInfo(formData.asset_type) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Asset Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., Emergency Fund Savings"
                className={validationErrors.name ? 'border-red-500' : ''}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Asset Type */}
            <div className="space-y-2">
              <Label>Asset Type *</Label>
              <Select 
                value={formData.asset_type} 
                onValueChange={(value) => handleInputChange('asset_type', value)}
              >
                <SelectTrigger className={validationErrors.asset_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(availableTypes).map(([category, types]) => (
                    <div key={category}>
                      <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                        {category.replace('_', ' ')}
                      </div>
                      {types.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center justify-between w-full">
                            <span>{type.label}</span>
                            <div className="flex space-x-1 ml-2">
                              {type.is_liquid && (
                                <Badge variant="outline" className="text-xs">Liquid</Badge>
                              )}
                              <Badge 
                                variant="outline" 
                                className={`text-xs ${
                                  type.risk_level === 'low' ? 'bg-green-50 text-green-700' :
                                  type.risk_level === 'high' ? 'bg-red-50 text-red-700' :
                                  'bg-yellow-50 text-yellow-700'
                                }`}
                              >
                                {type.risk_level}
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.asset_type && (
                <p className="text-sm text-red-600">{validationErrors.asset_type}</p>
              )}
              
              {/* Asset Type Info */}
              {selectedTypeInfo && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <span>Risk Level: {selectedTypeInfo.risk_level}</span>
                    {selectedTypeInfo.is_liquid && <span>• Liquid Asset</span>}
                    {selectedTypeInfo.is_appreciating && <span>• Typically Appreciates</span>}
                  </div>
                </div>
              )}
            </div>

            {/* Financial Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_value">Current Value (KES) *</Label>
                <Input
                  id="current_value"
                  type="number"
                  step="0.01"
                  value={formData.current_value}
                  onChange={(e) => handleInputChange('current_value', e.target.value)}
                  placeholder="0.00"
                  className={validationErrors.current_value ? 'border-red-500' : ''}
                />
                {validationErrors.current_value && (
                  <p className="text-sm text-red-600">{validationErrors.current_value}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="acquisition_cost">Acquisition Cost (KES) *</Label>
                <Input
                  id="acquisition_cost"
                  type="number"
                  step="0.01"
                  value={formData.acquisition_cost}
                  onChange={(e) => handleInputChange('acquisition_cost', e.target.value)}
                  placeholder="0.00"
                  className={validationErrors.acquisition_cost ? 'border-red-500' : ''}
                />
                {validationErrors.acquisition_cost && (
                  <p className="text-sm text-red-600">{validationErrors.acquisition_cost}</p>
                )}
              </div>
            </div>

            {/* Dates and Life */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="acquisition_date">Acquisition Date *</Label>
                <Input
                  id="acquisition_date"
                  type="date"
                  value={formData.acquisition_date}
                  onChange={(e) => handleInputChange('acquisition_date', e.target.value)}
                  className={validationErrors.acquisition_date ? 'border-red-500' : ''}
                />
                {validationErrors.acquisition_date && (
                  <p className="text-sm text-red-600">{validationErrors.acquisition_date}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="useful_life_years">Useful Life (Years)</Label>
                <Input
                  id="useful_life_years"
                  type="number"
                  value={formData.useful_life_years}
                  onChange={(e) => handleInputChange('useful_life_years', e.target.value)}
                  placeholder="e.g., 10 (for vehicles)"
                  className={validationErrors.useful_life_years ? 'border-red-500' : ''}
                />
                {validationErrors.useful_life_years && (
                  <p className="text-sm text-red-600">{validationErrors.useful_life_years}</p>
                )}
              </div>
            </div>

            {/* Optional Fields */}
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Nairobi, Kenya"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Additional details about this asset..."
                rows={3}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>{loading ? 'Saving...' : (asset ? 'Update Asset' : 'Add Asset')}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AssetForm;