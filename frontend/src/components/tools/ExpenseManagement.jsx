import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, TrendingDown } from '../ui/icons';
import { EXPENSE_TYPE_DEFS } from '../expenses/expenseTypeDefs';
import { formatCurrency } from '../../utils/formatters';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ExpenseManagement = () => {
  // Use UnifiedFinancialContext instead of local state
  const {
    expenses,
    assets,
    liabilities,
    loading,
    createExpense,
    updateExpense,
    deleteExpense,
    fetchAllFinancialData,
    profile
  } = useUnifiedFinancialContext();

  // Local UI state only
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    expense_type: '',
    frequency: 'monthly',
    is_recurring: true,
    related_asset_id: null,
    related_liability_id: null,
    relationship_type: '',
    is_finite_payment: false,
    total_payments_remaining: null,
    payment_end_date: null,
    notes: ''
  });

  const expenseTypes = EXPENSE_TYPE_DEFS;

  const frequencies = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'annually', label: 'Annually' }
  ];

  const relationshipTypes = [
    { value: 'asset_maintenance', label: 'Asset Maintenance' },
    { value: 'loan_payment', label: 'Loan Payment' },
    { value: 'business_operating', label: 'Business Operating' },
    { value: 'investment_fee', label: 'Investment Fee' },
    { value: 'property_tax', label: 'Property Tax' },
    { value: 'insurance_premium', label: 'Insurance Premium' },
    { value: 'other', label: 'Other' }
  ];

  // Load all financial data on component mount
  useEffect(() => {
    if (expenses.length === 0 || assets.length === 0 || liabilities.length === 0) {
      fetchAllFinancialData().catch(error => {
        console.error('Error loading financial data:', error);
      });
    }
  }, [expenses.length, assets.length, liabilities.length, fetchAllFinancialData]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        related_asset_id: formData.related_asset_id || null,
        related_liability_id: formData.related_liability_id || null,
        total_payments_remaining: formData.total_payments_remaining ? parseInt(formData.total_payments_remaining) : null
      };

      if (editingExpense) {
        await updateExpense(editingExpense.id, payload);
      } else {
        await createExpense(payload);
      }

      setIsFormOpen(false);
      setEditingExpense(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save expense:', error);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount.toString(),
      expense_type: expense.expense_type,
      frequency: expense.frequency,
      is_recurring: expense.is_recurring,
      related_asset_id: expense.related_asset_id,
      related_liability_id: expense.related_liability_id,
      relationship_type: expense.relationship_type || '',
      is_finite_payment: expense.is_finite_payment || false,
      total_payments_remaining: expense.total_payments_remaining?.toString() || '',
      payment_end_date: expense.payment_end_date || '',
      notes: expense.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    
    try {
      await deleteExpense(expenseId);
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      expense_type: '',
      frequency: 'monthly',
      is_recurring: true,
      related_asset_id: null,
      related_liability_id: null,
      relationship_type: '',
      is_finite_payment: false,
      total_payments_remaining: null,
      payment_end_date: null,
      notes: ''
    });
  };

  const calculateMonthlyAmount = (expense) => {
    const amount = expense.amount;
    switch (expense.frequency) {
      case 'daily': return amount * 30;
      case 'weekly': return amount * 4.33;
      case 'monthly': return amount;
      case 'quarterly': return amount / 3;
      case 'annually': return amount / 12;
      default: return amount;
    }
  };

  const calculateAnnualAmount = (expense) => {
    return calculateMonthlyAmount(expense) * 12;
  };

  // Calculate expense analysis
  const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + calculateMonthlyAmount(expense), 0);
  const assetRelatedExpenses = expenses.filter(expense => expense.related_asset_id).reduce((sum, expense) => sum + calculateMonthlyAmount(expense), 0);
  const liabilityRelatedExpenses = expenses.filter(expense => expense.related_liability_id).reduce((sum, expense) => sum + calculateMonthlyAmount(expense), 0);
  const finiteExpenses = expenses.filter(expense => expense.is_finite_payment).reduce((sum, expense) => sum + calculateMonthlyAmount(expense), 0);

  const getRelatedAsset = (assetId) => assets.find(asset => asset.id === assetId);
  const getRelatedLiability = (liabilityId) => liabilities.find(liability => liability.id === liabilityId);

  if (loading.expenses || loading.global) {
    return <div className="flex justify-center items-center h-64">Loading expenses...</div>;
  }

  return (
    <div className="space-y-6" data-testid="expense-management-section">
      {/* Expense Analysis Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Expenses</p>
                <p className="text-2xl font-bold text-red-600" data-testid="monthly-expenses-card">
                  {formatCurrency(totalMonthlyExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Asset-Related</p>
                <p className="text-2xl font-bold text-orange-600" data-testid="asset-related-card">
                  {formatCurrency(assetRelatedExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Debt Payments</p>
                <p className="text-2xl font-bold text-purple-600" data-testid="liability-related-card">
                  {formatCurrency(liabilityRelatedExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Finite Payments</p>
                <p className="text-2xl font-bold text-green-600" data-testid="finite-expenses-card">
                  {formatCurrency(finiteExpenses)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expense List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Expense Management</CardTitle>
          <Button onClick={() => setIsFormOpen(true)} data-testid="add-expense-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="expense-list">
            {expenses.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No expenses yet. Add your first expense to start tracking.</p>
              </div>
            ) : (
              expenses.map((expense) => (
                <div key={expense.id} className="border rounded-lg p-4 bg-gray-50" data-testid="expense-item">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg" data-testid="expense-description">
                          {expense.description}
                        </h3>
                        <Badge variant="secondary" data-testid="expense-type-badge">
                          {expenseTypes.find(t => t.value === expense.expense_type)?.label || expense.expense_type}
                        </Badge>
                        {expense.is_finite_payment && (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            Finite
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Monthly</p>
                          <p className="font-semibold text-red-600" data-testid="monthly-amount">
                            {formatCurrency(calculateMonthlyAmount(expense))}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Annual</p>
                          <p className="font-semibold text-red-800" data-testid="annual-amount">
                            {formatCurrency(calculateAnnualAmount(expense))}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Frequency</p>
                          <p className="font-semibold">{expense.frequency}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Recurring</p>
                          <p className="font-semibold">{expense.is_recurring ? 'Yes' : 'No'}</p>
                        </div>
                      </div>

                      {/* Asset/Liability Links */}
                      {(expense.related_asset_id || expense.related_liability_id) && (
                        <div className="mt-3 pt-3 border-t">
                          {expense.related_asset_id && (
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700" data-testid="asset-linked-badge">
                                Asset: {getRelatedAsset(expense.related_asset_id)?.name}
                              </Badge>
                              {expense.relationship_type && (
                                <Badge variant="outline" className="bg-gray-50">
                                  {expense.relationship_type.replace('_', ' ')}
                                </Badge>
                              )}
                            </div>
                          )}
                          {expense.related_liability_id && (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-purple-50 text-purple-700" data-testid="liability-linked-badge">
                                Debt: {getRelatedLiability(expense.related_liability_id)?.name}
                              </Badge>
                              {expense.total_payments_remaining && (
                                <Badge variant="outline" className="bg-green-50 text-green-700">
                                  {expense.total_payments_remaining} payments left
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {expense.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p><span className="font-medium">Notes:</span> {expense.notes}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(expense)} data-testid="edit-expense-button">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(expense.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Expense Form */}
      {isFormOpen && (
        <Card data-testid="expense-form">
          <CardHeader>
            <CardTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="e.g., Monthly car payment"
                    required
                    data-testid="expense-description"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount (KES) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder="0.00"
                    required
                    data-testid="expense-amount"
                  />
                </div>

                <div>
                  <Label htmlFor="expense_type">Expense Type *</Label>
                  <Select value={formData.expense_type} onValueChange={(value) => setFormData({...formData, expense_type: value})} data-testid="expense-type-select">
                    <SelectTrigger>
                      <SelectValue placeholder="Select expense type" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})} data-testid="frequency-select">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* KISS Asset/Liability Linking Section */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Asset/Liability Relationship (Optional)</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div data-testid="asset-link-section">
                    <Label htmlFor="related_asset">Related to Asset?</Label>
                    <Select 
                      value={formData.related_asset_id?.toString() || ''} 
                      onValueChange={(value) => setFormData({
                        ...formData, 
                        related_asset_id: value ? parseInt(value) : null,
                        related_liability_id: value ? null : formData.related_liability_id // Clear liability if asset selected
                      })}
                      data-testid="asset-link-select"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset or leave blank" />
                      </SelectTrigger>
                      <SelectContent data-testid="asset-options">
                        <SelectItem value="">No asset link</SelectItem>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            {asset.name} ({asset.asset_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {assets.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1" data-testid="no-assets-warning">
                        No assets available. <a href="/app/balance-sheet" className="text-blue-600 underline" data-testid="create-asset-link">Create assets first</a>.
                      </p>
                    )}
                  </div>

                  <div data-testid="liability-link-section">
                    <Label htmlFor="related_liability">Related to Debt/Loan?</Label>
                    <Select 
                      value={formData.related_liability_id?.toString() || ''} 
                      onValueChange={(value) => setFormData({
                        ...formData, 
                        related_liability_id: value ? parseInt(value) : null,
                        related_asset_id: value ? null : formData.related_asset_id // Clear asset if liability selected
                      })}
                      data-testid="liability-link-select"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select debt or leave blank" />
                      </SelectTrigger>
                      <SelectContent data-testid="liability-options">
                        <SelectItem value="">No debt link</SelectItem>
                        {liabilities.map((liability) => (
                          <SelectItem key={liability.id} value={liability.id.toString()}>
                            {liability.name} ({liability.liability_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {liabilities.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1" data-testid="no-liabilities-warning">
                        No debts available. <a href="/app/balance-sheet" className="text-blue-600 underline" data-testid="create-liability-link">Create liabilities first</a>.
                      </p>
                    )}
                  </div>
                </div>

                {(formData.related_asset_id || formData.related_liability_id) && (
                  <div className="mt-4">
                    <Label htmlFor="relationship_type">Relationship Type</Label>
                    <Select value={formData.relationship_type} onValueChange={(value) => setFormData({...formData, relationship_type: value})} data-testid="relationship-type-select">
                      <SelectTrigger>
                        <SelectValue placeholder="How is this expense related?" />
                      </SelectTrigger>
                      <SelectContent data-testid="relationship-options">
                        {relationshipTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Finite Payment Classification */}
              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Payment Duration (KISS Classification)</h4>
                
                <div className="space-y-3">
                  <div>
                    <Label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.is_finite_payment}
                        onChange={(e) => setFormData({...formData, is_finite_payment: e.target.checked})}
                        data-testid="finite-payment-checkbox"
                      />
                      <span>This expense will end (finite payments)</span>
                    </Label>
                    <p className="text-sm text-gray-500 ml-6">
                      Check if this expense has a fixed number of payments (e.g., loan, subscription with end date)
                    </p>
                  </div>

                  {formData.is_finite_payment && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                      <div>
                        <Label htmlFor="total_payments_remaining">Payments Remaining</Label>
                        <Input
                          id="total_payments_remaining"
                          type="number"
                          value={formData.total_payments_remaining}
                          onChange={(e) => setFormData({...formData, total_payments_remaining: e.target.value})}
                          placeholder="e.g., 36"
                          data-testid="payments-remaining"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment_end_date">Expected End Date</Label>
                        <Input
                          id="payment_end_date"
                          type="date"
                          value={formData.payment_end_date}
                          onChange={(e) => setFormData({...formData, payment_end_date: e.target.value})}
                          data-testid="payment-end-date"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional context about this expense..."
                  rows={3}
                  data-testid="expense-notes"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" data-testid="submit-expense">
                  {editingExpense ? 'Update Expense' : 'Add Expense'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingExpense(null);
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

      {/* Lifetime Expense Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Lifetime Expense Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const currentAge = profile?.age || 30;
            const retirementAge = profile?.retirement_age || profile?.target_retirement_age || 65;
            const yearsToRetirement = Math.max(1, retirementAge - currentAge);
            const monthsUntil = (dateStr) => {
              try {
                const now = new Date();
                const tgt = new Date(dateStr);
                const diff = (tgt - now) / (1000 * 60 * 60 * 24 * 30);
                return Math.max(0, Math.round(diff));
              } catch { return 0; }
            };
            if ((expenses || []).length === 0) {
              return <div className="text-gray-500">Add expenses to visualize timing.</div>;
            }
            return (
              <div className="space-y-3">
                {expenses.map((exp) => {
                  let months = 0;
                  if (exp.payment_end_date) {
                    months = monthsUntil(exp.payment_end_date);
                  } else if (exp.is_finite_payment && exp.total_payments_remaining && exp.frequency === 'monthly') {
                    months = parseInt(exp.total_payments_remaining, 10) || 0;
                  } else {
                    months = yearsToRetirement * 12; // ongoing
                  }
                  const widthPct = Math.max(5, Math.min(100, (months / (yearsToRetirement * 12)) * 100));
                  return (
                    <div key={`exp-tl-${exp.id}`}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{exp.description}</span>
                        <span>{exp.payment_end_date || (exp.is_finite_payment ? `${months} months left` : 'ongoing')}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: `${widthPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default ExpenseManagement;
