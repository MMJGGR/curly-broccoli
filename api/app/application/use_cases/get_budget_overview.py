"""
Get Budget Overview Use Case - Application Layer
Orchestrates budget overview retrieval following clean architecture
"""
from typing import Dict, Optional


class GetBudgetOverview:
    """Use case for retrieving comprehensive budget overview"""
    
    def __init__(self, budget_repository):
        self._budget_repository = budget_repository
    
    async def execute(self, user_id: int) -> Dict:
        """Execute budget overview retrieval with business logic"""
        
        # Validate input
        if user_id <= 0:
            raise ValueError("User ID must be positive")
        
        # Get budget data through repository
        # Note: For now using repository method directly since Budget entity has complex dependencies
        budget_data = self._budget_repository.get_budget_overview(user_id)
        
        if not budget_data:
            # Return empty budget structure for new users
            return {
                "user_id": user_id,
                "monthly_income": 0.0,
                "total_budgeted": 0.0,
                "total_actual": 0.0,
                "budget_surplus": 0.0,
                "actual_surplus": 0.0,
                "categories": [],
                "budget_health": {
                    "budget_utilization_pct": 0.0,
                    "actual_spending_pct": 0.0,
                    "savings_rate_pct": 0.0
                }
            }
        
        return budget_data