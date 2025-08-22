"""
Financial Timeline API V2 - Clean Architecture Implementation
CFA-compliant financial timeline with milestone tracking and life stage planning
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from decimal import Decimal

from ....auth import get_current_user
from ....models import User
from ....database import get_db

# Import use cases
from ....application.use_cases.get_financial_timeline import GetFinancialTimeline, UpdateMilestoneProgress

# Import repositories
from ....infrastructure.repositories.sqlalchemy_profile_repository import SqlAlchemyProfileRepository

# Import domain entities
from ....domain.value_objects.money import Money

router = APIRouter(prefix="/timeline-v2", tags=["timeline-v2-clean"])


def get_timeline_use_case(db: Session = Depends(get_db)) -> GetFinancialTimeline:
    """Dependency injection for timeline use case"""
    profile_repo = SqlAlchemyProfileRepository(db)
    return GetFinancialTimeline(profile_repo)


@router.get("/journey", response_model=Dict[str, Any])
async def get_financial_timeline_v2(
    current_user: User = Depends(get_current_user),
    use_case: GetFinancialTimeline = Depends(get_timeline_use_case)
):
    """
    Get comprehensive financial timeline using clean architecture.
    
    Returns timeline with:
    - CFA-compliant financial milestones
    - Life stage-based planning
    - Progress tracking and recommendations
    - Monthly savings requirements
    """
    try:
        timeline = await use_case.execute(current_user.id)
        
        # Convert milestones to API format
        milestones_data = []
        for milestone in timeline.milestones:
            milestones_data.append({
                "name": milestone.name,
                "target_age": milestone.target_age,
                "target_amount": float(milestone.target_amount.amount),
                "current_amount": float(milestone.current_amount.amount),
                "target_date": str(milestone.target_date),
                "milestone_type": milestone.milestone_type,
                "priority": milestone.priority,
                "is_achieved": milestone.is_achieved,
                "progress_percentage": float(milestone.progress_percentage),
                "years_remaining": milestone.years_remaining(),
                "monthly_savings_required": float(milestone.monthly_savings_required().amount),
                "currency": "KES"
            })
        
        # Convert life stages to API format
        life_stages_data = []
        for stage in timeline.life_stages:
            life_stages_data.append({
                "name": stage.name,
                "age_range": stage.age_range,
                "typical_goals": stage.typical_goals,
                "financial_priorities": stage.financial_priorities,
                "risk_tolerance": stage.risk_tolerance,
                "is_current": stage.is_current_stage(timeline.current_age)
            })
        
        # Get current life stage
        current_stage = timeline.get_current_life_stage()
        current_stage_data = None
        if current_stage:
            current_stage_data = {
                "name": current_stage.name,
                "age_range": current_stage.age_range,
                "typical_goals": current_stage.typical_goals,
                "financial_priorities": current_stage.financial_priorities,
                "risk_tolerance": current_stage.risk_tolerance
            }
        
        # Calculate financial health metrics
        health_score = timeline.get_financial_health_score()
        
        return {
            "user_id": current_user.id,
            "timeline": {
                "current_age": timeline.current_age,
                "life_expectancy": timeline.life_expectancy,
                "current_life_stage": timeline.current_life_stage,
                "current_stage_details": current_stage_data
            },
            "milestones": {
                "all_milestones": milestones_data,
                "upcoming_milestones": milestones_data[:5],  # Next 5 milestones
                "total_monthly_savings_needed": float(timeline.calculate_total_savings_needed().amount)
            },
            "life_stages": life_stages_data,
            "financial_health": {
                "overall_score": health_score["overall_score"],
                "milestone_completion": health_score["milestone_completion"],
                "total_milestones": health_score["total_milestones"],
                "achieved_milestones": health_score["achieved_milestones"],
                "health_status": (
                    "excellent" if health_score["overall_score"] >= 80 else
                    "good" if health_score["overall_score"] >= 60 else
                    "needs_improvement" if health_score["overall_score"] >= 40 else
                    "critical"
                )
            },
            "recommendations": {
                "priority_milestone": milestones_data[0]["name"] if milestones_data else "Set up Emergency Fund",
                "next_life_stage": _get_next_life_stage(timeline.current_age, timeline.life_stages),
                "suggested_actions": _get_suggested_actions(timeline)
            },
            "metadata": {
                "calculation_method": "clean_architecture",
                "cfa_compliant": True,
                "milestone_methodology": "CFA_Level_3_Standards",
                "currency": "KES"
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating financial timeline: {str(e)}"
        )


def _get_next_life_stage(current_age: int, life_stages: List) -> str:
    """Get the next life stage after current age"""
    for stage in life_stages:
        if stage.age_range[0] > current_age:
            return stage.name
    return "Retirement Planning"


def _get_suggested_actions(timeline) -> List[str]:
    """Generate suggested actions based on timeline analysis"""
    actions = []
    
    # Find highest priority incomplete milestone
    next_milestones = timeline.get_next_milestones(3)
    if next_milestones:
        priority_milestone = next_milestones[0]
        required_monthly = priority_milestone.monthly_savings_required()
        actions.append(f"Focus on {priority_milestone.name}: Save {float(required_monthly.amount):.0f} KES monthly")
    
    # Life stage specific recommendations
    current_stage = timeline.get_current_life_stage()
    if current_stage and current_stage.financial_priorities:
        actions.extend(current_stage.financial_priorities[:2])  # Top 2 priorities
    
    # General CFA recommendations
    if timeline.current_age < 30:
        actions.append("Build emergency fund first, then focus on aggressive growth investments")
    elif timeline.current_age < 50:
        actions.append("Maximize retirement contributions and diversify investment portfolio")
    else:
        actions.append("Focus on capital preservation and retirement income planning")
    
    return actions[:5]  # Limit to 5 suggestions


@router.put("/milestones/{milestone_type}/progress")
async def update_milestone_progress_v2(
    milestone_type: str,
    current_amount: float,
    current_user: User = Depends(get_current_user),
    timeline_use_case: GetFinancialTimeline = Depends(get_timeline_use_case)
):
    """
    Update progress for a specific milestone with validation.
    
    Validates:
    - Amount is positive
    - Progress change is realistic (< 50% jump)
    - Milestone type exists
    """
    try:
        # Get current timeline
        timeline = await timeline_use_case.execute(current_user.id)
        
        # Create update use case and execute
        update_use_case = UpdateMilestoneProgress()
        amount = Money(Decimal(str(current_amount)))
        
        success = await update_use_case.execute(timeline, milestone_type, amount)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Milestone type '{milestone_type}' not found"
            )
        
        # Get updated milestone info
        milestone = timeline.get_milestone_by_type(milestone_type)
        
        return {
            "message": f"Progress updated for {milestone.name}",
            "milestone": {
                "name": milestone.name,
                "current_amount": float(milestone.current_amount.amount),
                "target_amount": float(milestone.target_amount.amount),
                "progress_percentage": float(milestone.progress_percentage),
                "is_achieved": milestone.is_achieved,
                "monthly_savings_required": float(milestone.monthly_savings_required().amount)
            },
            "metadata": {
                "validation_passed": True,
                "cfa_compliant": True,
                "currency": "KES"
            }
        }
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Validation error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating milestone progress: {str(e)}"
        )


@router.get("/health")
async def timeline_health_check():
    """Health check endpoint for timeline service"""
    return {
        "status": "healthy",
        "service": "timeline-v2-clean",
        "architecture": "clean_architecture",
        "cfa_compliant": True,
        "features": [
            "financial_timeline_generation",
            "cfa_milestone_calculation",
            "life_stage_planning",
            "progress_tracking",
            "business_rule_validation"
        ]
    }