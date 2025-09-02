import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, TrendingDown } from '../ui/icons';
import { formatCurrency } from '../../utils/formatters';

const LiabilityManagement = () => {
  const [liabilities, setLiabilities] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLiability, setEditingLiability] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    liability_type: '',
    current_balance: '',
    original_amount: '',
    interest_rate: '',
    monthly_payment: '',
    due_date: '',
    description: '',
    notes: ''
  });

  const liabilityTypes = [
    { value: 'mortgage', label: 'Mortgage', secured: true },
    { value: 'auto_loan', label: 'Auto Loan', secured: true },
    { value: 'personal_loan', label: 'Personal Loan', secured: false },
    { value: 'credit_card', label: 'Credit Card', secured: false },
    { value: 'student_loan', label: 'Student Loan', secured: false },
    { value: 'business_loan', label: 'Business Loan', secured: true },
    { value: 'line_of_credit', label: 'Line of Credit', secured: false },
    { value: 'other_secured', label: 'Other Secured Debt', secured: true },
    { value: 'other_unsecured', label: 'Other Unsecured Debt', secured: false }
  ];

  useEffect(() => {
    fetchLiabilities();
  }, []);

  const fetchLiabilities = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/v1/liabilities/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLiabilities(data);
      }
    } catch (error) {
      console.error('Failed to fetch liabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('accessToken');
      const url = editingLiability 
        ? `/api/v1/liabilities/${editingLiability.id}` 
        : '/api/v1/liabilities/';
      
      const method = editingLiability ? 'PUT' : 'POST';
      
      const payload = {
        ...formData,
        current_balance: parseFloat(formData.current_balance),
        original_amount: formData.original_amount ? parseFloat(formData.original_amount) : null,
        interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
        monthly_payment: formData.monthly_payment ? parseFloat(formData.monthly_payment) : null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchLiabilities();
        setIsFormOpen(false);
        setEditingLiability(null);
        resetForm();
      }
    } catch (error) {
      console.error('Failed to save liability:', error);
    }
  };

  const handleEdit = (liability) => {
    setEditingLiability(liability);
    setFormData({
      name: liability.name,
      liability_type: liability.liability_type,
      current_balance: liability.current_balance.toString(),
      original_amount: liability.original_amount?.toString() || '',
      interest_rate: liability.interest_rate?.toString() || '',
      monthly_payment: liability.monthly_payment?.toString() || '',
      due_date: liability.due_date || '',
      description: liability.description || '',
      notes: liability.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (liabilityId) => {
    if (!window.confirm('Are you sure you want to delete this liability? This will also remove any linked expense payments.')) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/v1/liabilities/${liabilityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      if (response.ok) {
        await fetchLiabilities();
      }
    } catch (error) {
      console.error('Failed to delete liability:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      liability_type: '',
      current_balance: '',
      original_amount: '',
      interest_rate: '',
      monthly_payment: '',
      due_date: '',
      description: '',
      notes: ''
    });
  };

  const calculatePaidAmount = (liability) => {
    if (!liability.original_amount || liability.original_amount === 0) return null;
    const paidAmount = liability.original_amount - liability.current_balance;
    const percentage = (paidAmount / liability.original_amount) * 100;
    return { paidAmount, percentage };
  };

  const calculatePayoffTime = (liability) => {
    if (!liability.monthly_payment || liability.monthly_payment === 0) return null;
    const months = Math.ceil(liability.current_balance / liability.monthly_payment);
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    return { months, years, remainingMonths };
  };

  const getLiabilityTypeInfo = (liabilityType) => {
    return liabilityTypes.find(t => t.value === liabilityType) || 
           { label: liabilityType, secured: false };
  };

  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.current_balance, 0);
  const securedDebt = liabilities
    .filter(l => getLiabilityTypeInfo(l.liability_type).secured)
    .reduce((sum, liability) => sum + liability.current_balance, 0);
  const unsecuredDebt = totalLiabilities - securedDebt;

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading liabilities...</div>;
  }

  return (
    <div className="space-y-6" data-testid="liability-management-section">
      {/* Liability Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Debt</p>
                <p className="text-2xl font-bold text-red-600" data-testid="total-debt-value">
                  {formatCurrency(totalLiabilities)}
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
                <p className="text-sm font-medium text-gray-600">Secured Debt</p>
                <p className="text-2xl font-bold text-orange-600" data-testid="secured-debt-value">
                  {formatCurrency(securedDebt)}
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
                <p className="text-sm font-medium text-gray-600">Unsecured Debt</p>
                <p className="text-2xl font-bold text-purple-600" data-testid="unsecured-debt-value">
                  {formatCurrency(unsecuredDebt)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liability List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Debt Portfolio</CardTitle>
          <Button onClick={() => setIsFormOpen(true)} data-testid="add-liability-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Liability
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="liability-list">
            {liabilities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <TrendingDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No liabilities yet. Add your first debt to start tracking.</p>
              </div>
            ) : (
              liabilities.map((liability) => {
                const typeInfo = getLiabilityTypeInfo(liability.liability_type);
                const paidInfo = calculatePaidAmount(liability);
                const payoffInfo = calculatePayoffTime(liability);
                
                return (
                  <div key={liability.id} className="border rounded-lg p-4 bg-gray-50" data-testid="liability-item">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <h3 className="font-semibold text-lg" data-testid="liability-name">
                              {liability.name}
                            </h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary" data-testid="liability-type-badge">
                                {typeInfo.label}
                              </Badge>
                              <Badge variant={typeInfo.secured ? "default" : "outline"}>
                                {typeInfo.secured ? "Secured" : "Unsecured"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-600">Current Balance</p>
                            <p className="font-semibold text-red-600" data-testid="current-balance">
                              {formatCurrency(liability.current_balance)}
                            </p>
                          </div>
                          
                          {liability.monthly_payment && (
                            <div>
                              <p className="text-sm text-gray-600">Monthly Payment</p>
                              <p className="font-semibold" data-testid="monthly-payment">
                                {formatCurrency(liability.monthly_payment)}
                              </p>
                            </div>
                          )}
                          
                          {liability.interest_rate && (
                            <div>
                              <p className="text-sm text-gray-600">Interest Rate</p>
                              <p className="font-semibold">
                                {liability.interest_rate.toFixed(2)}%
                              </p>
                            </div>
                          )}
                          
                          {payoffInfo && (
                            <div>
                              <p className="text-sm text-gray-600">Payoff Time</p>
                              <p className="font-semibold">
                                {payoffInfo.years > 0 && `${payoffInfo.years}y `}
                                {payoffInfo.remainingMonths}m
                              </p>
                            </div>
                          )}
                        </div>

                        {paidInfo && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-600">
                                  Paid: {formatCurrency(paidInfo.paidAmount)} ({paidInfo.percentage.toFixed(1)}%)
                                </p>
                                <div className="w-48 bg-gray-200 rounded-full h-2 mt-1">
                                  <div 
                                    className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                                    style={{ width: `${Math.min(paidInfo.percentage, 100)}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {liability.due_date && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Due Date:</span> {new Date(liability.due_date).toLocaleDateString()}
                            </p>
                          </div>
                        )}

                        {liability.description && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Description:</span> {liability.description}
                            </p>
                          </div>
                        )}

                        {liability.notes && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Notes:</span> {liability.notes}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(liability)} data-testid="edit-liability-button">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(liability.id)} className="text-red-600 hover:text-red-800">
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

      {/* Add/Edit Liability Form */}
      {isFormOpen && (
        <Card data-testid="liability-form">
          <CardHeader>
            <CardTitle>{editingLiability ? 'Edit Liability' : 'Add New Liability'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Liability Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Car Loan - Toyota Prado"
                    required
                    data-testid="liability-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="liability_type">Liability Type *</Label>
                  <Select value={formData.liability_type} onValueChange={(value) => setFormData({...formData, liability_type: value})} data-testid="liability-type-select">
                    <SelectTrigger>
                      <SelectValue placeholder="Select liability type" />
                    </SelectTrigger>
                    <SelectContent>
                      {liabilityTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <span>{type.label}</span>
                            <Badge variant={type.secured ? "default" : "outline"} className="text-xs">
                              {type.secured ? "Secured" : "Unsecured"}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="current_balance">Current Balance (KES) *</Label>
                  <Input
                    id="current_balance"
                    type="number"
                    step="0.01"
                    value={formData.current_balance}
                    onChange={(e) => setFormData({...formData, current_balance: e.target.value})}
                    placeholder="0.00"
                    required
                    data-testid="current-balance-input"
                  />
                </div>

                <div>
                  <Label htmlFor="original_amount">Original Amount (KES)</Label>
                  <Input
                    id="original_amount"
                    type="number"
                    step="0.01"
                    value={formData.original_amount}
                    onChange={(e) => setFormData({...formData, original_amount: e.target.value})}
                    placeholder="0.00"
                    data-testid="original-amount-input"
                  />
                </div>

                <div>
                  <Label htmlFor="interest_rate">Interest Rate (%)</Label>
                  <Input
                    id="interest_rate"
                    type="number"
                    step="0.01"
                    value={formData.interest_rate}
                    onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                    placeholder="5.25"
                    data-testid="interest-rate-input"
                  />
                </div>

                <div>
                  <Label htmlFor="monthly_payment">Monthly Payment (KES)</Label>
                  <Input
                    id="monthly_payment"
                    type="number"
                    step="0.01"
                    value={formData.monthly_payment}
                    onChange={(e) => setFormData({...formData, monthly_payment: e.target.value})}
                    placeholder="0.00"
                    data-testid="monthly-payment-input"
                  />
                </div>

                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    data-testid="due-date-input"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the liability"
                    data-testid="liability-description-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Additional notes about this liability..."
                  rows={3}
                  data-testid="liability-notes"
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" data-testid="submit-liability">
                  {editingLiability ? 'Update Liability' : 'Add Liability'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingLiability(null);
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

export default LiabilityManagement;