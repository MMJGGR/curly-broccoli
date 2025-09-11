import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { X, Save, AlertCircle, Repeat, Building2 } from '../ui/icons';
import { Badge } from '../ui/badge';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ExpenseForm = ({ expense, onExpenseCreated, onExpenseUpdated, onCancel }) => {
  // Use UnifiedFinancialContext for expense and asset operations
  const { createExpense, updateExpense, assets, fetchExpenseTypes, expenseTypes } = useUnifiedFinancialContext();
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expense_type: '',
    expense_date: '',
    is_recurring: false,
    frequency_months: '',
    vendor: '',
    notes: '',
    related_asset_id: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    // Fetch expense types from UnifiedFinancialContext
    if (expenseTypes.length === 0) {
      fetchExpenseTypes().catch(err => {
        console.error('Error fetching expense types:', err);
        setError('Failed to load expense types');
      });
    }
    
    // If editing, populate form with expense data
    if (expense) {
      setFormData({
        description: expense.description || '',
        amount: expense.amount?.toString() || '',
        expense_type: expense.expense_type || '',
        expense_date: expense.expense_date ? expense.expense_date.split('T')[0] : '',
        is_recurring: expense.is_recurring || false,
        frequency_months: expense.frequency_months?.toString() || '',
        vendor: expense.vendor || '',
        notes: expense.notes || '',
        related_asset_id: expense.related_asset_id?.toString() || ''
      });
    }
  }, [expense, expenseTypes.length, fetchExpenseTypes]);

  // Removed - now using assets from UnifiedFinancialContext
  // const fetchAvailableAssets = async () => {
  //   try {
  //     const token = localStorage.getItem('jwt');
  //     const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/assets-v2/`, {
  //       headers: {
  //         'Authorization': `Bearer ${token}`,
  //         'Content-Type': 'application/json',
  //       },
  //     });

  //     if (response.ok) {
  //       const data = await response.json();
  //       setAvailableAssets(data.assets || []);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching assets:', err);
  //     // Non-critical error, continue without assets
  //   }
  // };

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

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 3) {
      errors.description = 'Description must be at least 3 characters';
    }

    if (!formData.amount) {
      errors.amount = 'Amount is required';
    } else if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    }

    if (!formData.expense_type) {
      errors.expense_type = 'Expense type is required';
    }

    if (!formData.expense_date) {
      errors.expense_date = 'Expense date is required';
    }

    if (formData.is_recurring && !formData.frequency_months) {
      errors.frequency_months = 'Frequency is required for recurring expenses';
    } else if (formData.frequency_months && 
               (isNaN(parseInt(formData.frequency_months)) || parseInt(formData.frequency_months) <= 0)) {
      errors.frequency_months = 'Frequency must be a positive number';
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

      const payload = {
        description: formData.description.trim(),
        amount: parseFloat(formData.amount),
        expense_type: formData.expense_type,
        expense_date: formData.expense_date + 'T00:00:00Z',
        is_recurring: formData.is_recurring,
        frequency_months: formData.frequency_months ? parseInt(formData.frequency_months) : null,
        vendor: formData.vendor.trim() || null,
        notes: formData.notes.trim() || null,
        related_asset_id: formData.related_asset_id ? parseInt(formData.related_asset_id) : null
      };

      let result;
      if (expense) {
        result = await updateExpense(expense.id, payload);
      } else {
        result = await createExpense(payload);
      }
      
      if (expense) {
        onExpenseUpdated(result.expense);
      } else {
        onExpenseCreated(result.expense);
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getExpenseTypeInfo = (expenseType) => {
    return expenseTypes.find(t => t.value === expenseType) || null;
  };

  const selectedTypeInfo = formData.expense_type ? getExpenseTypeInfo(formData.expense_type) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{expense ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
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
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="e.g., Grocery shopping, Utility bill"
                className={validationErrors.description ? 'border-red-500' : ''}
              />
              {validationErrors.description && (
                <p className="text-sm text-red-600">{validationErrors.description}</p>
              )}
            </div>

            {/* Amount and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (KES) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  placeholder="0.00"
                  className={validationErrors.amount ? 'border-red-500' : ''}
                />
                {validationErrors.amount && (
                  <p className="text-sm text-red-600">{validationErrors.amount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expense_date">Date *</Label>
                <Input
                  id="expense_date"
                  type="date"
                  value={formData.expense_date}
                  onChange={(e) => handleInputChange('expense_date', e.target.value)}
                  className={validationErrors.expense_date ? 'border-red-500' : ''}
                />
                {validationErrors.expense_date && (
                  <p className="text-sm text-red-600">{validationErrors.expense_date}</p>
                )}
              </div>
            </div>

            {/* Expense Type */}
            <div className="space-y-2">
              <Label>Expense Type *</Label>
              <Select 
                value={formData.expense_type} 
                onValueChange={(value) => handleInputChange('expense_type', value)}
              >
                <SelectTrigger className={validationErrors.expense_type ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select expense type" />
                </SelectTrigger>
                <SelectContent>
                  {expenseTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{type.label}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ml-2 ${
                            type.category === 'fixed_expenses' ? 'bg-red-50 text-red-700' :
                            type.category === 'variable_expenses' ? 'bg-orange-50 text-orange-700' :
                            'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {type.category.replace('_', ' ')}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.expense_type && (
                <p className="text-sm text-red-600">{validationErrors.expense_type}</p>
              )}
              
              {/* Expense Type Info */}
              {selectedTypeInfo && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-center space-x-2 text-sm text-blue-700">
                    <span>Category: {selectedTypeInfo.category.replace('_', ' ')}</span>
                    {selectedTypeInfo.is_tax_deductible && <span>• Tax Deductible</span>}
                  </div>
                  {selectedTypeInfo.description && (
                    <p className="text-xs text-blue-600 mt-1">{selectedTypeInfo.description}</p>
                  )}
                </div>
              )}
            </div>

            {/* Recurring Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_recurring"
                  checked={formData.is_recurring}
                  onChange={(e) => handleInputChange('is_recurring', e.target.checked)}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_recurring" className="flex items-center space-x-2">
                  <Repeat className="h-4 w-4" />
                  <span>This is a recurring expense</span>
                </Label>
              </div>

              {formData.is_recurring && (
                <div className="space-y-2">
                  <Label htmlFor="frequency_months">Frequency (months) *</Label>
                  <Input
                    id="frequency_months"
                    type="number"
                    min="1"
                    value={formData.frequency_months}
                    onChange={(e) => handleInputChange('frequency_months', e.target.value)}
                    placeholder="e.g., 1 for monthly, 3 for quarterly"
                    className={validationErrors.frequency_months ? 'border-red-500' : ''}
                  />
                  {validationErrors.frequency_months && (
                    <p className="text-sm text-red-600">{validationErrors.frequency_months}</p>
                  )}
                </div>
              )}
            </div>

            {/* Optional Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor/Payee</Label>
                <Input
                  id="vendor"
                  value={formData.vendor}
                  onChange={(e) => handleInputChange('vendor', e.target.value)}
                  placeholder="e.g., Safaricom, KPLC"
                />
              </div>

              {assets.length > 0 && (
                <div className="space-y-2">
                  <Label>Related Asset (Optional)</Label>
                  <Select 
                    value={formData.related_asset_id} 
                    onValueChange={(value) => handleInputChange('related_asset_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Link to an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No asset selected</SelectItem>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id.toString()}>
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4" />
                            <span>{asset.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional details about this expense..."
                  rows={3}
                />
              </div>
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
                <span>{loading ? 'Saving...' : (expense ? 'Update Expense' : 'Add Expense')}</span>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseForm;