"""
GetExpensesSummary Use Case - Application Layer
Foundation Week Day 2: Comprehensive expense analysis with CFA budgeting standards
"""
from typing import Dict, List
from decimal import Decimal

from ...domain.entities.money import Money
from ...domain.entities.expense import Expense, ExpenseCategory
from ...domain.repositories.expense_repository import ExpenseRepository


class GetExpensesSummary:
    """
    Use case for retrieving comprehensive expenses summary with budget analysis.
    
    Following CFA standards:
    - Expense categorization and budget analysis
    - Essential vs. discretionary classification
    - Cash flow impact assessment
    - Financial health indicators
    """
    
    def __init__(self, expense_repository: ExpenseRepository):
        self._expense_repository = expense_repository
    
    async def execute(self, user_id: int) -> Dict:
        """
        Execute expenses summary retrieval with budget analysis.
        
        Args:
            user_id: ID of user to get summary for
            
        Returns:
            Dictionary containing:
            - user_id: User identifier
            - expenses: List of expense details
            - summary: Aggregated financial metrics
            - budget_analysis: CFA-compliant budget analysis
            - financial_health: Health indicators and recommendations
        """
        try:
            # Get all user expenses
            expenses = await self._expense_repository.get_user_expenses(user_id)
            
            # Calculate summary metrics
            summary = await self._expense_repository.get_expenses_summary(user_id)
            
            # Perform budget analysis
            budget_analysis = self._calculate_budget_analysis(expenses, summary)
            
            # Calculate financial health indicators
            financial_health = self._calculate_financial_health(expenses, budget_analysis)
            
            # Format expense details
            expense_details = self._format_expense_details(expenses)
            
            return {
                "user_id": user_id,
                "expenses": expense_details,
                "summary": summary,
                "budget_analysis": budget_analysis,
                "financial_health": financial_health
            }
            
        except Exception as e:
            # Re-raise with context for better error handling
            raise Exception(f"Failed to get expenses summary for user {user_id}: {str(e)}")
    
    def _calculate_budget_analysis(self, expenses: List[Expense], summary: Dict) -> Dict:
        """
        Perform CFA-compliant budget analysis.
        
        Args:
            expenses: List of user expenses
            summary: Summary statistics
            
        Returns:
            Dictionary with budget analysis metrics
        """
        total_amount = summary["total_amount"]
        monthly_recurring = summary["monthly_recurring_total"]
        
        if total_amount.is_zero():
            return {
                "fixed_expenses_percentage": 0.0,
                "variable_expenses_percentage": 0.0,
                "discretionary_expenses_percentage": 0.0,
                "essential_vs_discretionary_ratio": 0.0,
                "monthly_cash_flow_impact": Money.zero()
            }
        
        # Calculate category percentages
        category_totals = {
            ExpenseCategory.FIXED_EXPENSES: Money.zero(),
            ExpenseCategory.VARIABLE_EXPENSES: Money.zero(),
            ExpenseCategory.DISCRETIONARY_EXPENSES: Money.zero()
        }
        
        essential_total = Money.zero()
        discretionary_total = Money.zero()
        
        for expense in expenses:
            category = expense.get_expense_category()
            monthly_equiv = expense.calculate_monthly_equivalent()
            
            category_totals[category] = category_totals[category].add(monthly_equiv)
            
            if expense.is_essential:
                essential_total = essential_total.add(monthly_equiv)
            else:
                discretionary_total = discretionary_total.add(monthly_equiv)
        
        # Calculate percentages
        total_monthly = sum(cat_total.amount for cat_total in category_totals.values())
        
        if total_monthly > 0:
            fixed_pct = (category_totals[ExpenseCategory.FIXED_EXPENSES].amount / total_monthly) * 100
            variable_pct = (category_totals[ExpenseCategory.VARIABLE_EXPENSES].amount / total_monthly) * 100
            discretionary_pct = (category_totals[ExpenseCategory.DISCRETIONARY_EXPENSES].amount / total_monthly) * 100
        else:
            fixed_pct = variable_pct = discretionary_pct = 0.0
        
        # Essential vs discretionary ratio
        if discretionary_total.is_zero():
            essential_discretionary_ratio = 100.0  # All essential
        else:
            essential_discretionary_ratio = essential_total.amount / discretionary_total.amount
        
        return {
            "fixed_expenses_percentage": float(Decimal(str(fixed_pct)).quantize(Decimal('0.01'))),
            "variable_expenses_percentage": float(Decimal(str(variable_pct)).quantize(Decimal('0.01'))),
            "discretionary_expenses_percentage": float(Decimal(str(discretionary_pct)).quantize(Decimal('0.01'))),
            "essential_vs_discretionary_ratio": float(Decimal(str(essential_discretionary_ratio)).quantize(Decimal('0.01'))),
            "monthly_cash_flow_impact": monthly_recurring
        }
    
    def _calculate_financial_health(self, expenses: List[Expense], budget_analysis: Dict) -> Dict:
        """
        Calculate financial health indicators and recommendations.
        
        Args:
            expenses: List of user expenses
            budget_analysis: Budget analysis results
            
        Returns:
            Dictionary with financial health metrics
        """
        # Calculate budget discipline score (1-10)
        fixed_pct = budget_analysis["fixed_expenses_percentage"]
        discretionary_pct = budget_analysis["discretionary_expenses_percentage"]
        
        # Good discipline: high essential, low discretionary
        if discretionary_pct <= 20 and fixed_pct <= 50:
            discipline_score = 10
        elif discretionary_pct <= 30 and fixed_pct <= 60:
            discipline_score = 8
        elif discretionary_pct <= 40:
            discipline_score = 6
        elif discretionary_pct <= 50:
            discipline_score = 4
        else:
            discipline_score = 2
        
        # Spending pattern analysis
        if fixed_pct > 60:
            pattern = "fixed_heavy"
        elif discretionary_pct > 40:
            pattern = "discretionary_heavy"
        else:
            pattern = "balanced"
        
        # Generate recommendations
        recommendations = []
        if discretionary_pct > 30:
            recommendations.append("Consider reducing discretionary spending to improve savings rate")
        if fixed_pct > 60:
            recommendations.append("High fixed expenses limit financial flexibility - review recurring commitments")
        if budget_analysis["essential_vs_discretionary_ratio"] < 2:
            recommendations.append("Focus on essential expenses first, then allocate remaining income")
        
        if not recommendations:
            recommendations.append("Good budget balance - maintain current spending patterns")
        
        return {
            "budget_discipline_score": discipline_score,
            "spending_pattern_analysis": pattern,
            "recommendations": recommendations
        }
    
    def _format_expense_details(self, expenses: List[Expense]) -> List[Dict]:
        """
        Format expense details for API response.
        
        Args:
            expenses: List of expense entities
            
        Returns:
            List of formatted expense dictionaries
        """
        formatted_expenses = []
        
        for expense in expenses:
            expense_detail = {
                "id": expense.id,
                "description": expense.description,
                "amount": expense.amount,
                "expense_type": expense.expense_type.value,
                "expense_category": expense.get_expense_category().value,
                "expense_date": expense.expense_date.isoformat(),
                "is_recurring": expense.is_recurring,
                "frequency_months": expense.frequency_months,
                "annual_projection": expense.calculate_annual_projection(),
                "monthly_equivalent": expense.calculate_monthly_equivalent(),
                "is_essential": expense.is_essential,
                "budget_impact_score": expense.get_budget_impact_score(),
                "financial_health_impact": expense.financial_health_impact,
                "vendor": expense.vendor,
                "notes": expense.notes,
                "is_active": expense.is_active,
                "created_at": expense.created_at.isoformat() if expense.created_at else None,
                "updated_at": expense.updated_at.isoformat() if expense.updated_at else None
            }
            formatted_expenses.append(expense_detail)
        
        return formatted_expenses