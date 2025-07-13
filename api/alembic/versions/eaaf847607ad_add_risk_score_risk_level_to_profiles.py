"""Add risk_score & risk_level to profiles"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'eaf847607ad'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():cd ..
    op.add_column(
        'profiles',
        sa.Column('risk_score', sa.Integer(), nullable=True)
    )
    op.add_column(
        'profiles',
        sa.Column('risk_level', sa.Integer(), nullable=True)
    )

def downgrade():
    op.drop_column('profiles', 'risk_level')
    op.drop_column('profiles', 'risk_score')
