"""
Financial Event Domain Entity - Event Sourcing for Historical Data Management
CFA-compliant temporal tracking of all financial data changes
"""
from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Any, Optional, List
from decimal import Decimal
from enum import Enum


class EventType(Enum):
    """Types of financial events we track"""
    # User Profile Changes
    EMPLOYMENT_UPDATED = "employment_updated"
    PERSONAL_INFO_UPDATED = "personal_info_updated"
    RISK_PROFILE_UPDATED = "risk_profile_updated"
    
    # Asset Events
    ASSET_CREATED = "asset_created"
    ASSET_UPDATED = "asset_updated"
    ASSET_DELETED = "asset_deleted"
    ASSET_REVALUATION = "asset_revaluation"
    
    # Liability Events
    LIABILITY_CREATED = "liability_created"
    LIABILITY_UPDATED = "liability_updated"
    LIABILITY_DELETED = "liability_deleted"
    LIABILITY_PAYMENT = "liability_payment"
    
    # Income & Expense Events
    INCOME_UPDATED = "income_updated"
    EXPENSE_CREATED = "expense_created"
    EXPENSE_UPDATED = "expense_updated"
    EXPENSE_DELETED = "expense_deleted"
    
    # Discount Rate Events
    DISCOUNT_RATE_UPDATED = "discount_rate_updated"
    DISCOUNT_RATE_OVERRIDE = "discount_rate_override"
    
    # Goal Events
    GOAL_CREATED = "goal_created"
    GOAL_UPDATED = "goal_updated"
    GOAL_ACHIEVED = "goal_achieved"
    
    # System Events
    BALANCE_SHEET_CALCULATED = "balance_sheet_calculated"
    MARKET_DATA_UPDATED = "market_data_updated"


class EventSource(Enum):
    """Source of the financial event"""
    USER_ACTION = "user_action"
    SYSTEM_UPDATE = "system_update"
    MARKET_DATA = "market_data"
    ADVISOR_UPDATE = "advisor_update"
    SCHEDULED_TASK = "scheduled_task"


@dataclass(frozen=True)
class ImpactAnalysis:
    """Analysis of how an event impacts the user's financial position"""
    net_worth_impact: Decimal
    human_capital_impact: Decimal
    expense_liability_impact: Decimal
    liquidity_impact: Decimal
    risk_profile_impact: str  # "increased", "decreased", "unchanged"
    confidence_level: float  # 0.0 to 1.0
    
    # Specific impacts
    monthly_cash_flow_impact: Optional[Decimal] = None
    goal_timeline_impact: Dict[str, int] = None  # goal_id -> months_change
    discount_rate_impact: Optional[Decimal] = None


@dataclass(frozen=True)
class FinancialEvent:
    """
    Domain entity representing a single financial event in the user's history
    Implements event sourcing pattern for complete audit trail
    """
    # Core Event Identification
    event_id: str
    user_id: int
    event_type: EventType
    event_source: EventSource
    
    # Temporal Information
    event_timestamp: datetime
    business_date: datetime  # The date this event is effective for business logic
    
    # Event Data
    entity_type: str  # "asset", "liability", "income", "expense", etc.
    entity_id: Optional[str]  # ID of the affected entity (None for user-level events)
    
    # Change Tracking
    old_data: Dict[str, Any]  # Previous state
    new_data: Dict[str, Any]  # New state
    delta_data: Dict[str, Any]  # Just the changes
    
    # Context & Reasoning
    change_reason: str
    created_by: str  # user_id, system, advisor_id
    
    # Optional fields with defaults
    change_notes: Optional[str] = None
    correlation_id: Optional[str] = None  # Link related events
    impact_analysis: Optional[ImpactAnalysis] = None
    source_system: str = "curly_broccoli"
    api_version: str = "v2"
    professional_review_required: bool = False
    cfa_compliance_notes: Optional[str] = None
    
    def __post_init__(self):
        """Validate event consistency"""
        # Ensure timestamps are logical
        if self.event_timestamp > datetime.now():
            raise ValueError("Event timestamp cannot be in the future")
        
        # Validate data integrity
        if self.entity_id and not self.entity_type:
            raise ValueError("Entity ID requires entity type")
        
        # Ensure change tracking is consistent
        if not self.old_data and not self.new_data:
            raise ValueError("Event must have either old_data or new_data")


@dataclass
class FinancialSnapshot:
    """
    Point-in-time snapshot of user's complete financial state
    Generated periodically for performance optimization
    """
    # Core Identification
    snapshot_id: str
    user_id: int
    snapshot_timestamp: datetime
    business_date: datetime
    
    # Financial Position
    total_assets: Decimal
    total_liabilities: Decimal
    net_worth: Decimal
    liquid_net_worth: Decimal
    
    # Lifetime Calculations
    human_capital_value: Decimal
    expense_liability_value: Decimal
    lifetime_net_worth: Decimal
    
    # Discount Rates Used
    human_capital_discount_rate: Decimal
    essential_expense_rate: Decimal
    discretionary_expense_rate: Decimal
    
    # Asset Breakdown
    asset_categories: Dict[str, Decimal]
    liability_categories: Dict[str, Decimal]
    
    # Risk Metrics
    liquidity_ratio: Decimal
    debt_to_asset_ratio: Decimal
    debt_to_income_ratio: Decimal
    
    # Income & Expense Summary
    monthly_income: Decimal
    monthly_expenses: Decimal
    monthly_surplus: Decimal
    
    # Goal Progress
    goal_progress: Dict[str, float]  # goal_id -> completion_percentage
    
    # Source Events - Required field
    last_event_id: str  # Last event included in this snapshot
    
    # Metadata - Optional fields with defaults
    calculation_method: str = "clean_architecture"
    data_quality_score: float = 1.0  # 0.0 to 1.0
    cfa_compliant: bool = True
    event_count_since_last_snapshot: int = 0


@dataclass
class EventQuery:
    """Query object for retrieving historical events"""
    user_id: int
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    event_types: Optional[List[EventType]] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    limit: int = 100
    offset: int = 0
    
    # Ordering
    order_by: str = "event_timestamp"
    order_direction: str = "DESC"  # ASC or DESC


@dataclass
class TemporalReconstructionResult:
    """Result of reconstructing entity state at a specific point in time"""
    entity_id: str
    entity_type: str
    reconstruction_timestamp: datetime
    reconstructed_data: Dict[str, Any]
    
    # Metadata
    events_applied: List[str]  # List of event IDs used
    reconstruction_confidence: float  # 0.0 to 1.0
    data_completeness: float  # 0.0 to 1.0
    
    # Warnings
    missing_data_warnings: List[str] = None
    reconstruction_assumptions: List[str] = None


class FinancialEventRepository:
    """Abstract repository for financial events"""
    
    def save_event(self, event: FinancialEvent) -> str:
        """Save a financial event and return the event ID"""
        raise NotImplementedError
    
    def get_event(self, event_id: str) -> Optional[FinancialEvent]:
        """Retrieve a specific event by ID"""
        raise NotImplementedError
    
    def query_events(self, query: EventQuery) -> List[FinancialEvent]:
        """Query events based on criteria"""
        raise NotImplementedError
    
    def get_user_timeline(self, user_id: int, limit: int = 50) -> List[FinancialEvent]:
        """Get recent events for a user as a timeline"""
        raise NotImplementedError
    
    def save_snapshot(self, snapshot: FinancialSnapshot) -> str:
        """Save a financial snapshot"""
        raise NotImplementedError
    
    def get_latest_snapshot(self, user_id: int) -> Optional[FinancialSnapshot]:
        """Get the most recent snapshot for a user"""
        raise NotImplementedError
    
    def reconstruct_entity_at_date(
        self, 
        entity_id: str, 
        entity_type: str, 
        target_date: datetime
    ) -> TemporalReconstructionResult:
        """Reconstruct entity state at a specific date using events"""
        raise NotImplementedError


# Factory functions for common events
def create_asset_updated_event(
    user_id: int,
    asset_id: str,
    old_asset_data: Dict[str, Any],
    new_asset_data: Dict[str, Any],
    change_reason: str,
    impact_analysis: Optional[ImpactAnalysis] = None
) -> FinancialEvent:
    """Factory function to create asset updated event"""
    
    # Calculate delta
    delta_data = {}
    for key, new_value in new_asset_data.items():
        old_value = old_asset_data.get(key)
        if old_value != new_value:
            delta_data[key] = {"old": old_value, "new": new_value}
    
    return FinancialEvent(
        event_id=f"asset_update_{asset_id}_{int(datetime.now().timestamp())}",
        user_id=user_id,
        event_type=EventType.ASSET_UPDATED,
        event_source=EventSource.USER_ACTION,
        event_timestamp=datetime.now(),
        business_date=datetime.now().date(),
        entity_type="asset",
        entity_id=asset_id,
        old_data=old_asset_data,
        new_data=new_asset_data,
        delta_data=delta_data,
        change_reason=change_reason,
        impact_analysis=impact_analysis,
        created_by=str(user_id)
    )


def create_employment_updated_event(
    user_id: int,
    old_employment_data: Dict[str, Any],
    new_employment_data: Dict[str, Any],
    change_reason: str,
    impact_analysis: Optional[ImpactAnalysis] = None
) -> FinancialEvent:
    """Factory function to create employment updated event"""
    
    # Calculate delta
    delta_data = {}
    for key, new_value in new_employment_data.items():
        old_value = old_employment_data.get(key)
        if old_value != new_value:
            delta_data[key] = {"old": old_value, "new": new_value}
    
    return FinancialEvent(
        event_id=f"employment_update_{user_id}_{int(datetime.now().timestamp())}",
        user_id=user_id,
        event_type=EventType.EMPLOYMENT_UPDATED,
        event_source=EventSource.USER_ACTION,
        event_timestamp=datetime.now(),
        business_date=datetime.now().date(),
        entity_type="employment_profile",
        entity_id=str(user_id),
        old_data=old_employment_data,
        new_data=new_employment_data,
        delta_data=delta_data,
        change_reason=change_reason,
        impact_analysis=impact_analysis,
        created_by=str(user_id),
        professional_review_required=True  # Employment changes affect discount rates
    )