"""Add users and profiles tables"""

revision = "00000003"
down_revision = "00000002"
branch_labels = None
depends_on = None

from alembic import op
import sqlalchemy as sa


def upgrade():
    # drop old tables if they exist
    for tbl in ("dependents", "user_profiles", "users"):
        try:
            op.drop_table(tbl)
        except Exception:
            pass

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
    )

    op.create_table(
        "profiles",
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey("users.id"), primary_key=True),
        sa.Column("dob", sa.Date(), nullable=False),
        sa.Column("kra_pin", sa.String(length=20), nullable=False),
        sa.Column("annual_income", sa.Numeric(12, 2), nullable=False),
        sa.Column("dependents", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("goals", sa.JSON(), nullable=False),
        sa.Column("risk_score", sa.Numeric(4, 2)),
    )


def downgrade():
    op.drop_table("profiles")
    op.drop_table("users")
