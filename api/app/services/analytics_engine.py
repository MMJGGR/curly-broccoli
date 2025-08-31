"""
Monte Carlo Simulation Engine for Financial Goal Achievement Modeling
Provides sophisticated financial modeling with risk assessment and scenario analysis.
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class RiskLevel(Enum):
    """Risk levels for different investment strategies"""
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"


class GoalType(Enum):
    """Types of financial goals"""
    EMERGENCY_FUND = "emergency_fund"
    RETIREMENT = "retirement"
    EDUCATION = "education"
    HOME_PURCHASE = "home_purchase"
    INVESTMENT = "investment"
    DEBT_PAYOFF = "debt_payoff"


@dataclass
class MarketAssumptions:
    """Market assumptions for Monte Carlo simulations"""
    mean_return: float = 0.07  # 7% annual return
    volatility: float = 0.15   # 15% volatility
    inflation_rate: float = 0.03  # 3% annual inflation
    risk_free_rate: float = 0.02  # 2% risk-free rate


@dataclass
class GoalParameters:
    """Parameters defining a financial goal"""
    name: str
    target_amount: float
    current_amount: float
    monthly_contribution: float
    target_date: datetime
    goal_type: GoalType
    risk_level: RiskLevel = RiskLevel.MODERATE
    priority: int = 1  # 1 = highest priority


@dataclass
class SimulationResult:
    """Results from Monte Carlo simulation"""
    success_probability: float
    confidence_intervals: Dict[str, float]
    projected_values: Dict[str, float]
    risk_metrics: Dict[str, float]
    scenario_analysis: Dict[str, Any]
    recommendations: List[str]


class MonteCarloEngine:
    """
    Monte Carlo simulation engine for financial goal modeling.
    Provides CFA-level financial modeling with sophisticated risk analysis.
    """
    
    def __init__(self, num_simulations: int = 10000):
        self.num_simulations = num_simulations
        self.market_assumptions = MarketAssumptions()
        
    def run_goal_simulation(
        self, 
        goal: GoalParameters,
        market_assumptions: Optional[MarketAssumptions] = None
    ) -> SimulationResult:
        """
        Run Monte Carlo simulation for a specific financial goal.
        
        Args:
            goal: Goal parameters including target, contributions, timeline
            market_assumptions: Market return and volatility assumptions
            
        Returns:
            SimulationResult with probability analysis and recommendations
        """
        if market_assumptions:
            self.market_assumptions = market_assumptions
            
        # Calculate time parameters
        months_to_target = self._calculate_months_to_target(goal.target_date)
        years_to_target = months_to_target / 12.0
        
        if months_to_target <= 0:
            logger.warning(f"Goal {goal.name} has target date in the past")
            return self._create_past_due_result(goal)
        
        # Adjust returns based on risk level
        adjusted_assumptions = self._adjust_for_risk_level(goal.risk_level)
        
        # Run simulation
        final_values = self._simulate_portfolio_growth(
            initial_value=goal.current_amount,
            monthly_contribution=goal.monthly_contribution,
            years=years_to_target,
            assumptions=adjusted_assumptions
        )
        
        # Calculate success probability
        success_count = np.sum(final_values >= goal.target_amount)
        success_probability = success_count / self.num_simulations
        
        # Calculate confidence intervals
        confidence_intervals = self._calculate_confidence_intervals(final_values)
        
        # Calculate projected values
        projected_values = self._calculate_projected_values(final_values, goal)
        
        # Calculate risk metrics
        risk_metrics = self._calculate_risk_metrics(final_values, goal)
        
        # Run scenario analysis
        scenario_analysis = self._run_scenario_analysis(goal, adjusted_assumptions)
        
        # Generate recommendations
        recommendations = self._generate_recommendations(
            goal, success_probability, projected_values, scenario_analysis
        )
        
        return SimulationResult(
            success_probability=success_probability,
            confidence_intervals=confidence_intervals,
            projected_values=projected_values,
            risk_metrics=risk_metrics,
            scenario_analysis=scenario_analysis,
            recommendations=recommendations
        )
    
    def run_portfolio_simulation(
        self, 
        goals: List[GoalParameters],
        total_monthly_budget: float
    ) -> Dict[str, Any]:
        """
        Run simulation for multiple goals with budget allocation optimization.
        
        Args:
            goals: List of financial goals
            total_monthly_budget: Total monthly amount available for all goals
            
        Returns:
            Portfolio-level analysis with optimization recommendations
        """
        # Sort goals by priority
        sorted_goals = sorted(goals, key=lambda g: g.priority)
        
        # Run individual simulations
        individual_results = {}
        for goal in sorted_goals:
            result = self.run_goal_simulation(goal)
            individual_results[goal.name] = result
        
        # Analyze budget allocation efficiency
        allocation_analysis = self._analyze_allocation_efficiency(
            goals, total_monthly_budget
        )
        
        # Generate portfolio recommendations
        portfolio_recommendations = self._generate_portfolio_recommendations(
            individual_results, allocation_analysis
        )
        
        return {
            "individual_goals": individual_results,
            "portfolio_analysis": allocation_analysis,
            "portfolio_recommendations": portfolio_recommendations,
            "total_success_probability": self._calculate_portfolio_success_probability(
                individual_results
            )
        }
    
    def _simulate_portfolio_growth(
        self,
        initial_value: float,
        monthly_contribution: float,
        years: float,
        assumptions: MarketAssumptions
    ) -> np.ndarray:
        """Simulate portfolio growth using geometric Brownian motion"""
        months = int(years * 12)
        dt = 1/12  # Monthly time step
        
        # Generate random returns for all simulations
        returns = np.random.normal(
            assumptions.mean_return * dt,
            assumptions.volatility * np.sqrt(dt),
            (self.num_simulations, months)
        )
        
        # Calculate portfolio values for each simulation
        final_values = np.zeros(self.num_simulations)
        
        for sim in range(self.num_simulations):
            value = initial_value
            for month in range(months):
                # Apply market return
                value *= (1 + returns[sim, month])
                # Add monthly contribution at end of month
                value += monthly_contribution
            final_values[sim] = value
        
        return final_values
    
    def _adjust_for_risk_level(self, risk_level: RiskLevel) -> MarketAssumptions:
        """Adjust market assumptions based on risk level"""
        base = self.market_assumptions
        
        if risk_level == RiskLevel.CONSERVATIVE:
            return MarketAssumptions(
                mean_return=base.mean_return * 0.7,  # Lower expected return
                volatility=base.volatility * 0.6,    # Lower volatility
                inflation_rate=base.inflation_rate,
                risk_free_rate=base.risk_free_rate
            )
        elif risk_level == RiskLevel.AGGRESSIVE:
            return MarketAssumptions(
                mean_return=base.mean_return * 1.3,  # Higher expected return
                volatility=base.volatility * 1.4,    # Higher volatility
                inflation_rate=base.inflation_rate,
                risk_free_rate=base.risk_free_rate
            )
        else:  # MODERATE
            return base
    
    def _calculate_months_to_target(self, target_date: datetime) -> int:
        """Calculate months from now to target date"""
        today = datetime.now()
        delta = target_date - today
        return max(0, int(delta.days / 30.44))  # Average days per month
    
    def _calculate_confidence_intervals(self, values: np.ndarray) -> Dict[str, float]:
        """Calculate confidence intervals for simulation results"""
        return {
            "pessimistic_10th": float(np.percentile(values, 10)),
            "pessimistic_25th": float(np.percentile(values, 25)),
            "median_50th": float(np.percentile(values, 50)),
            "optimistic_75th": float(np.percentile(values, 75)),
            "optimistic_90th": float(np.percentile(values, 90))
        }
    
    def _calculate_projected_values(
        self, 
        values: np.ndarray, 
        goal: GoalParameters
    ) -> Dict[str, float]:
        """Calculate key projected values"""
        mean_value = float(np.mean(values))
        median_value = float(np.median(values))
        
        return {
            "expected_final_amount": mean_value,
            "median_final_amount": median_value,
            "shortfall_risk": max(0, goal.target_amount - mean_value),
            "upside_potential": max(0, mean_value - goal.target_amount),
            "standard_deviation": float(np.std(values)),
            "coefficient_of_variation": float(np.std(values) / mean_value) if mean_value > 0 else 0
        }
    
    def _calculate_risk_metrics(
        self, 
        values: np.ndarray, 
        goal: GoalParameters
    ) -> Dict[str, float]:
        """Calculate various risk metrics"""
        target = goal.target_amount
        shortfall_values = values[values < target]
        
        return {
            "value_at_risk_5": float(np.percentile(values, 5)),
            "conditional_var_5": float(np.mean(values[values <= np.percentile(values, 5)])),
            "shortfall_probability": len(shortfall_values) / len(values),
            "average_shortfall": float(np.mean(target - shortfall_values)) if len(shortfall_values) > 0 else 0,
            "maximum_shortfall": float(np.max(target - shortfall_values)) if len(shortfall_values) > 0 else 0,
            "downside_deviation": float(np.sqrt(np.mean(np.minimum(values - target, 0) ** 2)))
        }
    
    def _run_scenario_analysis(
        self, 
        goal: GoalParameters, 
        assumptions: MarketAssumptions
    ) -> Dict[str, Any]:
        """Run what-if scenario analysis"""
        scenarios = {}
        
        # Market crash scenario
        crash_assumptions = MarketAssumptions(
            mean_return=assumptions.mean_return - 0.03,  # 3% lower returns
            volatility=assumptions.volatility * 1.5,      # 50% higher volatility
            inflation_rate=assumptions.inflation_rate,
            risk_free_rate=assumptions.risk_free_rate
        )
        
        months_to_target = self._calculate_months_to_target(goal.target_date)
        years_to_target = months_to_target / 12.0
        
        crash_values = self._simulate_portfolio_growth(
            goal.current_amount,
            goal.monthly_contribution,
            years_to_target,
            crash_assumptions
        )
        
        scenarios["market_crash"] = {
            "success_probability": float(np.sum(crash_values >= goal.target_amount) / self.num_simulations),
            "expected_value": float(np.mean(crash_values))
        }
        
        # High inflation scenario
        high_inflation_target = goal.target_amount * (1 + 0.05) ** years_to_target  # 5% inflation
        scenarios["high_inflation"] = {
            "adjusted_target": high_inflation_target,
            "success_probability_adjusted": float(
                np.sum(crash_values >= high_inflation_target) / self.num_simulations
            )
        }
        
        # Job loss scenario (6 months no contributions)
        job_loss_months = min(6, months_to_target)
        reduced_contribution_months = months_to_target - job_loss_months
        
        if reduced_contribution_months > 0:
            job_loss_values = self._simulate_portfolio_growth(
                goal.current_amount,
                0,  # No contributions for first 6 months
                job_loss_months / 12.0,
                assumptions
            )
            
            # Continue simulation with normal contributions
            final_job_loss_values = np.zeros(self.num_simulations)
            for i, intermediate_value in enumerate(job_loss_values):
                remaining_values = self._simulate_portfolio_growth(
                    intermediate_value,
                    goal.monthly_contribution,
                    reduced_contribution_months / 12.0,
                    assumptions
                )
                final_job_loss_values[i] = remaining_values[0]  # Take first simulation
            
            scenarios["job_loss"] = {
                "success_probability": float(
                    np.sum(final_job_loss_values >= goal.target_amount) / self.num_simulations
                ),
                "expected_value": float(np.mean(final_job_loss_values))
            }
        
        return scenarios
    
    def _generate_recommendations(
        self,
        goal: GoalParameters,
        success_probability: float,
        projected_values: Dict[str, float],
        scenario_analysis: Dict[str, Any]
    ) -> List[str]:
        """Generate actionable recommendations based on simulation results"""
        recommendations = []
        
        # Success probability recommendations
        if success_probability < 0.5:
            shortfall = goal.target_amount - projected_values["expected_final_amount"]
            months_remaining = self._calculate_months_to_target(goal.target_date)
            
            if months_remaining > 0:
                additional_monthly = shortfall / months_remaining
                recommendations.append(
                    f"Low success probability ({success_probability:.1%}). "
                    f"Consider increasing monthly contributions by KES {additional_monthly:,.0f} "
                    f"or extending target date by {int(shortfall / (goal.monthly_contribution * 12))} years."
                )
        elif success_probability < 0.7:
            recommendations.append(
                f"Moderate success probability ({success_probability:.1%}). "
                f"Consider small increase in contributions or risk level adjustment."
            )
        else:
            upside = projected_values["upside_potential"]
            if upside > goal.target_amount * 0.2:  # 20% upside
                recommendations.append(
                    f"High success probability ({success_probability:.1%}) with significant upside. "
                    f"Consider reducing contributions to this goal and allocating to other priorities."
                )
        
        # Risk-based recommendations
        cv = projected_values["coefficient_of_variation"]
        if cv > 0.3:
            recommendations.append(
                "High volatility detected. Consider reducing risk level if goal timeline is short."
            )
        
        # Scenario-based recommendations
        if "market_crash" in scenario_analysis:
            crash_prob = scenario_analysis["market_crash"]["success_probability"]
            if crash_prob < 0.3:
                recommendations.append(
                    f"Vulnerable to market downturns (crash scenario: {crash_prob:.1%} success). "
                    f"Consider defensive allocation or emergency buffer."
                )
        
        return recommendations
    
    def _analyze_allocation_efficiency(
        self, 
        goals: List[GoalParameters], 
        total_budget: float
    ) -> Dict[str, Any]:
        """Analyze efficiency of current budget allocation across goals"""
        current_allocation = sum(goal.monthly_contribution for goal in goals)
        
        # Calculate marginal utility of additional contributions for each goal
        marginal_utilities = {}
        for goal in goals:
            # Simulate with 10% higher contribution
            increased_goal = GoalParameters(
                name=goal.name,
                target_amount=goal.target_amount,
                current_amount=goal.current_amount,
                monthly_contribution=goal.monthly_contribution * 1.1,
                target_date=goal.target_date,
                goal_type=goal.goal_type,
                risk_level=goal.risk_level,
                priority=goal.priority
            )
            
            base_result = self.run_goal_simulation(goal)
            increased_result = self.run_goal_simulation(increased_goal)
            
            marginal_utility = (
                increased_result.success_probability - base_result.success_probability
            ) / (goal.monthly_contribution * 0.1)
            
            marginal_utilities[goal.name] = marginal_utility
        
        return {
            "current_allocation": current_allocation,
            "budget_utilization": current_allocation / total_budget if total_budget > 0 else 0,
            "available_budget": max(0, total_budget - current_allocation),
            "marginal_utilities": marginal_utilities,
            "optimization_potential": max(marginal_utilities.values()) - min(marginal_utilities.values())
        }
    
    def _generate_portfolio_recommendations(
        self,
        individual_results: Dict[str, SimulationResult],
        allocation_analysis: Dict[str, Any]
    ) -> List[str]:
        """Generate portfolio-level recommendations"""
        recommendations = []
        
        # Budget utilization recommendations
        utilization = allocation_analysis["budget_utilization"]
        if utilization < 0.8:
            available = allocation_analysis["available_budget"]
            recommendations.append(
                f"Under-utilizing budget ({utilization:.1%} used). "
                f"Consider allocating additional KES {available:,.0f} monthly to highest priority goals."
            )
        
        # Goal prioritization recommendations
        marginal_utilities = allocation_analysis["marginal_utilities"]
        if allocation_analysis["optimization_potential"] > 0.1:
            best_goal = max(marginal_utilities.keys(), key=lambda k: marginal_utilities[k])
            worst_goal = min(marginal_utilities.keys(), key=lambda k: marginal_utilities[k])
            
            recommendations.append(
                f"Allocation inefficiency detected. Consider shifting funds from "
                f"{worst_goal} to {best_goal} for better overall outcomes."
            )
        
        # Risk diversification recommendations
        low_probability_goals = [
            name for name, result in individual_results.items()
            if result.success_probability < 0.5
        ]
        
        if len(low_probability_goals) > len(individual_results) / 2:
            recommendations.append(
                f"Multiple goals at risk: {', '.join(low_probability_goals)}. "
                f"Consider extending timelines or increasing overall budget allocation."
            )
        
        return recommendations
    
    def _calculate_portfolio_success_probability(
        self, 
        individual_results: Dict[str, SimulationResult]
    ) -> float:
        """Calculate probability that all goals will be achieved"""
        # Assuming independence (conservative estimate)
        total_prob = 1.0
        for result in individual_results.values():
            total_prob *= result.success_probability
        
        return total_prob
    
    def _create_past_due_result(self, goal: GoalParameters) -> SimulationResult:
        """Create result for goals with past due dates"""
        return SimulationResult(
            success_probability=0.0,
            confidence_intervals={
                "pessimistic_10th": goal.current_amount,
                "pessimistic_25th": goal.current_amount,
                "median_50th": goal.current_amount,
                "optimistic_75th": goal.current_amount,
                "optimistic_90th": goal.current_amount
            },
            projected_values={
                "expected_final_amount": goal.current_amount,
                "median_final_amount": goal.current_amount,
                "shortfall_risk": goal.target_amount - goal.current_amount,
                "upside_potential": 0.0,
                "standard_deviation": 0.0,
                "coefficient_of_variation": 0.0
            },
            risk_metrics={
                "value_at_risk_5": goal.current_amount,
                "conditional_var_5": goal.current_amount,
                "shortfall_probability": 1.0,
                "average_shortfall": goal.target_amount - goal.current_amount,
                "maximum_shortfall": goal.target_amount - goal.current_amount,
                "downside_deviation": 0.0
            },
            scenario_analysis={},
            recommendations=[
                "Goal target date has passed. Consider revising timeline or target amount."
            ]
        )


class PredictiveAnalytics:
    """
    High-level predictive analytics service combining Monte Carlo simulations
    with trend analysis and behavioral modeling.
    """
    
    def __init__(self):
        self.monte_carlo = MonteCarloEngine()
    
    def analyze_goal_trajectory(
        self,
        goal_data: Dict[str, Any],
        account_balances: Dict[str, float],
        transaction_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Analyze goal achievement trajectory using real account data.
        
        Args:
            goal_data: Goal information from database
            account_balances: Current account balances
            transaction_history: Historical transaction data
            
        Returns:
            Comprehensive trajectory analysis with predictions
        """
        # Calculate real progress from account balances
        current_amount = self._calculate_real_progress(goal_data, account_balances)
        
        # Analyze contribution patterns from transactions
        contribution_analysis = self._analyze_contribution_patterns(
            goal_data, transaction_history
        )
        
        # Create goal parameters for simulation
        goal_params = self._create_goal_parameters(goal_data, current_amount, contribution_analysis)
        
        # Run Monte Carlo simulation
        simulation_result = self.monte_carlo.run_goal_simulation(goal_params)
        
        # Add trend analysis
        trend_analysis = self._analyze_trends(transaction_history, goal_data)
        
        return {
            "current_progress": {
                "actual_amount": current_amount,
                "target_amount": float(goal_data.get("target", 0)),
                "progress_percentage": (current_amount / float(goal_data.get("target", 1))) * 100,
                "calculation_method": "real_account_balances"
            },
            "contribution_analysis": contribution_analysis,
            "simulation_results": simulation_result.__dict__,
            "trend_analysis": trend_analysis,
            "next_review_date": self._calculate_next_review_date(goal_params),
            "action_items": self._generate_action_items(simulation_result, trend_analysis)
        }
    
    def _calculate_real_progress(
        self, 
        goal_data: Dict[str, Any], 
        account_balances: Dict[str, float]
    ) -> float:
        """Calculate real progress from actual account balances"""
        # Map goal types to relevant account types
        goal_type = goal_data.get("name", "").lower()
        
        if "emergency" in goal_type:
            # Emergency fund: savings accounts
            return sum(balance for account_type, balance in account_balances.items() 
                      if "savings" in account_type.lower())
        
        elif "retirement" in goal_type:
            # Retirement: investment and retirement accounts
            return sum(balance for account_type, balance in account_balances.items() 
                      if any(keyword in account_type.lower() 
                            for keyword in ["investment", "retirement", "nssf", "pension"]))
        
        elif "education" in goal_type:
            # Education: education savings accounts
            return sum(balance for account_type, balance in account_balances.items() 
                      if "education" in account_type.lower())
        
        else:
            # General investment goal: all investment accounts
            return sum(balance for account_type, balance in account_balances.items() 
                      if "investment" in account_type.lower())
    
    def _analyze_contribution_patterns(
        self, 
        goal_data: Dict[str, Any], 
        transaction_history: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze contribution patterns from transaction history"""
        # Filter transactions related to this goal
        goal_name = goal_data.get("name", "").lower()
        relevant_transactions = [
            tx for tx in transaction_history
            if any(keyword in tx.get("description", "").lower() 
                  for keyword in [goal_name, "investment", "savings", "transfer"])
            and tx.get("transaction_type") == "debit"  # Outgoing contributions
        ]
        
        if not relevant_transactions:
            return {
                "average_monthly_contribution": 0,
                "contribution_consistency": 0,
                "trend": "no_data"
            }
        
        # Calculate monthly contributions
        df = pd.DataFrame(relevant_transactions)
        df["date"] = pd.to_datetime(df["date"])
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        
        monthly_contributions = df.groupby(df["date"].dt.to_period("M"))["amount"].sum()
        
        return {
            "average_monthly_contribution": float(monthly_contributions.mean()),
            "contribution_consistency": 1 - float(monthly_contributions.std() / monthly_contributions.mean()) 
                                       if monthly_contributions.mean() > 0 else 0,
            "trend": "increasing" if monthly_contributions.is_monotonic_increasing else 
                    "decreasing" if monthly_contributions.is_monotonic_decreasing else "stable",
            "last_3_months_average": float(monthly_contributions.tail(3).mean()),
            "contribution_frequency": len(relevant_transactions) / len(monthly_contributions) 
                                    if len(monthly_contributions) > 0 else 0
        }
    
    def _create_goal_parameters(
        self, 
        goal_data: Dict[str, Any], 
        current_amount: float,
        contribution_analysis: Dict[str, Any]
    ) -> GoalParameters:
        """Create GoalParameters from database data"""
        target_date_str = goal_data.get("target_date")
        target_date = datetime.fromisoformat(target_date_str) if target_date_str else datetime.now() + timedelta(days=365)
        
        # Map goal name to goal type
        goal_name = goal_data.get("name", "").lower()
        if "emergency" in goal_name:
            goal_type = GoalType.EMERGENCY_FUND
        elif "retirement" in goal_name:
            goal_type = GoalType.RETIREMENT
        elif "education" in goal_name:
            goal_type = GoalType.EDUCATION
        else:
            goal_type = GoalType.INVESTMENT
        
        return GoalParameters(
            name=goal_data.get("name", "Unknown Goal"),
            target_amount=float(goal_data.get("target", 0)),
            current_amount=current_amount,
            monthly_contribution=contribution_analysis.get("last_3_months_average", 0),
            target_date=target_date,
            goal_type=goal_type,
            risk_level=RiskLevel.MODERATE,  # Default, could be determined from user profile
            priority=1
        )
    
    def _analyze_trends(
        self, 
        transaction_history: List[Dict[str, Any]], 
        goal_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze spending and saving trends"""
        if not transaction_history:
            return {"trend_direction": "no_data", "velocity": 0}
        
        df = pd.DataFrame(transaction_history)
        df["date"] = pd.to_datetime(df["date"])
        df["amount"] = pd.to_numeric(df["amount"], errors="coerce")
        
        # Calculate monthly net savings (income - expenses)
        monthly_data = df.groupby([df["date"].dt.to_period("M"), "transaction_type"])["amount"].sum().unstack(fill_value=0)
        
        if "credit" in monthly_data.columns and "debit" in monthly_data.columns:
            monthly_data["net_savings"] = monthly_data["credit"] - monthly_data["debit"]
        else:
            monthly_data["net_savings"] = 0
        
        # Calculate trend
        recent_months = monthly_data.tail(6)["net_savings"]
        if len(recent_months) >= 2:
            trend_slope = np.polyfit(range(len(recent_months)), recent_months.values, 1)[0]
            trend_direction = "improving" if trend_slope > 0 else "declining" if trend_slope < 0 else "stable"
        else:
            trend_direction = "insufficient_data"
            trend_slope = 0
        
        return {
            "trend_direction": trend_direction,
            "velocity": float(trend_slope),
            "average_monthly_net_savings": float(recent_months.mean()) if len(recent_months) > 0 else 0,
            "savings_volatility": float(recent_months.std()) if len(recent_months) > 0 else 0
        }
    
    def _calculate_next_review_date(self, goal: GoalParameters) -> str:
        """Calculate when to next review this goal"""
        months_to_target = self.monte_carlo._calculate_months_to_target(goal.target_date)
        
        if months_to_target > 24:
            # Long-term goals: review quarterly
            review_date = datetime.now() + timedelta(days=90)
        elif months_to_target > 12:
            # Medium-term goals: review monthly
            review_date = datetime.now() + timedelta(days=30)
        else:
            # Short-term goals: review bi-weekly
            review_date = datetime.now() + timedelta(days=14)
        
        return review_date.isoformat()
    
    def _generate_action_items(
        self, 
        simulation_result: SimulationResult, 
        trend_analysis: Dict[str, Any]
    ) -> List[Dict[str, str]]:
        """Generate specific action items based on analysis"""
        action_items = []
        
        # Convert simulation recommendations to action items
        for rec in simulation_result.recommendations:
            action_items.append({
                "type": "optimization",
                "priority": "high" if simulation_result.success_probability < 0.5 else "medium",
                "description": rec,
                "due_date": (datetime.now() + timedelta(days=30)).isoformat()
            })
        
        # Add trend-based action items
        if trend_analysis.get("trend_direction") == "declining":
            action_items.append({
                "type": "budget_review",
                "priority": "high",
                "description": "Declining savings trend detected. Review budget and reduce expenses.",
                "due_date": (datetime.now() + timedelta(days=7)).isoformat()
            })
        
        return action_items