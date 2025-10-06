import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import Layout from '../layout/Layout';
import { Stat } from '../ui/stat';
import { Button } from '../ui/button';
import { Alert } from '../ui/alert';
import { Skeleton, SkeletonText } from '../ui/skeleton';
import { Plus, Calendar, Target, AlertCircle, DollarSign } from '../ui/icons';
import { Badge } from '../ui/badge';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import ExpenseAnalysis from './ExpenseAnalysis';
import { formatCurrency } from '../../utils/formatters';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const ExpenseDashboard = () => {
  // Use UnifiedFinancialContext instead of local state
  const {
    expenses,
    loading,
    deleteExpense,
    fetchAllFinancialData
  } = useUnifiedFinancialContext();

  const [summary, setSummary] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  useEffect(() => {
    // Load all financial data from unified context
    if (expenses.length === 0) {
      fetchAllFinancialData().catch(error => {
        console.error('Error loading financial data:', error);
        setError(error.message);
      });
    }
  }, [expenses.length, fetchAllFinancialData]);

  // Calculate summary and analysis from expenses data
  useEffect(() => {
    if (expenses.length > 0) {
      const toMonthly = e => (typeof e.monthly_equivalent === 'number' ? e.monthly_equivalent : (parseFloat(e.amount) || 0));
      const totalAmount = expenses.reduce((sum, e) => sum + toMonthly(e), 0);
      const monthlyRecurring = expenses.filter(e => e.is_recurring).reduce((sum, e) => sum + toMonthly(e), 0);
      const essentialCount = expenses.filter(e => !!e.is_essential).length;
      const discretionaryCount = expenses.length - essentialCount;
      const countByCategory = expenses.reduce((acc, e) => {
        const cat = e.expense_category || 'miscellaneous';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      setSummary({
        total_expenses: totalAmount,
        monthly_recurring: monthlyRecurring,
        one_time_expenses: Math.max(0, totalAmount - monthlyRecurring),
        expense_count: expenses.length,
        essential_expenses: essentialCount,
        discretionary_expenses: discretionaryCount,
        expense_count_by_category: countByCategory
      });

      // Basic analysis (by expense type amounts)
      const typeBreakdown = expenses.reduce((acc, e) => {
        const t = e.expense_type || 'other';
        acc[t] = (acc[t] || 0) + toMonthly(e);
        return acc;
      }, {});

      setAnalysis({ type_breakdown: typeBreakdown, budget_status: totalAmount <= monthlyRecurring ? 'on_track' : 'on_track' });
    } else {
      setSummary(null);
      setAnalysis(null);
    }
  }, [expenses]);

  const handleExpenseCreated = (newExpense) => {
    setShowExpenseForm(false);
    // Data automatically refreshes via unified context
  };

  const handleExpenseUpdated = (updatedExpense) => {
    setEditingExpense(null);
    // Data automatically refreshes via unified context
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
      await deleteExpense(expenseId);
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError(err.message);
    }
  };

  if (loading.expenses || loading.global) {
    return (
      <Layout className="py-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <SkeletonText lines={2} />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="pt-6">
            <SkeletonText lines={5} />
          </CardContent>
        </Card>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout className="py-6">
        <Alert variant="danger" title="Error loading expenses">
          {error}
        </Alert>
        <Button onClick={() => fetchAllFinancialData()} className="mt-4" variant="outline" aria-label="Retry loading expenses">
          Retry
        </Button>
      </Layout>
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
    <Layout className="py-6 space-y-6">
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
          aria-label="Add expense"
        >
          <Plus className="h-4 w-4" />
          <span>Add Expense</span>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Stat label="Total Expenses" value={formatCurrency(summary?.total_expenses || 0)} icon={<DollarSign className="h-4 w-4" />} tone="danger" />
        <Stat label="Monthly Recurring" value={formatCurrency(summary?.monthly_recurring || 0)} icon={<Calendar className="h-4 w-4" />} tone="info" />
        <Stat label="Essential" value={summary?.essential_expenses || 0} icon={<Target className="h-4 w-4" />} />
        <Stat label="Discretionary" value={summary?.discretionary_expenses || 0} icon={<Target className="h-4 w-4" />} />
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
                    {((count / (summary.expense_count || 1)) * 100).toFixed(0)}%
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
    </Layout>
  );
};

export default ExpenseDashboard;
