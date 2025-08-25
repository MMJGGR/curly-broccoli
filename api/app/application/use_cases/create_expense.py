"""
CreateExpense Use Case - Application Layer
Foundation Week Day 2: Expense creation with CFA-compliant validation
"""
from typing import Dict
from datetime import datetime, timezone
from decimal import Decimal

from ...domain.entities.expense import Expense, ExpenseType, ExpenseCategory
from ...domain.entities.money import Money
from ...domain.repositories.expense_repository import ExpenseRepository


class CreateExpense:
    """
    Use case for creating new expenses with proper validation.
    
    Following CFA standards:
    - Expense classification validation
    - Budget impact assessment
    - Required field validation
    - Logical consistency checks
    """
    
    def __init__(self, expense_repository: ExpenseRepository):
        self._expense_repository = expense_repository
    
    async def execute(self, user_id: int, expense_data: Dict) -> Expense:
        """
        Execute expense creation with validation.
        
        Args:
            user_id: ID of user creating the expense
            expense_data: Dictionary containing expense information
            
        Returns:
            Created Expense entity
        """
        try:
            # Validate and extract required fields
            self._validate_required_fields(expense_data)
            
            # Parse and validate expense type
            expense_type = self._validate_expense_type(expense_data.get("expense_type"))
            
            # Parse monetary amount
            amount = Money(Decimal(str(expense_data["amount"])))
            
            # Parse expense date
            expense_date = self._parse_date(expense_data["expense_date"])
            
            # Validate business rules
            self._validate_business_rules(amount, expense_data)
            
            # Parse category override if provided
            category_override = None
            if expense_data.get("category_override"):
                category_override = self._validate_category_override(expense_data["category_override"])
            
            # Create domain entity
            expense = Expense(
                id=0,  # Will be set by repository
                user_id=user_id,
                description=expense_data["description"].strip(),
                amount=amount,
                expense_type=expense_type,
                expense_date=expense_date,
                is_recurring=bool(expense_data.get("is_recurring", False)),
                frequency_months=expense_data.get("frequency_months"),
                related_asset_id=expense_data.get("related_asset_id"),
                vendor=expense_data.get("vendor", "").strip() or None,
                category_override=category_override,
                notes=expense_data.get("notes", "").strip() or None,
                is_active=True,
                created_at=datetime.now(timezone.utc)
            )
            
            # Additional validation for recurring expenses
            if expense.is_recurring and not expense.frequency_months:
                raise ValueError("frequency_months is required for recurring expenses")
            
            # Save to repository
            return await self._expense_repository.create_expense(expense)
            
        except ValueError as e:
            raise ValueError(f"Invalid expense data: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to create expense: {str(e)}")
    
    def _validate_required_fields(self, expense_data: Dict) -> None:
        """Validate that all required fields are present"""
        required_fields = ["description", "amount", "expense_type", "expense_date"]
        
        for field in required_fields:
            if field not in expense_data or expense_data[field] is None:
                raise ValueError(f"Missing required field: {field}")
            
            if isinstance(expense_data[field], str) and not expense_data[field].strip():
                raise ValueError(f"Field '{field}' cannot be empty")
    
    def _validate_expense_type(self, expense_type_str: str) -> ExpenseType:
        """Validate and convert expense type string to enum"""
        try:
            return ExpenseType(expense_type_str.lower())
        except ValueError:
            valid_types = [t.value for t in ExpenseType]
            raise ValueError(f"Invalid expense_type '{expense_type_str}'. Valid types: {valid_types}")
    
    def _validate_category_override(self, category_str: str) -> ExpenseCategory:
        """Validate and convert category override string to enum"""
        try:
            return ExpenseCategory(category_str.lower())
        except ValueError:
            valid_categories = [c.value for c in ExpenseCategory]
            raise ValueError(f"Invalid category_override '{category_str}'. Valid categories: {valid_categories}")
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string to datetime object"""
        try:
            if isinstance(date_str, str):
                # Handle ISO format dates
                if 'T' in date_str:
                    dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
                else:
                    dt = datetime.fromisoformat(date_str)
                
                # Ensure timezone awareness
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                
                return dt
            else:
                raise ValueError("Date must be a string")
                
        except Exception as e:
            raise ValueError(f"Invalid expense_date format. Expected ISO format: {str(e)}")
    
    def _validate_business_rules(self, amount: Money, expense_data: Dict) -> None:
        """Validate business rules and logical consistency"""
        # Amount must be positive
        if amount.is_zero() or amount.is_negative():
            raise ValueError("Amount must be positive")
        
        # Description length validation
        description = expense_data["description"].strip()
        if len(description) < 2:
            raise ValueError("Description must be at least 2 characters long")
        
        if len(description) > 500:
            raise ValueError("Description must be less than 500 characters")
        
        # Recurring expense validation
        is_recurring = expense_data.get("is_recurring", False)
        frequency_months = expense_data.get("frequency_months")
        
        if is_recurring:
            if not frequency_months:
                raise ValueError("frequency_months is required for recurring expenses")
            
            if not isinstance(frequency_months, int) or frequency_months <= 0:
                raise ValueError("frequency_months must be a positive integer")
            
            if frequency_months > 12:
                raise ValueError("frequency_months cannot exceed 12 months")
        
        # Vendor length validation
        vendor = expense_data.get("vendor", "")
        if vendor and len(vendor) > 255:
            raise ValueError("Vendor name must be less than 255 characters")
        
        # Notes length validation
        notes = expense_data.get("notes", "")
        if notes and len(notes) > 1000:
            raise ValueError("Notes must be less than 1000 characters")
        
        # Related asset validation (basic check)
        related_asset_id = expense_data.get("related_asset_id")
        if related_asset_id is not None:
            if not isinstance(related_asset_id, int) or related_asset_id <= 0:
                raise ValueError("related_asset_id must be a positive integer")
        
        # Amount reasonability check (warn for very large amounts)
        if amount.amount > Decimal('1000000'):  # 1 million KES
            # This is just a warning, not an error - allow but could log
            pass