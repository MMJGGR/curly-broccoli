"""
Income SQLAlchemy Model - Clean Architecture Infrastructure
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import BaseModel


class IncomeModel(BaseModel):
    """SQLAlchemy model for income data"""
    
    __tablename__ = "incomes"
    
    # Core fields
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    description = Column(String(255), nullable=False)
    
    # Money fields
    amount = Column(Float, nullable=False)
    currency = Column(String(3), nullable=False, default="KES")
    
    # Income classification
    income_type = Column(String(50), nullable=False)  # IncomeType enum value
    frequency = Column(String(20), nullable=False)     # IncomeFrequency enum value
    
    # Temporal characteristics
    is_recurring = Column(Boolean, default=True)
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    temporal_pattern = Column(String(20), nullable=False, default="permanent")
    
    # Asset relationship (KISS user selection)
    linked_asset_id = Column(Integer, ForeignKey("assets.id"), nullable=True, index=True)
    asset_relationship_type = Column(String(50), nullable=True)
    
    # Tax and planning
    is_taxable = Column(Boolean, default=True)
    tax_category = Column(String(20), nullable=True)
    growth_rate = Column(Float, nullable=True)
    
    # Metadata
    is_active = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    
    # Relationships
    user = relationship("UserModel", back_populates="incomes")
    linked_asset = relationship("AssetModel", back_populates="income_streams")