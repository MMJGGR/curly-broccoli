import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
// Removed unused Select imports - using native HTML select instead
import { X, Save, AlertCircle } from '../ui/icons';
// import { getKenyaAssetCategories } from '../../utils/kenyaReturnRiskModels';
import HybridSaveManager from '../balance-sheet/HybridSaveManager';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const AssetForm = ({ asset, onAssetCreated, onAssetUpdated, onCancel }) => {
  // Use UnifiedFinancialContext for asset operations
  const { createAsset, updateAsset } = useUnifiedFinancialContext();
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
      // Prefer server-canonical categories/types
      const base = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';
      const token = localStorage.getItem('jwt');
      const catsRes = await fetch(`${base}/api/v1/asset-reference/asset-categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!catsRes.ok) throw new Error('Failed to fetch asset categories');
      const cats = await catsRes.json();
      const categories = Array.isArray(cats.categories) ? cats.categories : [];
      const out = {};
      for (const c of categories) {
        try {
          const typesRes = await fetch(`${base}/api/v1/asset-reference/asset-types/${c.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!typesRes.ok) continue;
          const tjson = await typesRes.json();
          const types = Array.isArray(tjson.types) ? tjson.types : [];
          out[c.code] = types.map(t => ({
            value: t.code,
            label: t.label,
            is_liquid: !!t.is_liquid,
            risk_level: t.risk_level || 'moderate',
            is_appreciating: t.is_appreciating !== false,
            minimum_investment: t.minimum_investment || 0
          }));
        } catch (_) { /* ignore per-category failure */ }
      }
      // If server returned nothing, keep last known state
      if (Object.keys(out).length > 0) {
        setAvailableTypes(out);
      } else {
        throw new Error('No categories available');
      }
    } catch (err) {
      console.error('Error fetching asset types:', err);
      setError('Failed to load asset types from server. Please try again.');
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
    
    // Clear general error message when user makes changes
    if (error) {
      setError('');
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    // Submit form on Ctrl+Enter or Cmd+Enter (only if form is valid)
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      if (validateForm()) {
        handleSubmit(e);
      } else {
        // Show validation errors to user
        setError('Please complete all required fields before saving.');
      }
    }
    // Close form on Escape
    else if (e.key === 'Escape') {
      onCancel();
    }
    // Enter key on select dropdown should not submit form
    else if (e.key === 'Enter' && e.target.tagName === 'SELECT') {
      e.preventDefault();
    }
  };

  // Hybrid save functionality
  const handleAutoSave = async (data, options = {}) => {
    // Auto-save logic - save form state to local storage for recovery
    try {
      const autoSaveData = {
        ...data,
        timestamp: new Date().toISOString(),
        assetType: data.asset_type
      };
      
      localStorage.setItem('asset_form_autosave', JSON.stringify(autoSaveData));
      
      if (options.manualSave) {
        // If manual save, validate and submit to backend
        if (validateForm()) {
          const mockEvent = { preventDefault: () => {} };
          return await handleSubmit(mockEvent);
        } else {
          throw new Error('Please complete all required fields');
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      throw error;
    }
  };

  const handleSaveAsDefaults = async (data) => {
    try {
      const defaults = {
        asset_type: data.asset_type,
        useful_life_years: data.useful_life_years,
        location: data.location,
        // Save common defaults that users typically reuse
        savedAt: new Date().toISOString()
      };
      
      localStorage.setItem('asset_form_defaults', JSON.stringify(defaults));
      
      // Show success message
      setTimeout(() => {
        alert('Asset defaults saved! These will be pre-filled in future asset forms.');
      }, 100);
      
    } catch (error) {
      console.error('Save as defaults failed:', error);
      throw error;
    }
  };

  // Load saved defaults on component mount
  useEffect(() => {
    try {
      const savedDefaults = localStorage.getItem('asset_form_defaults');
      if (savedDefaults) {
        const defaults = JSON.parse(savedDefaults);
        
        // Pre-fill form with defaults for new assets (not when editing)
        if (!asset && Object.keys(formData).every(key => !formData[key])) {
          setFormData(prev => ({
            ...prev,
            asset_type: defaults.asset_type || prev.asset_type,
            useful_life_years: defaults.useful_life_years || prev.useful_life_years,
            location: defaults.location || prev.location
          }));
        }
      }

      // Recovery from auto-save
      const autoSaveData = localStorage.getItem('asset_form_autosave');
      if (autoSaveData && !asset) {
        const savedData = JSON.parse(autoSaveData);
        const timeDiff = new Date() - new Date(savedData.timestamp);
        
        // Only recover if auto-save is less than 30 minutes old
        if (timeDiff < 30 * 60 * 1000) {
          const shouldRecover = window.confirm(
            'Found unsaved changes from a previous session. Would you like to recover them?'
          );
          
          if (shouldRecover) {
            setFormData({
              name: savedData.name || '',
              asset_type: savedData.asset_type || '',
              current_value: savedData.current_value || '',
              acquisition_cost: savedData.acquisition_cost || '',
              acquisition_date: savedData.acquisition_date || '',
              useful_life_years: savedData.useful_life_years || '',
              description: savedData.description || '',
              location: savedData.location || ''
            });
          } else {
            // Clear the auto-save data
            localStorage.removeItem('asset_form_autosave');
          }
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }, [asset, formData]);

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
      // Show user which fields need attention
      const errorFields = Object.keys(validationErrors);
      if (errorFields.length > 0) {
        setError(`Please fix the following fields: ${errorFields.join(', ')}`);
      }
      return;
    }

    setLoading(true);
    setError('');

    try {

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

      let result;
      if (asset) {
        result = await updateAsset(asset.id, payload);
        onAssetUpdated(result);
      } else {
        result = await createAsset(payload);
        onAssetCreated(result);
      }
      
      // Clear auto-save data on successful submission
      localStorage.removeItem('asset_form_autosave');
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onKeyDown={handleKeyDown}>
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{asset ? 'Edit Asset' : 'Add New Asset'}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="h-8 w-8 p-0"
            title="Close (Esc)"
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

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
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
              <select
                value={formData.asset_type} 
                onChange={(e) => {
                  handleInputChange('asset_type', e.target.value);
                  // Clear error and provide immediate feedback
                  if (validationErrors.asset_type) {
                    setValidationErrors(prev => ({ ...prev, asset_type: '' }));
                  }
                }}
                required
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '8px 12px',
                  border: validationErrors.asset_type ? '1px solid #ef4444' : formData.asset_type ? '1px solid #10b981' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  backgroundColor: formData.asset_type ? '#f0fdf4' : 'white',
                  fontSize: '14px'
                }}
              >
                <option value="">Select asset type</option>
                {Object.entries(availableTypes).map(([category, types]) => (
                  <optgroup key={category} label={category.replace('_', ' ').toUpperCase()}>
                    {types.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label} - {type.is_liquid ? '[Liquid]' : '[Illiquid]'} - [{type.risk_level} risk]
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              {validationErrors.asset_type && (
                <p className="text-sm text-red-600">{validationErrors.asset_type}</p>
              )}
              
              {/* Kenya-Specific Asset Type Info */}
              {selectedTypeInfo && (
                <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Kenya Asset Analysis</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Risk Level:</span>
                      <span className={`ml-2 font-medium ${
                        selectedTypeInfo.risk_level === 'low' ? 'text-green-700' :
                        selectedTypeInfo.risk_level === 'high' ? 'text-red-700' :
                        'text-yellow-700'
                      }`}>
                        {selectedTypeInfo.risk_level.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Liquidity:</span>
                      <span className={`ml-2 font-medium ${
                        selectedTypeInfo.is_liquid ? 'text-blue-700' : 'text-orange-700'
                      }`}>
                        {selectedTypeInfo.is_liquid ? 'High' : 'Low'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Growth Potential:</span>
                      <span className={`ml-2 font-medium ${
                        selectedTypeInfo.is_appreciating ? 'text-green-700' : 'text-gray-700'
                      }`}>
                        {selectedTypeInfo.is_appreciating ? 'Appreciating' : 'Stable'}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Min. Investment:</span>
                      <span className="ml-2 font-medium text-purple-700">
                        KES {selectedTypeInfo.minimum_investment?.toLocaleString() || '0'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white/70 rounded text-xs text-blue-600">
                    <strong>CFA Note:</strong> This asset classification follows Kenya market analysis and CFA Institute portfolio management standards.
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

            {/* Hybrid Save Manager */}
            <div className="pt-4">
              <HybridSaveManager
                data={formData}
                onSave={handleAutoSave}
                onSaveAsDefaults={handleSaveAsDefaults}
                entityType="asset"
                autoSaveDelay={3000}
                showDefaultsOption={!asset} // Only show defaults option for new assets
                className="mb-4"
              />
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="text-xs text-gray-500 text-center py-2 border-t border-gray-200">
              💡 <span className="font-medium">Tip:</span> Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+Enter</kbd> to save or <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Esc</kbd> to cancel
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
                title={`${asset ? 'Update' : 'Add'} Asset (Ctrl+Enter)`}
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
