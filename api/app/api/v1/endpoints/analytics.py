"""
Analytics API Endpoints
Provides comprehensive predictive analytics and goal modeling endpoints
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from app.core.database import get_db
from app.models import User, Goal, Account, Transaction
from app.security import get_current_user
from app.services.analytics_engine import (
    MonteCarloEngine, 
    PredictiveAnalytics, 
    GoalParameters, 
    GoalType, 
    RiskLevel,
    MarketAssumptions
)
from app.services.goal_calculator import (
    GoalOptimizer,
    AccountType,
    TaxAssumptions,
    create_goal_calculator
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


# Pydantic models for API requests/responses
class MarketAssumptionsRequest(BaseModel):
    """Market assumptions for Monte Carlo simulations"""
    mean_return: float = Field(default=0.07, ge=0, le=1, description="Expected annual return")
    volatility: float = Field(default=0.15, ge=0, le=2, description="Annual volatility")
    inflation_rate: float = Field(default=0.03, ge=0, le=0.2, description="Annual inflation rate")
    risk_free_rate: float = Field(default=0.02, ge=0, le=0.1, description="Risk-free rate")


class GoalAnalysisRequest(BaseModel):
    """Request for individual goal analysis"""
    goal_id: int = Field(description="Database ID of the goal to analyze")
    market_assumptions: Optional[MarketAssumptionsRequest] = None
    custom_contribution: Optional[float] = Field(None, description="Override monthly contribution")
    risk_level: Optional[str] = Field("moderate", description="Risk level: conservative, moderate, aggressive")


class PortfolioAnalysisRequest(BaseModel):
    """Request for portfolio-wide analysis"""
    goal_ids: List[int] = Field(description="List of goal IDs to analyze")
    total_monthly_budget: float = Field(description="Total monthly budget for all goals")
    market_assumptions: Optional[MarketAssumptionsRequest] = None


class GoalOptimizationRequest(BaseModel):
    """Request for goal optimization"""
    goal_name: str = Field(description="Name of the goal")
    target_amount: float = Field(description="Target amount needed")
    current_amount: float = Field(description="Current progress")
    target_date: str = Field(description="Target date (ISO format)")
    available_monthly: float = Field(description="Available monthly contribution")
    risk_tolerance: float = Field(default=0.5, ge=0, le=1, description="Risk tolerance (0-1)")


class TrendAnalysisResponse(BaseModel):
    """Response for trend analysis"""
    goal_id: int
    current_progress: Dict[str, float]
    trajectory_analysis: Dict[str, Any]
    success_probability: float
    recommendations: List[str]
    next_review_date: str


class SimulationResponse(BaseModel):
    """Response for Monte Carlo simulation"""
    goal_id: int
    success_probability: float
    confidence_intervals: Dict[str, float]
    projected_values: Dict[str, float]
    risk_metrics: Dict[str, float]
    scenario_analysis: Dict[str, Any]
    recommendations: List[str]


@router.get("/health")
async def analytics_health_check():
    """Health check endpoint for analytics service"""
    return {
        "status": "healthy",
        "service": "predictive_analytics",
        "timestamp": datetime.utcnow().isoformat(),
        "version": "1.0.0"
    }


@router.post("/goals/{goal_id}/analyze", response_model=TrendAnalysisResponse)
async def analyze_goal_trajectory(
    goal_id: int,
    request: GoalAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze individual goal trajectory using real account data and predictive modeling.
    
    Provides:
    - Real progress calculation from account balances
    - Monte Carlo simulation for success probability
    - Trend analysis from transaction history
    - Actionable recommendations
    """
    # Fetch goal from database
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    try:
        # Get user's account balances
        accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
        account_balances = {
            f"{account.type}_{account.institution_name}": account.balance 
            for account in accounts
        }
        
        # Get transaction history (last 12 months)
        cutoff_date = datetime.now() - timedelta(days=365)
        transactions = db.query(Transaction).filter(
            Transaction.user_id == current_user.id,
            Transaction.date >= cutoff_date
        ).all()
        
        transaction_history = [
            {
                "date": tx.date.isoformat() if tx.date else datetime.now().isoformat(),
                "description": tx.description or "",
                "amount": tx.amount or 0,
                "transaction_type": tx.transaction_type or "debit",
                "category": tx.category or ""
            }
            for tx in transactions
        ]
        
        # Create goal data dictionary
        goal_data = {
            "name": goal.name,
            "target": goal.target,
            "current": goal.current,
            "target_date": goal.target_date
        }
        
        # Initialize predictive analytics
        analytics = PredictiveAnalytics()
        
        # Run trajectory analysis
        result = analytics.analyze_goal_trajectory(
            goal_data=goal_data,
            account_balances=account_balances,
            transaction_history=transaction_history
        )
        
        return TrendAnalysisResponse(
            goal_id=goal_id,
            current_progress=result["current_progress"],
            trajectory_analysis={
                "contribution_analysis": result["contribution_analysis"],
                "trend_analysis": result["trend_analysis"],
                "simulation_results": result["simulation_results"]
            },
            success_probability=result["simulation_results"]["success_probability"],
            recommendations=[rec["description"] for rec in result.get("action_items", [])],
            next_review_date=result.get("next_review_date", 
                                       (datetime.now() + timedelta(days=30)).isoformat())
        )
        
    except Exception as e:
        logger.error(f"Error analyzing goal {goal_id}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error analyzing goal trajectory: {str(e)}"
        )


@router.post("/goals/{goal_id}/simulate", response_model=SimulationResponse)
async def run_monte_carlo_simulation(
    goal_id: int,
    request: GoalAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Run Monte Carlo simulation for specific goal achievement probability.
    
    Provides:
    - 10,000+ scenario simulations
    - Confidence intervals and risk metrics
    - Scenario analysis (market crash, job loss, etc.)
    - Optimization recommendations
    """
    # Fetch goal from database
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    try:
        # Parse goal data
        target_amount = float(goal.target) if goal.target else 0
        current_amount = float(goal.current) if goal.current else 0
        target_date = datetime.fromisoformat(goal.target_date) if goal.target_date else datetime.now() + timedelta(days=365)
        
        # Determine monthly contribution
        monthly_contribution = request.custom_contribution
        if not monthly_contribution:
            # Calculate from recent transactions or use default
            monthly_contribution = target_amount * 0.01  # 1% of target as default
        
        # Map risk level
        risk_level_map = {
            "conservative": RiskLevel.CONSERVATIVE,
            "moderate": RiskLevel.MODERATE,
            "aggressive": RiskLevel.AGGRESSIVE
        }
        risk_level = risk_level_map.get(request.risk_level, RiskLevel.MODERATE)
        
        # Map goal type
        goal_name_lower = goal.name.lower()
        if "emergency" in goal_name_lower:
            goal_type = GoalType.EMERGENCY_FUND
        elif "retirement" in goal_name_lower:
            goal_type = GoalType.RETIREMENT
        elif "education" in goal_name_lower:
            goal_type = GoalType.EDUCATION
        elif "home" in goal_name_lower or "house" in goal_name_lower:
            goal_type = GoalType.HOME_PURCHASE
        else:
            goal_type = GoalType.INVESTMENT
        
        # Create goal parameters
        goal_params = GoalParameters(
            name=goal.name,
            target_amount=target_amount,
            current_amount=current_amount,
            monthly_contribution=monthly_contribution,
            target_date=target_date,
            goal_type=goal_type,
            risk_level=risk_level,
            priority=1
        )
        
        # Create market assumptions
        market_assumptions = None
        if request.market_assumptions:
            market_assumptions = MarketAssumptions(
                mean_return=request.market_assumptions.mean_return,
                volatility=request.market_assumptions.volatility,
                inflation_rate=request.market_assumptions.inflation_rate,
                risk_free_rate=request.market_assumptions.risk_free_rate
            )
        
        # Run Monte Carlo simulation
        monte_carlo = MonteCarloEngine(num_simulations=10000)
        result = monte_carlo.run_goal_simulation(goal_params, market_assumptions)
        
        return SimulationResponse(
            goal_id=goal_id,
            success_probability=result.success_probability,
            confidence_intervals=result.confidence_intervals,
            projected_values=result.projected_values,
            risk_metrics=result.risk_metrics,
            scenario_analysis=result.scenario_analysis,
            recommendations=result.recommendations
        )
        
    except Exception as e:
        logger.error(f"Error running simulation for goal {goal_id}: {str(e)}")
        raise HTTPException(
            status_code=500, 
            detail=f"Error running Monte Carlo simulation: {str(e)}"
        )


@router.post("/portfolio/analyze")
async def analyze_portfolio(
    request: PortfolioAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Analyze entire portfolio of goals with budget allocation optimization.
    
    Provides:
    - Multi-goal success probability analysis
    - Budget allocation optimization
    - Portfolio-level risk assessment
    - Rebalancing recommendations
    """
    try:
        # Fetch goals from database
        goals = db.query(Goal).filter(
            Goal.id.in_(request.goal_ids),
            Goal.user_id == current_user.id
        ).all()
        
        if len(goals) != len(request.goal_ids):
            raise HTTPException(status_code=404, detail="One or more goals not found")
        
        # Convert to goal parameters
        goal_parameters = []
        for goal in goals:
            target_amount = float(goal.target) if goal.target else 0
            current_amount = float(goal.current) if goal.current else 0
            target_date = datetime.fromisoformat(goal.target_date) if goal.target_date else datetime.now() + timedelta(days=365)
            
            # Estimate monthly contribution (could be enhanced with transaction analysis)
            months_to_goal = max(1, (target_date - datetime.now()).days / 30)
            needed_amount = target_amount - current_amount
            monthly_contribution = max(0, needed_amount / months_to_goal)
            
            goal_name_lower = goal.name.lower()
            if "emergency" in goal_name_lower:
                goal_type = GoalType.EMERGENCY_FUND
            elif "retirement" in goal_name_lower:
                goal_type = GoalType.RETIREMENT
            elif "education" in goal_name_lower:
                goal_type = GoalType.EDUCATION
            elif "home" in goal_name_lower:
                goal_type = GoalType.HOME_PURCHASE
            else:
                goal_type = GoalType.INVESTMENT
            
            goal_params = GoalParameters(
                name=goal.name,
                target_amount=target_amount,
                current_amount=current_amount,
                monthly_contribution=monthly_contribution,
                target_date=target_date,
                goal_type=goal_type,
                risk_level=RiskLevel.MODERATE,
                priority=goal.id  # Use goal ID as priority for now
            )
            goal_parameters.append(goal_params)
        
        # Run portfolio analysis
        monte_carlo = MonteCarloEngine(num_simulations=10000)
        result = monte_carlo.run_portfolio_simulation(
            goals=goal_parameters,
            total_monthly_budget=request.total_monthly_budget
        )
        
        return {
            "portfolio_analysis": result,
            "total_goals": len(goals),
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing portfolio: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing portfolio: {str(e)}"
        )


@router.post("/goals/optimize")
async def optimize_goal_strategy(
    request: GoalOptimizationRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Optimize strategy for achieving a financial goal.
    
    Provides:
    - Optimal asset allocation
    - Required vs. available contribution analysis
    - Tax optimization recommendations
    - Timeline and risk adjustments
    """
    try:
        # Parse target date
        target_date = datetime.fromisoformat(request.target_date)
        
        # Create goal optimizer
        optimizer = create_goal_calculator()
        
        # Run optimization
        result = optimizer.optimize_goal_strategy(
            goal_name=request.goal_name,
            target_amount=request.target_amount,
            current_amount=request.current_amount,
            target_date=target_date,
            available_monthly=request.available_monthly,
            risk_tolerance=request.risk_tolerance
        )
        
        return {
            "optimization_result": result.__dict__,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error optimizing goal strategy: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error optimizing goal strategy: {str(e)}"
        )


@router.get("/goals/{goal_id}/projections")
async def get_goal_projections(
    goal_id: int,
    years_ahead: int = 10,
    scenario: str = "realistic",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get detailed projections for a goal over multiple years.
    
    Args:
        goal_id: ID of the goal
        years_ahead: Number of years to project
        scenario: Projection scenario (pessimistic, realistic, optimistic)
    """
    # Fetch goal from database
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    try:
        # Create goal calculator
        calculator = create_goal_calculator()
        
        # Get scenario parameters
        scenario_params = {
            "pessimistic": {"return": 0.04, "volatility": 0.20},
            "realistic": {"return": 0.07, "volatility": 0.15},
            "optimistic": {"return": 0.10, "volatility": 0.18}
        }
        
        params = scenario_params.get(scenario, scenario_params["realistic"])
        
        # Calculate projections year by year
        target_amount = float(goal.target) if goal.target else 0
        current_amount = float(goal.current) if goal.current else 0
        monthly_contribution = target_amount * 0.01  # Default 1% of target
        
        yearly_projections = []
        
        for year in range(1, years_ahead + 1):
            projected_value = calculator.calculator.future_value_annuity(
                payment=monthly_contribution,
                rate=params["return"],
                periods=year * 12,
                present_value=current_amount
            )
            
            # Run mini Monte Carlo for confidence intervals
            mc_results = calculator.calculator.monte_carlo_projection(
                initial_amount=current_amount,
                monthly_contribution=monthly_contribution,
                years=year,
                expected_return=params["return"],
                volatility=params["volatility"],
                simulations=1000
            )
            
            yearly_projections.append({
                "year": year,
                "projected_value": projected_value,
                "confidence_intervals": {
                    "10th_percentile": mc_results["percentile_10"],
                    "25th_percentile": mc_results["percentile_25"],
                    "median": mc_results["median"],
                    "75th_percentile": mc_results["percentile_75"],
                    "90th_percentile": mc_results["percentile_90"]
                },
                "progress_percentage": (projected_value / target_amount * 100) if target_amount > 0 else 0
            })
        
        return {
            "goal_id": goal_id,
            "goal_name": goal.name,
            "target_amount": target_amount,
            "scenario": scenario,
            "projections": yearly_projections,
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating projections for goal {goal_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating goal projections: {str(e)}"
        )


@router.get("/dashboard/insights")
async def get_dashboard_insights(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dashboard insights including:
    - Portfolio overview with success probabilities
    - Early warning alerts
    - Optimization opportunities
    - Next action recommendations
    """
    try:
        # Get user's goals
        goals = db.query(Goal).filter(Goal.user_id == current_user.id).all()
        
        if not goals:
            return {
                "insights": {
                    "total_goals": 0,
                    "portfolio_health": "no_goals",
                    "alerts": ["No financial goals set. Consider adding goals to track progress."],
                    "opportunities": [],
                    "next_actions": ["Set up your first financial goal"]
                },
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
        
        # Get accounts and transactions for real progress calculation
        accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
        total_assets = sum(account.balance or 0 for account in accounts)
        
        # Calculate basic portfolio metrics
        total_target = sum(float(goal.target) if goal.target else 0 for goal in goals)
        total_current = sum(float(goal.current) if goal.current else 0 for goal in goals)
        
        # Basic alerts and recommendations
        alerts = []
        opportunities = []
        next_actions = []
        
        # Check for goals with no progress
        no_progress_goals = [goal.name for goal in goals if not goal.current or float(goal.current) == 0]
        if no_progress_goals:
            alerts.append(f"No progress on goals: {', '.join(no_progress_goals)}")
            next_actions.append("Start contributing to goals with zero progress")
        
        # Check for unrealistic timelines
        short_timeline_goals = []
        for goal in goals:
            if goal.target_date:
                try:
                    target_date = datetime.fromisoformat(goal.target_date)
                    months_left = (target_date - datetime.now()).days / 30
                    target_amount = float(goal.target) if goal.target else 0
                    current_amount = float(goal.current) if goal.current else 0
                    needed_amount = target_amount - current_amount
                    
                    if months_left > 0 and needed_amount > 0:
                        required_monthly = needed_amount / months_left
                        if required_monthly > total_assets * 0.5:  # More than 50% of total assets per month
                            short_timeline_goals.append(goal.name)
                except:
                    pass
        
        if short_timeline_goals:
            alerts.append(f"Unrealistic timelines for: {', '.join(short_timeline_goals)}")
            opportunities.append("Consider extending target dates or increasing income")
        
        # Portfolio health assessment
        if total_target > 0:
            overall_progress = (total_current / total_target) * 100
            if overall_progress < 20:
                portfolio_health = "needs_attention"
            elif overall_progress < 50:
                portfolio_health = "on_track"
            else:
                portfolio_health = "excellent"
        else:
            portfolio_health = "undefined"
        
        # General opportunities
        if len(goals) == 1:
            opportunities.append("Consider diversifying with multiple financial goals")
        
        if not any("emergency" in goal.name.lower() for goal in goals):
            opportunities.append("Consider adding an emergency fund goal for financial security")
        
        return {
            "insights": {
                "total_goals": len(goals),
                "total_target_amount": total_target,
                "total_current_amount": total_current,
                "overall_progress_percentage": (total_current / total_target * 100) if total_target > 0 else 0,
                "portfolio_health": portfolio_health,
                "alerts": alerts,
                "opportunities": opportunities,
                "next_actions": next_actions if next_actions else ["Review and update your financial goals"]
            },
            "analysis_timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error generating dashboard insights: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error generating dashboard insights: {str(e)}"
        )


@router.post("/goals/{goal_id}/update-progress")
async def update_goal_progress(
    goal_id: int,
    background_tasks: BackgroundTasks,
    recalculate: bool = True,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update goal progress based on real account balances.
    Optionally recalculate projections in background.
    """
    # Fetch goal from database
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()
    
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    try:
        # Get user's account balances
        accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
        account_balances = {
            f"{account.type}_{account.institution_name}": account.balance 
            for account in accounts
        }
        
        # Calculate real progress
        analytics = PredictiveAnalytics()
        goal_data = {
            "name": goal.name,
            "target": goal.target,
            "current": goal.current
        }
        
        real_progress = analytics._calculate_real_progress(goal_data, account_balances)
        
        # Update goal in database
        goal.current = str(real_progress)
        target_amount = float(goal.target) if goal.target else 0
        goal.progress = (real_progress / target_amount * 100) if target_amount > 0 else 0
        
        db.commit()
        db.refresh(goal)
        
        # Schedule background recalculation if requested
        if recalculate:
            background_tasks.add_task(
                _recalculate_goal_projections,
                goal_id, current_user.id
            )
        
        return {
            "goal_id": goal_id,
            "updated_progress": real_progress,
            "progress_percentage": goal.progress,
            "calculation_method": "real_account_balances",
            "recalculation_scheduled": recalculate,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error updating goal progress {goal_id}: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error updating goal progress: {str(e)}"
        )


async def _recalculate_goal_projections(goal_id: int, user_id: int):
    """Background task to recalculate goal projections"""
    try:
        logger.info(f"Recalculating projections for goal {goal_id}")
        # This would trigger a full analysis update
        # Implementation depends on caching/storage strategy
        pass
    except Exception as e:
        logger.error(f"Error in background recalculation for goal {goal_id}: {str(e)}")