"""
Goal Achievement Calculator Service
Provides comprehensive financial mathematics for goal planning including:
- Time value of money calculations
- Compound interest and investment growth projections
- Inflation adjustments
- Tax impact modeling
- Dynamic goal optimization
"""

import math
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
from enum import Enum
import numpy as np
import logging

logger = logging.getLogger(__name__)


class AccountType(Enum):
    """Types of accounts with different tax treatments"""
    TAXABLE = "taxable"
    TAX_DEFERRED = "tax_deferred"  # 401k, Traditional IRA
    TAX_FREE = "tax_free"          # Roth IRA, HSA
    EMERGENCY = "emergency"        # High-yield savings


class TaxBracket(Enum):
    """Kenya KRA tax brackets (simplified)"""
    BRACKET_10 = 0.10  # 0 - 288K
    BRACKET_25 = 0.25  # 288K - 388K
    BRACKET_30 = 0.30  # 388K+


@dataclass
class TaxAssumptions:
    """Tax assumptions for calculations"""
    current_tax_rate: float = 0.25
    retirement_tax_rate: float = 0.20
    capital_gains_rate: float = 0.05
    inflation_rate: float = 0.03


@dataclass
class GoalCalculation:
    """Result of goal achievement calculation"""
    goal_name: str
    target_amount: float
    target_amount_real: float  # Inflation-adjusted
    current_progress: float
    monthly_payment_required: float
    monthly_payment_current: float
    success_probability: float
    time_to_goal_months: int
    projected_final_value: float
    shortfall_amount: float
    excess_amount: float
    recommendations: List[str]


class CompoundGrowthCalculator:
    """
    Handles all compound growth and time value of money calculations.
    Implements CFA-standard financial mathematics.
    """
    
    def __init__(self, tax_assumptions: Optional[TaxAssumptions] = None):
        self.tax_assumptions = tax_assumptions or TaxAssumptions()
    
    def future_value_annuity(
        self,
        payment: float,
        rate: float,
        periods: int,
        present_value: float = 0,
        compounding_frequency: int = 12
    ) -> float:
        """
        Calculate future value of an ordinary annuity with present value.
        
        Args:
            payment: Regular payment amount
            rate: Annual interest rate (as decimal)
            periods: Number of payments
            present_value: Initial amount invested
            compounding_frequency: Compounding periods per year
            
        Returns:
            Future value of the annuity plus present value growth
        """
        if rate == 0:
            return present_value + (payment * periods)
        
        # Adjust rate for compounding frequency
        periodic_rate = rate / compounding_frequency
        
        # Future value of present amount
        fv_present = present_value * ((1 + periodic_rate) ** periods)
        
        # Future value of annuity payments
        if periodic_rate == 0:
            fv_annuity = payment * periods
        else:
            fv_annuity = payment * (((1 + periodic_rate) ** periods - 1) / periodic_rate)
        
        return fv_present + fv_annuity
    
    def present_value_annuity(
        self,
        payment: float,
        rate: float,
        periods: int,
        future_value: float = 0,
        compounding_frequency: int = 12
    ) -> float:
        """
        Calculate present value of an annuity with future value.
        
        Args:
            payment: Regular payment amount
            rate: Annual interest rate (as decimal)
            periods: Number of payments
            future_value: Final target amount
            compounding_frequency: Compounding periods per year
            
        Returns:
            Present value of the annuity
        """
        if rate == 0:
            return future_value - (payment * periods)
        
        periodic_rate = rate / compounding_frequency
        
        # Present value of future amount
        pv_future = future_value / ((1 + periodic_rate) ** periods)
        
        # Present value of annuity payments
        if periodic_rate == 0:
            pv_annuity = payment * periods
        else:
            pv_annuity = payment * ((1 - (1 + periodic_rate) ** -periods) / periodic_rate)
        
        return pv_future + pv_annuity
    
    def payment_required(
        self,
        future_value: float,
        present_value: float,
        rate: float,
        periods: int,
        compounding_frequency: int = 12
    ) -> float:
        """
        Calculate payment required to reach future value goal.
        
        Args:
            future_value: Target amount
            present_value: Current amount invested
            rate: Annual interest rate (as decimal)
            periods: Number of payments
            compounding_frequency: Compounding periods per year
            
        Returns:
            Required payment amount per period
        """
        if periods <= 0:
            return future_value - present_value
        
        if rate == 0:
            return (future_value - present_value) / periods
        
        periodic_rate = rate / compounding_frequency
        
        # Future value of present amount
        fv_present = present_value * ((1 + periodic_rate) ** periods)
        
        # Required future value from payments
        fv_needed = future_value - fv_present
        
        if fv_needed <= 0:
            return 0  # Goal already achieved with current amount
        
        # Calculate required payment
        if periodic_rate == 0:
            return fv_needed / periods
        
        payment = fv_needed / (((1 + periodic_rate) ** periods - 1) / periodic_rate)
        return max(0, payment)
    
    def real_return_rate(
        self,
        nominal_rate: float,
        inflation_rate: float
    ) -> float:
        """
        Calculate real return rate adjusted for inflation.
        
        Args:
            nominal_rate: Nominal annual return rate
            inflation_rate: Annual inflation rate
            
        Returns:
            Real return rate (Fisher equation)
        """
        return (1 + nominal_rate) / (1 + inflation_rate) - 1
    
    def after_tax_return(
        self,
        pre_tax_return: float,
        tax_rate: float,
        account_type: AccountType
    ) -> float:
        """
        Calculate after-tax return based on account type.
        
        Args:
            pre_tax_return: Pre-tax return rate
            tax_rate: Applicable tax rate
            account_type: Type of account for tax treatment
            
        Returns:
            After-tax return rate
        """
        if account_type == AccountType.TAX_FREE:
            return pre_tax_return
        elif account_type == AccountType.TAX_DEFERRED:
            # Tax deferred - full growth, tax on withdrawal
            return pre_tax_return
        elif account_type == AccountType.EMERGENCY:
            # Emergency fund - taxed as regular income
            return pre_tax_return * (1 - tax_rate)
        else:  # TAXABLE
            # Assume mix of capital gains and dividends
            capital_gains_rate = self.tax_assumptions.capital_gains_rate
            dividend_rate = tax_rate
            
            # Assume 70% capital gains, 30% dividends
            effective_tax_rate = (0.7 * capital_gains_rate) + (0.3 * dividend_rate)
            return pre_tax_return * (1 - effective_tax_rate)
    
    def compound_annual_growth_rate(
        self,
        beginning_value: float,
        ending_value: float,
        periods: float
    ) -> float:
        """
        Calculate compound annual growth rate (CAGR).
        
        Args:
            beginning_value: Starting value
            ending_value: Ending value
            periods: Number of years
            
        Returns:
            CAGR as decimal
        """
        if beginning_value <= 0 or ending_value <= 0 or periods <= 0:
            return 0
        
        return (ending_value / beginning_value) ** (1 / periods) - 1
    
    def monte_carlo_projection(
        self,
        initial_amount: float,
        monthly_contribution: float,
        years: int,
        expected_return: float,
        volatility: float,
        simulations: int = 1000
    ) -> Dict[str, float]:
        """
        Run Monte Carlo simulation for investment projection.
        
        Args:
            initial_amount: Starting investment amount
            monthly_contribution: Monthly contribution
            years: Investment period in years
            expected_return: Expected annual return
            volatility: Annual volatility (standard deviation)
            simulations: Number of simulation runs
            
        Returns:
            Dictionary with statistical results
        """
        months = years * 12
        dt = 1/12  # Monthly time step
        
        # Generate random returns
        monthly_returns = np.random.normal(
            expected_return * dt,
            volatility * math.sqrt(dt),
            (simulations, months)
        )
        
        final_values = []
        
        for sim in range(simulations):
            value = initial_amount
            for month in range(months):
                # Apply return
                value *= (1 + monthly_returns[sim, month])
                # Add monthly contribution
                value += monthly_contribution
            final_values.append(value)
        
        final_values = np.array(final_values)
        
        return {
            "mean": float(np.mean(final_values)),
            "median": float(np.median(final_values)),
            "std": float(np.std(final_values)),
            "percentile_10": float(np.percentile(final_values, 10)),
            "percentile_25": float(np.percentile(final_values, 25)),
            "percentile_75": float(np.percentile(final_values, 75)),
            "percentile_90": float(np.percentile(final_values, 90)),
            "min": float(np.min(final_values)),
            "max": float(np.max(final_values))
        }


class GoalOptimizer:
    """
    Optimizes financial goal strategies including dynamic adjustments,
    tax optimization, and multi-goal allocation.
    """
    
    def __init__(self):
        self.calculator = CompoundGrowthCalculator()
    
    def optimize_goal_strategy(
        self,
        goal_name: str,
        target_amount: float,
        current_amount: float,
        target_date: datetime,
        available_monthly: float,
        risk_tolerance: float = 0.5,
        account_types: Optional[List[AccountType]] = None,
        cfa_priority_scoring: bool = True
    ) -> GoalCalculation:
        """
        Optimize strategy for achieving a financial goal.
        
        Args:
            goal_name: Name of the goal
            target_amount: Target amount needed
            current_amount: Current progress toward goal
            target_date: Target achievement date
            available_monthly: Available monthly contribution
            risk_tolerance: Risk tolerance (0-1 scale)
            account_types: Available account types for optimization
            
        Returns:
            GoalCalculation with optimized strategy
        """
        if account_types is None:
            account_types = [AccountType.TAXABLE]
        
        # Calculate time to goal
        today = datetime.now()
        time_delta = target_date - today
        months_to_goal = max(1, int(time_delta.days / 30.44))
        years_to_goal = months_to_goal / 12
        
        # Determine optimal asset allocation based on time horizon and risk tolerance
        expected_return, volatility = self._determine_asset_allocation(
            years_to_goal, risk_tolerance
        )
        
        # Adjust for inflation
        real_return = self.calculator.real_return_rate(
            expected_return, self.calculator.tax_assumptions.inflation_rate
        )
        target_amount_real = target_amount * (
            1 + self.calculator.tax_assumptions.inflation_rate
        ) ** years_to_goal
        
        # Find optimal account type
        best_account_type = self._optimize_account_selection(
            account_types, expected_return, years_to_goal
        )
        
        # Calculate after-tax return
        after_tax_return = self.calculator.after_tax_return(
            expected_return,
            self.calculator.tax_assumptions.current_tax_rate,
            best_account_type
        )
        
        # Calculate required monthly payment
        monthly_required = self.calculator.payment_required(
            target_amount_real,
            current_amount,
            after_tax_return,
            months_to_goal
        )
        
        # Run Monte Carlo simulation for success probability
        mc_results = self.calculator.monte_carlo_projection(
            current_amount,
            available_monthly,
            years_to_goal,
            after_tax_return,
            volatility
        )
        
        # Calculate success probability
        success_probability = self._calculate_success_probability(
            mc_results, target_amount_real
        )
        
        # Calculate projected final value with current contributions
        projected_final = self.calculator.future_value_annuity(
            available_monthly,
            after_tax_return,
            months_to_goal,
            current_amount
        )
        
        # Calculate shortfall or excess
        shortfall_amount = max(0, target_amount_real - projected_final)
        excess_amount = max(0, projected_final - target_amount_real)
        
        # Generate recommendations
        recommendations = self._generate_optimization_recommendations(
            monthly_required,
            available_monthly,
            success_probability,
            years_to_goal,
            best_account_type,
            shortfall_amount,
            excess_amount
        )
        
        return GoalCalculation(
            goal_name=goal_name,
            target_amount=target_amount,
            target_amount_real=target_amount_real,
            current_progress=current_amount,
            monthly_payment_required=monthly_required,
            monthly_payment_current=available_monthly,
            success_probability=success_probability,
            time_to_goal_months=months_to_goal,
            projected_final_value=projected_final,
            shortfall_amount=shortfall_amount,
            excess_amount=excess_amount,
            recommendations=recommendations
        )
    
    def optimize_multi_goal_allocation(
        self,
        goals: List[Dict[str, Any]],
        total_monthly_budget: float
    ) -> Dict[str, Any]:
        """
        Optimize allocation across multiple goals using modern portfolio theory principles.
        
        Args:
            goals: List of goal dictionaries with parameters
            total_monthly_budget: Total available monthly allocation
            
        Returns:
            Optimized allocation strategy
        """
        # Calculate individual goal requirements
        goal_calculations = []
        for goal_data in goals:
            goal_calc = self.optimize_goal_strategy(
                goal_name=goal_data["name"],
                target_amount=float(goal_data["target_amount"]),
                current_amount=float(goal_data.get("current_amount", 0)),
                target_date=datetime.fromisoformat(goal_data["target_date"]),
                available_monthly=float(goal_data.get("current_monthly", 0)),
                risk_tolerance=float(goal_data.get("risk_tolerance", 0.5))
            )
            goal_calculations.append(goal_calc)
        
        # Calculate total required monthly contributions
        total_required = sum(calc.monthly_payment_required for calc in goal_calculations)
        
        # Optimization strategies
        if total_required <= total_monthly_budget:
            # Sufficient budget - optimize for excess allocation
            allocation = self._allocate_excess_budget(
                goal_calculations, total_monthly_budget
            )
        else:
            # Insufficient budget - optimize priorities
            allocation = self._allocate_constrained_budget(
                goal_calculations, total_monthly_budget
            )
        
        return {
            "goal_calculations": [calc.__dict__ for calc in goal_calculations],
            "optimal_allocation": allocation,
            "total_required": total_required,
            "total_available": total_monthly_budget,
            "budget_deficit": max(0, total_required - total_monthly_budget),
            "budget_surplus": max(0, total_monthly_budget - total_required),
            "portfolio_success_probability": self._calculate_portfolio_success(goal_calculations),
            "rebalancing_recommendations": self._generate_rebalancing_recommendations(allocation)
        }
    
    def _determine_asset_allocation(
        self,
        years_to_goal: float,
        risk_tolerance: float
    ) -> Tuple[float, float]:
        """
        Determine optimal asset allocation based on time horizon and risk tolerance.
        
        Returns:
            Tuple of (expected_return, volatility)
        """
        # Conservative allocation for short-term goals
        if years_to_goal < 2:
            return 0.04, 0.08  # 4% return, 8% volatility (high-yield savings/bonds)
        
        # Medium-term balanced approach
        elif years_to_goal < 7:
            equity_allocation = min(0.6, 0.3 + (risk_tolerance * 0.4))
            bond_allocation = 1 - equity_allocation
            
            equity_return, equity_vol = 0.10, 0.18
            bond_return, bond_vol = 0.05, 0.06
            
            expected_return = (equity_allocation * equity_return) + (bond_allocation * bond_return)
            volatility = math.sqrt(
                (equity_allocation ** 2 * equity_vol ** 2) +
                (bond_allocation ** 2 * bond_vol ** 2) +
                (2 * equity_allocation * bond_allocation * equity_vol * bond_vol * 0.2)  # 0.2 correlation
            )
            
            return expected_return, volatility
        
        # Long-term aggressive growth approach
        else:
            equity_allocation = min(0.9, 0.5 + (risk_tolerance * 0.4))
            bond_allocation = 1 - equity_allocation
            
            equity_return, equity_vol = 0.10, 0.18
            bond_return, bond_vol = 0.05, 0.06
            
            expected_return = (equity_allocation * equity_return) + (bond_allocation * bond_return)
            volatility = math.sqrt(
                (equity_allocation ** 2 * equity_vol ** 2) +
                (bond_allocation ** 2 * bond_vol ** 2) +
                (2 * equity_allocation * bond_allocation * equity_vol * bond_vol * 0.2)
            )
            
            return expected_return, volatility
    
    def _optimize_account_selection(
        self,
        available_accounts: List[AccountType],
        expected_return: float,
        years_to_goal: float
    ) -> AccountType:
        """
        Select optimal account type based on tax efficiency.
        
        Returns:
            Optimal AccountType
        """
        if not available_accounts:
            return AccountType.TAXABLE
        
        # For emergency funds, always use emergency account
        if AccountType.EMERGENCY in available_accounts and years_to_goal < 1:
            return AccountType.EMERGENCY
        
        # For long-term goals, prioritize tax-advantaged accounts
        if years_to_goal > 5:
            if AccountType.TAX_FREE in available_accounts:
                return AccountType.TAX_FREE
            elif AccountType.TAX_DEFERRED in available_accounts:
                return AccountType.TAX_DEFERRED
        
        # Default to taxable account
        return AccountType.TAXABLE if AccountType.TAXABLE in available_accounts else available_accounts[0]
    
    def _calculate_success_probability(
        self,
        mc_results: Dict[str, float],
        target_amount: float
    ) -> float:
        """
        Calculate probability of achieving goal based on Monte Carlo results.
        Approximates from percentile data.
        """
        # Approximate probability using normal distribution
        mean = mc_results["mean"]
        std = mc_results["std"]
        
        if std == 0:
            return 1.0 if mean >= target_amount else 0.0
        
        # Calculate z-score
        z_score = (target_amount - mean) / std
        
        # Approximate probability using percentiles
        if z_score <= -1.28:  # Below 10th percentile
            return 0.9
        elif z_score <= -0.67:  # Below 25th percentile
            return 0.75
        elif z_score <= 0:  # Below median
            return 0.5
        elif z_score <= 0.67:  # Below 75th percentile
            return 0.25
        elif z_score <= 1.28:  # Below 90th percentile
            return 0.1
        else:
            return 0.05
    
    def _generate_optimization_recommendations(
        self,
        monthly_required: float,
        monthly_available: float,
        success_probability: float,
        years_to_goal: float,
        account_type: AccountType,
        shortfall_amount: float,
        excess_amount: float
    ) -> List[str]:
        """Generate specific optimization recommendations"""
        recommendations = []
        
        # Contribution recommendations
        if monthly_required > monthly_available:
            gap = monthly_required - monthly_available
            recommendations.append(
                f"Increase monthly contributions by KES {gap:,.0f} to meet goal on time."
            )
        elif excess_amount > 0:
            recommendations.append(
                f"Current plan exceeds goal by KES {excess_amount:,.0f}. "
                f"Consider reducing contributions or advancing timeline."
            )
        
        # Success probability recommendations
        if success_probability < 0.6:
            recommendations.append(
                f"Low success probability ({success_probability:.1%}). "
                f"Consider extending timeline or increasing contributions."
            )
        elif success_probability > 0.9 and excess_amount > shortfall_amount:
            recommendations.append(
                f"Very high success probability. Consider reducing risk or "
                f"reallocating funds to other goals."
            )
        
        # Account type recommendations
        if account_type == AccountType.TAXABLE and years_to_goal > 5:
            recommendations.append(
                "Consider using tax-advantaged accounts (retirement accounts) "
                "for better tax efficiency on long-term goals."
            )
        
        # Time horizon recommendations
        if years_to_goal < 2 and success_probability < 0.8:
            recommendations.append(
                "Short timeline increases risk. Consider extending target date "
                "or using conservative investments."
            )
        
        return recommendations
    
    def _allocate_excess_budget(
        self,
        goal_calculations: List[GoalCalculation],
        total_budget: float
    ) -> Dict[str, float]:
        """Allocate excess budget optimally across goals"""
        total_required = sum(calc.monthly_payment_required for calc in goal_calculations)
        excess_budget = total_budget - total_required
        
        allocation = {}
        
        # Start with required amounts
        for calc in goal_calculations:
            allocation[calc.goal_name] = calc.monthly_payment_required
        
        # Allocate excess based on goal priority and marginal utility
        remaining_excess = excess_budget
        
        # Simple priority-based allocation (can be enhanced with utility optimization)
        for calc in sorted(goal_calculations, key=lambda x: x.success_probability):
            if remaining_excess <= 0:
                break
            
            # Allocate up to 50% of remaining excess to low-probability goals
            additional_allocation = min(remaining_excess * 0.5, remaining_excess)
            allocation[calc.goal_name] += additional_allocation
            remaining_excess -= additional_allocation
        
        return allocation
    
    def _allocate_constrained_budget(
        self,
        goal_calculations: List[GoalCalculation],
        total_budget: float
    ) -> Dict[str, float]:
        """Allocate constrained budget using priority optimization"""
        # Sort by priority (assuming lower time to goal = higher priority)
        sorted_goals = sorted(goal_calculations, key=lambda x: x.time_to_goal_months)
        
        allocation = {}
        remaining_budget = total_budget
        
        # Allocate minimum viable amounts first
        for calc in sorted_goals:
            if remaining_budget <= 0:
                allocation[calc.goal_name] = 0
                continue
            
            # Calculate minimum viable contribution (50% of required)
            min_contribution = min(
                calc.monthly_payment_required * 0.5,
                remaining_budget
            )
            
            allocation[calc.goal_name] = min_contribution
            remaining_budget -= min_contribution
        
        # Allocate remaining budget proportionally to requirements
        if remaining_budget > 0:
            total_remaining_requirement = sum(
                max(0, calc.monthly_payment_required - allocation.get(calc.goal_name, 0))
                for calc in goal_calculations
            )
            
            if total_remaining_requirement > 0:
                for calc in goal_calculations:
                    remaining_req = max(0, calc.monthly_payment_required - allocation[calc.goal_name])
                    if remaining_req > 0:
                        proportion = remaining_req / total_remaining_requirement
                        additional = min(proportion * remaining_budget, remaining_req)
                        allocation[calc.goal_name] += additional
                        remaining_budget -= additional
        
        return allocation
    
    def _calculate_portfolio_success(
        self,
        goal_calculations: List[GoalCalculation]
    ) -> float:
        """Calculate overall portfolio success probability"""
        if not goal_calculations:
            return 0.0
        
        # Weighted average by target amount (larger goals matter more)
        total_target = sum(calc.target_amount for calc in goal_calculations)
        
        if total_target == 0:
            return 0.0
        
        weighted_probability = sum(
            calc.success_probability * (calc.target_amount / total_target)
            for calc in goal_calculations
        )
        
        return weighted_probability
    
    def _generate_rebalancing_recommendations(
        self,
        allocation: Dict[str, float]
    ) -> List[str]:
        """Generate recommendations for rebalancing allocations"""
        recommendations = []
        
        # Check for goals with zero allocation
        zero_allocation_goals = [name for name, amount in allocation.items() if amount == 0]
        if zero_allocation_goals:
            recommendations.append(
                f"Goals with no allocation: {', '.join(zero_allocation_goals)}. "
                f"Consider extending timelines or increasing total budget."
            )
        
        # Check for highly concentrated allocations
        total_allocation = sum(allocation.values())
        if total_allocation > 0:
            max_allocation_pct = max(allocation.values()) / total_allocation
            if max_allocation_pct > 0.7:
                recommendations.append(
                    "High concentration in single goal detected. "
                    "Consider more balanced allocation for risk management."
                )
        
        return recommendations
    
    def assess_goal_feasibility_cfa(
        self,
        goals: List[Dict[str, Any]],
        monthly_surplus: float,
        income: float
    ) -> Dict[str, Any]:
        """
        CFA-compliant goal feasibility assessment.
        
        Args:
            goals: List of financial goals with targets and timelines
            monthly_surplus: Available monthly surplus after expenses
            income: Monthly income for ratio calculations
            
        Returns:
            CFA-compliant feasibility analysis with recommendations
        """
        total_required = 0
        feasibility_scores = []
        
        for goal in goals:
            target_amount = float(goal.get("target_amount", 0))
            timeline_years = float(goal.get("timeline_years", 1))
            goal_type = goal.get("type", "general")
            
            # CFA-standard required monthly contribution
            monthly_required = self.calculator.payment_required(
                future_value=target_amount,
                present_value=float(goal.get("current_amount", 0)),
                rate=self._get_cfa_expected_return(goal_type, timeline_years),
                periods=int(timeline_years * 12)
            )
            
            total_required += monthly_required
            
            # CFA Priority Scoring (Higher score = higher priority)
            priority_score = self._calculate_cfa_priority_score(
                goal_type=goal_type,
                timeline_years=timeline_years,
                monthly_required=monthly_required,
                income=income
            )
            
            feasibility_scores.append({
                "goal_name": goal.get("name", "Unknown"),
                "goal_type": goal_type,
                "monthly_required": monthly_required,
                "priority_score": priority_score,
                "feasibility_ratio": monthly_required / max(monthly_surplus, 1),
                "cfa_recommendation": self._get_cfa_goal_recommendation(
                    goal_type, timeline_years, monthly_required, monthly_surplus
                )
            })
        
        # Calculate overall feasibility
        feasibility_ratio = total_required / max(monthly_surplus, 1)
        
        # CFA-compliant optimization recommendations
        optimization_strategy = self._generate_cfa_optimization_strategy(
            feasibility_scores, monthly_surplus, feasibility_ratio
        )
        
        return {
            "total_monthly_required": total_required,
            "available_monthly_surplus": monthly_surplus,
            "feasibility_ratio": feasibility_ratio,
            "feasibility_status": self._get_feasibility_status(feasibility_ratio),
            "goal_analysis": sorted(feasibility_scores, key=lambda x: x["priority_score"], reverse=True),
            "cfa_optimization_strategy": optimization_strategy,
            "budget_treatment": {
                "surplus_calculation": "Income - Expenses (goals tracked separately)",
                "goal_allocation_method": "Priority-based optimization with timeline flexibility",
                "cfa_compliance": True
            }
        }
    
    def _calculate_cfa_priority_score(
        self,
        goal_type: str,
        timeline_years: float,
        monthly_required: float,
        income: float
    ) -> float:
        """
        Calculate CFA-compliant priority score for goals.
        
        CFA Priority Framework:
        1. Liquidity needs (emergency fund) - Highest priority
        2. Insurance/Risk management - High priority  
        3. Retirement adequacy - High priority (but flexible timeline)
        4. Children's education - Medium priority
        5. Discretionary goals - Lower priority
        """
        base_scores = {
            "emergency_fund": 100,
            "insurance": 90,
            "retirement": 85,
            "education": 70,
            "investment": 60,
            "housing": 75,
            "discretionary": 40
        }
        
        base_score = base_scores.get(goal_type, 50)
        
        # Timeline urgency adjustment (CFA methodology)
        if timeline_years <= 2:
            urgency_multiplier = 1.3  # High urgency
        elif timeline_years <= 5:
            urgency_multiplier = 1.1  # Medium urgency
        else:
            urgency_multiplier = 0.9  # Lower urgency (more flexibility)
        
        # Affordability adjustment (CFA best practice)
        affordability_ratio = monthly_required / income
        if affordability_ratio > 0.3:  # More than 30% of income
            affordability_penalty = 0.7
        elif affordability_ratio > 0.2:  # 20-30% of income
            affordability_penalty = 0.85
        else:
            affordability_penalty = 1.0  # Affordable
        
        return base_score * urgency_multiplier * affordability_penalty
    
    def _get_cfa_expected_return(self, goal_type: str, timeline_years: float) -> float:
        """Get CFA-appropriate expected return based on goal type and timeline."""
        if timeline_years <= 2:
            return 0.04  # Conservative for short-term goals
        elif timeline_years <= 7:
            return 0.07  # Moderate for medium-term goals
        else:
            return 0.09  # Growth-oriented for long-term goals
    
    def _get_cfa_goal_recommendation(
        self,
        goal_type: str,
        timeline_years: float,
        monthly_required: float,
        monthly_surplus: float
    ) -> str:
        """Generate CFA-compliant goal recommendation."""
        affordability = monthly_required / max(monthly_surplus, 1)
        
        if affordability <= 1.0:
            return f"Goal is achievable within current budget. Allocate {monthly_required:,.0f} KES monthly."
        
        if goal_type == "emergency_fund":
            return f"Emergency fund is critical - consider extending timeline or reducing target. Current requirement: {monthly_required:,.0f} KES."
        
        if timeline_years > 5:
            return f"Consider extending timeline by {(affordability - 1) * timeline_years:.1f} years to make goal achievable."
        
        return f"Goal requires {affordability:.1f}x available surplus. Recommend timeline extension or target reduction."
    
    def _generate_cfa_optimization_strategy(
        self,
        feasibility_scores: List[Dict],
        monthly_surplus: float,
        feasibility_ratio: float
    ) -> Dict[str, Any]:
        """Generate CFA-compliant optimization strategy."""
        if feasibility_ratio <= 1.0:
            return {
                "strategy": "ACHIEVABLE_WITH_OPTIMIZATION",
                "approach": "Allocate based on CFA priority scoring",
                "recommendations": [
                    "Fund highest priority goals first",
                    "Optimize remaining surplus across lower priority goals",
                    "Consider tax-advantaged accounts for long-term goals"
                ]
            }
        
        return {
            "strategy": "REQUIRES_OPTIMIZATION",
            "approach": "Dynamic goal adjustment with timeline flexibility",
            "recommendations": [
                f"Total goals exceed surplus by {(feasibility_ratio - 1) * 100:.0f}%",
                "Prioritize liquidity and risk management goals",
                "Extend timelines for discretionary goals",
                "Consider income optimization strategies",
                "Review and reduce lower-priority goal targets"
            ]
        }
    
    def _get_feasibility_status(self, ratio: float) -> str:
        """Get CFA-compliant feasibility status."""
        if ratio <= 0.8:
            return "HIGHLY_ACHIEVABLE"
        elif ratio <= 1.0:
            return "ACHIEVABLE_WITH_DISCIPLINE" 
        elif ratio <= 1.5:
            return "REQUIRES_OPTIMIZATION"
        else:
            return "REQUIRES_SIGNIFICANT_ADJUSTMENT"


# Factory function for easy service instantiation
def create_goal_calculator(tax_assumptions: Optional[TaxAssumptions] = None) -> GoalOptimizer:
    """
    Factory function to create a GoalOptimizer instance with optional tax assumptions.
    
    Args:
        tax_assumptions: Custom tax assumptions (uses defaults if None)
        
    Returns:
        Configured GoalOptimizer instance
    """
    optimizer = GoalOptimizer()
    if tax_assumptions:
        optimizer.calculator.tax_assumptions = tax_assumptions
    
    return optimizer