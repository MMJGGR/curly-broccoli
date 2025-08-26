import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Plus, Calendar, Target, AlertCircle, DollarSign } from '../ui/icons';
import { Badge } from '../ui/badge';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpenseAnalysis from './ExpenseAnalysis';
import { formatCurrency } from '../../utils/formatters';

const ExpenseDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    fetchExpensesData();
  }, []);

  const fetchExpensesData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/expenses-v2/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch expenses data');
      }

      const data = await response.json();
      setExpenses(data.expenses || []);
      setSummary(data.summary || {});
      setAnalysis(data.budget_analysis || {});
    } catch (err) {
      console.error('Error fetching expenses:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExpenseCreated = (newExpense) => {
    setShowExpenseForm(false);
    fetchExpensesData(); // Refresh data
  };

  const handleExpenseUpdated = (updatedExpense) => {
    setEditingExpense(null);
    fetchExpensesData(); // Refresh data
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/v1/expenses-v2/${expenseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete expense');
      }

      fetchExpensesData(); // Refresh data
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="text-lg">Loading expenses...</div>
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
              <span>Error loading expenses: {error}</span>
            </div>
            <Button 
              onClick={fetchExpensesData} 
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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'fixed_expenses': return 'bg-red-100 text-red-800 border-red-200';
      case 'variable_expenses': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'discretionary_expenses': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Expense Management</h1>
          <p className="text-gray-600 mt-1">Track and analyze your expenses with CFA-compliant categorization</p>
        </div>
        <Button 
          onClick={() => {
            setEditingExpense(null);
            setShowExpenseForm(true);
          }}
          className="flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.total_amount?.amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary?.total_expenses || 0} expenses tracked
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Recurring</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary?.monthly_recurring_total?.amount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Fixed monthly commitments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Essential vs Discretionary</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Essential:</span>
                <span className="font-semibold">{summary?.essential_expenses || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Discretionary:</span>
                <span className="font-semibold">{summary?.discretionary_expenses || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge 
              className={analysis?.budget_status === 'on_track' ? 
                'bg-green-100 text-green-800 border-green-200' : 
                'bg-yellow-100 text-yellow-800 border-yellow-200'
              }
              variant="outline"
            >
              {analysis?.budget_status === 'on_track' ? 'ON TRACK' : 'REVIEW NEEDED'}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Spending efficiency analysis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Categories</CardTitle>
          <p className="text-sm text-gray-600">
            CFA Institute expense categorization for financial planning
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {summary?.expense_count_by_category && Object.entries(summary.expense_count_by_category).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Badge className={getCategoryColor(category)} variant="outline">
                    {category.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <p className="text-sm text-gray-600 mt-2">
                    {count} expenses
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    {((count / (summary.total_expenses || 1)) * 100).toFixed(0)}%
                  </div>
                  <p className="text-xs text-gray-500">of total</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Analysis */}
      <ExpenseAnalysis 
        analysis={analysis}
        summary={summary}
      />

      {/* Expense Form Modal */}
      {showExpenseForm && (
        <ExpenseForm
          expense={editingExpense}
          onExpenseCreated={handleExpenseCreated}
          onExpenseUpdated={handleExpenseUpdated}
          onCancel={() => {
            setShowExpenseForm(false);
            setEditingExpense(null);
          }}
        />
      )}

      {/* Expense List */}
      <ExpenseList
        expenses={expenses}
        onEditExpense={handleEditExpense}
        onDeleteExpense={handleDeleteExpense}
      />
    </div>
  );
};

export default ExpenseDashboard;