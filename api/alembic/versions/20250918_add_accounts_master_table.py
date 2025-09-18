"""
Add accounts_master (Chart of Accounts)
"""
from alembic import op
import sqlalchemy as sa

revision = '20250918_add_accounts_master_table'
down_revision = '20250918_add_journal_entries_table'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'accounts_master',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('code', sa.String(length=20), nullable=False, index=True),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('type', sa.String(length=20), nullable=False),
        sa.Column('is_active', sa.Boolean(), server_default=sa.text('true'), nullable=False)
    )


def downgrade():
    op.drop_table('accounts_master')

