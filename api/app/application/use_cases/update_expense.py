"""
UpdateExpense Use Case - Application Layer
Foundation Week Day 2: Expense updates with CFA-compliant validation
"""
from typing import Dict
from datetime import datetime, timezone
from decimal import Decimal

from ...domain.entities.expense import Expense, ExpenseType, ExpenseCategory
from ...domain.entities.money import Money
from ...domain.repositories.expense_repository import ExpenseRepository


class UpdateExpense:
    """
    Use case for updating existing expenses with proper validation.
    
    Following CFA standards:
    - Expense classification validation
    - Budget impact reassessment
    - Business rule enforcement
    - Audit trail maintenance
    """
    
    def __init__(self, expense_repository: ExpenseRepository):
        self._expense_repository = expense_repository
    
    async def execute(self, user_id: int, expense_id: int, expense_data: Dict) -> Expense:
        """
        Execute expense update with validation.
        
        Args:
            user_id: ID of user updating the expense
            expense_id: ID of expense to update
            expense_data: Dictionary containing updated expense information
            
        Returns:
            Updated Expense entity
        """
        try:
            # Get existing expense
            existing_expense = await self._expense_repository.get_expense_by_id(user_id, expense_id)
            
            if not existing_expense:
                raise ValueError(f"Expense {expense_id} not found or not owned by user {user_id}")
            
            # Validate update data
            self._validate_update_data(expense_data)
            
            # Create updated expense entity
            updated_expense = self._create_updated_expense(existing_expense, expense_data)
            
            # Save to repository
            return await self._expense_repository.update_expense(updated_expense)
            
        except ValueError as e:
            raise ValueError(f"Invalid expense update data: {str(e)}")
        except Exception as e:
            raise Exception(f"Failed to update expense: {str(e)}")
    
    def _validate_update_data(self, expense_data: Dict) -> None:
        """Validate update data (similar to create but allows partial updates)"""
        # Validate expense type if provided
        if "expense_type" in expense_data:
            try:
                ExpenseType(expense_data["expense_type"].lower())
            except ValueError:
                valid_types = [t.value for t in ExpenseType]
                raise ValueError(f"Invalid expense_type '{expense_data['expense_type']}'. Valid types: {valid_types}")
        
        # Validate category override if provided
        if "category_override" in expense_data and expense_data["category_override"]:
            try:
                ExpenseCategory(expense_data["category_override"].lower())
            except ValueError:
                valid_categories = [c.value for c in ExpenseCategory]
                raise ValueError(f"Invalid category_override '{expense_data['category_override']}'. Valid categories: {valid_categories}")
        
        # Validate amount if provided
        if "amount" in expense_data:
            try:
                amount = Decimal(str(expense_data["amount"]))
                if amount <= 0:
                    raise ValueError("Amount must be positive")
                if amount > Decimal('1000000'):  # 1 million KES warning threshold
                    pass  # Could log warning but allow
            except (ValueError, TypeError):
                raise ValueError("Invalid amount. Must be a valid positive number")
        
        # Validate description if provided
        if "description" in expense_data:
            description = str(expense_data["description"]).strip()
            if len(description) < 2:
                raise ValueError("Description must be at least 2 characters long")
            if len(description) > 500:
                raise ValueError("Description must be less than 500 characters")
        
        # Validate recurring expense settings
        if "is_recurring" in expense_data or "frequency_months" in expense_data:
            is_recurring = expense_data.get("is_recurring", False)
            frequency_months = expense_data.get("frequency_months")
            
            if is_recurring and not frequency_months:
                raise ValueError("frequency_months is required for recurring expenses")
            
            if frequency_months is not None:
                if not isinstance(frequency_months, int) or frequency_months <= 0:
                    raise ValueError("frequency_months must be a positive integer")
                if frequency_months > 12:
                    raise ValueError("frequency_months cannot exceed 12 months")
        
        # Validate vendor length if provided
        if "vendor" in expense_data and expense_data["vendor"]:
            if len(str(expense_data["vendor"])) > 255:
                raise ValueError("Vendor name must be less than 255 characters")
        
        # Validate notes length if provided
        if "notes" in expense_data and expense_data["notes"]:
            if len(str(expense_data["notes"])) > 1000:
                raise ValueError("Notes must be less than 1000 characters")
        
        # Validate related asset ID if provided
        if "related_asset_id" in expense_data and expense_data["related_asset_id"] is not None:
            if not isinstance(expense_data["related_asset_id"], int) or expense_data["related_asset_id"] <= 0:
                raise ValueError("related_asset_id must be a positive integer")
        
        # Validate expense date if provided
        if "expense_date" in expense_data:
            self._parse_date(expense_data["expense_date"])
    
    def _create_updated_expense(self, existing_expense: Expense, expense_data: Dict) -> Expense:
        """Create updated expense entity with new values"""
        # Start with existing expense values
        updated_values = {
            "id": existing_expense.id,
            "user_id": existing_expense.user_id,
            "description": existing_expense.description,
            "amount": existing_expense.amount,
            "expense_type": existing_expense.expense_type,
            "expense_date": existing_expense.expense_date,
            "is_recurring": existing_expense.is_recurring,
            "frequency_months": existing_expense.frequency_months,
            "related_asset_id": existing_expense.related_asset_id,
            "vendor": existing_expense.vendor,
            "category_override": existing_expense.category_override,
            "notes": existing_expense.notes,
            "is_active": existing_expense.is_active,
            "created_at": existing_expense.created_at,
            "updated_at": datetime.now(timezone.utc)
        }
        
        # Apply updates
        if "description" in expense_data:
            updated_values["description"] = expense_data["description"].strip()
        
        if "amount" in expense_data:
            updated_values["amount"] = Money(Decimal(str(expense_data["amount"])))
        
        if "expense_type" in expense_data:
            updated_values["expense_type"] = ExpenseType(expense_data["expense_type"].lower())
        
        if "expense_date" in expense_data:
            updated_values["expense_date"] = self._parse_date(expense_data["expense_date"])
        
        if "is_recurring" in expense_data:
            updated_values["is_recurring"] = bool(expense_data["is_recurring"])
        
        if "frequency_months" in expense_data:
            updated_values["frequency_months"] = expense_data["frequency_months"]
        
        if "related_asset_id" in expense_data:
            updated_values["related_asset_id"] = expense_data["related_asset_id"]
        
        if "vendor" in expense_data:
            vendor = expense_data["vendor"]
            updated_values["vendor"] = vendor.strip() if vendor else None
        
        if "category_override" in expense_data:
            category_override = expense_data["category_override"]
            if category_override:
                updated_values["category_override"] = ExpenseCategory(category_override.lower())
            else:
                updated_values["category_override"] = None
        
        if "notes" in expense_data:
            notes = expense_data["notes"]
            updated_values["notes"] = notes.strip() if notes else None
        
        if "is_active" in expense_data:
            updated_values["is_active"] = bool(expense_data["is_active"])
        
        return Expense(**updated_values)
    
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