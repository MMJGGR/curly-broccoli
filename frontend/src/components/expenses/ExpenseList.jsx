import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Edit, Trash2, Calendar, Building2, Repeat, DollarSign } from '../ui/icons';
import { formatCurrency, formatDate } from '../../utils/formatters';

const ExpenseList = ({ expenses, onEditExpense, onDeleteExpense }) => {
  const [sortBy, setSortBy] = useState('expense_date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');

  // const handleSort = (field) => {
  //   if (sortBy === field) {
  //     setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  //   } else {
  //     setSortBy(field);
  //     setSortOrder('desc');
  //   }
  // };

  const getExpenseCategories = () => {
    const categories = ['all', ...new Set(expenses.map(expense => expense.expense_category))];
    return categories;
  };

  const getExpenseTypes = () => {
    const types = ['all', ...new Set(expenses.map(expense => expense.expense_type))];
    return types;
  };

  const getFilteredAndSortedExpenses = () => {
    let filtered = expenses;
    
    if (filterCategory !== 'all') {
      filtered = expenses.filter(expense => expense.expense_category === filterCategory);
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(expense => expense.expense_type === filterType);
    }

    return filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'description':
          aValue = a.description.toLowerCase();
          bValue = b.description.toLowerCase();
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'expense_date':
          aValue = new Date(a.expense_date);
          bValue = new Date(b.expense_date);
          break;
        case 'vendor':
          aValue = (a.vendor || '').toLowerCase();
          bValue = (b.vendor || '').toLowerCase();
          break;
        default:
          aValue = new Date(a.expense_date);
          bValue = new Date(b.expense_date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'fixed_expenses': return 'bg-red-100 text-red-800 border-red-200';
      case 'variable_expenses': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'discretionary_expenses': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      housing: 'bg-purple-100 text-purple-800',
      transportation: 'bg-green-100 text-green-800',
      food: 'bg-yellow-100 text-yellow-800',
      utilities: 'bg-indigo-100 text-indigo-800',
      healthcare: 'bg-pink-100 text-pink-800',
      entertainment: 'bg-cyan-100 text-cyan-800',
      education: 'bg-violet-100 text-violet-800',
      insurance: 'bg-slate-100 text-slate-800',
      miscellaneous: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredExpenses = getFilteredAndSortedExpenses();

  if (expenses.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <DollarSign className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No expenses yet</h3>
            <p className="text-gray-600 mb-4">
              Start tracking your expenses for better financial management
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <CardTitle>Your Expenses ({filteredExpenses.length})</CardTitle>
          
          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getExpenseCategories().map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : 
                   category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {getExpenseTypes().map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : 
                   type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field);
                setSortOrder(order);
              }}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="expense_date-desc">Newest First</option>
              <option value="expense_date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="description-asc">Description A-Z</option>
              <option value="vendor-asc">Vendor A-Z</option>
            </select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {filteredExpenses.map((expense) => (
            <div 
              key={expense.id} 
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-3 lg:space-y-0">
                {/* Expense Info */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{expense.description}</h3>
                    <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                      <Badge 
                        variant="outline" 
                        className={getCategoryColor(expense.expense_category)}
                      >
                        {expense.expense_category.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={getTypeColor(expense.expense_type)}
                      >
                        {expense.expense_type.toUpperCase()}
                      </Badge>
                      {expense.is_recurring && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          <Repeat className="h-3 w-3 mr-1" />
                          RECURRING
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    {/* Amount */}
                    <div>
                      <p className="text-gray-600">Amount</p>
                      <p className="font-semibold text-lg">
                        {formatCurrency(expense.amount)}
                      </p>
                      {expense.is_recurring && expense.frequency_months && (
                        <p className="text-xs text-gray-500">
                          Every {expense.frequency_months} month{expense.frequency_months > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-gray-600">Date</p>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{formatDate(expense.expense_date)}</span>
                      </div>
                    </div>

                    {/* Vendor */}
                    <div>
                      <p className="text-gray-600">Vendor</p>
                      <p className="font-medium">
                        {expense.vendor || 'Not specified'}
                      </p>
                    </div>

                    {/* Related Asset */}
                    <div>
                      <p className="text-gray-600">Related Asset</p>
                      {expense.related_asset_name ? (
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{expense.related_asset_name}</span>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">None</p>
                      )}
                    </div>
                  </div>

                  {/* Monthly Equivalent for Recurring */}
                  {expense.is_recurring && expense.monthly_equivalent && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-700">
                        Monthly Impact: <span className="font-semibold">{formatCurrency(expense.monthly_equivalent)}</span>
                      </p>
                    </div>
                  )}

                  {/* Notes */}
                  {expense.notes && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">{expense.notes}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 lg:ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditExpense(expense)}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDeleteExpense(expense.id)}
                    className="flex items-center space-x-1 text-red-600 hover:text-red-700 hover:border-red-300"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ExpenseList;