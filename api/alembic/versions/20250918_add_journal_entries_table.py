"""
Add journal_entries table for server-side ledger of postings
"""
from alembic import op
import sqlalchemy as sa

revision = '20250918_add_journal_entries_table'
down_revision = '20250918_add_tb_audit_entries_table'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'journal_entries',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False, index=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('lines_json', sa.Text(), nullable=False),
        sa.Column('is_balanced', sa.Boolean(), nullable=False, server_default=sa.text('false')),
        sa.Column('meta_json', sa.Text(), nullable=True)
    )


def downgrade():
    op.drop_table('journal_entries')

