"""Create interview audio table.

Revision ID: 0002_create_interview_audio
Revises: 0001_create_interviews
"""

from collections.abc import Sequence
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0002_create_interview_audio"
down_revision: str | Sequence[str] | None = "0001_create_interviews"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "interview_audio",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("interview_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("original_filename", sa.String(length=255), nullable=True),
        sa.Column("stored_filename", sa.String(length=255), nullable=False),
        sa.Column("content_type", sa.String(length=100), nullable=False),
        sa.Column("file_size", sa.BigInteger(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["interview_id"], ["interviews.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("interview_id"),
        sa.UniqueConstraint("stored_filename"),
    )
    op.create_index("ix_interview_audio_interview_id", "interview_audio", ["interview_id"])


def downgrade() -> None:
    op.drop_index("ix_interview_audio_interview_id", table_name="interview_audio")
    op.drop_table("interview_audio")
