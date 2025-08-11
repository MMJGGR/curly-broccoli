"""
Budget Management API - Real budget tracking with actual vs planned spending
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, extract
from typing import List, Dict, Any, Optional
from datetime import datetime, date, timedelta
import calendar
import logging

from api.app.database import get_db
from api.app.models import User, ExpenseCategory, Transaction
from api.app.auth import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/budget", tags=["budget"])


@router.get("/overview")
def get_budget_overview(
    period: str = "month",  # month, year
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comprehensive budget overview with actual vs planned spending"""
    
    # Set date range based on period
    end_date = date.today()
    if period == "month":
        start_date = end_date.replace(day=1)
        budget_period = "monthly"
    elif period == "year":
        start_date = end_date.replace(month=1, day=1)
        budget_period = "yearly"
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid period. Use 'month' or 'year'"
        )
    
    # Get all active budget categories
    categories = db.query(ExpenseCategory).filter(
        and_(
            ExpenseCategory.user_id == current_user.id,
            ExpenseCategory.is_active == True,
            ExpenseCategory.budget_period == budget_period
        )
    ).all()
    
    if not categories:
        return {
            "period": period,
            "start_date": start_date.isoformat(),
            "end_date": end_date.isoformat(),
            "message": "No budget categories found. Set up your budget first.",
            "categories": [],
            "summary": {
                "total_budgeted": 0,
                "total_spent": 0,
                "remaining_budget": 0,
                "categories_count": 0,
                "over_budget_count": 0
            }
        }
    
    # Calculate actual spending for each category
    budget_data = []
    total_budgeted = 0
    total_spent = 0
    over_budget_count = 0
    
    for category in categories:
        # Get actual spending from transactions
        actual_spent = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == current_user.id,
                Transaction.category == category.name,
                Transaction.date >= start_date,
                Transaction.date <= end_date,
                Transaction.amount < 0  # Expenses are negative
            )
        ).scalar() or 0
        
        actual_spent = abs(actual_spent)  # Make positive for display
        
        # Calculate variance and status
        variance = category.budgeted_amount - actual_spent
        variance_percentage = (variance / category.budgeted_amount * 100) if category.budgeted_amount > 0 else 0
        
        if variance < 0:
            status_text = "over_budget"
            over_budget_count += 1
        elif variance == 0:
            status_text = "on_budget"
        else:
            status_text = "under_budget"
        
        # Days remaining in period
        if period == "month":
            days_in_period = calendar.monthrange(end_date.year, end_date.month)[1]
            days_elapsed = end_date.day
        else:
            days_in_period = 366 if calendar.isleap(end_date.year) else 365
            days_elapsed = end_date.timetuple().tm_yday
        
        days_remaining = days_in_period - days_elapsed
        
        category_data = {
            "id": category.id,
            "name": category.name,
            "category_type": category.category_type,
            "budgeted_amount": category.budgeted_amount,
            "actual_spent": actual_spent,
            "variance": variance,
            "variance_percentage": variance_percentage,
            "status": status_text,
            "daily_budget": category.budgeted_amount / days_in_period,
            "daily_actual": actual_spent / days_elapsed if days_elapsed > 0 else 0,
            "projected_spending": (actual_spent / days_elapsed * days_in_period) if days_elapsed > 0 else 0,
            "remaining_budget": max(0, category.budgeted_amount - actual_spent),
            "days_remaining": days_remaining,
            "updated_at": category.updated_at.isoformat()
        }
        
        budget_data.append(category_data)
        total_budgeted += category.budgeted_amount
        total_spent += actual_spent
    
    return {
        "period": period,
        "budget_period": budget_period,
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "categories": budget_data,
        "summary": {
            "total_budgeted": total_budgeted,
            "total_spent": total_spent,
            "remaining_budget": total_budgeted - total_spent,
            "budget_utilization": (total_spent / total_budgeted * 100) if total_budgeted > 0 else 0,
            "categories_count": len(categories),
            "over_budget_count": over_budget_count,
            "on_track": over_budget_count == 0,
            "projected_total": sum(cat["projected_spending"] for cat in budget_data)
        },
        "alerts": generate_budget_alerts(budget_data, total_budgeted, total_spent)
    }


@router.get("/categories")
def get_budget_categories(
    include_inactive: bool = False,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all budget categories with current spending"""
    query = db.query(ExpenseCategory).filter(ExpenseCategory.user_id == current_user.id)
    
    if not include_inactive:
        query = query.filter(ExpenseCategory.is_active == True)
    
    categories = query.all()
    
    categories_data = []
    for category in categories:
        # Get recent spending (last 30 days)
        recent_spending = db.query(func.sum(Transaction.amount)).filter(
            and_(
                Transaction.user_id == current_user.id,
                Transaction.category == category.name,
                Transaction.date >= date.today() - timedelta(days=30),
                Transaction.amount < 0
            )
        ).scalar() or 0
        
        categories_data.append({
            "id": category.id,
            "name": category.name,
            "budgeted_amount": category.budgeted_amount,
            "actual_amount": category.actual_amount,
            "category_type": category.category_type,
            "budget_period": category.budget_period,
            "is_active": category.is_active,
            "parent_category_id": category.parent_category_id,
            "recent_spending_30d": abs(recent_spending),
            "variance": category.variance,
            "variance_percentage": category.variance_percentage,
            "created_at": category.created_at.isoformat(),
            "updated_at": category.updated_at.isoformat()
        })
    
    return {
        "categories": categories_data,
        "total_categories": len(categories_data),
        "active_categories": len([cat for cat in categories_data if cat["is_active"]])
    }


@router.post("/categories")
def create_budget_category(
    category_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new budget category"""
    # Validate required fields
    required_fields = ['name', 'budgeted_amount']
    for field in required_fields:
        if field not in category_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Missing required field: {field}"
            )
    
    # Check if category name already exists for this user
    existing_category = db.query(ExpenseCategory).filter(
        and_(
            ExpenseCategory.user_id == current_user.id,
            ExpenseCategory.name == category_data['name']
        )
    ).first()
    
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category name already exists"
        )
    
    try:
        category = ExpenseCategory(
            user_id=current_user.id,
            name=category_data['name'],
            budgeted_amount=float(category_data['budgeted_amount']),
            category_type=category_data.get('category_type', 'expense'),
            budget_period=category_data.get('budget_period', 'monthly'),
            parent_category_id=category_data.get('parent_category_id'),
            is_active=category_data.get('is_active', True)
        )
        
        db.add(category)
        db.commit()
        db.refresh(category)
        
        logger.info(f"Budget category created: {category.id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Budget category created successfully",
            "category": {
                "id": category.id,
                "name": category.name,
                "budgeted_amount": category.budgeted_amount,
                "category_type": category.category_type,
                "budget_period": category.budget_period
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to create budget category: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create budget category: {str(e)}"
        )


@router.put("/categories/{category_id}")
def update_budget_category(
    category_id: int,
    category_data: Dict[str, Any],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing budget category"""
    category = db.query(ExpenseCategory).filter(
        and_(ExpenseCategory.id == category_id, ExpenseCategory.user_id == current_user.id)
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget category not found"
        )
    
    try:
        # Update category fields
        for field, value in category_data.items():
            if hasattr(category, field) and field not in ['id', 'user_id', 'created_at']:
                setattr(category, field, value)
        
        category.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(category)
        
        logger.info(f"Budget category updated: {category.id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Budget category updated successfully",
            "category": {
                "id": category.id,
                "name": category.name,
                "budgeted_amount": category.budgeted_amount,
                "variance": category.variance,
                "updated_at": category.updated_at.isoformat()
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to update budget category: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update budget category: {str(e)}"
        )


@router.delete("/categories/{category_id}")
def delete_budget_category(
    category_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a budget category"""
    category = db.query(ExpenseCategory).filter(
        and_(ExpenseCategory.id == category_id, ExpenseCategory.user_id == current_user.id)
    ).first()
    
    if not category:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Budget category not found"
        )
    
    # Check if category has associated transactions
    transaction_count = db.query(func.count(Transaction.id)).filter(
        Transaction.category == category.name
    ).scalar()
    
    try:
        if transaction_count > 0:
            # Soft delete - deactivate instead of deleting
            category.is_active = False
            category.updated_at = datetime.utcnow()
            message = f"Budget category deactivated (had {transaction_count} transactions)"
        else:
            # Hard delete if no transactions
            db.delete(category)
            message = "Budget category deleted successfully"
        
        db.commit()
        
        logger.info(f"Budget category {'deactivated' if transaction_count > 0 else 'deleted'}: {category_id} for user {current_user.id}")
        
        return {
            "success": True,
            "message": message,
            "had_transactions": transaction_count > 0,
            "transaction_count": transaction_count
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to delete budget category: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete budget category: {str(e)}"
        )


@router.get("/trends")
def get_budget_trends(
    months_back: int = 6,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get budget trends over time"""
    end_date = date.today()
    start_date = end_date - timedelta(days=months_back * 30)
    
    # Get monthly spending by category
    monthly_spending = db.query(
        extract('year', Transaction.date).label('year'),
        extract('month', Transaction.date).label('month'),
        Transaction.category,
        func.sum(Transaction.amount).label('amount')
    ).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= start_date,
            Transaction.amount < 0  # Expenses only
        )
    ).group_by(
        extract('year', Transaction.date),
        extract('month', Transaction.date),
        Transaction.category
    ).order_by('year', 'month').all()
    
    # Get budget categories for comparison
    categories = db.query(ExpenseCategory).filter(
        and_(
            ExpenseCategory.user_id == current_user.id,
            ExpenseCategory.is_active == True
        )
    ).all()
    
    budget_by_category = {cat.name: cat.budgeted_amount for cat in categories}
    
    # Organize data by month
    trends_data = {}
    for row in monthly_spending:
        month_key = f"{int(row.year)}-{int(row.month):02d}"
        if month_key not in trends_data:
            trends_data[month_key] = {}
        
        trends_data[month_key][row.category] = {
            "actual": abs(row.amount),
            "budgeted": budget_by_category.get(row.category, 0),
            "variance": budget_by_category.get(row.category, 0) - abs(row.amount)
        }
    
    return {
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "months_analyzed": months_back,
        "monthly_trends": trends_data,
        "categories_tracked": list(budget_by_category.keys()),
        "summary": {
            "months_with_data": len(trends_data),
            "total_categories": len(budget_by_category),
            "trend_analysis": analyze_spending_trends(trends_data)
        }
    }


@router.get("/recommendations")
def get_budget_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get AI-powered budget recommendations based on spending patterns"""
    
    # Get current month's spending
    current_month_start = date.today().replace(day=1)
    current_spending = db.query(
        Transaction.category,
        func.sum(Transaction.amount).label('amount')
    ).filter(
        and_(
            Transaction.user_id == current_user.id,
            Transaction.date >= current_month_start,
            Transaction.amount < 0
        )
    ).group_by(Transaction.category).all()
    
    # Get budget categories
    categories = db.query(ExpenseCategory).filter(
        and_(
            ExpenseCategory.user_id == current_user.id,
            ExpenseCategory.is_active == True
        )
    ).all()
    
    budget_by_category = {cat.name: cat for cat in categories}
    
    recommendations = []
    
    for category, amount in current_spending:
        amount = abs(amount)
        budget_category = budget_by_category.get(category)
        
        if budget_category:
            variance = budget_category.budgeted_amount - amount
            if variance < 0:  # Over budget
                overage_pct = abs(variance) / budget_category.budgeted_amount * 100
                if overage_pct > 20:
                    recommendations.append({
                        "type": "over_budget_warning",
                        "category": category,
                        "message": f"You're {overage_pct:.1f}% over budget in {category}",
                        "suggestion": f"Consider reducing {category} spending or increasing the budget by KES {abs(variance):.0f}",
                        "priority": "high" if overage_pct > 50 else "medium"
                    })
            elif amount == 0:  # No spending
                recommendations.append({
                    "type": "unused_budget",
                    "category": category,
                    "message": f"No spending in {category} this month",
                    "suggestion": f"Consider reallocating KES {budget_category.budgeted_amount:.0f} to other categories",
                    "priority": "low"
                })
        else:
            # Spending in uncategorized area
            recommendations.append({
                "type": "missing_budget",
                "category": category,
                "message": f"Spending KES {amount:.0f} in unbudgeted category: {category}",
                "suggestion": f"Create a budget category for {category}",
                "priority": "medium"
            })
    
    # Check for categories with no spending
    for cat_name, category in budget_by_category.items():
        if not any(cat for cat, _ in current_spending if cat == cat_name):
            recommendations.append({
                "type": "no_activity",
                "category": cat_name,
                "message": f"No activity in {cat_name} (budgeted: KES {category.budgeted_amount:.0f})",
                "suggestion": "Consider if this budget allocation is still needed",
                "priority": "low"
            })
    
    return {
        "recommendations": recommendations,
        "recommendation_count": len(recommendations),
        "high_priority_count": len([r for r in recommendations if r["priority"] == "high"]),
        "generated_at": datetime.utcnow().isoformat(),
        "next_review_date": (date.today() + timedelta(days=7)).isoformat()
    }


@router.post("/recalculate")
def recalculate_budget_actuals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Recalculate actual amounts for all budget categories based on transactions"""
    
    try:
        categories = db.query(ExpenseCategory).filter(
            ExpenseCategory.user_id == current_user.id
        ).all()
        
        updated_count = 0
        
        for category in categories:
            # Calculate total actual spending for this category
            total_actual = db.query(func.sum(Transaction.amount)).filter(
                and_(
                    Transaction.user_id == current_user.id,
                    Transaction.category == category.name,
                    Transaction.amount < 0  # Expenses only
                )
            ).scalar() or 0
            
            category.actual_amount = abs(total_actual)
            category.updated_at = datetime.utcnow()
            updated_count += 1
        
        db.commit()
        
        logger.info(f"Budget actuals recalculated for {updated_count} categories for user {current_user.id}")
        
        return {
            "success": True,
            "message": "Budget actuals recalculated successfully",
            "categories_updated": updated_count,
            "recalculated_at": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        db.rollback()
        logger.error(f"Failed to recalculate budget actuals: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to recalculate budget actuals: {str(e)}"
        )


# Helper functions
def generate_budget_alerts(budget_data: List[Dict], total_budgeted: float, total_spent: float) -> List[Dict]:
    """Generate budget alerts based on spending patterns"""
    alerts = []
    
    # Overall budget alert
    if total_spent > total_budgeted:
        overage = total_spent - total_budgeted
        alerts.append({
            "type": "overall_over_budget",
            "severity": "high",
            "message": f"Total spending exceeds budget by KES {overage:.0f}",
            "action": "Review categories that are over budget"
        })
    
    # Category-specific alerts
    for category in budget_data:
        if category["status"] == "over_budget" and category["variance_percentage"] < -20:
            alerts.append({
                "type": "category_over_budget",
                "severity": "medium",
                "category": category["name"],
                "message": f"{category['name']} is {abs(category['variance_percentage']):.1f}% over budget",
                "action": f"Reduce {category['name']} spending by KES {abs(category['variance']):.0f}"
            })
        
        # Projected overspend alert
        if category["projected_spending"] > category["budgeted_amount"] * 1.1:
            projected_overage = category["projected_spending"] - category["budgeted_amount"]
            alerts.append({
                "type": "projected_overspend",
                "severity": "warning",
                "category": category["name"],
                "message": f"{category['name']} projected to exceed budget by KES {projected_overage:.0f}",
                "action": "Monitor spending closely for remainder of period"
            })
    
    return alerts


def analyze_spending_trends(trends_data: Dict) -> Dict[str, Any]:
    """Analyze spending trends over time"""
    if not trends_data:
        return {"message": "No data available for trend analysis"}
    
    months = list(trends_data.keys())
    if len(months) < 2:
        return {"message": "Need at least 2 months of data for trend analysis"}
    
    # Calculate month-over-month changes
    latest_month = months[-1]
    previous_month = months[-2]
    
    latest_total = sum(cat_data["actual"] for cat_data in trends_data[latest_month].values())
    previous_total = sum(cat_data["actual"] for cat_data in trends_data[previous_month].values())
    
    mom_change = latest_total - previous_total
    mom_change_pct = (mom_change / previous_total * 100) if previous_total > 0 else 0
    
    return {
        "latest_month": latest_month,
        "latest_total": latest_total,
        "previous_month": previous_month,
        "previous_total": previous_total,
        "month_over_month_change": mom_change,
        "month_over_month_percentage": mom_change_pct,
        "trend_direction": "increasing" if mom_change > 0 else "decreasing" if mom_change < 0 else "stable"
    }