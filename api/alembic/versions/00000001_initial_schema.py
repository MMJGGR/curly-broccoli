"""initial schema

Revision ID: 00000001
Revises:
Create Date: 2025-07-12 08:37:00.000000
"""

from alembic import op
import sqlalchemy as sa


def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "is_active", sa.Boolean(), nullable=False, server_default=sa.text("1")
        ),
        sa.Column("mfa_enabled", sa.Boolean(), server_default=sa.text("0")),
    )

    op.create_table(
        "user_profiles",
        sa.Column(
            "user_id", sa.String(length=36), sa.ForeignKey("users.id"), primary_key=True
        ),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("date_of_birth", sa.String(length=32), nullable=False),
        sa.Column("id_type", sa.Enum("ID", "Passport", name="id_type"), nullable=False),
        sa.Column("id_number", sa.String(length=64), nullable=False),
        sa.Column("kra_pin", sa.String(length=20), nullable=False),
        sa.Column(
            "marital_status",
            sa.Enum("Single", "Married", "Divorced", "Widowed", name="marital_status"),
        ),
        sa.Column(
            "employment_status",
            sa.Enum(
                "Employed",
                "Self-employed",
                "Unemployed",
                "Student",
                "Retired",
                name="employment_status",
            ),
            nullable=False,
        ),
        sa.Column("monthly_income_kes", sa.String(), nullable=False),
        sa.Column("net_worth_estimate", sa.String()),
        sa.Column("risk_tolerance_score", sa.Integer(), nullable=False),
        sa.Column("retirement_age_goal", sa.Integer()),
        sa.Column("investment_goals", sa.String()),
    )

    op.create_table(
        "dependents",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column(
            "user_id", sa.String(length=36), sa.ForeignKey("users.id"), nullable=False
        ),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "relation_type",
            sa.Enum("Spouse", "Child", "Parent", "Other", name="relationship"),
            nullable=False,
        ),
        sa.Column("date_of_birth", sa.String(), nullable=False),
    )


def downgrade():
    op.drop_table("dependents")
    op.drop_table("user_profiles")
    op.drop_table("users")
    op.execute("DROP TYPE IF EXISTS relationship")
    op.execute("DROP TYPE IF EXISTS employment_status")
    op.execute("DROP TYPE IF EXISTS marital_status")
    op.execute("DROP TYPE IF EXISTS id_type")
