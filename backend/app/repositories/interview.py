import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.interview import Interview, InterviewStatus


class InterviewRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, candidate_name: str, role: str) -> Interview:
        interview = Interview(
            candidate_name=candidate_name,
            role=role,
            status=InterviewStatus.CREATED,
        )
        self.db.add(interview)
        self.db.flush()
        self.db.refresh(interview)
        return interview

    def get_by_id(self, interview_id: uuid.UUID) -> Interview | None:
        return self.db.get(Interview, interview_id)

    def list_all(self) -> list[Interview]:
        statement = select(Interview).order_by(Interview.created_at.desc())
        return list(self.db.scalars(statement).all())

    def save(self, interview: Interview) -> Interview:
        self.db.add(interview)
        self.db.flush()
        self.db.refresh(interview)
        return interview
