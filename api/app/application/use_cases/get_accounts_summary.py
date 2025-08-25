"""
GetAccountsSummary Use Case - Application Layer
Foundation Week: Core use case for comprehensive account summary with CFA compliance
"""
from typing import Dict, List
from decimal import Decimal

from ...domain.entities.money import Money
from ...domain.entities.account import Account
from ...domain.repositories.account_repository import AccountRepository


class GetAccountsSummary:
    """
    Use case for retrieving comprehensive accounts summary.
    
    Following CFA standards:
    - Calculates net worth as Assets - Liabilities
    - Provides accurate asset/liability categorization
    - Uses decimal precision for financial calculations
    - Returns properly formatted financial data
    """
    
    def __init__(self, account_repository: AccountRepository):
        self._account_repository = account_repository
    
    async def execute(self, user_id: int) -> Dict:
        """
        Execute accounts summary retrieval.
        
        Args:
            user_id: ID of user to get summary for
            
        Returns:
            Dictionary containing:
            - user_id: User identifier
            - accounts: List of account details
            - summary: Aggregated financial metrics
        """
        try:
            # Get all user accounts
            accounts = await self._account_repository.get_user_accounts(user_id)
            
            # Calculate summary metrics
            summary = self._calculate_summary_metrics(accounts)
            
            # Format account details
            account_details = self._format_account_details(accounts)
            
            return {
                "user_id": user_id,
                "accounts": account_details,
                "summary": summary
            }
            
        except Exception as e:
            # Re-raise with context for better error handling
            raise Exception(f"Failed to get accounts summary for user {user_id}: {str(e)}")
    
    def _calculate_summary_metrics(self, accounts: List[Account]) -> Dict:
        """
        Calculate summary financial metrics following CFA standards.
        
        Args:
            accounts: List of user accounts
            
        Returns:
            Dictionary with calculated metrics
        """
        total_assets = Money.zero()
        total_liabilities = Money.zero()
        active_accounts = 0
        
        for account in accounts:
            if account.is_active:
                active_accounts += 1
                
            if account.is_asset:
                # Assets contribute positively to net worth
                total_assets = total_assets.add(account.balance)
            elif account.is_liability:
                # Liabilities reduce net worth (use absolute value for liability total)
                total_liabilities = total_liabilities.add(account.display_balance)
        
        # Calculate net worth using CFA standard: Assets - Liabilities
        net_worth = total_assets.subtract(total_liabilities)
        
        return {
            "total_accounts": len(accounts),
            "active_accounts": active_accounts,
            "total_assets": total_assets,
            "total_liabilities": total_liabilities,
            "net_worth": net_worth
        }
    
    def _format_account_details(self, accounts: List[Account]) -> List[Dict]:
        """
        Format account details for API response.
        
        Args:
            accounts: List of account entities
            
        Returns:
            List of formatted account dictionaries
        """
        formatted_accounts = []
        
        for account in accounts:
            account_detail = {
                "id": account.id,
                "name": account.name,
                "type": account.account_type.value,
                "balance": account.balance,
                "display_balance": account.display_balance,
                "institution": account.institution,
                "last_four": account.account_number,
                "is_active": account.is_active,
                "is_asset": account.is_asset,
                "is_liability": account.is_liability,
                "category": account.get_account_category(),
                "net_worth_contribution": account.contribution_to_net_worth,
                "created_at": account.created_at.isoformat(),
                "updated_at": account.updated_at.isoformat() if account.updated_at else None
            }
            formatted_accounts.append(account_detail)
        
        # Sort by account type (assets first) then by balance (highest first)
        formatted_accounts.sort(key=lambda acc: (
            0 if acc["is_asset"] else 1,  # Assets first
            -float(acc["balance"].amount)  # Higher balance first within category
        ))
        
        return formatted_accounts


class AccountsSummaryResponse:
    """
    Response model for accounts summary to ensure consistent API responses.
    """
    
    def __init__(self, user_id: int, accounts: List[Dict], summary: Dict):
        self.user_id = user_id
        self.accounts = accounts
        self.summary = summary
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for JSON serialization"""
        return {
            "user_id": self.user_id,
            "accounts": [
                {
                    **account,
                    "balance": account["balance"].to_dict(),
                    "display_balance": account["display_balance"].to_dict(),
                    "net_worth_contribution": account["net_worth_contribution"].to_dict()
                }
                for account in self.accounts
            ],
            "summary": {
                "total_accounts": self.summary["total_accounts"],
                "active_accounts": self.summary["active_accounts"],
                "total_assets": self.summary["total_assets"].to_dict(),
                "total_liabilities": self.summary["total_liabilities"].to_dict(),
                "net_worth": self.summary["net_worth"].to_dict()
            }
        }
    
    @property
    def net_worth(self) -> Money:
        """Get net worth as Money object"""
        return self.summary["net_worth"]
    
    @property
    def total_assets(self) -> Money:
        """Get total assets as Money object"""
        return self.summary["total_assets"]
    
    @property
    def total_liabilities(self) -> Money:
        """Get total liabilities as Money object"""
        return self.summary["total_liabilities"]
    
    @property
    def asset_liability_ratio(self) -> Decimal:
        """Calculate asset to liability ratio (CFA metric)"""
        if self.total_liabilities.is_zero():
            return Decimal('999.99')  # Effectively infinite if no liabilities
        
        return (self.total_assets.amount / self.total_liabilities.amount).quantize(
            Decimal('0.01')
        )
    
    @property
    def financial_health_status(self) -> str:
        """Determine financial health based on CFA guidelines"""
        if self.net_worth.is_negative():
            return "needs_improvement"
        elif self.asset_liability_ratio >= Decimal('2.00'):
            return "excellent"
        elif self.asset_liability_ratio >= Decimal('1.50'):
            return "good"
        else:
            return "fair"