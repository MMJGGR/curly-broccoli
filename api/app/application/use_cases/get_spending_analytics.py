"""
Get Spending Analytics Use Case - Clean Architecture
CFA-compliant spending analysis with category breakdown and trends
"""
from typing import Dict, Any, List, Optional
from datetime import date, timedelta
from decimal import Decimal
from collections import defaultdict

from ...domain.entities.money import Money
from ...domain.repositories.transaction_repository import TransactionRepository


class GetSpendingAnalytics:
    """Use case for generating spending analytics and insights"""
    
    def __init__(self, transaction_repository: TransactionRepository):
        self._transaction_repository = transaction_repository
    
    async def execute(
        self,
        user_id: int,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        period: str = "month"  # "week", "month", "quarter", "year"
    ) -> Dict[str, Any]:
        """
        Execute spending analytics generation
        
        Args:
            user_id: User identifier
            start_date: Analysis start date
            end_date: Analysis end date
            period: Analysis period granularity
            
        Returns:
            Dict containing analytics data
        """
        # Set default date range if not provided
        if not end_date:
            end_date = date.today()
        
        if not start_date:
            if period == "week":
                start_date = end_date - timedelta(days=7)
            elif period == "month":
                start_date = end_date - timedelta(days=30)
            elif period == "quarter":
                start_date = end_date - timedelta(days=90)
            elif period == "year":
                start_date = end_date - timedelta(days=365)
            else:
                start_date = end_date - timedelta(days=30)
        
        # Get transactions for the period
        transactions = await self._transaction_repository.get_by_user_id(
            user_id=user_id,
            start_date=start_date,
            end_date=end_date,
            limit=10000  # Get all transactions for analysis
        )
        
        # Initialize analytics data
        category_spending = defaultdict(Decimal)
        monthly_spending = defaultdict(Decimal)
        total_income = Decimal('0')
        total_expenses = Decimal('0')
        
        # Process transactions
        for transaction in transactions:
            amount = transaction.amount.amount
            month_key = transaction.transaction_date.strftime("%Y-%m")
            
            if amount > 0:
                total_income += amount
            else:
                expense_amount = abs(amount)
                total_expenses += expense_amount
                category_spending[transaction.category] += expense_amount
                monthly_spending[month_key] += expense_amount
        
        # Calculate category breakdown percentages
        category_breakdown = []
        if total_expenses > 0:
            for category, amount in category_spending.items():
                percentage = (amount / total_expenses) * 100
                category_breakdown.append({
                    "category": category,
                    "amount": {
                        "amount": str(amount),
                        "currency": "KES"
                    },
                    "percentage": round(float(percentage), 2)
                })
        
        # Sort by amount descending
        category_breakdown.sort(key=lambda x: Decimal(x["amount"]["amount"]), reverse=True)
        
        # Calculate monthly trend
        monthly_trend = []
        for month, amount in sorted(monthly_spending.items()):
            monthly_trend.append({
                "month": month,
                "amount": {
                    "amount": str(amount),
                    "currency": "KES"
                }
            })
        
        # Calculate key metrics
        net_cash_flow = total_income - total_expenses
        savings_rate = 0
        if total_income > 0:
            savings_rate = float((net_cash_flow / total_income) * 100)
        
        # Calculate average daily spending
        days_in_period = (end_date - start_date).days + 1
        avg_daily_spending = total_expenses / days_in_period if days_in_period > 0 else Decimal('0')
        
        return {
            "period": {
                "start_date": start_date.isoformat(),
                "end_date": end_date.isoformat(),
                "period_type": period,
                "days": days_in_period
            },
            "summary": {
                "total_income": {
                    "amount": str(total_income),
                    "currency": "KES"
                },
                "total_expenses": {
                    "amount": str(total_expenses),
                    "currency": "KES"
                },
                "net_cash_flow": {
                    "amount": str(net_cash_flow),
                    "currency": "KES"
                },
                "savings_rate": round(savings_rate, 2),
                "avg_daily_spending": {
                    "amount": str(avg_daily_spending.quantize(Decimal('0.01'))),
                    "currency": "KES"
                }
            },
            "category_breakdown": category_breakdown,
            "monthly_trend": monthly_trend,
            "insights": self._generate_insights(
                total_income, total_expenses, savings_rate, category_breakdown
            )
        }
    
    def _generate_insights(
        self, 
        total_income: Decimal, 
        total_expenses: Decimal, 
        savings_rate: float, 
        category_breakdown: List[Dict]
    ) -> List[Dict[str, str]]:
        """Generate spending insights based on analytics"""
        insights = []
        
        # Savings rate insight
        if savings_rate >= 20:
            insights.append({
                "type": "positive",
                "title": "Excellent Savings Rate",
                "message": f"You're saving {savings_rate:.1f}% of your income, which exceeds the recommended 20%."
            })
        elif savings_rate >= 10:
            insights.append({
                "type": "neutral",
                "title": "Good Savings Progress",
                "message": f"You're saving {savings_rate:.1f}% of your income. Consider increasing to 20% for optimal financial health."
            })
        else:
            insights.append({
                "type": "warning",
                "title": "Low Savings Rate",
                "message": f"You're only saving {savings_rate:.1f}% of your income. Financial experts recommend at least 20%."
            })
        
        # Top spending category insight
        if category_breakdown:
            top_category = category_breakdown[0]
            if top_category["percentage"] > 40:
                insights.append({
                    "type": "warning",
                    "title": "High Category Concentration",
                    "message": f"{top_category['category']} represents {top_category['percentage']:.1f}% of your spending. Consider diversifying expenses."
                })
        
        # Cash flow insight
        if total_income > total_expenses:
            surplus = total_income - total_expenses
            insights.append({
                "type": "positive",
                "title": "Positive Cash Flow",
                "message": f"You have a surplus of {surplus:,.2f} KES this period."
            })
        else:
            deficit = total_expenses - total_income
            insights.append({
                "type": "warning",
                "title": "Spending Exceeds Income",
                "message": f"You spent {deficit:,.2f} KES more than you earned this period."
            })
        
        return insights