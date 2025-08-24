"""
CFA-Compliant Financial Validation Service

Implements CFA Institute professional standards for financial validation
as specified in the Technical Development Guide.
"""

from decimal import Decimal
from typing import List, Dict, Any
from ..entities.budget import Budget, BudgetCategory
from ..value_objects.money import Money


class CFAValidationService:
    """
    Domain service for CFA-level financial validations.
    
    Follows CFA Institute standards for personal financial planning
    and risk management validation as specified in technical guide.
    """
    
    # CFA Guidelines Constants
    MAX_HOUSING_RATIO = Decimal('0.28')  # 28% of gross income
    MAX_DEBT_RATIO = Decimal('0.36')     # 36% of gross income  
    MIN_EMERGENCY_FUND_MONTHS = 3
    MAX_EMERGENCY_FUND_MONTHS = 6
    MAX_SINGLE_CATEGORY_RATIO = Decimal('0.50')  # 50% of income
    MIN_SAVINGS_RATE = Decimal('0.10')   # 10% savings rate
    RECOMMENDED_SAVINGS_RATE = Decimal('0.20')  # 20% savings rate
    
    @staticmethod
    def validate_budget_category(category: BudgetCategory, monthly_income: Money) -> List[str]:
        """
        Validate a budget category against CFA standards.
        
        Args:
            category: Budget category to validate
            monthly_income: User's monthly income
            
        Returns:
            List of validation error messages
        """
        errors = []
        
        # Basic validation
        if category.allocated_amount.amount <= Decimal('0'):
            errors.append("Category allocation must be positive")
            return errors
        
        # CFA Standard: No single category should exceed 50% of income
        category_ratio = category.allocated_amount.amount / monthly_income.amount
        if category_ratio > CFAValidationService.MAX_SINGLE_CATEGORY_RATIO:
            errors.append(
                f"Category '{category.name}' allocation ({category_ratio:.1%}) exceeds "
                f"maximum recommended ratio of {CFAValidationService.MAX_SINGLE_CATEGORY_RATIO:.1%} of income"
            )
        
        # Category-specific validation
        if category.category_type == "HOUSING":
            if category_ratio > CFAValidationService.MAX_HOUSING_RATIO:
                errors.append(
                    f"Housing costs ({category_ratio:.1%}) exceed CFA guideline of "
                    f"{CFAValidationService.MAX_HOUSING_RATIO:.1%} of gross income"
                )
        
        return errors
    
    @staticmethod
    def validate_budget(budget: Budget) -> List[str]:
        """
        Validate complete budget against CFA standards.
        
        Args:
            budget: Complete budget to validate
            
        Returns:
            List of validation error messages
        """
        errors = []
        
        if budget.monthly_income.amount <= Decimal('0'):
            errors.append("Monthly income must be positive")
            return errors
        
        # Calculate key ratios
        total_expenses = budget.calculate_total_expenses()
        total_savings = budget.calculate_total_savings_allocations()
        
        # CFA Standard: Savings rate validation
        savings_rate = total_savings.amount / budget.monthly_income.amount
        if savings_rate < CFAValidationService.MIN_SAVINGS_RATE:
            errors.append(
                f"Savings rate ({savings_rate:.1%}) below minimum recommended "
                f"{CFAValidationService.MIN_SAVINGS_RATE:.1%}"
            )
        
        # Budget balance validation
        total_commitments = total_expenses.add(total_savings)
        if total_commitments.amount > budget.monthly_income.amount:
            overage = total_commitments.amount - budget.monthly_income.amount
            errors.append(f"Total commitments exceed income by {overage}")
        
        # Emergency fund validation (if applicable)
        cash_categories = [cat for cat in budget.categories.values() 
                          if cat.category_type == "EMERGENCY_FUND"]
        if cash_categories:
            emergency_fund = sum(cat.allocated_amount.amount for cat in cash_categories)
            monthly_expenses = total_expenses.amount
            if monthly_expenses > 0:
                months_coverage = emergency_fund / monthly_expenses
                if months_coverage < CFAValidationService.MIN_EMERGENCY_FUND_MONTHS:
                    errors.append(
                        f"Emergency fund covers only {months_coverage:.1f} months of expenses. "
                        f"CFA recommends {CFAValidationService.MIN_EMERGENCY_FUND_MONTHS}-"
                        f"{CFAValidationService.MAX_EMERGENCY_FUND_MONTHS} months"
                    )
        
        return errors
    
    @staticmethod
    def calculate_financial_health_metrics(budget: Budget) -> Dict[str, Any]:
        """
        Calculate CFA-standard financial health metrics.
        
        Args:
            budget: Budget to analyze
            
        Returns:
            Dictionary of financial health metrics
        """
        total_expenses = budget.calculate_total_expenses()
        total_savings = budget.calculate_total_savings_allocations()
        
        savings_rate = (total_savings.amount / budget.monthly_income.amount 
                       if budget.monthly_income.amount > 0 else Decimal('0'))
        
        expense_ratio = (total_expenses.amount / budget.monthly_income.amount
                        if budget.monthly_income.amount > 0 else Decimal('0'))
        
        return {
            "savings_rate": float(savings_rate),
            "expense_ratio": float(expense_ratio),
            "monthly_surplus": float(budget.calculate_surplus().amount),
            "meets_cfa_savings_minimum": savings_rate >= CFAValidationService.MIN_SAVINGS_RATE,
            "meets_cfa_savings_recommended": savings_rate >= CFAValidationService.RECOMMENDED_SAVINGS_RATE,
            "total_categories": len(budget.categories),
            "budget_utilization": float((total_expenses.add(total_savings)).amount / budget.monthly_income.amount)
        }
    
    @staticmethod 
    def validate_income_amount(amount: Decimal) -> List[str]:
        """Validate income amount follows CFA standards."""
        errors = []
        
        if amount <= Decimal('0'):
            errors.append("Income must be positive")
        elif amount > Decimal('10000000'):  # 10M limit for data integrity
            errors.append("Income amount exceeds maximum allowed")
            
        return errors
    
    @staticmethod
    def validate_goal_allocation(goal_amount: Money, target_months: int, monthly_income: Money) -> List[str]:
        """Validate financial goal allocation against CFA planning standards."""
        errors = []
        
        if target_months <= 0:
            errors.append("Goal timeline must be positive")
            return errors
        
        monthly_requirement = goal_amount.amount / target_months
        income_ratio = monthly_requirement / monthly_income.amount
        
        if income_ratio > Decimal('0.30'):  # 30% of income to single goal
            errors.append(
                f"Goal requires {income_ratio:.1%} of monthly income. "
                f"Consider extending timeline to reduce monthly burden"
            )
        
        return errors