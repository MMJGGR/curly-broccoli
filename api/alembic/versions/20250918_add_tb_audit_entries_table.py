"""
Add tb_audit_entries table for server-side Trial Balance audit log
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20250918_add_tb_audit_entries_table'
down_revision = 'fix_profile_data_fields'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'tb_audit_entries',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False, index=True),
        sa.Column('timestamp', sa.DateTime(), nullable=False, index=True),
        sa.Column('suggestions_json', sa.Text(), nullable=False),
        sa.Column('meta_json', sa.Text(), nullable=True)
    )


def downgrade():
    op.drop_table('tb_audit_entries')
