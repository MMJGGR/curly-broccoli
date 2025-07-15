"""add risk_score and risk_level to profiles"""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '934447535d51'
down_revision = '0001'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column(
        'profiles',
        sa.Column('risk_score', sa.Integer(), nullable=True),
    )
    op.add_column(
        'profiles',
        sa.Column('risk_level', sa.Integer(), nullable=True),
    )


def downgrade():
    op.drop_column('profiles', 'risk_level')
    op.drop_column('profiles', 'risk_score')
