from dataclasses import dataclass, field
from typing import Dict, List, Optional
from decimal import Decimal
from ..value_objects.money import Money
from ..value_objects.period import Period


@dataclass
class BudgetCategory:
    name: str
    allocated_amount: Money
    spent_amount: Money = field(default_factory=lambda: Money(Decimal('0')))
    category_type: str = "expense"  # expense, savings, investment
    
    def calculate_variance(self) -> Money:
        """Calculate the variance (allocated - spent)"""
        return self.allocated_amount.subtract(self.spent_amount)
    
    def calculate_variance_percentage(self) -> Decimal:
        """Calculate variance as percentage of allocated amount"""
        if self.allocated_amount.amount == 0:
            return Decimal('0')
        variance = self.calculate_variance()
        return (variance.amount / self.allocated_amount.amount) * 100
    
    def is_over_budget(self) -> bool:
        """Check if spending exceeds allocation"""
        return self.spent_amount > self.allocated_amount
    
    def remaining_budget(self) -> Money:
        """Calculate remaining budget (positive if under budget)"""
        return self.calculate_variance()
    
    def utilization_percentage(self) -> Decimal:
        """Calculate budget utilization percentage"""
        if self.allocated_amount.amount == 0:
            return Decimal('0')
        return (self.spent_amount.amount / self.allocated_amount.amount) * 100


@dataclass
class Budget:
    user_id: int
    period: Period
    monthly_income: Money
    categories: Dict[str, BudgetCategory] = field(default_factory=dict)
    goal_allocations: Dict[str, Money] = field(default_factory=dict)
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    
    def calculate_total_expenses(self) -> Money:
        """Calculate total allocated expenses across all categories"""
        total = Money(Decimal('0'))
        for category in self.categories.values():
            if category.category_type == "expense":
                total = total.add(category.allocated_amount)
        return total
    
    def calculate_total_spent(self) -> Money:
        """Calculate total actually spent across all categories"""
        total = Money(Decimal('0'))
        for category in self.categories.values():
            total = total.add(category.spent_amount)
        return total
    
    def calculate_total_goal_allocations(self) -> Money:
        """Calculate total allocations to financial goals"""
        total = Money(Decimal('0'))
        for allocation in self.goal_allocations.values():
            total = total.add(allocation)
        return total
    
    def calculate_total_savings_allocations(self) -> Money:
        """Calculate total allocations to savings categories"""
        total = Money(Decimal('0'))
        for category in self.categories.values():
            if category.category_type in ["savings", "investment"]:
                total = total.add(category.allocated_amount)
        return total
    
    def calculate_surplus(self) -> Money:
        """Calculate budget surplus (income - expenses - goals - savings)"""
        total_outflows = (
            self.calculate_total_expenses()
            .add(self.calculate_total_goal_allocations())
            .add(self.calculate_total_savings_allocations())
        )
        return self.monthly_income.subtract(total_outflows)
    
    def calculate_actual_surplus(self) -> Money:
        """Calculate actual surplus based on spent amounts"""
        total_spent = self.calculate_total_spent()
        total_goals = self.calculate_total_goal_allocations()
        total_savings = self.calculate_total_savings_allocations()
        
        return self.monthly_income.subtract(
            total_spent.add(total_goals).add(total_savings)
        )
    
    def is_balanced(self) -> bool:
        """Check if budget is balanced (surplus >= 0)"""
        return self.calculate_surplus().amount >= 0
    
    def get_savings_rate(self) -> Decimal:
        """Calculate savings rate as percentage of income"""
        total_savings = self.calculate_total_savings_allocations()
        total_goals = self.calculate_total_goal_allocations()
        total_saved = total_savings.add(total_goals)
        
        if self.monthly_income.amount == 0:
            return Decimal('0')
        
        return (total_saved.amount / self.monthly_income.amount) * 100
    
    def get_expense_ratio(self) -> Decimal:
        """Calculate expense ratio as percentage of income"""
        total_expenses = self.calculate_total_expenses()
        
        if self.monthly_income.amount == 0:
            return Decimal('0')
        
        return (total_expenses.amount / self.monthly_income.amount) * 100
    
    def add_category(self, category: BudgetCategory) -> None:
        """Add a new budget category"""
        if category.name in self.categories:
            raise ValueError(f"Category '{category.name}' already exists")
        self.categories[category.name] = category
    
    def update_category_allocation(self, category_name: str, new_amount: Money) -> None:
        """Update the allocation for an existing category"""
        if category_name not in self.categories:
            raise ValueError(f"Category '{category_name}' not found")
        self.categories[category_name].allocated_amount = new_amount
    
    def update_category_spending(self, category_name: str, spent_amount: Money) -> None:
        """Update the spent amount for a category"""
        if category_name not in self.categories:
            raise ValueError(f"Category '{category_name}' not found")
        self.categories[category_name].spent_amount = spent_amount
    
    def remove_category(self, category_name: str) -> None:
        """Remove a budget category"""
        if category_name not in self.categories:
            raise ValueError(f"Category '{category_name}' not found")
        del self.categories[category_name]
    
    def set_goal_allocation(self, goal_name: str, amount: Money) -> None:
        """Set allocation amount for a financial goal"""
        self.goal_allocations[goal_name] = amount
    
    def get_category_summary(self) -> Dict[str, Dict]:
        """Get summary statistics for all categories"""
        summary = {}
        for name, category in self.categories.items():
            summary[name] = {
                "allocated": category.allocated_amount.amount,
                "spent": category.spent_amount.amount,
                "remaining": category.remaining_budget().amount,
                "utilization_pct": category.utilization_percentage(),
                "variance_pct": category.calculate_variance_percentage(),
                "over_budget": category.is_over_budget()
            }
        return summary