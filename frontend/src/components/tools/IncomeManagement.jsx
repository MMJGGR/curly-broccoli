/**
 * Income Management Component - KISS Asset Linking
 * Tools Dashboard primary interface for income CRUD with direct user selection
 */
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import { Plus, TrendingUp } from '../ui/icons';
import { formatCurrency } from '../../utils/formatters';

const IncomeManagement = () => {
  const [incomes, setIncomes] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIncome, setEditingIncome] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    currency: 'KES',
    income_type: 'salary',
    frequency: 'monthly',
    is_recurring: true,
    linked_asset_id: null,
    asset_relationship_type: '',
    growth_rate: '',
    notes: ''
  });

  useEffect(() => {
    fetchIncomes();
    fetchAssetOptions();
    fetchIncomeAnalysis();
  }, []);

  const fetchIncomes = async () => {
    try {
      const response = await fetch('/api/v1/income-v2/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setIncomes(data);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    }
  };

  const fetchAssetOptions = async () => {
    try {
      const response = await fetch('/api/v1/income-v2/asset-options/dropdown', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.assets || []);
      }
    } catch (error) {
      console.error('Error fetching asset options:', error);
    }
  };

  const fetchIncomeAnalysis = async () => {
    try {
      const response = await fetch('/api/v1/income-v2/analysis', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('Error fetching income analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingIncome 
        ? `/api/v1/income-v2/${editingIncome.id}` 
        : '/api/v1/income-v2/';
      
      const method = editingIncome ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          linked_asset_id: formData.linked_asset_id || null,
          growth_rate: formData.growth_rate ? parseFloat(formData.growth_rate) : null
        })
      });

      if (response.ok) {
        await fetchIncomes();
        await fetchIncomeAnalysis();
        resetForm();
      } else {
        console.error('Error saving income:', response.statusText);
      }
    } catch (error) {
      console.error('Error saving income:', error);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setFormData({
      description: income.description,
      amount: income.amount.amount.toString(),
      currency: income.amount.currency,
      income_type: income.income_type,
      frequency: income.frequency,
      is_recurring: income.is_recurring,
      linked_asset_id: income.linked_asset_id,
      asset_relationship_type: income.asset_relationship_type || '',
      growth_rate: income.growth_rate?.toString() || '',
      notes: income.notes || ''
    });
    setShowAddForm(true);
  };

  const handleDelete = async (incomeId) => {
    if (!confirm('Are you sure you want to delete this income?')) return;
    
    try {
      const response = await fetch(`/api/v1/income-v2/${incomeId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        }
      });
      
      if (response.ok) {
        await fetchIncomes();
        await fetchIncomeAnalysis();
      }
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: '',
      currency: 'KES',
      income_type: 'salary',
      frequency: 'monthly',
      is_recurring: true,
      linked_asset_id: null,
      asset_relationship_type: '',
      growth_rate: '',
      notes: ''
    });
    setEditingIncome(null);
    setShowAddForm(false);
  };

  const getIncomeTypeDisplay = (type) => {
    const types = {
      salary: '💼 Salary',
      business_income: '🏢 Business',
      rental_income: '🏠 Rental',
      dividends: '📈 Dividends',
      interest: '🏦 Interest',
      consulting: '💻 Consulting',
      freelance: '🎨 Freelance'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className=\"flex justify-center items-center p-8\">
        <div className=\"text-lg\">Loading income data...</div>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      {/* Income Analysis Summary */}
      {analysis && (
        <div className=\"grid grid-cols-1 md:grid-cols-4 gap-4 mb-6\">
          <Card>
            <CardContent className=\"pt-6\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm font-medium text-gray-600\">Monthly Income</p>
                  <p className=\"text-2xl font-bold text-green-600\">
                    {formatCurrency(analysis.total_monthly_income.amount)}
                  </p>
                </div>
                <TrendingUp className=\"h-8 w-8 text-green-600\" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className=\"pt-6\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm font-medium text-gray-600\">Stability Score</p>
                  <p className=\"text-2xl font-bold text-blue-600\">
                    {analysis.stability_score.toFixed(1)}/10
                  </p>
                </div>
                <TrendingUp className=\"h-8 w-8 text-blue-600\" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className=\"pt-6\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm font-medium text-gray-600\">Asset-Linked</p>
                  <p className=\"text-2xl font-bold text-purple-600\">
                    {formatCurrency(analysis.asset_linked_income.amount)}
                  </p>
                </div>
                <TrendingUp className=\"h-8 w-8 text-purple-600\" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className=\"pt-6\">
              <div className=\"flex items-center justify-between\">
                <div>
                  <p className=\"text-sm font-medium text-gray-600\">Diversification</p>
                  <p className=\"text-2xl font-bold text-orange-600\">
                    {analysis.income_diversification_score.toFixed(1)}/10
                  </p>
                </div>
                <TrendingUp className=\"h-8 w-8 text-orange-600\" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Income List */}
      <Card>
        <CardHeader className=\"flex flex-row items-center justify-between\">
          <div>
            <CardTitle>Income Sources</CardTitle>
            <p className=\"text-sm text-gray-600\">Manage your income streams with asset linking</p>
          </div>
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className=\"h-4 w-4 mr-2\" />
            Add Income
          </Button>
        </CardHeader>
        <CardContent>
          {incomes.length === 0 ? (
            <div className=\"text-center py-8 text-gray-500\">
              <TrendingUp className=\"h-12 w-12 mx-auto mb-4 text-gray-300\" />
              <p>No income sources yet. Add your first income stream!</p>
            </div>
          ) : (
            <div className=\"space-y-4\">
              {incomes.map((income) => (
                <div
                  key={income.id}
                  className=\"flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50\"
                >
                  <div className=\"flex-1\">
                    <div className=\"flex items-center space-x-3 mb-2\">
                      <h3 className=\"font-semibold\">{income.description}</h3>
                      <Badge variant=\"outline\">{getIncomeTypeDisplay(income.income_type)}</Badge>
                      {income.is_asset_linked && (
                        <Badge variant=\"secondary\">🔗 Asset Linked</Badge>
                      )}
                      {income.frequency !== 'monthly' && (
                        <Badge variant=\"outline\">{income.frequency}</Badge>
                      )}
                    </div>
                    <div className=\"flex items-center space-x-4 text-sm text-gray-600\">
                      <span className=\"font-medium text-green-600\">
                        {formatCurrency(income.monthly_equivalent.amount)}/month
                      </span>
                      <span>
                        {formatCurrency(income.annual_equivalent.amount)}/year
                      </span>
                      <span>Stability: {income.stability_score}/10</span>
                      {income.linked_asset_id && (
                        <span className=\"text-purple-600\">
                          Asset #{income.linked_asset_id}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className=\"flex space-x-2\">
                    <Button
                      variant=\"outline\"
                      size=\"sm\"
                      onClick={() => handleEdit(income)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant=\"destructive\"
                      size=\"sm\"
                      onClick={() => handleDelete(income.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Income Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingIncome ? 'Edit Income' : 'Add New Income'}
            </CardTitle>
            <p className=\"text-sm text-gray-600\">
              KISS Approach: Simple fields with optional asset linking
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className=\"space-y-4\">
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                {/* Basic Income Info */}
                <div>
                  <label className=\"block text-sm font-medium mb-2\">
                    Description *
                  </label>
                  <Input
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder=\"e.g., Software Developer Salary\"
                    required
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium mb-2\">
                    Amount ({formData.currency}) *
                  </label>
                  <Input
                    type=\"number\"
                    step=\"0.01\"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    placeholder=\"324759\"
                    required
                  />
                </div>

                <div>
                  <label className=\"block text-sm font-medium mb-2\">
                    Income Type *
                  </label>
                  <Select
                    value={formData.income_type}
                    onValueChange={(value) => setFormData({...formData, income_type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=\"salary\">💼 Salary</SelectItem>
                      <SelectItem value=\"business_income\">🏢 Business Income</SelectItem>
                      <SelectItem value=\"rental_income\">🏠 Rental Income</SelectItem>
                      <SelectItem value=\"dividends\">📈 Dividends</SelectItem>
                      <SelectItem value=\"interest\">🏦 Interest</SelectItem>
                      <SelectItem value=\"consulting\">💻 Consulting</SelectItem>
                      <SelectItem value=\"freelance\">🎨 Freelance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className=\"block text-sm font-medium mb-2\">
                    Frequency *
                  </label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(value) => setFormData({...formData, frequency: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=\"monthly\">Monthly</SelectItem>
                      <SelectItem value=\"quarterly\">Quarterly</SelectItem>
                      <SelectItem value=\"annually\">Annually</SelectItem>
                      <SelectItem value=\"weekly\">Weekly</SelectItem>
                      <SelectItem value=\"biweekly\">Bi-weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* KISS Asset Linking Section */}
              <div className=\"border-t pt-4 mt-6\">
                <h3 className=\"text-lg font-semibold mb-4\">Asset Linking (Optional)</h3>
                <div className=\"bg-blue-50 p-4 rounded-lg mb-4\">
                  <p className=\"text-sm text-blue-700\">
                    <strong>Does this income come from an asset you own?</strong>
                    <br />
                    For example: rental income from a property, dividends from investments, 
                    business income from a business you own.
                  </p>
                </div>

                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div>
                    <label className=\"block text-sm font-medium mb-2\">
                      Link to Asset
                    </label>
                    <Select
                      value={formData.linked_asset_id?.toString() || ''}
                      onValueChange={(value) => setFormData({
                        ...formData, 
                        linked_asset_id: value ? parseInt(value) : null
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder=\"Select asset or leave blank\" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value=\"\">No asset link</SelectItem>
                        {assets.map((asset) => (
                          <SelectItem key={asset.id} value={asset.id.toString()}>
                            {asset.name} ({asset.asset_type})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.linked_asset_id && (
                    <div>
                      <label className=\"block text-sm font-medium mb-2\">
                        Relationship Type
                      </label>
                      <Select
                        value={formData.asset_relationship_type}
                        onValueChange={(value) => setFormData({...formData, asset_relationship_type: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder=\"How does this asset generate income?\" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value=\"rental\">Rental Income</SelectItem>
                          <SelectItem value=\"business_operations\">Business Operations</SelectItem>
                          <SelectItem value=\"investment_return\">Investment Returns</SelectItem>
                          <SelectItem value=\"asset_appreciation\">Asset Appreciation</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {assets.length === 0 && (
                  <div className=\"mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg\">
                    <p className=\"text-sm text-yellow-700\">
                      No assets available for linking. 
                      <Button variant=\"link\" className=\"p-0 h-auto ml-1\" asChild>
                        <a href=\"/app/balance-sheet\">Create an asset first</a>
                      </Button>
                    </p>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              <div className=\"border-t pt-4 mt-6\">
                <h3 className=\"text-lg font-semibold mb-4\">Additional Details (Optional)</h3>
                <div className=\"grid grid-cols-1 md:grid-cols-2 gap-4\">
                  <div>
                    <label className=\"block text-sm font-medium mb-2\">
                      Annual Growth Rate (%)
                    </label>
                    <Input
                      type=\"number\"
                      step=\"0.1\"
                      value={formData.growth_rate}
                      onChange={(e) => setFormData({...formData, growth_rate: e.target.value})}
                      placeholder=\"e.g., 3.0\"
                    />
                  </div>

                  <div>
                    <label className=\"block text-sm font-medium mb-2\">
                      Notes
                    </label>
                    <Input
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      placeholder=\"Additional notes...\"
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className=\"flex space-x-4 pt-6\">
                <Button type=\"submit\">
                  {editingIncome ? 'Update Income' : 'Add Income'}
                </Button>
                <Button type=\"button\" variant=\"outline\" onClick={resetForm}>
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

export default IncomeManagement;