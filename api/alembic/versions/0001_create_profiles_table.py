"""create profiles table

Revision ID: 0001
Revises: 
Create Date: 2025-07-14
"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        'profiles',
        sa.Column('user_id', sa.String(), primary_key=True),
        sa.Column('dob', sa.Date(), nullable=True),
        sa.Column('kra_pin', sa.String(), nullable=True),
        sa.Column('annual_income', sa.Numeric(), nullable=False, default=0),
        sa.Column('dependents', sa.Integer(), nullable=False, default=0),
        sa.Column('goals', sa.JSON(), nullable=True),
        sa.Column('questionnaire', sa.JSON(), nullable=True),
    )

def downgrade():
    op.drop_table('profiles')
