/**
 * Simplified Income Management (CR006 compliant)
 */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const IncomeManagement = () => {
  const { incomeSource, assets, loading, createIncome, updateIncome, deleteIncome, fetchAllFinancialData } = useUnifiedFinancialContext();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    income_type: 'salary',
    frequency: 'monthly',
    linked_asset_id: null,
    asset_relationship_type: ''
  });

  useEffect(() => {
    if (incomeSource.length === 0 || assets.length === 0) {
      fetchAllFinancialData().catch(() => {});
    }
  }, [incomeSource.length, assets.length, fetchAllFinancialData]);

  const resetForm = () => {
    setFormData({ description: '', amount: '', income_type: 'salary', frequency: 'monthly', linked_asset_id: null, asset_relationship_type: '' });
    setEditingIncome(null);
    setShowAddForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      source_name: formData.description,
      monthly_amount: parseFloat(formData.amount),
      frequency: formData.frequency,
      source_type: formData.income_type,
      linked_asset_id: formData.linked_asset_id ? parseInt(formData.linked_asset_id) : null,
      asset_relationship_type: formData.asset_relationship_type || null
    };
    if (editingIncome) await updateIncome(editingIncome.id, payload); else await createIncome(payload);
    resetForm();
  };

  if (loading.income || loading.global) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading income data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Income Sources</CardTitle>
            <p className="text-sm text-gray-600">Manage your income streams with asset linking</p>
          </div>
          <Button onClick={() => setShowAddForm(true)} data-testid="add-income-button">Add Income</Button>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Description *</label>
                  <Input value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="e.g., Software Developer Salary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Amount (KES) *</label>
                  <Input type="number" step="0.01" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="324759" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Income Type *</label>
                  <Select value={formData.income_type} onValueChange={v => setFormData({ ...formData, income_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salary">Salary</SelectItem>
                      <SelectItem value="rental_income">Rental Income</SelectItem>
                      <SelectItem value="dividends">Dividends</SelectItem>
                      <SelectItem value="business_income">Business Income</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link to Asset (optional)</label>
                  <Select value={formData.linked_asset_id ? String(formData.linked_asset_id) : ''} onValueChange={v => setFormData({ ...formData, linked_asset_id: v ? parseInt(v) : null })}>
                    <SelectTrigger data-testid="income-asset-select">
                      <SelectValue placeholder="Select an asset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No asset link</SelectItem>
                      {assets.map(a => (
                        <SelectItem key={a.id} value={String(a.id)}>{a.name} ({a.asset_type})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.linked_asset_id && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Asset Relationship Type</label>
                    <Select value={formData.asset_relationship_type} onValueChange={v => setFormData({ ...formData, asset_relationship_type: v })}>
                      <SelectTrigger data-testid="income-asset-rel-select">
                        <SelectValue placeholder="Choose relationship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rental_income">Rental Income</SelectItem>
                        <SelectItem value="dividends">Dividends</SelectItem>
                        <SelectItem value="business_income">Business Income</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" data-testid="save-income">{editingIncome ? 'Update Income' : 'Add Income'}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IncomeManagement;
