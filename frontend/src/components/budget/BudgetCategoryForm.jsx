import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const BudgetCategoryForm = () => {
  const {
    budgetCategories = [],
    createBudgetCategory,
    updateBudgetCategory,
    deleteBudgetCategory,
    fetchBudgetCategories
  } = useUnifiedFinancialContext();

  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [editingId, setEditingId] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = { name: name.trim(), budgeted_amount: parseFloat(amount) || 0 };
    if (editingId) {
      await updateBudgetCategory(editingId, payload);
    } else {
      await createBudgetCategory(payload);
    }
    setName('');
    setAmount('');
    setEditingId(null);
  };

  const onEdit = (cat) => {
    setEditingId(cat.id);
    setName(cat.name);
    setAmount((cat.budgeted_amount || 0).toString());
  };

  const onDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await deleteBudgetCategory(id);
    if (editingId === id) {
      setEditingId(null);
      setName('');
      setAmount('');
    }
  };

  const totalBudgeted = budgetCategories.reduce((s, c) => s + (Number(c.budgeted_amount) || 0), 0);

  React.useEffect(() => {
    if (!budgetCategories || budgetCategories.length === 0) {
      fetchBudgetCategories().catch(() => {});
    }
  }, [budgetCategories?.length, fetchBudgetCategories]);

  return (
    <div className="space-y-4" data-testid="budget-category-form">
      <Card>
        <CardContent className="p-4">
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
            <div>
              <Label htmlFor="cat-name">Category</Label>
              <Input
                id="cat-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Groceries"
                data-testid="category-name-input"
              />
            </div>
            <div>
              <Label htmlFor="cat-amount">Budgeted Amount (KES)</Label>
              <Input
                id="cat-amount"
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                data-testid="category-amount-input"
              />
            </div>
            <div>
              <Button type="submit" data-testid="save-category-button">
                {editingId ? 'Update' : 'Add'} Category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold">Budget Categories</h3>
            <div className="text-sm text-gray-600" data-testid="total-budgeted">
              Total Budgeted: KES {Math.round(totalBudgeted).toLocaleString()}
            </div>
          </div>
          {budgetCategories.length === 0 ? (
            <div className="text-gray-500">No categories yet.</div>
          ) : (
            <div className="space-y-2" data-testid="category-list">
              {budgetCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between border rounded-md p-3 bg-gray-50" data-testid="category-item">
                  <div>
                    <div className="font-medium" data-testid="category-name">{cat.name}</div>
                    <div className="text-sm text-gray-600" data-testid="category-amount">KES {Math.round(cat.budgeted_amount || 0).toLocaleString()}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => onEdit(cat)} data-testid="edit-category">
                      Edit
                    </Button>
                    <Button variant="destructive" onClick={() => onDelete(cat.id)} data-testid="delete-category">
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetCategoryForm;
