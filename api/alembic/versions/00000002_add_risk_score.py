"""add risk_score to user_profiles

Revision ID: 00000002
Revises: 00000001
Create Date: 2025-07-12 00:00:00.000000
"""

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.add_column("user_profiles", sa.Column("risk_score", sa.Numeric(5, 2)))


def downgrade():
    op.drop_column("user_profiles", "risk_score")
