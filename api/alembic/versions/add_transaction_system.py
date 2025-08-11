"""Add transaction and account enhancements for real data integration

Revision ID: add_transaction_system
Revises: 934447535d51
Create Date: 2024-08-08 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime

# revision identifiers
revision = 'add_transaction_system'
down_revision = '934447535d51_add_risk_score_and_risk_level_to_'
branch_labels = None
depends_on = None

def upgrade():
    # Enhance accounts table
    op.add_column('accounts', sa.Column('account_number', sa.String(), nullable=True))
    op.add_column('accounts', sa.Column('institution_id', sa.String(), nullable=True))
    op.add_column('accounts', sa.Column('is_active', sa.Boolean(), nullable=False, default=True))
    op.add_column('accounts', sa.Column('last_sync', sa.DateTime(), nullable=True))
    op.add_column('accounts', sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow))
    op.add_column('accounts', sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow))
    
    # Alter accounts balance column to have default
    op.alter_column('accounts', 'balance', server_default='0.0')
    
    # Enhance transactions table
    op.alter_column('transactions', 'date', type_=sa.Date(), existing_type=sa.String())
    op.add_column('transactions', sa.Column('transaction_type', sa.String(), nullable=True))
    op.add_column('transactions', sa.Column('subcategory', sa.String(), nullable=True))
    op.add_column('transactions', sa.Column('merchant', sa.String(), nullable=True))
    op.add_column('transactions', sa.Column('reference_id', sa.String(), nullable=True))
    op.add_column('transactions', sa.Column('is_reconciled', sa.Boolean(), nullable=False, default=False))
    op.add_column('transactions', sa.Column('is_pending', sa.Boolean(), nullable=False, default=False))
    op.add_column('transactions', sa.Column('notes', sa.String(), nullable=True))
    op.add_column('transactions', sa.Column('import_source', sa.String(), nullable=True))
    op.add_column('transactions', sa.Column('import_batch_id', sa.String(), nullable=True))
    op.add_column('transactions', sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow))
    op.add_column('transactions', sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow))
    op.add_column('transactions', sa.Column('expense_category_id', sa.Integer(), nullable=True))
    
    # Add foreign key constraint for expense_category_id
    op.create_foreign_key(None, 'transactions', 'expense_categories', ['expense_category_id'], ['id'])
    
    # Drop old account column from transactions (replaced by account_id)
    op.drop_column('transactions', 'account')
    
    # Enhance expense_categories table
    op.add_column('expense_categories', sa.Column('actual_amount', sa.Float(), nullable=False, default=0.0))
    op.add_column('expense_categories', sa.Column('category_type', sa.String(), nullable=False, default='expense'))
    op.add_column('expense_categories', sa.Column('is_active', sa.Boolean(), nullable=False, default=True))
    op.add_column('expense_categories', sa.Column('budget_period', sa.String(), nullable=False, default='monthly'))
    op.add_column('expense_categories', sa.Column('parent_category_id', sa.Integer(), nullable=True))
    op.add_column('expense_categories', sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow))
    op.add_column('expense_categories', sa.Column('updated_at', sa.DateTime(), nullable=False, default=datetime.utcnow))
    
    # Add foreign key constraint for parent_category_id (self-referential)
    op.create_foreign_key(None, 'expense_categories', 'expense_categories', ['parent_category_id'], ['id'])
    
    # Alter expense_categories budgeted_amount column to have default
    op.alter_column('expense_categories', 'budgeted_amount', server_default='0.0')
    
    # Create indexes for better performance
    op.create_index('idx_transactions_date', 'transactions', ['date'])
    op.create_index('idx_transactions_user_date', 'transactions', ['user_id', 'date'])
    op.create_index('idx_transactions_account_date', 'transactions', ['account_id', 'date'])
    op.create_index('idx_transactions_category', 'transactions', ['category'])
    op.create_index('idx_accounts_user_active', 'accounts', ['user_id', 'is_active'])
    op.create_index('idx_expense_categories_user_active', 'expense_categories', ['user_id', 'is_active'])

def downgrade():
    # Remove indexes
    op.drop_index('idx_expense_categories_user_active', 'expense_categories')
    op.drop_index('idx_accounts_user_active', 'accounts')
    op.drop_index('idx_transactions_category', 'transactions')
    op.drop_index('idx_transactions_account_date', 'transactions')
    op.drop_index('idx_transactions_user_date', 'transactions')
    op.drop_index('idx_transactions_date', 'transactions')
    
    # Remove expense_categories enhancements
    op.drop_constraint(None, 'expense_categories', type_='foreignkey')
    op.drop_column('expense_categories', 'updated_at')
    op.drop_column('expense_categories', 'created_at')
    op.drop_column('expense_categories', 'parent_category_id')
    op.drop_column('expense_categories', 'budget_period')
    op.drop_column('expense_categories', 'is_active')
    op.drop_column('expense_categories', 'category_type')
    op.drop_column('expense_categories', 'actual_amount')
    op.alter_column('expense_categories', 'budgeted_amount', server_default=None)
    
    # Add back account column to transactions
    op.add_column('transactions', sa.Column('account', sa.String(), nullable=True))
    
    # Remove transactions enhancements
    op.drop_constraint(None, 'transactions', type_='foreignkey')
    op.drop_column('transactions', 'expense_category_id')
    op.drop_column('transactions', 'updated_at')
    op.drop_column('transactions', 'created_at')
    op.drop_column('transactions', 'import_batch_id')
    op.drop_column('transactions', 'import_source')
    op.drop_column('transactions', 'notes')
    op.drop_column('transactions', 'is_pending')
    op.drop_column('transactions', 'is_reconciled')
    op.drop_column('transactions', 'reference_id')
    op.drop_column('transactions', 'merchant')
    op.drop_column('transactions', 'subcategory')
    op.drop_column('transactions', 'transaction_type')
    op.alter_column('transactions', 'date', type_=sa.String(), existing_type=sa.Date())
    
    # Remove accounts enhancements
    op.drop_column('accounts', 'updated_at')
    op.drop_column('accounts', 'created_at')
    op.drop_column('accounts', 'last_sync')
    op.drop_column('accounts', 'is_active')
    op.drop_column('accounts', 'institution_id')
    op.drop_column('accounts', 'account_number')
    op.alter_column('accounts', 'balance', server_default=None)