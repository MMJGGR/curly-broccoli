/**
 * Predictive Analytics Service
 * Frontend client for advanced financial modeling and goal achievement analytics
 */

import { API_BASE_URL } from '../config';

class PredictiveAnalyticsService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/api/v1/analytics`;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Get authentication headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem('jwt');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Cache management
   */
  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Health check for analytics service
   */
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL}/health`);
      return await response.json();
    } catch (error) {
      console.error('Analytics service health check failed:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Analyze individual goal trajectory using real account data
   */
  async analyzeGoalTrajectory(goalId, options = {}) {
    const cacheKey = `trajectory_${goalId}_${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const requestBody = {
        goal_id: goalId,
        ...options
      };

      const response = await fetch(`${this.baseURL}/goals/${goalId}/analyze`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Goal analysis failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error analyzing goal ${goalId}:`, error);
      throw error;
    }
  }

  /**
   * Run Monte Carlo simulation for goal achievement probability
   */
  async runMonteCarloSimulation(goalId, options = {}) {
    const cacheKey = `simulation_${goalId}_${JSON.stringify(options)}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const requestBody = {
        goal_id: goalId,
        market_assumptions: options.marketAssumptions,
        custom_contribution: options.customContribution,
        risk_level: options.riskLevel || 'moderate'
      };

      const response = await fetch(`${this.baseURL}/goals/${goalId}/simulate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Simulation failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error running simulation for goal ${goalId}:`, error);
      throw error;
    }
  }

  /**
   * Analyze portfolio of multiple goals with optimization
   */
  async analyzePortfolio(goalIds, totalMonthlyBudget, options = {}) {
    const cacheKey = `portfolio_${goalIds.join('_')}_${totalMonthlyBudget}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const requestBody = {
        goal_ids: goalIds,
        total_monthly_budget: totalMonthlyBudget,
        market_assumptions: options.marketAssumptions
      };

      const response = await fetch(`${this.baseURL}/portfolio/analyze`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Portfolio analysis failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error analyzing portfolio:', error);
      throw error;
    }
  }

  /**
   * Optimize goal achievement strategy
   */
  async optimizeGoalStrategy(goalData, options = {}) {
    try {
      const requestBody = {
        goal_name: goalData.name,
        target_amount: parseFloat(goalData.targetAmount),
        current_amount: parseFloat(goalData.currentAmount || 0),
        target_date: goalData.targetDate,
        available_monthly: parseFloat(goalData.availableMonthly || 0),
        risk_tolerance: parseFloat(options.riskTolerance || 0.5)
      };

      const response = await fetch(`${this.baseURL}/goals/optimize`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`Optimization failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error optimizing goal strategy:', error);
      throw error;
    }
  }

  /**
   * Get detailed projections for a goal over multiple years
   */
  async getGoalProjections(goalId, options = {}) {
    const cacheKey = `projections_${goalId}_${options.yearsAhead}_${options.scenario}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const params = new URLSearchParams({
        years_ahead: options.yearsAhead || 10,
        scenario: options.scenario || 'realistic'
      });

      const response = await fetch(`${this.baseURL}/goals/${goalId}/projections?${params}`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Projections failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error(`Error getting projections for goal ${goalId}:`, error);
      throw error;
    }
  }

  /**
   * Get comprehensive dashboard insights
   */
  async getDashboardInsights() {
    const cacheKey = 'dashboard_insights';
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.baseURL}/dashboard/insights`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`Dashboard insights failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      this.setCachedData(cacheKey, data);
      return data;
    } catch (error) {
      console.error('Error getting dashboard insights:', error);
      throw error;
    }
  }

  /**
   * Update goal progress based on real account balances
   */
  async updateGoalProgress(goalId, recalculate = true) {
    try {
      const response = await fetch(`${this.baseURL}/goals/${goalId}/update-progress`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ recalculate })
      });

      if (!response.ok) {
        throw new Error(`Progress update failed: ${response.status} ${response.statusText}`);
      }

      // Clear related cache entries
      const keysToDelete = [];
      for (const key of this.cache.keys()) {
        if (key.includes(`${goalId}`) || key.includes('dashboard_insights')) {
          keysToDelete.push(key);
        }
      }
      keysToDelete.forEach(key => this.cache.delete(key));

      return await response.json();
    } catch (error) {
      console.error(`Error updating progress for goal ${goalId}:`, error);
      throw error;
    }
  }

  /**
   * Calculate required monthly contribution for a goal
   */
  calculateRequiredContribution(targetAmount, currentAmount, monthsToGoal, annualReturn = 0.07) {
    if (monthsToGoal <= 0) {
      return targetAmount - currentAmount;
    }

    const monthlyRate = annualReturn / 12;
    const futureValueOfCurrent = currentAmount * Math.pow(1 + monthlyRate, monthsToGoal);
    const remainingNeeded = targetAmount - futureValueOfCurrent;

    if (remainingNeeded <= 0) {
      return 0;
    }

    // Future value of annuity formula solved for payment
    if (monthlyRate === 0) {
      return remainingNeeded / monthsToGoal;
    }

    const payment = remainingNeeded / (((Math.pow(1 + monthlyRate, monthsToGoal) - 1) / monthlyRate));
    return Math.max(0, payment);
  }

  /**
   * Calculate future value with compound interest
   */
  calculateFutureValue(currentAmount, monthlyContribution, monthsToGoal, annualReturn = 0.07) {
    const monthlyRate = annualReturn / 12;
    
    // Future value of current amount
    const fvCurrent = currentAmount * Math.pow(1 + monthlyRate, monthsToGoal);
    
    // Future value of monthly contributions
    if (monthlyRate === 0) {
      const fvContributions = monthlyContribution * monthsToGoal;
      return fvCurrent + fvContributions;
    }
    
    const fvContributions = monthlyContribution * (((Math.pow(1 + monthlyRate, monthsToGoal) - 1) / monthlyRate));
    return fvCurrent + fvContributions;
  }

  /**
   * Calculate real return rate adjusted for inflation
   */
  calculateRealReturn(nominalReturn, inflationRate = 0.03) {
    return (1 + nominalReturn) / (1 + inflationRate) - 1;
  }

  /**
   * Format large numbers for display
   */
  formatCurrency(amount, currency = 'KES') {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  /**
   * Format percentages for display
   */
  formatPercentage(value, decimals = 1) {
    return `${(value * 100).toFixed(decimals)}%`;
  }

  /**
   * Get risk level color coding
   */
  getRiskLevelColor(successProbability) {
    if (successProbability >= 0.8) return '#10B981'; // Green
    if (successProbability >= 0.6) return '#F59E0B'; // Yellow
    if (successProbability >= 0.4) return '#EF4444'; // Orange
    return '#DC2626'; // Red
  }

  /**
   * Get risk level description
   */
  getRiskLevelDescription(successProbability) {
    if (successProbability >= 0.8) return 'Very Likely';
    if (successProbability >= 0.6) return 'Likely';
    if (successProbability >= 0.4) return 'Moderate Risk';
    return 'High Risk';
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      timeouts: this.cacheTimeout
    };
  }

  /**
   * Batch update multiple goals
   */
  async batchUpdateGoalProgress(goalIds) {
    const updates = await Promise.allSettled(
      goalIds.map(goalId => this.updateGoalProgress(goalId, false))
    );
    
    const successful = updates.filter(result => result.status === 'fulfilled').length;
    const failed = updates.filter(result => result.status === 'rejected').length;
    
    return {
      successful,
      failed,
      total: goalIds.length,
      results: updates
    };
  }

  /**
   * Get optimization recommendations for all goals
   */
  async getOptimizationRecommendations(goals, totalBudget) {
    try {
      // Get individual analyses
      const analyses = await Promise.allSettled(
        goals.map(goal => this.analyzeGoalTrajectory(goal.id))
      );

      const successfulAnalyses = analyses
        .filter(result => result.status === 'fulfilled')
        .map(result => result.value);

      // Get portfolio analysis if we have multiple goals
      let portfolioAnalysis = null;
      if (goals.length > 1 && totalBudget > 0) {
        try {
          portfolioAnalysis = await this.analyzePortfolio(
            goals.map(g => g.id),
            totalBudget
          );
        } catch (error) {
          console.warn('Portfolio analysis failed:', error);
        }
      }

      // Compile recommendations
      const recommendations = {
        individual: successfulAnalyses.map(analysis => ({
          goalId: analysis.goal_id,
          recommendations: analysis.recommendations,
          successProbability: analysis.success_probability,
          priority: analysis.success_probability < 0.5 ? 'high' : 
                   analysis.success_probability < 0.7 ? 'medium' : 'low'
        })),
        portfolio: portfolioAnalysis?.portfolio_recommendations || [],
        summary: {
          totalGoals: goals.length,
          highRiskGoals: successfulAnalyses.filter(a => a.success_probability < 0.5).length,
          averageSuccessProbability: successfulAnalyses.length > 0 
            ? successfulAnalyses.reduce((sum, a) => sum + a.success_probability, 0) / successfulAnalyses.length
            : 0
        }
      };

      return recommendations;
    } catch (error) {
      console.error('Error getting optimization recommendations:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const predictiveAnalytics = new PredictiveAnalyticsService();

// Export both the class and instance for flexibility
export { PredictiveAnalyticsService };
export default predictiveAnalytics;