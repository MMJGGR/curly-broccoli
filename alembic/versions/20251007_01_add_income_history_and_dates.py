"""add income history and start/end dates

Revision ID: 20251007_01
Revises: 
Create Date: 2025-10-07 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20251007_01'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # Add start_date and end_date to income_sources (nullable)
    with op.batch_alter_table('income_sources') as batch_op:
        batch_op.add_column(sa.Column('start_date', sa.DateTime(timezone=True), nullable=True))
        batch_op.add_column(sa.Column('end_date', sa.DateTime(timezone=True), nullable=True))

    # Create income_source_history table
    op.create_table(
        'income_source_history',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('income_source_id', sa.Integer(), sa.ForeignKey('income_sources.id'), nullable=False, index=True),
        sa.Column('effective_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('frequency', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade():
    op.drop_table('income_source_history')
    with op.batch_alter_table('income_sources') as batch_op:
        batch_op.drop_column('end_date')
        batch_op.drop_column('start_date')

