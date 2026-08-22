import uuid
from datetime import UTC, datetime

from app.models.interview import Interview, InterviewStatus
from app.repositories.interview import InterviewRepository
from app.schemas.interview import InterviewCreate


class InterviewNotFoundError(Exception):
    def __init__(self, interview_id: uuid.UUID) -> None:
        self.interview_id = interview_id
        super().__init__(f"Interview {interview_id} was not found.")


class InvalidInterviewStateError(Exception):
    def __init__(self, current_status: InterviewStatus, action: str) -> None:
        self.current_status = current_status
        self.action = action
        super().__init__(
            f"Cannot {action} an interview with status {current_status.value}."
        )


class InterviewService:
    def __init__(self, repository: InterviewRepository) -> None:
        self.repository = repository

    def create_interview(self, payload: InterviewCreate) -> Interview:
        return self.repository.create(
            candidate_name=payload.candidate_name,
            role=payload.role,
        )

    def list_interviews(self) -> list[Interview]:
        return self.repository.list_all()

    def get_interview(self, interview_id: uuid.UUID) -> Interview:
        interview = self.repository.get_by_id(interview_id)
        if interview is None:
            raise InterviewNotFoundError(interview_id)
        return interview

    def start_interview(self, interview_id: uuid.UUID) -> Interview:
        interview = self.get_interview(interview_id)
        if interview.status != InterviewStatus.CREATED:
            raise InvalidInterviewStateError(interview.status, "start")

        interview.status = InterviewStatus.IN_PROGRESS
        interview.started_at = datetime.now(UTC)
        return self.repository.save(interview)

    def end_interview(self, interview_id: uuid.UUID) -> Interview:
        interview = self.get_interview(interview_id)
        if interview.status != InterviewStatus.IN_PROGRESS:
            raise InvalidInterviewStateError(interview.status, "end")

        interview.status = InterviewStatus.COMPLETED
        interview.ended_at = datetime.now(UTC)
        return self.repository.save(interview)
