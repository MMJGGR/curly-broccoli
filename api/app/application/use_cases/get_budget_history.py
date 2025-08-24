"""
Get Budget History Use Case - Application Layer
Orchestrates budget history retrieval following clean architecture
"""
from typing import Dict, List


class GetBudgetHistory:
    """Use case for retrieving budget history and trends"""
    
    def __init__(self, budget_repository):
        self._budget_repository = budget_repository
    
    async def execute(self, user_id: int, months: int = 6) -> Dict:
        """Execute budget history retrieval"""
        
        # Validate input
        if user_id <= 0:
            raise ValueError("User ID must be positive")
        
        if months < 1 or months > 24:
            raise ValueError("Months must be between 1 and 24")
        
        # For now, return sample historical data
        # In a full implementation, this would query historical budget snapshots
        return {
            "user_id": user_id,
            "months_requested": months,
            "history": [
                {
                    "month": "2024-01",
                    "total_budgeted": 250000.0,
                    "total_actual": 245000.0,
                    "surplus": 154759.0,
                    "savings_rate_pct": 38.8
                },
                {
                    "month": "2024-02", 
                    "total_budgeted": 252000.0,
                    "total_actual": 248000.0,
                    "surplus": 151759.0,
                    "savings_rate_pct": 38.0
                }
            ],
            "trends": {
                "avg_monthly_surplus": 153259.0,
                "avg_savings_rate": 38.4,
                "budget_accuracy_pct": 97.2
            }
        }