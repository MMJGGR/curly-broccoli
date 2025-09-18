"""
Goals Management API V2 - Post-onboarding CRUD Operations

Provides endpoints for users to create, track, and manage their financial goals
after completing the onboarding process. Supports progress tracking and goal
achievement monitoring.

Key Features:
- Create and manage financial goals (emergency fund, vacation, etc.)
- Track progress with percentage calculations
- Update goal progress in real-time
- Goal achievement status monitoring
- Input validation with reasonable limits
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict, Any, List

from ....auth import get_current_user
from ....models import User, Goal as GoalModel, OnboardingState
from ....database import get_db
from datetime import datetime, timedelta

router = APIRouter(prefix="/goals-v2", tags=["goals-v2-clean"])


@router.get("/health")
async def goals_health_check():
    """Health check endpoint for goals service"""
    return {
        "status": "healthy",
        "service": "goals-v2-clean", 
        "architecture": "clean_architecture",
        "cfa_compliant": True
    }


@router.get("/overview")
async def get_goals_overview_v2(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get goals overview - integrated with onboarding data"""
    try:
        # Get goals from dedicated table
        goals = db.query(GoalModel).filter(
            GoalModel.user_id == current_user.id
        ).all()
        
        # Get onboarding goals data
        onboarding = db.query(OnboardingState).filter(
            OnboardingState.user_id == current_user.id
        ).first()
        
        total_target = 0
        total_current = 0
        goals_data = []
        
        # Add onboarding goals first (enhanced: support goals_meta & other_goal)
        if onboarding and onboarding.goals_data:
            gd = onboarding.goals_data  # Already deserialized
            tf = gd.get('timeframes', {})
            meta = gd.get('goals_meta', {})

            def tf_to_date(tf_str: str | None) -> str:
                if not tf_str:
                    return (datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d')
                try:
                    if 'year' in tf_str:
                        years = int(tf_str.split('-')[0])
                        return (datetime.now() + timedelta(days=years*365)).strftime('%Y-%m-%d')
                    if 'month' in tf_str:
                        months = int(tf_str.split('-')[0])
                        return (datetime.now() + timedelta(days=months*30)).strftime('%Y-%m-%d')
                except Exception:
                    pass
                return (datetime.now() + timedelta(days=365)).strftime('%Y-%m-%d')

            mapping = [
                ("Emergency Fund", 'emergencyFund'),
                ("Home Down Payment", 'homeDownPayment'),
                ("Education", 'education'),
                ("Retirement", 'retirement'),
                ("Investment", 'investment'),
                ("Debt Payoff", 'debtPayoff')
            ]

            idx = 0
            for display_name, key in mapping:
                raw_target = gd.get(key, 0)
                try:
                    target_amount = float(raw_target) if raw_target else 0
                except Exception:
                    target_amount = 0
                if target_amount <= 0:
                    continue
                m = meta.get(key, {}) if isinstance(meta, dict) else {}
                try:
                    current_amount = float(m.get('current_amount', 0) or 0)
                except Exception:
                    current_amount = 0
                tdate = m.get('target_date') or tf_to_date(tf.get(key))
                total_target += target_amount
                total_current += current_amount
                goals_data.append({
                    "id": f"onboarding-goal-{idx}",
                    "name": f"{display_name} (from onboarding)",
                    "target_amount": target_amount,
                    "current_amount": current_amount,
                    "progress_percentage": round((current_amount / target_amount * 100) if target_amount > 0 else 0, 1),
                    "target_date": tdate,
                    "is_achieved": current_amount >= target_amount,
                    "source": "onboarding",
                    "priority": (m.get('priority') if isinstance(m, dict) else None) or None
                })
                idx += 1

            # Other custom goal (single)
            other = gd.get('other_goal')
            if isinstance(other, dict) and other.get('name') and other.get('target_amount'):
                try:
                    t = float(other.get('target_amount') or 0)
                    c = float(other.get('current_amount') or 0)
                except Exception:
                    t, c = 0, 0
                if t > 0:
                    total_target += t
                    total_current += c
                    tdate = other.get('target_date') or tf_to_date('3-years')
                    goals_data.append({
                        "id": f"onboarding-goal-{idx}",
                        "name": f"{other.get('name')} (from onboarding)",
                        "target_amount": t,
                        "current_amount": c,
                        "progress_percentage": round((c / t * 100) if t > 0 else 0, 1),
                        "target_date": tdate,
                        "is_achieved": c >= t,
                        "source": "onboarding",
                        "priority": other.get('priority') or None
                    })
        
        # Add goals from dedicated table
        for goal in goals:
            # Parse target and current as float (they're stored as strings)
            target_amount = float(goal.target) if goal.target and goal.target.replace('.', '').isdigit() else 0
            current_amount = float(goal.current) if goal.current and goal.current.replace('.', '').isdigit() else 0
            
            total_target += target_amount
            total_current += current_amount
            
            # Calculate progress percentage
            progress_pct = (current_amount / target_amount * 100) if target_amount > 0 else 0
            
            goals_data.append({
                "id": goal.id,
                "name": goal.name,
                "target_amount": target_amount,
                "current_amount": current_amount,
                "progress_percentage": round(progress_pct, 1),
                "target_date": goal.target_date,
                "is_achieved": progress_pct >= 100,
                "source": "user_created"
            })
        
        # Calculate overall progress
        overall_progress = (total_current / total_target * 100) if total_target > 0 else 0
        
        return {
            "user_id": current_user.id,
            "total_target_amount": total_target,
            "total_current_amount": total_current,
            "overall_progress_percentage": round(overall_progress, 1),
            "goals": goals_data,
            "goals_count": len(goals_data),
            "data_sources": {
                "onboarding_goals": len([g for g in goals_data if g.get('source') == 'onboarding']),
                "user_created_goals": len([g for g in goals_data if g.get('source') == 'user_created'])
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving goals overview: {str(e)}"
        )


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_goal_v2(
    name: str,
    target_amount: float,
    target_date: str,
    current_amount: float = 0.0,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new financial goal with validation"""
    try:
        # Input validation
        if not name or len(name.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Goal name is required"
            )
        
        if len(name) > 100:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Goal name too long (max 100 characters)"
            )
        
        if target_amount <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target amount must be positive"
            )
        
        if target_amount > 100_000_000:  # 100M KES reasonable upper limit
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target amount exceeds reasonable limit"
            )
        
        if current_amount < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current amount cannot be negative"
            )
        
        if current_amount > target_amount:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current amount cannot exceed target amount"
            )
        
        # Date validation (basic format check)
        if not target_date or len(target_date.strip()) == 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Target date is required"
            )
        
        # Calculate initial progress
        progress = (current_amount / target_amount * 100) if target_amount > 0 else 0
        
        # Create new goal
        new_goal = GoalModel(
            user_id=current_user.id,
            name=name,
            target=str(target_amount),  # Store as string to match schema
            current=str(current_amount),  # Store as string to match schema
            progress=progress,
            target_date=target_date
        )
        
        db.add(new_goal)
        db.commit()
        db.refresh(new_goal)
        
        return {
            "message": f"Goal '{name}' created successfully",
            "goal": {
                "id": new_goal.id,
                "name": new_goal.name,
                "target_amount": target_amount,
                "current_amount": current_amount,
                "progress_percentage": round(progress, 1),
                "target_date": new_goal.target_date,
                "is_achieved": progress >= 100
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error creating goal: {str(e)}"
        )


@router.put("/{goal_id}/progress")
async def update_goal_progress_v2(
    goal_id: int,
    current_amount: float,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update progress for a specific goal"""
    try:
        # Get the goal
        goal = db.query(GoalModel).filter(
            GoalModel.id == goal_id,
            GoalModel.user_id == current_user.id
        ).first()
        
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Goal {goal_id} not found"
            )
        
        if current_amount < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current amount cannot be negative"
            )
        
        # Update progress
        target_amount = float(goal.target) if goal.target else 0
        new_progress = (current_amount / target_amount * 100) if target_amount > 0 else 0
        
        goal.current = str(current_amount)
        goal.progress = new_progress
        
        db.commit()
        db.refresh(goal)
        
        return {
            "message": f"Progress updated for goal '{goal.name}'",
            "goal": {
                "id": goal.id,
                "name": goal.name,
                "target_amount": target_amount,
                "current_amount": current_amount,
                "progress_percentage": round(new_progress, 1),
                "target_date": goal.target_date,
                "is_achieved": new_progress >= 100
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating goal progress: {str(e)}"
        )


@router.get("/")
async def get_goals_v2(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all goals for user - SIMPLE version"""
    try:
        goals = db.query(GoalModel).filter(
            GoalModel.user_id == current_user.id
        ).all()
        
        goals_data = []
        for goal in goals:
            target_amount = float(goal.target) if goal.target and goal.target.replace('.', '').isdigit() else 0
            current_amount = float(goal.current) if goal.current and goal.current.replace('.', '').isdigit() else 0
            progress_pct = (current_amount / target_amount * 100) if target_amount > 0 else 0
            
            goals_data.append({
                "id": goal.id,
                "name": goal.name,
                "target_amount": target_amount,
                "current_amount": current_amount,
                "progress_percentage": round(progress_pct, 1),
                "target_date": goal.target_date,
                "is_achieved": progress_pct >= 100
            })
        
        return goals_data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error retrieving goals: {str(e)}"
        )


from pydantic import BaseModel


class GoalUpdate(BaseModel):
    name: str | None = None
    target_amount: float | None = None
    target_date: str | None = None


@router.put("/{goal_id}")
async def update_goal_v2(
    goal_id: int,
    goal_update: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update general properties of a goal (name, target_amount, target_date). Use /progress for progress updates.

    Accepts partial updates. Validates values and persists changes.
    """
    try:
        goal = db.query(GoalModel).filter(
            GoalModel.id == goal_id,
            GoalModel.user_id == current_user.id
        ).first()

        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Goal {goal_id} not found"
            )

        # Apply updates if provided
        if goal_update.name is not None:
            name = goal_update.name
            if len(name.strip()) == 0 or len(name) > 100:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid goal name")
            goal.name = name

        if goal_update.target_amount is not None:
            target_amount = goal_update.target_amount
            if target_amount <= 0 or target_amount > 100_000_000:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid target amount")
            goal.target = str(target_amount)
            # Recalculate progress if current exists
            try:
                curr = float(goal.current) if goal.current else 0
                goal.progress = (curr / target_amount * 100) if target_amount > 0 else 0
            except Exception:
                goal.progress = 0

        if goal_update.target_date is not None:
            target_date = goal_update.target_date
            # Basic format sanity check (YYYY-MM-DD) without strict parsing
            if len(target_date.strip()) == 0:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid target date")
            goal.target_date = target_date

        db.commit()
        db.refresh(goal)

        # Build response
        tgt = float(goal.target) if goal.target else 0
        curr = float(goal.current) if goal.current else 0
        progress_pct = (curr / tgt * 100) if tgt > 0 else 0

        return {
            "id": goal.id,
            "name": goal.name,
            "target_amount": tgt,
            "current_amount": curr,
            "progress_percentage": round(progress_pct, 1),
            "target_date": goal.target_date,
            "is_achieved": progress_pct >= 100
        }
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error updating goal: {str(e)}"
        )

@router.delete("/{goal_id}")
async def delete_goal_v2(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a goal"""
    try:
        goal = db.query(GoalModel).filter(
            GoalModel.id == goal_id,
            GoalModel.user_id == current_user.id
        ).first()
        
        if not goal:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Goal {goal_id} not found"
            )
        
        goal_name = goal.name
        db.delete(goal)
        db.commit()
        
        return {
            "message": f"Goal '{goal_name}' deleted successfully",
            "deleted_goal_id": goal_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting goal: {str(e)}"
        )
