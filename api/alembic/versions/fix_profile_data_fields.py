"""Add missing profile fields for proper data display

Revision ID: fix_profile_data_fields
Revises: add_transaction_system
Create Date: 2025-08-09 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'fix_profile_data_fields'
down_revision = 'add_transaction_system'
branch_labels = None
depends_on = None

def upgrade():
    # Add missing financial fields to profiles table for proper data display
    
    # Add missing financial tracking fields
    op.add_column('profiles', sa.Column('monthly_income', sa.Float(), nullable=True))
    op.add_column('profiles', sa.Column('monthly_expenses', sa.Float(), nullable=True))
    op.add_column('profiles', sa.Column('current_savings', sa.Float(), nullable=True))
    op.add_column('profiles', sa.Column('monthly_debt_payments', sa.Float(), nullable=True))
    op.add_column('profiles', sa.Column('emergency_fund_target', sa.Float(), nullable=True))
    op.add_column('profiles', sa.Column('retirement_age', sa.Integer(), nullable=True))
    
    # Add consistent naming alias for nationalId
    op.add_column('profiles', sa.Column('national_id', sa.String(), nullable=True))
    
    # Populate national_id from existing nationalId data
    op.execute("UPDATE profiles SET national_id = nationalId WHERE nationalId IS NOT NULL")
    
    # Populate monthly_income from annual_income where available
    op.execute("UPDATE profiles SET monthly_income = annual_income / 12 WHERE annual_income IS NOT NULL AND annual_income > 0")
    
    print("✅ Added missing profile fields for proper data display")

def downgrade():
    # Remove added columns
    op.drop_column('profiles', 'retirement_age')
    op.drop_column('profiles', 'emergency_fund_target') 
    op.drop_column('profiles', 'monthly_debt_payments')
    op.drop_column('profiles', 'current_savings')
    op.drop_column('profiles', 'monthly_expenses')
    op.drop_column('profiles', 'monthly_income')
    op.drop_column('profiles', 'national_id')