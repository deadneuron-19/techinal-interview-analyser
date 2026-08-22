"""Create interviews table.

Revision ID: 0001_create_interviews
Revises:
Create Date: 2026-08-22
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "0001_create_interviews"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

interview_status_enum = postgresql.ENUM(
    "CREATED",
    "IN_PROGRESS",
    "COMPLETED",
    name="interview_status",
)


def upgrade() -> None:
    interview_status_enum.create(op.get_bind(), checkfirst=True)

    op.create_table(
        "interviews",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("candidate_name", sa.String(length=255), nullable=False),
        sa.Column("role", sa.String(length=255), nullable=False),
        sa.Column(
            "status",
            postgresql.ENUM(
                "CREATED",
                "IN_PROGRESS",
                "COMPLETED",
                name="interview_status",
                create_type=False,
            ),
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("ended_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("interviews")
    interview_status_enum.drop(op.get_bind(), checkfirst=True)
