import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.models.interview import InterviewStatus


class InterviewCreate(BaseModel):
    candidate_name: str = Field(min_length=1, max_length=255)
    role: str = Field(min_length=1, max_length=255)


class InterviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    candidate_name: str
    role: str
    status: InterviewStatus
    created_at: datetime
    started_at: datetime | None
    ended_at: datetime | None
