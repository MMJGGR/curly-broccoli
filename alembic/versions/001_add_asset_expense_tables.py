"""Add asset and expense tables for Foundation Week balance sheet tracking

Revision ID: 001_asset_expense
Revises: 
Create Date: 2025-08-25 17:52:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_asset_expense'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create assets table
    op.create_table('assets',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('asset_type', sa.String(length=50), nullable=False),
        sa.Column('current_value', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('acquisition_cost', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('acquisition_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('useful_life_years', sa.Integer(), nullable=True),
        sa.Column('related_liability_id', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('location', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.Index('idx_assets_user_id', 'user_id'),
        sa.Index('idx_assets_asset_type', 'asset_type'),
        sa.Index('idx_assets_is_active', 'is_active')
    )

    # Create expenses table
    op.create_table('expenses',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('description', sa.String(length=500), nullable=False),
        sa.Column('amount', sa.Numeric(precision=15, scale=2), nullable=False),
        sa.Column('expense_type', sa.String(length=50), nullable=False),
        sa.Column('expense_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_recurring', sa.Boolean(), nullable=False, default=False),
        sa.Column('frequency_months', sa.Integer(), nullable=True),
        sa.Column('related_asset_id', sa.Integer(), nullable=True),
        sa.Column('vendor', sa.String(length=255), nullable=True),
        sa.Column('category_override', sa.String(length=50), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['related_asset_id'], ['assets.id'], ondelete='SET NULL'),
        sa.Index('idx_expenses_user_id', 'user_id'),
        sa.Index('idx_expenses_expense_type', 'expense_type'),
        sa.Index('idx_expenses_expense_date', 'expense_date'),
        sa.Index('idx_expenses_is_recurring', 'is_recurring'),
        sa.Index('idx_expenses_is_active', 'is_active')
    )

    # Add check constraints for data validation
    op.create_check_constraint(
        'chk_assets_current_value_positive', 
        'assets', 
        'current_value >= 0'
    )
    
    op.create_check_constraint(
        'chk_assets_acquisition_cost_positive', 
        'assets', 
        'acquisition_cost >= 0'
    )
    
    op.create_check_constraint(
        'chk_expenses_amount_positive', 
        'expenses', 
        'amount > 0'
    )
    
    op.create_check_constraint(
        'chk_expenses_frequency_valid', 
        'expenses', 
        '(is_recurring = false) OR (is_recurring = true AND frequency_months > 0)'
    )

    # Add asset type constraints (valid enum values)
    asset_types = [
        'cash_equivalent', 'checking_account', 'savings_account', 'money_market', 
        'certificates_deposit', 'equity_investment', 'bond_investment', 'mutual_funds', 
        'etf', 'retirement_401k', 'retirement_ira', 'brokerage_account', 'real_estate', 
        'vehicle', 'equipment', 'furniture', 'collectibles', 'precious_metals', 
        'intellectual_property', 'business_ownership', 'other'
    ]
    
    op.create_check_constraint(
        'chk_assets_type_valid',
        'assets',
        f"asset_type IN ({', '.join([f"'{t}'" for t in asset_types])})"
    )

    # Add expense type constraints (valid enum values)
    expense_types = [
        'housing', 'utilities', 'maintenance_repairs', 'property_tax', 'home_insurance',
        'transportation', 'vehicle_payment', 'fuel', 'vehicle_insurance', 'vehicle_maintenance',
        'public_transport', 'food_dining', 'groceries', 'restaurants', 'healthcare',
        'health_insurance', 'medical_expenses', 'dental', 'vision', 'pharmacy',
        'insurance', 'life_insurance', 'disability_insurance', 'debt_payment',
        'credit_card', 'student_loan', 'personal_loan', 'personal_care', 'clothing',
        'grooming', 'entertainment', 'hobbies', 'travel', 'subscriptions',
        'education', 'training', 'books_supplies', 'charity_gifts', 'business_expense',
        'taxes', 'miscellaneous'
    ]
    
    op.create_check_constraint(
        'chk_expenses_type_valid',
        'expenses',
        f"expense_type IN ({', '.join([f"'{t}'" for t in expense_types])})"
    )

    # Add category override constraints
    expense_categories = ['fixed_expenses', 'variable_expenses', 'discretionary_expenses']
    op.create_check_constraint(
        'chk_expenses_category_override_valid',
        'expenses',
        f"category_override IS NULL OR category_override IN ({', '.join([f"'{c}'" for c in expense_categories])})"
    )


def downgrade() -> None:
    # Drop tables in reverse order due to foreign key constraints
    op.drop_table('expenses')
    op.drop_table('assets')