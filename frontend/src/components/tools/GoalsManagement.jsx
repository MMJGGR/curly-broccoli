import React, { useState, useEffect } from 'react';
import { Skeleton, SkeletonText } from '../ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Plus, Edit, Trash2, Target, Calendar, TrendingUp } from '../ui/icons';
import { formatCurrency } from '../../utils/formatters';
import { useUnifiedFinancialContext } from '../../contexts/TransactionContext';

const GoalsManagement = () => {
  // Use UnifiedFinancialContext instead of local state
  const {
    goals,
    loading,
    createGoal,
    updateGoal,
    deleteGoal,
    fetchAllFinancialData
  } = useUnifiedFinancialContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    goal_type: '',
    description: '',
    funding_sources: []
  });

  const goalTypes = [
    { value: 'emergency_fund', label: 'Emergency Fund', icon: Target },
    { value: 'house_purchase', label: 'House Purchase', icon: Target },
    { value: 'education', label: 'Education', icon: Target },
    { value: 'retirement', label: 'Retirement', icon: Target },
    { value: 'vacation', label: 'Vacation', icon: Target },
    { value: 'business', label: 'Business Investment', icon: Target },
    { value: 'debt_payoff', label: 'Debt Payoff', icon: Target },
    { value: 'other', label: 'Other', icon: Target }
  ];

  useEffect(() => {
    // Load all financial data from unified context
    if (goals.length === 0) {
      fetchAllFinancialData().catch(error => {
        console.error('Error loading financial data:', error);
      });
    }
  }, [goals.length, fetchAllFinancialData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        name: formData.name,
        target_amount: parseFloat(formData.target_amount),
        target_date: formData.target_date,
        current_amount: formData.current_amount ? parseFloat(formData.current_amount) : 0
      };

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData);
      } else {
        await createGoal(goalData);
      }

      setIsFormOpen(false);
      setEditingGoal(null);
      resetForm();
    } catch (error) {
      console.error('Failed to save goal:', error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setFormData({
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount?.toString() || '0',
      target_date: goal.target_date || '',
      goal_type: goal.goal_type || '',
      description: goal.description || '',
      funding_sources: goal.funding_sources || []
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await deleteGoal(goalId);
    } catch (error) {
      console.error('Failed to delete goal:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '',
      target_date: '',
      goal_type: '',
      description: '',
      funding_sources: []
    });
  };

  const getProgressPercentage = (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(100, (current / target) * 100);
  };

  const getDaysUntilTarget = (targetDate) => {
    if (!targetDate) return null;
    const now = new Date();
    const target = new Date(targetDate);
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getGoalTypeIcon = (goalType) => {
    const type = goalTypes.find(t => t.value === goalType);
    return type ? type.icon : Target;
  };

  const calculateMonthlyRequirement = (goal) => {
    const remaining = goal.target_amount - (goal.current_amount || 0);
    const daysUntil = getDaysUntilTarget(goal.target_date);
    
    if (!daysUntil || daysUntil <= 0 || remaining <= 0) return 0;
    
    const monthsUntil = daysUntil / 30;
    return remaining / monthsUntil;
  };

  const totalGoalValue = goals.reduce((sum, goal) => sum + goal.target_amount, 0);
  const totalProgress = goals.reduce((sum, goal) => sum + (goal.current_amount || 0), 0);

  if (loading.goals || loading.global) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <SkeletonText lines={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="goals-management-section">
      {/* Goals Summary */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Target className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Goals</p>
                <p className="text-3xl font-bold text-blue-600" data-testid="total-goals-count">
                  {goals.length}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Target Value</p>
                <p className="text-3xl font-bold text-green-600" data-testid="total-goal-value">
                  {formatCurrency(totalGoalValue)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Progress</p>
                <p className="text-3xl font-bold text-purple-600" data-testid="total-goal-progress">
                  {formatCurrency(totalProgress)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Goals List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Financial Goals</CardTitle>
          <Button onClick={() => setIsFormOpen(true)} data-testid="add-goal-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4" data-testid="goals-list">
            {goals.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No goals yet. Add your first goal to start planning your financial future.</p>
              </div>
            ) : (
              goals.map((goal) => {
                const IconComponent = getGoalTypeIcon(goal.goal_type);
                const progress = getProgressPercentage(goal.current_amount || 0, goal.target_amount);
                const daysUntil = getDaysUntilTarget(goal.target_date);
                const monthlyRequired = calculateMonthlyRequirement(goal);
                
                return (
                  <div key={goal.id} className="border rounded-lg p-4 bg-gray-50" data-testid="goal-item">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <IconComponent className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="font-semibold text-lg" data-testid="goal-name">
                              {goal.name}
                            </h3>
                            <Badge variant="secondary" data-testid="goal-type-badge">
                              {goalTypes.find(t => t.value === goal.goal_type)?.label || goal.goal_type}
                            </Badge>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
                          <div 
                            className={`h-3 rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(progress, 100)}%` }}
                          ></div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
                          <div>
                            <p className="text-sm text-gray-600">Progress</p>
                            <p className="font-semibold text-blue-600" data-testid="goal-progress">
                              {progress.toFixed(1)}%
                            </p>
                          </div>
                          
                          <div>
                            <p className="text-sm text-gray-600">Current / Target</p>
                            <p className="font-semibold" data-testid="goal-amounts">
                              {formatCurrency(goal.current_amount || 0)} / {formatCurrency(goal.target_amount)}
                            </p>
                          </div>
                          
                          {daysUntil !== null && (
                            <div>
                              <p className="text-sm text-gray-600">Days Remaining</p>
                              <p className={`font-semibold ${daysUntil < 0 ? 'text-red-600' : daysUntil < 30 ? 'text-orange-600' : 'text-green-600'}`}>
                                {daysUntil < 0 ? `${Math.abs(daysUntil)} overdue` : daysUntil}
                              </p>
                            </div>
                          )}
                          
                          {monthlyRequired > 0 && (
                            <div>
                              <p className="text-sm text-gray-600">Monthly Required</p>
                              <p className="font-semibold text-purple-600">
                                {formatCurrency(monthlyRequired)}
                              </p>
                            </div>
                          )}
                        </div>

                        {goal.description && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">
                              <span className="font-medium">Description:</span> {goal.description}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(goal)} data-testid="edit-goal-button">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleDelete(goal.id)} className="text-red-600 hover:text-red-800">
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

      {/* Add/Edit Goal Form */}
      {isFormOpen && (
        <Card data-testid="goal-form">
          <CardHeader>
            <CardTitle>{editingGoal ? 'Edit Goal' : 'Add New Goal'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Goal Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g., Emergency Fund"
                    required
                    data-testid="goal-name-input"
                  />
                </div>

                <div>
                  <Label htmlFor="goal_type">Goal Type *</Label>
                  <Select value={formData.goal_type} onValueChange={(value) => setFormData({...formData, goal_type: value})} data-testid="goal-type-select">
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal type" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="target_amount">Target Amount (KES) *</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    value={formData.target_amount}
                    onChange={(e) => setFormData({...formData, target_amount: e.target.value})}
                    placeholder="0.00"
                    required
                    data-testid="target-amount-input"
                  />
                </div>

                <div>
                  <Label htmlFor="current_amount">Current Amount (KES)</Label>
                  <Input
                    id="current_amount"
                    type="number"
                    step="0.01"
                    value={formData.current_amount}
                    onChange={(e) => setFormData({...formData, current_amount: e.target.value})}
                    placeholder="0.00"
                    data-testid="current-amount-input"
                  />
                </div>

                <div>
                  <Label htmlFor="target_date">Target Date</Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={formData.target_date}
                    onChange={(e) => setFormData({...formData, target_date: e.target.value})}
                    data-testid="target-date-input"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Brief description of the goal"
                    data-testid="goal-description-input"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" data-testid="submit-goal">
                  {editingGoal ? 'Update Goal' : 'Add Goal'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsFormOpen(false);
                    setEditingGoal(null);
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

export default GoalsManagement;
